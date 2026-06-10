import axios from 'axios';

// Cria uma instância padrão do Axios apontando para o seu Java Spring Boot
export const api = axios.create({
    baseURL: 'https://eleven-cases-shave.loca.lt/api',
    timeout: 15000, // Dá até 15 segundos para o Python fazer os cálculos pesados
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;
