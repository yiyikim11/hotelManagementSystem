CREATE TABLE room_types (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    code             VARCHAR(20)    NOT NULL UNIQUE,
    name             VARCHAR(100)   NOT NULL,
    description      TEXT,
    base_occupancy   SMALLINT       NOT NULL DEFAULT 2,
    max_occupancy    SMALLINT       NOT NULL DEFAULT 2,
    base_rate        NUMERIC(19,4)  NOT NULL,
    currency         VARCHAR(3)     NOT NULL DEFAULT 'USD',
    created_at       TIMESTAMPTZ    NOT NULL,
    updated_at       TIMESTAMPTZ    NOT NULL,
    version          BIGINT         NOT NULL DEFAULT 0
);

CREATE TABLE rooms (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number  VARCHAR(20) NOT NULL UNIQUE,
    room_type_id UUID        NOT NULL REFERENCES room_types(id),
    floor        SMALLINT,
    status       VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL,
    updated_at   TIMESTAMPTZ NOT NULL,
    version      BIGINT      NOT NULL DEFAULT 0
);

CREATE INDEX idx_rooms_room_type_id ON rooms(room_type_id);
CREATE INDEX idx_rooms_status       ON rooms(status);

CREATE TABLE guests (
    id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name        VARCHAR(50)    NOT NULL,
    last_name         VARCHAR(50)    NOT NULL,
    email             VARCHAR(100)   NOT NULL UNIQUE,
    phone             VARCHAR(30)    NOT NULL,
    date_of_birth     DATE,
    gender            VARCHAR(20),
    address           TEXT,
    nationality       VARCHAR(50),
    id_type           VARCHAR(50),
    id_number         VARCHAR(100),
    issuing_country   VARCHAR(50),
    id_document_image TEXT,
    preferences       TEXT,
    total_stays       INTEGER        NOT NULL DEFAULT 0,
    total_spent       NUMERIC(19,4)  NOT NULL DEFAULT 0,
    vip_status        BOOLEAN        NOT NULL DEFAULT FALSE,
    blacklisted       BOOLEAN        NOT NULL DEFAULT FALSE,
    deleted_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ    NOT NULL,
    updated_at        TIMESTAMPTZ    NOT NULL,
    version           BIGINT         NOT NULL DEFAULT 0
);

CREATE INDEX idx_guests_email ON guests(email);

CREATE TABLE guest_preferences (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id         UUID         NOT NULL REFERENCES guests(id),
    preference_key   VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at       TIMESTAMPTZ  NOT NULL,
    updated_at       TIMESTAMPTZ  NOT NULL,
    version          BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_guest_preferences_guest_id ON guest_preferences(guest_id);

CREATE TABLE rate_plans (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL,
    version     BIGINT       NOT NULL DEFAULT 0
);

CREATE TABLE daily_room_rates (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    rate_plan_id UUID          NOT NULL REFERENCES rate_plans(id),
    room_type_id UUID          NOT NULL REFERENCES room_types(id),
    rate_date    DATE          NOT NULL,
    rate         NUMERIC(19,4) NOT NULL,
    created_at   TIMESTAMPTZ   NOT NULL,
    updated_at   TIMESTAMPTZ   NOT NULL,
    version      BIGINT        NOT NULL DEFAULT 0,
    UNIQUE (rate_plan_id, room_type_id, rate_date)
);

CREATE INDEX idx_daily_room_rates_date ON daily_room_rates(rate_date);

CREATE TABLE cancellation_policies (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    code                 VARCHAR(20)   NOT NULL UNIQUE,
    name                 VARCHAR(100)  NOT NULL,
    description          TEXT,
    hours_before_arrival INTEGER       NOT NULL DEFAULT 24,
    fee_type             VARCHAR(20)   NOT NULL DEFAULT 'PERCENTAGE',
    fee_value            NUMERIC(19,4) NOT NULL DEFAULT 0,
    is_active            BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ   NOT NULL,
    updated_at           TIMESTAMPTZ   NOT NULL,
    version              BIGINT        NOT NULL DEFAULT 0
);

CREATE TABLE reservations (
    id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    confirmation_number VARCHAR(30)   NOT NULL UNIQUE,
    guest_id            UUID          NOT NULL REFERENCES guests(id),
    status              VARCHAR(30)   NOT NULL DEFAULT 'CONFIRMED',
    source              VARCHAR(30)   NOT NULL DEFAULT 'WALK_IN',
    arrival_date        DATE          NOT NULL,
    departure_date      DATE          NOT NULL,
    adults              SMALLINT      NOT NULL DEFAULT 1,
    children            SMALLINT      NOT NULL DEFAULT 0,
    rate_plan_id        UUID          REFERENCES rate_plans(id),
    total_amount        NUMERIC(19,4) NOT NULL DEFAULT 0,
    deposit_amount      NUMERIC(19,4) NOT NULL DEFAULT 0,
    paid_amount         NUMERIC(19,4) NOT NULL DEFAULT 0,
    currency            VARCHAR(3)    NOT NULL DEFAULT 'USD',
    special_requests    TEXT,
    cancellation_reason TEXT,
    cancelled_at        TIMESTAMPTZ,
    is_day_use          BOOLEAN       NOT NULL DEFAULT FALSE,
    created_by          UUID          REFERENCES users(id),
    created_at          TIMESTAMPTZ   NOT NULL,
    updated_at          TIMESTAMPTZ   NOT NULL,
    version             BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_reservations_arrival_date ON reservations(arrival_date);
CREATE INDEX idx_reservations_status       ON reservations(status);
CREATE INDEX idx_reservations_guest_id     ON reservations(guest_id);

CREATE TABLE reservation_rooms (
    id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id         UUID          NOT NULL REFERENCES reservations(id),
    room_id                UUID          REFERENCES rooms(id),
    room_type_id           UUID          NOT NULL REFERENCES room_types(id),
    cancellation_policy_id UUID          REFERENCES cancellation_policies(id),
    arrival_date           DATE          NOT NULL,
    departure_date         DATE          NOT NULL,
    nightly_rate           NUMERIC(19,4) NOT NULL DEFAULT 0,
    total_amount           NUMERIC(19,4) NOT NULL DEFAULT 0,
    checked_in_at          TIMESTAMPTZ,
    checked_out_at         TIMESTAMPTZ,
    created_at             TIMESTAMPTZ   NOT NULL,
    updated_at             TIMESTAMPTZ   NOT NULL,
    version                BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_reservation_rooms_reservation_id ON reservation_rooms(reservation_id);
CREATE INDEX idx_reservation_rooms_room_dates     ON reservation_rooms(room_id, arrival_date, departure_date);

CREATE TABLE folios (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID          NOT NULL REFERENCES reservations(id),
    guest_id       UUID          NOT NULL REFERENCES guests(id),
    status         VARCHAR(20)   NOT NULL DEFAULT 'OPEN',
    total_amount   NUMERIC(19,4) NOT NULL DEFAULT 0,
    paid_amount    NUMERIC(19,4) NOT NULL DEFAULT 0,
    settled_at     TIMESTAMPTZ,
    created_at     TIMESTAMPTZ   NOT NULL,
    updated_at     TIMESTAMPTZ   NOT NULL,
    version        BIGINT        NOT NULL DEFAULT 0
);

CREATE TABLE folio_items (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    folio_id    UUID          NOT NULL REFERENCES folios(id),
    charge_type VARCHAR(30)   NOT NULL,
    description VARCHAR(255),
    amount      NUMERIC(19,4) NOT NULL,
    quantity    INTEGER       NOT NULL DEFAULT 1,
    unit_price  NUMERIC(19,4) NOT NULL DEFAULT 0,
    posted_by   UUID          REFERENCES users(id),
    voided_by   UUID          REFERENCES users(id),
    voided_at   TIMESTAMPTZ,
    posted_at   TIMESTAMPTZ   NOT NULL,
    created_at  TIMESTAMPTZ   NOT NULL,
    updated_at  TIMESTAMPTZ   NOT NULL,
    version     BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_folio_items_folio_id ON folio_items(folio_id);
