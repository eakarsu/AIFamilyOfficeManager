const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'real_estate',
  fields: ['re_id','family_id','address','type','value_usd','status','notes'],
});
