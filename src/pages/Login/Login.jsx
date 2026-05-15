import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Shield } from 'lucide-react';
import Button from '../../components/Shared/Button';
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await login(username, password);
            if (result.success) {
                navigate('/agenda');
            } else {
                setError(result.error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-tooth" />
            <div className="login-bg-cross" />

            <div className="login-container">
                <div className="login-logo">
                    <div className="login-logo-icon">
                        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="8" fill="#0ea5e9" />
                            <path d="M16 6c-3.5 0-6 2-6 5.5 0 2.5 1 4 1.5 6.5.5 2.5 1 7 2.5 8s2-2 2-2 .5 3 2 2 2-5.5 2.5-8S22 14 22 11.5C22 8 19.5 6 16 6z" fill="white" />
                        </svg>
                    </div>
                    <span className="login-logo-text">DentiEstefy</span>
                </div>

                <div className="login-card">
                    <h1 className="login-title">Bienvenido</h1>
                    <p className="login-subtitle">Ingresa tus credenciales para continuar</p>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-field">
                            <label className="login-label">Nombre de usuario</label>
                            <input
                                type="text"
                                className="login-input"
                                placeholder="Ej. dr_garcia"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="login-field">
                            <div className="login-label-row">
                                <label className="login-label">Contraseña</label>
                                <a href="#" className="login-forgot">¿Olvidaste tu contraseña?</a>
                            </div>
                            <div className="login-password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="login-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="login-eye"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="login-error">{error}</p>}

                        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading}>
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </form>

                    <div className="login-divider">
                        <span>ACCESO SEGURO</span>
                    </div>

                    <div className="login-secure-notice">
                        <Shield size={18} />
                        <p>Esta es una plataforma de uso clínico restringido. Todas las acciones son monitoreadas.</p>
                    </div>
                </div>

                <div className="login-footer">
                    <p>¿No tienes una cuenta de DentiEstefy? <a href="#">Contáctanos para contratar el servicio</a></p>
                </div>

                <div className="login-demo-credentials">
                    <p className="login-demo-title">Credenciales de prueba:</p>
                    <div className="login-demo-grid">
                        <div><strong>Admin:</strong> dr_rmartinez / admin123</div>
                        <div><strong>Doctor:</strong> dra_acastro / doctor123</div>
                        <div><strong>Secretaria:</strong> mj_lopez / sec123</div>
                    </div>
                </div>

                <p className="login-status">
                    <span className="login-status-dot" />
                    SERVIDORES OPERATIVOS
                </p>
            </div>
        </div>
    );
}
