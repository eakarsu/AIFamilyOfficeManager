'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateDecision, validateReconciliation, assertTransition } = require('../domain/decisionWorkflow');

test('money uses integer minor units', () => {
  assert.equal(validateDecision({ external_ref: 'd-1', entity_ref: 'e-1', decision_type: 'distribution', description: 'Recorded proposal', amount_minor: 12345, currency: 'usd' }).currency, 'USD');
  assert.throws(() => validateDecision({ external_ref: 'd-1', entity_ref: 'e-1', decision_type: 'distribution', description: 'Recorded proposal', amount_minor: 12.34, currency: 'USD' }), /minor/);
});
test('reconciliation enforces variance and ownership', () => {
  assert.doesNotThrow(() => validateReconciliation({ expected_minor: 1000, observed_minor: 1001, tolerance_minor: 1, ownership_confirmed: true, source: 'custodian export', source_record_ref: 'row-1', observed_at: '2030-01-01T00:00:00Z' }));
  assert.throws(() => validateReconciliation({ expected_minor: 1000, observed_minor: 1002, tolerance_minor: 1, ownership_confirmed: true, source: 'custodian export', source_record_ref: 'row-1', observed_at: '2030-01-01T00:00:00Z' }), /variance/);
});
test('final approval is admin-only', () => {
  assert.throws(() => assertTransition('first_approved', 'approved', 'advisor'), /admin/);
  assert.doesNotThrow(() => assertTransition('first_approved', 'approved', 'admin'));
});
