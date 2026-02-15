package com.nexus.estates.entity;

/**
 * Define a Máquina de Estados Finita (FSM) para o ciclo de vida de uma reserva.
 * <p>
 * O fluxo de estados esperado é:
 * {@code PENDING_PAYMENT} -> {@code CONFIRMED} -> {@code COMPLETED}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public enum BookingStatus
{
    /**
     * <b>Aguardando Pagamento:</b> A reserva foi criada mas a transação financeira
     * ainda não foi concluída. As datas podem estar temporariamente reservadas.
     */
    PENDING_PAYMENT,

    /**
     * <b>Confirmada:</b> O pagamento foi processado com sucesso e as datas
     * estão bloqueadas definitivamente no calendário da propriedade.
     */
    CONFIRMED,

    /**
     * <b>Cancelada:</b> A reserva foi anulada antes da data de check-in,
     * libertando as datas para novos agendamentos.
     */
    CANCELLED,

    /**
     * <b>Concluída:</b> A estadia foi realizada e o check-out efetuado.
     * Este é um estado terminal de sucesso.
     */
    COMPLETED,

    /**
     * <b>Reembolsada:</b> O valor pago foi devolvido ao cliente após um
     * cancelamento ou disputa. Estado terminal.
     */
    REFUNDED
}
