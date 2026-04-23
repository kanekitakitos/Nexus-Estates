/**
 * @description
 * Configuração central do Axios para comunicação com o API Gateway do Nexus Estates.
 * Implementa interceptores para gestão de JWT, tratamento de erros global e suporte a SSR.
 */

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { AuthService } from '@/services/auth.service';

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
    transformResponse: [safeJsonTransform],
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

function extractFirstJsonValue(text: string): string | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const start = trimmed[0];
    const end = start === '{' ? '}' : start === '[' ? ']' : null;
    if (!end) return null;

    let depth = 0;
    let inString = false;
    let escaping = false;

    for (let i = 0; i < trimmed.length; i += 1) {
        const ch = trimmed[i];

        if (inString) {
            if (escaping) {
                escaping = false;
                continue;
            }
            if (ch === '\\') {
                escaping = true;
                continue;
            }
            if (ch === '"') {
                inString = false;
            }
            continue;
        }

        if (ch === '"') {
            inString = true;
            continue;
        }

        if (ch === '{' || ch === '[') depth += 1;
        else if (ch === '}' || ch === ']') depth -= 1;

        if (depth === 0 && ch === end) {
            return trimmed.slice(0, i + 1);
        }
    }

    return null;
}

function safeJsonTransform(data: unknown): unknown {
    if (typeof data !== 'string') return data;
    const text = data.trim();
    if (!text) return data;

    try {
        return JSON.parse(text);
    } catch {
        const first = extractFirstJsonValue(text);
        if (!first) return data;
        try {
            return JSON.parse(first);
        } catch {
            return data;
        }
    }
}

const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const headers = AuthService.getAuthHeaders();
    if (headers.Authorization && config.headers) config.headers.Authorization = headers.Authorization;
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
        AuthService.logout();
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
    transformResponse: [safeJsonTransform],
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
    transformResponse: [safeJsonTransform],
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
    transformResponse: [safeJsonTransform],
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
    transformResponse: [safeJsonTransform],
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
    transformResponse: [safeJsonTransform],
});
bookingsAxios.interceptors.request.use(requestInterceptor, requestErrorHandler);
bookingsAxios.interceptors.response.use(responseInterceptor, responseErrorHandler);

/**
 * Cliente para o Finance Service.
 *
 * Base path:
 * - /api/finance
 */
export const financeAxios = axios.create({
    baseURL: `${API_BASE_URL}/finance`,
    transformResponse: [safeJsonTransform],
});
financeAxios.interceptors.request.use(requestInterceptor, requestErrorHandler);
financeAxios.interceptors.response.use(responseInterceptor, responseErrorHandler);

export default api;
