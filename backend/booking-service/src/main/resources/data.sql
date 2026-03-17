-- Reserva b1 para Miguel (u3) na Villa de Cascais (p1)
INSERT INTO bookings (id, property_id, user_id, check_in, check_out, total_price, status, created_at)
VALUES 
    ('b1', '1', 'u3', '2026-05-01', '2026-05-05', 1000.00, 'CONFIRMED', NOW()),
    ('b2', '2', 'u3', '2026-06-10', '2026-06-15', 600.00, 'PENDING', NOW())
ON CONFLICT (id) DO NOTHING;

-- Bloqueios de Calendario (Reservas Tecnicas)
INSERT INTO calendar_blocks (id, property_id, start_date, end_date, reason, created_at)
VALUES 
    ('bl1', '1', '2026-04-15', '2026-04-20', 'Manutencao Anual', NOW())
ON CONFLICT (id) DO NOTHING;
