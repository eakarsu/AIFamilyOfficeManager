import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

// 18 CRUD pages
import FamiliesPage from './pages/FamiliesPage';
import TrustsPage from './pages/TrustsPage';
import BeneficiariesPage from './pages/BeneficiariesPage';
import IlliquidAssetsPage from './pages/IlliquidAssetsPage';
import HoldingsPage from './pages/HoldingsPage';
import AdvisorsPage from './pages/AdvisorsPage';
import GovernanceDocsPage from './pages/GovernanceDocsPage';
import DistributionsPage from './pages/DistributionsPage';
import TaxFilingsPage from './pages/TaxFilingsPage';
import CharitableGiftsPage from './pages/CharitableGiftsPage';
import EducationGrantsPage from './pages/EducationGrantsPage';
import RealEstatePage from './pages/RealEstatePage';
import ArtCollectionPage from './pages/ArtCollectionPage';
import PrivateInvestmentsPage from './pages/PrivateInvestmentsPage';
import LpInterestsPage from './pages/LpInterestsPage';
import SuccessionPlansPage from './pages/SuccessionPlansPage';
import ValuationReportsPage from './pages/ValuationReportsPage';
import AuditLogPage from './pages/AuditLogPage';

// 16 AI pages
import AIEstateTaxScenarioPage from './pages/AIEstateTaxScenarioPage';
import AITrustDistributionPage from './pages/AITrustDistributionPage';
import AIIlliquidValuationPage from './pages/AIIlliquidValuationPage';
import AICharitableVehiclePage from './pages/AICharitableVehiclePage';
import AIExecutiveBriefPage from './pages/AIExecutiveBriefPage';
import AIGovernanceMemoPage from './pages/AIGovernanceMemoPage';
import AISuccessionReadinessPage from './pages/AISuccessionReadinessPage';
import AITaxLossHarvestPage from './pages/AITaxLossHarvestPage';
import AIGenerationalImpactPage from './pages/AIGenerationalImpactPage';
import AIArtProvenancePage from './pages/AIArtProvenancePage';
import AIEducationDistributionRulePage from './pages/AIEducationDistributionRulePage';
import AIRegulatoryCompliancePage from './pages/AIRegulatoryCompliancePage';
import AICharitableImpactPage from './pages/AICharitableImpactPage';
import AIFamilyMeetingAgendaPage from './pages/AIFamilyMeetingAgendaPage';
import AIAssetAllocationRebalancePage from './pages/AIAssetAllocationRebalancePage';
import AIBeneficiaryOnboardingPage from './pages/AIBeneficiaryOnboardingPage';

// Admin
import WebhooksPage from './pages/WebhooksPage';

// Custom views (Wealth Analytics)
import CustomViewsPage from './pages/CustomViewsPage';

import LoginPage from './pages/LoginPage';
import { getToken } from './services/api';

import './App.css';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function ShellRoutes() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main" style={{ padding: 0 }}>
        <Topbar />
        <div style={{ padding: '24px 32px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/families"             element={<FamiliesPage />} />
            <Route path="/trusts"               element={<TrustsPage />} />
            <Route path="/beneficiaries"        element={<BeneficiariesPage />} />
            <Route path="/illiquid-assets"      element={<IlliquidAssetsPage />} />
            <Route path="/holdings"             element={<HoldingsPage />} />
            <Route path="/advisors"             element={<AdvisorsPage />} />
            <Route path="/governance-docs"      element={<GovernanceDocsPage />} />
            <Route path="/distributions"        element={<DistributionsPage />} />
            <Route path="/tax-filings"          element={<TaxFilingsPage />} />
            <Route path="/charitable-gifts"     element={<CharitableGiftsPage />} />
            <Route path="/education-grants"     element={<EducationGrantsPage />} />
            <Route path="/real-estate"          element={<RealEstatePage />} />
            <Route path="/art-collection"       element={<ArtCollectionPage />} />
            <Route path="/private-investments"  element={<PrivateInvestmentsPage />} />
            <Route path="/lp-interests"         element={<LpInterestsPage />} />
            <Route path="/succession-plans"     element={<SuccessionPlansPage />} />
            <Route path="/valuation-reports"    element={<ValuationReportsPage />} />
            <Route path="/audit-log"            element={<AuditLogPage />} />

            <Route path="/ai/estate-tax-scenario"          element={<AIEstateTaxScenarioPage />} />
            <Route path="/ai/trust-distribution-suggest"   element={<AITrustDistributionPage />} />
            <Route path="/ai/illiquid-valuation-band"      element={<AIIlliquidValuationPage />} />
            <Route path="/ai/charitable-vehicle-recommend" element={<AICharitableVehiclePage />} />
            <Route path="/ai/executive-brief"              element={<AIExecutiveBriefPage />} />
            <Route path="/ai/governance-memo-draft"        element={<AIGovernanceMemoPage />} />
            <Route path="/ai/succession-readiness"         element={<AISuccessionReadinessPage />} />
            <Route path="/ai/tax-loss-harvest"             element={<AITaxLossHarvestPage />} />
            <Route path="/ai/generational-impact"          element={<AIGenerationalImpactPage />} />
            <Route path="/ai/art-provenance-check"         element={<AIArtProvenancePage />} />
            <Route path="/ai/education-distribution-rule"  element={<AIEducationDistributionRulePage />} />
            <Route path="/ai/regulatory-compliance-check"  element={<AIRegulatoryCompliancePage />} />
            <Route path="/ai/charitable-impact-report"     element={<AICharitableImpactPage />} />
            <Route path="/ai/family-meeting-agenda"        element={<AIFamilyMeetingAgendaPage />} />
            <Route path="/ai/asset-allocation-rebalance"   element={<AIAssetAllocationRebalancePage />} />
            <Route path="/ai/beneficiary-onboarding"       element={<AIBeneficiaryOnboardingPage />} />

            <Route path="/webhooks" element={<WebhooksPage />} />

            <Route path="/custom-views" element={<CustomViewsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ShellRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
