import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        // Init from sessionStorage (per-tab session: a new window/tab won't share the session)
        const stored = sessionStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        // Listen to unauthorized events from API to logout
        const handleUnauthorized = () => logout();
        window.addEventListener('unauthorized', handleUnauthorized);
        return () => window.removeEventListener('unauthorized', handleUnauthorized);
    }, []);

    const login = async (username, password) => {
        try {
            const data = await authService.loginRequest(username, password);
            if (data.success && data.token) {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('user', JSON.stringify(data.user));
                setCurrentUser(data.user);
                return { success: true };
            }
            return { success: false, error: 'Credenciales inválidas' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setCurrentUser(null);
    };

    const isAdmin = currentUser?.role === 'admin';
    const isDoctor = currentUser?.role === 'doctor' || currentUser?.role === 'admin';
    const isSecretaria = currentUser?.role === 'secretaria';

    const canManageAppointments = isAdmin || isSecretaria || currentUser?.role === 'doctor';
    const canChooseDoctor = isAdmin || isSecretaria; // doctores solo pueden agendar para ellos mismos
    const canViewEvolutions = isAdmin || currentUser?.role === 'doctor';
    const canViewAccounting = isAdmin || currentUser?.role === 'doctor';
    const canManageUsers = isAdmin;

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                login,
                logout,
                isAdmin,
                isDoctor,
                isSecretaria,
                canManageAppointments,
                canChooseDoctor,
                canViewEvolutions,
                canViewAccounting,
                canManageUsers,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
