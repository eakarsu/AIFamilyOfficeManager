'use strict';

const STATES = Object.freeze(['draft', 'reconciled', 'awaiting_approval', 'first_approved', 'approved', 'external_recorded', 'closed', 'failed']);
const TRANSITIONS = Object.freeze({
  draft: ['reconciled', 'failed'],
  reconciled: ['awaiting_approval', 'draft', 'failed'],
  awaiting_approval: ['first_approved', 'draft', 'failed'],
  first_approved: ['approved', 'draft', 'failed'],
  approved: ['external_recorded', 'failed'],
  external_recorded: ['closed', 'failed'],
  failed: ['draft', 'closed'],
  closed: [],
});

function text(value, name, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error(`${name} is invalid`);
  return value.trim();
}
function minorUnits(value, name) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${name} must be a non-negative integer in minor currency units`);
  return value;
}
function validateDecision(input) {
  if (!input || typeof input !== 'object') throw new Error('decision is required');
  const currency = text(input.currency, 'currency', 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('currency is invalid');
  return {
    external_ref: text(input.external_ref, 'external_ref', 200),
    entity_ref: text(input.entity_ref, 'entity_ref', 200),
    decision_type: text(input.decision_type, 'decision_type', 100),
    description: text(input.description, 'description', 2000),
    amount_minor: minorUnits(input.amount_minor, 'amount_minor'),
    currency,
    provenance_refs: Array.isArray(input.provenance_refs) ? input.provenance_refs.slice(0, 100).map((v) => text(v, 'provenance_ref', 500)) : [],
  };
}
function validateReconciliation(input) {
  if (!input || typeof input !== 'object') throw new Error('reconciliation is required');
  const expected = minorUnits(input.expected_minor, 'expected_minor');
  const observed = minorUnits(input.observed_minor, 'observed_minor');
  const tolerance = minorUnits(input.tolerance_minor, 'tolerance_minor');
  if (Math.abs(expected - observed) > tolerance) throw new Error('reconciliation variance exceeds tolerance');
  if (input.ownership_confirmed !== true) throw new Error('ownership confirmation is required');
  const observedAt = new Date(input.observed_at);
  if (!Number.isFinite(observedAt.getTime())) throw new Error('observed_at is invalid');
  return {
    expected_minor: expected, observed_minor: observed, tolerance_minor: tolerance,
    ownership_confirmed: true,
    source: text(input.source, 'source', 200),
    source_record_ref: text(input.source_record_ref, 'source_record_ref', 500),
    observed_at: observedAt.toISOString(),
  };
}
function assertTransition(from, to, role) {
  if (!STATES.includes(from) || !STATES.includes(to) || !(TRANSITIONS[from] || []).includes(to)) throw new Error(`Transition ${from} -> ${to} is not allowed`);
  if (!['advisor', 'admin'].includes(role)) throw new Error('Role cannot change decision state');
  if (to === 'approved' && role !== 'admin') throw new Error('Only admin may give final approval');
}

module.exports = { STATES, TRANSITIONS, validateDecision, validateReconciliation, assertTransition };
