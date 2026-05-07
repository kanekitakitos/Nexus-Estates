DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'properties') THEN
    PERFORM setval(
      pg_get_serial_sequence('properties', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM properties)
    );
  END IF;
END $$;
