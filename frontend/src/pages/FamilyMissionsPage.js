import React, { useEffect, useState } from 'react';
import CrudPage from '../components/CrudPage';
import { familyMissionsApi, getFamilyMissionKpis } from '../services/api';

function KpiStrip() {
  const [kpis, setKpis] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    getFamilyMissionKpis()
      .then((k) => { if (alive) setKpis(k); })
      .catch((e) => { if (alive) setErr(e.message); });
    return () => { alive = false; };
  }, []);

  if (err) return <div className="ai-error" style={{ marginBottom: 12 }}>KPIs unavailable: {err}</div>;
  if (!kpis) return null;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Total Missions</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{kpis.total?.total ?? 0}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Avg Progress</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{kpis.total?.avg_progress ?? 0}%</div>
        </div>
        {Array.isArray(kpis.by_status) && kpis.by_status.map((s) => (
          <div key={s.status}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.status}</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{s.count}</div>
          </div>
        ))}
      </div>
      {Array.isArray(kpis.by_pillar) && kpis.by_pillar.length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {kpis.by_pillar.map((p) => (
            <div key={p.pillar || 'unspecified'} style={{ padding: '6px 10px', background: '#0b1424', borderRadius: 6 }}>
              <span className={`badge ${String(p.pillar || '').toLowerCase()}`}>{p.pillar || '—'}</span>
              <span style={{ marginLeft: 8 }}>{p.count} · {p.avg_progress}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FamilyMissionsPage() {
  return (
    <>
      <KpiStrip />
      <CrudPage
        title="Family Missions"
        subtitle="Multi-generational mission statements with progress tracking. Each mission can hold milestones (see Mission Milestones)."
        api={familyMissionsApi}
        statusKey="status"
        fields={[
          { key: 'mission_id',   label: 'Mission ID' },
          { key: 'family_id',    label: 'Family ID' },
          { key: 'title',        label: 'Title' },
          { key: 'pillar',       label: 'Pillar', type: 'select', options: ['stewardship','philanthropy','enterprise','education','health','unity'] },
          { key: 'target_year',  label: 'Target Year', type: 'number' },
          { key: 'owner',        label: 'Owner' },
          { key: 'progress_pct', label: 'Progress %', type: 'number' },
          { key: 'status',       label: 'Status', type: 'select', options: ['active','on_hold','complete','retired'] },
          { key: 'statement',    label: 'Mission Statement', type: 'textarea' },
          { key: 'notes',        label: 'Notes', type: 'textarea' },
        ]}
      />
    </>
  );
}
