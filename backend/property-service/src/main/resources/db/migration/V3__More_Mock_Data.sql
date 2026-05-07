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
INSERT INTO properties (name, description, location, city, address, base_price, max_guests, is_active, image_url)
VALUES 
    ('Porto Riverside Apartment', '{"pt": "Apartamento moderno com vista para o Rio Douro.", "en": "Modern apartment with Douro River view."}', 'Ribeira', 'Porto', 'Rua Nova da Alfândega, 10', 180.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/2eb5b8ad-0b32-410e-98e1-311b8c81bf33_k83xkn.avif'),
    ('Algarve Luxury Villa', '{"pt": "Vila de luxo com piscina infinita e jardim.", "en": "Luxury villa com infinity pool and garden."}', 'Quinta do Lago', 'Almancil', 'Estrada da Quinta, Lote 45', 1500.00, 8, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/e916c971-0e58-4dcf-b13e-dbef345e5013_tkalld.avif'),
    ('Madeira Island Retreat', '{"pt": "Refúgio tranquilo na ilha com vista panorâmica.", "en": "Quiet island retreat with panoramic views."}', 'Funchal', 'Funchal', 'Caminho do Monte, 123', 220.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/a709572e-f938-41f4-8de0-41840322972a_opb1b2.avif'),
    ('Azores Green House', '{"pt": "Casa sustentável rodeada pela natureza dos Açores.", "en": "Sustainable house surrounded by Azores nature."}', 'Sete Cidades', 'Ponta Delgada', 'Rua da Lagoa, 5', 150.00, 5, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/3241620c-b81f-4b06-9147-c3316d41edd8_zftkfv.avif'),
    ('Coimbra Historic Studio', '{"pt": "Estúdio charmoso no centro histórico de Coimbra.", "en": "Charming studio in Coimbra historic center."}', 'Alta de Coimbra', 'Coimbra', 'Rua da Sofia, 88', 95.00, 2, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/6a4147ba-1c4d-48dd-8983-4bfa84773ea5_g64dys.avif'),
    ('Évora Alentejo Farmhouse', '{"pt": "Herdade típica alentejana com oliveiras e piscina.", "en": "Typical Alentejo farmhouse with olive trees and pool."}', 'Arredores', 'Évora', 'Herdade do Esporão, S/N', 350.00, 12, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/80e44391-928d-4645-baad-b7530fdcd3d5_lxa34f.avif'),
    ('Braga Modern Condo', '{"pt": "Condomínio moderno perto do Bom Jesus.", "en": "Modern condo near Bom Jesus."}', 'Tenões', 'Braga', 'Rua do Sameiro, 22', 120.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/6dffbe95-f4c8-4def-8661-5e8b666d2a33_pbgnjf.avif'),
    ('Cascais Beach House', '{"pt": "Casa de praia a poucos metros da areia.", "en": "Beach house just a few meters from the sand."}', 'Guincho', 'Cascais', 'Estrada do Guincho, KM 5', 600.00, 6, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/45671ecb-fd4f-4f0f-8b8b-f9ee3e9277b4_ptk9xl.avif'),
    ('Lisbon Alfama Charm', '{"pt": "Apartamento típico no bairro mais antigo de Lisboa.", "en": "Typical apartment in Lisbons oldest neighborhood."}', 'Alfama', 'Lisboa', 'Beco do Carneiro, 12', 110.00, 3, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/69f498e1-9046-4684-ab5a-32812b02a087_kjbcex.avif'),
    ('Gerês Mountain Chalet', '{"pt": "Chalet de madeira no Parque Nacional da Peneda-Gerês.", "en": "Wooden chalet in Peneda-Gerês National Park."}', 'Vila do Gerês', 'Gerês', 'Caminho das Águas, 7', 280.00, 6, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/b42bf256-f154-4a59-a2c3-137744b28ce7_nnyhvj.avif'),
    ('Aveiro Canal View', '{"pt": "Apartamento com vista para os canais de Aveiro.", "en": "Apartment with view of the Aveiro canals."}', 'Beira Mar', 'Aveiro', 'Cais dos Botirões, 3', 130.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627200/ee133f4a-1dc0-4bbf-a24d-69fe2bf68bed_nsg1ip.avif'),
    ('Viana do Castelo Manor', '{"pt": "Solar histórico restaurado com jardins luxuosos.", "en": "Restored historic manor with lush gardens."}', 'Santa Luzia', 'Viana do Castelo', 'Estrada de Santa Luzia, 15', 450.00, 10, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627200/de9bb0a6-225c-4744-9e5d-899cc80479d7_whhmq5.avif'),
    ('Sagres Surfer Lodge', '{"pt": "Lodge descontraído perto das melhores praias de surf.", "en": "Relaxed lodge near the best surfing beaches."}', 'Sagres', 'Vila do Bispo', 'Rua dos Pescadores, 2', 485.00, 15, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627199/4443ac11-d812-4d82-8be3-e6631a6a40b2_wx2l4h.avif'),
    ('Sintra Fairy Tale Cottage', '{"pt": "Cabana romântica na floresta mística de Sintra.", "en": "Romantic cottage in the mystical forest of Sintra."}', 'Serra de Sintra', 'Sintra', 'Caminho dos Frades, 9', 320.00, 2, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627199/2f517677-7fcc-4cca-bbec-a9d3cc16d2b2_d4ucp9.avif'),
    ('Monsaraz Castle View', '{"pt": "Casa tradicional com vista para o castelo de Monsaraz.", "en": "Traditional house with view of Monsaraz castle."}', 'Monsaraz', 'Reguengos de Monsaraz', 'Rua Direita, 44', 190.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627199/89351a48-558a-4e2b-972a-fd191984d493_wieoh4.avif');

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
