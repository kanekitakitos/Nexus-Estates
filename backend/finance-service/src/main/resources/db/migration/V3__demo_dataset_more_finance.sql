-- Richer demo dataset centred on dev-owned bookings (see booking-service V9 demo seed)
-- Payments and invoices are linked to demo booking ids (20000x)

INSERT INTO payments (id, booking_id, provider, payment_intent_id, currency, amount, status, created_at, updated_at)
VALUES
  (300001, 200001, 'STRIPE', 'pi_demo_200001', 'EUR', 210.00,  'PENDING',          NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  (300002, 200002, 'STRIPE', 'pi_demo_200002', 'EUR', 560.00,  'SUCCEEDED',        NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'),
  (300003, 200003, 'STRIPE', 'pi_demo_200003', 'EUR', 1250.00, 'SUCCEEDED',        NOW() - INTERVAL '35 days', NOW() - INTERVAL '30 days'),
  (300004, 200004, 'STRIPE', 'pi_demo_200004', 'EUR', 260.00,  'CANCELLED',        NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days'),
  (300005, 200006, 'STRIPE', 'pi_demo_200006', 'EUR', 540.00,  'SUCCEEDED',        NOW() - INTERVAL '120 days',NOW() - INTERVAL '90 days'),
  (300006, 200010, 'STRIPE', 'pi_demo_200010', 'EUR', 500.00,  'FULLY_REFUNDED',   NOW() - INTERVAL '150 days',NOW() - INTERVAL '140 days'),
  (300007, 200013, 'STRIPE', 'pi_demo_200013', 'EUR', 480.00,  'SUCCEEDED',        NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'),
  (300008, 200014, 'STRIPE', 'pi_demo_200014', 'EUR', 260.00,  'FAILED',           NOW() - INTERVAL '22 days', NOW() - INTERVAL '21 days'),
  (300009, 200015, 'STRIPE', 'pi_demo_200015', 'EUR', 520.00,  'SUCCEEDED',        NOW() - INTERVAL '200 days',NOW() - INTERVAL '180 days'),
  (300010, 200018, 'STRIPE', 'pi_demo_200018', 'EUR', 190.00,  'SUCCEEDED',        NOW() - INTERVAL '70 days', NOW() - INTERVAL '68 days')
ON CONFLICT (id) DO NOTHING;

-- Invoices for succeeded payments (mix of ISSUED and PENDING for demo)
INSERT INTO invoices (id, payment_id, provider, legal_id, pdf_url, status, issued_at, created_at)
VALUES
  (300001, 300002, 'INVOICE_EXPRESS', 'INV-DEMO-200002', 'http://nexus-estates.local/faturas/INV-DEMO-200002.pdf', 'ISSUED',  NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
  (300002, 300003, 'INVOICE_EXPRESS', 'INV-DEMO-200003', 'http://nexus-estates.local/faturas/INV-DEMO-200003.pdf', 'ISSUED',  NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (300003, 300005, 'INVOICE_EXPRESS', NULL,             NULL,                                                  'PENDING', NULL,                   NOW() - INTERVAL '90 days'),
  (300004, 300007, 'INVOICE_EXPRESS', 'INV-DEMO-200013', 'http://nexus-estates.local/faturas/INV-DEMO-200013.pdf', 'ISSUED',  NOW() - INTERVAL '9 days',  NOW() - INTERVAL '9 days'),
  (300005, 300010, 'INVOICE_EXPRESS', 'INV-DEMO-200018', 'http://nexus-estates.local/faturas/INV-DEMO-200018.pdf', 'ISSUED',  NOW() - INTERVAL '68 days', NOW() - INTERVAL '68 days')
ON CONFLICT (id) DO NOTHING;

-- Processed events to demonstrate webhook idempotency behaviour
INSERT INTO processed_events (id, provider, event_id, event_type, processed_at)
VALUES
  (300001, 'STRIPE', 'evt_demo_pi_demo_200002_succeeded', 'payment_intent.succeeded', NOW() - INTERVAL '18 days'),
  (300002, 'STRIPE', 'evt_demo_pi_demo_200003_succeeded', 'payment_intent.succeeded', NOW() - INTERVAL '30 days'),
  (300003, 'STRIPE', 'evt_demo_pi_demo_200010_refunded',  'charge.refunded',          NOW() - INTERVAL '140 days')
ON CONFLICT (provider, event_id) DO NOTHING;
