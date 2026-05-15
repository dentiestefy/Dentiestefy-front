import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
import { evolutionService } from '../services/evolutionService';
import { userService } from '../services/userService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const { currentUser } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [evolutions, setEvolutions] = useState([]);
    const [users, setUsers] = useState([]);

    // We can fetch initial data when the user logs in
    useEffect(() => {
        if (currentUser) {
            loadInitialData();
        } else {
            // Clear when logged out
            setAppointments([]);
            setPatients([]);
            setEvolutions([]);
            setUsers([]);
        }
    }, [currentUser]);

    const normalizeData = (arr) => arr.map(item => ({ ...item, id: item._id || item.id }));

    const loadInitialData = async () => {
        try {
            const [apptsRes, patientsRes, evolsRes, usersRes] = await Promise.all([
                appointmentService.fetchAppointments(),
                patientService.fetchPatients(),
                evolutionService.fetchEvolutions(),
                userService.fetchUsers(),
            ]);
            setAppointments(apptsRes ? normalizeData(apptsRes) : []);
            setPatients(patientsRes ? normalizeData(patientsRes) : []);
            setEvolutions(evolsRes ? normalizeData(evolsRes) : []);
            setUsers(usersRes ? normalizeData(usersRes) : []);
        } catch (error) {
            console.error('Error loading initial data', error);
        }
    };

    // ===== Appointments =====
    const addAppointment = async (appt) => {
        try {
            const result = await appointmentService.createAppointment(appt);
            const appointmentData = result.appointment ? result.appointment : result;

            if (appointmentData && (appointmentData._id || appointmentData.id)) {
                const newAppt = { ...appointmentData, id: appointmentData._id || appointmentData.id };
                setAppointments((prev) => [...prev, newAppt]);

                // Refresh patients si el backend creó uno nuevo.
                // Como el backend no responde explícitamente con patientCreated, revisamos si el pacienteId de la nueva cita no existía en nuestro state actual.
                const patientIsNew = newAppt.pacienteId && !patients.find(p => p.id === newAppt.pacienteId);

                if (result.patientCreated || !appointmentData.pacienteId || patientIsNew) {
                    const patientsRes = await patientService.fetchPatients();
                    setPatients(patientsRes ? normalizeData(patientsRes) : []);
                }
                return newAppt;
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const updateAppointment = async (id, updates) => {
        try {
            const result = await appointmentService.updateAppointment(id, updates);
            if (result) {
                setAppointments((prev) =>
                    prev.map((a) => (a._id === id || a.id === id ? { ...a, ...result } : a))
                );
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const deleteAppointment = async (id) => {
        try {
            await appointmentService.deleteAppointment(id);
            setAppointments((prev) => prev.filter((a) => a._id !== id && a.id !== id));
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    // ===== Patients =====
    const updatePatient = async (id, updates) => {
        try {
            const result = await patientService.updatePatient(id, updates);
            if (result) {
                setPatients((prev) =>
                    prev.map((p) => (p._id === id || p.id === id ? { ...p, ...result } : p))
                );
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const updatePatientMedicalHistory = async (id, antecedentes) => {
        try {
            const result = await patientService.updatePatientMedical(id, antecedentes);
            if (result) {
                setPatients((prev) =>
                    prev.map((p) =>
                        p._id === id || p.id === id ? { ...p, antecedentes: { ...p.antecedentes, ...antecedentes } } : p
                    )
                );
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    // ===== Evolutions =====
    const addEvolution = async (evolution) => {
        try {
            const result = await evolutionService.createEvolution(evolution);
            if (result) {
                const newEv = { ...result, id: result._id || result.id };
                setEvolutions((prev) => [...prev, newEv]);
                return newEv;
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    // ===== Users =====
    const addUser = async (user) => {
        try {
            const result = await userService.createUser(user);
            if (result && result.user) {
                const newUser = { ...result.user, id: result.user._id || result.user.id };
                setUsers((prev) => [...prev, newUser]);
                return newUser;
            } else if (result) {
                const newUser = { ...result, id: result._id || result.id };
                setUsers((prev) => [...prev, newUser]);
                return newUser;
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const updateUser = async (id, updates) => {
        try {
            const result = await userService.updateUser(id, updates);
            if (result) {
                setUsers((prev) =>
                    prev.map((u) => (u._id === id || u.id === id ? { ...u, ...result } : u))
                );
                // Si el usuario actualizado es el actual, recargar datos del user (opcional)
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    // ===== Accounting helpers =====
    const updateAppointmentMonto = async (id, monto) => {
        try {
            const result = await appointmentService.patchMonto(id, monto);
            if (result) {
                setAppointments((prev) =>
                    prev.map((a) => (a._id === id || a.id === id ? { ...a, monto } : a))
                );
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    return (
        <AppContext.Provider
            value={{
                appointments,
                patients,
                evolutions,
                users,
                addAppointment,
                updateAppointment,
                deleteAppointment,
                updatePatient,
                updatePatientMedicalHistory,
                addEvolution,
                addUser,
                updateUser,
                updateAppointmentMonto,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
