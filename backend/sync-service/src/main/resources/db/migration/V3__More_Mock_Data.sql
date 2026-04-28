-- More Email Logs
INSERT INTO email_logs (recipient, subject, body, status, sent_at)
VALUES 
    ('brandon@nexus.com', 'Bem-vindo ao Nexus Estates', 'Olá Brandon, a sua conta foi criada com sucesso.', 'SENT', '2026-03-01 09:00:00'),
    ('guest1@gmail.com', 'Confirmação de Reserva - Porto Riverside', 'A sua reserva para 2026-06-15 foi confirmada.', 'SENT', '2026-03-01 10:05:00'),
    ('guest2@yahoo.com', 'Lembrete de Check-in', 'Faltam 2 dias para o seu check-in na Algarve Luxury Villa.', 'SENT', '2026-03-15 12:00:00'),
    ('owner1@nexus.com', 'Nova Reserva Recebida', 'Recebeu uma nova reserva para a sua propriedade em Braga.', 'SENT', '2026-03-17 08:35:00'),
    ('staff1@nexus.com', 'Alerta de Limpeza', 'A propriedade em Cascais necessita de limpeza amanhã.', 'SENT', '2026-03-17 14:00:00');

-- More Messages
INSERT INTO messages (booking_id, sender_id, content, created_at)
VALUES 
    (1, '3', 'Olá, a que horas posso fazer o check-in?', '2026-03-01 10:10:00'),
    (1, 'OWNER_1', 'Olá Miguel! O check-in é a partir das 15:00.', '2026-03-01 10:30:00'),
    (1, '3', 'Perfeito, obrigado!', '2026-03-01 10:45:00'),
    (2, '5', 'Existe estacionamento gratuito no local?', '2026-03-05 11:40:00'),
    (2, 'OWNER_1', 'Sim, temos um lugar de garagem reservado para si.', '2026-03-05 12:00:00'),
    (9, '12', 'Podem fornecer um berço para bebé?', '2026-03-10 15:00:00'),
    (9, 'OWNER_2', 'Claro que sim, já está incluído no seu quarto.', '2026-03-10 15:30:00');
