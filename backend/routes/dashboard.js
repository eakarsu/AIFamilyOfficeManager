const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [
      families, trusts, beneficiaries, illiquid, holdings, advisors, gov, dist,
      tax, gifts, edu, re, art, pi, lp, suc, val, audit,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM families"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(assets_usd),0) AS total_assets FROM trusts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COUNT(*) FILTER (WHERE status='minor') AS minor FROM beneficiaries"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(valuation_usd),0) AS total_value FROM illiquid_assets"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(value_usd),0) AS total_value FROM holdings"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM advisors"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='review') AS review FROM governance_docs"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='scheduled') AS scheduled, COUNT(*) FILTER (WHERE status='paid') AS paid, COALESCE(SUM(amount_usd),0) AS total_amount FROM distributions"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='draft') AS draft, COUNT(*) FILTER (WHERE status='review') AS review, COUNT(*) FILTER (WHERE status='filed') AS filed FROM tax_filings"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(amount_usd),0) AS total_amount FROM charitable_gifts"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(amount_usd),0) AS total_amount FROM education_grants"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(value_usd),0) AS total_value FROM real_estate"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='review') AS review, COALESCE(SUM(value_usd),0) AS total_value FROM art_collection"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(commitment_usd),0) AS commitments, COALESCE(SUM(called_usd),0) AS called FROM private_investments"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(commitment_usd),0) AS commitments, COALESCE(SUM(nav_usd),0) AS nav FROM lp_interests"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM succession_plans"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='draft') AS draft FROM valuation_reports"),
      pool.query("SELECT COUNT(*) AS total FROM audit_log"),
    ]);
    res.json({
      families: families.rows[0],
      trusts: trusts.rows[0],
      beneficiaries: beneficiaries.rows[0],
      illiquid_assets: illiquid.rows[0],
      holdings: holdings.rows[0],
      advisors: advisors.rows[0],
      governance_docs: gov.rows[0],
      distributions: dist.rows[0],
      tax_filings: tax.rows[0],
      charitable_gifts: gifts.rows[0],
      education_grants: edu.rows[0],
      real_estate: re.rows[0],
      art_collection: art.rows[0],
      private_investments: pi.rows[0],
      lp_interests: lp.rows[0],
      succession_plans: suc.rows[0],
      valuation_reports: val.rows[0],
      audit_log: audit.rows[0],
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
