-- Demo dataset: cria conta oficial de staff/assistente para a conta dev
-- Login: nexusestates2026@outlook.pt / NEXUSESTATES_2026
-- Nota: mantém id fixo para poder ser referenciado em permissões de propriedades (property-service).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, email, password, phone, role, clerk_user_id)
VALUES (
  2002,
  'nexusestates2026@outlook.pt',
  crypt('NEXUSESTATES_2026', gen_salt('bf', 10)),
  '+351910202600',
  'STAFF',
  'user_staff_nexusestates2026'
)
ON CONFLICT (email) DO UPDATE
SET password = EXCLUDED.password,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    clerk_user_id = EXCLUDED.clerk_user_id;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users') THEN
    PERFORM setval(
      pg_get_serial_sequence('users', 'id'),
      (SELECT GREATEST(COALESCE(MAX(id), 1), 10000) FROM users)
    );
  END IF;
END $$;

