package com.nexus.estates.service;

import com.nexus.estates.entity.User;
import com.nexus.estates.repository.UserRepository;

import java.util.Optional;

/**
 * Contrato (Stratefy) para a integração de múltiplos provedores de identidade externos
 * <p>
 *     Aplica o Padrão de Desenho Startegy para permitir que a aplicação suporte diferentes sistemas
 *     de Single Sign-On (SSO), como Clerk, Auth0 ou Google, de forma agnóstica
 *     Cada provedor impelmenta esta interface e o serviço de autenticação invoca-a
 *     dinamicamente com base na origem do token
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public interface ExternalIdentityProviderStrategy {

    /**
     * Obtém a chave identificador deste provedor de identidade
     * @return Uma string única que representa o provider
     */
    String key();

    /**
     * Verifica criptograficamente e descodifica o token de acesso enviado pelo cliente
     * @param token O token JWT emitido pelo provedor externo
     * @return Um objeto {@link ExternalIdentity} contendo os dados extraídos e normalizados
     * @throws RuntimeException (ou subclasse) se o token for inválido, estiver expirado ou a assinatura falhar
     */
    ExternalIdentity verify(String token);

    /**
     * Procura um utilizador existente no sistema interno que corresponda á identidade externa
     * @param userRepository O repositório de utilizadores par efetuar a consulta
     * @param identity A identidade validada extraída do provedor externo
     * @return Um {@link Optional} contendo o utilizador caso seja encontrado
     */
    Optional<User> findExistingUser(UserRepository userRepository, ExternalIdentity identity);


    /**
     * Aplica ou vincula os dados da identidade externa a uma entidade de utilizador inerno
     * <p>
     *     Geralmente utilizado no momento do primeiro login via SSO para guardar o ID externo
     *     na base de dados local
     * </p>
     * @param user O utilizador interno a ser atualizado
     * @param identity Os dados da identidade fornecida pelo sistema externo
     */
    void applyIdentity(User user, ExternalIdentity identity);


    /**
     * DTO padronizado que encapsula os dados essenciais extraídos de qualquer provedor externo
     * @param providerUserId O identificador único do utilizador no sistema externo
     * @param email O endereço de email verificado devolvido pelo provedor
     * @param name O nome do utilizador, se disponibilizado pelo provedor
     */
    record ExternalIdentity(String providerUserId, String email, String name) {}
}
