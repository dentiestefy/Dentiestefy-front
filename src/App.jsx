import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login/Login';
import Agenda from './pages/Agenda/Agenda';
import Perfil from './pages/Perfil/Perfil';
import Evoluciones from './pages/Evoluciones/Evoluciones';
import PatientDetail from './pages/Evoluciones/PatientDetail';
import Contabilidad from './pages/Contabilidad/Contabilidad';
import Usuarios from './pages/Usuarios/Usuarios';

function ProtectedRoute({ children, allowedRoles }) {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/agenda" replace />;
    }
    return children;
}

export default function App() {
    const { currentUser } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={currentUser ? <Navigate to="/agenda" replace /> : <Login />}
            />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/agenda" replace />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="perfil" element={<Perfil />} />
                <Route
                    path="evoluciones"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                            <Evoluciones />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="evoluciones/:patientId"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                            <PatientDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="contabilidad"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                            <Contabilidad />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="usuarios"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'secretaria']}>
                            <Usuarios />
                        </ProtectedRoute>
                    }
                />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
