import React, { useEffect, useMemo, useState } from 'react';
import { listNextGenBeneficiaries, getNextGenBundle } from '../services/api';

function fmtUsd(n) {
  const v = Number(n || 0);
  if (!Number.isFinite(v)) return '$0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}k`;
  return `$${v}`;
}

function BundleView({ benId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    getNextGenBundle(benId)
      .then((b) => { if (alive) setData(b); })
      .catch((e) => { if (alive) setErr(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [benId]);

  if (loading) return <div className="empty-state">Loading portal...</div>;
  if (err)     return <div className="ai-error">Failed to load: {err}</div>;
  if (!data)   return <div className="empty-state">No data.</div>;

  const { beneficiary, family, grants, milestones, learning_plans, totals } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{beneficiary?.name || benId}</h2>
          <p>
            {beneficiary?.ben_id} · {beneficiary?.relationship || '—'} ·{' '}
            family <strong>{family?.name || beneficiary?.family_id || '—'}</strong>
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn secondary" onClick={onBack}>← All Beneficiaries</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Grants (count)</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{totals?.grants_count ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Grants total</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{fmtUsd(totals?.grants_total_usd)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Grants paid</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{fmtUsd(totals?.grants_paid_usd)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Milestones</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>
              {totals?.milestones_achieved ?? 0} / {totals?.milestones_count ?? 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Learning plans</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{totals?.plans_count ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Learning budget</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{fmtUsd(totals?.learning_budget_usd)}</div>
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: 16 }}>Education Grants</h3>
      {grants?.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Grant ID</th><th>School</th><th>Year</th><th>Amount</th><th>Status</th>
            </tr></thead>
            <tbody>
              {grants.map((g) => (
                <tr key={g.id}>
                  <td>{g.grant_id}</td>
                  <td>{g.school}</td>
                  <td>{g.year ?? '—'}</td>
                  <td>{fmtUsd(g.amount_usd)}</td>
                  <td><span className={`badge ${String(g.status || '').toLowerCase()}`}>{g.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty-state">No grants recorded.</div>}

      <h3 style={{ marginTop: 24 }}>Milestones</h3>
      {milestones?.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>ID</th><th>Title</th><th>Category</th><th>Target</th><th>Achieved</th><th>Status</th>
            </tr></thead>
            <tbody>
              {milestones.map((m) => (
                <tr key={m.id}>
                  <td>{m.emi_id}</td>
                  <td>{m.title}</td>
                  <td><span className={`badge ${String(m.category || '').toLowerCase()}`}>{m.category || '—'}</span></td>
                  <td>{m.target_date ? String(m.target_date).slice(0, 10) : '—'}</td>
                  <td>{m.achieved_date ? String(m.achieved_date).slice(0, 10) : '—'}</td>
                  <td><span className={`badge ${String(m.status || '').toLowerCase()}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty-state">No milestones tracked.</div>}

      <h3 style={{ marginTop: 24 }}>Learning Plans</h3>
      {learning_plans?.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Plan ID</th><th>Year</th><th>Focus</th><th>Mentor</th><th>Budget</th><th>Status</th>
            </tr></thead>
            <tbody>
              {learning_plans.map((p) => (
                <tr key={p.id}>
                  <td>{p.plan_id}</td>
                  <td>{p.year ?? '—'}</td>
                  <td>{p.focus}</td>
                  <td>{p.mentor ?? '—'}</td>
                  <td>{fmtUsd(p.budget_usd)}</td>
                  <td><span className={`badge ${String(p.status || '').toLowerCase()}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty-state">No learning plans on file.</div>}
    </div>
  );
}

export default function NextGenPortalPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listNextGenBeneficiaries()
      .then((d) => { if (alive) setRows(Array.isArray(d) ? d : []); })
      .catch((e) => { if (alive) setErr(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.ben_id, r.name, r.family_id, r.relationship, r.status]
        .some((v) => v != null && String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  if (selected) {
    return <BundleView benId={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Next-Gen Education Portal</h2>
          <p>Beneficiary-scoped read view of grants, milestones, and learning plans. Click a row to drill in.</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search beneficiaries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="toolbar-meta">{filtered.length} of {rows.length}</div>
      </div>

      {err && <div className="ai-error">Failed to load: {err}</div>}
      {loading && <div className="empty-state">Loading...</div>}

      {!loading && filtered.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Beneficiary</th>
              <th>Family</th>
              <th>Relationship</th>
              <th>Grants</th>
              <th>Grants $</th>
              <th>Milestones</th>
              <th>Plans</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.ben_id || r.name}>
                  <td><strong>{r.name}</strong><br /><span style={{ color: '#64748b', fontSize: 12 }}>{r.ben_id}</span></td>
                  <td>{r.family_id}</td>
                  <td>{r.relationship || '—'}</td>
                  <td>{r.grants_count ?? 0}</td>
                  <td>{fmtUsd(r.grants_total_usd)}</td>
                  <td>{r.milestones_achieved ?? 0} / {r.milestones_count ?? 0}</td>
                  <td>{r.plans_count ?? 0}</td>
                  <td><span className={`badge ${String(r.status || '').toLowerCase()}`}>{r.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn secondary" onClick={() => setSelected(r.ben_id)}>Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">No beneficiaries match.</div>
      )}
    </div>
  );
}
