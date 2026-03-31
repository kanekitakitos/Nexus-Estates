CREATE TABLE IF NOT EXISTS external_integrations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    provider_name VARCHAR(50) NOT NULL,
    api_key TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

ALTER TABLE external_integrations
    ADD CONSTRAINT fk_external_integrations_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS uk_user_provider ON external_integrations (user_id, provider_name);
