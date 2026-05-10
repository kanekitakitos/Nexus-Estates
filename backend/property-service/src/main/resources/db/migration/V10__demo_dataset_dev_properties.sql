-- Richer demo dataset centred on dev user (id=999)
-- Adds demo properties + permissions + rules + a few seasonality/override examples

-- New demo properties (ids aligned with properties sequence already set to 20000 in V9 seed)
INSERT INTO properties (id, name, description, location, city, address, base_price, max_guests, is_active, image_url)
VALUES
  (20001, 'Nexus Demo • Baixa Studio', '{"pt":"Estúdio no centro (demo) com self check-in.","en":"Downtown studio (demo) with self check-in."}', 'Baixa', 'Lisboa', 'Rua do Ouro 10', 95.00, 2, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/2eb5b8ad-0b32-410e-98e1-311b8c81bf33_k83xkn.avif'),
  (20002, 'Nexus Demo • Alfama View', '{"pt":"Apartamento (demo) com vista e varanda.","en":"Apartment (demo) with view and balcony."}', 'Alfama', 'Lisboa', 'Rua dos Remédios 21', 140.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/e916c971-0e58-4dcf-b13e-dbef345e5013_tkalld.avif'),
  (20003, 'Nexus Demo • Cascais Family', '{"pt":"Casa (demo) ideal para família, perto da praia.","en":"Family home (demo) near the beach."}', 'Cascais', 'Cascais', 'Rua da Praia 5', 220.00, 6, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/a709572e-f938-41f4-8de0-41840322972a_opb1b2.avif'),
  (20004, 'Nexus Demo • Porto Riverside', '{"pt":"T1 (demo) junto ao rio com estacionamento.","en":"1BR (demo) by the river with parking."}', 'Ribeira', 'Porto', 'Rua do Infante 99', 130.00, 3, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/3241620c-b81f-4b06-9147-c3316d41edd8_zftkfv.avif'),
  (20005, 'Nexus Demo • Madeira Escape', '{"pt":"Refúgio (demo) com terraço e vistas.","en":"Escape (demo) with terrace and views."}', 'Funchal', 'Funchal', 'Rua do Sol 77', 160.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626895/6a4147ba-1c4d-48dd-8983-4bfa84773ea5_g64dys.avif'),
  (20006, 'Nexus Demo • Sintra Cottage', '{"pt":"Cottage (demo) com jardim, perfeito para fim-de-semana.","en":"Cottage (demo) with garden, perfect for weekends."}', 'Sintra', 'Sintra', 'Caminho do Castelo 3', 180.00, 5, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/80e44391-928d-4645-baad-b7530fdcd3d5_lxa34f.avif'),
  (20007, 'Nexus Demo • Braga Modern', '{"pt":"Apartamento (demo) moderno e silencioso.","en":"Modern (demo) quiet apartment."}', 'Centro', 'Braga', 'Avenida Central 12', 110.00, 3, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/6dffbe95-f4c8-4def-8661-5e8b666d2a33_pbgnjf.avif'),
  (20008, 'Nexus Demo • Coimbra Loft', '{"pt":"Loft (demo) próximo da universidade.","en":"Loft (demo) near the university."}', 'Universidade', 'Coimbra', 'Rua Larga 1', 105.00, 2, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/45671ecb-fd4f-4f0f-8b8b-f9ee3e9277b4_ptk9xl.avif'),
  (20009, 'Nexus Demo • Lagos Pool', '{"pt":"Villa (demo) com piscina, ideal para verão.","en":"Villa (demo) with pool, great for summer."}', 'Algarve', 'Lagos', 'Avenida do Mar 8', 350.00, 8, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/69f498e1-9046-4684-ab5a-32812b02a087_kjbcex.avif'),
  (20010, 'Nexus Demo • Évora Heritage', '{"pt":"Casa (demo) no centro histórico.","en":"Home (demo) in the historic centre."}', 'Centro Histórico', 'Évora', 'Rua da Sé 14', 125.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777626894/b42bf256-f154-4a59-a2c3-137744b28ce7_nnyhvj.avif'),
  (20011, 'Nexus Demo • Aveiro Canal', '{"pt":"T0 (demo) junto aos canais, ótima localização.","en":"Studio (demo) by the canals, great location."}', 'Canais', 'Aveiro', 'Rua dos Moliceiros 2', 98.00, 2, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627200/ee133f4a-1dc0-4bbf-a24d-69fe2bf68bed_nsg1ip.avif'),
  (20012, 'Nexus Demo • Nazaré Surf', '{"pt":"Apartamento (demo) a 5 min da praia.","en":"Apartment (demo) 5 min from the beach."}', 'Praia', 'Nazaré', 'Rua do Norte 30', 150.00, 4, true, 'https://res.cloudinary.com/dsfjm1ncn/image/upload/v1777627200/de9bb0a6-225c-4744-9e5d-899cc80479d7_whhmq5.avif');

-- Permissions: dev owns all demo properties; add a couple of managers/staff to show team workflows
INSERT INTO property_permissions (id, property_id, user_id, access_level)
SELECT nextval('property_permissions_seq'), p.id, 999, 'PRIMARY_OWNER'
FROM properties p
WHERE p.id BETWEEN 20001 AND 20012
ON CONFLICT DO NOTHING;

-- Managers (demo)
INSERT INTO property_permissions (id, property_id, user_id, access_level)
SELECT nextval('property_permissions_seq'), p.id, 1000, 'MANAGER'
FROM properties p
WHERE p.id IN (20001,20002,20003,20004,20005,20006)
ON CONFLICT DO NOTHING;

-- Staff (demo)
INSERT INTO property_permissions (id, property_id, user_id, access_level)
SELECT nextval('property_permissions_seq'), p.id, 1001, 'STAFF'
FROM properties p
WHERE p.id BETWEEN 20001 AND 20010
ON CONFLICT DO NOTHING;

-- Property rules (operational constraints used by quote/booking validation)
INSERT INTO property_rules (property_id, check_in_time, check_out_time, min_nights, max_nights, booking_lead_time_days)
VALUES
  (20001, '15:00', '11:00', 1, 14, 0),
  (20002, '15:00', '11:00', 2, 21, 1),
  (20003, '16:00', '10:00', 2, 30, 2),
  (20004, '15:00', '11:00', 1, 14, 0),
  (20005, '15:00', '11:00', 3, 28, 2),
  (20006, '16:00', '10:00', 2, 10, 0),
  (20007, '15:00', '11:00', 1, 20, 1),
  (20008, '15:00', '11:00', 1, 14, 0),
  (20009, '16:00', '10:00', 4, 30, 3),
  (20010, '15:00', '11:00', 2, 21, 1),
  (20011, '15:00', '11:00', 1, 14, 0),
  (20012, '15:00', '11:00', 2, 14, 0)
ON CONFLICT (property_id) DO UPDATE
SET check_in_time = EXCLUDED.check_in_time,
    check_out_time = EXCLUDED.check_out_time,
    min_nights = EXCLUDED.min_nights,
    max_nights = EXCLUDED.max_nights,
    booking_lead_time_days = EXCLUDED.booking_lead_time_days;

-- Seasonality examples (summer premium + weekend premium on a few properties)
INSERT INTO seasonality_rules (id, property_id, start_date, end_date, price_modifier, day_of_week, channel)
VALUES
  (300001, 20003, '2026-06-01', '2026-09-30', 40.00, NULL, NULL),
  (300002, 20009, '2026-06-01', '2026-09-30', 60.00, NULL, NULL),
  (300003, 20001, '2026-01-01', '2026-12-31', 15.00, 'FRIDAY', NULL),
  (300004, 20001, '2026-01-01', '2026-12-31', 15.00, 'SATURDAY', NULL)
ON CONFLICT (id) DO NOTHING;

-- Rule override examples (strict min nights during a special event)
INSERT INTO rule_overrides (id, property_id, start_date, end_date, min_nights_override)
VALUES
  (400001, 20001, '2026-12-20', '2027-01-05', 4),
  (400002, 20009, '2026-08-01', '2026-08-31', 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rule_override_check_in_days (rule_override_id, day_of_week)
VALUES
  (400001, 'FRIDAY'),
  (400001, 'SATURDAY'),
  (400002, 'SATURDAY')
ON CONFLICT DO NOTHING;

INSERT INTO rule_override_check_out_days (rule_override_id, day_of_week)
VALUES
  (400001, 'MONDAY'),
  (400001, 'TUESDAY'),
  (400002, 'SATURDAY')
ON CONFLICT DO NOTHING;

-- Add amenities to demo properties (keeps UI rich)
INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id
FROM properties p
JOIN amenities a ON a.icon IN ('wifi','workspace','parking','air-conditioner','kitchen','pool','hot-tub','fireplace')
WHERE p.id IN (20001,20002,20003,20004,20006,20009)
ON CONFLICT DO NOTHING;
