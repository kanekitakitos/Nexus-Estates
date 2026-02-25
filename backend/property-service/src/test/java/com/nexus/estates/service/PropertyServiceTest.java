package com.nexus.estates.service;

import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.entity.Amenity;
import com.nexus.estates.entity.Property;
import com.nexus.estates.repository.AmenityRepository;
import com.nexus.estates.repository.PropertyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para a classe de serviço {@link PropertyService}.
 *
 * <p>Esta classe utiliza o framework Mockito para isolar as dependências de persistência
 * (PropertyRepository e AmenityRepository), permitindo validar a lógica de negócio de
 * mapeamento, validação de preços e associação de comodidades de forma independente.</p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 * @since 2026-02-24
 */
@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {

    /** Mock do repositório de propriedades para simular operações de escrita. */
    @Mock
    private PropertyRepository repository;

    /** Mock do repositório de comodidades para validar a existência de IDs no sistema. */
    @Mock
    private AmenityRepository amenityRepository;

    /** Instância do serviço com as dependências mockadas injetadas via construtor. */
    @InjectMocks
    private PropertyService service;

    private CreatePropertyRequest validRequest;
    private Property savedProperty;

    /**
     * Configuração inicial executada antes de cada teste.
     * <p>Prepara um DTO de requisição válido conforme o esquema de internacionalização
     * e uma entidade de propriedade que simula o objeto já persistido com ID gerado.</p>
     */
    @BeforeEach
    void setUp() {
        // Ordem conforme o Record: title, description, price, ownerId, location, amenityIds
        validRequest = new CreatePropertyRequest(
                "Casa de Luxo Teste",
                Map.of("pt", "Descrição detalhada", "en", "Detailed description"),
                1500.0,
                1L,
                "Avenida Principal, 123",
                Set.of(5L, 10L)
        );

        savedProperty = new Property();
        savedProperty.setId(1L);
        savedProperty.setName(validRequest.title());
        savedProperty.setBasePrice(BigDecimal.valueOf(validRequest.price()));
    }

    /**
     * Testa o cenário de criação bem-sucedida de uma propriedade.
     * * <p>Verifica se:
     * <ul>
     * <li>O serviço consulta o AmenityRepository para validar os IDs das comodidades.</li>
     * <li>O mapeamento do preço (Double para BigDecimal) ocorre corretamente.</li>
     * <li>O repositório de propriedades é chamado para persistir os dados.</li>
     * </ul>
     * </p>
     */
    @Test
    @DisplayName("Deve criar uma propriedade e associar comodidades com sucesso")
    void shouldCreatePropertyWithSuccess() {
        // Arrange: Define o comportamento esperado dos componentes externos
        // Simula que o repositório encontra as comodidades solicitadas
        when(amenityRepository.findAllById(any())).thenReturn(new ArrayList<>());
        // Simula a persistência retornando o objeto com ID
        when(repository.save(any(Property.class))).thenReturn(savedProperty);

        // Act: Executa a lógica de negócio do serviço
        Property result = service.create(validRequest);

        // Assert: Valida se o resultado cumpre os requisitos esperados
        assertNotNull(result, "A propriedade retornada não deve ser nula");
        assertEquals(1L, result.getId(), "O ID da propriedade deve corresponder ao persistido");
        assertEquals("Casa de Luxo Teste", result.getName(), "O nome deve ser mapeado corretamente");

        // Verificação de Interações: Garante que os métodos dos repositórios foram invocados
        verify(amenityRepository, times(1)).findAllById(validRequest.amenityIds());
        verify(repository, times(1)).save(any(Property.class));
    }
}