const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'governance_docs',
  fields: ['doc_id','family_id','type','version','effective_date','status','notes'],
});
