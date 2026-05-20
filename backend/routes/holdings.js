const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'holdings',
  fields: ['holding_id','family_id','security','qty','value_usd','account','status','notes'],
});
