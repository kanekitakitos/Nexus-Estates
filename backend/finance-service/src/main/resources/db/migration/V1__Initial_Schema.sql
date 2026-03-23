CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    provider VARCHAR(32) NOT NULL,
    payment_intent_id VARCHAR(128) NOT NULL,
    currency VARCHAR(8) NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_payments_payment_intent_id ON payments(payment_intent_id);
CREATE INDEX ix_payments_booking_id ON payments(booking_id);

CREATE TABLE processed_events (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    event_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_processed_events_provider_event_id ON processed_events(provider, event_id);

CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id),
    provider VARCHAR(32) NOT NULL,
    legal_id VARCHAR(128),
    pdf_url TEXT,
    status VARCHAR(32) NOT NULL,
    issued_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_invoices_payment_id ON invoices(payment_id);

