package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.entity.PropertyInquiry;
import com.nexus.estates.service.chat.PropertyInquiryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller responsável por gerir o ciclo de vida de conversas no domínio de chat.
 *
 * <p>Este controller expõe o conceito de conversa como um recurso independente do email do destinatário,
 * evitando riscos de privacidade e “email harvesting”. No caso de PROPERTY_INQUIRY, o vínculo é feito
 * exclusivamente por {@code propertyId} + utilizador autenticado (guest), e o backend resolve permissões
 * internamente via property-service.</p>
 */
@RestController
@RequestMapping("/api/sync/conversations")
@RequiredArgsConstructor
@Tag(name = "Sync Conversations", description = "Resolução e listagem de conversas (inquiries por propriedade).")
public class SyncConversationController {

    private final PropertyInquiryService inquiryService;

    @PostMapping("/property/{propertyId}")
    @Operation(summary = "Obter inquiry", description = "Devolve a conversa existente entre o utilizador autenticado e a propriedade (não cria conversa vazia).")
    public ResponseEntity<ApiResponse<ConversationResponse>> getExistingPropertyInquiry(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long propertyId
    ) {
        var existing = inquiryService.findExisting(propertyId, userId);
        if (existing.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("Conversa não encontrada.", "NOT_FOUND"));
        }

        PropertyInquiry inquiry = existing.get();
        ConversationResponse response = ConversationResponse.from(inquiry);
        return ResponseEntity.ok(ApiResponse.success(response, "Conversa encontrada."));
    }

    @GetMapping("/mine")
    @Operation(summary = "Listar inquiries", description = "Lista inquiries criadas pelo utilizador autenticado (guest).")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> listMine(@RequestHeader("X-User-Id") Long userId) {
        List<ConversationResponse> list = inquiryService.listForGuest(userId).stream()
                .map(ConversationResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(list, "Conversas recuperadas."));
    }

    public record ConversationResponse(Long inquiryId, Long propertyId, Long guestId, String chatId) {
        static ConversationResponse from(PropertyInquiry inquiry) {
            return new ConversationResponse(
                    inquiry.getId(),
                    inquiry.getPropertyId(),
                    inquiry.getGuestId(),
                    "inquiry:" + inquiry.getId()
            );
        }
    }
}
