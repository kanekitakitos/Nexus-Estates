ALTER TABLE messages
    ALTER COLUMN booking_id DROP NOT NULL;

ALTER TABLE messages
    ADD COLUMN context_type VARCHAR(32),
    ADD COLUMN context_id BIGINT;

UPDATE messages
SET context_type = 'BOOKING',
    context_id = booking_id
WHERE context_type IS NULL;

ALTER TABLE messages
    ALTER COLUMN context_type SET NOT NULL,
    ALTER COLUMN context_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_context_created_at
    ON messages (context_type, context_id, created_at);

CREATE TABLE property_inquiries (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    guest_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (property_id, guest_id)
);

CREATE INDEX IF NOT EXISTS idx_property_inquiries_guest_id
    ON property_inquiries (guest_id);

CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id
    ON property_inquiries (property_id);
