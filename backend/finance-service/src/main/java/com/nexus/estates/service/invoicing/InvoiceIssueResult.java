package com.nexus.estates.service.invoicing;

/**
 * Resultado da emissão de documento de faturação.
 *
 * @param providerKey identificador do provider (Strategy)
 * @param status estado final (ISSUED/FAILED)
 * @param legalId identificador legal do documento
 * @param pdfUrl link para o PDF do documento emitido
 */
public record InvoiceIssueResult(
        String providerKey,
        String status,
        String legalId,
        String pdfUrl
) {
}
