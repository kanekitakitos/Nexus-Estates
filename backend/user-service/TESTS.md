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

