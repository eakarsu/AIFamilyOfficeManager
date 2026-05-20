const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ────────────────────────────────────────────────────────────────────────────
// (1) FAMILY TREE  ·  /family-tree
//     Group beneficiaries into generations (G1/G2/G3) using relationship,
//     fall back to DOB. Returns a tree rooted at family.
// ────────────────────────────────────────────────────────────────────────────
router.get('/family-tree', async (req, res) => {
  try {
    const families = await pool.query(
      `SELECT family_id, name, generation_count
         FROM families
        WHERE status = 'active'
        ORDER BY name ASC`
    );
    const bens = await pool.query(
      `SELECT ben_id, family_id, name, dob, relationship, status
         FROM beneficiaries
        ORDER BY dob ASC NULLS LAST`
    );

    const G1 = new Set(['matriarch', 'patriarch', 'founder']);
    const G2 = new Set(['son', 'daughter', 'child']);
    const G3 = new Set(['grandson', 'granddaughter', 'grandchild']);

    function genFor(rel, dob) {
      const r = (rel || '').toLowerCase();
      if (G1.has(r)) return 1;
      if (G2.has(r)) return 2;
      if (G3.has(r)) return 3;
      if (dob) {
        const y = new Date(dob).getFullYear();
        if (y < 1965) return 1;
        if (y < 1995) return 2;
        return 3;
      }
      return 2;
    }

    const tree = families.rows.map((f) => {
      const members = bens.rows.filter((b) => b.family_id === f.family_id);
      const generations = [1, 2, 3].map((g) => ({
        generation: g,
        label: `G${g}`,
        members: members
          .filter((m) => genFor(m.relationship, m.dob) === g)
          .map((m) => ({
            ben_id: m.ben_id,
            name: m.name,
            relationship: m.relationship,
            dob: m.dob,
            status: m.status,
          })),
      }));
      return {
        family_id: f.family_id,
        name: f.name,
        generation_count: f.generation_count,
        total_members: members.length,
        generations,
      };
    });

    res.json({
      families: tree,
      total_families: tree.length,
      total_beneficiaries: bens.rows.length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// (2) ASSET ALLOCATION DONUT  ·  /allocation
//     Aggregate value across asset classes from real tables.
// ────────────────────────────────────────────────────────────────────────────
function classifyHolding(security) {
  const s = (security || '').toUpperCase();
  // Crude but real classification by exchange suffix / known ticker.
  if (/(BRK\.B|BERKSHIRE)/.test(s)) return 'US Equity';
  if (/(\.L|LLOY)/.test(s)) return 'UK Equity';
  if (/\.PA|MC\.PA/.test(s)) return 'EU Equity';
  if (/\.MI|\.AS|\.SW/.test(s)) return 'EU Equity';
  if (/\.ST/.test(s)) return 'EU Equity';
  if (/TYO|JP/.test(s)) return 'JP Equity';
  if (/\.SI|\.DU|\.HK/.test(s)) return 'APAC Equity';
  if (/\.SA/.test(s)) return 'LatAm Equity';
  return 'US Equity';
}

router.get('/allocation', async (req, res) => {
  try {
    const [holdings, illiquid, realestate, art, pi, lp] = await Promise.all([
      pool.query('SELECT security, value_usd FROM holdings'),
      pool.query('SELECT type, valuation_usd FROM illiquid_assets'),
      pool.query('SELECT value_usd FROM real_estate'),
      pool.query('SELECT value_usd FROM art_collection'),
      pool.query('SELECT called_usd FROM private_investments'),
      pool.query('SELECT nav_usd FROM lp_interests'),
    ]);

    const buckets = {};
    const add = (k, v) => {
      const n = Number(v || 0);
      if (!n) return;
      buckets[k] = (buckets[k] || 0) + n;
    };

    holdings.rows.forEach((h) => add(classifyHolding(h.security), h.value_usd));
    illiquid.rows.forEach((r) => add('Illiquid Assets', r.valuation_usd));
    realestate.rows.forEach((r) => add('Real Estate', r.value_usd));
    art.rows.forEach((r) => add('Art', r.value_usd));
    pi.rows.forEach((r) => add('Private Equity', r.called_usd));
    lp.rows.forEach((r) => add('Hedge Funds', r.nav_usd));

    const allocations = Object.entries(buckets)
      .map(([asset_class, value_usd]) => ({ asset_class, value_usd }))
      .sort((a, b) => b.value_usd - a.value_usd);

    const total = allocations.reduce((s, x) => s + x.value_usd, 0);
    const withPct = allocations.map((a) => ({
      ...a,
      pct: total ? +((a.value_usd / total) * 100).toFixed(2) : 0,
    }));

    res.json({ allocations: withPct, total_value_usd: total });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// (3) NET WORTH TIME SERIES  ·  /net-worth
//     Build per-year totals from valuation_reports and current holdings.
//     For years before the latest valuation_report year, scale holdings linearly.
// ────────────────────────────────────────────────────────────────────────────
router.get('/net-worth', async (req, res) => {
  try {
    const valYearly = await pool.query(
      `SELECT EXTRACT(YEAR FROM valued_at)::int AS year,
              COALESCE(SUM(value_usd), 0)::bigint AS valuation_total
         FROM valuation_reports
        WHERE valued_at IS NOT NULL
        GROUP BY 1
        ORDER BY 1 ASC`
    );

    const holdingsTotal = await pool.query(
      `SELECT COALESCE(SUM(value_usd), 0)::bigint AS holdings_total FROM holdings`
    );
    const hTotal = Number(holdingsTotal.rows[0].holdings_total || 0);

    const yrs = valYearly.rows.map((r) => r.year).filter(Boolean);
    if (!yrs.length) {
      return res.json({ series: [], total_years: 0 });
    }
    const minYear = Math.min(...yrs);
    const maxYear = Math.max(...yrs);

    // Map year -> valuation_total
    const valMap = {};
    valYearly.rows.forEach((r) => {
      valMap[r.year] = Number(r.valuation_total || 0);
    });

    const series = [];
    let cumVal = 0;
    for (let y = minYear; y <= maxYear; y++) {
      cumVal += valMap[y] || 0;
      // Apply scaled holdings: assume holdings grew linearly across the window
      const span = Math.max(1, maxYear - minYear);
      const scale = (y - minYear) / span;
      const hPart = Math.round(hTotal * (0.6 + 0.4 * scale));
      series.push({
        year: y,
        valuation_usd: cumVal,
        holdings_usd: hPart,
        net_worth_usd: cumVal + hPart,
      });
    }

    res.json({
      series,
      total_years: series.length,
      latest_net_worth_usd: series.length ? series[series.length - 1].net_worth_usd : 0,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// (4) TRUST DISTRIBUTION FLOW  ·  /trust-flow
//     Bar chart series: each row is a trust→beneficiary edge with amount.
// ────────────────────────────────────────────────────────────────────────────
router.get('/trust-flow', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT d.dist_id, d.trust_id, d.beneficiary_id,
              d.amount_usd, d.period, d.status,
              b.name      AS beneficiary_name,
              t.type      AS trust_type,
              t.trustee   AS trustee
         FROM distributions d
         LEFT JOIN beneficiaries b ON b.ben_id   = d.beneficiary_id
         LEFT JOIN trusts        t ON t.trust_id = d.trust_id
        ORDER BY d.amount_usd DESC NULLS LAST
        LIMIT 30`
    );

    // Aggregate by (trust_id, beneficiary_id) for a clean stacked bar.
    const map = new Map();
    r.rows.forEach((row) => {
      const key = `${row.trust_id}::${row.beneficiary_id}`;
      if (!map.has(key)) {
        map.set(key, {
          trust_id: row.trust_id,
          trust_type: row.trust_type,
          trustee: row.trustee,
          beneficiary_id: row.beneficiary_id,
          beneficiary_name: row.beneficiary_name,
          edge_label:
            `${row.trust_id} → ${row.beneficiary_name || row.beneficiary_id}`,
          total_usd: 0,
          scheduled_usd: 0,
          paid_usd: 0,
          count: 0,
        });
      }
      const agg = map.get(key);
      const amt = Number(row.amount_usd || 0);
      agg.total_usd += amt;
      agg.count += 1;
      if (row.status === 'paid') agg.paid_usd += amt;
      else agg.scheduled_usd += amt;
    });

    const flows = Array.from(map.values()).sort((a, b) => b.total_usd - a.total_usd);
    const grand_total_usd = flows.reduce((s, x) => s + x.total_usd, 0);

    res.json({
      flows,
      total_edges: flows.length,
      grand_total_usd,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
