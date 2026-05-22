import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout, getStoredUser } from '../services/api';

const OVERVIEW = [
  { to: '/',                    label: 'Overview' },
];

const FAMILIES_LINKS = [
  { to: '/families',            label: 'Families' },
  { to: '/beneficiaries',       label: 'Beneficiaries' },
  { to: '/advisors',            label: 'Advisors' },
];

const TRUSTS_LINKS = [
  { to: '/trusts',              label: 'Trusts' },
  { to: '/distributions',       label: 'Distributions' },
  { to: '/succession-plans',    label: 'Succession Plans' },
];

const ASSETS_LINKS = [
  { to: '/holdings',            label: 'Holdings' },
  { to: '/illiquid-assets',     label: 'Illiquid Assets' },
  { to: '/liquidity-ladder',    label: 'Liquidity Ladder' },
  { to: '/real-estate',         label: 'Real Estate' },
  { to: '/art-collection',      label: 'Art Collection' },
  { to: '/private-investments', label: 'Private Investments' },
  { to: '/lp-interests',        label: 'LP Interests' },
  { to: '/valuation-reports',   label: 'Valuation Reports' },
];

const TAX_LINKS = [
  { to: '/tax-filings',         label: 'Tax Filings' },
];

const PHILANTHROPY_LINKS = [
  { to: '/charitable-gifts',    label: 'Charitable Gifts' },
  { to: '/education-grants',    label: 'Education Grants' },
];

const NEXTGEN_LINKS = [
  { to: '/nextgen-portal',      label: 'Next-Gen Portal' },
  { to: '/education-milestones',label: 'Education Milestones' },
  { to: '/learning-plans',      label: 'Learning Plans' },
];

const MISSION_LINKS = [
  { to: '/family-missions',     label: 'Family Missions' },
  { to: '/mission-milestones',  label: 'Mission Milestones' },
];

const GOVERNANCE_LINKS = [
  { to: '/governance-docs',     label: 'Governance Docs' },
  { to: '/audit-log',           label: 'Audit Log' },
];

const AI_PLANNING_LINKS = [
  { to: '/ai/estate-tax-scenario',         label: 'AI · Estate Tax Scenario' },
  { to: '/ai/trust-distribution-suggest',  label: 'AI · Trust Distribution' },
  { to: '/ai/charitable-vehicle-recommend',label: 'AI · Charitable Vehicle' },
  { to: '/ai/succession-readiness',        label: 'AI · Succession Readiness' },
  { to: '/ai/generational-impact',         label: 'AI · Generational Impact' },
  { to: '/ai/education-distribution-rule', label: 'AI · Education Rule' },
  { to: '/ai/asset-allocation-rebalance',  label: 'AI · Allocation Rebalance' },
  { to: '/ai/beneficiary-onboarding',      label: 'AI · Beneficiary Onboarding' },
  { to: '/ai/tax-loss-harvest',            label: 'AI · Tax-Loss Harvest' },
];

const AI_REPORTING_LINKS = [
  { to: '/ai/executive-brief',             label: 'AI · Executive Brief' },
  { to: '/ai/governance-memo-draft',       label: 'AI · Governance Memo' },
  { to: '/ai/illiquid-valuation-band',     label: 'AI · Illiquid Valuation' },
  { to: '/ai/art-provenance-check',        label: 'AI · Art Provenance' },
  { to: '/ai/regulatory-compliance-check', label: 'AI · Compliance Check' },
  { to: '/ai/charitable-impact-report',    label: 'AI · Charitable Impact' },
  { to: '/ai/philanthropic-grant-score',   label: 'AI · Grant Scorer' },
  { to: '/ai/family-meeting-agenda',       label: 'AI · Meeting Agenda' },
];

export default function Sidebar() {
  const user = getStoredUser();
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1>FAMILY OFFICE</h1>
        <p>Multi-Generation Wealth Hub</p>
      </div>

      <NavLink to="/" end>Overview</NavLink>

      <div className="sidebar-group-label">Families &amp; Beneficiaries</div>
      {FAMILIES_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Trusts</div>
      {TRUSTS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Assets</div>
      {ASSETS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Tax &amp; Compliance</div>
      {TAX_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Philanthropy</div>
      {PHILANTHROPY_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Next Generation</div>
      {NEXTGEN_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Mission Tracker</div>
      {MISSION_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Governance</div>
      {GOVERNANCE_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">AI Planning</div>
      {AI_PLANNING_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">AI Reporting</div>
      {AI_REPORTING_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
      ))}

      <div className="sidebar-group-label">Analytics</div>
      <NavLink to="/custom-views">Wealth Analytics</NavLink>

      <div className="sidebar-group-label">Admin</div>
      <NavLink to="/webhooks">Webhooks</NavLink>
      <NavLink to="/integrations">Integrations</NavLink>

      <div className="sidebar-user">
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name || user.email}</div>
            <div className="sidebar-user-role">{user.role || 'user'}</div>
          </div>
        )}
        <button className="btn secondary sidebar-logout" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}
