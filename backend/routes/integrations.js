// Custodian / aggregator integrations (Apply pass 7).
//
// All endpoints intentionally return HTTP 503 with a structured payload
// describing the missing credentials. Live wiring (Plaid, Addepar, Canoe)
// requires keys that are not configured in this environment.
//
// Endpoints:
//   GET    /api/integrations                          provider catalog + status
//   GET    /api/integrations/:provider/status         per-provider readiness
//   POST   /api/integrations/plaid/link-token         Plaid link token (503)
//   POST   /api/integrations/plaid/exchange           Plaid public_token → access (503)
//   POST   /api/integrations/plaid/sync-holdings      pull holdings via Plaid (503)
//   POST   /api/integrations/addepar/sync-accounts    Addepar custody sync (503)
//   POST   /api/integrations/canoe/sync-alts          Canoe alt-asset sync (503)

const express = require('express');
const router = express.Router();

const PROVIDERS = {
  plaid:   { env: ['PLAID_CLIENT_ID', 'PLAID_SECRET'],     purpose: 'Bank + brokerage aggregation' },
  addepar: { env: ['ADDEPAR_API_KEY', 'ADDEPAR_FIRM_ID'],  purpose: 'Custodian / portfolio accounting' },
  canoe:   { env: ['CANOE_CLIENT_ID', 'CANOE_CLIENT_SECRET'], purpose: 'Alternative-asset document + valuation feed' },
};

function providerStatus(name) {
  const def = PROVIDERS[name];
  if (!def) return null;
  const missing = def.env.filter((k) => !process.env[k]);
  return {
    provider: name,
    purpose: def.purpose,
    configured: missing.length === 0,
    required_env: def.env,
    missing_env: missing,
  };
}

function stub(provider, action) {
  return (req, res) => {
    const status = providerStatus(provider);
    res.status(503).json({
      error: 'integration not configured',
      provider,
      action,
      required_env: status ? status.required_env : [],
      missing_env: status ? status.missing_env : [],
      docs: `Set the listed env vars on the backend host to enable ${provider} ${action}.`,
    });
  };
}

router.get('/', (req, res) => {
  res.json({
    providers: Object.keys(PROVIDERS).map((name) => providerStatus(name)),
  });
});

router.get('/:provider/status', (req, res) => {
  const s = providerStatus(req.params.provider);
  if (!s) return res.status(404).json({ error: 'unknown provider' });
  res.json(s);
});

// Plaid
router.post('/plaid/link-token',    stub('plaid',   'create-link-token'));
router.post('/plaid/exchange',      stub('plaid',   'exchange-public-token'));
router.post('/plaid/sync-holdings', stub('plaid',   'sync-holdings'));

// Addepar
router.post('/addepar/sync-accounts', stub('addepar', 'sync-accounts'));

// Canoe (alt-asset document feed)
router.post('/canoe/sync-alts',       stub('canoe',   'sync-alts'));

module.exports = router;
