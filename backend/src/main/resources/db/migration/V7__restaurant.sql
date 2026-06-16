-- Restaurant module: outlets, menu, modifiers, tables, table reservations,
-- orders, order items, bills, payments. Restaurant bills may optionally be
-- charged to a guest folio (room charge).

CREATE TABLE restaurants (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(128) NOT NULL,
    description  TEXT,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL,
    updated_at   TIMESTAMPTZ  NOT NULL,
    version      BIGINT       NOT NULL DEFAULT 0
);

CREATE TABLE menu_categories (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id  UUID         NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name           VARCHAR(128) NOT NULL,
    display_order  INTEGER      NOT NULL DEFAULT 0,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL,
    updated_at     TIMESTAMPTZ  NOT NULL,
    version        BIGINT       NOT NULL DEFAULT 0,
    UNIQUE (restaurant_id, name)
);

CREATE INDEX idx_menu_categories_restaurant_id ON menu_categories(restaurant_id);

CREATE TABLE menu_items (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id  UUID          NOT NULL REFERENCES restaurants(id)    ON DELETE CASCADE,
    category_id    UUID          NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
    sku            VARCHAR(64)   UNIQUE,
    name           VARCHAR(255)  NOT NULL,
    description    TEXT,
    base_price     NUMERIC(19,4) NOT NULL,
    weekend_price  NUMERIC(19,4),
    currency       VARCHAR(3)    NOT NULL DEFAULT 'USD',
    is_available   BOOLEAN       NOT NULL DEFAULT TRUE,
    prep_minutes   INTEGER,
    created_at     TIMESTAMPTZ   NOT NULL,
    updated_at     TIMESTAMPTZ   NOT NULL,
    version        BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category_id   ON menu_items(category_id);

CREATE TABLE modifiers (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(128)  NOT NULL,
    price_delta  NUMERIC(19,4) NOT NULL DEFAULT 0,
    is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ   NOT NULL,
    updated_at   TIMESTAMPTZ   NOT NULL,
    version      BIGINT        NOT NULL DEFAULT 0
);

CREATE TABLE menu_item_modifiers (
    menu_item_id  UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    modifier_id   UUID NOT NULL REFERENCES modifiers(id)  ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, modifier_id)
);

CREATE INDEX idx_menu_item_modifiers_modifier_id ON menu_item_modifiers(modifier_id);

CREATE TABLE restaurant_tables (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id  UUID         NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number   VARCHAR(16)  NOT NULL,
    seats          INTEGER      NOT NULL,
    status         VARCHAR(30)  NOT NULL DEFAULT 'AVAILABLE',
    created_at     TIMESTAMPTZ  NOT NULL,
    updated_at     TIMESTAMPTZ  NOT NULL,
    version        BIGINT       NOT NULL DEFAULT 0,
    UNIQUE (restaurant_id, table_number)
);

CREATE TABLE table_reservations (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id     UUID         NOT NULL REFERENCES restaurants(id),
    table_id          UUID         REFERENCES restaurant_tables(id),
    guest_id          UUID         REFERENCES guests(id),
    guest_name        VARCHAR(255),
    guest_phone       VARCHAR(32),
    party_size        INTEGER      NOT NULL,
    reserved_for      TIMESTAMPTZ  NOT NULL,
    duration_minutes  INTEGER      NOT NULL DEFAULT 90,
    status            VARCHAR(30)  NOT NULL DEFAULT 'BOOKED',
    notes             TEXT,
    created_at        TIMESTAMPTZ  NOT NULL,
    updated_at        TIMESTAMPTZ  NOT NULL,
    version           BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_table_reservations_restaurant_when ON table_reservations(restaurant_id, reserved_for);
CREATE INDEX idx_table_reservations_table_id        ON table_reservations(table_id);

CREATE TABLE restaurant_orders (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number     VARCHAR(32)   NOT NULL UNIQUE,
    restaurant_id    UUID          NOT NULL REFERENCES restaurants(id),
    order_type       VARCHAR(20)   NOT NULL,                -- DINE_IN | ROOM_SERVICE | TAKEAWAY
    table_id         UUID          REFERENCES restaurant_tables(id),
    room_id          UUID          REFERENCES rooms(id),
    reservation_id   UUID          REFERENCES reservations(id),
    guest_id         UUID          REFERENCES guests(id),
    server_id        UUID          REFERENCES users(id),
    status           VARCHAR(30)   NOT NULL,                -- OPEN | SENT | PREPARING | SERVED | CLOSED | CANCELLED
    subtotal         NUMERIC(19,4) NOT NULL DEFAULT 0,
    discount_amount  NUMERIC(19,4) NOT NULL DEFAULT 0,
    tax_amount       NUMERIC(19,4) NOT NULL DEFAULT 0,
    service_charge   NUMERIC(19,4) NOT NULL DEFAULT 0,
    total_amount     NUMERIC(19,4) NOT NULL DEFAULT 0,
    currency         VARCHAR(3)    NOT NULL DEFAULT 'USD',
    notes            TEXT,
    closed_at        TIMESTAMPTZ,
    created_at       TIMESTAMPTZ   NOT NULL,
    updated_at       TIMESTAMPTZ   NOT NULL,
    version          BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_restaurant_orders_restaurant_status ON restaurant_orders(restaurant_id, status);
CREATE INDEX idx_restaurant_orders_created_at        ON restaurant_orders(created_at);

CREATE TABLE order_items (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID          NOT NULL REFERENCES restaurant_orders(id) ON DELETE CASCADE,
    menu_item_id  UUID          NOT NULL REFERENCES menu_items(id),
    quantity      INTEGER       NOT NULL DEFAULT 1,
    unit_price    NUMERIC(19,4) NOT NULL,
    total_price   NUMERIC(19,4) NOT NULL,
    remarks       TEXT,
    status        VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMPTZ   NOT NULL,
    updated_at    TIMESTAMPTZ   NOT NULL,
    version       BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE TABLE order_item_modifiers (
    id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id  UUID          NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_id    UUID          NOT NULL REFERENCES modifiers(id),
    price_delta    NUMERIC(19,4) NOT NULL,
    created_at     TIMESTAMPTZ   NOT NULL,
    updated_at     TIMESTAMPTZ   NOT NULL,
    version        BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_order_item_modifiers_order_item_id ON order_item_modifiers(order_item_id);

CREATE TABLE restaurant_bills (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number           VARCHAR(32)   NOT NULL UNIQUE,
    order_id              UUID          NOT NULL REFERENCES restaurant_orders(id),
    subtotal              NUMERIC(19,4) NOT NULL DEFAULT 0,
    discount_amount       NUMERIC(19,4) NOT NULL DEFAULT 0,
    tax_amount            NUMERIC(19,4) NOT NULL DEFAULT 0,
    service_charge        NUMERIC(19,4) NOT NULL DEFAULT 0,
    total_amount          NUMERIC(19,4) NOT NULL DEFAULT 0,
    amount_paid           NUMERIC(19,4) NOT NULL DEFAULT 0,
    status                VARCHAR(30)   NOT NULL DEFAULT 'OPEN',  -- OPEN | PAID | VOID | CHARGED_TO_ROOM
    charged_to_folio_id   UUID          REFERENCES folios(id),
    issued_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_at            TIMESTAMPTZ   NOT NULL,
    updated_at            TIMESTAMPTZ   NOT NULL,
    version               BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_restaurant_bills_order_id ON restaurant_bills(order_id);
CREATE INDEX idx_restaurant_bills_status   ON restaurant_bills(status);

CREATE TABLE restaurant_payments (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id           UUID          NOT NULL REFERENCES restaurant_bills(id) ON DELETE CASCADE,
    payment_method    VARCHAR(30)   NOT NULL,        -- CASH | CARD | WALLET | ROOM_CHARGE
    amount            NUMERIC(19,4) NOT NULL,
    reference_number  VARCHAR(128),
    received_by       UUID          REFERENCES users(id),
    paid_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMPTZ   NOT NULL,
    updated_at        TIMESTAMPTZ   NOT NULL,
    version           BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_restaurant_payments_bill_id ON restaurant_payments(bill_id);
