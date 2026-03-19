-- Reserva para Miguel (User ID 3) na Villa de Cascais (Property ID 1)
INSERT INTO bookings (property_id, user_id, check_in_date, check_out_date, guest_count, total_price, status, created_at)
VALUES 
    (1, 3, '2026-05-01', '2026-05-05', 2, 1000.00, 'CONFIRMED', NOW()),
    (2, 3, '2026-06-10', '2026-06-15', 4, 600.00, 'PENDING', NOW());
