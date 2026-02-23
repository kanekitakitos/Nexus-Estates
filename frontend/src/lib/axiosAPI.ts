import axios, { AxiosInstance } from 'axios';

function aplicarConfiguracoes(apiAxios: AxiosInstance) {
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

const apiGateWay = 'http://localhost:8080/api/v1'

const gateWayAxios = axios.create({
    baseURL: apiGateWay
});
aplicarConfiguracoes(gateWayAxios);

const usersAxios = axios.create({
    baseURL: apiGateWay + '/users'
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