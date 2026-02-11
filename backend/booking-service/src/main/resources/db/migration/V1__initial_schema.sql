CREATE TABLE bookings
(
    id                  UUID           NOT NULL,
    property_id         UUID           NOT NULL,
    user_id             UUID           NOT NULL,
    check_in_date       date           NOT NULL,
    check_out_date      date           NOT NULL,
    guest_count         INTEGER        NOT NULL,
    total_price         DECIMAL(10, 2) NOT NULL,
    currency            VARCHAR(3),
    status              VARCHAR(255)   NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE,
    updated_at          TIMESTAMP WITHOUT TIME ZONE,
    cancellation_reason VARCHAR(255),
    CONSTRAINT pk_bookings PRIMARY KEY (id)
);