/**
 * @file auth.ts
 * @author Nexus Estates team
 * @description Tipos do módulo de autenticação.
 *              Inclui os formatos das respostas e pedidos de login, registo, e recuperação de senha.
 *
 * Origem backend (API Gateway):
 * - POST /api/users/auth/login
 * - POST /api/users/auth/register
 * - POST /api/users/auth/password/forgot
 * - POST /api/users/auth/password/reset
 */
export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  role: string;
}

/**
 * Payload usado no frontend para login/registo.
 *
 * Nota:
 * - O backend tem DTOs próprios; este tipo unifica o consumo no frontend.
 */
export interface AuthCredentials {
  email: string;
  password?: string;
  phone?: string;
  role?: string;
}
