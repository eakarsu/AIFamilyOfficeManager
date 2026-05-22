-- AIFamilyOfficeManager v3 schema additions (Apply pass 7)
--   * Family mission tracker (mission statement + milestones)
--   * Next-gen education portal (milestones + learning plans tied to beneficiaries)

CREATE TABLE IF NOT EXISTS family_missions (
  id                  SERIAL PRIMARY KEY,
  mission_id          VARCHAR(50) UNIQUE,
  family_id           VARCHAR(50),
  title               VARCHAR(200),
  statement           TEXT,
  pillar              VARCHAR(60),         -- stewardship | philanthropy | enterprise | education | health | unity
  target_year         INTEGER,
  owner               VARCHAR(150),
  progress_pct        INTEGER DEFAULT 0,   -- 0..100
  status              VARCHAR(30) DEFAULT 'active',  -- active | on_hold | complete | retired
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_family_missions_family
  ON family_missions (family_id, status);

CREATE TABLE IF NOT EXISTS mission_milestones (
  id                  SERIAL PRIMARY KEY,
  milestone_id        VARCHAR(50) UNIQUE,
  mission_id          VARCHAR(50),
  title               VARCHAR(200),
  due_date            DATE,
  owner               VARCHAR(150),
  progress_pct        INTEGER DEFAULT 0,
  status              VARCHAR(30) DEFAULT 'open',   -- open | in_progress | done | blocked
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mission_milestones_mission
  ON mission_milestones (mission_id, status);

CREATE TABLE IF NOT EXISTS education_milestones (
  id                  SERIAL PRIMARY KEY,
  emi_id              VARCHAR(50) UNIQUE,
  beneficiary_id      VARCHAR(50),
  title               VARCHAR(200),
  category            VARCHAR(60),    -- admission | exam | graduation | award | internship | other
  target_date         DATE,
  achieved_date       DATE,
  status              VARCHAR(30) DEFAULT 'planned', -- planned | in_progress | achieved | missed
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_education_milestones_ben
  ON education_milestones (beneficiary_id, status);

CREATE TABLE IF NOT EXISTS learning_plans (
  id                  SERIAL PRIMARY KEY,
  plan_id             VARCHAR(50) UNIQUE,
  beneficiary_id      VARCHAR(50),
  year                INTEGER,
  focus               VARCHAR(200),       -- e.g. "AP load + summer internship"
  mentor              VARCHAR(150),
  budget_usd          BIGINT DEFAULT 0,
  status              VARCHAR(30) DEFAULT 'draft', -- draft | approved | active | complete
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_learning_plans_ben
  ON learning_plans (beneficiary_id, year DESC);
