-- Comodidades Base
INSERT INTO amenities (name, category, icon)
VALUES 
    ('{"pt": "Wi-Fi de Alta Velocidade", "en": "High-Speed Wi-Fi"}', 'COMFORT', 'wifi'),
    ('{"pt": "Ar Condicionado", "en": "Air Conditioning"}', 'COMFORT', 'air-conditioner'),
    ('{"pt": "Piscina Privada", "en": "Private Pool"}', 'LEISURE', 'pool'),
    ('{"pt": "Cozinha Equipada", "en": "Fully Equipped Kitchen"}', 'KITCHEN', 'kitchen'),
    ('{"pt": "Estacionamento Gratuito", "en": "Free Parking"}', 'COMFORT', 'parking'),
    ('{"pt": "Workspace", "en": "Workspace"}', 'COMFORT', 'workspace'),
    ('{"pt": "Lareira", "en": "Fireplace"}', 'COMFORT', 'fireplace'),
    ('{"pt": "Jacuzzi", "en": "Hot Tub"}', 'LEISURE', 'hot-tub');

-- Propriedades de Teste
INSERT INTO properties (name, description, location, city, address, base_price, max_guests, is_active, image_url)
VALUES 
    ('Modern Loft in Downtown', '{"pt": "Loft moderno no centro com vista para a cidade.", "en": "Modern loft in downtown with city views."}', 'Downtown', 'Lisboa', 'Rua da Prata, 123', 250.00, 2, true, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200'),
    ('Cozy Mountain Cabin', '{"pt": "Cabine acolhedora na montanha, perfeita para o inverno.", "en": "Cozy mountain cabin, perfect for winter."}', 'Serra da Estrela', 'Covilhã', 'Caminho das Neves, 45', 450.00, 6, true, 'https://images.unsplash.com/photo-1464146072230-91cabe713c24?q=80&w=1200'),
    ('Seaside Villa with Pool', '{"pt": "Villa à beira-mar com piscina privada e acesso à praia.", "en": "Seaside villa with private pool and beach access."}', 'Algarve', 'Lagos', 'Avenida da Praia, 78', 1200.00, 10, true, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200');

-- Relacao Propriedade <-> Comodidades (Usando IDs gerados)
INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name = 'Modern Loft in Downtown' AND a.name->>'pt' = 'Wi-Fi de Alta Velocidade';

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name = 'Modern Loft in Downtown' AND a.name->>'pt' = 'Workspace';

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name = 'Cozy Mountain Cabin' AND a.name->>'pt' = 'Lareira';

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name = 'Cozy Mountain Cabin' AND a.name->>'pt' = 'Jacuzzi';

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name = 'Seaside Villa with Pool' AND a.name->>'pt' = 'Piscina Privada';
