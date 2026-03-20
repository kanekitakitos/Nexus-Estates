-- Remove a constraint desatualizada se existir
ALTER TABLE amenities DROP CONSTRAINT IF EXISTS amenities_category_check;

-- Adiciona a constraint com os valores atualizados do AmenityCategory enum
ALTER TABLE amenities ADD CONSTRAINT amenities_category_check CHECK (category IN ('KITCHEN', 'LEISURE', 'SAFETY', 'COMFORT', 'VIEW'));

-- More Amenities
INSERT INTO amenities (name, category, icon)
VALUES 
    ('{"pt": "Vista de Mar", "en": "Sea View"}', 'VIEW', 'waves'),
    ('{"pt": "Vista de Montanha", "en": "Mountain View"}', 'VIEW', 'mountain'),
    ('{"pt": "Lava-loiça", "en": "Dishwasher"}', 'KITCHEN', 'dishwasher'),
    ('{"pt": "Máquina de Lavar Roupa", "en": "Washing Machine"}', 'COMFORT', 'washing-machine'),
    ('{"pt": "Televisão por Cabo", "en": "Cable TV"}', 'LEISURE', 'tv'),
    ('{"pt": "Varanda", "en": "Balcony"}', 'COMFORT', 'balcony'),
    ('{"pt": "Grelhador/Churrasqueira", "en": "BBQ"}', 'LEISURE', 'bbq'),
    ('{"pt": "Cuna/Berço", "en": "Crib"}', 'COMFORT', 'baby-crib');

-- More Properties in Portugal
INSERT INTO properties (name, description, location, city, address, base_price, max_guests, is_active)
VALUES 
    ('Porto Riverside Apartment', '{"pt": "Apartamento moderno com vista para o Rio Douro.", "en": "Modern apartment with Douro River view."}', 'Ribeira', 'Porto', 'Rua Nova da Alfândega, 10', 180.00, 4, true),
    ('Algarve Luxury Villa', '{"pt": "Vila de luxo com piscina infinita e jardim.", "en": "Luxury villa com infinity pool and garden."}', 'Quinta do Lago', 'Almancil', 'Estrada da Quinta, Lote 45', 1500.00, 8, true),
    ('Madeira Island Retreat', '{"pt": "Refúgio tranquilo na ilha com vista panorâmica.", "en": "Quiet island retreat with panoramic views."}', 'Funchal', 'Funchal', 'Caminho do Monte, 123', 220.00, 4, true),
    ('Azores Green House', '{"pt": "Casa sustentável rodeada pela natureza dos Açores.", "en": "Sustainable house surrounded by Azores nature."}', 'Sete Cidades', 'Ponta Delgada', 'Rua da Lagoa, 5', 150.00, 5, true),
    ('Coimbra Historic Studio', '{"pt": "Estúdio charmoso no centro histórico de Coimbra.", "en": "Charming studio in Coimbra historic center."}', 'Alta de Coimbra', 'Coimbra', 'Rua da Sofia, 88', 95.00, 2, true),
    ('Évora Alentejo Farmhouse', '{"pt": "Herdade típica alentejana com oliveiras e piscina.", "en": "Typical Alentejo farmhouse with olive trees and pool."}', 'Arredores', 'Évora', 'Herdade do Esporão, S/N', 350.00, 12, true),
    ('Braga Modern Condo', '{"pt": "Condomínio moderno perto do Bom Jesus.", "en": "Modern condo near Bom Jesus."}', 'Tenões', 'Braga', 'Rua do Sameiro, 22', 120.00, 4, true),
    ('Cascais Beach House', '{"pt": "Casa de praia a poucos metros da areia.", "en": "Beach house just a few meters from the sand."}', 'Guincho', 'Cascais', 'Estrada do Guincho, KM 5', 600.00, 6, true),
    ('Lisbon Alfama Charm', '{"pt": "Apartamento típico no bairro mais antigo de Lisboa.", "en": "Typical apartment in Lisbons oldest neighborhood."}', 'Alfama', 'Lisboa', 'Beco do Carneiro, 12', 110.00, 3, true),
    ('Gerês Mountain Chalet', '{"pt": "Chalet de madeira no Parque Nacional da Peneda-Gerês.", "en": "Wooden chalet in Peneda-Gerês National Park."}', 'Vila do Gerês', 'Gerês', 'Caminho das Águas, 7', 280.00, 6, true),
    ('Aveiro Canal View', '{"pt": "Apartamento com vista para os canais de Aveiro.", "en": "Apartment with view of the Aveiro canals."}', 'Beira Mar', 'Aveiro', 'Cais dos Botirões, 3', 130.00, 4, true),
    ('Viana do Castelo Manor', '{"pt": "Solar histórico restaurado com jardins luxuosos.", "en": "Restored historic manor with lush gardens."}', 'Santa Luzia', 'Viana do Castelo', 'Estrada de Santa Luzia, 15', 450.00, 10, true),
    ('Sagres Surfer Lodge', '{"pt": "Lodge descontraído perto das melhores praias de surf.", "en": "Relaxed lodge near the best surfing beaches."}', 'Sagres', 'Vila do Bispo', 'Rua dos Pescadores, 2', 485.00, 15, true),
    ('Sintra Fairy Tale Cottage', '{"pt": "Cabana romântica na floresta mística de Sintra.", "en": "Romantic cottage in the mystical forest of Sintra."}', 'Serra de Sintra', 'Sintra', 'Caminho dos Frades, 9', 320.00, 2, true),
    ('Monsaraz Castle View', '{"pt": "Casa tradicional com vista para o castelo de Monsaraz.", "en": "Traditional house with view of Monsaraz castle."}', 'Monsaraz', 'Reguengos de Monsaraz', 'Rua Direita, 44', 190.00, 4, true);

-- Associations (Simple logic for many associations)
INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name LIKE '%Porto%' AND a.name->>'pt' IN ('Wi-Fi de Alta Velocidade', 'Vista de Mar', 'Lava-loiça');

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name LIKE '%Algarve%' AND a.name->>'pt' IN ('Wi-Fi de Alta Velocidade', 'Ar Condicionado', 'Piscina Privada', 'Jacuzzi', 'Grelhador/Churrasqueira');

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name LIKE '%Madeira%' AND a.name->>'pt' IN ('Vista de Mar', 'Ar Condicionado', 'Varanda');

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name LIKE '%Azores%' AND a.name->>'pt' IN ('Vista de Montanha', 'Estacionamento Gratuito', 'Workspace');

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name LIKE '%Gerês%' AND a.name->>'pt' IN ('Lareira', 'Vista de Montanha', 'Piscina Privada');

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name LIKE '%Sintra%' AND a.name->>'pt' IN ('Lareira', 'Wi-Fi de Alta Velocidade', 'Cuna/Berço');

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name LIKE '%Évora%' AND a.name->>'pt' IN ('Piscina Privada', 'Grelhador/Churrasqueira', 'Estacionamento Gratuito', 'Cozinha Equipada');
