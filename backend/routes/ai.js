const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const ai = require('../services/ai');

async function record(feature, input, output) {
  try {
    await pool.query(
      'INSERT INTO ai_results (feature, input, output) VALUES ($1, $2, $3)',
      [feature, input || {}, output || {}]
    );
  } catch (e) {
    console.warn(`[ai] failed to record ${feature}:`, e.message);
  }
}

// ──────────────────────────────────────────────────────────────
// Sample fills — 5 per verb (16 verbs)
// ──────────────────────────────────────────────────────────────
const SAMPLES = {
  'estate-tax-scenario': [
    { label: 'Vandermeer — federal sunset 2026', values: { family_id: 'FAM-001', scenario: 'Model the impact of the 2026 federal estate-tax exemption sunset on the Vandermeer estate without further planning.', context_notes: 'Current taxable estate ~ $620M, CT residency, $24M GST exemption already used in 2012-era SLAT.' } },
    { label: 'Whitfield — Florida residency move', values: { family_id: 'FAM-015', scenario: 'Compare staying in Palm Beach FL vs migrating principal residence to Texas for estate purposes.', context_notes: 'Estate $5B+; FL/TX both no income tax; consider state estate-tax exposure and asset situs.' } },
    { label: 'Okonkwo — UK→US handover', values: { family_id: 'FAM-002', scenario: 'G2 son moving from London to NYC: model US estate tax on UK situs assets after relocation.', context_notes: 'Eaton Square mansion stays in UK trust; $1B+ estate with Bermuda trust; treaty: UK/US 1978 estate convention.' } },
    { label: 'Rosenthal — CH/EU coordination', values: { family_id: 'FAM-004', scenario: 'Multi-jurisdiction estate tax for ZH residents holding DE industrial IP and FR real estate.', context_notes: 'CH wealth tax + cantonal inheritance applies; DE and FR have estate / succession taxes; treaty network mixed.' } },
    { label: 'Al-Mansour — DIFC trust split', values: { family_id: 'FAM-006', scenario: 'Split DIFC perpetual trust into branch trusts for 4 sons; estate impact at G1 demise.', context_notes: 'DIFC zero-tax regime; assets include Palm Jumeirah villa, G700 jet, $1.45B trust principal; Sharia overlay required.' } },
  ],

  'trust-distribution-suggest': [
    { label: 'TRU-001 Vandermeer dynasty Q2', values: { trust_id: 'TRU-001', period: '2026-Q2', context_notes: 'HEMS standard; G2 son in college tuition year; matriarch primary residence taxes due July.' } },
    { label: 'TRU-007 Al-Mansour DIFC Q2', values: { trust_id: 'TRU-007', period: '2026-Q2', context_notes: 'Granddaughter starting Choate $72k; Sharia governance memo requires majority male sign-off.' } },
    { label: 'TRU-003 Okonkwo Bermuda Q2', values: { trust_id: 'TRU-003', period: '2026-Q2', context_notes: 'Discretionary; matriarch lifestyle ~ $3.6M/yr; G2 son new business funding request $5M.' } },
    { label: 'TRU-009 Bouchard foundation', values: { trust_id: 'TRU-009', period: '2026-Q2', context_notes: 'CLT structure; charitable lead remains for 8 more years; family branches A/B/C compete for residual.' } },
    { label: 'TRU-015 Whitfield dynasty', values: { trust_id: 'TRU-015', period: '2026-Q2', context_notes: '11-member council; large discretionary corpus; equine and education distributions queued; sunset year.' } },
  ],

  'illiquid-valuation-band': [
    { label: 'ILA-001 Vandermeer holding co', values: { asset_id: 'ILA-001', asset_type: 'private operating company', context_notes: 'Closely held LLC, EBITDA $22M, revenue $180M, comparable specialty industrials traded 8-12x EBITDA.' } },
    { label: 'ILA-008 Petrov 95m yacht', values: { asset_id: 'ILA-008', asset_type: 'yacht (Feadship 95m)', context_notes: 'Built 2019, 4 charters/year averaging $850k/wk, similar vessel sold 2024 at $182M; bunker fuel + crew costs $9M/yr.' } },
    { label: 'ILA-003 Okonkwo shipping stake', values: { asset_id: 'ILA-003', asset_type: 'shipping fleet stake', context_notes: 'Stake in 14-vessel VLCC + Suezmax fleet, charter rates near 10y high, DCF vs sum-of-parts both relevant.' } },
    { label: 'ILA-007 Al-Mansour G700', values: { asset_id: 'ILA-007', asset_type: 'aircraft (Gulfstream G700)', context_notes: '2024 delivery, 380 hrs flown, AMSTAT shows two comps at $76M and $79M; engine OH credits remaining.' } },
    { label: 'ILA-015 Whitfield bloodstock', values: { asset_id: 'ILA-015', asset_type: 'race-horse breeding stock', context_notes: '3 G1 sires + 18 broodmares, stud fees $75-$200k, Coolmore management; auction comps from Keeneland Nov.' } },
  ],

  'charitable-vehicle-recommend': [
    { label: 'Vandermeer — education + cancer focus', values: { family_id: 'FAM-001', goals: 'Sustain ~$8M/year in giving across Ivy League endowments and cancer research; G2 wants active board involvement.' } },
    { label: 'Whitfield — multi-gen foundation', values: { family_id: 'FAM-015', goals: 'Stand up perpetual private foundation funded $200M with 5% spend rate; family members on board paid market salary.' } },
    { label: 'Bouchard — French arts CLT', values: { family_id: 'FAM-009', goals: 'Use CLT to fund Fondation de France arts grants for 15 years then revert remainder to grandchildren.' } },
    { label: 'Rosenthal — MSF DAF', values: { family_id: 'FAM-004', goals: 'One-time $25M appreciated-stock gift to support Médecins Sans Frontières via simplest tax-efficient route.' } },
    { label: 'Hanazawa — Kyoto heritage', values: { family_id: 'FAM-003', goals: 'Endow Kyoto heritage preservation in perpetuity; preserve family voice without triggering JP foundation regulation burden.' } },
  ],

  'executive-brief': [
    { label: 'Default — no bias', values: { notes: '' } },
    { label: 'Bias toward Vandermeer', values: { notes: 'Focus on Vandermeer (FAM-001) — 2026 sunset planning, holding-co valuation, Q2 distribution slate.' } },
    { label: 'Bias toward Whitfield', values: { notes: 'Focus on Whitfield (FAM-015) — Form 706 draft, succession v6.1 ratification, foundation governance reset.' } },
    { label: 'Bias toward Al-Mansour', values: { notes: 'Focus on Al-Mansour (FAM-006) — DIFC trust split, Sharia governance memo, Q2 minor beneficiary education.' } },
    { label: 'Cross-border heavy', values: { notes: 'Surface every cross-border item: Okonkwo UK/US, Rosenthal CH/EU, Hanazawa JP, Pereira BR/fundação.' } },
  ],

  'governance-memo-draft': [
    { label: 'Vandermeer — IPS amendment', values: { family_id: 'FAM-001', topic: 'Amend Investment Policy Statement v2.0 to raise illiquid allocation cap from 25% to 35% and add ESG screen.', context_notes: 'CIO recommendation; needs council vote; some G2 members raised concerns about Sequoia + Blackstone GP-stakes concentration.' } },
    { label: 'Whitfield — foundation board comp', values: { family_id: 'FAM-015', topic: 'Set Whitfield Family Foundation board compensation policy: paid roles vs volunteer, IRS reasonableness, family vs independent split.', context_notes: '$8.5M annual giving; 11 council members; daughter Charlotte chairs.' } },
    { label: 'Okonkwo — cross-border domicile', values: { family_id: 'FAM-002', topic: 'Policy on family members changing tax domicile (UK→US/EU) and impact on Bermuda trust beneficiary status.', context_notes: 'G2 son Chukwuemeka considering NYC move; needs framework so future generations have clear rule.' } },
    { label: 'Rosenthal — philanthropy policy v3', values: { family_id: 'FAM-004', topic: 'Update philanthropy policy v2.3 → v3 to formalise 50/50 split between medical and refugee causes with appeal process.', context_notes: 'Founder Greta wants medical bias; G3 prefers refugee work; need conflict-resolution clause.' } },
    { label: 'Pereira — foundation bylaws review', values: { family_id: 'FAM-012', topic: 'Refresh Brazilian foundation bylaws v1.3 ahead of MP register filing.', context_notes: 'Ministry oversight tightening in 2026; G2 wants more discretion; need clean amendment trail.' } },
  ],

  'succession-readiness': [
    { label: 'Vandermeer — comprehensive scan', values: { family_id: 'FAM-001', context_notes: 'G1 matriarch 67yo; G2 son active in business; G3 minor (15yo); doc set comprehensive but no liquidity plan tested.' } },
    { label: 'Whitfield — pre-G1 demise drill', values: { family_id: 'FAM-015', context_notes: 'Patriarch 79yo, recent health event; 11-member council large but split; succession v6.1 just ratified.' } },
    { label: 'Al-Mansour — 4-branch split', values: { family_id: 'FAM-006', context_notes: 'Need to test DIFC split across 4 sons; Sharia majority-male sign-off interacts with civil-law trust.' } },
    { label: 'Hanazawa — Japanese male-line', values: { family_id: 'FAM-003', context_notes: 'Eldest-son tradition; G2 son recently divorced; G3 grandson age 8; tax timing on JP inheritance.' } },
    { label: 'Petrov — Monaco widow case', values: { family_id: 'FAM-007', context_notes: 'Patriarch deceased Q4-2025; widow + 2 minor children; Monaco residency under review; trust under inspection.' } },
  ],

  'tax-loss-harvest': [
    { label: 'Default — sample across all families', values: { context_notes: 'Use the loaded holdings table; assume short-term gains $4M already realized YTD to offset.' } },
    { label: 'Vandermeer focus', values: { family_id: 'FAM-001', context_notes: 'Look at AAPL, BRK.B losers if any; lots > 1y preferred; coordinate with charitable stock gifts.' } },
    { label: 'Chen — Singapore', values: { family_id: 'FAM-010', context_notes: 'SG resident — no capital gains tax, but G1 daughter is US person; harvest only in US-taxable accounts.' } },
    { label: 'Bouchard — France IFI', values: { family_id: 'FAM-009', context_notes: 'IFI applies on real estate not securities; harvest is about capital gain offsets not wealth tax.' } },
    { label: 'Whitfield — large estate', values: { family_id: 'FAM-015', context_notes: 'GOOGL position big; consider donating appreciated lots to foundation and harvesting losers separately.' } },
  ],

  'generational-impact': [
    { label: 'Vandermeer — $185M holding-co sale', values: { family_id: 'FAM-001', decision: 'Sell Vandermeer Holdings LLC ($185M) for cash now vs hold for 10y at projected 12% IRR.', context_notes: 'G2 son Eleanor: liquidity reduces concentration; G3 view: ownership identity matters; tax basis low.' } },
    { label: 'Whitfield — fund foundation $200M', values: { family_id: 'FAM-015', decision: 'Fund Whitfield Family Foundation with $200M of appreciated equity over 5 years.', context_notes: 'Reduces estate; permanently leaves the family pool; charitable identity vs heir wealth trade-off.' } },
    { label: 'Al-Mansour — split DIFC trust', values: { family_id: 'FAM-006', decision: 'Split the DIFC perpetual trust into 4 branch trusts for each son.', context_notes: 'Reduces governance friction; creates 4 independent pools; impact on G3 grand-pooled wealth.' } },
    { label: 'Bouchard — sell Burgundy domaine', values: { family_id: 'FAM-009', decision: 'Sell Burgundy domaine to a luxury group at $48M premium vs $36M cost basis.', context_notes: 'G3 daughter Camille produces wine there; emotional + identity dimension; tax on gain.' } },
    { label: 'Petrov — sell Monaco penthouse', values: { family_id: 'FAM-007', decision: 'Sell Monte Carlo penthouse to fund widow + minor children liquidity needs.', context_notes: 'Penthouse $78M; Monaco residency status implications for children; widow income needs.' } },
  ],

  'art-provenance-check': [
    { label: 'ART-014 van Gogh disputed', values: { art_id: 'ART-014', work_title: 'Still Life with Tulips (workshop attrib.)', artist: 'Vincent van Gogh', claimed_provenance: 'Disputed attribution — Bonger archive 1925; van der Berg family ownership since 1962.' } },
    { label: 'ART-003 Picasso 1937 NS-era', values: { art_id: 'ART-003', work_title: 'Femme assise (1937)', artist: 'Pablo Picasso', claimed_provenance: 'Provenance documented 1937→present; Berggruen catalog 1996; no recorded sale 1939-1945.' } },
    { label: 'ART-005 Klee Kunstmuseum loan', values: { art_id: 'ART-005', work_title: 'Senecio (1922)', artist: 'Paul Klee', claimed_provenance: 'Kunstmuseum Bern long-loan; deaccessioned 1998 to Rosenthal collection via Pictet.' } },
    { label: 'ART-006 Caravaggio Borghese workshop', values: { art_id: 'ART-006', work_title: 'Boy with a Basket of Fruit (workshop)', artist: 'Caravaggio (attr.)', claimed_provenance: 'Borghese collection; doubts about attribution remain; Castellano acquired 1971 from Roman dealer.' } },
    { label: 'ART-009 Monet Nymphéas chain', values: { art_id: 'ART-009', work_title: 'Nymphéas (1916)', artist: 'Claude Monet', claimed_provenance: 'Galerie Bernheim-Jeune 1920; Bouchard family since 1955; intermediate ownership unclear 1930-1955.' } },
  ],

  'education-distribution-rule': [
    { label: 'Vandermeer education rule', values: { family_id: 'FAM-001', context_notes: 'Currently ad-hoc; want consistent rule for K-12, undergrad, grad and post-grad; cover beneficiary spouses?' } },
    { label: 'Al-Mansour broad family', values: { family_id: 'FAM-006', context_notes: '4 sons each with 3+ children; need cap structure that scales but rewards merit; Sharia overlay required.' } },
    { label: 'Hanazawa — JP + overseas', values: { family_id: 'FAM-003', context_notes: 'JP private school + overseas university typical; consider parity for in-Japan vs overseas costs.' } },
    { label: 'Pereira — Brazil + overseas', values: { family_id: 'FAM-012', context_notes: 'BR fundação must follow tax rules; need clear formula to avoid foundation disqualification.' } },
    { label: 'Whitfield broad council', values: { family_id: 'FAM-015', context_notes: '11-member council; want rule that survives next 50 years; include executive ed and re-skilling.' } },
  ],

  'regulatory-compliance-check': [
    { label: 'Vandermeer — US + CT + Cayman', values: { family_id: 'FAM-001', jurisdictions: ['United States','Connecticut','Cayman Islands'] } },
    { label: 'Okonkwo — UK + Bermuda + Nigeria', values: { family_id: 'FAM-002', jurisdictions: ['United Kingdom','Bermuda','Nigeria'] } },
    { label: 'Rosenthal — CH + DE + FR', values: { family_id: 'FAM-004', jurisdictions: ['Switzerland','Germany','France'] } },
    { label: 'Al-Mansour — UAE + DIFC + UK', values: { family_id: 'FAM-006', jurisdictions: ['United Arab Emirates','DIFC','United Kingdom'] } },
    { label: 'Chen — SG + HK + US', values: { family_id: 'FAM-010', jurisdictions: ['Singapore','Hong Kong','United States'] } },
  ],

  'charitable-impact-report': [
    { label: 'Vandermeer — calendar 2025', values: { family_id: 'FAM-001', period: '2025 calendar', context_notes: 'Compose annual impact report for family council.' } },
    { label: 'Whitfield — foundation Q1-2026', values: { family_id: 'FAM-015', period: '2026 Q1', context_notes: 'Highlight $8.5M Q1 commitment; outline next-quarter pipeline.' } },
    { label: 'Bouchard — 5y arts cumulative', values: { family_id: 'FAM-009', period: '2021-2025', context_notes: 'Five-year cumulative report for Fondation de France relationship.' } },
    { label: 'Rosenthal — humanitarian focus', values: { family_id: 'FAM-004', period: '2025 calendar', context_notes: 'Highlight MSF and refugee partnerships; refresh thematic narrative.' } },
    { label: 'Hanazawa — Kyoto heritage 10y', values: { family_id: 'FAM-003', period: '2016-2025', context_notes: 'Ten-year retrospective ahead of bicentennial of Kyoto family seat.' } },
  ],

  'family-meeting-agenda': [
    { label: 'Vandermeer — annual June', values: { family_id: 'FAM-001', themes: '2026 sunset planning, IPS amendment, Q2 distributions, next-gen onboarding.' } },
    { label: 'Whitfield — Palm Beach Jan', values: { family_id: 'FAM-015', themes: 'Form 706 ratification, succession v6.1 review, foundation board comp, equine portfolio.' } },
    { label: 'Al-Mansour — DIFC retreat', values: { family_id: 'FAM-006', themes: 'DIFC trust split, Sharia governance memo, G3 education planning, aircraft fractional decision.' } },
    { label: 'Okonkwo — London March', values: { family_id: 'FAM-002', themes: 'UK→US handover, Bermuda discretionary review, G2 succession discussion.' } },
    { label: 'Bouchard — Paris September', values: { family_id: 'FAM-009', themes: 'CLT remainder modeling, Burgundy domaine decision, philanthropy policy v3 vote.' } },
  ],

  'asset-allocation-rebalance': [
    { label: 'Vandermeer rebalance', values: { family_id: 'FAM-001', current_allocation: JSON.stringify({ public_equity: 0.32, fixed_income: 0.18, private_equity: 0.22, hedge_funds: 0.10, real_estate: 0.10, cash: 0.03, art: 0.02, other_illiquid: 0.03 }, null, 2), target_allocation: JSON.stringify({ public_equity: 0.28, fixed_income: 0.22, private_equity: 0.24, hedge_funds: 0.10, real_estate: 0.10, cash: 0.02, art: 0.02, other_illiquid: 0.02 }, null, 2) } },
    { label: 'Whitfield — defensive shift', values: { family_id: 'FAM-015', current_allocation: JSON.stringify({ public_equity: 0.40, fixed_income: 0.12, private_equity: 0.28, hedge_funds: 0.12, real_estate: 0.05, cash: 0.03 }, null, 2), target_allocation: JSON.stringify({ public_equity: 0.28, fixed_income: 0.22, private_equity: 0.28, hedge_funds: 0.14, real_estate: 0.05, cash: 0.03 }, null, 2) } },
    { label: 'Al-Mansour — Sharia compliant', values: { family_id: 'FAM-006', current_allocation: JSON.stringify({ sukuk: 0.18, sharia_equity: 0.30, real_estate: 0.20, private_equity: 0.18, cash: 0.04, gold: 0.05, other: 0.05 }, null, 2), target_allocation: JSON.stringify({ sukuk: 0.22, sharia_equity: 0.30, real_estate: 0.18, private_equity: 0.18, cash: 0.04, gold: 0.05, other: 0.03 }, null, 2) } },
    { label: 'Rosenthal — CH conservative', values: { family_id: 'FAM-004', current_allocation: JSON.stringify({ chf_bonds: 0.22, global_equity: 0.30, private_equity: 0.18, real_estate: 0.12, hedge_funds: 0.12, cash: 0.06 }, null, 2), target_allocation: JSON.stringify({ chf_bonds: 0.18, global_equity: 0.32, private_equity: 0.20, real_estate: 0.12, hedge_funds: 0.12, cash: 0.06 }, null, 2) } },
    { label: 'Chen — risk-on tilt', values: { family_id: 'FAM-010', current_allocation: JSON.stringify({ asia_equity: 0.28, us_equity: 0.20, fixed_income: 0.18, private_equity: 0.16, real_estate: 0.10, cash: 0.04, alts: 0.04 }, null, 2), target_allocation: JSON.stringify({ asia_equity: 0.30, us_equity: 0.24, fixed_income: 0.12, private_equity: 0.18, real_estate: 0.08, cash: 0.04, alts: 0.04 }, null, 2) } },
  ],

  'beneficiary-onboarding': [
    { label: 'Sophia Vandermeer (G3 minor)', values: { ben_id: 'BEN-003', context_notes: '15yo entering Phillips Academy; G3 minor onboarding for future trust beneficiary status at 21.' } },
    { label: 'Fatima Al-Mansour (G3 minor)', values: { ben_id: 'BEN-009', context_notes: 'Granddaughter to G1 patriarch; first female G3 to receive direct DIFC trust interest; Sharia overlay needed.' } },
    { label: 'Chukwuemeka Okonkwo (G2 adult)', values: { ben_id: 'BEN-005', context_notes: 'G2 son finishing LSE; expected to take board seat in family holding co next year.' } },
    { label: 'Hamish McKinnon (G3 adult)', values: { ben_id: 'BEN-013', context_notes: 'Just turned 21; entering Scots-law trust as named beneficiary; St Andrews student.' } },
    { label: 'Wei Ling Chen (G3 adult)', values: { ben_id: 'BEN-012', context_notes: 'INSEAD MBA candidate; SG resident with US-person status (born in US).' } },
  ],

  // Apply pass 7: dedicated philanthropic grant scorer (split out from charitable-impact-report).
  'philanthropic-grant-score': [
    { label: 'Vandermeer — MSK Cancer Center $2M', values: { family_id: 'FAM-001', recipient: 'Memorial Sloan Kettering', amount_usd: 2000000, cause_area: 'cancer research', context_notes: 'Aligns with G1 matriarch oncology focus; org has 4-star Charity Navigator; family has given $11M lifetime.' } },
    { label: 'Whitfield — KIPP charter network $5M', values: { family_id: 'FAM-015', recipient: 'KIPP Foundation', amount_usd: 5000000, cause_area: 'K-12 education access', context_notes: 'Whitfield Foundation board split on charter schools; CEO turnover Q1; impact studies mixed.' } },
    { label: 'Bouchard — Fondation de France arts', values: { family_id: 'FAM-009', recipient: 'Fondation de France (arts pool)', amount_usd: 750000, cause_area: 'french cultural heritage', context_notes: 'CLT-eligible; aligns with family mission pillar #2; prior gift $400k in 2023.' } },
    { label: 'Rosenthal — MSF emergency $25M block', values: { family_id: 'FAM-004', recipient: 'Médecins Sans Frontières', amount_usd: 25000000, cause_area: 'humanitarian medicine', context_notes: 'Appreciated stock gift; would lift MSF to top-3 single-donor exposure (concentration risk).' } },
    { label: 'Al-Mansour — Sharia-compliant edu $1.2M', values: { family_id: 'FAM-006', recipient: 'Sharjah Heritage Education Initiative', amount_usd: 1200000, cause_area: 'arabic-language education', context_notes: 'New 501(c)-equivalent UAE NGO; governance evidence thin; Sharia overlay positive.' } },
  ],
};

// GET /api/ai/samples?feature=<verb>
router.get('/samples', (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    if (!feature) return res.json({ features: Object.keys(SAMPLES) });
    const samples = SAMPLES[feature];
    if (!samples) return res.status(404).json({ error: `unknown feature: ${feature}` });
    res.json({ feature, samples });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/ai/history?feature=<name>&limit=<n>
router.get('/history', async (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 200);
    let r;
    if (feature) {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results WHERE feature = $1 ORDER BY created_at DESC LIMIT $2',
        [feature, limit]
      );
    } else {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
    }
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Helper: load family snapshot from DB
async function loadFamily(familyId) {
  if (!familyId) return null;
  const r = await pool.query('SELECT * FROM families WHERE family_id = $1 LIMIT 1', [familyId]);
  return r.rows[0] || null;
}

// ──────────────────────────────────────────────────────────────
// 1. estate-tax-scenario
// ──────────────────────────────────────────────────────────────
router.post('/estate-tax-scenario', async (req, res) => {
  try {
    const { family_id, family, scenario, context_notes, context } = req.body || {};
    let fam = family || await loadFamily(family_id);
    if (!fam) {
      // best-effort default — first family in DB
      const r = await pool.query('SELECT * FROM families ORDER BY id ASC LIMIT 1');
      fam = r.rows[0] || { family_id: family_id || 'FAM-UNKNOWN' };
    }
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.estateTaxScenario(fam, scenario || 'Default estate tax scenario across base assumptions.', ctx);
    await record('estate-tax-scenario', { family_id: fam.family_id, scenario, context: ctx }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 2. trust-distribution-suggest
// ──────────────────────────────────────────────────────────────
router.post('/trust-distribution-suggest', async (req, res) => {
  try {
    const { trust_id, period, context_notes, context } = req.body || {};
    let trust = null;
    let bens = [];
    if (trust_id) {
      const tr = await pool.query('SELECT * FROM trusts WHERE trust_id = $1 LIMIT 1', [trust_id]);
      trust = tr.rows[0] || null;
      if (trust?.family_id) {
        const br = await pool.query('SELECT * FROM beneficiaries WHERE family_id = $1', [trust.family_id]);
        bens = br.rows;
      }
    }
    if (!trust) {
      const r = await pool.query('SELECT * FROM trusts ORDER BY id ASC LIMIT 1');
      trust = r.rows[0] || { trust_id: trust_id || 'TRU-UNKNOWN' };
    }
    const ctx = { ...(context || {}), period: period || '2026-Q2', ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.trustDistributionSuggest(trust, bens, ctx);
    await record('trust-distribution-suggest', { trust_id: trust.trust_id, period: ctx.period }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 3. illiquid-valuation-band
// ──────────────────────────────────────────────────────────────
router.post('/illiquid-valuation-band', async (req, res) => {
  try {
    const { asset_id, asset_type, context_notes, context } = req.body || {};
    let asset = null;
    let comps = [];
    if (asset_id) {
      const ar = await pool.query('SELECT * FROM illiquid_assets WHERE asset_id = $1 LIMIT 1', [asset_id]);
      asset = ar.rows[0] || null;
      const cr = await pool.query('SELECT * FROM valuation_reports WHERE asset_id = $1 ORDER BY valued_at DESC LIMIT 5', [asset_id]);
      comps = cr.rows;
    }
    if (!asset) {
      const r = await pool.query('SELECT * FROM illiquid_assets ORDER BY id ASC LIMIT 1');
      asset = r.rows[0] || { asset_id: asset_id || 'ILA-UNKNOWN', type: asset_type || 'unknown' };
    }
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.illiquidValuationBand(asset, comps, ctx);
    await record('illiquid-valuation-band', { asset_id: asset.asset_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 4. charitable-vehicle-recommend
// ──────────────────────────────────────────────────────────────
router.post('/charitable-vehicle-recommend', async (req, res) => {
  try {
    const { family_id, goals, context_notes, context } = req.body || {};
    let fam = await loadFamily(family_id);
    if (!fam) {
      const r = await pool.query('SELECT * FROM families ORDER BY id ASC LIMIT 1');
      fam = r.rows[0] || { family_id: family_id || 'FAM-UNKNOWN' };
    }
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.charitableVehicleRecommend(fam, goals || 'Sustained multi-cause family philanthropy.', ctx);
    await record('charitable-vehicle-recommend', { family_id: fam.family_id, goals }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 5. executive-brief
// ──────────────────────────────────────────────────────────────
router.post('/executive-brief', async (req, res) => {
  try {
    const [families, trusts, illiquid, holdings, dist, gov, tax, gifts] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM families"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(assets_usd),0) AS total_assets FROM trusts"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(valuation_usd),0) AS total_value FROM illiquid_assets"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(value_usd),0) AS total_value FROM holdings"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='scheduled') AS scheduled, COALESCE(SUM(amount_usd) FILTER (WHERE status='paid'),0) AS paid_ytd FROM distributions"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='review') AS review, COUNT(*) AS total FROM governance_docs"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='draft') AS draft, COUNT(*) FILTER (WHERE status='review') AS review FROM tax_filings"),
      pool.query("SELECT COALESCE(SUM(amount_usd),0) AS ytd_total, COUNT(*) AS gifts FROM charitable_gifts"),
    ]);
    const snapshot = {
      families: families.rows[0],
      trusts: trusts.rows[0],
      illiquid_assets: illiquid.rows[0],
      holdings: holdings.rows[0],
      distributions: dist.rows[0],
      governance: gov.rows[0],
      tax_filings: tax.rows[0],
      charitable: gifts.rows[0],
      ...(req.body?.notes ? { notes: req.body.notes } : {}),
    };
    const result = await ai.executiveBrief(snapshot);
    const out = { snapshot, brief: result };
    await record('executive-brief', { notes: req.body?.notes || null }, out);
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 6. governance-memo-draft
// ──────────────────────────────────────────────────────────────
router.post('/governance-memo-draft', async (req, res) => {
  try {
    const { family_id, topic, context_notes, context } = req.body || {};
    let fam = await loadFamily(family_id);
    if (!fam) {
      const r = await pool.query('SELECT * FROM families ORDER BY id ASC LIMIT 1');
      fam = r.rows[0] || { family_id: family_id || 'FAM-UNKNOWN' };
    }
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.governanceMemoDraft(topic || 'General governance refresh', fam, ctx);
    await record('governance-memo-draft', { family_id: fam.family_id, topic }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 7. succession-readiness
// ──────────────────────────────────────────────────────────────
router.post('/succession-readiness', async (req, res) => {
  try {
    const { family_id, context_notes, context } = req.body || {};
    let fam = await loadFamily(family_id);
    if (!fam) {
      const r = await pool.query('SELECT * FROM families ORDER BY id ASC LIMIT 1');
      fam = r.rows[0] || { family_id: family_id || 'FAM-UNKNOWN' };
    }
    const planR = await pool.query('SELECT * FROM succession_plans WHERE family_id = $1 ORDER BY effective_date DESC LIMIT 1', [fam.family_id]);
    const plan = planR.rows[0] || {};
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.successionReadiness(fam, plan, ctx);
    await record('succession-readiness', { family_id: fam.family_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 8. tax-loss-harvest
// ──────────────────────────────────────────────────────────────
router.post('/tax-loss-harvest', async (req, res) => {
  try {
    const { family_id, holdings: bodyHoldings, context_notes, context } = req.body || {};
    let holdings = bodyHoldings;
    if (!holdings) {
      if (family_id) {
        const r = await pool.query('SELECT * FROM holdings WHERE family_id = $1 ORDER BY id ASC LIMIT 50', [family_id]);
        holdings = r.rows;
      } else {
        const r = await pool.query('SELECT * FROM holdings ORDER BY id ASC LIMIT 30');
        holdings = r.rows;
      }
    }
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.taxLossHarvest(holdings, ctx);
    await record('tax-loss-harvest', { holdings_count: holdings.length, family_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 9. generational-impact
// ──────────────────────────────────────────────────────────────
router.post('/generational-impact', async (req, res) => {
  try {
    const { family_id, decision, context_notes, context } = req.body || {};
    let fam = await loadFamily(family_id);
    if (!fam) {
      const r = await pool.query('SELECT * FROM families ORDER BY id ASC LIMIT 1');
      fam = r.rows[0] || { family_id: family_id || 'FAM-UNKNOWN' };
    }
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.generationalImpact(fam, decision || 'Default major wealth-transfer decision', ctx);
    await record('generational-impact', { family_id: fam.family_id, decision }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 10. art-provenance-check
// ──────────────────────────────────────────────────────────────
router.post('/art-provenance-check', async (req, res) => {
  try {
    const { art_id, work_title, artist, claimed_provenance, context_notes, context } = req.body || {};
    let work = null;
    if (art_id) {
      const r = await pool.query('SELECT * FROM art_collection WHERE art_id = $1 LIMIT 1', [art_id]);
      work = r.rows[0] || null;
    }
    if (!work) {
      work = { art_id: art_id || 'ART-UNKNOWN', artist: artist || 'unknown', work: work_title || 'untitled', provenance: claimed_provenance || '' };
    }
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.artProvenanceCheck(work, claimed_provenance || work.provenance || '', ctx);
    await record('art-provenance-check', { art_id: work.art_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 11. education-distribution-rule
// ──────────────────────────────────────────────────────────────
router.post('/education-distribution-rule', async (req, res) => {
  try {
    const { family_id, context_notes, context } = req.body || {};
    let fam = await loadFamily(family_id);
    if (!fam) {
      const r = await pool.query('SELECT * FROM families ORDER BY id ASC LIMIT 1');
      fam = r.rows[0] || { family_id: family_id || 'FAM-UNKNOWN' };
    }
    const br = await pool.query('SELECT * FROM beneficiaries WHERE family_id = $1 LIMIT 30', [fam.family_id]);
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.educationDistributionRule(fam, br.rows, ctx);
    await record('education-distribution-rule', { family_id: fam.family_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 12. regulatory-compliance-check
// ──────────────────────────────────────────────────────────────
router.post('/regulatory-compliance-check', async (req, res) => {
  try {
    const { family_id, jurisdictions, context_notes, context } = req.body || {};
    let fam = await loadFamily(family_id);
    if (!fam) {
      const r = await pool.query('SELECT * FROM families ORDER BY id ASC LIMIT 1');
      fam = r.rows[0] || { family_id: family_id || 'FAM-UNKNOWN' };
    }
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.regulatoryComplianceCheck(fam, jurisdictions || ['United States'], ctx);
    await record('regulatory-compliance-check', { family_id: fam.family_id, jurisdictions }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 13. charitable-impact-report
// ──────────────────────────────────────────────────────────────
router.post('/charitable-impact-report', async (req, res) => {
  try {
    const { family_id, period, context_notes, context } = req.body || {};
    let fam = await loadFamily(family_id);
    if (!fam) {
      const r = await pool.query('SELECT * FROM families ORDER BY id ASC LIMIT 1');
      fam = r.rows[0] || { family_id: family_id || 'FAM-UNKNOWN' };
    }
    const gr = await pool.query('SELECT * FROM charitable_gifts WHERE family_id = $1 ORDER BY ts DESC LIMIT 30', [fam.family_id]);
    const ctx = { ...(context || {}), period: period || '2025 calendar', ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.charitableImpactReport(fam, gr.rows, ctx);
    await record('charitable-impact-report', { family_id: fam.family_id, period: ctx.period }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 14. family-meeting-agenda
// ──────────────────────────────────────────────────────────────
router.post('/family-meeting-agenda', async (req, res) => {
  try {
    const { family_id, themes, context_notes, context } = req.body || {};
    let fam = await loadFamily(family_id);
    if (!fam) {
      const r = await pool.query('SELECT * FROM families ORDER BY id ASC LIMIT 1');
      fam = r.rows[0] || { family_id: family_id || 'FAM-UNKNOWN' };
    }
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.familyMeetingAgenda(fam, themes || 'Annual portfolio + governance review', ctx);
    await record('family-meeting-agenda', { family_id: fam.family_id, themes }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 15. asset-allocation-rebalance
// ──────────────────────────────────────────────────────────────
router.post('/asset-allocation-rebalance', async (req, res) => {
  try {
    const { family_id, current_allocation, target_allocation, context_notes, context } = req.body || {};
    let cur = current_allocation;
    let tgt = target_allocation;
    if (typeof cur === 'string') { try { cur = JSON.parse(cur); } catch (_) {} }
    if (typeof tgt === 'string') { try { tgt = JSON.parse(tgt); } catch (_) {} }
    if (!cur || !tgt) {
      cur = cur || { public_equity: 0.35, fixed_income: 0.20, private_equity: 0.20, hedge_funds: 0.10, real_estate: 0.10, cash: 0.05 };
      tgt = tgt || { public_equity: 0.30, fixed_income: 0.22, private_equity: 0.22, hedge_funds: 0.10, real_estate: 0.10, cash: 0.06 };
    }
    const ctx = { ...(context || {}), family_id, ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.assetAllocationRebalance(cur, tgt, ctx);
    await record('asset-allocation-rebalance', { family_id, keys: Object.keys(cur || {}) }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 16. beneficiary-onboarding
// ──────────────────────────────────────────────────────────────
router.post('/beneficiary-onboarding', async (req, res) => {
  try {
    const { ben_id, family_id, context_notes, context } = req.body || {};
    let ben = null;
    if (ben_id) {
      const r = await pool.query('SELECT * FROM beneficiaries WHERE ben_id = $1 LIMIT 1', [ben_id]);
      ben = r.rows[0] || null;
    }
    if (!ben) {
      const r = await pool.query('SELECT * FROM beneficiaries ORDER BY id ASC LIMIT 1');
      ben = r.rows[0] || { ben_id: ben_id || 'BEN-UNKNOWN' };
    }
    const fam = await loadFamily(family_id || ben.family_id) || { family_id: ben.family_id || 'FAM-UNKNOWN' };
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.beneficiaryOnboarding(ben, fam, ctx);
    await record('beneficiary-onboarding', { ben_id: ben.ben_id, family_id: fam.family_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ──────────────────────────────────────────────────────────────
// 17. philanthropic-grant-score   (Apply pass 7)
// Dedicated scorer — pulls prior gifts from DB, scores candidate vs mission.
// ──────────────────────────────────────────────────────────────
router.post('/philanthropic-grant-score', async (req, res) => {
  try {
    const {
      family_id,
      recipient,
      amount_usd,
      cause_area,
      candidate,
      context_notes,
      context,
    } = req.body || {};
    let fam = await loadFamily(family_id);
    if (!fam) {
      const r = await pool.query('SELECT * FROM families ORDER BY id ASC LIMIT 1');
      fam = r.rows[0] || { family_id: family_id || 'FAM-UNKNOWN' };
    }
    const cand = candidate || {
      recipient:   recipient   || null,
      amount_usd:  amount_usd  != null ? Number(amount_usd) : null,
      cause_area:  cause_area  || null,
    };
    let prior = [];
    try {
      const gr = await pool.query(
        'SELECT recipient, amount_usd, vehicle, ts, status FROM charitable_gifts WHERE family_id = $1 ORDER BY ts DESC NULLS LAST LIMIT 30',
        [fam.family_id]
      );
      prior = gr.rows;
    } catch (_) { prior = []; }
    const ctx = { ...(context || {}), ...(context_notes ? { notes: context_notes } : {}) };
    const result = await ai.philanthropicGrantScore(fam, cand, prior, ctx);
    await record('philanthropic-grant-score', { family_id: fam.family_id, candidate: cand }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
