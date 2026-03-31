# api-gateway — Testes

## Índice
- [Classe "AuthenticationFilterTest"](#classe-authenticationfiltertest)
- [Classe "RouteValidatorTest"](#classe-routevalidatortest)
- [Classe "JwtUtilTest"](#classe-jwtutiltest)

### Classe "AuthenticationFilterTest"
- shouldPassThroughWhenRouteIsNotSecured:
    'Verifica que pedidos para rotas públicas passam pelo filter sem validar JWT e que a chain é executada.'
- shouldThrowExceptionWhenAuthHeaderIsMissingForSecuredRoute:
    'Verifica que rotas seguras sem header Authorization causam RuntimeException.'
- shouldValidateTokenWhenAuthHeaderIsPresent:
    'Verifica que, com Bearer token presente, o token é validado e a request segue na chain.'

### Classe "RouteValidatorTest"
- shouldReturnTrueForOpenEndpoints:
    'Verifica que o endpoint de login é considerado público (isSecured == false).'
- shouldReturnTrueForSecuredEndpoints:
    'Verifica que um endpoint protegido (ex.: /api/bookings) é considerado seguro (isSecured == true).'

### Classe "JwtUtilTest"
- shouldValidateValidToken:
    'Verifica que um token JWT assinado com a secret configurada é validado sem lançar exceção.'
- shouldThrowExceptionForInvalidToken:
    'Verifica que um token inválido lança exceção durante a validação.'

