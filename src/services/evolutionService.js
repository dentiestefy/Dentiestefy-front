import { api } from './api';

export const evolutionService = {
    fetchEvolutions: (query = '') => api.get(`/evolutions${query}`),
    createEvolution: (data) => api.post('/evolutions', data),
};
