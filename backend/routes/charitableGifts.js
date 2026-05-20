const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'charitable_gifts',
  fields: ['gift_id','family_id','recipient','amount_usd','vehicle','ts','status','notes'],
});
