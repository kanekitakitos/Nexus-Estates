/**
 * @description
 * Ficheiro onde, a partir da ferramenta Axios, o frontEnd pode comunicar com serviços, a partir de operações HTTP
 */

import axios, { AxiosInstance } from 'axios';

/**
 * Aplica interceptores para lidar com o token do login no localStorage
 * @param apiAxios - AxiosInstance
 */
function aplicarConfiguracoes(apiAxios: AxiosInstance) {
    // configuração do interceptor do pedido enviado
    apiAxios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
    })

    // configuração do interceptor do resposta recebida
    apiAxios.interceptors.response.use(
        (response) => response, // se for sucesso, apenas retorna a resposta
        (error) => {
            console.error('Erro na resposta da API:', error);
            if (error.response) {
                console.error('Resposta de erro do servidor:', error.response.data);
            }   
            localStorage.removeItem('token'); // Remove o token do localStorage em caso de erro (ex: token expirado)
            return Promise.reject(error);
        })
}

//caminho para o apiGateWay
const apiGateWay = 'http://localhost:8080/api/v1'


//pré-configurações do axios, para comunicar com serviços especificos
const gateWayAxios = axios.create({
    baseURL: apiGateWay
});
aplicarConfiguracoes(gateWayAxios);

const usersAxios = axios.create({
    baseURL: apiGateWay + '/users',
    withCredentials: true
});
aplicarConfiguracoes(usersAxios);

const propertiesAxios = axios.create({
    baseURL: apiGateWay + '/properties'
});
aplicarConfiguracoes(propertiesAxios);

const bookingsAxios = axios.create({
    baseURL: apiGateWay + '/bookings'
});
aplicarConfiguracoes(bookingsAxios);

export { gateWayAxios, usersAxios, propertiesAxios, bookingsAxios };