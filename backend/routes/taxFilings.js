const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'tax_filings',
  fields: ['filing_id','family_id','year','type','status','filed_at','notes'],
});
