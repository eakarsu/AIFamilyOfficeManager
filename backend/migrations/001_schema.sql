-- AIFamilyOfficeManager schema (core 18 entities)

CREATE TABLE IF NOT EXISTS families (
  id                  SERIAL PRIMARY KEY,
  family_id           VARCHAR(50) UNIQUE,
  name                VARCHAR(200) NOT NULL,
  generation_count    INTEGER DEFAULT 1,
  primary_residence   VARCHAR(200),
  net_worth_band      VARCHAR(60),
  advisor_id          VARCHAR(50),
  status              VARCHAR(30) DEFAULT 'active',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trusts (
  id                  SERIAL PRIMARY KEY,
  trust_id            VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  type                VARCHAR(60),
  trustee             VARCHAR(150),
  assets_usd          BIGINT DEFAULT 0,
  status              VARCHAR(30) DEFAULT 'active',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beneficiaries (
  id                  SERIAL PRIMARY KEY,
  ben_id              VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  name                VARCHAR(150),
  dob                 DATE,
  relationship        VARCHAR(60),
  status              VARCHAR(30) DEFAULT 'active',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS illiquid_assets (
  id                  SERIAL PRIMARY KEY,
  asset_id            VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  type                VARCHAR(60),
  valuation_usd       BIGINT DEFAULT 0,
  valued_at           DATE,
  custodian           VARCHAR(150),
  status              VARCHAR(30) DEFAULT 'held',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS holdings (
  id                  SERIAL PRIMARY KEY,
  holding_id          VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  security            VARCHAR(150),
  qty                 NUMERIC(20,4) DEFAULT 0,
  value_usd           BIGINT DEFAULT 0,
  account             VARCHAR(120),
  status              VARCHAR(30) DEFAULT 'open',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS advisors (
  id                  SERIAL PRIMARY KEY,
  advisor_id          VARCHAR(50) UNIQUE,
  name                VARCHAR(150),
  firm                VARCHAR(150),
  specialty           VARCHAR(120),
  family_id           VARCHAR(50),
  status              VARCHAR(30) DEFAULT 'active',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS governance_docs (
  id                  SERIAL PRIMARY KEY,
  doc_id              VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  type                VARCHAR(80),
  version             VARCHAR(30),
  effective_date      DATE,
  status              VARCHAR(30) DEFAULT 'active',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distributions (
  id                  SERIAL PRIMARY KEY,
  dist_id             VARCHAR(50) UNIQUE,
  trust_id            VARCHAR(50),
  beneficiary_id      VARCHAR(50),
  amount_usd          BIGINT DEFAULT 0,
  period              VARCHAR(40),
  status              VARCHAR(30) DEFAULT 'scheduled',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_filings (
  id                  SERIAL PRIMARY KEY,
  filing_id           VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  year                INTEGER,
  type                VARCHAR(60),
  status              VARCHAR(30) DEFAULT 'draft',
  filed_at            TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS charitable_gifts (
  id                  SERIAL PRIMARY KEY,
  gift_id             VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  recipient           VARCHAR(200),
  amount_usd          BIGINT DEFAULT 0,
  vehicle             VARCHAR(80),
  ts                  TIMESTAMPTZ,
  status              VARCHAR(30) DEFAULT 'completed',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education_grants (
  id                  SERIAL PRIMARY KEY,
  grant_id            VARCHAR(50) UNIQUE,
  beneficiary_id      VARCHAR(50),
  school              VARCHAR(200),
  amount_usd          BIGINT DEFAULT 0,
  year                INTEGER,
  status              VARCHAR(30) DEFAULT 'approved',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS real_estate (
  id                  SERIAL PRIMARY KEY,
  re_id               VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  address             VARCHAR(250),
  type                VARCHAR(60),
  value_usd           BIGINT DEFAULT 0,
  status              VARCHAR(30) DEFAULT 'held',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS art_collection (
  id                  SERIAL PRIMARY KEY,
  art_id              VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  artist              VARCHAR(150),
  work                VARCHAR(200),
  value_usd           BIGINT DEFAULT 0,
  provenance          TEXT,
  status              VARCHAR(30) DEFAULT 'verified',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS private_investments (
  id                  SERIAL PRIMARY KEY,
  pi_id               VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  fund                VARCHAR(200),
  commitment_usd      BIGINT DEFAULT 0,
  called_usd          BIGINT DEFAULT 0,
  status              VARCHAR(30) DEFAULT 'active',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lp_interests (
  id                  SERIAL PRIMARY KEY,
  lp_id               VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  fund                VARCHAR(200),
  vintage             INTEGER,
  commitment_usd      BIGINT DEFAULT 0,
  nav_usd             BIGINT DEFAULT 0,
  status              VARCHAR(30) DEFAULT 'active',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS succession_plans (
  id                  SERIAL PRIMARY KEY,
  plan_id             VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  version             VARCHAR(30),
  signatories         TEXT,
  effective_date      DATE,
  status              VARCHAR(30) DEFAULT 'active',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS valuation_reports (
  id                  SERIAL PRIMARY KEY,
  val_id              VARCHAR(50) UNIQUE,
  asset_id            VARCHAR(50),
  valuer              VARCHAR(150),
  value_usd           BIGINT DEFAULT 0,
  valued_at           DATE,
  status              VARCHAR(30) DEFAULT 'final',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id                  SERIAL PRIMARY KEY,
  entry_id            VARCHAR(50) UNIQUE,
  actor               VARCHAR(150),
  target              VARCHAR(200),
  action              VARCHAR(100),
  result              VARCHAR(60),
  ts                  TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_results (
  id              SERIAL PRIMARY KEY,
  feature         VARCHAR(80) NOT NULL,
  input           JSONB,
  output          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_results_feature_created
  ON ai_results (feature, created_at DESC);
