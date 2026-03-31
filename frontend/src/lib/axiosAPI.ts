/**
 * @description
 * Configuração central do Axios para comunicação com o API Gateway do Nexus Estates.
 * Implementa interceptores para gestão de JWT, tratamento de erros global e suporte a SSR.
 */

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// URL base do API Gateway (Porta 8080)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
 * Interface genérica para respostas da API do Nexus Estates.
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    error?: {
        status: number;
        message: string;
        path: string;
        timestamp: string;
        validationErrors?: Record<string, string>;
    };
}

const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Verifica se estamos no lado do cliente antes de aceder ao localStorage
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
};

const requestErrorHandler = (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
};

const responseInterceptor = (response: AxiosResponse): AxiosResponse => response;

const responseErrorHandler = (error: AxiosError): Promise<AxiosError> => {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string };

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
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            window.dispatchEvent(new Event('auth-change'));
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
};

api.interceptors.request.use(requestInterceptor, requestErrorHandler);
api.interceptors.response.use(responseInterceptor, responseErrorHandler);

/**
 * Instâncias especializadas para manter compatibilidade com o código existente
 */
export const gateWayAxios = api;

export const usersAxios = axios.create({
    baseURL: `${API_BASE_URL}/users`,
    withCredentials: true,
});
usersAxios.interceptors.request.use(requestInterceptor, requestErrorHandler);
usersAxios.interceptors.response.use(responseInterceptor, responseErrorHandler);

/**
 * Cliente para o Property Service.
 *
 * Base path:
 * - /api/properties
 */
export const propertiesAxios = axios.create({
    baseURL: `${API_BASE_URL}/properties`,
});
propertiesAxios.interceptors.request.use(requestInterceptor, requestErrorHandler);
propertiesAxios.interceptors.response.use(responseInterceptor, responseErrorHandler);

/**
 * Cliente para o catálogo de Amenities.
 *
 * Base path:
 * - /api/amenities
 */
export const amenitiesAxios = axios.create({
    baseURL: `${API_BASE_URL}/amenities`,
});
amenitiesAxios.interceptors.request.use(requestInterceptor, requestErrorHandler);
amenitiesAxios.interceptors.response.use(responseInterceptor, responseErrorHandler);

/**
 * Cliente para o Sync Service (realtime, chat, webhooks internos).
 *
 * Base path:
 * - /api/sync
 */
export const syncAxios = axios.create({
    baseURL: `${API_BASE_URL}/sync`,
});
syncAxios.interceptors.request.use(requestInterceptor, requestErrorHandler);
syncAxios.interceptors.response.use(responseInterceptor, responseErrorHandler);

/**
 * Cliente para o Booking Service.
 *
 * Base path:
 * - /api/bookings
 */
export const bookingsAxios = axios.create({
    baseURL: `${API_BASE_URL}/bookings`,
});
bookingsAxios.interceptors.request.use(requestInterceptor, requestErrorHandler);
bookingsAxios.interceptors.response.use(responseInterceptor, responseErrorHandler);

export default api;
