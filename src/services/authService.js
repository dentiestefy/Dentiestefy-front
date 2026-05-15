import { api } from './api';

export const authService = {
    loginRequest: (username, password) => api.post('/auth/login', { username, password }),
};
