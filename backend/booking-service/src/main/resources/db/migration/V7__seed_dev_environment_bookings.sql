-- Seed 'Dev' environment Bookings
-- Ties into Property IDs (9901, 9902) owned by User 999 
-- Guest ID used: 3 (Miguel from test data)

INSERT INTO bookings (id, property_id, user_id, check_in_date, check_out_date, guest_count, total_price, currency, status, created_at, updated_at)
VALUES 
    (99001, 9901, 3, '2026-05-10', '2026-05-15', 2, 850.00, 'EUR', 'CONFIRMED', NOW(), NOW()),
    (99002, 9902, 3, '2026-06-20', '2026-06-25', 2, 700.00, 'EUR', 'COMPLETED', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update sequences
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'bookings') THEN
      PERFORM setval(pg_get_serial_sequence('bookings', 'id'), 100000);
   END IF;
END $$;
