-- V11: Website Room Listings (booking engine -> customer site)
-- One row per room_type. Controls publish state and website-specific marketing content.
-- Auth: BOOKING_MANAGE permission for write; reads are public (filtered).

CREATE TABLE website_room_listings (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_id                    UUID NOT NULL UNIQUE REFERENCES room_types(id) ON DELETE CASCADE,
    is_published                    BOOLEAN NOT NULL DEFAULT FALSE,
    website_description             TEXT,
    website_photos                  TEXT,             -- newline-separated URLs
    display_order                   INTEGER NOT NULL DEFAULT 999,
    promotional_rate                NUMERIC(19,4),
    promotional_rate_description    VARCHAR(255),
    featured_amenities              TEXT,             -- comma-separated
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version                         BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_website_room_listings_published ON website_room_listings(is_published);

INSERT INTO permissions (id, code, description, created_at, updated_at, version) VALUES
  (gen_random_uuid(), 'BOOKING_MANAGE', 'Manage booking engine website listings', NOW(), NOW(), 0);

INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id
FROM permissions
WHERE code = 'BOOKING_MANAGE';
