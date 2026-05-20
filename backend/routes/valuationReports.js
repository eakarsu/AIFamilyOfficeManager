const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'valuation_reports',
  fields: ['val_id','asset_id','valuer','value_usd','valued_at','status','notes'],
});
