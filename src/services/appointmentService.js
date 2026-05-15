import { api } from './api';

export const appointmentService = {
    fetchAppointments: (query = '') => api.get(`/appointments${query}`),
    createAppointment: (data) => api.post('/appointments', data),
    updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
    deleteAppointment: (id) => api.delete(`/appointments/${id}`),
    patchMonto: (id, monto) => api.patch(`/appointments/${id}/monto`, { monto }),
};
