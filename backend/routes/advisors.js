const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'advisors',
  fields: ['advisor_id','name','firm','specialty','family_id','status','notes'],
});
