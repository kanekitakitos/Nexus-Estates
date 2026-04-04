DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM users
        WHERE id = 20 OR email = 'brandon-correia4@hotmail.com'
    ) THEN
        INSERT INTO users (id, email, password, role, phone)
        VALUES (
            20,
            'brandon-correia4@hotmail.com',
            '$2a$10$o7ZguUR4Y2auGdIYAKrRyODPDF2Fz1Z5SREZXwWx/VeS6CBwsowku',
            'OWNER',
            '+351 913 177 273'
        );
    END IF;
END $$;
