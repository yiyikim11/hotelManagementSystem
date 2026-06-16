-- ============================================================
-- V5: Split admin-only config perms out of operational perms
--   - RATES_MANAGE     → rate plan + daily rate mutations
--   - POLICIES_MANAGE  → cancellation policy mutations
--   Previously these were gated by ROOMS_WRITE / RESERVATIONS_WRITE
--   which leaked write access to FRONT_DESK. Grant ADMIN only.
-- ============================================================

INSERT INTO permissions (id, code, description, created_at, updated_at, version) VALUES
  (gen_random_uuid(), 'RATES_MANAGE',    'Manage rate plans and daily room rates',  NOW(), NOW(), 0),
  (gen_random_uuid(), 'POLICIES_MANAGE', 'Manage cancellation policies',             NOW(), NOW(), 0);

INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id
FROM permissions
WHERE code IN ('RATES_MANAGE', 'POLICIES_MANAGE');
