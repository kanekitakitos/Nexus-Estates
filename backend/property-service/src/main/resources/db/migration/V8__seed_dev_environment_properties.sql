-- Seed 'Dev' environment properties
-- Tie properties to User ID: 999

INSERT INTO properties (id, name, description, location, city, address, base_price, max_guests, is_active, image_url)
VALUES 
    (9901, 'Penthouse 360', '{"pt": "Vista panorâmica 360º sobre a cidade.", "en": "360º panoramic view over the city."}', 'Downtown', 'Lisboa', 'Avenida da Liberdade', 350.00, 4, true, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200'),
    (9902, 'Retiro Eco-Nature', '{"pt": "Refúgio perfeitamente isolado e ecológico.", "en": "Perfectly isolated eco-refuge."}', 'Gerês', 'Gerês', 'Caminho Florestal, 88', 180.00, 2, true, 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=1200'),
    (9903, 'Oceanfront Villa Lux', '{"pt": "Villa de altíssimo luxo ao pôr do sol.", "en": "Ultra-luxury sunset villa."}', 'Algarve', 'Faro', 'Rua das Ondas, 1', 1500.00, 12, true, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200')
ON CONFLICT (id) DO NOTHING;

-- Property Permissions for User 999
INSERT INTO property_permissions (id, property_id, user_id, access_level)
VALUES 
    (99001, 9901, 999, 'PRIMARY_OWNER'),
    (99002, 9902, 999, 'PRIMARY_OWNER'),
    (99003, 9903, 999, 'PRIMARY_OWNER')
ON CONFLICT (id) DO NOTHING;

-- Map arbitrary amenities safely (First 3 amenities to 9901)
INSERT INTO property_amenities (property_id, amenity_id)
SELECT 9901, id FROM amenities LIMIT 3
ON CONFLICT DO NOTHING;

-- Map arbitrary amenities safely (Next 2 amenities to 9902)
INSERT INTO property_amenities (property_id, amenity_id)
SELECT 9902, id FROM amenities WHERE category = 'LEISURE' LIMIT 2
ON CONFLICT DO NOTHING;

-- Seasonality rules for test properties
INSERT INTO seasonality_rules (id, property_id, start_date, end_date, price_modifier, day_of_week, channel)
VALUES 
    (99001, 9901, '2026-06-01', '2026-09-30', 50.00, NULL, NULL),
    (99002, 9903, '2026-07-01', '2026-08-31', 100.00, NULL, 'AIRBNB')
ON CONFLICT (id) DO NOTHING;

-- Update sequences
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'properties') THEN
      PERFORM setval(pg_get_serial_sequence('properties', 'id'), 10000);
   END IF;
   IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'property_permissions') THEN
      PERFORM setval(pg_get_serial_sequence('property_permissions', 'id'), 100000);
   END IF;
   IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'seasonality_rules') THEN
      PERFORM setval(pg_get_serial_sequence('seasonality_rules', 'id'), 100000);
   END IF;
END $$;
