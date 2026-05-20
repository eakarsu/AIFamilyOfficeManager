const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'education_grants',
  fields: ['grant_id','beneficiary_id','school','amount_usd','year','status','notes'],
});
