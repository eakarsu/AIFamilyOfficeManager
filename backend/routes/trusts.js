const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'trusts',
  fields: ['trust_id','family_id','type','trustee','assets_usd','status','notes'],
});
