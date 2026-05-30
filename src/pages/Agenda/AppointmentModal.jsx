import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, CircleDot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Shared/Modal';
import Input from '../../components/Shared/Input';
import Button from '../../components/Shared/Button';
import Badge from '../../components/Shared/Badge';
import StatusSelect from '../../components/Shared/StatusSelect';
import DatePicker from '../../components/Shared/DatePicker';
import TimePicker from '../../components/Shared/TimePicker';
import { formatRut } from '../../utils/rut';

export default function AppointmentModal({ isOpen, mode, appointment, prefill, onClose, onCreate, onUpdate, onDelete, onEdit, canManage, canChooseDoctor }) {
    const { currentUser } = useAuth();
    const { users, updateAppointment } = useApp();
    const doctors = users.filter((u) => u.role === 'doctor' || u.role === 'admin');

    const [form, setForm] = useState({
        pacienteNombre: '',
        pacienteRut: '',
        pacienteEdad: '',
        doctorId: '',
        fecha: '',
        hora: '',
        descripcion: '',
    });
    const [showAgeDropdown, setShowAgeDropdown] = useState(false);

    useEffect(() => {
        if (appointment && (mode === 'edit' || mode === 'view')) {
            setForm({
                pacienteNombre: appointment.pacienteNombre || '',
                pacienteRut: appointment.pacienteRut || '',
                pacienteEdad: appointment.pacienteEdad || '',
                doctorId: appointment.doctorId || '',
                fecha: appointment.fecha || '',
                hora: appointment.hora || '',
                descripcion: appointment.descripcion || '',
            });
        } else if (mode === 'create') {
            setForm({
                pacienteNombre: '',
                pacienteRut: '',
                pacienteEdad: '',
                // Si es doctor, pre-asignar a sí mismo; si no, al primer doctor de la lista
                doctorId: canChooseDoctor ? (doctors[0]?.id || '') : (currentUser?.id || ''),
                // Usar prefill si viene de click en celda
                fecha: prefill?.fecha || new Date().toISOString().split('T')[0],
                hora: prefill?.hora || '09:00',
                descripcion: '',
            });
        }
    }, [appointment, mode, isOpen]);

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    // Formatea el RUT mientras se escribe
    const handleRutChange = (e) => {
        const formatted = formatRut(e.target.value);
        setForm((prev) => ({ ...prev, pacienteRut: formatted }));
    };

    const handleSubmit = () => {
        if (mode === 'create') {
            onCreate(form);
        } else if (mode === 'edit') {
            onUpdate(appointment.id, form);
        }
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // ── Vista de detalle ─────────────────────────────────────────
    if (mode === 'view' && appointment) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Detalle de Cita" subtitle="Información de la cita agendada" size="md">
                <div className="appt-detail">
                    <div className="appt-detail-item">
                        <User size={16} className="text-primary" />
                        <div>
                            <span className="appt-detail-label">PACIENTE</span>
                            <span className="appt-detail-value">{appointment.pacienteNombre}</span>
                        </div>
                    </div>

                    <div className="appt-detail-grid">
                        <div className="appt-detail-item">
                            <Calendar size={16} className="text-primary" />
                            <div>
                                <span className="appt-detail-label">FECHA</span>
                                <span className="appt-detail-value">{formatDateDisplay(appointment.fecha)}</span>
                            </div>
                        </div>
                        <div className="appt-detail-item">
                            <Clock size={16} className="text-primary" />
                            <div>
                                <span className="appt-detail-label">HORA</span>
                                <span className="appt-detail-value">{appointment.hora}</span>
                            </div>
                        </div>
                    </div>

                    <div className="appt-detail-item">
                        <Stethoscope size={16} className="text-primary" />
                        <div>
                            <span className="appt-detail-label">DOCTOR</span>
                            <span className="appt-detail-value">{appointment.doctorNombre}</span>
                        </div>
                    </div>

                    <div className="appt-detail-item">
                        <CircleDot size={16} className="text-primary" />
                        <div>
                            <span className="appt-detail-label">ESTADO</span>
                            <div className="appt-detail-status">
                                <StatusSelect
                                    value={appointment.estado}
                                    onChange={(estado) => updateAppointment(appointment.id, { estado })}
                                    disabled={!canManage}
                                />
                            </div>
                        </div>
                    </div>

                    {appointment.pacienteRut && (
                        <div className="appt-detail-item">
                            <User size={16} className="text-primary" />
                            <div>
                                <span className="appt-detail-label">RUT</span>
                                <span className="appt-detail-value">{appointment.pacienteRut}</span>
                            </div>
                        </div>
                    )}

                    {appointment.descripcion && (
                        <div className="appt-detail-description">
                            <span className="appt-detail-label">DESCRIPCIÓN / NOTAS CLÍNICAS</span>
                            <p>{appointment.descripcion}</p>
                        </div>
                    )}
                </div>

                {canManage && (
                    <div className="appt-detail-actions">
                        <Button variant="secondary" onClick={() => onEdit()}>
                            Editar
                        </Button>
                        <Button variant="danger" onClick={() => onDelete(appointment)}>
                            Eliminar
                        </Button>
                    </div>
                )}
            </Modal>
        );
    }

    // ── Crear / Editar ───────────────────────────────────────────
    const isEdit = mode === 'edit';
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Editar Cita' : 'Nueva Cita'}
            size="md"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit}>{isEdit ? 'Guardar Cambios' : 'Programar Cita'}</Button>
                </>
            }
        >
            <div className="appt-form">
                <Input
                    label="Nombre del paciente"
                    placeholder="Ej. Juan Pérez"
                    value={form.pacienteNombre}
                    onChange={handleChange('pacienteNombre')}
                    required
                />
                <div className="appt-form-row">
                    <Input
                        label="RUT"
                        placeholder="12.345.678-9"
                        value={form.pacienteRut}
                        onChange={handleRutChange}
                    />
                    <div className="input-group" style={{ position: 'relative' }}>
                        <label className="input-label" htmlFor="edad-input">Edad</label>
                        <div className="input-wrapper">
                            <input
                                id="edad-input"
                                type="text"
                                inputMode="numeric"
                                className="input-field input-select"
                                style={{ cursor: 'text' }}
                                placeholder="00"
                                value={form.pacienteEdad}
                                onChange={handleChange('pacienteEdad')}
                                onFocus={() => setShowAgeDropdown(true)}
                                onBlur={() => setShowAgeDropdown(false)}
                                autoComplete="off"
                            />
                        </div>
                        {showAgeDropdown && (
                            <ul
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    maxHeight: '180px',
                                    overflowY: 'auto',
                                    background: 'var(--color-white)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    zIndex: 10,
                                    boxShadow: 'var(--shadow-md)',
                                    marginTop: '4px',
                                    padding: '4px 0',
                                    listStyle: 'none'
                                }}
                            >
                                {Array.from({ length: 110 }, (_, i) => (i + 1).toString())
                                    .filter(num => !form.pacienteEdad || num.includes(form.pacienteEdad.toString()))
                                    .map((num) => (
                                        <li
                                            key={num}
                                            style={{
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                fontSize: 'var(--font-size-base)',
                                                color: 'var(--color-text-primary)'
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault(); // Evita que el input pierda foco y cierre antes de tiempo
                                                setForm(prev => ({ ...prev, pacienteEdad: num }));
                                                setShowAgeDropdown(false);
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-alt)'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            {num}
                                        </li>
                                    ))
                                }
                                {Array.from({ length: 110 }, (_, i) => (i + 1).toString())
                                    .filter(num => !form.pacienteEdad || num.includes(form.pacienteEdad.toString()))
                                    .length === 0 && (
                                        <li style={{ padding: '8px 12px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
                                            No hay coincidencias
                                        </li>
                                    )
                                }
                            </ul>
                        )}
                    </div>
                </div>
                {canChooseDoctor ? (
                    <Input
                        label="Doctor"
                        type="select"
                        value={form.doctorId}
                        onChange={handleChange('doctorId')}
                        options={[
                            { value: '', label: 'Seleccionar Doctor' },
                            ...doctors.map((d) => ({ value: d.id, label: d.nombre })),
                        ]}
                    />
                ) : (
                    <Input
                        label="Doctor"
                        value={currentUser?.nombre || ''}
                        disabled
                    />
                )}
                <div className="appt-form-row">
                    <DatePicker label="Fecha" value={form.fecha} onChange={handleChange('fecha')} />
                    <TimePicker label="Hora" value={form.hora} onChange={handleChange('hora')} />
                </div>
                <Input
                    label="Descripción"
                    type="textarea"
                    placeholder="Motivo de la consulta..."
                    value={form.descripcion}
                    onChange={handleChange('descripcion')}
                    rows={4}
                />
            </div>
        </Modal>
    );
}
