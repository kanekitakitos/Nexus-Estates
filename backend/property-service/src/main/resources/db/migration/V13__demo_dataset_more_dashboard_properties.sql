-- Demo dataset: mais propriedades e permissões para enriquecer o Dashboard (conta dev id=999)
-- Inclui imagens Cloudinary e adiciona um utilizador STAFF oficial (id=2002) como assistente nas propriedades do dev.

-- Propriedades adicionais do dev (ids 20013-20020)
INSERT INTO properties (id, name, description, location, city, address, base_price, max_guests, is_active, image_url)
VALUES
  (20013, 'Nexus Demo • Algarve Sunset', '{"pt":"Apartamento (demo) com varanda e pôr-do-sol no Algarve.","en":"Apartment (demo) with balcony and Algarve sunset views."}', 'Centro', 'Lagos', 'Rua do Sol 13', 175.00, 3, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/69f498e1-9046-4684-ab5a-32812b02a087_kjbcex.avif'),
  (20014, 'Nexus Demo • Douro Terrace', '{"pt":"T1 (demo) com terraço e vista para o Douro.","en":"1BR (demo) with terrace and Douro views."}', 'Ribeira', 'Porto', 'Rua do Douro 14', 160.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/3241620c-b81f-4b06-9147-c3316d41edd8_zftkfv.avif'),
  (20015, 'Nexus Demo • Lisboa Rooftop', '{"pt":"Estúdio (demo) com rooftop partilhado na Baixa.","en":"Studio (demo) with shared rooftop in downtown Lisbon."}', 'Baixa', 'Lisboa', 'Rua Augusta 15', 120.00, 2, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/2eb5b8ad-0b32-410e-98e1-311b8c81bf33_k83xkn.avif'),
  (20016, 'Nexus Demo • Nazaré Sea Breeze', '{"pt":"Apartamento (demo) com brisa do mar e acesso rápido à praia.","en":"Apartment (demo) with sea breeze and quick beach access."}', 'Praia', 'Nazaré', 'Avenida da Praia 16', 165.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627200/de9bb0a6-225c-4744-9e5d-899cc80479d7_whhmq5.avif'),
  (20017, 'Nexus Demo • Braga Work&Stay', '{"pt":"T0 (demo) com espaço de trabalho e internet rápida.","en":"Studio (demo) with workspace and fast internet."}', 'Centro', 'Braga', 'Rua do Trabalho 17', 105.00, 2, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/6dffbe95-f4c8-4def-8661-5e8b666d2a33_pbgnjf.avif'),
  (20018, 'Nexus Demo • Alentejo Calm', '{"pt":"Casa (demo) tranquila no Alentejo, ideal para descanso.","en":"Calm (demo) home in Alentejo, ideal to disconnect."}', 'Arredores', 'Évora', 'Estrada do Campo 18', 145.00, 6, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/b42bf256-f154-4a59-a2c3-137744b28ce7_nnyhvj.avif'),
  (20019, 'Nexus Demo • Sintra Forest', '{"pt":"Cottage (demo) rodeado de verde, perfeito para famílias.","en":"Cottage (demo) surrounded by green, perfect for families."}', 'Serra', 'Sintra', 'Caminho da Floresta 19', 210.00, 6, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627199/2f517677-7fcc-4cca-bbec-a9d3cc16d2b2_d4ucp9.avif'),
  (20020, 'Nexus Demo • Aveiro Central', '{"pt":"Estúdio (demo) central com vista para os canais.","en":"Central (demo) studio with canal views."}', 'Canais', 'Aveiro', 'Rua Central 20', 115.00, 2, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627200/ee133f4a-1dc0-4bbf-a24d-69fe2bf68bed_nsg1ip.avif')
ON CONFLICT (id) DO NOTHING;

-- Propriedades de outros owners (para o dev gerir como MANAGER e enriquecer o dashboard)
INSERT INTO properties (id, name, description, location, city, address, base_price, max_guests, is_active, image_url)
VALUES
  (20101, 'Demo Partner • Porto Modern', '{"pt":"Propriedade (demo) de parceiro. O dev gere como manager.","en":"Partner property (demo). Dev manages as manager."}', 'Centro', 'Porto', 'Rua do Parceiro 101', 135.00, 3, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/6a4147ba-1c4d-48dd-8983-4bfa84773ea5_g64dys.avif'),
  (20102, 'Demo Partner • Cascais Beach', '{"pt":"Propriedade (demo) de parceiro em Cascais.","en":"Partner property (demo) in Cascais."}', 'Guincho', 'Cascais', 'Estrada do Guincho 102', 260.00, 6, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/45671ecb-fd4f-4f0f-8b8b-f9ee3e9277b4_ptk9xl.avif'),
  (20103, 'Demo Partner • Coimbra Studio', '{"pt":"Propriedade (demo) de parceiro em Coimbra.","en":"Partner property (demo) in Coimbra."}', 'Alta', 'Coimbra', 'Rua da Universidade 103', 90.00, 2, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/2eb5b8ad-0b32-410e-98e1-311b8c81bf33_k83xkn.avif'),
  (20104, 'Demo Partner • Madeira View', '{"pt":"Propriedade (demo) de parceiro na Madeira.","en":"Partner property (demo) in Madeira."}', 'Funchal', 'Funchal', 'Caminho do Mar 104', 190.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/a709572e-f938-41f4-8de0-41840322972a_opb1b2.avif'),
  (20105, 'Demo Partner • Algarve Family', '{"pt":"Propriedade (demo) de parceiro no Algarve para famílias.","en":"Partner property (demo) in Algarve for families."}', 'Algarve', 'Lagos', 'Rua da Família 105', 310.00, 8, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/e916c971-0e58-4dcf-b13e-dbef345e5013_tkalld.avif'),
  (20106, 'Demo Partner • Évora Historic', '{"pt":"Propriedade (demo) de parceiro no centro histórico.","en":"Partner property (demo) in the historic centre."}', 'Centro Histórico', 'Évora', 'Rua do Património 106', 120.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/89351a48-558a-4e2b-972a-fd191984d493_wieoh4.avif')
ON CONFLICT (id) DO NOTHING;

-- Permissões: dev é PRIMARY_OWNER nas suas propriedades (inclui novas)
INSERT INTO property_permissions (id, property_id, user_id, access_level)
SELECT nextval('property_permissions_seq'), p.id, 999, 'PRIMARY_OWNER'
FROM properties p
WHERE p.id BETWEEN 20001 AND 20020
ON CONFLICT DO NOTHING;

-- Staff oficial (assistente) tem acesso STAFF a todas as propriedades do dev (para testar workflows)
INSERT INTO property_permissions (id, property_id, user_id, access_level)
SELECT nextval('property_permissions_seq'), p.id, 2002, 'STAFF'
FROM properties p
WHERE p.id BETWEEN 20001 AND 20020
ON CONFLICT DO NOTHING;

-- Propriedades de parceiros: owners reais (já existem no user-service) + dev como MANAGER + staff como STAFF
INSERT INTO property_permissions (id, property_id, user_id, access_level)
VALUES
  (nextval('property_permissions_seq'), 20101, 1003, 'PRIMARY_OWNER'),
  (nextval('property_permissions_seq'), 20102, 1013, 'PRIMARY_OWNER'),
  (nextval('property_permissions_seq'), 20103, 1022, 'PRIMARY_OWNER'),
  (nextval('property_permissions_seq'), 20104, 1038, 'PRIMARY_OWNER'),
  (nextval('property_permissions_seq'), 20105, 1040, 'PRIMARY_OWNER'),
  (nextval('property_permissions_seq'), 20106, 1008, 'PRIMARY_OWNER')
ON CONFLICT DO NOTHING;

INSERT INTO property_permissions (id, property_id, user_id, access_level)
SELECT nextval('property_permissions_seq'), p.id, 999, 'MANAGER'
FROM properties p
WHERE p.id BETWEEN 20101 AND 20106
ON CONFLICT DO NOTHING;

INSERT INTO property_permissions (id, property_id, user_id, access_level)
SELECT nextval('property_permissions_seq'), p.id, 2002, 'STAFF'
FROM properties p
WHERE p.id BETWEEN 20101 AND 20106
ON CONFLICT DO NOTHING;

-- Regras operacionais para novas propriedades (mantém quote/validação “realistas”)
INSERT INTO property_rules (property_id, check_in_time, check_out_time, min_nights, max_nights, booking_lead_time_days)
VALUES
  (20013, '15:00', '11:00', 2, 21, 1),
  (20014, '15:00', '11:00', 1, 14, 0),
  (20015, '15:00', '11:00', 1, 10, 0),
  (20016, '15:00', '11:00', 2, 14, 0),
  (20017, '15:00', '11:00', 1, 21, 0),
  (20018, '16:00', '10:00', 2, 28, 2),
  (20019, '16:00', '10:00', 3, 21, 2),
  (20020, '15:00', '11:00', 1, 14, 0),
  (20101, '15:00', '11:00', 1, 14, 0),
  (20102, '16:00', '10:00', 2, 21, 2),
  (20103, '15:00', '11:00', 1, 10, 0),
  (20104, '15:00', '11:00', 2, 21, 1),
  (20105, '16:00', '10:00', 4, 30, 3),
  (20106, '15:00', '11:00', 2, 21, 1)
ON CONFLICT (property_id) DO UPDATE
SET check_in_time = EXCLUDED.check_in_time,
    check_out_time = EXCLUDED.check_out_time,
    min_nights = EXCLUDED.min_nights,
    max_nights = EXCLUDED.max_nights,
    booking_lead_time_days = EXCLUDED.booking_lead_time_days;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'properties') THEN
    PERFORM setval(
      pg_get_serial_sequence('properties', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM properties)
    );
  END IF;
END $$;

