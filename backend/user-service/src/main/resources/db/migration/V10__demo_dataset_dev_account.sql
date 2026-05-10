-- Demo dataset hardening for dev account + richer integrations/profiles
-- Ensures login works with: dev@nexus.com / 12345

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Force demo credentials for the existing dev account (id=999 in V8 seed)
UPDATE users
SET password = crypt('12345', gen_salt('bf', 10)),
    role = 'OWNER'
WHERE email = 'dev@nexus.com';

-- Demo external integrations for dev user (API keys are placeholders for UI/demo purposes)
INSERT INTO external_integrations (user_id, provider_name, api_key, active)
VALUES
  (999, 'AIRBNB',  'sk_demo_airbnb_dev_999_2026',   true),
  (999, 'BOOKING', 'sk_demo_booking_dev_999_2026',  true),
  (999, 'VRBO',    'sk_demo_vrbo_dev_999_2026',     true),
  (999, 'EXPEDIA', 'sk_demo_expedia_dev_999_2026',  false)
ON CONFLICT (user_id, provider_name) DO UPDATE
SET api_key = EXCLUDED.api_key,
    active = EXCLUDED.active;

-- Guest profiles (admin/manager can inspect richer guest metadata in demo)
INSERT INTO guest_profiles (user_id, internal_notes)
VALUES
  (1004, 'Hóspede frequente (demo). Prefere check-in tarde e comunicação por email.'),
  (1006, 'Hóspede (demo). Já reportou alergia a pó; evitar carpetes.'),
  (1014, 'Hóspede (demo). Viaja em trabalho; pede fatura sempre.'),
  (1020, 'Hóspede (demo). Pedido recorrente: berço para bebé.'),
  (1035, 'Hóspede (demo). Chega normalmente após as 22h; confirmar self-checkin.'),
  (1041, 'Hóspede (demo). Solicita parking sempre que disponível.')
ON CONFLICT (user_id) DO UPDATE
SET internal_notes = EXCLUDED.internal_notes;

-- Tags para enriquecer a UI de perfil de hóspedes
INSERT INTO guest_profile_tags (guest_profile_id, tag)
SELECT gp.id, t.tag
FROM guest_profiles gp
JOIN (VALUES
  (1004, 'vip'),
  (1004, 'repeat'),
  (1006, 'allergy'),
  (1006, 'quiet'),
  (1014, 'business'),
  (1014, 'invoice'),
  (1020, 'family'),
  (1035, 'late-arrival'),
  (1035, 'self-checkin'),
  (1041, 'parking')
) AS t(user_id, tag) ON t.user_id = gp.user_id
ON CONFLICT DO NOTHING;
