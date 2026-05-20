const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'lp_interests',
  fields: ['lp_id','family_id','fund','vintage','commitment_usd','nav_usd','status','notes'],
});
