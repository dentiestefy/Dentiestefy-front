import { NavLink, useNavigate } from 'react-router-dom';
import { Calendar, User, Activity, Wallet, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const menuItems = [
    { path: '/agenda', label: 'Agenda', icon: Calendar, roles: ['admin', 'doctor', 'secretaria'] },
    { path: '/perfil', label: 'Perfil', icon: User, roles: ['admin', 'doctor', 'secretaria'] },
    { path: '/evoluciones', label: 'Evoluciones', icon: Activity, roles: ['admin', 'doctor'] },
    { path: '/contabilidad', label: 'Contabilidad', icon: Wallet, roles: ['admin', 'doctor'] },
    { path: '/usuarios', label: 'Usuarios', icon: Users, roles: ['admin', 'secretaria'] },
];

export default function Sidebar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const filteredMenu = menuItems.filter((item) =>
        item.roles.includes(currentUser?.role)
    );

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || '??';
    };

    const getRoleLabel = (role) => {
        const labels = { admin: 'Administrador', doctor: 'Doctor', secretaria: 'Secretaria' };
        return labels[role] || role;
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="8" fill="#0ea5e9" />
                            <path d="M16 6c-3.5 0-6 2-6 5.5 0 2.5 1 4 1.5 6.5.5 2.5 1 7 2.5 8s2-2 2-2 .5 3 2 2 2-5.5 2.5-8S22 14 22 11.5C22 8 19.5 6 16 6z" fill="white" />
                        </svg>
                    </div>
                    <span className="sidebar-logo-text">DentiEstefy</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {filteredMenu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {getInitials(currentUser?.nombre)}
                    </div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{currentUser?.nombre}</span>
                        <span className="sidebar-user-role">{getRoleLabel(currentUser?.role)}</span>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={handleLogout} title="Cerrar sesión">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
}
