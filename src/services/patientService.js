import { api } from './api';

export const patientService = {
    fetchPatients: (query = '') => api.get(`/patients${query}`),
    updatePatient: (id, data) => api.put(`/patients/${id}`, data),
    updatePatientMedical: (id, data) => api.put(`/patients/${id}/medical`, data),
};
