// Education milestones — discrete academic / extra-curricular achievements
// per beneficiary (Apply pass 7).
const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'education_milestones',
  fields: ['emi_id','beneficiary_id','title','category','target_date','achieved_date','status','notes'],
});
