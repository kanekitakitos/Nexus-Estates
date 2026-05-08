-- Demo dataset: sazonalidade rica ao longo do ano (com pico no verão) para propriedades do dashboard do dev (id=999)
-- Nota: o frontend assume price_modifier como "multiplicador" (ex.: 1.35 = +35%).

-- Normaliza exemplos antigos que foram semeados como "percentagem" (ex.: 40.00 em vez de 1.40).
UPDATE seasonality_rules
SET price_modifier = (price_modifier / 100.0) + 1
WHERE id BETWEEN 300001 AND 300004
  AND price_modifier > 5;

-- Garante que a sequência da tabela de sazonalidade está alinhada com o MAX(id),
-- porque existem seeds anteriores com IDs fixos.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'seasonality_rules') THEN
    PERFORM setval(
      pg_get_serial_sequence('seasonality_rules', 'id'),
      (SELECT COALESCE(MAX(id), 1) FROM seasonality_rules)
    );
  END IF;
END $$;

-- Regras mensais (2026) para TODAS as propriedades onde o dev tem acesso (PRIMARY_OWNER ou MANAGER).
WITH dev_props AS (
  SELECT DISTINCT pp.property_id
  FROM property_permissions pp
  WHERE pp.user_id = 999
    AND pp.access_level IN ('PRIMARY_OWNER', 'MANAGER')
),
months AS (
  SELECT generate_series(date '2026-01-01', date '2026-12-01', interval '1 month')::date AS start_date
),
month_rules AS (
  SELECT
    m.start_date,
    (m.start_date + interval '1 month' - interval '1 day')::date AS end_date,
    CASE EXTRACT(month FROM m.start_date)::int
      WHEN 1 THEN 1.00
      WHEN 2 THEN 1.00
      WHEN 3 THEN 1.05
      WHEN 4 THEN 1.10
      WHEN 5 THEN 1.15
      WHEN 6 THEN 1.35
      WHEN 7 THEN 1.55
      WHEN 8 THEN 1.60
      WHEN 9 THEN 1.25
      WHEN 10 THEN 1.10
      WHEN 11 THEN 1.05
      WHEN 12 THEN 1.30
      ELSE 1.00
    END::numeric(5,2) AS price_modifier
  FROM months m
)
INSERT INTO seasonality_rules (property_id, start_date, end_date, price_modifier, day_of_week, channel)
SELECT p.property_id, r.start_date, r.end_date, r.price_modifier, NULL, NULL
FROM dev_props p
CROSS JOIN month_rules r;

-- Weekend premium (para meses “baixos” também terem variação)
WITH dev_props AS (
  SELECT DISTINCT pp.property_id
  FROM property_permissions pp
  WHERE pp.user_id = 999
    AND pp.access_level IN ('PRIMARY_OWNER', 'MANAGER')
)
INSERT INTO seasonality_rules (property_id, start_date, end_date, price_modifier, day_of_week, channel)
SELECT p.property_id, date '2026-01-01', date '2026-12-31', 1.12, d.day_of_week, NULL
FROM dev_props p
JOIN (VALUES ('FRIDAY'), ('SATURDAY')) AS d(day_of_week) ON true;

-- Eventos/picos (sobrepõem as regras mensais, aumentando ainda mais o verão)
INSERT INTO seasonality_rules (property_id, start_date, end_date, price_modifier, day_of_week, channel)
VALUES
  (20009, '2026-08-10', '2026-08-17', 1.85, NULL, NULL),
  (20013, '2026-07-05', '2026-07-12', 1.75, NULL, NULL),
  (20002, '2026-06-13', '2026-06-20', 1.60, NULL, NULL),
  (20102, '2026-08-01', '2026-08-09', 1.70, NULL, NULL);

