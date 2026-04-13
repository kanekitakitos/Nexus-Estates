ALTER TABLE users
    ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255);

ALTER TABLE users_aud
    ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS ux_users_clerk_user_id ON users (clerk_user_id);

