-- Demo dataset: bookings ao longo do ano para enriquecer o dashboard do dev (id=999)
-- Notas:
-- - usa propriedades do dev (20001..20020) e propriedades de parceiros geridas pelo dev (20101..20106)
-- - mistura estados e inclui alguns BLOCKED (manutenção/uso proprietário)

INSERT INTO bookings (id, property_id, user_id, check_in_date, check_out_date, guest_count, total_price, currency, status, payment_intent_id, created_at, updated_at, cancellation_reason)
VALUES
  -- Q1 (mais histórico): maioritariamente COMPLETED/REFUNDED/CANCELLED
  (210001, 20001, 1004, '2026-01-10', '2026-01-13', 2, 285.00, 'EUR', 'COMPLETED', 'pi_demo_210001', NOW() - INTERVAL '160 days', NOW() - INTERVAL '150 days', NULL),
  (210002, 20004, 1014, '2026-01-22', '2026-01-25', 2, 360.00, 'EUR', 'COMPLETED', 'pi_demo_210002', NOW() - INTERVAL '145 days', NOW() - INTERVAL '140 days', NULL),
  (210003, 20010, 1035, '2026-02-03', '2026-02-06', 2, 420.00, 'EUR', 'REFUNDED',  'pi_demo_210003', NOW() - INTERVAL '130 days', NOW() - INTERVAL '125 days', 'Reembolso demo: cancelamento após pagamento'),
  (210004, 20011, 1020, '2026-02-14', '2026-02-16', 2, 215.00, 'EUR', 'COMPLETED', 'pi_demo_210004', NOW() - INTERVAL '125 days', NOW() - INTERVAL '120 days', NULL),
  (210005, 20008, 1006, '2026-03-06', '2026-03-09', 1, 320.00, 'EUR', 'COMPLETED', 'pi_demo_210005', NOW() - INTERVAL '110 days', NOW() - INTERVAL '100 days', NULL),
  (210006, 20103, 1041, '2026-03-20', '2026-03-23', 2, 310.00, 'EUR', 'CANCELLED','pi_demo_210006', NOW() - INTERVAL '95 days',  NOW() - INTERVAL '94 days',  'Cancelamento demo: mudança de planos'),

  -- Q2 (perto do presente): mistura de COMPLETED + CONFIRMED + PENDING_PAYMENT
  (210007, 20002, 1017, '2026-04-02', '2026-04-05', 2, 540.00, 'EUR', 'COMPLETED', 'pi_demo_210007', NOW() - INTERVAL '60 days', NOW() - INTERVAL '55 days', NULL),
  (210008, 20006, 1047, '2026-04-16', '2026-04-18', 2, 360.00, 'EUR', 'COMPLETED', 'pi_demo_210008', NOW() - INTERVAL '50 days', NOW() - INTERVAL '45 days', NULL),
  (210009, 20015, 1009, '2026-05-09', '2026-05-12', 2, 420.00, 'EUR', 'PENDING_PAYMENT', 'pi_demo_210009', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NULL),
  (210010, 20014, 1023, '2026-05-18', '2026-05-22', 2, 640.00, 'EUR', 'CONFIRMED', 'pi_demo_210010', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', NULL),
  (210011, 20101, 1031, '2026-06-06', '2026-06-09', 2, 520.00, 'EUR', 'CONFIRMED', 'pi_demo_210011', NOW() - INTERVAL '22 days', NOW() - INTERVAL '20 days', NULL),
  (210012, 20013, NULL, '2026-06-18', '2026-06-21', 2, 610.00, 'EUR', 'PENDING_PAYMENT', 'pi_demo_210012', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NULL),

  -- Q3 (verão): mais volume + valores mais altos
  (210013, 20009, 1020, '2026-07-02', '2026-07-09', 6, 2950.00, 'EUR', 'CONFIRMED', 'pi_demo_210013', NOW() - INTERVAL '35 days', NOW() - INTERVAL '33 days', NULL),
  (210014, 20003, 1014, '2026-07-12', '2026-07-17', 4, 1820.00, 'EUR', 'CONFIRMED', 'pi_demo_210014', NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days', NULL),
  (210015, 20016, 1004, '2026-07-22', '2026-07-25', 2, 780.00,  'EUR', 'PENDING_PAYMENT', 'pi_demo_210015', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NULL),
  (210016, 20102, 1041, '2026-08-01', '2026-08-06', 2, 1450.00, 'EUR', 'CONFIRMED', 'pi_demo_210016', NOW() - INTERVAL '40 days', NOW() - INTERVAL '38 days', NULL),
  (210017, 20019, 1035, '2026-08-10', '2026-08-16', 5, 2100.00, 'EUR', 'CONFIRMED', 'pi_demo_210017', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', NULL),
  (210018, 20020, NULL, '2026-08-21', '2026-08-24', 2, 520.00,  'EUR', 'PENDING_PAYMENT', 'pi_demo_210018', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NULL),
  (210019, 20105, 1017, '2026-09-05', '2026-09-12', 6, 2650.00, 'EUR', 'CONFIRMED', 'pi_demo_210019', NOW() - INTERVAL '55 days', NOW() - INTERVAL '53 days', NULL),
  (210020, 20005, 1006, '2026-09-18', '2026-09-22', 2, 980.00,  'EUR', 'CONFIRMED', 'pi_demo_210020', NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days', NULL),

  -- Q4 (outono/inverno + natal): mistura e alguns cancelamentos
  (210021, 20007, 1043, '2026-10-03', '2026-10-06', 2, 460.00, 'EUR', 'CONFIRMED', 'pi_demo_210021', NOW() - INTERVAL '25 days', NOW() - INTERVAL '23 days', NULL),
  (210022, 20018, 1025, '2026-10-20', '2026-10-24', 4, 880.00, 'EUR', 'PENDING_PAYMENT', 'pi_demo_210022', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', NULL),
  (210023, 20106, 1031, '2026-11-07', '2026-11-10', 2, 420.00, 'EUR', 'CANCELLED', 'pi_demo_210023', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', 'Cancelamento demo: atraso de viagem'),
  (210024, 20012, 1010, '2026-11-22', '2026-11-25', 3, 690.00, 'EUR', 'CONFIRMED', 'pi_demo_210024', NOW() - INTERVAL '18 days', NOW() - INTERVAL '17 days', NULL),
  (210025, 20001, 1004, '2026-12-20', '2026-12-27', 2, 1280.00, 'EUR', 'CONFIRMED', 'pi_demo_210025', NOW() - INTERVAL '40 days', NOW() - INTERVAL '39 days', NULL),
  (210026, 20002, NULL, '2026-12-28', '2027-01-03', 2, 1120.00, 'EUR', 'PENDING_PAYMENT', 'pi_demo_210026', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL),

  -- Bloqueios técnicos (para calendário)
  (210027, 20009, 999,  '2026-08-17', '2026-08-19', 1, 0.01,   'EUR', 'BLOCKED', NULL, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 'Bloqueio demo: manutenção'),
  (210028, 20013, 999,  '2026-07-13', '2026-07-15', 1, 0.01,   'EUR', 'BLOCKED', NULL, NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days', 'Bloqueio demo: uso proprietário'),
  (210029, 20102, 999,  '2026-08-25', '2026-08-27', 1, 0.01,   'EUR', 'BLOCKED', NULL, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'Bloqueio demo: reparações');

-- Preencher detalhes de hóspede para bookings "guest-flow" (user_id NULL)
UPDATE bookings SET
  guest_full_name = 'Outlook Demo Guest',
  guest_email = 'guest.outlook.demo@nexus.com',
  guest_phone = '+351910111222',
  guest_nationality = 'PT',
  guest_issuing_country = 'PT',
  guest_document_type = 'PASSPORT',
  guest_document_number = 'P-OUTLOOK-210012',
  guest_document_issue_date = '2022-02-02'
WHERE id = 210012;

UPDATE bookings SET
  guest_full_name = 'Demo Guest Summer',
  guest_email = 'guest.summer.demo@nexus.com',
  guest_phone = '+351910333444',
  guest_nationality = 'ES',
  guest_issuing_country = 'ES',
  guest_document_type = 'ID',
  guest_document_number = 'ID-SUMMER-210018',
  guest_document_issue_date = '2021-06-06'
WHERE id = 210018;

UPDATE bookings SET
  guest_full_name = 'Demo Guest NYE',
  guest_email = 'guest.nye.demo@nexus.com',
  guest_phone = '+351910555666',
  guest_nationality = 'FR',
  guest_issuing_country = 'FR',
  guest_document_type = 'PASSPORT',
  guest_document_number = 'P-NYE-210026',
  guest_document_issue_date = '2020-12-12'
WHERE id = 210026;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'bookings') THEN
    PERFORM setval(
      pg_get_serial_sequence('bookings', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM bookings)
    );
  END IF;
END $$;

