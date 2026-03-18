import { usersAxios } from "@/lib/axiosAPI";
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
 * Interface para as credenciais de login.
 */
export interface LoginCredentials {
    email: string;
    password?: string;
}

/**
 * Serviço responsável por encapsular a lógica de autenticação e gestão de erros.
 */
export class AuthService {
    
    /**
     * Realiza o login do utilizador e gere o armazenamento da sessão.
     */
    static async login(credentials: LoginCredentials): Promise<AuthResponse | null> {
        try {
            const response = await usersAxios.post<AuthResponse>("/auth/login", credentials);
            
            if (response.status === 200) {
                const data = response.data;
                this.setSession(data);
                toast.success("Bem-vindo de volta!");
                return data;
            }
            return null;
        } catch (error: any) {
            this.handleAuthError(error, "login");
            throw error;
        }
    }

    /**
     * Regista um novo utilizador e inicia sessão automaticamente.
     */
    static async register(credentials: LoginCredentials): Promise<AuthResponse | null> {
        try {
            const response = await usersAxios.post<AuthResponse>("/auth/register", credentials);
            
            if (response.status === 200) {
                const data = response.data;
                this.setSession(data);
                toast.success("Conta criada com sucesso! Bem-vindo.");
                return data;
            }
            return null;
        } catch (error: any) {
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
        toast.success("Sessão terminada com sucesso.");
        setTimeout(() => {
            window.location.href = "/login";
        }, 1000);
    }

    /**
     * Armazena os dados da sessão no localStorage.
     */
    private static setSession(auth: AuthResponse): void {
        localStorage.setItem('token', auth.token);
        localStorage.setItem('userId', auth.id.toString());
        localStorage.setItem('userEmail', auth.email);
        localStorage.setItem('userRole', auth.role);
    }

    /**
     * Tratamento centralizado de erros de autenticação.
     */
    private static handleAuthError(error: any, type: 'login' | 'register'): void {
        if (error.response) {
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
