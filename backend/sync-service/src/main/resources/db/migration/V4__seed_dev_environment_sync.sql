-- Seed Dev Environment Sync Chat Logs
-- Connects to Bookings 99001 and 99002
-- Simulating conversation between Dev User (Host: id 999/user_2devTester) and Guest (id 3)

INSERT INTO messages (id, booking_id, sender_id, content, created_at)
VALUES 
    (990001, 99001, '3', 'Hello, can we check in earlier?', NOW() - INTERVAL '2 days'),
    (990002, 99001, '999', 'Yes, of course. Check-in is available from 12:00.', NOW() - INTERVAL '1 day'),
    (990003, 99002, '3', 'Thanks for the booking! What is the wifi password?', NOW() - INTERVAL '5 hours'),
    (990004, 99002, '999', 'The wifi is NexusFast, password is on the table.', NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- Update sequences
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'messages') THEN
      PERFORM setval(pg_get_serial_sequence('messages', 'id'), 1000000);
   END IF;
END $$;
