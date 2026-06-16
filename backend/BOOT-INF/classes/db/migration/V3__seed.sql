-- Seed permissions
INSERT INTO permissions (id, code, description, created_at, updated_at, version) VALUES
  (gen_random_uuid(), 'RESERVATIONS_READ',  'View reservations',     NOW(), NOW(), 0),
  (gen_random_uuid(), 'RESERVATIONS_WRITE', 'Create/edit reservations', NOW(), NOW(), 0),
  (gen_random_uuid(), 'GUESTS_READ',        'View guests',           NOW(), NOW(), 0),
  (gen_random_uuid(), 'GUESTS_WRITE',       'Create/edit guests',    NOW(), NOW(), 0),
  (gen_random_uuid(), 'ROOMS_READ',         'View rooms',            NOW(), NOW(), 0),
  (gen_random_uuid(), 'ROOMS_WRITE',        'Create/edit rooms',     NOW(), NOW(), 0),
  (gen_random_uuid(), 'REPORTS_READ',       'View reports',          NOW(), NOW(), 0),
  (gen_random_uuid(), 'USERS_MANAGE',       'Manage users',          NOW(), NOW(), 0),
  (gen_random_uuid(), 'FOLIOS_MANAGE',      'Manage folios',         NOW(), NOW(), 0);

-- Seed roles
INSERT INTO roles (id, name, description, created_at, updated_at, version) VALUES
  ('00000000-0000-0000-0000-000000000001', 'ADMIN',      'Full system access',          NOW(), NOW(), 0),
  ('00000000-0000-0000-0000-000000000002', 'MANAGER',    'Hotel operations manager',    NOW(), NOW(), 0),
  ('00000000-0000-0000-0000-000000000003', 'FRONT_DESK', 'Front office agent',          NOW(), NOW(), 0);

-- Assign all permissions to ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions;

-- Assign operational permissions to MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id
FROM permissions WHERE code IN (
  'RESERVATIONS_READ', 'RESERVATIONS_WRITE',
  'GUESTS_READ', 'GUESTS_WRITE',
  'ROOMS_READ', 'ROOMS_WRITE',
  'REPORTS_READ', 'FOLIOS_MANAGE'
);

-- Assign front-desk permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id
FROM permissions WHERE code IN (
  'RESERVATIONS_READ', 'RESERVATIONS_WRITE',
  'GUESTS_READ', 'GUESTS_WRITE',
  'ROOMS_READ', 'FOLIOS_MANAGE'
);

-- NOTE: The default admin user is NOT seeded here.
-- On first startup, SeedDataInitializer creates admin@hotel.local
-- with the password from the ADMIN_INITIAL_PASSWORD environment variable.

-- Seed rate plans
INSERT INTO rate_plans (id, code, name, description, is_active, created_at, updated_at, version) VALUES
  ('00000000-0000-0000-0001-000000000001', 'BAR', 'Best Available Rate', 'Standard daily rate, no restrictions', TRUE, NOW(), NOW(), 0),
  ('00000000-0000-0000-0001-000000000002', 'PKG', 'Package Rate', 'Includes breakfast and amenities', TRUE, NOW(), NOW(), 0);

-- Seed cancellation policy
INSERT INTO cancellation_policies (id, code, name, description, hours_before_arrival, fee_type, fee_value, is_active, created_at, updated_at, version) VALUES
  ('00000000-0000-0000-0002-000000000001', 'FLEX', 'Flexible',    'Free cancellation up to 24h before arrival', 24,  'PERCENTAGE', 0,   TRUE, NOW(), NOW(), 0),
  ('00000000-0000-0000-0002-000000000002', 'SEMI', 'Semi-Flex',   '50% fee if cancelled within 48h of arrival',  48,  'PERCENTAGE', 50,  TRUE, NOW(), NOW(), 0),
  ('00000000-0000-0000-0002-000000000003', 'NREF', 'Non-Refund',  'Non-refundable — no cancellation allowed',     720, 'PERCENTAGE', 100, TRUE, NOW(), NOW(), 0);
