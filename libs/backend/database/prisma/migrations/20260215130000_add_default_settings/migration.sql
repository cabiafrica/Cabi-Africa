-- Insert default system settings
INSERT INTO settings (id, key, value, "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'platform.commission_rate', '0.20', NOW(), NOW()),
  (gen_random_uuid(), 'platform.sacco_admin_rate', '0.02', NOW(), NOW()),
  (gen_random_uuid(), 'platform.badge_bonus_rate', '0.03', NOW(), NOW()),
  (gen_random_uuid(), 'platform.max_personal_savings_rate', '0.30', NOW(), NOW()),
  (gen_random_uuid(), 'platform.grace_period_trips', '50', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
