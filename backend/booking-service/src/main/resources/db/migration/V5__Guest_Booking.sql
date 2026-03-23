ALTER TABLE bookings
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE bookings
    ADD guest_full_name VARCHAR(255),
    ADD guest_email VARCHAR(255),
    ADD guest_phone VARCHAR(50),
    ADD guest_nationality VARCHAR(10),
    ADD guest_issuing_country VARCHAR(10),
    ADD guest_document_type VARCHAR(20),
    ADD guest_document_number VARCHAR(50);

