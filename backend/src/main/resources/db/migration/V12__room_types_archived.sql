-- V12: Soft-delete support for room_types.
-- Archived room types are hidden from listings but preserved so existing
-- rooms and reservation history continue to reference them.

ALTER TABLE room_types
    ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_room_types_archived ON room_types(archived);
