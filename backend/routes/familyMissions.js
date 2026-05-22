// Family-mission tracker (Apply pass 7).
// CRUD on family_missions + KPI/progress aggregation by family_id.
//
// Endpoints:
//   GET    /api/family-missions
//   GET    /api/family-missions/:id
//   POST   /api/family-missions
//   PUT    /api/family-missions/:id
//   DELETE /api/family-missions/:id
//   POST   /api/family-missions/bulk-import       (from factory)
//   GET    /api/family-missions/:id/attachments   (from factory)
//   POST   /api/family-missions/:id/attachments   (from factory)
//   GET    /api/family-missions/kpis              (custom — overall progress KPIs)
//   GET    /api/family-missions/by-family/:family_id (custom — missions for one family + milestones)

const express = require('express');
const pool = require('../config/database');
const buildCrud = require('./_crudFactory');

const FIELDS = [
  'mission_id', 'family_id', 'title', 'statement', 'pillar',
  'target_year', 'owner', 'progress_pct', 'status', 'notes',
];

const router = express.Router();

// KPI rollup — must be declared BEFORE the CRUD ':id' route so it wins the match.
router.get('/kpis', async (req, res) => {
  try {
    const [total, byPillar, byStatus, byFamily] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COALESCE(AVG(progress_pct),0)::int AS avg_progress FROM family_missions"),
      pool.query("SELECT pillar, COUNT(*) AS count, COALESCE(AVG(progress_pct),0)::int AS avg_progress FROM family_missions GROUP BY pillar ORDER BY pillar"),
      pool.query("SELECT status, COUNT(*) AS count FROM family_missions GROUP BY status ORDER BY status"),
      pool.query("SELECT family_id, COUNT(*) AS missions, COALESCE(AVG(progress_pct),0)::int AS avg_progress FROM family_missions GROUP BY family_id ORDER BY family_id"),
    ]);
    res.json({
      total: total.rows[0],
      by_pillar: byPillar.rows,
      by_status: byStatus.rows,
      by_family: byFamily.rows,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Missions for one family with their milestones embedded.
router.get('/by-family/:family_id', async (req, res) => {
  try {
    const missions = await pool.query(
      'SELECT * FROM family_missions WHERE family_id = $1 ORDER BY target_year ASC NULLS LAST, id DESC',
      [req.params.family_id]
    );
    if (missions.rows.length === 0) return res.json({ family_id: req.params.family_id, missions: [] });
    const ids = missions.rows.map((m) => m.mission_id).filter(Boolean);
    let milestones = [];
    if (ids.length > 0) {
      const ms = await pool.query(
        `SELECT * FROM mission_milestones WHERE mission_id = ANY($1::text[]) ORDER BY due_date ASC NULLS LAST, id ASC`,
        [ids]
      );
      milestones = ms.rows;
    }
    const byMission = {};
    for (const m of milestones) {
      if (!byMission[m.mission_id]) byMission[m.mission_id] = [];
      byMission[m.mission_id].push(m);
    }
    res.json({
      family_id: req.params.family_id,
      missions: missions.rows.map((m) => ({
        ...m,
        milestones: byMission[m.mission_id] || [],
      })),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Standard CRUD endpoints fall through to the factory.
router.use(buildCrud({ table: 'family_missions', fields: FIELDS }));

module.exports = router;
