CREATE TABLE email_logs (
    id BIGSERIAL PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP NOT NULL
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
