# Audit Note — AIFamilyOfficeManager

Domain: family office management — wealth aggregation, multi-generational planning, philanthropy, alternative assets, governance.

Stack: standard portfolio (Node/Express backend, React frontend, JWT auth, OpenRouter AI via `services/ai.js`, CRUD factory, attachments, webhooks, audit log, notifications, dashboard).

## Inventory

- Backend route modules: 27 (`backend/routes/`)
- Frontend pages: 40 (`frontend/src/pages/`)
- AI endpoints in `routes/ai.js`: 16 POST + 2 GET (`samples`, `history`)
- CRUD entities present: families, trusts, beneficiaries, illiquid-assets, holdings, advisors, governance-docs, distributions, tax-filings, charitable-gifts, education-grants, real-estate, art-collection, private-investments, lp-interests, succession-plans, valuation-reports, custom-views, audit-log, notifications, attachments, webhooks.

## Gap Analysis vs. Brief

### AI verbs (all PRESENT)
- asset-allocation advisor -> `POST /api/ai/asset-allocation-rebalance`
- beneficiary impact analyzer -> `beneficiary-onboarding` + `generational-impact`
- philanthropic grant scorer -> `charitable-vehicle-recommend` + `charitable-impact-report`
- governance-document summarizer -> `governance-memo-draft`
- tax-loss harvester -> `tax-loss-harvest`
- Bonus: `estate-tax-scenario`, `trust-distribution-suggest`, `illiquid-valuation-band`, `executive-brief`, `succession-readiness`, `art-provenance-check`, `education-distribution-rule`, `regulatory-compliance-check`, `family-meeting-agenda`.

### Non-AI CRUD (all PRESENT)
- entity CRUD (trusts, LLCs) -> `trusts`, `families`, `private-investments`, `lp-interests`
- holdings consolidation -> `holdings`, `dashboard`
- distribution scheduling -> `distributions`
- K-1 mgmt -> covered by `tax-filings` + `attachments`

### Custom features
- next-gen education portal -> partial (`education-grants` + `education-distribution-rule` AI); no dedicated student-facing portal page
- family-mission tracker -> NOT PRESENT as discrete module (closest: `governance-docs`, `family-meeting-agenda`)
- alternative-asset valuation copilot -> PRESENT (`illiquid-valuation-band` + `valuation-reports` + `illiquid-assets`)

## Implemented (this round)
None — audit-only.

## Backlog (prioritized)
1. **MECHANICAL** Family-mission tracker module (CRUD + progress KPIs).
2. **MECHANICAL** Next-gen education portal (beneficiary-scoped read view of grants, milestones, learning plan).
3. **NEEDS-PRODUCT-DECISION** Whether to split philanthropic grant scoring out from `charitable-impact-report` into a dedicated scorer endpoint.
4. **NEEDS-CREDS** Live custodian / aggregator feeds for holdings (Addepar, Plaid, Canoe for alts).

## Status
Coverage already strong: every brief-listed AI verb has a matching endpoint and dedicated page; every brief-listed CRUD entity exists. Only two custom feature gaps (mission tracker, next-gen portal). No code changes made.

## Apply pass 7 (full backlog implementation)

### Schema (`backend/migrations/003_schema.sql`, applied by `seed/seed.js`)
- `family_missions`             — mission_id, family_id, title, statement, pillar, target_year, owner, progress_pct, status, notes
- `mission_milestones`          — milestone_id, mission_id, title, due_date, owner, progress_pct, status, notes
- `education_milestones`        — emi_id, beneficiary_id, title, category, target_date, achieved_date, status, notes
- `learning_plans`              — plan_id, beneficiary_id, year, focus, mentor, budget_usd, status, notes
- Indexed on the primary foreign-key columns each table is queried by.

### Backend routes (mounted in `backend/server.js` before `app.listen`)
- `/api/family-missions`          full CRUD (factory) + custom `GET /kpis` and `GET /by-family/:family_id` (embeds milestones)
- `/api/mission-milestones`       full CRUD (factory)
- `/api/education-milestones`     full CRUD (factory)
- `/api/learning-plans`           full CRUD (factory)
- `/api/nextgen-portal`           READ-only aggregator: `GET /` index, `GET /:ben_id` bundle (beneficiary + family + grants + milestones + learning plans + totals)
- `/api/integrations`             provider catalog + `GET /:provider/status` + Plaid/Addepar/Canoe action stubs returning HTTP 503 with `required_env` / `missing_env` payload (NEEDS-CREDS)
- `POST /api/ai/philanthropic-grant-score`   (NEEDS-PRODUCT-DECISION resolved → split out as dedicated scorer; loads candidate + prior gifts from DB, scores on 5 axes with weighted composite, includes 5 samples in `/api/ai/samples`)

### Backend service additions
- `services/ai.js` → new `philanthropicGrantScore(family, candidate, priorGifts, context)` function returning strict-JSON scorecard with mission_alignment / impact_per_dollar / operational_health / governance_risk / concentration_risk axes + composite + recommendation.

### Frontend pages (mounted in `frontend/src/App.js`, surfaced in `Sidebar.js`)
- `FamilyMissionsPage.js`        + KPI strip pulling `/family-missions/kpis`
- `MissionMilestonesPage.js`
- `EducationMilestonesPage.js`
- `LearningPlansPage.js`
- `NextGenPortalPage.js`         next-gen education portal — beneficiary-scoped drilldown view with totals; navigates to per-beneficiary bundle
- `IntegrationsPage.js`          admin view of custodian/Plaid/Canoe configuration status + 503-stub trigger buttons
- `AIPhilanthropicGrantScorePage.js`
- Sidebar groups added: "Next Generation", "Mission Tracker"; "Integrations" link added under Admin; AI Reporting now includes the Grant Scorer.

### Frontend API wrappers (`services/api.js`)
- `familyMissionsApi`, `missionMilestonesApi`, `educationMilestonesApi`, `learningPlansApi`
- `getFamilyMissionKpis`, `getMissionsByFamily`
- `listNextGenBeneficiaries`, `getNextGenBundle`
- `listIntegrations`, `getIntegrationStatus`, `plaidCreateLinkToken`, `plaidExchangePublicToken`, `plaidSyncHoldings`, `addeparSyncAccounts`, `canoeSyncAlts`
- `aiPhilanthropicGrantScore`

### Seed data (`backend/seed/seed.js`)
- 8 family_missions, 10 mission_milestones, 10 education_milestones, 6 learning_plans — covering Vandermeer, Whitfield, Okonkwo, Al-Mansour, Hanazawa, Rosenthal, Chen, and the existing beneficiaries (BEN-003 / 005 / 009 / 012 / 013).

### Syntax verification
- `node --check` on every modified `.js`: PASS (`server.js`, `routes/familyMissions.js`, `routes/missionMilestones.js`, `routes/educationMilestones.js`, `routes/learningPlans.js`, `routes/nextGenPortal.js`, `routes/integrations.js`, `routes/ai.js`, `services/ai.js`, `seed/seed.js`, `services/api.js`).
- `@babel/parser` (sourceType=module, plugins=[jsx]) on every modified `.jsx`-bearing file (`App.js`, `Sidebar.js`, all 7 new pages): PASS.

### Skips
- Live Plaid / Addepar / Canoe wiring → 503 stubs with structured `required_env` / `missing_env` payload. No new deps added; live integration left for when credentials and provider SDKs are introduced.
- No breaking changes: existing 27 route modules, 16 AI verbs, and 40 pages untouched in behavior. Routes mounted BEFORE `app.listen` (server has no explicit 404 handler).
