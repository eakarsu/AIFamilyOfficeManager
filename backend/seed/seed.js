const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { hashPassword } = require('../services/passwords');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'family_office',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('[seed] resetting tables...');
    await client.query(`
      DROP TABLE IF EXISTS families             CASCADE;
      DROP TABLE IF EXISTS trusts               CASCADE;
      DROP TABLE IF EXISTS beneficiaries        CASCADE;
      DROP TABLE IF EXISTS illiquid_assets      CASCADE;
      DROP TABLE IF EXISTS holdings             CASCADE;
      DROP TABLE IF EXISTS advisors             CASCADE;
      DROP TABLE IF EXISTS governance_docs      CASCADE;
      DROP TABLE IF EXISTS distributions        CASCADE;
      DROP TABLE IF EXISTS tax_filings          CASCADE;
      DROP TABLE IF EXISTS charitable_gifts     CASCADE;
      DROP TABLE IF EXISTS education_grants     CASCADE;
      DROP TABLE IF EXISTS real_estate          CASCADE;
      DROP TABLE IF EXISTS art_collection       CASCADE;
      DROP TABLE IF EXISTS private_investments  CASCADE;
      DROP TABLE IF EXISTS lp_interests         CASCADE;
      DROP TABLE IF EXISTS succession_plans     CASCADE;
      DROP TABLE IF EXISTS valuation_reports    CASCADE;
      DROP TABLE IF EXISTS audit_log            CASCADE;
      DROP TABLE IF EXISTS ai_results           CASCADE;

      DROP TABLE IF EXISTS users                CASCADE;
      DROP TABLE IF EXISTS notifications        CASCADE;
      DROP TABLE IF EXISTS attachments          CASCADE;
      DROP TABLE IF EXISTS webhooks             CASCADE;
      DROP TABLE IF EXISTS webhook_deliveries   CASCADE;

      DROP TABLE IF EXISTS family_missions      CASCADE;
      DROP TABLE IF EXISTS mission_milestones   CASCADE;
      DROP TABLE IF EXISTS education_milestones CASCADE;
      DROP TABLE IF EXISTS learning_plans       CASCADE;
    `);

    console.log('[seed] applying migrations...');
    const schema1 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_schema.sql'), 'utf8');
    await client.query(schema1);
    const schema2 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '002_schema.sql'), 'utf8');
    await client.query(schema2);
    const schema3 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '003_schema.sql'), 'utf8');
    await client.query(schema3);
    const schema4 = fs.readFileSync(path.join(__dirname, '..', 'migrations', '004_governed_decision_workflow.sql'), 'utf8');
    await client.query(schema4);

    // ──────────────────────────────────────────────
    // families
    // ──────────────────────────────────────────────
    console.log('[seed] inserting families...');
    const families = [
      ['FAM-001', 'Vandermeer Family',         4, 'Greenwich, CT',           '$500M-$1B',  'ADV-001', 'active'],
      ['FAM-002', 'Okonkwo Family',            3, 'London, UK',              '$1B-$5B',    'ADV-002', 'active'],
      ['FAM-003', 'Hanazawa Family',           5, 'Tokyo, JP',               '$250M-$500M','ADV-003', 'active'],
      ['FAM-004', 'Rosenthal Family',          3, 'Zurich, CH',              '$1B-$5B',    'ADV-004', 'active'],
      ['FAM-005', 'Castellano Family',         4, 'Milan, IT',               '$500M-$1B',  'ADV-005', 'active'],
      ['FAM-006', 'Al-Mansour Family',         3, 'Dubai, AE',               '$5B+',       'ADV-006', 'active'],
      ['FAM-007', 'Petrov Family',             2, 'Monaco, MC',              '$250M-$500M','ADV-007', 'review'],
      ['FAM-008', 'Lindqvist Family',          4, 'Stockholm, SE',           '$500M-$1B',  'ADV-008', 'active'],
      ['FAM-009', 'Bouchard Family',           3, 'Paris, FR',               '$1B-$5B',    'ADV-009', 'active'],
      ['FAM-010', 'Chen Family',               3, 'Singapore, SG',           '$1B-$5B',    'ADV-010', 'active'],
      ['FAM-011', 'McKinnon Family',           5, 'Edinburgh, UK',           '$250M-$500M','ADV-011', 'active'],
      ['FAM-012', 'Pereira Family',            4, 'São Paulo, BR',           '$500M-$1B',  'ADV-012', 'active'],
      ['FAM-013', 'Tanaka Family',             3, 'Kyoto, JP',               '$500M-$1B',  'ADV-013', 'active'],
      ['FAM-014', 'van der Berg Family',       4, 'Amsterdam, NL',           '$1B-$5B',    'ADV-014', 'active'],
      ['FAM-015', 'Whitfield Family',          5, 'Palm Beach, FL',          '$5B+',       'ADV-015', 'active'],
    ];
    for (const f of families) {
      await client.query(
        `INSERT INTO families (family_id,name,generation_count,primary_residence,net_worth_band,advisor_id,status) VALUES ($1,$2,$3,$4,$5,$6,$7)`, f
      );
    }

    // ──────────────────────────────────────────────
    // trusts
    // ──────────────────────────────────────────────
    console.log('[seed] inserting trusts...');
    const trusts = [
      ['TRU-001', 'FAM-001', 'GST exempt dynasty trust',    'Northern Trust',                 320000000, 'active'],
      ['TRU-002', 'FAM-001', 'Grantor retained annuity',    'Bessemer Trust',                  85000000, 'active'],
      ['TRU-003', 'FAM-002', 'Bermuda discretionary trust', 'Appleby Trust Bermuda',          740000000, 'active'],
      ['TRU-004', 'FAM-003', 'Family holding trust',        'Sumitomo Mitsui Trust',          180000000, 'active'],
      ['TRU-005', 'FAM-004', 'Charitable lead trust',       'Pictet Wealth Management',       210000000, 'active'],
      ['TRU-006', 'FAM-005', 'Family education trust',       'BSI Private Bank',                42000000, 'active'],
      ['TRU-007', 'FAM-006', 'DIFC perpetual trust',         'DIFC Wealth Management',        1450000000, 'active'],
      ['TRU-008', 'FAM-008', 'Spousal lifetime access',      'Carnegie Trustees',               68000000, 'active'],
      ['TRU-009', 'FAM-009', 'Family foundation trust',      'Rothschild & Co',                190000000, 'active'],
      ['TRU-010', 'FAM-010', 'Singapore VCC family fund',    'DBS Private Bank',               520000000, 'active'],
      ['TRU-011', 'FAM-011', 'Scots law family trust',       'Adam & Co',                       38000000, 'active'],
      ['TRU-012', 'FAM-012', 'Brazilian private foundation', 'Itaú Private Bank',              115000000, 'review'],
      ['TRU-013', 'FAM-013', 'Family education trust',       'Nomura Trust',                    62000000, 'active'],
      ['TRU-014', 'FAM-014', 'Stichting administration',     'Van Lanschot Kempen',            280000000, 'active'],
      ['TRU-015', 'FAM-015', 'GST exempt dynasty trust',    'Northern Trust',                1820000000, 'active'],
    ];
    for (const t of trusts) {
      await client.query(
        `INSERT INTO trusts (trust_id,family_id,type,trustee,assets_usd,status) VALUES ($1,$2,$3,$4,$5,$6)`, t
      );
    }

    // ──────────────────────────────────────────────
    // beneficiaries
    // ──────────────────────────────────────────────
    console.log('[seed] inserting beneficiaries...');
    const beneficiaries = [
      ['BEN-001', 'FAM-001', 'Eleanor Vandermeer',  '1958-04-12', 'matriarch',     'active'],
      ['BEN-002', 'FAM-001', 'James Vandermeer',    '1985-09-03', 'son',           'active'],
      ['BEN-003', 'FAM-001', 'Sophia Vandermeer',   '2008-11-22', 'granddaughter', 'minor'],
      ['BEN-004', 'FAM-002', 'Adaeze Okonkwo',      '1962-02-18', 'matriarch',     'active'],
      ['BEN-005', 'FAM-002', 'Chukwuemeka Okonkwo', '1990-07-30', 'son',           'active'],
      ['BEN-006', 'FAM-003', 'Hiroshi Hanazawa',    '1955-06-15', 'patriarch',     'active'],
      ['BEN-007', 'FAM-004', 'Greta Rosenthal',     '1972-12-04', 'daughter',      'active'],
      ['BEN-008', 'FAM-005', 'Marco Castellano',    '1988-03-21', 'son',           'active'],
      ['BEN-009', 'FAM-006', 'Fatima Al-Mansour',   '2005-10-09', 'granddaughter', 'minor'],
      ['BEN-010', 'FAM-008', 'Anders Lindqvist',    '1979-05-27', 'son',           'active'],
      ['BEN-011', 'FAM-009', 'Camille Bouchard',    '1993-08-14', 'daughter',      'active'],
      ['BEN-012', 'FAM-010', 'Wei Ling Chen',       '1998-01-26', 'daughter',      'active'],
      ['BEN-013', 'FAM-011', 'Hamish McKinnon',     '2002-09-11', 'son',           'active'],
      ['BEN-014', 'FAM-013', 'Yuki Tanaka',         '2010-04-07', 'granddaughter', 'minor'],
      ['BEN-015', 'FAM-015', 'Charlotte Whitfield', '1968-11-30', 'daughter',      'active'],
    ];
    for (const b of beneficiaries) {
      await client.query(
        `INSERT INTO beneficiaries (ben_id,family_id,name,dob,relationship,status) VALUES ($1,$2,$3,$4,$5,$6)`, b
      );
    }

    // ──────────────────────────────────────────────
    // illiquid_assets
    // ──────────────────────────────────────────────
    console.log('[seed] inserting illiquid_assets...');
    const illiquid = [
      ['ILA-001', 'FAM-001', 'private operating company',  185000000, '2026-01-15', 'Vandermeer Holdings LLC',     'held'],
      ['ILA-002', 'FAM-001', 'vineyard estate',             24000000, '2025-11-04', 'Sonoma Heritage Trust',       'held'],
      ['ILA-003', 'FAM-002', 'shipping fleet stake',       340000000, '2026-02-20', 'Maritime Holdings BVI',       'held'],
      ['ILA-004', 'FAM-003', 'ancestral land tract',        56000000, '2025-09-12', 'Hanazawa Land Co Ltd',        'held'],
      ['ILA-005', 'FAM-004', 'industrial machinery patents',45000000, '2026-03-08', 'Rosenthal IP Holdings',       'held'],
      ['ILA-006', 'FAM-005', 'wine cellar (Bordeaux)',      18000000, '2026-01-29', 'Sotheby\'s Geneva',           'verified'],
      ['ILA-007', 'FAM-006', 'aircraft (Gulfstream G700)',  78000000, '2025-12-15', 'NetJets Mgmt',                'held'],
      ['ILA-008', 'FAM-007', 'yacht (Feadship 95m)',       195000000, '2026-02-11', 'Monaco Yacht Services',       'held'],
      ['ILA-009', 'FAM-008', 'forestry holdings',           72000000, '2025-10-22', 'Scandinavian Forestry AB',    'held'],
      ['ILA-010', 'FAM-009', 'Burgundy domaine',            36000000, '2026-03-15', 'Domaine Comte de Vogüé',      'held'],
      ['ILA-011', 'FAM-010', 'plantation (palm oil)',       88000000, '2025-11-30', 'Asia Plantation Trust',       'held'],
      ['ILA-012', 'FAM-012', 'cattle ranch (50k hectare)',  42000000, '2026-01-08', 'Pampa Agro Holdings',         'held'],
      ['ILA-013', 'FAM-013', 'temple-adjacent land',        29000000, '2025-12-04', 'Kyoto Heritage Foundation',   'verified'],
      ['ILA-014', 'FAM-014', 'tulip-bulb breeding patents', 14000000, '2026-02-25', 'Van der Berg Hortus BV',      'held'],
      ['ILA-015', 'FAM-015', 'race-horse breeding stock',   62000000, '2026-03-19', 'Coolmore Stud Florida',       'held'],
    ];
    for (const a of illiquid) {
      await client.query(
        `INSERT INTO illiquid_assets (asset_id,family_id,type,valuation_usd,valued_at,custodian,status) VALUES ($1,$2,$3,$4,$5,$6,$7)`, a
      );
    }

    // ──────────────────────────────────────────────
    // holdings
    // ──────────────────────────────────────────────
    console.log('[seed] inserting holdings...');
    const holdings = [
      ['HLD-001', 'FAM-001', 'AAPL',         42000,   8400000, 'Northern Trust 001',    'open'],
      ['HLD-002', 'FAM-001', 'BRK.B',        18000,   7200000, 'Northern Trust 001',    'open'],
      ['HLD-003', 'FAM-002', 'MSFT',         75000,  31500000, 'JPM Private Bank',      'open'],
      ['HLD-004', 'FAM-003', 'TYO:7203',     220000,  4400000, 'Nomura Wealth',         'open'],
      ['HLD-005', 'FAM-004', 'NESN.SW',      90000,  10800000, 'Pictet WM',             'open'],
      ['HLD-006', 'FAM-005', 'ENI.MI',       180000,  3060000, 'BSI Private Bank',      'open'],
      ['HLD-007', 'FAM-006', 'EMAAR.DU',    2400000,  3120000, 'Emirates NBD PB',       'open'],
      ['HLD-008', 'FAM-008', 'VOLV-B.ST',    140000,  2940000, 'Carnegie WM',           'open'],
      ['HLD-009', 'FAM-009', 'MC.PA',        12000,   8520000, 'Rothschild & Co',       'open'],
      ['HLD-010', 'FAM-010', 'D05.SI',       110000,  2860000, 'DBS Private Bank',      'open'],
      ['HLD-011', 'FAM-011', 'LLOY.L',      1800000,  1080000, 'Adam & Co',             'open'],
      ['HLD-012', 'FAM-012', 'PETR4.SA',     420000,  3486000, 'Itaú Private Bank',     'open'],
      ['HLD-013', 'FAM-013', 'TYO:6758',      45000,  4275000, 'Nomura Trust',          'open'],
      ['HLD-014', 'FAM-014', 'ASML.AS',       12000,   8400000, 'Van Lanschot Kempen',  'open'],
      ['HLD-015', 'FAM-015', 'GOOGL',         18000,   2880000, 'Bessemer Trust',       'open'],
    ];
    for (const h of holdings) {
      await client.query(
        `INSERT INTO holdings (holding_id,family_id,security,qty,value_usd,account,status) VALUES ($1,$2,$3,$4,$5,$6,$7)`, h
      );
    }

    // ──────────────────────────────────────────────
    // advisors
    // ──────────────────────────────────────────────
    console.log('[seed] inserting advisors...');
    const advisors = [
      ['ADV-001', 'Catherine Holloway',   'Northern Trust',          'estate planning',          'FAM-001', 'active'],
      ['ADV-002', 'Olawale Adebayo',      'JPM Private Bank',        'cross-border tax',         'FAM-002', 'active'],
      ['ADV-003', 'Kenji Watanabe',       'Nomura Wealth',           'Japanese succession law',  'FAM-003', 'active'],
      ['ADV-004', 'Petra Bührer',         'Pictet Wealth Management','charitable structures',    'FAM-004', 'active'],
      ['ADV-005', 'Stefano Ricci',        'BSI Private Bank',        'Italian fiduciary',        'FAM-005', 'active'],
      ['ADV-006', 'Layla Al-Hashimi',     'Emirates NBD PB',         'Sharia-compliant wealth',  'FAM-006', 'active'],
      ['ADV-007', 'Yves Marchand',        'Crédit Mutuel Monaco',    'Monaco residency',         'FAM-007', 'review'],
      ['ADV-008', 'Astrid Lundgren',      'Carnegie Trustees',       'Nordic family law',        'FAM-008', 'active'],
      ['ADV-009', 'Henri Lefèvre',        'Rothschild & Co',         'philanthropy',             'FAM-009', 'active'],
      ['ADV-010', 'Tan Wei Ming',         'DBS Private Bank',        'Singapore VCC',            'FAM-010', 'active'],
      ['ADV-011', 'Iain Sutherland',      'Adam & Co',               'Scots law trusts',         'FAM-011', 'active'],
      ['ADV-012', 'Beatriz Almeida',      'Itaú Private Bank',       'LatAm cross-border',       'FAM-012', 'active'],
      ['ADV-013', 'Naoko Sato',           'Nomura Trust',            'education planning',       'FAM-013', 'active'],
      ['ADV-014', 'Wouter de Vries',      'Van Lanschot Kempen',     'Dutch stichting',          'FAM-014', 'active'],
      ['ADV-015', 'Margaret Whitfield',   'Bessemer Trust',          'GST dynasty planning',     'FAM-015', 'active'],
    ];
    for (const a of advisors) {
      await client.query(
        `INSERT INTO advisors (advisor_id,name,firm,specialty,family_id,status) VALUES ($1,$2,$3,$4,$5,$6)`, a
      );
    }

    // ──────────────────────────────────────────────
    // governance_docs
    // ──────────────────────────────────────────────
    console.log('[seed] inserting governance_docs...');
    const govdocs = [
      ['GOV-001', 'FAM-001', 'family constitution',         'v3.2', '2026-01-12', 'active'],
      ['GOV-002', 'FAM-001', 'investment policy statement', 'v2.0', '2025-11-04', 'active'],
      ['GOV-003', 'FAM-002', 'family charter',              'v4.1', '2026-02-18', 'active'],
      ['GOV-004', 'FAM-003', 'succession bylaws',           'v1.5', '2025-09-21', 'active'],
      ['GOV-005', 'FAM-004', 'philanthropy policy',         'v2.3', '2026-01-30', 'active'],
      ['GOV-006', 'FAM-005', 'education policy',            'v1.2', '2025-12-08', 'active'],
      ['GOV-007', 'FAM-006', 'Sharia governance memo',      'v1.0', '2026-03-04', 'active'],
      ['GOV-008', 'FAM-008', 'family council charter',      'v2.1', '2025-10-25', 'active'],
      ['GOV-009', 'FAM-009', 'IPS — global mandate',        'v3.0', '2026-02-09', 'active'],
      ['GOV-010', 'FAM-010', 'family constitution',         'v1.4', '2025-11-19', 'active'],
      ['GOV-011', 'FAM-011', 'trustee succession protocol', 'v2.0', '2026-01-22', 'active'],
      ['GOV-012', 'FAM-012', 'Brazilian fdn bylaws',        'v1.3', '2025-12-15', 'review'],
      ['GOV-013', 'FAM-013', 'education trust bylaws',      'v1.1', '2026-02-26', 'active'],
      ['GOV-014', 'FAM-014', 'stichting administration',    'v3.4', '2025-10-10', 'active'],
      ['GOV-015', 'FAM-015', 'GST dynasty bylaws',          'v4.2', '2026-03-12', 'active'],
    ];
    for (const g of govdocs) {
      await client.query(
        `INSERT INTO governance_docs (doc_id,family_id,type,version,effective_date,status) VALUES ($1,$2,$3,$4,$5,$6)`, g
      );
    }

    // ──────────────────────────────────────────────
    // distributions
    // ──────────────────────────────────────────────
    console.log('[seed] inserting distributions...');
    const distributions = [
      ['DIS-001', 'TRU-001', 'BEN-001', 1800000, '2026-Q1', 'paid'],
      ['DIS-002', 'TRU-001', 'BEN-002', 1200000, '2026-Q1', 'paid'],
      ['DIS-003', 'TRU-001', 'BEN-003',  240000, '2026-Q1', 'paid'],
      ['DIS-004', 'TRU-003', 'BEN-004', 3600000, '2026-Q1', 'paid'],
      ['DIS-005', 'TRU-003', 'BEN-005', 1800000, '2026-Q1', 'paid'],
      ['DIS-006', 'TRU-004', 'BEN-006', 1450000, '2026-Q1', 'paid'],
      ['DIS-007', 'TRU-005', 'BEN-007',  920000, '2026-Q1', 'scheduled'],
      ['DIS-008', 'TRU-006', 'BEN-008',  180000, '2026-Q1', 'paid'],
      ['DIS-009', 'TRU-007', 'BEN-009',  720000, '2026-Q1', 'scheduled'],
      ['DIS-010', 'TRU-008', 'BEN-010',  340000, '2026-Q1', 'paid'],
      ['DIS-011', 'TRU-009', 'BEN-011',  560000, '2026-Q1', 'scheduled'],
      ['DIS-012', 'TRU-010', 'BEN-012',  840000, '2026-Q1', 'paid'],
      ['DIS-013', 'TRU-011', 'BEN-013',  120000, '2026-Q1', 'paid'],
      ['DIS-014', 'TRU-013', 'BEN-014',   95000, '2026-Q1', 'paid'],
      ['DIS-015', 'TRU-015', 'BEN-015', 4200000, '2026-Q1', 'scheduled'],
    ];
    for (const d of distributions) {
      await client.query(
        `INSERT INTO distributions (dist_id,trust_id,beneficiary_id,amount_usd,period,status) VALUES ($1,$2,$3,$4,$5,$6)`, d
      );
    }

    // ──────────────────────────────────────────────
    // tax_filings
    // ──────────────────────────────────────────────
    console.log('[seed] inserting tax_filings...');
    const taxFilings = [
      ['TAX-001', 'FAM-001', 2025, 'Form 1041 (trust income)',         'filed',    '2025-04-12 14:30+00'],
      ['TAX-002', 'FAM-001', 2025, 'Form 709 (gift tax)',              'filed',    '2025-04-10 10:00+00'],
      ['TAX-003', 'FAM-002', 2025, 'UK trust SA900',                   'filed',    '2025-10-31 16:00+00'],
      ['TAX-004', 'FAM-003', 2025, 'JP inheritance return',            'draft',    null],
      ['TAX-005', 'FAM-004', 2025, 'CH wealth tax (ZH)',               'filed',    '2025-03-31 09:00+00'],
      ['TAX-006', 'FAM-005', 2025, 'IT IRES + IRAP',                   'filed',    '2025-09-30 11:00+00'],
      ['TAX-007', 'FAM-006', 2025, 'DIFC zero-tax confirmation',       'filed',    '2025-12-15 08:00+00'],
      ['TAX-008', 'FAM-008', 2025, 'SE inkomstdeklaration',            'filed',    '2025-05-02 13:00+00'],
      ['TAX-009', 'FAM-009', 2025, 'FR ISF / IFI return',              'review',   null],
      ['TAX-010', 'FAM-010', 2025, 'SG Form C-S (VCC)',                'filed',    '2025-11-30 15:00+00'],
      ['TAX-011', 'FAM-011', 2025, 'UK SA900 + Scots variations',      'filed',    '2025-10-28 12:00+00'],
      ['TAX-012', 'FAM-012', 2025, 'BR DIRPF + fundação',              'draft',    null],
      ['TAX-013', 'FAM-013', 2025, 'JP trust return',                  'filed',    '2025-03-15 09:30+00'],
      ['TAX-014', 'FAM-014', 2025, 'NL inkomstenbelasting box 2',      'filed',    '2025-04-30 14:00+00'],
      ['TAX-015', 'FAM-015', 2025, 'Form 706 (estate)',                'draft',    null],
    ];
    for (const t of taxFilings) {
      await client.query(
        `INSERT INTO tax_filings (filing_id,family_id,year,type,status,filed_at) VALUES ($1,$2,$3,$4,$5,$6)`, t
      );
    }

    // ──────────────────────────────────────────────
    // charitable_gifts
    // ──────────────────────────────────────────────
    console.log('[seed] inserting charitable_gifts...');
    const gifts = [
      ['GFT-001', 'FAM-001', 'Yale University endowment',           5000000, 'DAF',        '2025-12-08 10:00+00', 'completed'],
      ['GFT-002', 'FAM-001', 'Memorial Sloan Kettering Cancer Ctr', 2500000, 'CLT',        '2025-11-22 11:00+00', 'completed'],
      ['GFT-003', 'FAM-002', 'African Wildlife Foundation',          900000, 'direct',     '2026-01-14 09:30+00', 'completed'],
      ['GFT-004', 'FAM-003', 'Kyoto Heritage Preservation Trust',   1200000, 'CRUT',       '2026-02-20 13:00+00', 'completed'],
      ['GFT-005', 'FAM-004', 'Médecins Sans Frontières',            3400000, 'DAF',        '2025-12-30 15:00+00', 'completed'],
      ['GFT-006', 'FAM-005', 'Fondazione Castellano',               1800000, 'foundation', '2026-03-04 10:00+00', 'completed'],
      ['GFT-007', 'FAM-006', 'Dubai Cares education',               2200000, 'direct',     '2026-02-09 14:00+00', 'completed'],
      ['GFT-008', 'FAM-008', 'WWF Sweden marine program',            560000, 'DAF',        '2025-11-30 11:30+00', 'completed'],
      ['GFT-009', 'FAM-009', 'Fondation de France — arts',          1450000, 'CLT',        '2026-01-20 12:00+00', 'completed'],
      ['GFT-010', 'FAM-010', 'SOS Children\'s Villages Singapore',   720000, 'DAF',        '2025-12-15 09:00+00', 'completed'],
      ['GFT-011', 'FAM-011', 'Scottish National Trust',              340000, 'direct',     '2026-02-26 14:30+00', 'completed'],
      ['GFT-012', 'FAM-012', 'Instituto Ayrton Senna',               480000, 'foundation', '2026-03-12 10:00+00', 'pending'],
      ['GFT-013', 'FAM-013', 'Tokyo Symphony Orchestra',             280000, 'direct',     '2025-12-22 16:00+00', 'completed'],
      ['GFT-014', 'FAM-014', 'Rijksmuseum acquisitions fund',       1900000, 'CLT',        '2026-01-08 11:00+00', 'completed'],
      ['GFT-015', 'FAM-015', 'Whitfield Family Foundation',         8500000, 'foundation', '2026-02-14 13:30+00', 'completed'],
    ];
    for (const g of gifts) {
      await client.query(
        `INSERT INTO charitable_gifts (gift_id,family_id,recipient,amount_usd,vehicle,ts,status) VALUES ($1,$2,$3,$4,$5,$6,$7)`, g
      );
    }

    // ──────────────────────────────────────────────
    // education_grants
    // ──────────────────────────────────────────────
    console.log('[seed] inserting education_grants...');
    const eduGrants = [
      ['EDU-001', 'BEN-003', 'Phillips Academy Andover',  85000, 2026, 'approved'],
      ['EDU-002', 'BEN-009', 'Choate Rosemary Hall',      72000, 2026, 'approved'],
      ['EDU-003', 'BEN-014', 'Doshisha International',    42000, 2026, 'approved'],
      ['EDU-004', 'BEN-013', 'University of St Andrews',  38000, 2026, 'approved'],
      ['EDU-005', 'BEN-012', 'INSEAD MBA',                95000, 2026, 'approved'],
      ['EDU-006', 'BEN-011', 'Sciences Po Paris',         16000, 2026, 'approved'],
      ['EDU-007', 'BEN-008', 'Bocconi University',        22000, 2026, 'approved'],
      ['EDU-008', 'BEN-010', 'Stockholm School of Econ',  20000, 2026, 'approved'],
      ['EDU-009', 'BEN-005', 'London School of Economics',55000, 2026, 'approved'],
      ['EDU-010', 'BEN-007', 'ETH Zürich',                28000, 2026, 'approved'],
      ['EDU-011', 'BEN-002', 'Harvard Business School',  102000, 2026, 'paid'],
      ['EDU-012', 'BEN-004', 'Cambridge Judge MBA',       88000, 2026, 'pending'],
      ['EDU-013', 'BEN-006', 'Keio University',           18000, 2026, 'paid'],
      ['EDU-014', 'BEN-015', 'Stanford GSB executive ed', 48000, 2026, 'approved'],
      ['EDU-015', 'BEN-001', 'Oxford continuing studies', 12000, 2026, 'paid'],
    ];
    for (const e of eduGrants) {
      await client.query(
        `INSERT INTO education_grants (grant_id,beneficiary_id,school,amount_usd,year,status) VALUES ($1,$2,$3,$4,$5,$6)`, e
      );
    }

    // ──────────────────────────────────────────────
    // real_estate
    // ──────────────────────────────────────────────
    console.log('[seed] inserting real_estate...');
    const realEstate = [
      ['RE-001', 'FAM-001', '142 Round Hill Rd, Greenwich, CT',         'residence',      28000000, 'held'],
      ['RE-002', 'FAM-001', 'Park Avenue triplex, Manhattan, NY',       'residence',      42000000, 'held'],
      ['RE-003', 'FAM-002', 'Eaton Square mansion, London, UK',         'residence',      85000000, 'held'],
      ['RE-004', 'FAM-003', 'Roppongi tower penthouse, Tokyo, JP',      'residence',      18000000, 'held'],
      ['RE-005', 'FAM-004', 'Goldküste lake estate, Zürich, CH',        'residence',      36000000, 'held'],
      ['RE-006', 'FAM-005', 'Lake Como villa, Bellagio, IT',            'residence',      24000000, 'held'],
      ['RE-007', 'FAM-006', 'Palm Jumeirah villa, Dubai, AE',           'residence',      52000000, 'held'],
      ['RE-008', 'FAM-007', 'Monte Carlo penthouse, MC',                'residence',      78000000, 'held'],
      ['RE-009', 'FAM-008', 'Östermalm townhouse, Stockholm, SE',       'residence',      14000000, 'held'],
      ['RE-010', 'FAM-009', '7e arrondissement hôtel particulier, FR',  'residence',      46000000, 'held'],
      ['RE-011', 'FAM-010', 'Sentosa Cove bungalow, Singapore, SG',     'residence',      32000000, 'held'],
      ['RE-012', 'FAM-011', 'Edinburgh New Town terrace, UK',           'residence',       8500000, 'held'],
      ['RE-013', 'FAM-012', 'Jardins penthouse, São Paulo, BR',         'residence',      11000000, 'held'],
      ['RE-014', 'FAM-013', 'Higashiyama machiya, Kyoto, JP',           'residence',       6800000, 'held'],
      ['RE-015', 'FAM-015', 'Mar-a-Lago adjacent estate, Palm Beach',   'residence',     112000000, 'held'],
    ];
    for (const r of realEstate) {
      await client.query(
        `INSERT INTO real_estate (re_id,family_id,address,type,value_usd,status) VALUES ($1,$2,$3,$4,$5,$6)`, r
      );
    }

    // ──────────────────────────────────────────────
    // art_collection
    // ──────────────────────────────────────────────
    console.log('[seed] inserting art_collection...');
    const art = [
      ['ART-001', 'FAM-001', 'Mark Rothko',         'Untitled (Yellow on Orange) 1957',     18500000, "Sotheby's NY 2014; private collection 1957-2014",            'verified'],
      ['ART-002', 'FAM-001', 'Andy Warhol',         'Marilyn Diptych (variant) 1962',       42000000, "Acquired Christie's NY 2018; Castelli Gallery provenance",   'verified'],
      ['ART-003', 'FAM-002', 'Pablo Picasso',       'Femme assise (1937)',                  68000000, "Provenance documented 1937→present; Berggruen catalog",      'verified'],
      ['ART-004', 'FAM-003', 'Hokusai',             'The Great Wave (1831 first state)',     6500000, "Mitsui collection 1890-1980; private since",                 'verified'],
      ['ART-005', 'FAM-004', 'Paul Klee',           'Senecio (1922)',                       12000000, "Kunstmuseum Bern long-loan; deaccessioned 1998",             'verified'],
      ['ART-006', 'FAM-005', 'Caravaggio (attr.)',  'Boy with a Basket of Fruit (workshop)', 8200000, "Borghese collection; doubts about attribution remain",       'review'],
      ['ART-007', 'FAM-006', 'Jeff Koons',          'Balloon Dog (Yellow)',                 22000000, "Gagosian Gallery 2013; one of five",                         'verified'],
      ['ART-008', 'FAM-008', 'Anders Zorn',         'Sommarnöje (1886)',                     2400000, "Bukowskis Stockholm 2009",                                    'verified'],
      ['ART-009', 'FAM-009', 'Claude Monet',        'Nymphéas (1916)',                      54000000, "Galerie Bernheim-Jeune 1920; Bouchard family since 1955",    'verified'],
      ['ART-010', 'FAM-010', 'Liu Ye',              'Composition with Hello Kitty (2010)',   2800000, "Sotheby's HK 2019",                                          'verified'],
      ['ART-011', 'FAM-011', 'Henry Raeburn',       'Reverend Robert Walker Skating',        1600000, "Estate of Lord McKinnon 1962; Christie's Edinburgh 1995",    'verified'],
      ['ART-012', 'FAM-012', 'Tarsila do Amaral',   'Abaporu (study)',                       4800000, "Pereira collection since 1973",                              'verified'],
      ['ART-013', 'FAM-013', 'Yayoi Kusama',        'Infinity Pumpkin (mirrored)',           3200000, "David Zwirner Gallery 2017",                                  'verified'],
      ['ART-014', 'FAM-014', 'Vincent van Gogh',    'Still Life with Tulips (workshop)',     7500000, "Disputed attribution — Bonger archive 1925",                 'review'],
      ['ART-015', 'FAM-015', 'John Singer Sargent', 'Madame X (study)',                      9800000, "Whitfield family since 1932; never publicly exhibited",      'verified'],
    ];
    for (const a of art) {
      await client.query(
        `INSERT INTO art_collection (art_id,family_id,artist,work,value_usd,provenance,status) VALUES ($1,$2,$3,$4,$5,$6,$7)`, a
      );
    }

    // ──────────────────────────────────────────────
    // private_investments
    // ──────────────────────────────────────────────
    console.log('[seed] inserting private_investments...');
    const privateInvest = [
      ['PI-001',  'FAM-001', 'Sequoia Capital XXIV',           50000000, 30000000, 'active'],
      ['PI-002',  'FAM-001', 'Blackstone GP Stakes V',         40000000, 22000000, 'active'],
      ['PI-003',  'FAM-002', 'Apollo Strategic Origination',   75000000, 55000000, 'active'],
      ['PI-004',  'FAM-003', 'Advantage Partners VI',          30000000, 18000000, 'active'],
      ['PI-005',  'FAM-004', 'Partners Group Direct Equity',   45000000, 32000000, 'active'],
      ['PI-006',  'FAM-005', 'Investindustrial VIII',          22000000, 12000000, 'active'],
      ['PI-007',  'FAM-006', 'Mubadala Investment Co — coinv', 80000000, 60000000, 'active'],
      ['PI-008',  'FAM-008', 'EQT XI',                         28000000, 16000000, 'active'],
      ['PI-009',  'FAM-009', 'PAI Partners VIII',              35000000, 21000000, 'active'],
      ['PI-010',  'FAM-010', 'Bain Capital Asia V',            42000000, 28000000, 'active'],
      ['PI-011',  'FAM-011', 'Inflexion Buyout VII',           14000000,  8000000, 'active'],
      ['PI-012',  'FAM-012', 'Patria Brazilian PE VI',         18000000, 11000000, 'active'],
      ['PI-013',  'FAM-013', 'Tokio Marine Capital IV',        20000000, 13000000, 'active'],
      ['PI-014',  'FAM-014', 'Waterland Private Equity VIII',  32000000, 19000000, 'active'],
      ['PI-015',  'FAM-015', 'KKR North America XIII',         90000000, 62000000, 'active'],
    ];
    for (const p of privateInvest) {
      await client.query(
        `INSERT INTO private_investments (pi_id,family_id,fund,commitment_usd,called_usd,status) VALUES ($1,$2,$3,$4,$5,$6)`, p
      );
    }

    // ──────────────────────────────────────────────
    // lp_interests
    // ──────────────────────────────────────────────
    console.log('[seed] inserting lp_interests...');
    const lpInterests = [
      ['LP-001',  'FAM-001', 'Bridgewater Pure Alpha II',    2018, 30000000, 42000000, 'active'],
      ['LP-002',  'FAM-001', 'Renaissance Inst Equities',    2020, 25000000, 38000000, 'active'],
      ['LP-003',  'FAM-002', 'Brevan Howard Master',         2019, 45000000, 58000000, 'active'],
      ['LP-004',  'FAM-003', 'Element Capital',              2021, 20000000, 26000000, 'active'],
      ['LP-005',  'FAM-004', 'Brevan Howard Macro',          2018, 28000000, 41000000, 'active'],
      ['LP-006',  'FAM-005', 'Lansdowne Developed Markets',  2017, 15000000, 19000000, 'active'],
      ['LP-007',  'FAM-006', 'Citadel Wellington',           2020, 60000000, 88000000, 'active'],
      ['LP-008',  'FAM-008', 'Brummer Multi-Strategy',       2019, 18000000, 24000000, 'active'],
      ['LP-009',  'FAM-009', 'Tikehau Special Opportunities',2022, 22000000, 27000000, 'active'],
      ['LP-010',  'FAM-010', 'Dymon Asia Macro',             2021, 28000000, 35000000, 'active'],
      ['LP-011',  'FAM-011', 'Marshall Wace TOPS',           2019, 12000000, 16000000, 'active'],
      ['LP-012',  'FAM-012', 'Verde Asset Management',       2020,  9000000, 11500000, 'active'],
      ['LP-013',  'FAM-013', 'Nezu Asia Capital',            2018, 14000000, 19000000, 'active'],
      ['LP-014',  'FAM-014', 'Aspect Diversified Trends',    2021, 16000000, 18000000, 'active'],
      ['LP-015',  'FAM-015', 'Two Sigma Compass',            2017, 75000000, 132000000,'active'],
    ];
    for (const l of lpInterests) {
      await client.query(
        `INSERT INTO lp_interests (lp_id,family_id,fund,vintage,commitment_usd,nav_usd,status) VALUES ($1,$2,$3,$4,$5,$6,$7)`, l
      );
    }

    // ──────────────────────────────────────────────
    // succession_plans
    // ──────────────────────────────────────────────
    console.log('[seed] inserting succession_plans...');
    const succession = [
      ['SUC-001', 'FAM-001', 'v5.2', 'Eleanor V., James V., trustees Northern Trust',          '2026-01-18', 'active'],
      ['SUC-002', 'FAM-002', 'v3.1', 'Adaeze O., Chukwuemeka O., JPM PB trustees',             '2026-02-04', 'active'],
      ['SUC-003', 'FAM-003', 'v2.7', 'Hiroshi H., siblings, Sumitomo trustees',                '2025-09-30', 'active'],
      ['SUC-004', 'FAM-004', 'v4.3', 'Rosenthal council of three, Pictet co-trustee',          '2026-01-25', 'active'],
      ['SUC-005', 'FAM-005', 'v2.5', 'Marco C., siblings, Castellano family council',          '2025-12-12', 'active'],
      ['SUC-006', 'FAM-006', 'v1.8', 'Al-Mansour patriarch + 4 sons, DIFC trustees',           '2026-03-08', 'active'],
      ['SUC-007', 'FAM-007', 'v1.2', 'Petrov widow + 2 children, Monaco trustees',             '2025-11-15', 'review'],
      ['SUC-008', 'FAM-008', 'v3.6', 'Lindqvist sibling council (G3), Carnegie co-trustee',    '2026-02-19', 'active'],
      ['SUC-009', 'FAM-009', 'v4.1', 'Bouchard branches A/B/C, Rothschild trustees',           '2026-01-08', 'active'],
      ['SUC-010', 'FAM-010', 'v2.3', 'Chen patriarch + 3 children, DBS PB trustees',           '2025-10-22', 'active'],
      ['SUC-011', 'FAM-011', 'v3.4', 'McKinnon trustees (Scots law), Adam & Co',               '2026-02-26', 'active'],
      ['SUC-012', 'FAM-012', 'v1.6', 'Pereira foundation board, Itaú PB co-trustee',           '2025-11-30', 'active'],
      ['SUC-013', 'FAM-013', 'v2.0', 'Tanaka eldest son line, Nomura Trust co-trustee',        '2026-01-14', 'active'],
      ['SUC-014', 'FAM-014', 'v4.5', 'van der Berg stichting board (5 members)',               '2025-12-04', 'active'],
      ['SUC-015', 'FAM-015', 'v6.1', 'Whitfield 11-member council, Bessemer co-trustee',       '2026-03-15', 'active'],
    ];
    for (const s of succession) {
      await client.query(
        `INSERT INTO succession_plans (plan_id,family_id,version,signatories,effective_date,status) VALUES ($1,$2,$3,$4,$5,$6)`, s
      );
    }

    // ──────────────────────────────────────────────
    // valuation_reports
    // ──────────────────────────────────────────────
    console.log('[seed] inserting valuation_reports...');
    const valuations = [
      ['VAL-001', 'ILA-001', 'Houlihan Lokey',         185000000, '2026-01-15', 'final'],
      ['VAL-002', 'ILA-002', 'Christie\'s Real Estate', 24000000, '2025-11-04', 'final'],
      ['VAL-003', 'ILA-003', 'BRS Maritime',           340000000, '2026-02-20', 'final'],
      ['VAL-004', 'ILA-004', 'Nomura Real Estate',      56000000, '2025-09-12', 'final'],
      ['VAL-005', 'ILA-005', 'Duff & Phelps IP',        45000000, '2026-03-08', 'final'],
      ['VAL-006', 'ILA-006', 'Sotheby\'s Wine Dept',    18000000, '2026-01-29', 'final'],
      ['VAL-007', 'ILA-007', 'Aerion Aircraft Valuers', 78000000, '2025-12-15', 'final'],
      ['VAL-008', 'ILA-008', 'Camper & Nicholsons',    195000000, '2026-02-11', 'final'],
      ['VAL-009', 'ILA-009', 'Pöyry Forestry',          72000000, '2025-10-22', 'final'],
      ['VAL-010', 'ILA-010', 'Vinatis Valuation',       36000000, '2026-03-15', 'final'],
      ['VAL-011', 'ILA-011', 'CBRE Plantations',        88000000, '2025-11-30', 'final'],
      ['VAL-012', 'ILA-012', 'Pampa Agro Valuation',    42000000, '2026-01-08', 'draft'],
      ['VAL-013', 'ILA-013', 'Kyoto Land Surveyors',    29000000, '2025-12-04', 'final'],
      ['VAL-014', 'ILA-014', 'Wageningen IP Group',     14000000, '2026-02-25', 'final'],
      ['VAL-015', 'ILA-015', 'Bloodstock Research IS',  62000000, '2026-03-19', 'final'],
    ];
    for (const v of valuations) {
      await client.query(
        `INSERT INTO valuation_reports (val_id,asset_id,valuer,value_usd,valued_at,status) VALUES ($1,$2,$3,$4,$5,$6)`, v
      );
    }

    // ──────────────────────────────────────────────
    // audit_log
    // ──────────────────────────────────────────────
    console.log('[seed] inserting audit_log...');
    const auditLog = [
      ['AUD-001', 'admin@familyoffice.io',   'TRU-001', 'distribution.approve',  'success', '2026-03-15 10:14+00'],
      ['AUD-002', 'advisor@familyoffice.io', 'FAM-002', 'tax-filing.submit',     'success', '2025-10-31 16:00+00'],
      ['AUD-003', 'admin@familyoffice.io',   'TRU-007', 'distribution.schedule', 'success', '2026-02-09 09:30+00'],
      ['AUD-004', 'advisor@familyoffice.io', 'FAM-004', 'governance.update',     'success', '2026-01-30 11:45+00'],
      ['AUD-005', 'advisor@familyoffice.io', 'ART-014', 'provenance.flag',       'review',  '2026-02-25 14:00+00'],
      ['AUD-006', 'admin@familyoffice.io',   'FAM-015', 'succession.update',     'success', '2026-03-15 09:00+00'],
      ['AUD-007', 'viewer@familyoffice.io',  'FAM-001', 'report.view',           'success', '2026-03-12 13:22+00'],
      ['AUD-008', 'advisor@familyoffice.io', 'GFT-012', 'gift.pending',          'pending', '2026-03-12 10:00+00'],
      ['AUD-009', 'admin@familyoffice.io',   'TAX-015', 'estate-return.draft',   'draft',   '2026-03-10 16:00+00'],
      ['AUD-010', 'advisor@familyoffice.io', 'EDU-012', 'grant.request',         'pending', '2026-03-09 11:30+00'],
      ['AUD-011', 'admin@familyoffice.io',   'PI-007',  'capital-call.record',   'success', '2026-03-08 09:00+00'],
      ['AUD-012', 'advisor@familyoffice.io', 'LP-015',  'nav.update',            'success', '2026-03-05 14:30+00'],
      ['AUD-013', 'admin@familyoffice.io',   'ILA-012', 'valuation.draft',       'review',  '2026-03-04 10:00+00'],
      ['AUD-014', 'advisor@familyoffice.io', 'FAM-006', 'sharia-memo.update',    'success', '2026-03-04 08:15+00'],
      ['AUD-015', 'admin@familyoffice.io',   'TRU-015', 'dynasty-review.start',  'success', '2026-03-01 09:00+00'],
    ];
    for (const a of auditLog) {
      await client.query(
        `INSERT INTO audit_log (entry_id,actor,target,action,result,ts) VALUES ($1,$2,$3,$4,$5,$6)`, a
      );
    }

    // ──────────────────────────────────────────────
    // RBAC users
    // ──────────────────────────────────────────────
    console.log('[seed] inserting users...');
    const tenantId = process.env.SEED_TENANT_ID || 'family-office-demo';
    const users = [
      ['admin@familyoffice.io',   hashPassword(process.env.DEMO_ADMIN_PASSWORD || 'FamilyOfficeAdmin123!'),   'Family Office Admin', 'admin'],
      ['advisor@familyoffice.io', hashPassword(process.env.DEMO_MANAGER_PASSWORD || 'FamilyOfficeAdvisor123!'), 'Senior Advisor',      'advisor'],
      ['viewer@familyoffice.io',  hashPassword(process.env.DEMO_VIEWER_PASSWORD || 'FamilyOfficeViewer123!'),  'Family Viewer',        'viewer'],
    ];
    for (const u of users) {
      await client.query(
        `INSERT INTO users (email,password_hash,name,role,tenant_id) VALUES ($1,$2,$3,$4,$5)`,
        [...u, tenantId]
      );
    }

    // ──────────────────────────────────────────────
    // Notifications
    // ──────────────────────────────────────────────
    console.log('[seed] inserting notifications...');
    const notifications = [
      [1, 'Estate tax filing draft ready',     'Form 706 draft prepared for Whitfield Family — sign-off requested',  'high',    'tax_filings'],
      [1, 'Capital call — KKR North America',  '$8.2M capital call due in 14 days (FAM-015)',                        'medium',  'private_investments'],
      [1, 'Art provenance flag',               'van Gogh "Still Life with Tulips" attribution under review',         'high',    'art_collection'],
      [2, 'Distribution schedule due',         'Q2 distributions to BEN-007 require trustee approval',               'medium',  'distributions'],
      [2, 'Governance review',                 'Pereira foundation bylaws v1.3 due for council review',              'medium',  'governance_docs'],
    ];
    for (const n of notifications) {
      await client.query(
        `INSERT INTO notifications (user_id,title,body,severity,source) VALUES ($1,$2,$3,$4,$5)`, n
      );
    }

    // ──────────────────────────────────────────────
    // Webhooks
    // ──────────────────────────────────────────────
    console.log('[seed] inserting webhooks...');
    const webhooks = [
      ['Trustee Notifier',  'https://httpbin.org/post', 'sec_trustee_2026',  'distribution.created,distribution.approved', true],
      ['Tax Counsel Bridge','https://httpbin.org/post', 'sec_taxbridge_2026','tax_filing.created,tax_filing.review',       true],
    ];
    for (const w of webhooks) {
      await client.query(
        `INSERT INTO webhooks (name,url,secret,events,active) VALUES ($1,$2,$3,$4,$5)`, w
      );
    }

    // ──────────────────────────────────────────────
    // Family missions + milestones (Apply pass 7)
    // ──────────────────────────────────────────────
    console.log('[seed] inserting family missions...');
    const missions = [
      ['MIS-001', 'FAM-001', 'Stewardship through 2050',          'Preserve and grow Vandermeer principal across G2-G4 with disciplined governance, education, and risk controls.', 'stewardship',  2050, 'matriarch',  62, 'active'],
      ['MIS-002', 'FAM-001', 'Vandermeer Cancer Initiative',      'Sustain $8M/yr in oncology giving with measurable patient-outcome reporting.', 'philanthropy', 2035, 'G2 son',    48, 'active'],
      ['MIS-003', 'FAM-015', 'Whitfield Foundation perpetuity',   'Stand up a perpetual private foundation funded $200M with disciplined 5% spend rate.', 'philanthropy', 2030, 'Charlotte', 70, 'active'],
      ['MIS-004', 'FAM-002', 'Okonkwo cross-border continuity',   'Document a clean cross-border framework so G3+ can move UK↔US↔NG without disrupting trust status.', 'unity',       2032, 'patriarch',  35, 'active'],
      ['MIS-005', 'FAM-006', 'Al-Mansour DIFC branch split',      'Cleanly split the DIFC trust into four branch trusts honouring Sharia majority-male sign-off.', 'enterprise',  2028, 'eldest son', 55, 'active'],
      ['MIS-006', 'FAM-003', 'Hanazawa heritage 2125',            'Endow Kyoto heritage preservation in perpetuity without triggering JP foundation regulation burden.', 'philanthropy', 2125, 'G1 patriarch', 25, 'active'],
      ['MIS-007', 'FAM-004', 'Rosenthal G3 education pact',       'Every G3 grandchild completes a Swiss-recognised tertiary degree before first principal distribution.', 'education',  2040, 'Greta',      80, 'active'],
      ['MIS-008', 'FAM-010', 'Chen Asia-tech leadership',         'Position the family as a top-5 Asia-Pacific LP in early-stage AI / climate tech by 2030.', 'enterprise',  2030, 'G2 daughter', 40, 'active'],
    ];
    for (const m of missions) {
      await client.query(
        `INSERT INTO family_missions
           (mission_id, family_id, title, statement, pillar, target_year, owner, progress_pct, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        m
      );
    }

    console.log('[seed] inserting mission milestones...');
    const missionMilestones = [
      ['MMS-001', 'MIS-001', 'Ratify family governance charter v4',    '2026-09-01', 'G2 council',  80, 'in_progress'],
      ['MMS-002', 'MIS-001', 'Run G3 first board observation cycle',   '2027-06-01', 'matriarch',   30, 'in_progress'],
      ['MMS-003', 'MIS-002', 'Sign 5y MSK partnership agreement',      '2026-12-01', 'G2 son',      55, 'in_progress'],
      ['MMS-004', 'MIS-003', 'Foundation bylaws v1 ratified',          '2026-05-15', 'Charlotte',  100, 'done'],
      ['MMS-005', 'MIS-003', 'Hire executive director',                '2026-09-30', 'Charlotte',   40, 'in_progress'],
      ['MMS-006', 'MIS-004', 'Domicile policy v1 drafted',             '2026-08-01', 'tax counsel', 20, 'open'],
      ['MMS-007', 'MIS-005', 'Sharia council approval letter',         '2026-11-01', 'eldest son',  10, 'open'],
      ['MMS-008', 'MIS-005', 'DIFC court branch-trust filing',         '2027-03-15', 'eldest son',   0, 'open'],
      ['MMS-009', 'MIS-007', 'BEN-003 Phillips Academy graduation',    '2027-05-30', 'Sophia',      60, 'in_progress'],
      ['MMS-010', 'MIS-008', 'Co-lead first $50M AI series-B',         '2026-12-31', 'G2 daughter', 25, 'open'],
    ];
    for (const m of missionMilestones) {
      await client.query(
        `INSERT INTO mission_milestones
           (milestone_id, mission_id, title, due_date, owner, progress_pct, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        m
      );
    }

    // ──────────────────────────────────────────────
    // Education milestones (Apply pass 7)
    // ──────────────────────────────────────────────
    console.log('[seed] inserting education milestones...');
    const eduMilestones = [
      ['EMI-001', 'BEN-003', 'Phillips Academy admission',          'admission',  '2024-09-01', '2024-09-04', 'achieved'],
      ['EMI-002', 'BEN-003', 'AP Calculus BC',                      'exam',       '2026-05-15', null,         'in_progress'],
      ['EMI-003', 'BEN-003', 'Princeton early action submission',   'admission',  '2027-11-01', null,         'planned'],
      ['EMI-004', 'BEN-009', 'IB Diploma — Dubai College',          'graduation', '2028-05-20', null,         'in_progress'],
      ['EMI-005', 'BEN-009', 'Arabic Heritage scholarship',         'award',      '2026-10-01', null,         'planned'],
      ['EMI-006', 'BEN-005', 'LSE BSc Economics graduation',        'graduation', '2026-06-30', null,         'in_progress'],
      ['EMI-007', 'BEN-005', 'Family holding board observation',    'internship', '2026-09-01', null,         'planned'],
      ['EMI-008', 'BEN-012', 'INSEAD MBA admission',                'admission',  '2025-12-15', '2025-12-22', 'achieved'],
      ['EMI-009', 'BEN-012', 'INSEAD MBA graduation',               'graduation', '2027-07-15', null,         'in_progress'],
      ['EMI-010', 'BEN-013', 'St Andrews MA Hons graduation',       'graduation', '2026-06-25', null,         'in_progress'],
    ];
    for (const m of eduMilestones) {
      await client.query(
        `INSERT INTO education_milestones
           (emi_id, beneficiary_id, title, category, target_date, achieved_date, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        m
      );
    }

    // ──────────────────────────────────────────────
    // Learning plans (Apply pass 7)
    // ──────────────────────────────────────────────
    console.log('[seed] inserting learning plans...');
    const learningPlans = [
      ['LRN-001', 'BEN-003', 2026, 'AP-heavy load + Stanford summer math camp', 'Dr. Andrews',     85000,  'active'],
      ['LRN-002', 'BEN-003', 2027, 'College apps + first board observation',    'matriarch',       95000,  'draft'],
      ['LRN-003', 'BEN-009', 2026, 'IB year 1 + Arabic heritage immersion',     'Sheikha Maryam',  72000,  'active'],
      ['LRN-004', 'BEN-005', 2026, 'LSE final year + family-office shadow',     'CIO',            110000,  'active'],
      ['LRN-005', 'BEN-012', 2026, 'INSEAD year 1 — focus on family enterprise','Wei family CFO',  140000,  'active'],
      ['LRN-006', 'BEN-013', 2026, 'St Andrews final year + Edinburgh internship', 'family advocate', 65000, 'active'],
    ];
    for (const p of learningPlans) {
      await client.query(
        `INSERT INTO learning_plans
           (plan_id, beneficiary_id, year, focus, mentor, budget_usd, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        p
      );
    }

    console.log('[seed] complete.');
  } catch (e) {
    console.error('[seed] error:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
