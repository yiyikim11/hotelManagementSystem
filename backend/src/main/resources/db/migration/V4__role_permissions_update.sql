-- ============================================================
-- V4: Role & permission restructure
--   - Drop MANAGER role (remap users → ADMIN)
--   - Add HOUSEKEEPING, GUEST roles
--   - Add HOUSEKEEPING_READ/WRITE, MY_BOOKING_READ/WRITE permissions
--   - Wire role_permissions per new matrix
--   - Add guests.user_id FK for portal auth
-- ============================================================

-- 1. New permissions
INSERT INTO permissions (id, code, description, created_at, updated_at, version) VALUES
  (gen_random_uuid(), 'HOUSEKEEPING_READ',  'View housekeeping tasks and room status',        NOW(), NOW(), 0),
  (gen_random_uuid(), 'HOUSEKEEPING_WRITE', 'Update housekeeping tasks and room status',      NOW(), NOW(), 0),
  (gen_random_uuid(), 'MY_BOOKING_READ',    'Guest views their own reservations',             NOW(), NOW(), 0),
  (gen_random_uuid(), 'MY_BOOKING_WRITE',   'Guest cancels or modifies their own reservations', NOW(), NOW(), 0);

-- 2. New roles
INSERT INTO roles (id, name, description, created_at, updated_at, version) VALUES
  ('00000000-0000-0000-0000-000000000004', 'HOUSEKEEPING', 'Housekeeping staff',   NOW(), NOW(), 0),
  ('00000000-0000-0000-0000-000000000005', 'GUEST',        'Hotel guest portal',   NOW(), NOW(), 0);

-- 3. Remap all MANAGER users to ADMIN before deleting the role
UPDATE users
SET role_id    = '00000000-0000-0000-0000-000000000001',
    updated_at = NOW(),
    version    = version + 1
WHERE role_id = '00000000-0000-0000-0000-000000000002';

-- 4. Remove MANAGER and its permission assignments
DELETE FROM role_permissions WHERE role_id = '00000000-0000-0000-0000-000000000002';
DELETE FROM roles WHERE id = '00000000-0000-0000-0000-000000000002';

-- 5. Grant ADMIN the 4 new permissions (already holds all existing ones from V3)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id
FROM permissions
WHERE code IN ('HOUSEKEEPING_READ', 'HOUSEKEEPING_WRITE', 'MY_BOOKING_READ', 'MY_BOOKING_WRITE');

-- 6. FRONT_DESK permissions unchanged — no action needed

-- 7. HOUSEKEEPING role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id
FROM permissions
WHERE code IN ('HOUSEKEEPING_READ', 'HOUSEKEEPING_WRITE', 'ROOMS_READ');

-- 8. GUEST role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000005', id
FROM permissions
WHERE code IN ('MY_BOOKING_READ', 'MY_BOOKING_WRITE');

-- 9. Link guests to user accounts for portal auth
ALTER TABLE guests
  ADD COLUMN user_id UUID REFERENCES users(id);

CREATE INDEX idx_guests_user_id ON guests(user_id);
