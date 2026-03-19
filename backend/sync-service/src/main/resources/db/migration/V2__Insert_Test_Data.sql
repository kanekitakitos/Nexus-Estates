-- Logs de Email (Auditoria)
INSERT INTO email_logs (recipient, subject, body, status, sent_at)
VALUES 
    ('miguel@nexus.com', 'Reserva Confirmada - Modern Loft in Downtown', 'Sua reserva de 01/05 a 05/05 foi confirmada com sucesso.', 'SUCCESS', NOW()),
    ('luis@nexus.com', 'Nova Reserva Recebida - Cozy Mountain Cabin', 'Miguel solicitou uma reserva de 10/06 a 15/06.', 'SUCCESS', NOW());

-- Mensagens de Chat
-- Booking ID 1: Rui Costa (them) e Miguel (me)
INSERT INTO messages (booking_id, sender_id, content, created_at)
VALUES
    (1, 'them', 'Olá! Precisa de ajuda com a sua reserva?', NOW() - INTERVAL '5 minutes'),
    (1, 'me', 'Olá! Quero visitar o T2 na Baixa esta semana.', NOW() - INTERVAL '4 minutes'),
    (1, 'them', 'Perfeito. Tenho disponibilidade na quinta às 15h.', NOW() - INTERVAL '3 minutes'),
    (1, 'me', 'Ótimo, marque para quinta às 15h, por favor.', NOW() - INTERVAL '2 minutes');
