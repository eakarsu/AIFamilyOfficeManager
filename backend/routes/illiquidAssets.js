const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'illiquid_assets',
  fields: ['asset_id','family_id','type','valuation_usd','valued_at','custodian','status','notes'],
});
