import { usersAxios, ApiResponse } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { notify } from "@/lib/notify";
import type { AuthCredentials, AuthResponse } from "@/types/auth";

export type { AuthCredentials, AuthResponse } from "@/types/auth";

/**
 * Serviço responsável por encapsular a lógica de autenticação e gestão de erros.
 *
 * Base path no API Gateway:
 * - /api/users
 *
 * Instância Axios utilizada:
 * - usersAxios (baseURL: {NEXT_PUBLIC_API_URL}/users)
 */
export class AuthService {
    static getSession(): { token: string; userId: string; email: string; role: string; isAuthenticated: boolean } {
        if (typeof window === "undefined") {
            return { token: "", userId: "", email: "", role: "", isAuthenticated: false };
        }
        const token = localStorage.getItem("token") ?? "";
        const userId = localStorage.getItem("userId") ?? "";
        const email = localStorage.getItem("userEmail") ?? "";
        const role = localStorage.getItem("userRole") ?? "";
        return { token, userId, email, role, isAuthenticated: Boolean(token) };
    }

    static subscribeSession(onChange: () => void): () => void {
        if (typeof window === "undefined") return () => {};
        const handler = () => onChange();
        window.addEventListener("storage", handler);
        window.addEventListener("auth-change", handler);
        return () => {
            window.removeEventListener("storage", handler);
            window.removeEventListener("auth-change", handler);
        };
    }

    static getAuthHeaders(): Record<string, string> {
        const session = this.getSession();
        if (!session.token) return {};
        return { Authorization: `Bearer ${session.token}` };
    }
    
    /**
     * Realiza o login do utilizador e gere o armazenamento da sessão.
     *
     * Endpoint backend:
     * - POST /api/users/auth/login
     */
    static async login(credentials: AuthCredentials): Promise<AuthResponse | null> {
        try {
            const response = await usersAxios.post<ApiResponse<AuthResponse>>("/auth/login", credentials);
            
            if (response.status === 200 && response.data.success) {
                const data = response.data.data;
                this.setSession(data);
                notify.success("Bem-vindo de volta!");
                return data;
            }
            return null;
        } catch (error: unknown) {
            this.handleAuthError(error, "login");
            throw error;
        }
    }

    /**
     * Regista um novo utilizador e inicia sessão automaticamente.
     *
     * Endpoint backend:
     * - POST /api/users/auth/register
     */
    static async register(credentials: AuthCredentials): Promise<AuthResponse | null> {
        try {
            const response = await usersAxios.post<ApiResponse<AuthResponse>>("/auth/register", credentials);
            
            if (response.status === 200 && response.data.success) {
                const data = response.data.data;
                this.setSession(data);
                notify.success("Conta criada com sucesso! Bem-vindo.");
                return data;
            }
            return null;
        } catch (error: unknown) {
            this.handleAuthError(error, "register");
            throw error;
        }
    }

    /**
     * Inicia o fluxo de recuperação de password (envio de email com token).
     *
     * Endpoint backend:
     * - POST /api/users/auth/password/forgot
     *
     * Comportamento esperado:
     * - Resposta é genérica para evitar enumeração de utilizadores.
     */
    static async forgotPassword(email: string): Promise<boolean> {
        try {
            const response = await usersAxios.post<ApiResponse<void>>("/auth/password/forgot", { email });
            if (response.status === 200 && response.data.success) {
                notify.success("Se o email existir, enviámos instruções para recuperar a password.");
                return true;
            }
            return false;
        } catch (error: unknown) {
            notify.error("Não foi possível iniciar a recuperação de password.");
            throw error;
        }
    }

    /**
     * Conclui o reset de password usando token + nova password.
     *
     * Endpoint backend:
     * - POST /api/users/auth/password/reset
     */
    static async resetPassword(token: string, newPassword: string): Promise<boolean> {
        try {
            const response = await usersAxios.post<ApiResponse<void>>("/auth/password/reset", { token, newPassword });
            if (response.status === 200 && response.data.success) {
                notify.success("Password alterada com sucesso. Faça login novamente.");
                return true;
            }
            return false;
        } catch (error: unknown) {
            notify.error("Token inválido ou expirado.");
            throw error;
        }
    }

    static async clerkExchange(clerkToken: string): Promise<AuthResponse | null> {
        try {
            const response = await usersAxios.post<ApiResponse<AuthResponse>>(
                "/auth/clerk/exchange",
                {},
                { headers: { Authorization: `Bearer ${clerkToken}` } }
            );

            if (response.status === 200 && response.data.success) {
                const data = response.data.data;
                this.setSession(data);
                notify.success("Login social concluído.");
                return data;
            }
            return null;
        } catch (error: unknown) {
            notify.error("Falhou login social.");
            throw error;
        }
    }

    /**
     * Termina a sessão do utilizador limpando o armazenamento local.
     */
    static logout(): void {
        if (typeof window === "undefined") return;
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        
        // Notifica outros componentes sobre a mudança de autenticação
        window.dispatchEvent(new Event('auth-change'));
        
        notify.success("Sessão terminada com sucesso.");
        setTimeout(() => {
            window.location.href = "/";
        }, 1000);
    }

    static applySession(auth: AuthResponse): void {
        if (typeof window === "undefined") return;
        this.setSession(auth);
    }

    /**
     * Armazena os dados da sessão no localStorage.
     */
    private static setSession(auth: AuthResponse): void {
        const normalizedRole = (auth.role || "").replace(/^ROLE_/, "").toUpperCase();
        localStorage.setItem('token', auth.token);
        localStorage.setItem('userId', auth.id.toString());
        localStorage.setItem('userEmail', auth.email);
        localStorage.setItem('userRole', normalizedRole);
        
        // Notifica outros componentes sobre a mudança de autenticação
        window.dispatchEvent(new Event('auth-change'));
    }

    private static isAxiosError(error: unknown): error is AxiosError {
        return typeof error === "object" && error !== null && "isAxiosError" in error;
    }

    /**
     * Tratamento centralizado de erros de autenticação.
     */
    private static handleAuthError(error: unknown, type: 'login' | 'register'): void {
        if (this.isAxiosError(error) && error.response) {
            const status = error.response.status;
            
            if (type === 'login') {
                switch (status) {
                    case 401: notify.error("Email ou senha incorretos. Tente novamente."); break;
                    case 403: notify.error("A sua conta está desativada. Contacte o suporte."); break;
                    case 404: notify.error("Utilizador não encontrado."); break;
                    case 429: notify.warning("Muitas tentativas. Tente novamente mais tarde."); break;
                    default: notify.error("Erro no servidor. Por favor, tente mais tarde.");
                }
            } else {
                switch (status) {
                    case 400: notify.error("Dados inválidos. Verifique os campos."); break;
                    case 409: notify.error("Este email já está registado. Tente fazer login."); break;
                    case 422: notify.error("Dados de registo inconsistentes."); break;
                    default: notify.error("Erro no servidor ao criar conta. Tente mais tarde.");
                }
            }
        } else {
            notify.error("Erro de conexão. Verifique a sua internet.");
        }
    }
}
