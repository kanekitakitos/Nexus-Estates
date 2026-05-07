-- Richer demo dataset centred on dev user (id=999)
-- Also normalizes legacy seed statuses to match BookingStatus enum

-- Fix legacy seed rows that used a non-existent enum value 'PENDING'
UPDATE bookings
SET status = 'PENDING_PAYMENT'
WHERE status = 'PENDING';

-- Demo bookings: mix of incoming reservations on dev-owned properties + dev as guest + guest-flow bookings + BLOCKED
INSERT INTO bookings (id, property_id, user_id, check_in_date, check_out_date, guest_count, total_price, currency, status, payment_intent_id, created_at, updated_at, cancellation_reason)
VALUES
  -- Incoming bookings on dev properties (20001-20012)
  (200001, 20001, 1004, '2026-05-10', '2026-05-12', 2, 210.00, 'EUR', 'PENDING_PAYMENT', 'pi_demo_200001', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NULL),
  (200002, 20002, 1014, '2026-06-03', '2026-06-07', 2, 560.00, 'EUR', 'CONFIRMED',       'pi_demo_200002', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', NULL),
  (200003, 20003, 1020, '2026-07-01', '2026-07-06', 4, 1250.00,'EUR', 'CONFIRMED',       'pi_demo_200003', NOW() - INTERVAL '35 days', NOW() - INTERVAL '30 days', NULL),
  (200004, 20004, 1035, '2026-04-18', '2026-04-20', 2, 260.00, 'EUR', 'CANCELLED',       'pi_demo_200004', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', 'Cancelamento demo: mudança de planos'),
  (200005, 20005, 1041, '2026-08-11', '2026-08-15', 3, 720.00, 'EUR', 'PENDING_PAYMENT', 'pi_demo_200005', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days',  NULL),
  (200006, 20006, 1006, '2026-09-02', '2026-09-05', 2, 540.00, 'EUR', 'COMPLETED',       'pi_demo_200006', NOW() - INTERVAL '120 days',NOW() - INTERVAL '90 days', NULL),
  (200007, 20007, 1031, '2026-10-07', '2026-10-10', 2, 330.00, 'EUR', 'CONFIRMED',       'pi_demo_200007', NOW() - INTERVAL '25 days', NOW() - INTERVAL '23 days', NULL),
  (200008, 20008, 1047, '2026-03-12', '2026-03-14', 1, 210.00, 'EUR', 'CANCELLED',       'pi_demo_200008', NOW() - INTERVAL '40 days', NOW() - INTERVAL '39 days', 'Cancelamento demo: voo atrasado'),
  (200009, 20009, 1009, '2026-08-20', '2026-08-27', 6, 2450.00,'EUR', 'CONFIRMED',       'pi_demo_200009', NOW() - INTERVAL '60 days', NOW() - INTERVAL '58 days', NULL),
  (200010, 20010, 1010, '2026-02-02', '2026-02-06', 2, 500.00, 'EUR', 'REFUNDED',        'pi_demo_200010', NOW() - INTERVAL '150 days',NOW() - INTERVAL '140 days', 'Reembolso demo: cancelamento após pagamento'),
  (200011, 20011, 1043, '2026-11-14', '2026-11-16', 2, 196.00, 'EUR', 'PENDING_PAYMENT', 'pi_demo_200011', NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days',  NULL),
  (200012, 20012, 1017, '2026-12-27', '2027-01-02', 3, 900.00, 'EUR', 'PENDING_PAYMENT', 'pi_demo_200012', NOW() - INTERVAL '1 days',  NOW() - INTERVAL '1 days',  NULL),

  -- Dev as guest on existing properties (9901-10000 range)
  (200013, 9920, 999,  '2026-05-21', '2026-05-24', 2, 480.00, 'EUR', 'CONFIRMED',       'pi_demo_200013', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NULL),
  (200014, 9955, 999,  '2026-06-10', '2026-06-12', 2, 260.00, 'EUR', 'CANCELLED',       'pi_demo_200014', NOW() - INTERVAL '22 days', NOW() - INTERVAL '21 days', 'Cancelamento demo: overbooking'),
  (200015, 9977, 999,  '2026-09-18', '2026-09-22', 2, 520.00, 'EUR', 'COMPLETED',       'pi_demo_200015', NOW() - INTERVAL '200 days',NOW() - INTERVAL '180 days', NULL),
  (200016, 9994, 999,  '2026-10-01', '2026-10-03', 1, 240.00, 'EUR', 'PENDING_PAYMENT', 'pi_demo_200016', NOW() - INTERVAL '3 days',  NOW() - INTERVAL '3 days',  NULL),
  (200017, 9938, 999,  '2026-07-15', '2026-07-18', 2, 390.00, 'EUR', 'CONFIRMED',       'pi_demo_200017', NOW() - INTERVAL '33 days', NOW() - INTERVAL '32 days', NULL),

  -- Guest-flow bookings (user_id NULL + guest fields)
  (200018, 20001, NULL,'2026-06-18', '2026-06-20', 2, 190.00, 'EUR', 'CONFIRMED',       'pi_demo_200018', NOW() - INTERVAL '70 days', NOW() - INTERVAL '68 days', NULL),
  (200019, 20002, NULL,'2026-07-22', '2026-07-25', 2, 420.00, 'EUR', 'PENDING_PAYMENT', 'pi_demo_200019', NOW() - INTERVAL '6 days',  NOW() - INTERVAL '6 days',  NULL),
  (200020, 20004, NULL,'2026-03-03', '2026-03-05', 1, 210.00, 'EUR', 'CANCELLED',       'pi_demo_200020', NOW() - INTERVAL '90 days', NOW() - INTERVAL '88 days', 'Cancelamento demo: documento em falta'),

  -- Technical blocks (calendar) on dev properties
  (200021, 20001, 999, '2026-08-05', '2026-08-09', 1, 0.01,   'EUR', 'BLOCKED',         NULL,             NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'Bloqueio demo: manutenção'),
  (200022, 20003, 999, '2026-06-25', '2026-06-28', 1, 0.01,   'EUR', 'BLOCKED',         NULL,             NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', 'Bloqueio demo: uso proprietário'),
  (200023, 20009, 999, '2026-09-10', '2026-09-12', 1, 0.01,   'EUR', 'BLOCKED',         NULL,             NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', 'Bloqueio demo: evento local');

-- Fill guest details for the guest-flow bookings (keeps dataset richer without changing application code)
UPDATE bookings SET
  guest_full_name = 'Guest Demo One',
  guest_email = 'guest.demo.one@nexus.com',
  guest_phone = '+351910000111',
  guest_nationality = 'PT',
  guest_issuing_country = 'PT',
  guest_document_type = 'PASSPORT',
  guest_document_number = 'P-DEV-200018',
  guest_document_issue_date = '2021-05-01'
WHERE id = 200018;

UPDATE bookings SET
  guest_full_name = 'Guest Demo Two',
  guest_email = 'guest.demo.two@nexus.com',
  guest_phone = '+351910000222',
  guest_nationality = 'ES',
  guest_issuing_country = 'ES',
  guest_document_type = 'ID',
  guest_document_number = 'ID-DEV-200019',
  guest_document_issue_date = '2020-10-10'
WHERE id = 200019;

UPDATE bookings SET
  guest_full_name = 'Guest Demo Three',
  guest_email = 'guest.demo.three@nexus.com',
  guest_phone = '+351910000333',
  guest_nationality = 'FR',
  guest_issuing_country = 'FR',
  guest_document_type = 'PASSPORT',
  guest_document_number = 'P-DEV-200020',
  guest_document_issue_date = '2019-07-07'
WHERE id = 200020;

