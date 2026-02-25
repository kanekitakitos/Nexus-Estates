package com.nexus.estates.service;

import com.nexus.estates.entity.Amenity;
import com.nexus.estates.entity.AmenityCategory;
import com.nexus.estates.exception.AmenityNotFoundException;
import com.nexus.estates.repository.AmenityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para a classe de serviço {@link AmenityService}.
 *
 * <p>Esta classe valida as operações de gestão de comodidades (Amenities), garantindo que
 * o suporte a múltiplos idiomas (Map/JSONB) e as categorias de lazer/serviço sejam
 * processados corretamente. Utiliza Mockito para isolar a persistência de dados.</p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 * @since 2026-02-24
 */
@ExtendWith(MockitoExtension.class)
class AmenityServiceTest {

    /** Mock do repositório para simular operações sobre a tabela de comodidades. */
    @Mock
    private AmenityRepository repository;

    /** Instância do serviço com mocks injetados para validar a lógica de Amenities. */
    @InjectMocks
    private AmenityService service;

    private Amenity amenity;
    private Long amenityId;

    /**
     * Configuração base executada antes de cada teste unitário.
     * <p>Prepara uma entidade {@link Amenity} com nomes internacionalizados e uma
     * categoria específica (LEISURE) para validar os mapeamentos.</p>
     */
    @BeforeEach
    void setUp() {
        amenityId = 2L;
        // Simulação de internacionalização: nomes em Português e Inglês
        Map<String, String> names = Map.of("pt", "Piscina", "en", "Pool");

        amenity = new Amenity();
        amenity.setId(amenityId);
        amenity.setName(names);
        amenity.setCategory(AmenityCategory.LEISURE);
    }

    /**
     * Valida a criação de uma nova comodidade no sistema.
     * <p>Garante que os mapas de tradução sejam mantidos e que o repositório
     * realize a persistência do objeto corretamente.</p>
     */
    @Test
    @DisplayName("Deve criar uma comodidade com suporte a múltiplos idiomas")
    void shouldCreateAmenityWithSuccess() {
        // Arrange
        when(repository.save(any(Amenity.class))).thenReturn(amenity);

        // Act
        Amenity result = service.create(new Amenity());

        // Assert
        assertNotNull(result, "O resultado da criação não deve ser nulo");
        assertTrue(result.getName().containsKey("pt"), "Deve conter a chave de idioma 'pt'");
        assertEquals("Piscina", result.getName().get("pt"), "O nome em português deve estar correto");
        verify(repository, times(1)).save(any(Amenity.class));
    }

    /**
     * Testa a listagem completa de comodidades disponíveis.
     * <p>Verifica a integridade dos dados retornados, especialmente os campos internacionalizados.</p>
     */
    @Test
    @DisplayName("Deve listar todas as comodidades e validar traduções")
    void shouldFindAllAmenities() {
        // Arrange
        when(repository.findAll()).thenReturn(List.of(amenity));

        // Act
        List<Amenity> result = service.findAll();

        // Assert
        assertFalse(result.isEmpty(), "A lista de comodidades não deve estar vazia");
        assertEquals(1, result.size());
        assertEquals("Pool", result.get(0).getName().get("en"), "A tradução em inglês deve estar preservada");
        verify(repository, times(1)).findAll();
    }

    /**
     * Valida a recuperação de uma comodidade por ID.
     */
    @Test
    @DisplayName("Deve encontrar uma comodidade específica pelo seu identificador")
    void shouldFindAmenityByIdWithSuccess() {
        // Arrange
        when(repository.findById(amenityId)).thenReturn(Optional.of(amenity));

        // Act
        Amenity result = service.findById(amenityId);

        // Assert
        assertNotNull(result);
        assertEquals(amenityId, result.getId());
        assertEquals(AmenityCategory.LEISURE, result.getCategory(), "A categoria deve ser LEISURE");
    }

    /**
     * Testa o cenário de erro quando um ID inexistente é solicitado.
     * <p>Verifica se a exceção personalizada {@link AmenityNotFoundException} é lançada,
     * garantindo que o erro seja propagado corretamente para as camadas superiores.</p>
     */
    @Test
    @DisplayName("Deve lançar AmenityNotFoundException quando o ID for inválido")
    void shouldThrowAmenityNotFoundExceptionWhenIdDoesNotExist() {
        // Arrange
        Long idInexistente = 6L;
        when(repository.findById(idInexistente)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AmenityNotFoundException.class, () -> {
            service.findById(idInexistente);
        }, "Uma exceção específica deve ser lançada para IDs inexistentes");

        verify(repository, times(1)).findById(idInexistente);
    }
}