package com.nexus.estates.entity;

/**
 * Enumeração que define as categorias possíveis para as comodidades (Amenities).
 *
 * <p>Esta classificação é utilizada para organizar as comodidades por áreas de
 * utilidade, facilitando a filtragem e a exibição na interface do utilizador.</p>
 *
 * <p>Categorias disponíveis:</p>
 * <ul>
 * <li>KITCHEN: Comodidades de cozinha e eletrodomésticos</li>
 * <li>LEISURE: Itens de lazer, entretenimento e desporto</li>
 * <li>SAFETY: Dispositivos de segurança e proteção</li>
 * <li>COMFORT: Itens de conforto térmico e bem-estar</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-12
 */
public enum AmenityCategory {

    /** Itens relacionados com cozinha (ex: Microondas, Forno, Frigorífico). */
    KITCHEN,

    /** Itens de lazer (ex: Piscina, Mesa de Bilhar, Jardim). */
    LEISURE,

    /** Dispositivos de segurança (ex: Alarme, Extintor, Câmaras). */
    SAFETY,

    /** Elementos de conforto (ex: Ar Condicionado, Aquecimento Central, Wi-Fi). */
    COMFORT
}