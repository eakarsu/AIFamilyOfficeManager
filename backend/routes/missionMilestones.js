// Mission milestones — child rows for family_missions (Apply pass 7).
const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'mission_milestones',
  fields: ['milestone_id','mission_id','title','due_date','owner','progress_pct','status','notes'],
});
