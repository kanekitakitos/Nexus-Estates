CREATE TABLE bookings
(
    id                  BIGSERIAL      PRIMARY KEY,
    property_id         BIGINT         NOT NULL,
    user_id             BIGINT         NOT NULL,
    check_in_date       DATE           NOT NULL,
    check_out_date      DATE           NOT NULL,
    guest_count         INTEGER        NOT NULL,
    total_price         DECIMAL(10, 2) NOT NULL,
    currency            VARCHAR(3),
    status              VARCHAR(255)   NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE,
    updated_at          TIMESTAMP WITHOUT TIME ZONE,
    cancellation_reason VARCHAR(255)
);
