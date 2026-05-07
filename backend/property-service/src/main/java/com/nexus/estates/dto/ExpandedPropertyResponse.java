package com.nexus.estates.dto;

import com.nexus.estates.common.dto.PropertyRuleDTO;
import com.nexus.estates.common.dto.SeasonalityRuleDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/**
 * DTO que representa a resposta detalhada e expandida de uma propriedade
 * <p>
 *     Agrega os dados principais do imóvel com as suas respetivas relações (comodidades, regras de reserva
 *     e regras de sazonalidade). É ideal para a página de detalhes da propriedade no fronted, fornecendo
 *     toda a informação num único pedido HTTP
 * </p>
 * @param id Identificador único da propriedade
 * @param name Título ou nome comercial do anúncio
 * @param description Mapa contendo as descrições da propriedade em múltiplos idiomas
 * @param location Região ou localização geral
 * @param city Cidade onde o imóvel se encontra
 * @param address Morada completa e exata da propriedade
 * @param basePrice Preço base cobrado por noite (antes de taxas ou sazonalidade)
 * @param maxGuests Lotação máxima permitida na propriedade
 * @param isActive Indica se o anúncio está visível e disponivel para reservas no catálogo
 * @param amenities Lista de nomes das comodidades associadas (ex: Wi-Fi, Piscina)
 * @param rules Aas regras base de negócio aplicáveis á propriedade (ex: check-in, minimo de noites)
 * @param seasonality Lista de modificadores de preço para épocas específicas do ano
 * @param imageUrl URL principal da imagem de capa da propriedade
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Schema(description = "Resposta expandida de uma propriedade com relacionamentos")
public record ExpandedPropertyResponse(
        Long id,
        String name,
        Map<String, String> description,
        String location,
        String city,
        String address,
        BigDecimal basePrice,
        Integer maxGuests,
        Boolean isActive,
        List<String> amenities,
        PropertyRuleDTO rules,
        List<SeasonalityRuleDTO> seasonality,
        String imageUrl
) {}
