const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'art_collection',
  fields: ['art_id','family_id','artist','work','value_usd','provenance','status','notes'],
});
