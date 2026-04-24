-- =============================================================================
-- V8: Motor de Disponibilidade e Bloqueios
-- =============================================================================
-- Esta migração suporta o novo estado BLOCKED na máquina de estados das reservas
-- e adiciona o índice composto recomendado para a query de verificação de
-- disponibilidade (existsOverlappingBooking), que agora usa Pessimistic Write Lock.
--
-- Alterações:
--   1. Índice composto em (property_id, check_in_date, check_out_date) para optimizar
--      a query de sobreposição com SELECT ... FOR UPDATE.
--   2. Índice parcial em status para acelerar filtros por estado (CONFIRMED, BLOCKED,
--      PENDING_PAYMENT) nas verificações de disponibilidade.
-- =============================================================================

-- Índice composto para a query de verificação de disponibilidade.
-- Cobre os campos usados no WHERE da existsOverlappingBooking:
--   WHERE property_id = ? AND status IN (...) AND check_in_date < ? AND check_out_date > ?
-- O PostgreSQL pode usar este índice para o SELECT ... FOR UPDATE, reduzindo
-- o número de linhas bloqueadas e melhorando a performance sob concorrência.
CREATE INDEX IF NOT EXISTS idx_bookings_availability
    ON bookings (property_id, check_in_date, check_out_date);

-- Índice parcial no status para filtros frequentes de estado activo.
-- Apenas indexa os estados que "ocupam" a propriedade, excluindo CANCELLED e REFUNDED
-- que nunca participam nas verificações de disponibilidade.
CREATE INDEX IF NOT EXISTS idx_bookings_active_status
    ON bookings (status)
    WHERE status IN ('CONFIRMED', 'BLOCKED', 'PENDING_PAYMENT');
