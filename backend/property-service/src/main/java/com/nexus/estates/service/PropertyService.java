package com.nexus.estates.service;

import com.nexus.estates.entity.Property;
import com.nexus.estates.exception.PropertyNotFoundException;
import com.nexus.estates.repository.PropertyRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Serviço responsável pela lógica de negócio associada às propriedades.
 * Agora inclui a infraestrutura de notificações assíncronas.
 *
 * @author Nexus Estates Team
 */
@Service
public class PropertyService {

    private final PropertyRepository repository;
    private final EmailService emailService; // 1. Adiciona o serviço de email

    /**
     * Construtor do serviço com injeção de dependências.
     */
    public PropertyService(PropertyRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    /**
     * Cria uma nova propriedade e envia notificação por email.
     *
     * @param property dados da propriedade
     * @return propriedade persistida
     */
    public Property create(Property property) {
        // Primeiro salvamos na base de dados
        Property savedProperty = repository.save(property);

        // Preparamos os dados para o template HTML
        Map<String, Object> emailVariables = new HashMap<>();
        emailVariables.put("propertyName", savedProperty.getName());
        emailVariables.put("propertyId", savedProperty.getId());
        emailVariables.put("ownerName", "Proprietário"); // No futuro, buscar o nome real do utilizador logado

        // Enviamos o email de forma ASSÍNCRONA (não bloqueia a resposta da API)
        // O template deve estar em: resources/templates/emails/property-created.html
        emailService.sendEmailFromTemplate(
                "nexusestates2026@outlook.pt", // Para teste, podes usar o teu email pessoal aqui
                "Confirmação: Propriedade Listada com Sucesso!",
                "property-created",
                emailVariables
        );

        return savedProperty;
    }

    /**
     * Obtém todas as propriedades registadas.
     */
    public List<Property> findAll() {
        return repository.findAll();
    }

    /**
     * Obtém uma propriedade pelo seu identificador.
     */
    public Property findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException(id));
    }
}