// Next-gen education portal (Apply pass 7).
// Beneficiary-scoped READ view that bundles:
//   - beneficiary record
//   - their education grants (history + totals)
//   - their education milestones
//   - their learning plans
// All read-only — writes still flow through the underlying CRUD modules.
//
// Endpoints:
//   GET /api/nextgen-portal                      list all beneficiaries with quick summary
//   GET /api/nextgen-portal/:ben_id              one beneficiary, full bundle

const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Index — one row per beneficiary with totals.
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        b.ben_id,
        b.name,
        b.family_id,
        b.relationship,
        b.status,
        COALESCE(g.grants_count, 0)        AS grants_count,
        COALESCE(g.grants_total_usd, 0)    AS grants_total_usd,
        COALESCE(m.milestones_count, 0)    AS milestones_count,
        COALESCE(m.milestones_achieved, 0) AS milestones_achieved,
        COALESCE(p.plans_count, 0)         AS plans_count
      FROM beneficiaries b
      LEFT JOIN (
        SELECT beneficiary_id, COUNT(*) AS grants_count, COALESCE(SUM(amount_usd),0) AS grants_total_usd
        FROM education_grants GROUP BY beneficiary_id
      ) g ON g.beneficiary_id = b.ben_id
      LEFT JOIN (
        SELECT beneficiary_id, COUNT(*) AS milestones_count,
               COUNT(*) FILTER (WHERE status = 'achieved') AS milestones_achieved
        FROM education_milestones GROUP BY beneficiary_id
      ) m ON m.beneficiary_id = b.ben_id
      LEFT JOIN (
        SELECT beneficiary_id, COUNT(*) AS plans_count
        FROM learning_plans GROUP BY beneficiary_id
      ) p ON p.beneficiary_id = b.ben_id
      ORDER BY b.family_id ASC, b.name ASC
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bundle for a single beneficiary (by ben_id, not numeric id).
router.get('/:ben_id', async (req, res) => {
  try {
    const benR = await pool.query('SELECT * FROM beneficiaries WHERE ben_id = $1 LIMIT 1', [req.params.ben_id]);
    if (!benR.rows.length) return res.status(404).json({ error: 'beneficiary not found' });
    const ben = benR.rows[0];

    const [grants, milestones, plans, family] = await Promise.all([
      pool.query('SELECT * FROM education_grants    WHERE beneficiary_id = $1 ORDER BY year DESC NULLS LAST, id DESC', [ben.ben_id]),
      pool.query('SELECT * FROM education_milestones WHERE beneficiary_id = $1 ORDER BY target_date ASC NULLS LAST, id ASC', [ben.ben_id]),
      pool.query('SELECT * FROM learning_plans       WHERE beneficiary_id = $1 ORDER BY year DESC NULLS LAST, id DESC', [ben.ben_id]),
      pool.query('SELECT * FROM families             WHERE family_id = $1 LIMIT 1', [ben.family_id]),
    ]);

    const grantsRows = grants.rows;
    const totals = {
      grants_count: grantsRows.length,
      grants_total_usd: grantsRows.reduce((acc, g) => acc + Number(g.amount_usd || 0), 0),
      grants_paid_usd: grantsRows
        .filter((g) => String(g.status).toLowerCase() === 'paid')
        .reduce((acc, g) => acc + Number(g.amount_usd || 0), 0),
      milestones_count: milestones.rows.length,
      milestones_achieved: milestones.rows.filter((m) => String(m.status).toLowerCase() === 'achieved').length,
      plans_count: plans.rows.length,
      learning_budget_usd: plans.rows.reduce((acc, p) => acc + Number(p.budget_usd || 0), 0),
    };

    res.json({
      beneficiary: ben,
      family: family.rows[0] || null,
      grants: grantsRows,
      milestones: milestones.rows,
      learning_plans: plans.rows,
      totals,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
