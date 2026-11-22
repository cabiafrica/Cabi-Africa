-- Migration: seed_sacco_financial_settings
-- Created: 2026-09-10
-- Description: Seeds the default financial configuration keys used by the Sacco integration.

INSERT INTO "settings" ("id", "key", "value", "createdAt", "updatedAt")
VALUES
  (
    'sacco-remittance-pct',
    'SACCO_MANDATORY_REMITTANCE_PCT',
    '{"value": 2, "description": "Percentage of driver share remitted to Sacco"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'cabi-commission-pct',
    'CABI_COMMISSION_PCT',
    '{"value": 18, "description": "Platform commission percentage"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'sacco-joining-incentive-enabled',
    'SACCO_JOINING_INCENTIVE_ENABLED',
    '{"value": false, "description": "Joining incentive toggle"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'sacco-joining-incentive-pct',
    'SACCO_JOINING_INCENTIVE_PCT',
    '{"value": 3, "description": "Joining incentive percentage"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'sacco-joining-incentive-duration-days',
    'SACCO_JOINING_INCENTIVE_DURATION_DAYS',
    '{"value": 90, "description": "Joining incentive duration in days"}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT ("key") DO NOTHING;
