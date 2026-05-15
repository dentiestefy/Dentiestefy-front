import { useState, useMemo } from 'react';
import { DollarSign, Users, TrendingUp, Calendar, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Card from '../../components/Shared/Card';
import Table from '../../components/Shared/Table';
import Badge from '../../components/Shared/Badge';
import Button from '../../components/Shared/Button';
import Modal from '../../components/Shared/Modal';
import Input from '../../components/Shared/Input';
import './Contabilidad.css';

export default function Contabilidad() {
    const { currentUser, isAdmin } = useAuth();
    const { appointments, updateAppointmentMonto } = useApp();
    const [periodType, setPeriodType] = useState('month');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7));
    const [montoModal, setMontoModal] = useState({ open: false, appointment: null, monto: '' });

    const filteredAppointments = useMemo(() => {
        return appointments
            .filter((a) => {
                if (!isAdmin && a.doctorId !== currentUser.id) return false;
                if (a.estado !== 'Atendido') return false;

                if (periodType === 'month') {
                    return a.fecha.startsWith(selectedDate);
                } else {
                    const d = new Date(selectedDate + '-01');
                    const weekStart = new Date(d);
                    weekStart.setDate(d.getDate() - d.getDay() + 1);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    const apptDate = new Date(a.fecha);
                    return apptDate >= weekStart && apptDate <= weekEnd;
                }
            })
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }, [appointments, currentUser, isAdmin, periodType, selectedDate]);

    const kpis = useMemo(() => {
        const totalAtenciones = filteredAppointments.length;
        const totalIngresos = filteredAppointments.reduce((sum, a) => sum + (a.monto || 0), 0);
        const pacientesUnicos = new Set(filteredAppointments.map((a) => a.pacienteId)).size;
        const promedioMonto = totalAtenciones > 0 ? Math.round(totalIngresos / totalAtenciones) : 0;
        return { totalAtenciones, totalIngresos, pacientesUnicos, promedioMonto };
    }, [filteredAppointments]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getInitials = (name) => name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';

    const openMontoModal = (appt) => {
        setMontoModal({ open: true, appointment: appt, monto: appt.monto?.toString() || '' });
    };

    const saveMonto = () => {
        if (montoModal.appointment) {
            updateAppointmentMonto(montoModal.appointment.id, parseInt(montoModal.monto) || 0);
        }
        setMontoModal({ open: false, appointment: null, monto: '' });
    };

    const kpiCards = [
        { icon: Users, label: 'Total Atenciones', value: kpis.totalAtenciones, color: '--color-primary' },
        { icon: DollarSign, label: 'Total Ingresos', value: formatCurrency(kpis.totalIngresos), color: '--color-success' },
        { icon: Users, label: 'Pacientes Únicos', value: kpis.pacientesUnicos, color: '--color-info' },
        { icon: TrendingUp, label: 'Promedio por Atención', value: formatCurrency(kpis.promedioMonto), color: '--color-warning' },
    ];

    const columns = [
        { key: 'fecha', label: 'Fecha' },
        { key: 'paciente', label: 'Paciente' },
        { key: 'procedimiento', label: 'Procedimiento' },
        { key: 'monto', label: 'Monto' },
        { key: 'acciones', label: 'Acciones', width: '100px' },
    ];

    return (
        <div className="contabilidad-page">
            <div className="contabilidad-header">
                <div>
                    <h1>Contabilidad</h1>
                    <p className="text-secondary">Resumen financiero de atenciones</p>
                </div>
            </div>

            {/* Period Selector */}
            <div className="period-selector">
                <div className="period-tabs">
                    <button
                        className={`period-tab ${periodType === 'month' ? 'period-tab--active' : ''}`}
                        onClick={() => setPeriodType('month')}
                    >
                        <Calendar size={14} /> Mensual
                    </button>
                    <button
                        className={`period-tab ${periodType === 'week' ? 'period-tab--active' : ''}`}
                        onClick={() => setPeriodType('week')}
                    >
                        <Calendar size={14} /> Semanal
                    </button>
                </div>
                <input
                    type="month"
                    className="period-date-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                {kpiCards.map((kpi, i) => (
                    <Card key={i} className="kpi-card">
                        <div className="kpi-icon" style={{ background: `var(${kpi.color})15`, color: `var(${kpi.color})` }}>
                            <kpi.icon size={22} />
                        </div>
                        <div className="kpi-info">
                            <span className="kpi-label">{kpi.label}</span>
                            <span className="kpi-value">{kpi.value}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={filteredAppointments}
                emptyMessage="No hay atenciones en el período seleccionado"
                renderRow={(appt) => (
                    <tr key={appt.id}>
                        <td>{formatDate(appt.fecha)}</td>
                        <td>
                            <div className="table-cell-name">
                                <div className="table-avatar">{getInitials(appt.pacienteNombre)}</div>
                                <div>
                                    <div className="font-medium">{appt.pacienteNombre}</div>
                                    <div className="text-sm text-muted">{appt.pacienteRut}</div>
                                </div>
                            </div>
                        </td>
                        <td>{appt.procedimiento || 'Consulta General'}</td>
                        <td>
                            {appt.monto != null ? (
                                <span className="font-medium">{formatCurrency(appt.monto)}</span>
                            ) : (
                                <span className="text-muted">Sin asignar</span>
                            )}
                        </td>
                        <td>
                            <Button variant="ghost" size="sm" icon={Edit} onClick={() => openMontoModal(appt)} />
                        </td>
                    </tr>
                )}
                footer={`${filteredAppointments.length} atenciones · Total: ${formatCurrency(kpis.totalIngresos)}`}
            />

            {/* Monto Modal */}
            <Modal
                isOpen={montoModal.open}
                onClose={() => setMontoModal({ open: false, appointment: null, monto: '' })}
                title="Asignar Monto"
                subtitle="Registre el monto de la atención"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setMontoModal({ open: false, appointment: null, monto: '' })}>
                            Cancelar
                        </Button>
                        <Button onClick={saveMonto}>Guardar</Button>
                    </>
                }
            >
                {montoModal.appointment && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div style={{ padding: 'var(--space-4)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                            <div className="text-sm text-muted">PACIENTE</div>
                            <div className="font-medium">{montoModal.appointment.pacienteNombre}</div>
                            <div className="text-sm text-muted" style={{ marginTop: '8px' }}>FECHA</div>
                            <div className="font-medium">{formatDate(montoModal.appointment.fecha)}</div>
                        </div>
                        <Input
                            label="Monto"
                            type="number"
                            placeholder="Ej. 45000"
                            icon={DollarSign}
                            value={montoModal.monto}
                            onChange={(e) => setMontoModal(m => ({ ...m, monto: e.target.value }))}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
}
