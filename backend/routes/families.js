const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'families',
  fields: ['family_id','name','generation_count','primary_residence','net_worth_band','advisor_id','status','notes'],
});
