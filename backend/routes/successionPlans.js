const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'succession_plans',
  fields: ['plan_id','family_id','version','signatories','effective_date','status','notes'],
});
