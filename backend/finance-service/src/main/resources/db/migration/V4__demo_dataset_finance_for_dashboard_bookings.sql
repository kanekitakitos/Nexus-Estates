-- Demo dataset: finanças adicionais (payments + invoices) para bookings do dashboard (booking-service V11)

INSERT INTO payments (id, booking_id, provider, payment_intent_id, currency, amount, status, created_at, updated_at)
VALUES
  (310001, 210001, 'STRIPE', 'pi_demo_210001', 'EUR', 285.00,  'SUCCEEDED',      NOW() - INTERVAL '150 days', NOW() - INTERVAL '150 days'),
  (310002, 210002, 'STRIPE', 'pi_demo_210002', 'EUR', 360.00,  'SUCCEEDED',      NOW() - INTERVAL '140 days', NOW() - INTERVAL '140 days'),
  (310003, 210003, 'STRIPE', 'pi_demo_210003', 'EUR', 420.00,  'FULLY_REFUNDED', NOW() - INTERVAL '125 days', NOW() - INTERVAL '125 days'),
  (310004, 210007, 'STRIPE', 'pi_demo_210007', 'EUR', 540.00,  'SUCCEEDED',      NOW() - INTERVAL '55 days',  NOW() - INTERVAL '55 days'),
  (310005, 210008, 'STRIPE', 'pi_demo_210008', 'EUR', 360.00,  'SUCCEEDED',      NOW() - INTERVAL '45 days',  NOW() - INTERVAL '45 days'),
  (310006, 210009, 'STRIPE', 'pi_demo_210009', 'EUR', 420.00,  'PENDING',        NOW() - INTERVAL '8 days',   NOW() - INTERVAL '8 days'),
  (310007, 210010, 'STRIPE', 'pi_demo_210010', 'EUR', 640.00,  'SUCCEEDED',      NOW() - INTERVAL '10 days',  NOW() - INTERVAL '10 days'),
  (310008, 210011, 'STRIPE', 'pi_demo_210011', 'EUR', 520.00,  'SUCCEEDED',      NOW() - INTERVAL '20 days',  NOW() - INTERVAL '20 days'),
  (310009, 210012, 'STRIPE', 'pi_demo_210012', 'EUR', 610.00,  'PENDING',        NOW() - INTERVAL '6 days',   NOW() - INTERVAL '6 days'),
  (310010, 210013, 'STRIPE', 'pi_demo_210013', 'EUR', 2950.00, 'SUCCEEDED',      NOW() - INTERVAL '33 days',  NOW() - INTERVAL '33 days'),
  (310011, 210017, 'STRIPE', 'pi_demo_210017', 'EUR', 2100.00, 'SUCCEEDED',      NOW() - INTERVAL '18 days',  NOW() - INTERVAL '18 days'),
  (310012, 210023, 'STRIPE', 'pi_demo_210023', 'EUR', 420.00,  'CANCELLED',      NOW() - INTERVAL '13 days',  NOW() - INTERVAL '13 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, payment_id, provider, legal_id, pdf_url, status, issued_at, created_at)
VALUES
  (310001, 310001, 'INVOICE_EXPRESS', 'INV-DEMO-210001', 'http://nexus-estates.local/faturas/INV-DEMO-210001.pdf', 'ISSUED',  NOW() - INTERVAL '150 days', NOW() - INTERVAL '150 days'),
  (310002, 310002, 'INVOICE_EXPRESS', 'INV-DEMO-210002', 'http://nexus-estates.local/faturas/INV-DEMO-210002.pdf', 'ISSUED',  NOW() - INTERVAL '140 days', NOW() - INTERVAL '140 days'),
  (310003, 310004, 'INVOICE_EXPRESS', 'INV-DEMO-210007', 'http://nexus-estates.local/faturas/INV-DEMO-210007.pdf', 'ISSUED',  NOW() - INTERVAL '55 days',  NOW() - INTERVAL '55 days'),
  (310004, 310005, 'INVOICE_EXPRESS', 'INV-DEMO-210008', 'http://nexus-estates.local/faturas/INV-DEMO-210008.pdf', 'ISSUED',  NOW() - INTERVAL '45 days',  NOW() - INTERVAL '45 days'),
  (310005, 310007, 'INVOICE_EXPRESS', 'INV-DEMO-210010', 'http://nexus-estates.local/faturas/INV-DEMO-210010.pdf', 'ISSUED',  NOW() - INTERVAL '10 days',  NOW() - INTERVAL '10 days'),
  (310006, 310010, 'INVOICE_EXPRESS', 'INV-DEMO-210013', 'http://nexus-estates.local/faturas/INV-DEMO-210013.pdf', 'ISSUED',  NOW() - INTERVAL '33 days',  NOW() - INTERVAL '33 days'),
  (310007, 310011, 'INVOICE_EXPRESS', NULL,              NULL,                                                   'PENDING', NULL,                    NOW() - INTERVAL '18 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO processed_events (id, provider, event_id, event_type, processed_at)
VALUES
  (310001, 'STRIPE', 'evt_demo_pi_demo_210001_succeeded', 'payment_intent.succeeded', NOW() - INTERVAL '150 days'),
  (310002, 'STRIPE', 'evt_demo_pi_demo_210003_refunded',  'charge.refunded',          NOW() - INTERVAL '125 days'),
  (310003, 'STRIPE', 'evt_demo_pi_demo_210010_succeeded', 'payment_intent.succeeded', NOW() - INTERVAL '10 days')
ON CONFLICT (provider, event_id) DO NOTHING;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments') THEN
    PERFORM setval(pg_get_serial_sequence('payments', 'id'), (SELECT COALESCE(MAX(id), 1) FROM payments));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices') THEN
    PERFORM setval(pg_get_serial_sequence('invoices', 'id'), (SELECT COALESCE(MAX(id), 1) FROM invoices));
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'processed_events') THEN
    PERFORM setval(pg_get_serial_sequence('processed_events', 'id'), (SELECT COALESCE(MAX(id), 1) FROM processed_events));
  END IF;
END $$;

