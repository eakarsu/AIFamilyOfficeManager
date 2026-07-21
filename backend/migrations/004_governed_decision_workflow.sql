ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

CREATE TABLE IF NOT EXISTS governed_family_decisions (
  id UUID PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  external_ref VARCHAR(200) NOT NULL,
  entity_ref VARCHAR(200) NOT NULL,
  decision_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor >= 0),
  currency CHAR(3) NOT NULL,
  provenance_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  reconciliation JSONB,
  status VARCHAR(40) NOT NULL DEFAULT 'draft',
  proposed_by VARCHAR(100) NOT NULL,
  first_approved_by VARCHAR(100),
  final_approved_by VARCHAR(100),
  external_result JSONB,
  failure_reason TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, external_ref)
);
CREATE INDEX IF NOT EXISTS governed_family_decisions_tenant_status_idx ON governed_family_decisions (tenant_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS governed_family_decision_evidence (
  id UUID PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES governed_family_decisions(id),
  tenant_id VARCHAR(100) NOT NULL,
  source VARCHAR(200) NOT NULL,
  source_record_ref VARCHAR(500) NOT NULL,
  sha256 CHAR(64) NOT NULL,
  classification VARCHAR(40) NOT NULL,
  summary TEXT NOT NULL,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS governed_family_decision_audit (
  id BIGSERIAL PRIMARY KEY,
  decision_id UUID NOT NULL REFERENCES governed_family_decisions(id),
  tenant_id VARCHAR(100) NOT NULL,
  actor_id VARCHAR(100) NOT NULL,
  actor_role VARCHAR(40) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  from_status VARCHAR(40),
  to_status VARCHAR(40),
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION prevent_family_decision_audit_change() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'governed_family_decision_audit is append-only'; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS family_decision_audit_immutable ON governed_family_decision_audit;
CREATE TRIGGER family_decision_audit_immutable BEFORE UPDATE OR DELETE ON governed_family_decision_audit
FOR EACH ROW EXECUTE FUNCTION prevent_family_decision_audit_change();
