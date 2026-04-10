WITH seed(name, description, location, city, address, base_price, max_guests, is_active, image_url) AS (
    VALUES
        (
            'Brandon Test - Alfama Studio',
            '{"pt": "Estúdio em Alfama ideal para casal, a 5 min do elétrico 28.", "en": "Alfama studio ideal for a couple, 5 min from tram 28."}'::jsonb,
            'Alfama',
            'Lisboa',
            'Travessa do Fado, 20',
            95.00,
            2,
            true,
            'https://images.unsplash.com/photo-1555854816-802f188090e7'
        ),
        (
            'Brandon Test - Parque das Nações T1',
            '{"pt": "T1 moderno com vista para o Tejo e acesso rápido ao aeroporto.", "en": "Modern 1BR with Tejo river view and quick airport access."}'::jsonb,
            'Parque das Nações',
            'Lisboa',
            'Avenida D. João II, 20',
            160.00,
            4,
            true,
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'
        ),
        (
            'Brandon Test - Porto Ribeira Loft',
            '{"pt": "Loft no coração da Ribeira, perfeito para city breaks no Porto.", "en": "Loft in the heart of Ribeira, perfect for Porto city breaks."}'::jsonb,
            'Ribeira',
            'Porto',
            'Rua dos Mercadores, 20',
            140.00,
            3,
            true,
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
        ),
        (
            'Brandon Test - Lagos Beach House',
            '{"pt": "Casa a 10 minutos a pé da praia com terraço e churrasqueira.", "en": "House 10 minutes walk from the beach with terrace and BBQ."}'::jsonb,
            'Algarve',
            'Lagos',
            'Rua da Praia, 20',
            220.00,
            6,
            true,
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb'
        ),
        (
            'Brandon Test - Madeira View Apartment',
            '{"pt": "Apartamento com varanda e vista mar, ótimo para remote work.", "en": "Apartment with balcony and sea view, great for remote work."}'::jsonb,
            'Funchal',
            'Funchal',
            'Estrada Monumental, 20',
            175.00,
            4,
            true,
            'https://images.unsplash.com/photo-1551882547-ff43c69e5c43'
        )
)
INSERT INTO properties (name, description, location, city, address, base_price, max_guests, is_active, image_url)
SELECT s.name, s.description, s.location, s.city, s.address, s.base_price, s.max_guests, s.is_active, s.image_url
FROM seed s
WHERE NOT EXISTS (
    SELECT 1
    FROM properties p
    WHERE p.address = s.address
);

INSERT INTO property_permissions (id, property_id, user_id, access_level)
SELECT nextval('property_permissions_seq'), p.id, 20, 'PRIMARY_OWNER'
FROM properties p
WHERE p.address IN (
    'Travessa do Fado, 20',
    'Avenida D. João II, 20',
    'Rua dos Mercadores, 20',
    'Rua da Praia, 20',
    'Estrada Monumental, 20'
)
  AND NOT EXISTS (
    SELECT 1
    FROM property_permissions pp
    WHERE pp.property_id = p.id
      AND pp.user_id = 20
      AND pp.access_level = 'PRIMARY_OWNER'
);

INSERT INTO property_rules (property_id, check_in_time, check_out_time, min_nights, max_nights, booking_lead_time_days)
SELECT p.id, TIME '16:00:00', TIME '11:00:00', 1, 30, 0
FROM properties p
WHERE p.address IN (
    'Travessa do Fado, 20',
    'Avenida D. João II, 20',
    'Rua dos Mercadores, 20',
    'Rua da Praia, 20',
    'Estrada Monumental, 20'
)
  AND NOT EXISTS (
    SELECT 1
    FROM property_rules r
    WHERE r.property_id = p.id
);
