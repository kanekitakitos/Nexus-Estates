-- Comodidades Base
INSERT INTO amenities (id, name, category)
VALUES 
    ('a1', 'Wi-Fi de Alta Velocidade', 'TECHNOLOGY'),
    ('a2', 'Ar Condicionado', 'COMFORT'),
    ('a3', 'Piscina Privada', 'OUTDOOR'),
    ('a4', 'Cozinha Totalmente Equipada', 'KITCHEN'),
    ('a5', 'Estacionamento Gratuito', 'FACILITIES'),
    ('a6', 'Workspace', 'TECHNOLOGY'),
    ('a7', 'Fireplace', 'COMFORT'),
    ('a8', 'Hot Tub', 'COMFORT')
ON CONFLICT (id) DO NOTHING;

-- Propriedades de Teste (Dono: u2 - Luis)
-- Baseadas nos Mocks do Frontend
INSERT INTO properties (id, owner_id, title, description, address, price_per_night, status, rating, image_url, featured, created_at)
VALUES 
    ('1', 'u2', 'Modern Loft in Downtown', 'Experience city living at its finest in this spacious loft with floor-to-ceiling windows and modern amenities.', 'New York, NY', 250.00, 'ACTIVE', 4.8, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop', true, NOW()),
    ('2', 'u2', 'Cozy Mountain Cabin', 'Escape to the mountains in this rustic yet luxurious cabin. Perfect for winter getaways and summer hikes.', 'Aspen, CO', 450.00, 'ACTIVE', 4.9, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop', true, NOW()),
    ('3', 'u2', 'Seaside Villa with Pool', 'Relax by the ocean in this stunning villa featuring a private infinity pool and direct beach access.', 'Malibu, CA', 1200.00, 'ACTIVE', 5.0, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop', false, NOW()),
    ('4', 'u2', 'Urban Studio Apartment', 'Compact and efficient studio in the heart of the business district. Ideal for business travelers.', 'Chicago, IL', 120.00, 'ACTIVE', 4.5, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop', false, NOW()),
    ('5', 'u2', 'Historic Townhouse', 'Step back in time in this beautifully restored townhouse with original architectural details.', 'Boston, MA', 350.00, 'ACTIVE', 4.7, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop', false, NOW()),
    ('6', 'u2', 'Lakefront Cottage', 'Peaceful cottage right on the water''s edge. Enjoy fishing, kayaking, or just watching the sunset.', 'Lake Tahoe, NV', 280.00, 'ACTIVE', 4.6, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Relacao Propriedade <-> Comodidades
INSERT INTO property_amenities (property_id, amenity_id)
VALUES 
    ('1', 'a1'), ('1', 'a6'),
    ('2', 'a7'), ('2', 'a8'),
    ('3', 'a3'), ('3', 'a5'),
    ('4', 'a1'), ('4', 'a5'),
    ('6', 'a1'), ('6', 'a3')
ON CONFLICT DO NOTHING;
