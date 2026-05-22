const router = require('express').Router();

router.post('/score', (req, res) => {
  const { liquidAssets = 0, obligations12m = 0, capitalCalls12m = 0, distributionRequests = 0 } = req.body || {};
  const coverage = Number(liquidAssets) / Math.max(1, Number(obligations12m) + Number(capitalCalls12m) + Number(distributionRequests));
  const score = Math.max(0, Math.min(100, Math.round(100 - coverage * 45)));
  res.json({
    feature: 'liquidity_ladder',
    score,
    coverage: Math.round(coverage * 100) / 100,
    level: score >= 70 ? 'shortfall' : score >= 35 ? 'tight' : 'funded',
    actions: [
      coverage < 1 && 'Identify near-term asset sales or credit line capacity.',
      Number(capitalCalls12m) > 0 && 'Reserve liquidity for private investment capital calls.',
      Number(distributionRequests) > 0 && 'Sequence beneficiary distributions by policy priority.',
    ].filter(Boolean),
  });
});

module.exports = router;
