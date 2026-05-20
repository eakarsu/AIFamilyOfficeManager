import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';

const FEATURES = [
  { path: '/families',            title: 'Families',              icon: 'F', color: '#3b82f6', desc: 'Multi-generation family roster and net-worth bands.' },
  { path: '/beneficiaries',       title: 'Beneficiaries',         icon: 'B', color: '#06b6d4', desc: 'Named beneficiaries across G1/G2/G3/G4.' },
  { path: '/advisors',            title: 'Advisors',              icon: 'A', color: '#10b981', desc: 'Lead advisors and specialised counsel per family.' },
  { path: '/trusts',              title: 'Trusts',                icon: 'T', color: '#f59e0b', desc: 'Dynasty, GST exempt, CLT and discretionary structures.' },
  { path: '/distributions',       title: 'Distributions',         icon: 'D', color: '#a78bfa', desc: 'Scheduled and paid trust distributions.' },
  { path: '/succession-plans',    title: 'Succession Plans',      icon: 'S', color: '#ec4899', desc: 'Versioned succession documents and signatories.' },
  { path: '/holdings',            title: 'Holdings',              icon: 'H', color: '#22c55e', desc: 'Public equity and fixed income positions.' },
  { path: '/illiquid-assets',     title: 'Illiquid Assets',       icon: 'I', color: '#ef4444', desc: 'Private companies, yachts, plantations and more.' },
  { path: '/real-estate',         title: 'Real Estate',           icon: 'R', color: '#0ea5e9', desc: 'Primary residences and trophy properties.' },
  { path: '/art-collection',      title: 'Art Collection',        icon: 'X', color: '#14b8a6', desc: 'Fine art holdings with provenance.' },
  { path: '/private-investments', title: 'Private Investments',   icon: 'P', color: '#fb7185', desc: 'PE fund commitments and capital called.' },
  { path: '/lp-interests',        title: 'LP Interests',          icon: 'L', color: '#facc15', desc: 'Hedge-fund LP positions and NAV.' },
  { path: '/valuation-reports',   title: 'Valuation Reports',     icon: 'V', color: '#a3e635', desc: 'Third-party valuations of illiquid assets.' },
  { path: '/tax-filings',         title: 'Tax Filings',           icon: '%', color: '#60a5fa', desc: 'Returns by family, jurisdiction and year.' },
  { path: '/charitable-gifts',    title: 'Charitable Gifts',      icon: 'G', color: '#7dd3fc', desc: 'DAF, CLT, foundation and direct giving.' },
  { path: '/education-grants',    title: 'Education Grants',      icon: 'E', color: '#f472b6', desc: 'K-12, undergrad, grad and executive grants.' },
  { path: '/governance-docs',     title: 'Governance Docs',       icon: 'C', color: '#dc2626', desc: 'Charters, IPS, bylaws and constitutions.' },
  { path: '/audit-log',           title: 'Audit Log',             icon: 'U', color: '#34d399', desc: 'Full trail of actor, action and result.' },

  { path: '/ai/estate-tax-scenario',         title: 'AI · Estate Tax Scenario',     icon: '*', color: '#8b5cf6', desc: 'Model federal/state/foreign estate-tax exposure.' },
  { path: '/ai/trust-distribution-suggest',  title: 'AI · Trust Distribution',      icon: '*', color: '#8b5cf6', desc: 'Suggest distribution schedule across beneficiaries.' },
  { path: '/ai/illiquid-valuation-band',     title: 'AI · Illiquid Valuation',      icon: '*', color: '#8b5cf6', desc: 'Defensible low/mid/high band for an asset.' },
  { path: '/ai/charitable-vehicle-recommend',title: 'AI · Charitable Vehicle',      icon: '*', color: '#8b5cf6', desc: 'Recommend DAF / foundation / CLT / CRUT.' },
  { path: '/ai/executive-brief',             title: 'AI · Executive Brief',         icon: '*', color: '#8b5cf6', desc: 'Principal-level operating brief.' },
  { path: '/ai/governance-memo-draft',       title: 'AI · Governance Memo',         icon: '*', color: '#8b5cf6', desc: 'Draft a structured council memo.' },
  { path: '/ai/succession-readiness',        title: 'AI · Succession Readiness',    icon: '*', color: '#8b5cf6', desc: 'Score readiness across 5 dimensions.' },
  { path: '/ai/tax-loss-harvest',            title: 'AI · Tax-Loss Harvest',        icon: '*', color: '#8b5cf6', desc: 'Identify TLH opportunities in holdings.' },
  { path: '/ai/generational-impact',         title: 'AI · Generational Impact',     icon: '*', color: '#8b5cf6', desc: 'Model G1-G4 impact of a major decision.' },
  { path: '/ai/art-provenance-check',        title: 'AI · Art Provenance',          icon: '*', color: '#8b5cf6', desc: 'Audit chain-of-ownership for red flags.' },
  { path: '/ai/education-distribution-rule', title: 'AI · Education Rule',          icon: '*', color: '#8b5cf6', desc: 'Draft a scalable education-distribution rule.' },
  { path: '/ai/regulatory-compliance-check', title: 'AI · Compliance Check',        icon: '*', color: '#8b5cf6', desc: 'Multi-jurisdiction compliance scan.' },
  { path: '/ai/charitable-impact-report',    title: 'AI · Charitable Impact',       icon: '*', color: '#8b5cf6', desc: 'Period impact report on family giving.' },
  { path: '/ai/family-meeting-agenda',       title: 'AI · Meeting Agenda',          icon: '*', color: '#8b5cf6', desc: 'Build an annual family meeting agenda.' },
  { path: '/ai/asset-allocation-rebalance',  title: 'AI · Allocation Rebalance',    icon: '*', color: '#8b5cf6', desc: 'Rebalance from current to target allocation.' },
  { path: '/ai/beneficiary-onboarding',      title: 'AI · Beneficiary Onboarding',  icon: '*', color: '#8b5cf6', desc: 'Phased onboarding plan for a new beneficiary.' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  const fmtUsd = (v) => {
    const n = Number(v || 0);
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
    return `$${n}`;
  };

  return (
    <div>
      <div className="dashboard-header">
        <h2>Family Office Overview</h2>
        <p>Multi-generation wealth picture · {new Date().toUTCString()}</p>
      </div>

      {err && <div className="ai-error">Stats unavailable: {err}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat"><div className="stat-label">Families</div><div className="stat-value">{stats.families?.total ?? '—'}</div><div className="stat-sub">{stats.families?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Beneficiaries</div><div className="stat-value">{stats.beneficiaries?.total ?? '—'}</div><div className="stat-sub">{stats.beneficiaries?.minor ?? 0} minor</div></div>
          <div className="stat"><div className="stat-label">Advisors</div><div className="stat-value">{stats.advisors?.total ?? '—'}</div><div className="stat-sub">{stats.advisors?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Trusts</div><div className="stat-value">{stats.trusts?.total ?? '—'}</div><div className="stat-sub">{fmtUsd(stats.trusts?.total_assets)} AUM</div></div>
          <div className="stat"><div className="stat-label">Distributions</div><div className="stat-value">{stats.distributions?.total ?? '—'}</div><div className="stat-sub">{stats.distributions?.scheduled ?? 0} scheduled · {stats.distributions?.paid ?? 0} paid</div></div>
          <div className="stat"><div className="stat-label">Succession</div><div className="stat-value">{stats.succession_plans?.total ?? '—'}</div><div className="stat-sub">{stats.succession_plans?.active ?? 0} active</div></div>
          <div className="stat"><div className="stat-label">Holdings</div><div className="stat-value">{stats.holdings?.total ?? '—'}</div><div className="stat-sub">{fmtUsd(stats.holdings?.total_value)} value</div></div>
          <div className="stat"><div className="stat-label">Illiquid</div><div className="stat-value">{stats.illiquid_assets?.total ?? '—'}</div><div className="stat-sub">{fmtUsd(stats.illiquid_assets?.total_value)} value</div></div>
          <div className="stat"><div className="stat-label">Real Estate</div><div className="stat-value">{stats.real_estate?.total ?? '—'}</div><div className="stat-sub">{fmtUsd(stats.real_estate?.total_value)} value</div></div>
          <div className="stat"><div className="stat-label">Art</div><div className="stat-value">{stats.art_collection?.total ?? '—'}</div><div className="stat-sub">{fmtUsd(stats.art_collection?.total_value)} · {stats.art_collection?.review ?? 0} review</div></div>
          <div className="stat"><div className="stat-label">Private Inv.</div><div className="stat-value">{stats.private_investments?.total ?? '—'}</div><div className="stat-sub">{fmtUsd(stats.private_investments?.called)} called</div></div>
          <div className="stat"><div className="stat-label">LP Interests</div><div className="stat-value">{stats.lp_interests?.total ?? '—'}</div><div className="stat-sub">{fmtUsd(stats.lp_interests?.nav)} NAV</div></div>
          <div className="stat"><div className="stat-label">Valuations</div><div className="stat-value">{stats.valuation_reports?.total ?? '—'}</div><div className="stat-sub">{stats.valuation_reports?.draft ?? 0} draft</div></div>
          <div className="stat"><div className="stat-label">Tax Filings</div><div className="stat-value">{stats.tax_filings?.total ?? '—'}</div><div className="stat-sub">{stats.tax_filings?.draft ?? 0} draft · {stats.tax_filings?.review ?? 0} review</div></div>
          <div className="stat"><div className="stat-label">Gifts</div><div className="stat-value">{stats.charitable_gifts?.total ?? '—'}</div><div className="stat-sub">{fmtUsd(stats.charitable_gifts?.total_amount)} given</div></div>
          <div className="stat"><div className="stat-label">Edu Grants</div><div className="stat-value">{stats.education_grants?.total ?? '—'}</div><div className="stat-sub">{fmtUsd(stats.education_grants?.total_amount)} awarded</div></div>
          <div className="stat"><div className="stat-label">Governance</div><div className="stat-value">{stats.governance_docs?.total ?? '—'}</div><div className="stat-sub">{stats.governance_docs?.review ?? 0} in review</div></div>
          <div className="stat"><div className="stat-label">Audit Log</div><div className="stat-value">{stats.audit_log?.total ?? '—'}</div><div className="stat-sub">total entries</div></div>
        </div>
      )}

      <h3 style={{ color: '#cbd5e1', margin: '8px 0 14px', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Capabilities</h3>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div
            key={f.path}
            className="feature-card"
            style={{ ['--card-color']: f.color }}
            onClick={() => navigate(f.path)}
          >
            <div className="feature-card-icon" style={{ background: f.color + '22', color: f.color }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
