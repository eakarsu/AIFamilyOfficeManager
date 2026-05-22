const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  'http://localhost:3075/api';

export { API_BASE };

const TOKEN_KEY = 'fom_token';
const USER_KEY  = 'fom_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (_) {}
}
export function logout() {
  setToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

// Role helpers
export function getRole() {
  return (getStoredUser()?.role || 'viewer').toLowerCase();
}
export function canWrite() {
  return ['admin', 'advisor'].includes(getRole());
}
export function isAdmin() {
  return getRole() === 'admin';
}
// Backwards-compat alias for any code that still calls isCommander
export const isCommander = isAdmin;

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch (e) {
    throw new Error(`Network error: ${e.message}`);
  }

  if (res.status === 401) {
    if (!url.startsWith('/auth/login')) {
      logout();
      throw new Error('Session expired');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function crud(base) {
  return {
    list:   ()       => request(`/${base}`),
    get:    (id)     => request(`/${base}/${id}`),
    create: (data)   => request(`/${base}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, d)  => request(`/${base}/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id)     => request(`/${base}/${id}`, { method: 'DELETE' }),
    bulkImport: (csv) => request(`/${base}/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    }),
    listAttachments: (id) => request(`/${base}/${id}/attachments`),
    uploadAttachment: async (id, file) => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/${base}/${id}/attachments`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      return data;
    },
  };
}

// 18 CRUD APIs + Apply pass 7 additions
export const familiesApi           = crud('families');
export const trustsApi             = crud('trusts');
export const beneficiariesApi      = crud('beneficiaries');
export const illiquidAssetsApi     = crud('illiquid-assets');
export const holdingsApi           = crud('holdings');
export const advisorsApi           = crud('advisors');
export const governanceDocsApi     = crud('governance-docs');
export const distributionsApi      = crud('distributions');
export const taxFilingsApi         = crud('tax-filings');
export const charitableGiftsApi    = crud('charitable-gifts');
export const educationGrantsApi    = crud('education-grants');
export const realEstateApi         = crud('real-estate');
export const artCollectionApi      = crud('art-collection');
export const privateInvestmentsApi = crud('private-investments');
export const lpInterestsApi        = crud('lp-interests');
export const successionPlansApi    = crud('succession-plans');
export const valuationReportsApi   = crud('valuation-reports');
export const auditLogApi           = crud('audit-log');

// Apply pass 7 — family-mission tracker + next-gen education portal
export const familyMissionsApi      = crud('family-missions');
export const missionMilestonesApi   = crud('mission-milestones');
export const educationMilestonesApi = crud('education-milestones');
export const learningPlansApi       = crud('learning-plans');

export const getFamilyMissionKpis    = () => request('/family-missions/kpis');
export const getMissionsByFamily     = (familyId) => request(`/family-missions/by-family/${encodeURIComponent(familyId)}`);

// Next-gen education portal — read-only aggregated views
export const listNextGenBeneficiaries = () => request('/nextgen-portal');
export const getNextGenBundle         = (benId) => request(`/nextgen-portal/${encodeURIComponent(benId)}`);

// Custodian / aggregator integrations (503 until creds configured)
export const listIntegrations          = () => request('/integrations');
export const getIntegrationStatus      = (provider) => request(`/integrations/${encodeURIComponent(provider)}/status`);
export const plaidCreateLinkToken      = (body) => request('/integrations/plaid/link-token',      { method: 'POST', body: JSON.stringify(body || {}) });
export const plaidExchangePublicToken  = (body) => request('/integrations/plaid/exchange',        { method: 'POST', body: JSON.stringify(body || {}) });
export const plaidSyncHoldings         = (body) => request('/integrations/plaid/sync-holdings',   { method: 'POST', body: JSON.stringify(body || {}) });
export const addeparSyncAccounts       = (body) => request('/integrations/addepar/sync-accounts', { method: 'POST', body: JSON.stringify(body || {}) });
export const canoeSyncAlts             = (body) => request('/integrations/canoe/sync-alts',       { method: 'POST', body: JSON.stringify(body || {}) });

// Dashboard
export const getDashboardStats = () => request('/dashboard');

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');

// AI endpoints — 16 verbs
export const aiEstateTaxScenario          = (body) => request('/ai/estate-tax-scenario',          { method: 'POST', body: JSON.stringify(body || {}) });
export const aiTrustDistributionSuggest   = (body) => request('/ai/trust-distribution-suggest',   { method: 'POST', body: JSON.stringify(body || {}) });
export const aiIlliquidValuationBand      = (body) => request('/ai/illiquid-valuation-band',      { method: 'POST', body: JSON.stringify(body || {}) });
export const aiCharitableVehicleRecommend = (body) => request('/ai/charitable-vehicle-recommend', { method: 'POST', body: JSON.stringify(body || {}) });
export const aiExecutiveBrief             = (body) => request('/ai/executive-brief',              { method: 'POST', body: JSON.stringify(body || {}) });
export const aiGovernanceMemoDraft        = (body) => request('/ai/governance-memo-draft',        { method: 'POST', body: JSON.stringify(body || {}) });
export const aiSuccessionReadiness        = (body) => request('/ai/succession-readiness',         { method: 'POST', body: JSON.stringify(body || {}) });
export const aiTaxLossHarvest             = (body) => request('/ai/tax-loss-harvest',             { method: 'POST', body: JSON.stringify(body || {}) });
export const aiGenerationalImpact         = (body) => request('/ai/generational-impact',          { method: 'POST', body: JSON.stringify(body || {}) });
export const aiArtProvenanceCheck         = (body) => request('/ai/art-provenance-check',         { method: 'POST', body: JSON.stringify(body || {}) });
export const aiEducationDistributionRule  = (body) => request('/ai/education-distribution-rule',  { method: 'POST', body: JSON.stringify(body || {}) });
export const aiRegulatoryComplianceCheck  = (body) => request('/ai/regulatory-compliance-check',  { method: 'POST', body: JSON.stringify(body || {}) });
export const aiCharitableImpactReport     = (body) => request('/ai/charitable-impact-report',     { method: 'POST', body: JSON.stringify(body || {}) });
export const aiFamilyMeetingAgenda        = (body) => request('/ai/family-meeting-agenda',        { method: 'POST', body: JSON.stringify(body || {}) });
export const aiAssetAllocationRebalance   = (body) => request('/ai/asset-allocation-rebalance',   { method: 'POST', body: JSON.stringify(body || {}) });
export const aiBeneficiaryOnboarding      = (body) => request('/ai/beneficiary-onboarding',       { method: 'POST', body: JSON.stringify(body || {}) });
// Apply pass 7: dedicated philanthropic grant scorer
export const aiPhilanthropicGrantScore    = (body) => request('/ai/philanthropic-grant-score',    { method: 'POST', body: JSON.stringify(body || {}) });

// AI history
export const getAIHistory = (feature, limit = 25) => {
  const qs = new URLSearchParams({
    ...(feature ? { feature } : {}),
    limit: String(limit),
  }).toString();
  return request(`/ai/history?${qs}`);
};

// AI samples
export const getAISamples = (feature) => {
  const qs = new URLSearchParams({ feature: feature || '' }).toString();
  return request(`/ai/samples?${qs}`);
};

// Notifications
export const getNotifications       = () => request('/notifications');
export const getUnreadNotifications = () => request('/notifications/unread');
export const markNotificationRead   = (id) => request(`/notifications/${id}/read`, { method: 'POST' });
export const markAllNotificationsRead = () => request('/notifications/mark-all-read', { method: 'POST' });

// Webhooks
export const webhooksApi = {
  list:    ()         => request('/webhooks'),
  create:  (d)        => request('/webhooks',          { method: 'POST', body: JSON.stringify(d) }),
  update:  (id, d)    => request(`/webhooks/${id}`,    { method: 'PUT',  body: JSON.stringify(d) }),
  remove:  (id)       => request(`/webhooks/${id}`,    { method: 'DELETE' }),
  test:    (event, payload) => request('/webhooks/test', {
    method: 'POST',
    body: JSON.stringify({ event, payload }),
  }),
  deliveries: (id)    => request(`/webhooks/${id}/deliveries`),
};
