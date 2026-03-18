import { usersAxios, ApiResponse } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { toast } from "sonner";

/**
 * Interface para os dados de resposta de autenticação.
 */
export interface AuthResponse {
    token: string;
    id: number;
    email: string;
    role: string;
}

/**
 * Interface para as credenciais de login e registo.
 */
export interface AuthCredentials {
    email: string;
    password?: string;
    phone?: string;
}

/**
 * Serviço responsável por encapsular a lógica de autenticação e gestão de erros.
 */
export class AuthService {
    
    /**
     * Realiza o login do utilizador e gere o armazenamento da sessão.
     */
    static async login(credentials: AuthCredentials): Promise<AuthResponse | null> {
        try {
            const response = await usersAxios.post<ApiResponse<AuthResponse>>("/auth/login", credentials);
            
            if (response.status === 200 && response.data.success) {
                const data = response.data.data;
                this.setSession(data);
                toast.success("Bem-vindo de volta!");
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
     */
    static async register(credentials: AuthCredentials): Promise<AuthResponse | null> {
        try {
            const response = await usersAxios.post<ApiResponse<AuthResponse>>("/auth/register", credentials);
            
            if (response.status === 200 && response.data.success) {
                const data = response.data.data;
                this.setSession(data);
                toast.success("Conta criada com sucesso! Bem-vindo.");
                return data;
            }
            return null;
        } catch (error: unknown) {
            this.handleAuthError(error, "register");
            throw error;
        }
    }

    /**
     * Termina a sessão do utilizador limpando o armazenamento local.
     */
    static logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        
        // Notifica outros componentes sobre a mudança de autenticação
        window.dispatchEvent(new Event('auth-change'));
        
        toast.success("Sessão terminada com sucesso.");
        setTimeout(() => {
            window.location.href = "/";
        }, 1000);
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
                    case 401: toast.error("Email ou senha incorretos. Tente novamente."); break;
                    case 403: toast.error("A sua conta está desativada. Contacte o suporte."); break;
                    case 404: toast.error("Utilizador não encontrado."); break;
                    case 429: toast.warning("Muitas tentativas. Tente novamente mais tarde."); break;
                    default: toast.error("Erro no servidor. Por favor, tente mais tarde.");
                }
            } else {
                switch (status) {
                    case 400: toast.error("Dados inválidos. Verifique os campos."); break;
                    case 409: toast.error("Este email já está registado. Tente fazer login."); break;
                    case 422: toast.error("Dados de registo inconsistentes."); break;
                    default: toast.error("Erro no servidor ao criar conta. Tente mais tarde.");
                }
            }
        } else {
            toast.error("Erro de conexão. Verifique a sua internet.");
        }
    }
}
