/**
 * @description
 * Configuração central do Axios para comunicação com o API Gateway do Nexus Estates.
 * Implementa interceptores para gestão de JWT, tratamento de erros global e suporte a SSR.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// URL base do API Gateway (Porta 8080)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Instância principal para chamadas ao Gateway
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor de Pedido: Injeta o Token JWT se existir
 */
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Verifica se estamos no lado do cliente antes de aceder ao localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor de Resposta: Tratamento de Erros Global
 */
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;
        const data = error.response?.data as any;

        // Erro de Rede (Servidor desligado ou problemas de conectividade)
        if (!error.response) {
            toast.error('Erro de rede: O servidor não responde. Verifique se o backend está ligado.');
            if (process.env.NODE_ENV === 'development') {
                console.error('[Network Error]: O servidor em ' + API_BASE_URL + ' não está a responder.');
            }
            return Promise.reject(error);
        }

        // Erro de Autenticação (401)
        if (status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                // Opcional: Redirecionar para login se não estiver numa rota pública
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login?expired=true';
                }
            }
        }

        // Erro de Permissão (403)
        if (status === 403) {
            toast.error('Não tem permissão para realizar esta ação.');
        }

        // Erros de Servidor (500+)
        if (status && status >= 500) {
            toast.error('Erro no servidor. Tente novamente mais tarde.');
        }

        // Log de erro para debug em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.error(`[API Error ${status}]:`, data?.message || error.message);
        }

        return Promise.reject(error);
    }
);

/**
 * Instâncias especializadas para manter compatibilidade com o código existente
 */
export const gateWayAxios = api;

export const usersAxios = axios.create({
    baseURL: `${API_BASE_URL}/users`,
    withCredentials: true,
});
// Aplicar os mesmos interceptores da instância principal
usersAxios.interceptors.request = api.interceptors.request as any;
usersAxios.interceptors.response = api.interceptors.response as any;

export const propertiesAxios = axios.create({
    baseURL: `${API_BASE_URL}/properties`,
});
propertiesAxios.interceptors.request = api.interceptors.request as any;
propertiesAxios.interceptors.response = api.interceptors.response as any;

export const syncAxios = axios.create({
    baseURL: `${API_BASE_URL}/sync`,
});
syncAxios.interceptors.request = api.interceptors.request as any;
syncAxios.interceptors.response = api.interceptors.response as any;

export const bookingsAxios = axios.create({
    baseURL: `${API_BASE_URL}/bookings`,
});
bookingsAxios.interceptors.request = api.interceptors.request as any;
bookingsAxios.interceptors.response = api.interceptors.response as any;

export default api;
