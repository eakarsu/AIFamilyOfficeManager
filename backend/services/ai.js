// AI helper service for AIFamilyOfficeManager
// Reads OPENROUTER_API_KEY and OPENROUTER_MODEL from:
//   1. this project's .env (already loaded by server.js)
//   2. fallback: /Users/erolakarsu/projects/beauty-wellness-ai/.env (canonical source)
// Never overwrites or wipes credentials.

const fs = require('fs');
const path = require('path');

const FALLBACK_ENV = '/Users/erolakarsu/projects/beauty-wellness-ai/.env';

function readFallbackEnv() {
  try {
    if (!fs.existsSync(FALLBACK_ENV)) return {};
    const raw = fs.readFileSync(FALLBACK_ENV, 'utf8');
    const out = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      out[m[1]] = val;
    }
    return out;
  } catch (e) {
    console.warn('[ai] fallback env read failed:', e.message);
    return {};
  }
}

function getOpenRouterCreds() {
  const fb = readFallbackEnv();
  const key = process.env.OPENROUTER_API_KEY || fb.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || fb.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  return { key, model };
}

const SYSTEM_PROMPT =
  'You are a senior multi-generation family office advisor. You support trustees, beneficiaries, ' +
  'CIOs and family councils across estate planning, illiquid wealth, philanthropy, governance and tax. ' +
  'Always return strict JSON in the exact schema requested. Do not wrap output in markdown code fences. ' +
  'All scenarios are illustrative — never provide tax, legal or investment advice that should be relied upon ' +
  'in real-world filings; treat every input as an educational tabletop.';

function callOpenRouter(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const { key, model } = getOpenRouterCreds();
    if (!key) {
      return resolve({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const https = require('https');
    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3074',
        'X-Title': 'AI Family Office Manager',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            return resolve({ error: parsed.error.message || 'OpenRouter error', raw: body });
          }
          const content = parsed.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) {
          resolve({ error: 'AI response parse failed', raw: body });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

function safeJsonParse(response, fallback) {
  if (response && typeof response === 'object' && response.error) {
    return { ...fallback, error: response.error };
  }
  if (response == null) return { ...fallback, summary: '' };
  if (typeof response === 'object') return response;
  const text = String(response).trim();
  try { return JSON.parse(text); } catch (_) {}
  try {
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return JSON.parse(text.slice(start, i + 1)); }
      }
    }
  } catch (_) {}
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) return JSON.parse(fenced[1].trim());
  } catch (_) {}
  return { ...fallback, summary: text };
}

// ──────────────────────────────────────────────────────────────
// AI Verb 1: Estate Tax Scenario
// ──────────────────────────────────────────────────────────────
async function estateTaxScenario(family, scenario, context = {}) {
  const sys = `${SYSTEM_PROMPT} Model an estate-tax scenario for the given family. Return strict JSON:
{
  "scenario_name": string,
  "assumptions": [string],
  "current_taxable_estate_usd": number,
  "projected_federal_estate_tax_usd": number,
  "projected_state_estate_tax_usd": number,
  "projected_foreign_tax_usd": number,
  "after_tax_to_heirs_usd": number,
  "techniques_applied": [{ "technique": string, "savings_usd": number, "narrative": string }],
  "risks": [{ "risk": string, "severity": "low"|"medium"|"high", "mitigation": string }],
  "next_steps": [string],
  "confidence": number,
  "summary": string
}`;
  const usr = `Family snapshot:\n${JSON.stringify(family, null, 2)}\nScenario: ${scenario}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', techniques_applied: [], risks: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 2: Trust Distribution Suggest
// ──────────────────────────────────────────────────────────────
async function trustDistributionSuggest(trust, beneficiaries = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Suggest a quarterly distribution schedule from a trust to its beneficiaries. Return strict JSON:
{
  "trust_id": string,
  "period": string,
  "recommendations": [{
    "beneficiary_id": string,
    "name": string,
    "amount_usd": number,
    "purpose": "HEMS"|"discretionary"|"unitrust"|"income"|"education"|"medical",
    "rationale": string,
    "tax_impact_usd": number
  }],
  "total_distribution_usd": number,
  "trustee_questions": [string],
  "approval_workflow": [string],
  "summary": string
}`;
  const usr = `Trust:\n${JSON.stringify(trust, null, 2)}\nBeneficiaries:\n${JSON.stringify(beneficiaries, null, 2)}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', recommendations: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 3: Illiquid Valuation Band
// ──────────────────────────────────────────────────────────────
async function illiquidValuationBand(asset, comparables = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Estimate a defensible valuation band for an illiquid asset. Return strict JSON:
{
  "asset_id": string,
  "asset_type": string,
  "methods_used": [string],
  "low_usd": number,
  "mid_usd": number,
  "high_usd": number,
  "discount_for_lack_of_marketability_pct": number,
  "discount_for_lack_of_control_pct": number,
  "key_value_drivers": [string],
  "comparable_signals": [{ "source": string, "value_usd": number, "weight": number, "note": string }],
  "recommended_engagement": string,
  "confidence": number,
  "summary": string
}`;
  const usr = `Asset:\n${JSON.stringify(asset, null, 2)}\nComparables:\n${JSON.stringify(comparables, null, 2)}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', comparable_signals: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 4: Charitable Vehicle Recommend
// ──────────────────────────────────────────────────────────────
async function charitableVehicleRecommend(family, goals, context = {}) {
  const sys = `${SYSTEM_PROMPT} Recommend a charitable giving vehicle for the family. Return strict JSON:
{
  "primary_recommendation": { "vehicle": "DAF"|"private_foundation"|"CLT"|"CRUT"|"CRAT"|"PIF"|"direct", "rationale": string, "setup_cost_usd": number, "annual_admin_usd": number, "time_to_fund_days": number },
  "alternatives": [{ "vehicle": string, "fit_score": number, "trade_off": string }],
  "tax_savings_estimate_usd": number,
  "governance_implications": [string],
  "next_steps": [string],
  "summary": string
}`;
  const usr = `Family:\n${JSON.stringify(family, null, 2)}\nPhilanthropic goals: ${goals}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', alternatives: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 5: Executive Brief
// ──────────────────────────────────────────────────────────────
async function executiveBrief(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a Principal-level executive brief on the family office position. Return strict JSON:
{
  "headline": string,
  "balance_sheet_summary": { "total_assets_usd": number, "liquid_pct": number, "illiquid_pct": number, "narrative": string },
  "trust_distribution_summary": { "ytd_distributed_usd": number, "scheduled_usd": number, "notes": string },
  "active_governance_items": [{ "item": string, "owner": string, "status": string }],
  "top_risks": [{ "risk": string, "severity": "low"|"medium"|"high"|"critical", "owner": string }],
  "decisions_required": [{ "decision": string, "deadline": string, "options": [string], "recommendation": string }],
  "next_30_day_calendar": [string],
  "summary": string
}`;
  const usr = `Office snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 6: Governance Memo Draft
// ──────────────────────────────────────────────────────────────
async function governanceMemoDraft(topic, family, context = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a governance memo for the family council. Return strict JSON:
{
  "memo_title": string,
  "to": string,
  "from": string,
  "date_iso": string,
  "background": string,
  "issue": string,
  "options": [{ "option": string, "pros": [string], "cons": [string] }],
  "recommendation": string,
  "voting_threshold": string,
  "next_steps": [string],
  "summary": string
}`;
  const usr = `Topic: ${topic}\nFamily:\n${JSON.stringify(family, null, 2)}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', options: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 7: Succession Readiness
// ──────────────────────────────────────────────────────────────
async function successionReadiness(family, plan = {}, context = {}) {
  const sys = `${SYSTEM_PROMPT} Score succession readiness for the family across documents, governance, beneficiary preparedness and liquidity. Return strict JSON:
{
  "overall_score": number,
  "rating": "not_ready"|"developing"|"ready"|"exemplary",
  "dimensions": [{
    "dimension": "documents"|"governance"|"next_gen_capability"|"liquidity"|"advisor_alignment",
    "score": number,
    "gaps": [string],
    "strengths": [string]
  }],
  "critical_gaps": [{ "gap": string, "fix_eta_days": number, "owner": string }],
  "recommendations": [string],
  "summary": string
}`;
  const usr = `Family:\n${JSON.stringify(family, null, 2)}\nSuccession plan:\n${JSON.stringify(plan, null, 2)}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', dimensions: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 8: Tax Loss Harvest
// ──────────────────────────────────────────────────────────────
async function taxLossHarvest(holdings = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Identify tax-loss harvesting opportunities in the holdings list. Return strict JSON:
{
  "opportunities": [{
    "holding_id": string,
    "security": string,
    "unrealized_loss_usd": number,
    "suggested_action": "sell"|"partial_sell"|"hold",
    "replacement_security": string,
    "wash_sale_window_days": number,
    "tax_savings_estimate_usd": number,
    "rationale": string
  }],
  "total_loss_to_harvest_usd": number,
  "estimated_tax_savings_usd": number,
  "warnings": [string],
  "summary": string
}`;
  const usr = `Holdings:\n${JSON.stringify(holdings, null, 2)}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', opportunities: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 9: Generational Impact
// ──────────────────────────────────────────────────────────────
async function generationalImpact(family, decision, context = {}) {
  const sys = `${SYSTEM_PROMPT} Model the impact of a wealth-transfer decision across G1/G2/G3/G4. Return strict JSON:
{
  "decision": string,
  "generations": [{
    "label": string,
    "expected_net_wealth_usd": number,
    "qualitative_impact": string,
    "primary_risks": [string]
  }],
  "long_run_dilution_pct": number,
  "preservation_score": number,
  "alignment_with_constitution": string,
  "recommendations": [string],
  "summary": string
}`;
  const usr = `Family:\n${JSON.stringify(family, null, 2)}\nDecision: ${decision}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', generations: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 10: Art Provenance Check
// ──────────────────────────────────────────────────────────────
async function artProvenanceCheck(work, claimedProvenance, context = {}) {
  const sys = `${SYSTEM_PROMPT} Audit the provenance trail of an artwork for gaps and red flags. Return strict JSON:
{
  "work": string,
  "artist": string,
  "verdict": "clean"|"caution"|"suspect",
  "confidence": number,
  "chain_of_ownership": [{ "year": string, "owner": string, "evidence": string, "concern": string }],
  "gaps_years": [string],
  "wartime_concerns": [string],
  "recommended_actions": [string],
  "summary": string
}`;
  const usr = `Work:\n${JSON.stringify(work, null, 2)}\nClaimed provenance:\n${claimedProvenance}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', chain_of_ownership: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 11: Education Distribution Rule
// ──────────────────────────────────────────────────────────────
async function educationDistributionRule(family, beneficiaries = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Draft an education distribution rule that scales fairly across beneficiaries. Return strict JSON:
{
  "rule_name": string,
  "scope": string,
  "covered_costs": [string],
  "annual_cap_per_beneficiary_usd": number,
  "lifetime_cap_per_beneficiary_usd": number,
  "approval_workflow": [string],
  "edge_cases": [{ "case": string, "treatment": string }],
  "example_calculations": [{ "beneficiary_id": string, "year_cost_usd": number, "covered_usd": number, "note": string }],
  "summary": string
}`;
  const usr = `Family:\n${JSON.stringify(family, null, 2)}\nBeneficiaries:\n${JSON.stringify(beneficiaries, null, 2)}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', covered_costs: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 12: Regulatory Compliance Check
// ──────────────────────────────────────────────────────────────
async function regulatoryComplianceCheck(family, jurisdictions = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Run a multi-jurisdiction compliance scan for the family. Return strict JSON:
{
  "jurisdictions": [{
    "jurisdiction": string,
    "regime": string,
    "obligations": [{ "obligation": string, "deadline": string, "status": "current"|"upcoming"|"overdue", "risk": "low"|"medium"|"high" }]
  }],
  "cross_border_flags": [string],
  "fatca_crs_status": string,
  "recommended_actions": [string],
  "summary": string
}`;
  const usr = `Family:\n${JSON.stringify(family, null, 2)}\nJurisdictions: ${JSON.stringify(jurisdictions)}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', jurisdictions: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 13: Charitable Impact Report
// ──────────────────────────────────────────────────────────────
async function charitableImpactReport(family, gifts = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Compose a philanthropic impact report. Return strict JSON:
{
  "period": string,
  "total_given_usd": number,
  "vehicles_used": [{ "vehicle": string, "amount_usd": number, "pct": number }],
  "themes": [{ "theme": string, "amount_usd": number, "narrative": string }],
  "highlight_grants": [{ "recipient": string, "amount_usd": number, "outcome_metric": string, "narrative": string }],
  "qualitative_outcomes": [string],
  "next_period_recommendations": [string],
  "summary": string
}`;
  const usr = `Family:\n${JSON.stringify(family, null, 2)}\nGifts:\n${JSON.stringify(gifts, null, 2)}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', themes: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 14: Family Meeting Agenda
// ──────────────────────────────────────────────────────────────
async function familyMeetingAgenda(family, themes, context = {}) {
  const sys = `${SYSTEM_PROMPT} Build an annual family meeting agenda. Return strict JSON:
{
  "meeting_title": string,
  "date_iso": string,
  "duration_minutes": number,
  "attendees": [{ "role": string, "name": string }],
  "sessions": [{
    "title": string,
    "duration_min": number,
    "facilitator": string,
    "outcomes": [string],
    "prep_materials": [string]
  }],
  "decisions_to_finalize": [string],
  "ground_rules": [string],
  "summary": string
}`;
  const usr = `Family:\n${JSON.stringify(family, null, 2)}\nThemes: ${themes}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', sessions: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 15: Asset Allocation Rebalance
// ──────────────────────────────────────────────────────────────
async function assetAllocationRebalance(currentAllocation, targetAllocation, context = {}) {
  const sys = `${SYSTEM_PROMPT} Recommend a rebalance from current to target allocation. Return strict JSON:
{
  "current_allocation": object,
  "target_allocation": object,
  "trades": [{
    "asset_class": string,
    "action": "buy"|"sell",
    "amount_usd": number,
    "rationale": string,
    "tax_lot_strategy": string
  }],
  "expected_drift_correction_pct": number,
  "estimated_transaction_cost_usd": number,
  "estimated_tax_impact_usd": number,
  "implementation_window_days": number,
  "warnings": [string],
  "summary": string
}`;
  const usr = `Current:\n${JSON.stringify(currentAllocation, null, 2)}\nTarget:\n${JSON.stringify(targetAllocation, null, 2)}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', trades: [] });
}

// ──────────────────────────────────────────────────────────────
// AI Verb 16: Beneficiary Onboarding
// ──────────────────────────────────────────────────────────────
async function beneficiaryOnboarding(beneficiary, family, context = {}) {
  const sys = `${SYSTEM_PROMPT} Build an onboarding plan for a new beneficiary. Return strict JSON:
{
  "beneficiary_id": string,
  "name": string,
  "onboarding_phases": [{
    "phase": string,
    "duration_weeks": number,
    "objectives": [string],
    "deliverables": [string],
    "owner": string
  }],
  "required_documents": [string],
  "education_modules": [string],
  "first_distribution_eligibility_date": string,
  "key_relationships": [{ "role": string, "name": string, "intro_priority": "high"|"medium"|"low" }],
  "summary": string
}`;
  const usr = `Beneficiary:\n${JSON.stringify(beneficiary, null, 2)}\nFamily:\n${JSON.stringify(family, null, 2)}\nContext: ${JSON.stringify(context)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', onboarding_phases: [] });
}

module.exports = {
  callOpenRouter,
  safeJsonParse,
  estateTaxScenario,
  trustDistributionSuggest,
  illiquidValuationBand,
  charitableVehicleRecommend,
  executiveBrief,
  governanceMemoDraft,
  successionReadiness,
  taxLossHarvest,
  generationalImpact,
  artProvenanceCheck,
  educationDistributionRule,
  regulatoryComplianceCheck,
  charitableImpactReport,
  familyMeetingAgenda,
  assetAllocationRebalance,
  beneficiaryOnboarding,
};
