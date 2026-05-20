import React, { useEffect, useState } from 'react';
import { API_BASE, getToken } from '../services/api';
import FamilyTree from '../components/FamilyTree';
import AllocationDonut from '../components/AllocationDonut';
import NetWorthChart from '../components/NetWorthChart';
import TrustFlow from '../components/TrustFlow';

async function fetchView(path) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/custom-views/${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`GET ${path} → ${res.status} ${t}`);
  }
  return res.json();
}

export default function CustomViewsPage() {
  const [tree, setTree] = useState(null);
  const [alloc, setAlloc] = useState(null);
  const [netWorth, setNetWorth] = useState(null);
  const [flow, setFlow] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchView('family-tree'),
      fetchView('allocation'),
      fetchView('net-worth'),
      fetchView('trust-flow'),
    ])
      .then(([t, a, n, f]) => {
        setTree(t);
        setAlloc(a);
        setNetWorth(n);
        setFlow(f);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="custom-views-page">
      <div className="dashboard-header">
        <h2>Wealth Analytics</h2>
        <p>Custom views derived from real data across families, trusts, holdings & valuations.</p>
      </div>

      {err && <div className="ai-error">{err}</div>}
      {loading && <div style={{ color: '#94a3b8' }}>Loading custom views…</div>}

      <div className="custom-views-grid">
        <section className="custom-view-card" data-testid="card-allocation">
          <h3>Asset Allocation</h3>
          <p className="custom-view-desc">
            Donut by asset class across holdings, illiquid assets, real estate, art, PE & hedge funds.
          </p>
          {alloc && <AllocationDonut data={alloc} />}
        </section>

        <section className="custom-view-card" data-testid="card-networth">
          <h3>Net Worth Over Time</h3>
          <p className="custom-view-desc">
            Stacked area chart by year, built from valuation reports + holdings.
          </p>
          {netWorth && <NetWorthChart data={netWorth} />}
        </section>

        <section className="custom-view-card custom-view-card-wide" data-testid="card-trustflow">
          <h3>Trust Distribution Flow</h3>
          <p className="custom-view-desc">
            Stacked bar of distributions: scheduled vs paid, by trust → beneficiary edge.
          </p>
          {flow && <TrustFlow data={flow} />}
        </section>

        <section className="custom-view-card custom-view-card-wide" data-testid="card-familytree">
          <h3>Family Tree</h3>
          <p className="custom-view-desc">
            Beneficiaries grouped into generations (G1 / G2 / G3) per family.
          </p>
          {tree && <FamilyTree data={tree} />}
        </section>
      </div>

      <style>{`
        .custom-views-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 16px;
        }
        .custom-view-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 20px;
        }
        .custom-view-card h3 {
          color: #e2e8f0;
          margin: 0 0 4px;
          font-size: 18px;
        }
        .custom-view-desc {
          color: #94a3b8;
          font-size: 12px;
          margin: 0 0 14px;
        }
        .custom-view-card-wide {
          grid-column: 1 / -1;
        }
        .family-tree-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
        }
        .family-tree-card {
          background: #0b1220;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 12px;
          min-width: 360px;
        }
        .family-tree-title {
          color: #e2e8f0;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .family-tree-sub {
          color: #94a3b8;
          font-weight: 400;
          font-size: 11px;
          margin-left: 6px;
        }
        .family-tree-svg {
          max-width: 100%;
          height: auto;
        }
        @media (max-width: 1100px) {
          .custom-views-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
