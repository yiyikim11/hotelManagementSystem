-- Marketing module: email campaigns + recipient log.
-- Rich body templates and rendered email payloads are stored in Mongo
-- (`marketing_templates`, `notification_payloads`). Postgres rows keep only
-- structured metadata (status, schedule, counts, errors).

CREATE TABLE marketing_campaigns (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(128) NOT NULL,
    subject         VARCHAR(255) NOT NULL,
    body_doc_id     VARCHAR(64),                       -- pointer into Mongo `marketing_templates`
    body_preview    TEXT,                              -- short plaintext snippet for admin lists
    promo_code_id   UUID         REFERENCES promo_codes(id) ON DELETE SET NULL,
    status          VARCHAR(30)  NOT NULL DEFAULT 'DRAFT', -- DRAFT | SCHEDULED | SENDING | SENT | CANCELLED | FAILED
    scheduled_for   TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    created_by      UUID         REFERENCES users(id),
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ  NOT NULL,
    version         BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_marketing_campaigns_status        ON marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_scheduled_for ON marketing_campaigns(scheduled_for);

CREATE TABLE marketing_campaign_recipients (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id          UUID         NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    guest_id             UUID         NOT NULL REFERENCES guests(id),
    recipient_email      VARCHAR(255) NOT NULL,
    status               VARCHAR(30)  NOT NULL DEFAULT 'PENDING', -- PENDING | SENT | FAILED | BOUNCED | OPENED
    provider_message_id  VARCHAR(255),
    error_message        TEXT,
    sent_at              TIMESTAMPTZ,
    created_at           TIMESTAMPTZ  NOT NULL,
    updated_at           TIMESTAMPTZ  NOT NULL,
    version              BIGINT       NOT NULL DEFAULT 0,
    UNIQUE (campaign_id, guest_id)
);

CREATE INDEX idx_marketing_campaign_recipients_campaign_id ON marketing_campaign_recipients(campaign_id);
CREATE INDEX idx_marketing_campaign_recipients_status      ON marketing_campaign_recipients(status);

-- Generic transactional notification log (booking confirmations, OTPs, etc).
-- Large rendered bodies are stored in Mongo (`notification_payloads`).
CREATE TABLE notification_logs (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id       UUID         REFERENCES reservations(id),
    guest_id             UUID         REFERENCES guests(id),
    channel              VARCHAR(20)  NOT NULL,           -- EMAIL | SMS | PUSH
    type                 VARCHAR(40)  NOT NULL,           -- BOOKING_CONFIRMATION | PAYMENT_RECEIPT | ...
    recipient            VARCHAR(255) NOT NULL,
    subject              VARCHAR(255),
    body_doc_id          VARCHAR(64),                     -- pointer into Mongo `notification_payloads`
    status               VARCHAR(30)  NOT NULL,           -- PENDING | SENT | FAILED | BOUNCED
    provider_message_id  VARCHAR(255),
    error_message        TEXT,
    sent_at              TIMESTAMPTZ,
    created_at           TIMESTAMPTZ  NOT NULL,
    updated_at           TIMESTAMPTZ  NOT NULL,
    version              BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX idx_notification_logs_reservation_id ON notification_logs(reservation_id);
CREATE INDEX idx_notification_logs_guest_id       ON notification_logs(guest_id);
CREATE INDEX idx_notification_logs_status         ON notification_logs(status);
