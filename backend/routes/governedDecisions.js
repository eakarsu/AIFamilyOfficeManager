'use strict';
const crypto = require('crypto');
const express = require('express');
const pool = require('../config/database');
const { requireRole } = require('../middleware/auth');
const { validateDecision, validateReconciliation, assertTransition } = require('../domain/decisionWorkflow');

const router = express.Router();
const writers = requireRole('advisor', 'admin');
const actor = (req) => String(req.user.id);
const fail = (res, error) => res.status(/not found/i.test(error.message) ? 404 : /Only admin|distinct|Role/i.test(error.message) ? 403 : 400).json({ error: error.message });
async function audit(client, req, id, event, from, to, detail = {}) {
  await client.query(`INSERT INTO governed_family_decision_audit
    (decision_id,tenant_id,actor_id,actor_role,event_type,from_status,to_status,detail) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
  [id, req.user.tenant_id, actor(req), req.user.role, event, from, to, detail]);
}
async function transact(req, res, callback) {
  let client;
  try { client = await pool.connect(); await client.query('BEGIN'); const result = await callback(client); await client.query('COMMIT'); return result; }
  catch (error) { if (client) await client.query('ROLLBACK'); return fail(res, error); }
  finally { if (client) client.release(); }
}

router.get('/', async (req, res) => {
  try { const result = await pool.query('SELECT * FROM governed_family_decisions WHERE tenant_id=$1 ORDER BY updated_at DESC LIMIT 200', [req.user.tenant_id]); return res.json(result.rows); }
  catch (_) { return res.status(500).json({ error: 'Unable to list governed decisions' }); }
});
router.get('/:id', async (req, res) => {
  try {
    const [decision, evidence, history] = await Promise.all([
      pool.query('SELECT * FROM governed_family_decisions WHERE id=$1 AND tenant_id=$2', [req.params.id, req.user.tenant_id]),
      pool.query('SELECT * FROM governed_family_decision_evidence WHERE decision_id=$1 AND tenant_id=$2 ORDER BY created_at', [req.params.id, req.user.tenant_id]),
      pool.query('SELECT * FROM governed_family_decision_audit WHERE decision_id=$1 AND tenant_id=$2 ORDER BY created_at', [req.params.id, req.user.tenant_id]),
    ]);
    if (!decision.rows[0]) return res.status(404).json({ error: 'Decision not found' });
    return res.json({ decision: decision.rows[0], evidence: evidence.rows, audit: history.rows });
  } catch (_) { return res.status(500).json({ error: 'Unable to load governed decision' }); }
});
router.post('/', writers, async (req, res) => {
  try { const decision = validateDecision(req.body?.decision); const id = crypto.randomUUID();
    return transact(req, res, async (client) => {
      const result = await client.query(`INSERT INTO governed_family_decisions
        (id,tenant_id,external_ref,entity_ref,decision_type,description,amount_minor,currency,provenance_refs,proposed_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, [id, req.user.tenant_id, decision.external_ref, decision.entity_ref, decision.decision_type, decision.description, decision.amount_minor, decision.currency, decision.provenance_refs, actor(req)]);
      await audit(client, req, id, 'decision.created', null, 'draft', { entity_ref: decision.entity_ref, amount_minor: decision.amount_minor, currency: decision.currency });
      return res.status(201).json(result.rows[0]);
    });
  } catch (error) { return fail(res, error); }
});
router.post('/:id/evidence', writers, (req, res) => transact(req, res, async (client) => {
  const body = req.body || {}; const decision = await client.query('SELECT status FROM governed_family_decisions WHERE id=$1 AND tenant_id=$2 FOR UPDATE', [req.params.id, req.user.tenant_id]);
  if (!decision.rows[0]) throw new Error('Decision not found'); if (decision.rows[0].status === 'closed') throw new Error('Closed decision cannot accept evidence');
  if (!/^[a-f0-9]{64}$/i.test(body.sha256 || '')) throw new Error('sha256 is invalid');
  if (!['internal','confidential','restricted'].includes(body.classification)) throw new Error('classification is invalid');
  for (const key of ['source','source_record_ref','summary']) if (typeof body[key] !== 'string' || !body[key].trim()) throw new Error(`${key} is required`);
  const id = crypto.randomUUID(); const result = await client.query(`INSERT INTO governed_family_decision_evidence
    (id,decision_id,tenant_id,source,source_record_ref,sha256,classification,summary,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
  [id, req.params.id, req.user.tenant_id, body.source.slice(0, 200), body.source_record_ref.slice(0, 500), body.sha256.toLowerCase(), body.classification, body.summary.slice(0, 5000), actor(req)]);
  await audit(client, req, req.params.id, 'evidence.added', decision.rows[0].status, decision.rows[0].status, { evidence_id: id, sha256: body.sha256.toLowerCase() });
  return res.status(201).json(result.rows[0]);
}));
router.post('/:id/reconcile', writers, (req, res) => transact(req, res, async (client) => {
  const found = await client.query('SELECT * FROM governed_family_decisions WHERE id=$1 AND tenant_id=$2 FOR UPDATE', [req.params.id, req.user.tenant_id]);
  const decision = found.rows[0]; if (!decision) throw new Error('Decision not found'); assertTransition(decision.status, 'reconciled', req.user.role);
  const reconciliation = validateReconciliation(req.body?.reconciliation);
  if (reconciliation.expected_minor !== Number(decision.amount_minor)) throw new Error('reconciliation expected amount does not match decision');
  const updated = await client.query("UPDATE governed_family_decisions SET reconciliation=$1,status='reconciled',version=version+1,updated_at=NOW() WHERE id=$2 AND tenant_id=$3 RETURNING *", [reconciliation, req.params.id, req.user.tenant_id]);
  await audit(client, req, req.params.id, 'decision.reconciled', decision.status, 'reconciled', { source: reconciliation.source, source_record_ref: reconciliation.source_record_ref });
  return res.json(updated.rows[0]);
}));
router.post('/:id/transition', writers, (req, res) => transact(req, res, async (client) => {
  const found = await client.query('SELECT * FROM governed_family_decisions WHERE id=$1 AND tenant_id=$2 FOR UPDATE', [req.params.id, req.user.tenant_id]);
  const decision = found.rows[0]; if (!decision) throw new Error('Decision not found'); const to = String(req.body?.to || ''); assertTransition(decision.status, to, req.user.role);
  let first = decision.first_approved_by; let final = decision.final_approved_by; let external = decision.external_result; let failure = decision.failure_reason;
  if (to === 'awaiting_approval' && !decision.reconciliation) throw new Error('reconciliation is required');
  if (to === 'first_approved') { if (actor(req) === String(decision.proposed_by)) throw new Error('First approver must be distinct from proposer'); first = actor(req); }
  if (to === 'approved') { if (!first || actor(req) === String(decision.proposed_by) || actor(req) === String(first)) throw new Error('Final approver must be distinct from proposer and first approver'); final = actor(req); }
  if (to === 'external_recorded') { const result = req.body?.external_result; if (!result || typeof result.system !== 'string' || !result.system.trim() || typeof result.record_ref !== 'string' || !result.record_ref.trim()) throw new Error('external_result system and record_ref are required'); external = { system: result.system.slice(0, 200), record_ref: result.record_ref.slice(0, 500), observed_at: new Date(result.observed_at || Date.now()).toISOString(), outcome: String(result.outcome || '').slice(0, 1000) }; }
  if (to === 'failed') { if (typeof req.body?.reason !== 'string' || !req.body.reason.trim()) throw new Error('reason is required'); failure = req.body.reason.slice(0, 2000); }
  const updated = await client.query(`UPDATE governed_family_decisions SET status=$1,first_approved_by=$2,final_approved_by=$3,external_result=$4,failure_reason=$5,version=version+1,updated_at=NOW()
    WHERE id=$6 AND tenant_id=$7 RETURNING *`, [to, first, final, external, failure, req.params.id, req.user.tenant_id]);
  await audit(client, req, req.params.id, 'decision.transitioned', decision.status, to, { money_moved_by_application: false });
  return res.json(updated.rows[0]);
}));

module.exports = router;
