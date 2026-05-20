const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const pool = require('./config/database');

const app = express();
const PORT = process.env.BACKEND_PORT || 3075;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3074,http://localhost:3075,http://localhost:3000')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Everything below this line requires a Bearer token.
app.use('/api', authenticateToken);

// CRUD routes — 18 entities
app.use('/api/families',            require('./routes/families'));
app.use('/api/trusts',              require('./routes/trusts'));
app.use('/api/beneficiaries',       require('./routes/beneficiaries'));
app.use('/api/illiquid-assets',     require('./routes/illiquidAssets'));
app.use('/api/holdings',            require('./routes/holdings'));
app.use('/api/advisors',            require('./routes/advisors'));
app.use('/api/governance-docs',     require('./routes/governanceDocs'));
app.use('/api/distributions',       require('./routes/distributions'));
app.use('/api/tax-filings',         require('./routes/taxFilings'));
app.use('/api/charitable-gifts',    require('./routes/charitableGifts'));
app.use('/api/education-grants',    require('./routes/educationGrants'));
app.use('/api/real-estate',         require('./routes/realEstate'));
app.use('/api/art-collection',      require('./routes/artCollection'));
app.use('/api/private-investments', require('./routes/privateInvestments'));
app.use('/api/lp-interests',        require('./routes/lpInterests'));
app.use('/api/succession-plans',    require('./routes/successionPlans'));
app.use('/api/valuation-reports',   require('./routes/valuationReports'));
app.use('/api/audit-log',           require('./routes/auditLog'));

// AI routes (16 verbs + history + samples)
app.use('/api/ai', require('./routes/ai'));

// Cross-cutting
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/attachments',   require('./routes/attachments'));
app.use('/api/webhooks',      require('./routes/webhooks'));

// Dashboard stats
app.use('/api/dashboard', require('./routes/dashboard'));

// Wealth Analytics — custom views (family tree, allocation, net worth, trust flow)
app.use('/api/custom-views', require('./routes/customViews'));

app.listen(PORT, () => {
  console.log(`\nAI Family Office Manager API running on http://localhost:${PORT}\n`);
});
