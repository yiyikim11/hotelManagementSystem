-- V10: Booking module permissions
-- MARKETING_MANAGE gates admin CRUD on promotional packages and promo codes.

INSERT INTO permissions (id, code, description, created_at, updated_at, version) VALUES
  (gen_random_uuid(), 'MARKETING_MANAGE', 'Manage promotional packages and promo codes', NOW(), NOW(), 0);

-- Grant to ADMIN role (fixed id from V3 seed)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id
FROM permissions
WHERE code = 'MARKETING_MANAGE';
