CREATE TABLE IF NOT EXISTS external_integrations_aud
(
    rev           INTEGER NOT NULL,
    revtype       SMALLINT,
    id            BIGINT  NOT NULL,
    user_id       BIGINT,
    provider_name VARCHAR(50),
    api_key       TEXT,
    active        BOOLEAN,
    CONSTRAINT pk_external_integrations_aud PRIMARY KEY (rev, id)
);

ALTER TABLE external_integrations_aud
    ADD CONSTRAINT FK_EXTERNAL_INTEGRATIONS_AUD_ON_REV FOREIGN KEY (rev) REFERENCES revinfo (rev);

ALTER TABLE external_integrations
    DROP COLUMN IF EXISTS created_at;
