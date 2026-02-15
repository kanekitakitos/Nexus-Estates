CREATE TABLE properties (
                            id SERIAL PRIMARY KEY,
                            title VARCHAR(255) NOT NULL,
                            description TEXT,
                            price NUMERIC(10,2) NOT NULL,
                            owner_id BIGINT NOT NULL
);
