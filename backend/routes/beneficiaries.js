const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'beneficiaries',
  fields: ['ben_id','family_id','name','dob','relationship','status','notes'],
});
