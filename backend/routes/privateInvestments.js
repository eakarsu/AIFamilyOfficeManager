const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'private_investments',
  fields: ['pi_id','family_id','fund','commitment_usd','called_usd','status','notes'],
});
