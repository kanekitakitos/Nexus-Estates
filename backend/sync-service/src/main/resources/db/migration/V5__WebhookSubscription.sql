CREATE TABLE webhook_subscriptions (
                                       id BIGSERIAL PRIMARY KEY,
                                       user_id BIGINT NOT NULL,
                                       target_url VARCHAR(255) NOT NULL,
                                       secret VARCHAR(255) NOT NULL,
                                       is_active BOOLEAN DEFAULT TRUE,
                                       subscribed_events VARCHAR(500),
                                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_user_id ON webhook_subscriptions(user_id);