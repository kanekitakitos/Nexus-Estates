# user-service — Testes

## Índice
- [Classe "ExternalIntegrationControllerTest"](#classe-externalintegrationcontrollertest)
- [Classe "PasswordResetControllerTest"](#classe-passwordresetcontrollertest)
- [Classe "UserControllerTest"](#classe-usercontrollertest)
- [Classe "JwtAuthenticationFilterTest"](#classe-jwtauthenticationfiltertest)
- [Classe "EncryptedStringAttributeConverterTest"](#classe-encryptedstringattributeconvertertest)
- [Classe "AuthServiceTest"](#classe-authservicetest)
- [Classe "JwtServiceTest"](#classe-jwtservicetest)
- [Classe "PasswordResetServiceTest"](#classe-passwordresetservicetest)
- [Classe "SecretCryptoServiceTest"](#classe-secretcryptoservicetest)
- [Classe "PasswordResetTokenTest"](#classe-passwordresettokentest)
- [Classe "ActorContextFilterTest"](#classe-actorcontextfiltertest)
- [Classe "UserEnversAuditTest"](#classe-userenversauditTest)
- [Classe "GuestProfileControllerTest"](#classe-guestprofilecontrollertest)
- [Classe "GuestProfileServiceTest"](#classe-guestprofileservicetest)

### Classe "ExternalIntegrationControllerTest"
- shouldCreateIntegrationAsOwner:
    'Verifica que o POST /api/users/integrations cria integração quando o role é OWNER e devolve ApiResponse com DTO e apiKeyMasked.'
- shouldForbidPostAsGuest:
    'Verifica que o POST /api/users/integrations é proibido (403) quando o role é GUEST.'
- shouldListIntegrations:
    'Verifica que o GET /api/users/integrations devolve lista de integrações com apiKeyMasked para utilizador autenticado.'
- shouldDeleteIntegration:
    'Verifica que o DELETE /api/users/integrations/{id} devolve 200 e success=true para utilizador autenticado.'

### Classe "PasswordResetControllerTest"
- forgotPassword_ShouldReturnOk_WhenEmailIsValid:
    'Verifica que o POST /api/users/auth/password/forgot devolve 200 OK e mensagem genérica (sem leak de existência do email).'
- resetPassword_ShouldReturnOk_WhenTokenIsValid:
    'Verifica que o POST /api/users/auth/password/reset devolve 200 OK quando o token é válido.'

### Classe "UserControllerTest"
- shouldReturnListWhenAdmin:
    'Verifica que o GET /api/users é permitido para ADMIN e devolve lista serializada.'
- shouldReturnForbiddenWhenGuestListsUsers:
    'Verifica que o GET /api/users devolve 403 quando o role é GUEST.'
- shouldCreateUserWhenAdmin:
    'Verifica que o POST /api/users cria utilizador quando ADMIN, aplicando encoding de password antes de persistir.'
- shouldReturnForbiddenWhenOwnerCreatesUser:
    'Verifica que o POST /api/users devolve 403 quando o role é OWNER.'
- shouldReturnUserByIdWhenOwner:
    'Verifica que o GET /api/users/{id} devolve 200 para OWNER quando o utilizador existe.'
- shouldReturnForbiddenWhenGuestRequestsUserById:
    'Verifica que o GET /api/users/{id} devolve 403 quando o role é GUEST.'

### Classe "JwtAuthenticationFilterTest"
- shouldSkipWhenAuthorizationHeaderMissing:
    'Verifica que o filtro ignora autenticação quando Authorization está ausente e continua a FilterChain.'
- shouldSetAuthenticationOnValidToken:
    'Verifica que, com Bearer token válido, o filtro define Authentication no SecurityContext com ROLE correto.'
- shouldPrioritizeXUserRoleHeader:
    'Verifica que o role vindo do header X-User-Role tem prioridade sobre a role na base de dados.'
- shouldContinueChainOnInvalidToken:
    'Verifica que, perante token inválido/erro, o filtro não autentica e continua a FilterChain.'
- shouldAuthenticateUsingGatewayHeadersWhenAuthorizationMissing:
    'Verifica que, quando o header Authorization está ausente mas X-User-Email e X-User-Role estão presentes, o filtro autentica o utilizador via headers do Gateway sem chamar o JwtService.'

### Classe "EncryptedStringAttributeConverterTest"
- shouldConvertAndRecover:
    'Verifica que o AttributeConverter encripta ao persistir (db != plain) e desencripta ao ler (entity == plain).'

### Classe "AuthServiceTest"
- shouldRegisterWithDefaultOwnerRoleAndReturnToken:
    'Verifica que register cria utilizador com role OWNER por defeito, encripta password e devolve AuthResponse com token.'
- shouldFailRegisterWhenEmailExists:
    'Verifica que register falha com EmailAlreadyRegisteredException quando o email já existe e não persiste.'
- shouldLoginSuccessfullyAndReturnToken:
    'Verifica que login com credenciais corretas devolve AuthResponse com token e dados do utilizador.'
- shouldFailLoginWhenWrongPassword:
    'Verifica que login falha com InvalidCredentialsException quando a password não corresponde.'

### Classe "JwtServiceTest"
- shouldGenerateTokenWithClaims:
    'Verifica que generateToken inclui subject (email) e claims personalizadas (role, userId) e que podem ser extraídas.'
- shouldValidateTokenForCorrectEmail:
    'Verifica que isTokenValid devolve true quando o email corresponde ao subject do token.'
- shouldFailValidationForWrongEmail:
    'Verifica que isTokenValid devolve false quando o email fornecido não coincide com o token.'
- shouldFailValidationForExpiredToken:
    'Verifica que tokens expirados são invalidados (isTokenValid == false).'

### Classe "PasswordResetServiceTest"
- initiatePasswordReset_ShouldGenerateToken_WhenUserExists:
    'Verifica que initiatePasswordReset apaga tokens antigos do utilizador e cria um novo token quando o email existe.'
- initiatePasswordReset_ShouldDoNothing_WhenUserNotFound:
    'Verifica que initiatePasswordReset não grava token quando o email não existe (privacy).'
- resetPassword_ShouldUpdatePassword_WhenTokenIsValid:
    'Verifica que resetPassword atualiza a password, persiste o utilizador e remove o token quando válido.'
- resetPassword_ShouldThrowException_WhenTokenIsExpired:
    'Verifica que resetPassword lança InvalidTokenException e elimina token expirado sem guardar utilizador.'
- resetPassword_ShouldThrowException_WhenTokenNotFound:
    'Verifica que resetPassword lança InvalidTokenException quando o token não existe.'

### Classe "SecretCryptoServiceTest"
- shouldEncryptAndDecryptRoundTrip:
    'Verifica round-trip AES-256-GCM: encrypt produz valor diferente e decrypt recupera o texto original.'
- shouldFailDecryptOnTampering:
    'Verifica que adulteração do ciphertext/tag faz decrypt falhar com IllegalStateException (integridade GCM).'

### Classe "PasswordResetTokenTest"
- isExpired_ShouldReturnTrue_WhenDateIsInPast:
    'Verifica que isExpired devolve true quando expiryDate está no passado.'
- isExpired_ShouldReturnFalse_WhenDateIsInFuture:
    'Verifica que isExpired devolve false quando expiryDate está no futuro.'

### Classe "ActorContextFilterTest"
- setsActorContextFromGatewayHeaders:
  'Verifica que o filtro lê os headers X-User-Id e X-User-Email injectados pelo Gateway, popula o ActorContext durante o doFilter e limpa-o depois.'
- fallsBackToSecurityContextWhenHeadersMissing:
  'Verifica que, quando os headers do Gateway estão ausentes, o filtro usa o principal do SecurityContextHolder como actor e limpa o ActorContext após o doFilter.'

### Classe "UserEnversAuditTest"
- userEntityIsAudited:
  'Verifica que a entidade User está anotada com @Audited do Hibernate Envers.'
- revisionEntityIsConfigured:
  'Verifica que AuditRevisionEntity está anotada com @RevisionEntity e que a tabela se chama revinfo.'
- revisionListenerWritesActorIntoRevisionEntity:
  'Verifica que o AuditRevisionListener lê o actor do ActorContext e preenche actorUserId e actorEmail no AuditRevisionEntity.'

### Classe "GuestProfileControllerTest"
- getGuestProfile_ShouldReturn200_WhenUserIsAdmin:
  'Verifica que um utilizador com role ADMIN consegue fazer GET /api/users/{id}/profile e recebe 200 OK com os dados do perfil incluindo internalNotes e tags.'
- getGuestProfile_ShouldReturn200_WhenUserIsManager:
  'Verifica que um utilizador com role MANAGER consegue fazer GET /api/users/{id}/profile e recebe 200 OK.'
- getGuestProfile_ShouldReturn403_WhenUserIsGuest:
  'Verifica que um utilizador com role GUEST recebe 403 Forbidden ao tentar aceder ao GET /api/users/{id}/profile.'
- updateGuestProfile_ShouldReturn200_WhenAuthorized:
  'Verifica que um ADMIN consegue fazer PUT /api/users/{id}/profile com payload válido e recebe 200 OK com o perfil actualizado.'
- patchGuestProfile_ShouldReturn200_WhenAuthorized:
  'Verifica que um MANAGER consegue fazer PATCH /api/users/{id}/profile e recebe 200 OK.'
- patchGuestProfile_ShouldReturn403_WhenUnauthorized:
  'Verifica que um GUEST recebe 403 Forbidden ao tentar fazer PATCH /api/users/{id}/profile.'

### Classe "GuestProfileServiceTest"
- getProfileByUserId_ShouldReturnProfile_WhenExists:
  'Verifica que getProfileByUserId devolve GuestProfileResponse com todos os campos correctos quando o perfil existe no repositório.'
- getProfileByUserId_ShouldThrowException_WhenProfileNotFound:
  'Verifica que getProfileByUserId lança UserNotFoundException quando não existe perfil para o userId fornecido.'
- updateGuestProfile_ShouldUpdateExistingProfile:
  'Verifica que updateGuestProfile actualiza internalNotes e tags de um perfil existente e chama save() no repositório.'
- updateGuestProfile_ShouldCreateProfile_WhenNotExists:
  'Verifica comportamento de Upsert: quando o perfil não existe, updateGuestProfile cria um novo perfil associado ao utilizador e persiste-o.'
- patchGuestProfile_ShouldUpdateOnlyNotes:
  'Verifica que patchGuestProfile actualiza apenas os campos não nulos — altera internalNotes mas preserva as tags originais quando tags é nulo no request.'