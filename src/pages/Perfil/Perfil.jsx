import { useState, useMemo } from 'react';
import { Edit, Eye, Calendar, Clock, User as UserIcon, Mail, Phone, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Card from '../../components/Shared/Card';
import Button from '../../components/Shared/Button';
import Table from '../../components/Shared/Table';
import Badge from '../../components/Shared/Badge';
import Modal from '../../components/Shared/Modal';
import Input from '../../components/Shared/Input';
import SearchBar from '../../components/Shared/SearchBar';
import './Perfil.css';

export default function Perfil() {
    const { currentUser } = useAuth();
    const { appointments, updateUser, updateAppointment } = useApp();
    const [showDetail, setShowDetail] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [search, setSearch] = useState('');
    
    // Filtro de tabla: 'day', 'week', 'month'
    const [filterType, setFilterType] = useState('day');
    const [referenceDate, setReferenceDate] = useState(new Date());

    const [editForm, setEditForm] = useState({
        nombre: '', especialidad: '', rut: '', telefono: '', email: '', password: '', newPassword: '', confirmPassword: '',
    });

    const navigateDate = (direction) => {
        const newDate = new Date(referenceDate);
        if (filterType === 'day') {
            newDate.setDate(newDate.getDate() + direction);
        } else if (filterType === 'week') {
            newDate.setDate(newDate.getDate() + direction * 7);
        } else if (filterType === 'month') {
            newDate.setMonth(newDate.getMonth() + direction);
        }
        setReferenceDate(newDate);
    };

    const getStartOfWeek = (d) => {
        const start = new Date(d);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0,0,0,0);
        return start;
    };

    const getEndOfWeek = (d) => {
        const end = getStartOfWeek(d);
        end.setDate(end.getDate() + 6);
        end.setHours(23,59,59,999);
        return end;
    };

    const isInRange = (dateStr) => {
        if (!dateStr) return false;
        const itemDate = new Date(dateStr + 'T12:00:00'); // Evitar timezone shift
        
        if (filterType === 'day') {
            return dateStr === referenceDate.toISOString().split('T')[0];
        } else if (filterType === 'week') {
            const start = getStartOfWeek(referenceDate);
            const end = getEndOfWeek(referenceDate);
            return itemDate >= start && itemDate <= end;
        } else if (filterType === 'month') {
            return itemDate.getMonth() === referenceDate.getMonth() && itemDate.getFullYear() === referenceDate.getFullYear();
        }
        return false;
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter((a) => {
            if (!isInRange(a.fecha)) return false;
            
            let passesRole = false;
            if (currentUser.role === 'doctor' || currentUser.role === 'admin') {
                passesRole = a.doctorId === currentUser.id;
            } else if (currentUser.role === 'secretaria') {
                passesRole = a.creadaPor === currentUser.id;
            }
            if (!passesRole) return false;

            return a.pacienteNombre.toLowerCase().includes(search.toLowerCase());
        });
    }, [appointments, currentUser, referenceDate, filterType, search]);

    const getDateLabel = () => {
        if (filterType === 'day') {
            if (referenceDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]) return 'hoy';
            return referenceDate.toLocaleDateString('es-CL');
        } else if (filterType === 'week') {
            const start = getStartOfWeek(referenceDate);
            const end = getEndOfWeek(referenceDate);
            return `del ${start.toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })} al ${end.toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })}`;
        } else {
            return referenceDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
        }
    };

    const getInitials = (name) => name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';
    const getRoleLabel = (role) => ({ admin: 'Administrador', doctor: 'Doctor', secretaria: 'Secretaria' }[role] || role);

    const openEdit = () => {
        setEditForm({
            nombre: currentUser.nombre,
            especialidad: currentUser.especialidad || '',
            rut: currentUser.rut,
            telefono: currentUser.telefono,
            email: currentUser.email,
            password: '', newPassword: '', confirmPassword: '',
        });
        setShowEdit(true);
    };

    const handleSaveEdit = () => {
        updateUser(currentUser.id, {
            nombre: editForm.nombre, especialidad: editForm.especialidad,
            telefono: editForm.telefono, email: editForm.email,
        });
        setShowEdit(false);
    };

    const tableColumns = [
        { key: 'paciente', label: 'Paciente' },
        { key: 'hora', label: 'Hora' },
        { key: 'procedimiento', label: 'Procedimiento' },
        { key: 'estado', label: 'Estado' },
    ];

    return (
        <div className="perfil-page">
            <div className="perfil-header">
                <h1>Perfil</h1>
                <p className="text-secondary">Tu información profesional</p>
            </div>

            <Card className="perfil-card">
                <div className="perfil-card-content">
                    <div className="perfil-avatar-section">
                        <div className="perfil-avatar-large">
                            {getInitials(currentUser.nombre)}
                        </div>
                    </div>
                    <div className="perfil-info-section">
                        <h2>{currentUser.nombre}</h2>
                        <p className="text-secondary">{currentUser.especialidad || getRoleLabel(currentUser.role)}</p>
                        <Badge text={getRoleLabel(currentUser.role)} variant="primary" />
                        <div className="perfil-contact-row">
                            <span><Mail size={14} /> {currentUser.email}</span>
                            <span><Phone size={14} /> {currentUser.telefono}</span>
                        </div>
                    </div>
                    <div className="perfil-actions">
                        <Button variant="outline-primary" icon={Eye} onClick={() => setShowDetail(true)}>Ver detalle</Button>
                        <Button icon={Edit} onClick={openEdit}>Editar</Button>
                    </div>
                </div>
            </Card>

            <div className="perfil-table-section">
                <div className="perfil-table-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <h3>Tabla de Atenciones</h3>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <select 
                                    className="input-select input-field" 
                                    style={{ height: '32px', padding: '0 32px 0 12px', fontSize: '13px', width: 'auto' }}
                                    value={filterType}
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                        setReferenceDate(new Date());
                                    }}
                                >
                                    <option value="day">Día</option>
                                    <option value="week">Semana</option>
                                    <option value="month">Mes</option>
                                </select>
                                <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                    <button onClick={() => navigateDate(-1)} style={{ padding: '6px 8px', background: 'var(--color-bg-alt)', border: 'none', cursor: 'pointer', borderRight: '1px solid var(--color-border)', display: 'flex', alignItems: 'center' }}><ChevronLeft size={16} /></button>
                                    <button onClick={() => setReferenceDate(new Date())} style={{ padding: '6px 12px', background: 'var(--color-bg-alt)', border: 'none', cursor: 'pointer', fontSize: '13px', borderRight: '1px solid var(--color-border)' }}>Actual</button>
                                    <button onClick={() => navigateDate(1)} style={{ padding: '6px 8px', background: 'var(--color-bg-alt)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>

                        <p className="text-secondary text-sm" style={{ marginTop: '0.25rem' }}>
                            {currentUser.role === 'secretaria' ? `Citas que agendaste ${getDateLabel()}` : `Tus citas ${getDateLabel() === 'hoy' ? 'para hoy' : getDateLabel()}`}
                        </p>
                    </div>
                    <SearchBar value={search} onChange={setSearch} placeholder="Buscar paciente..." />
                </div>
                <Table
                    columns={tableColumns}
                    data={filteredAppointments}
                    emptyMessage={`No hay citas ${getDateLabel() === 'hoy' ? 'para hoy' : getDateLabel()}`}
                    renderRow={(appt) => {
                        const variantMap = {
                            Activo: 'success',
                            Atendido: 'info',
                            Confirmada: 'info',
                            Pendiente: 'warning',
                            Finalizado: 'neutral',
                            Cancelada: 'danger',
                        };

                        return (
                            <tr key={appt.id}>
                                <td>
                                    <div className="table-cell-name">
                                        <div className="table-avatar">{getInitials(appt.pacienteNombre)}</div>
                                        <div>
                                            <div className="font-medium">{appt.pacienteNombre}</div>
                                            <div className="text-sm text-muted">{appt.pacienteRut}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{appt.hora}</td>
                                <td>{appt.procedimiento || 'Consulta General'}</td>
                                <td>
                                    <select
                                        value={appt.estado}
                                        onChange={(e) => updateAppointment(appt.id, { estado: e.target.value })}
                                        className={`badge badge--${variantMap[appt.estado] || 'neutral'} badge--md input-select`}
                                        style={{ 
                                            cursor: 'pointer', 
                                            border: 'none', 
                                            paddingRight: '22px', // Espacio para el icono de chevron
                                            backgroundPosition: 'right 6px center',
                                            height: 'auto',
                                            display: 'inline-flex'
                                        }}
                                        title="Cambiar estado"
                                    >
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Confirmada">Confirmada</option>
                                        <option value="Atendido">Atendido</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                </td>
                            </tr>
                        );
                    }}
                    footer={`Mostrando ${filteredAppointments.length} atenciones`}
                />
            </div>

            {/* Detail Modal */}
            <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Detalle del Perfil" subtitle="Información completa del profesional" size="lg">
                <div className="perfil-detail-grid">
                    <div className="perfil-detail-item">
                        <span className="perfil-detail-label">NOMBRE COMPLETO</span>
                        <span className="perfil-detail-value">{currentUser.nombre}</span>
                    </div>
                    <div className="perfil-detail-item">
                        <span className="perfil-detail-label">ESPECIALIDAD</span>
                        <span className="perfil-detail-value">{currentUser.especialidad || 'No aplica'}</span>
                    </div>
                    <div className="perfil-detail-item">
                        <span className="perfil-detail-label">RUT</span>
                        <span className="perfil-detail-value">{currentUser.rut}</span>
                    </div>
                    <div className="perfil-detail-item">
                        <span className="perfil-detail-label">ROL</span>
                        <span className="perfil-detail-value">{getRoleLabel(currentUser.role)}</span>
                    </div>
                    <div className="perfil-detail-item">
                        <span className="perfil-detail-label">CORREO ELECTRÓNICO</span>
                        <span className="perfil-detail-value">{currentUser.email}</span>
                    </div>
                    <div className="perfil-detail-item">
                        <span className="perfil-detail-label">TELÉFONO</span>
                        <span className="perfil-detail-value">{currentUser.telefono}</span>
                    </div>
                    <div className="perfil-detail-item">
                        <span className="perfil-detail-label">NOMBRE DE USUARIO</span>
                        <span className="perfil-detail-value">{currentUser.username}</span>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Editar Perfil" subtitle="Actualice la información profesional y de contacto." size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancelar</Button>
                        <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
                    </>
                }
            >
                <div className="perfil-edit-form">
                    <Input label="Nombre completo" value={editForm.nombre} onChange={(e) => setEditForm(f => ({ ...f, nombre: e.target.value }))} />
                    {currentUser.role !== 'secretaria' && (
                        <Input label="Especialidad" value={editForm.especialidad} onChange={(e) => setEditForm(f => ({ ...f, especialidad: e.target.value }))} />
                    )}
                    <div className="perfil-edit-row">
                        <Input label="RUT" value={editForm.rut} disabled />
                        <Input label="Teléfono de contacto" value={editForm.telefono} onChange={(e) => setEditForm(f => ({ ...f, telefono: e.target.value }))} />
                    </div>
                    <Input label="Correo electrónico" type="email" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />

                    <div className="perfil-edit-divider">
                        <Shield size={16} />
                        <span>Seguridad</span>
                    </div>
                    <Input label="Contraseña actual" type="password" value={editForm.password} onChange={(e) => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
                    <div className="perfil-edit-row">
                        <Input label="Nueva contraseña" type="password" value={editForm.newPassword} onChange={(e) => setEditForm(f => ({ ...f, newPassword: e.target.value }))} />
                        <Input label="Confirmar contraseña" type="password" value={editForm.confirmPassword} onChange={(e) => setEditForm(f => ({ ...f, confirmPassword: e.target.value }))} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
