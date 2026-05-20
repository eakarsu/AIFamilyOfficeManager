const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'distributions',
  fields: ['dist_id','trust_id','beneficiary_id','amount_usd','period','status','notes'],
});
