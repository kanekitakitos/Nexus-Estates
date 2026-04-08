-- Link payments and invoices to Dev User Bookings (99001, 99002)

INSERT INTO payments (id, booking_id, provider, payment_intent_id, currency, amount, status, created_at, updated_at)
VALUES 
    (990001, 99001, 'STRIPE', 'pi_devtest_990001', 'EUR', 850.00, 'SUCCEEDED', NOW(), NOW()),
    (990002, 99002, 'STRIPE', 'pi_devtest_990002', 'EUR', 700.00, 'SUCCEEDED', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, payment_id, provider, legal_id, pdf_url, status, issued_at, created_at)
VALUES 
    (990001, 990001, 'INVOICE_EXPRESS', 'INV-2026-9901', 'http://nexus-estates.local/faturas/INV-2026-9901.pdf', 'ISSUED', NOW(), NOW()),
    (990002, 990002, 'INVOICE_EXPRESS', 'INV-2026-9902', 'http://nexus-estates.local/faturas/INV-2026-9902.pdf', 'ISSUED', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update sequences
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'payments') THEN
      PERFORM setval(pg_get_serial_sequence('payments', 'id'), 1000000);
   END IF;
   IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'invoices') THEN
      PERFORM setval(pg_get_serial_sequence('invoices', 'id'), 1000000);
   END IF;
END $$;
