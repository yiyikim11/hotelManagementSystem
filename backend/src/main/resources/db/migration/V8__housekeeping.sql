-- Housekeeping module: room-status history, cleaning tasks, maintenance
-- orders, lost & found items.

CREATE TABLE room_status_logs (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         UUID         NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status      VARCHAR(30)  NOT NULL,
    changed_by      UUID         REFERENCES users(id),
    notes           TEXT,
    changed_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ  NOT NULL,
    version         BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_room_status_logs_room_changed_at ON room_status_logs(room_id, changed_at);

CREATE TABLE housekeeping_tasks (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         UUID         NOT NULL REFERENCES rooms(id),
    task_type       VARCHAR(30)  NOT NULL,            -- CLEANING | TURNDOWN | INSPECTION | DEEP_CLEAN
    reservation_id  UUID         REFERENCES reservations(id),
    assigned_to     UUID         REFERENCES users(id),
    status          VARCHAR(30)  NOT NULL DEFAULT 'PENDING', -- PENDING | IN_PROGRESS | COMPLETED | VERIFIED | SKIPPED
    priority        VARCHAR(20)  NOT NULL DEFAULT 'NORMAL',  -- LOW | NORMAL | HIGH | URGENT
    scheduled_for   DATE         NOT NULL,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    verified_at     TIMESTAMPTZ,
    verified_by     UUID         REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ  NOT NULL,
    version         BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_housekeeping_tasks_scheduled_status ON housekeeping_tasks(scheduled_for, status);
CREATE INDEX idx_housekeeping_tasks_assigned_to      ON housekeeping_tasks(assigned_to);
CREATE INDEX idx_housekeeping_tasks_room_id          ON housekeeping_tasks(room_id);

CREATE TABLE maintenance_orders (
    id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number            VARCHAR(32)  NOT NULL UNIQUE,
    room_id                 UUID         REFERENCES rooms(id),
    location                VARCHAR(255),
    category                VARCHAR(30)  NOT NULL,            -- HVAC | PLUMBING | ELECTRICAL | FURNITURE | APPLIANCE | OTHER
    description             TEXT         NOT NULL,
    priority                VARCHAR(20)  NOT NULL DEFAULT 'NORMAL',
    status                  VARCHAR(30)  NOT NULL DEFAULT 'OPEN', -- OPEN | IN_PROGRESS | RESOLVED | CANCELLED
    blocks_room             BOOLEAN      NOT NULL DEFAULT FALSE,
    reported_by             UUID         REFERENCES users(id),
    assigned_to             UUID         REFERENCES users(id),
    reported_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    expected_completion_at  TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ,
    resolution_notes        TEXT,
    created_at              TIMESTAMPTZ  NOT NULL,
    updated_at              TIMESTAMPTZ  NOT NULL,
    version                 BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_maintenance_orders_status   ON maintenance_orders(status);
CREATE INDEX idx_maintenance_orders_room_id  ON maintenance_orders(room_id);

CREATE TABLE lost_and_found_items (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    item_description  TEXT         NOT NULL,
    category          VARCHAR(64),
    room_id           UUID         REFERENCES rooms(id),
    location          VARCHAR(255),
    found_by          UUID         NOT NULL REFERENCES users(id),
    found_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    guest_id          UUID         REFERENCES guests(id),
    status            VARCHAR(30)  NOT NULL DEFAULT 'STORED', -- STORED | CLAIMED | RETURNED | DISPOSED
    claim_contact     VARCHAR(255),
    claimed_at        TIMESTAMPTZ,
    disposed_at       TIMESTAMPTZ,
    storage_location  VARCHAR(128),
    notes             TEXT,
    -- Photos and richer descriptions are stored in Mongo (`lost_found_attachments`).
    attachments_doc_id VARCHAR(64),
    created_at        TIMESTAMPTZ  NOT NULL,
    updated_at        TIMESTAMPTZ  NOT NULL,
    version           BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_lost_and_found_items_status ON lost_and_found_items(status);
