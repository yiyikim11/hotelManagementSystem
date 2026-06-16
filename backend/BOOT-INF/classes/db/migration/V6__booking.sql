-- Booking module.
-- Online bookings reuse the existing `reservations` table with source='WEBSITE'
-- and may pass through 'PENDING_PAYMENT' status before 'CONFIRMED'. No new
-- reservation/booking entity is introduced — the public-site workflow lives in
-- the booking/onlinebooking backend module and persists through reservations.

CREATE TABLE promotional_packages (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(32)   NOT NULL UNIQUE,
    name            VARCHAR(128)  NOT NULL,
    description     TEXT,
    discount_type   VARCHAR(20)   NOT NULL,            -- PERCENTAGE | FIXED_AMOUNT
    discount_value  NUMERIC(19,4) NOT NULL,
    valid_from      DATE          NOT NULL,
    valid_to        DATE          NOT NULL,
    min_nights      INTEGER       NOT NULL DEFAULT 1,
    max_nights      INTEGER,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ   NOT NULL,
    updated_at      TIMESTAMPTZ   NOT NULL,
    version         BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_promotional_packages_active_window
    ON promotional_packages(is_active, valid_from, valid_to);

-- Many-to-many. Empty set for a package = "applies to all room types".
CREATE TABLE package_room_types (
    package_id    UUID NOT NULL REFERENCES promotional_packages(id) ON DELETE CASCADE,
    room_type_id  UUID NOT NULL REFERENCES room_types(id)           ON DELETE CASCADE,
    PRIMARY KEY (package_id, room_type_id)
);

CREATE INDEX idx_package_room_types_room_type_id ON package_room_types(room_type_id);

CREATE TABLE promo_codes (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    code         VARCHAR(32)  NOT NULL UNIQUE,
    package_id   UUID         REFERENCES promotional_packages(id) ON DELETE SET NULL,
    usage_limit  INTEGER,
    usage_count  INTEGER      NOT NULL DEFAULT 0,
    valid_from   TIMESTAMPTZ  NOT NULL,
    valid_to     TIMESTAMPTZ  NOT NULL,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL,
    updated_at   TIMESTAMPTZ  NOT NULL,
    version      BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_promo_codes_package_id    ON promo_codes(package_id);
CREATE INDEX idx_promo_codes_active_window ON promo_codes(is_active, valid_from, valid_to);

-- One promo code per reservation (PK on reservation_id enforces it).
CREATE TABLE reservation_promo_codes (
    reservation_id    UUID          NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    promo_code_id     UUID          NOT NULL REFERENCES promo_codes(id),
    discount_applied  NUMERIC(19,4) NOT NULL,
    applied_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    PRIMARY KEY (reservation_id)
);

CREATE INDEX idx_reservation_promo_codes_promo_code_id ON reservation_promo_codes(promo_code_id);

CREATE TABLE online_payment_transactions (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id          UUID          NOT NULL REFERENCES reservations(id),
    gateway                 VARCHAR(32)   NOT NULL,
    gateway_transaction_id  VARCHAR(255)  UNIQUE,
    amount                  NUMERIC(19,4) NOT NULL,
    currency                VARCHAR(3)    NOT NULL DEFAULT 'USD',
    status                  VARCHAR(30)   NOT NULL,            -- PENDING | SUCCEEDED | FAILED | REFUNDED
    payment_method          VARCHAR(30),
    card_brand              VARCHAR(30),
    card_last4              VARCHAR(4),
    gateway_response_doc_id VARCHAR(64),                       -- pointer into Mongo `payment_gateway_events`
    error_message           TEXT,
    completed_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ   NOT NULL,
    updated_at              TIMESTAMPTZ   NOT NULL,
    version                 BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_online_payment_transactions_reservation_id ON online_payment_transactions(reservation_id);
CREATE INDEX idx_online_payment_transactions_status         ON online_payment_transactions(status);
