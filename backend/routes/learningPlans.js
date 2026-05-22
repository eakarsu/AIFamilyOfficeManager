// Learning plans — annual education / development plan per beneficiary (Apply pass 7).
const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'learning_plans',
  fields: ['plan_id','beneficiary_id','year','focus','mentor','budget_usd','status','notes'],
});
