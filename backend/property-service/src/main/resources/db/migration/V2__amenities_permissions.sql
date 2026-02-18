CREATE TABLE amenities
(
    id       UUID         NOT NULL,
    name     VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    CONSTRAINT pk_amenities PRIMARY KEY (id)
);

CREATE TABLE properties
(
    id          UUID           NOT NULL,
    name        VARCHAR(255)   NOT NULL,
    description TEXT,
    city        VARCHAR(255)   NOT NULL,
    address     VARCHAR(255)   NOT NULL,
    base_price  DECIMAL(10, 2) NOT NULL,
    max_guests  INTEGER        NOT NULL,
    is_active   BOOLEAN        NOT NULL,
    CONSTRAINT pk_properties PRIMARY KEY (id)
);

CREATE TABLE property_permissions
(
    id           UUID         NOT NULL,
    property_id  UUID         NOT NULL,
    user_id      UUID         NOT NULL,
    access_level VARCHAR(255) NOT NULL,
    CONSTRAINT pk_property_permissions PRIMARY KEY (id)
);

ALTER TABLE amenities
    ADD CONSTRAINT uc_amenities_name UNIQUE (name);