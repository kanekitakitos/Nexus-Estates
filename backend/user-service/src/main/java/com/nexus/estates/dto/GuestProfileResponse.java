package com.nexus.estates.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;


/**
 * DTO que representa a resposta com os dados do perfil de um Hóspede
 * <p>
 *     Utilziado para enviar ao cliente (Frotend) as informações consolidadas de um hóspede,
 *     ocultando detalhes internos e complexos da base de dados
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Data
@Builder
public class GuestProfileResponse {

    /**
     * Identificador único do registo do perfil do hóspede na base de dados
     */
    private Long id;

    /**
     * O identificador do utilizador (conta global) a quem este perfil pertence
     */
    private Long userId;

    /**
     * O endereço de email associado á conta do hóspede
     */
    private String userEmail;

    /**
     * Notas de gestão internas associadas ao hóspede
     */
    private String internalNotes;

    /**
     * Lista de etiquetas (tags) associadas ao pergil para rápida identificação visual
     */
    private List<String> tags;
}
