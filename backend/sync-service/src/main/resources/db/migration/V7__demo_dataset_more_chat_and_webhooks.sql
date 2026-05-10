-- Richer demo dataset centred on dev user (id=999)
-- Adds property inquiries + richer chat threads + webhook subscriptions

-- Property inquiries (pre-booking conversations)
INSERT INTO property_inquiries (id, property_id, guest_id, created_at)
VALUES
  (5001, 20001, 1004, NOW() - INTERVAL '12 days'),
  (5002, 20003, 1020, NOW() - INTERVAL '45 days'),
  (5003, 20009, 1009, NOW() - INTERVAL '70 days')
ON CONFLICT (property_id, guest_id) DO NOTHING;

-- Booking chat threads (context_type/context_id)
INSERT INTO messages (id, context_type, context_id, booking_id, sender_id, content, created_at)
VALUES
  (150001, 'BOOKING', 200001, 200001, '1004', 'Olá! O check-in é self check-in?', NOW() - INTERVAL '14 days'),
  (150002, 'BOOKING', 200001, 200001, '999',  'Sim, envio o código no dia anterior. 👍', NOW() - INTERVAL '14 days'),
  (150003, 'BOOKING', 200001, 200001, '1004', 'Perfeito, obrigado!', NOW() - INTERVAL '13 days'),

  (150004, 'BOOKING', 200002, 200002, '1014', 'Preciso de fatura com NIF. É possível?', NOW() - INTERVAL '19 days'),
  (150005, 'BOOKING', 200002, 200002, '999',  'Sim, após o pagamento emitimos a fatura. Envie o NIF aqui.', NOW() - INTERVAL '19 days'),

  (150006, 'BOOKING', 200003, 200003, '1020', 'Vamos com bebé, há berço?', NOW() - INTERVAL '34 days'),
  (150007, 'BOOKING', 200003, 200003, '999',  'Sim, posso disponibilizar berço sem custo extra.', NOW() - INTERVAL '34 days'),
  (150008, 'BOOKING', 200003, 200003, '1020', 'Ótimo! 🙏', NOW() - INTERVAL '33 days'),

  (150009, 'BOOKING', 200010, 200010, '1010', 'Tivemos um problema e precisamos cancelar. Como funciona?', NOW() - INTERVAL '149 days'),
  (150010, 'BOOKING', 200010, 200010, '999',  'Sem problema. Vou processar o reembolso (demo).', NOW() - INTERVAL '149 days')
ON CONFLICT (id) DO NOTHING;

-- Inquiry chat threads (PROPERTY_INQUIRY)
INSERT INTO messages (id, context_type, context_id, booking_id, sender_id, content, created_at)
VALUES
  (150011, 'PROPERTY_INQUIRY', 5001, NULL, '1004', 'Olá! O apartamento tem Wi‑Fi estável para trabalho remoto?', NOW() - INTERVAL '12 days'),
  (150012, 'PROPERTY_INQUIRY', 5001, NULL, '999',  'Sim, Wi‑Fi rápido e também há workspace.', NOW() - INTERVAL '12 days'),
  (150013, 'PROPERTY_INQUIRY', 5001, NULL, '1004', 'Excelente, vou avançar com a reserva.', NOW() - INTERVAL '11 days'),

  (150014, 'PROPERTY_INQUIRY', 5002, NULL, '1020', 'A casa é segura para crianças? Tem escadas?', NOW() - INTERVAL '45 days'),
  (150015, 'PROPERTY_INQUIRY', 5002, NULL, '999',  'É segura e as escadas têm proteção. Posso enviar fotos.', NOW() - INTERVAL '45 days'),

  (150016, 'PROPERTY_INQUIRY', 5003, NULL, '1009', 'A villa tem piscina aquecida?', NOW() - INTERVAL '70 days'),
  (150017, 'PROPERTY_INQUIRY', 5003, NULL, '999',  'Não é aquecida, mas é ótima no verão.', NOW() - INTERVAL '70 days')
ON CONFLICT (id) DO NOTHING;

-- Webhook subscriptions for dev user (demo)
INSERT INTO webhook_subscriptions (id, user_id, target_url, secret, is_active, subscribed_events, created_at, updated_at)
VALUES
  (50001, 999, 'https://example.com/webhooks/nexus/dev/booking', 'whsec_demo_dev_booking_999', true,  'booking.created,booking.status.updated', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  (50002, 999, 'https://example.com/webhooks/nexus/dev/chat',    'whsec_demo_dev_chat_999',    true,  'chat.message.received',                NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  (50003, 999, 'https://example.com/webhooks/nexus/dev/audit',   'whsec_demo_dev_audit_999',   false, 'property.updated,invoice.issued',      NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'messages') THEN
    PERFORM setval(pg_get_serial_sequence('messages', 'id'), 200000);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'webhook_subscriptions') THEN
    PERFORM setval(pg_get_serial_sequence('webhook_subscriptions', 'id'), 60000);
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'property_inquiries') THEN
    PERFORM setval(pg_get_serial_sequence('property_inquiries', 'id'), 6000);
  END IF;
END $$;
