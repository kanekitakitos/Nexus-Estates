package com.nexus.estates.service.chat;

import com.nexus.estates.common.util.WebhookCryptoUtil;
import com.nexus.estates.dto.WebhookSubscriptionDTO;
import com.nexus.estates.entity.WebhookSubscription;
import com.nexus.estates.repository.WebhookSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço responsável por gerir o ciclo de vida e a persistência das subscrições
 * de Webhooks (operações CRUD) na base de dados.
 * <p>
 * Garante que apenas o dono da subscrição consegue consultá-la ou modificá-la,
 * gera os segredos de assinatura (apenas durante a criação) e agrupa eventos
 * para armazenar como strings separadas por vírgula na entidade.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 * @since 2023-10-10
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookSubscriptionService {

    private final WebhookSubscriptionRepository repository;

    /**
     * Cria e regista uma nova subscrição de webhook associada a um utilizador.
     * <p>
     * Gera e associa um segredo criptográfico forte e único que será o único momento
     * em que é partilhado explicitamente como texto-limpo na resposta ao cliente.
     * </p>
     *
     * @param userId O Identificador numérico do utilizador que solicita a criação do webhook.
     * @param request O Payload de dados ({@link WebhookSubscriptionDTO.CreateRequest}) da requisição,
     *                contendo o destino e a lista de eventos de interesse do cliente.
     * @return Um DTO expandido ({@link WebhookSubscriptionDTO.CreatedResponse}) que
     *         combina a entidade resultante salva em base de dados juntamente com o seu novo
     *         segredo.
     */
    @Transactional
    public WebhookSubscriptionDTO.CreatedResponse createSubscription(Long userId, WebhookSubscriptionDTO.CreateRequest request) {
        log.info("A criar nova subscrição de webhook para o utilizador: {}", userId);

        String secret = WebhookCryptoUtil.generateSecret();
        String eventsCsv = String.join(",", request.subscribedEvents());

        WebhookSubscription entity = WebhookSubscription.builder()
                .userId(userId)
                .targetUrl(request.targetUrl())
                .secret(secret)
                .isActive(true)
                .subscribedEvents(eventsCsv)
                .build();

        WebhookSubscription saved = repository.save(entity);

        return WebhookSubscriptionDTO.CreatedResponse.fromEntity(saved, secret);
    }

    /**
     * Enumera (lista) e converte de forma segura todas as subscrições existentes e ativas/inativas
     * na base de dados pertencentes, e somente pertencentes, a um dado utilizador.
     * <p>
     * Garante o princípio de que o segredo não pode voltar a ser listado após a sua criação,
     * pois a resposta gerada mapeia para o {@link WebhookSubscriptionDTO.Response}.
     * </p>
     *
     * @param userId O ID numérico associado ao dono legítimo das subscrições a devolver.
     * @return Uma {@link List} preenchida de objectos padronizados e mapeados, perfeitamente
     *         adaptada para serialização a um cliente.
     */
    @Transactional(readOnly = true)
    public List<WebhookSubscriptionDTO.Response> getUserSubscriptions(Long userId) {
        return repository.findByUserId(userId).stream()
                .map(WebhookSubscriptionDTO.Response::fromEntity)
                .toList();
    }

    /**
     * Inverte (Toggle) o estado de uma dada subscrição de um utilizador:
     * De Ativa passa a Inativa (e vice-versa).
     *
     * @param userId O Identificador numérico do utilizador no qual o webhook pertence.
     * @param subscriptionId O ID numérico absoluto que identifica o Webhook na BD.
     * @throws IllegalArgumentException Caso o Webhook com o id indicado não exista
     *                                  ou caso o utilizador requisitante não seja o proprietário.
     */
    @Transactional
    public void toggleSubscription(Long userId, Long subscriptionId) {
        WebhookSubscription subscription = getSubscriptionIfOwner(userId, subscriptionId);
        subscription.setActive(!subscription.isActive());
        repository.save(subscription);
        log.info("Estado do webhook {} alterado para: {}", subscriptionId, subscription.isActive());
    }

    /**
     * Exclui em definitivo (Hard Delete) os registos inerentes de uma dada subscrição,
     * apagando de base de dados qualquer traço associado.
     *
     * @param userId O ID numérico da pessoa a quem o Webhook pertence.
     * @param subscriptionId O Identificador que mapeia o Webhook na BD.
     * @throws IllegalArgumentException Caso o Webhook não seja detetado na pesquisa efetuada ou
     *                                  se não for detido pelo cliente submetido.
     */
    @Transactional
    public void deleteSubscription(Long userId, Long subscriptionId) {
        WebhookSubscription subscription = getSubscriptionIfOwner(userId, subscriptionId);
        repository.delete(subscription);
        log.info("Webhook {} eliminado pelo utilizador {}", subscriptionId, userId);
    }

    /**
     * Rotina utilitária de autorização e pesquisa focada.
     * Isola o facto de pesquisar por um Webhook e validar no preciso momento se o
     * dono deste objeto condiz com o submetido, para prevenir IDOR (Insecure Direct Object Reference).
     *
     * @param userId O ID da requisição corrente a validar autoridade.
     * @param subscriptionId O ID pretendido procurar a validade de existência e posse.
     * @return A Entidade preenchida provinda da base de dados caso ambas as premissas
     *         estejam contempladas e validadas.
     * @throws IllegalArgumentException Exceção unificada e lançada quando não obedece a uma
     *                                  ou ambas destas pré-condições de segurança e negócio.
     */
    private WebhookSubscription getSubscriptionIfOwner(Long userId, Long subscriptionId) {
        return repository.findById(subscriptionId)
                .filter(sub -> sub.getUserId() == userId)
                .orElseThrow(() -> new IllegalArgumentException("Webhook não encontrado ou acesso negado."));
    }

}