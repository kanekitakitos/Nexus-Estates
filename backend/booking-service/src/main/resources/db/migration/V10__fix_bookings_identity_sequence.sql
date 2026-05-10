DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'bookings') THEN
    PERFORM setval(
      pg_get_serial_sequence('bookings', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM bookings)
    );
  END IF;
END $$;
