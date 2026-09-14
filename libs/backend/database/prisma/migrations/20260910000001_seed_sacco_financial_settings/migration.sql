-- Migration: seed_sacco_financial_settings
-- Created: 2026-09-10
-- Description: Seeds the default financial configuration keys used by the Sacco integration.
--              These keys are read by SaccoService.getFinancialConfig() and
--              written by SaccoService.updateFinancialConfig().

INSERT INTO "system_settings" ("key", "value", "description", "updatedAt")
VALUES
  (
    'SACCO_MANDATORY_REMITTANCE_PCT',
    '2',
    'Percentage of the driver''s share remitted to the external Sacco per trip. '
    'Deducted from the driver''s 82% — driver receives (82 - this)%.',
    NOW()
  ),
  (
    'CABI_COMMISSION_PCT',
    '18',
    'Platform commission percentage taken from every trip fare. '
    'Driver baseline = 100 - CABI_COMMISSION_PCT.',
    NOW()
  ),
  (
    'SACCO_JOINING_INCENTIVE_ENABLED',
    'false',
    'When true, Cabi contributes an extra SACCO_JOINING_INCENTIVE_PCT from its own '
    'commission to the Sacco for newly enrolled drivers for the first '
    'SACCO_JOINING_INCENTIVE_DURATION_DAYS days.',
    NOW()
  ),
  (
    'SACCO_JOINING_INCENTIVE_PCT',
    '3',
    'Extra percentage points that Cabi contributes to the Sacco from its own '
    'commission share during the joining incentive window. '
    'Must be <= CABI_COMMISSION_PCT.',
    NOW()
  ),
  (
    'SACCO_JOINING_INCENTIVE_DURATION_DAYS',
    '90',
    'Number of days from enrollment date during which the joining incentive is active. '
    'After this period, the driver receives the standard split automatically.',
    NOW()
  )
ON CONFLICT ("key") DO NOTHING;
