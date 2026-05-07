-- Demo dataset: conversas adicionais para enriquecer o Dashboard/Chat do dev (id=999)
-- Inclui participação do staff oficial (id=2002) como assistente.

-- Inquiries (pré-booking)
INSERT INTO property_inquiries (id, property_id, guest_id, created_at)
VALUES
  (5101, 20015, 1006, NOW() - INTERVAL '9 days'),
  (5102, 20102, 1020, NOW() - INTERVAL '30 days')
ON CONFLICT (property_id, guest_id) DO NOTHING;

-- Threads de inquiry (PROPERTY_INQUIRY)
INSERT INTO messages (id, context_type, context_id, booking_id, sender_id, content, created_at)
VALUES
  (160001, 'PROPERTY_INQUIRY', 5101, NULL, '1006', 'Olá! O check-in é self check-in? Chego tarde.', NOW() - INTERVAL '9 days'),
  (160002, 'PROPERTY_INQUIRY', 5101, NULL, '2002', 'Olá! Sim, temos self check-in. Posso confirmar o horário aproximado de chegada?', NOW() - INTERVAL '9 days'),
  (160003, 'PROPERTY_INQUIRY', 5101, NULL, '1006', 'Chego por volta das 23:30.', NOW() - INTERVAL '9 days'),
  (160004, 'PROPERTY_INQUIRY', 5101, NULL, '2002', 'Perfeito. O acesso é com código. Se precisar de berço/extra, diga-me.', NOW() - INTERVAL '8 days'),
  (160005, 'PROPERTY_INQUIRY', 5101, NULL, '999',  'Confirmado. No dia anterior envio o código e instruções detalhadas.', NOW() - INTERVAL '8 days'),

  (160006, 'PROPERTY_INQUIRY', 5102, NULL, '1020', 'Olá! A casa fica perto da praia? E tem estacionamento?', NOW() - INTERVAL '30 days'),
  (160007, 'PROPERTY_INQUIRY', 5102, NULL, '2002', 'Olá! Sim, fica perto e há estacionamento nas proximidades. Quer datas aproximadas para eu validar disponibilidade?', NOW() - INTERVAL '30 days'),
  (160008, 'PROPERTY_INQUIRY', 5102, NULL, '1020', 'Agosto, 1 semana. Somos 4 + bebé.', NOW() - INTERVAL '29 days'),
  (160009, 'PROPERTY_INQUIRY', 5102, NULL, '999',  'Perfeito. Para agosto recomendo reservar cedo; consigo também disponibilizar berço (demo).', NOW() - INTERVAL '29 days')
ON CONFLICT (id) DO NOTHING;

-- Thread de booking (BOOKING) para um booking do dataset do dashboard (booking-service V11)
INSERT INTO messages (id, context_type, context_id, booking_id, sender_id, content, created_at)
VALUES
  (160010, 'BOOKING', 210009, 210009, '1009', 'Olá! Vamos chegar às 21h. Podemos fazer check-in sem problema?', NOW() - INTERVAL '7 days'),
  (160011, 'BOOKING', 210009, 210009, '2002', 'Sim, sem problema. No dia anterior envio instruções e o código de entrada.', NOW() - INTERVAL '7 days'),
  (160012, 'BOOKING', 210009, 210009, '1009', 'Obrigado! Precisamos de fatura (NIF).', NOW() - INTERVAL '7 days'),
  (160013, 'BOOKING', 210009, 210009, '999',  'Claro. Envie o NIF aqui e trato disso após o pagamento.', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'messages') THEN
    PERFORM setval(pg_get_serial_sequence('messages', 'id'), 250000);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'property_inquiries') THEN
    PERFORM setval(pg_get_serial_sequence('property_inquiries', 'id'), 7000);
  END IF;
END $$;

