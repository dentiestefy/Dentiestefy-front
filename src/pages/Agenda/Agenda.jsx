import { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Shared/Button';
import AppointmentModal from './AppointmentModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import './Agenda.css';

// Slots de media hora: 08:00 → 20:00
const TIME_SLOTS = [];
for (let h = 8; h <= 20; h++) {
    TIME_SLOTS.push({ hour: h, minute: 0, label: `${String(h).padStart(2, '0')}:00` });
    if (h < 20) TIME_SLOTS.push({ hour: h, minute: 30, label: `${String(h).padStart(2, '0')}:30` });
}

const DAYS_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getWeekDates(baseDate) {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 6 }, (_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return date;
    });
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

export default function Agenda() {
    const { currentUser, canManageAppointments, canChooseDoctor } = useAuth();
    const { appointments, addAppointment, updateAppointment, deleteAppointment, users } = useApp();
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [modalState, setModalState] = useState({ open: false, mode: 'create', appointment: null, prefill: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, appointment: null });

    const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);

    const weekAppointments = useMemo(() => {
        const dateStrings = weekDates.map(formatDate);
        return appointments.filter((appt) => {
            if (currentUser.role === 'doctor' && appt.doctorId !== currentUser.id) return false;
            return dateStrings.includes(appt.fecha);
        });
    }, [appointments, weekDates, currentUser]);

    // Devuelve citas cuya hora cae dentro del slot de 30 min
    const getAppointmentsForSlot = (date, slot) => {
        const dateStr = formatDate(date);
        return weekAppointments.filter((a) => {
            if (a.fecha !== dateStr) return false;
            const [apptHour, apptMin] = a.hora.split(':').map(Number);
            return apptHour === slot.hour && apptMin >= slot.minute && apptMin < slot.minute + 30;
        });
    };

    const navigateWeek = (direction) => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + direction * 7);
        setCurrentWeek(newDate);
    };

    const goToToday = () => setCurrentWeek(new Date());

    const handleCellClick = (date, slot) => {
        if (!canManageAppointments) return;
        setModalState({
            open: true,
            mode: 'create',
            appointment: null,
            prefill: { fecha: formatDate(date), hora: slot.label },
        });
    };

    const handleCreateAppointment = (data) => {
        const doctor = users.find((u) => u.id === data.doctorId);
        addAppointment({
            ...data,
            doctorNombre: doctor?.nombre || '',
            estado: 'Pendiente',
            monto: null,
            creadaPor: currentUser.id,
        });
        setModalState({ open: false, mode: 'create', appointment: null, prefill: null });
    };

    const handleUpdateAppointment = (id, data) => {
        const doctor = users.find((u) => u.id === data.doctorId);
        updateAppointment(id, { ...data, doctorNombre: doctor?.nombre || '' });
        setModalState({ open: false, mode: 'create', appointment: null, prefill: null });
    };

    const handleDeleteAppointment = (id) => {
        deleteAppointment(id);
        setDeleteModal({ open: false, appointment: null });
    };

    const getWeekLabel = () => {
        const start = weekDates[0];
        const end = weekDates[5];
        const startMonth = start.toLocaleDateString('es-CL', { month: 'long' });
        const endMonth = end.toLocaleDateString('es-CL', { month: 'long' });
        const year = start.getFullYear();
        if (startMonth === endMonth) {
            return `${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} ${year}`;
        }
        return `${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} - ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)} ${year}`;
    };

    const isToday = (date) => formatDate(date) === formatDate(new Date());

    return (
        <div className="agenda-page">
            <div className="agenda-header">
                <div>
                    <h1>Calendario Semanal</h1>
                    <p className="text-secondary">Gestiona las citas de la clínica</p>
                </div>
                {canManageAppointments && (
                    <Button
                        icon={Plus}
                        onClick={() => setModalState({ open: true, mode: 'create', appointment: null, prefill: null })}
                    >
                        Nueva Cita
                    </Button>
                )}
            </div>

            <div className="agenda-toolbar">
                <div className="agenda-nav">
                    <button className="agenda-nav-btn" onClick={() => navigateWeek(-1)}>
                        <ChevronLeft size={18} />
                    </button>
                    <span className="agenda-week-label">{getWeekLabel()}</span>
                    <button className="agenda-nav-btn" onClick={() => navigateWeek(1)}>
                        <ChevronRight size={18} />
                    </button>
                </div>
                <Button variant="secondary" size="sm" onClick={goToToday}>
                    Hoy
                </Button>
            </div>

            <div className="agenda-calendar">
                <div className="calendar-header">
                    <div className="calendar-time-gutter" />
                    {weekDates.map((date, i) => (
                        <div key={i} className={`calendar-day-header ${isToday(date) ? 'calendar-day-header--today' : ''}`}>
                            <span className="calendar-day-name">{DAYS_LABELS[i]}</span>
                            <span className={`calendar-day-number ${isToday(date) ? 'calendar-day-number--today' : ''}`}>
                                {date.getDate()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="calendar-body">
                    {TIME_SLOTS.map((slot) => (
                        <div
                            key={slot.label}
                            className={`calendar-row ${slot.minute === 30 ? 'calendar-row--half' : ''}`}
                        >
                            <div className="calendar-time-gutter">
                                <span className="calendar-time">{slot.label}</span>
                            </div>

                            {weekDates.map((date, dayIdx) => {
                                const slotAppts = getAppointmentsForSlot(date, slot);

                                // Agrupar por doctorId
                                const byDoctor = {};
                                slotAppts.forEach((appt) => {
                                    if (!byDoctor[appt.doctorId]) byDoctor[appt.doctorId] = [];
                                    byDoctor[appt.doctorId].push(appt);
                                });
                                const doctorGroups = Object.values(byDoctor);
                                const multiDoctor = doctorGroups.length > 1;

                                return (
                                    <div
                                        key={dayIdx}
                                        className={`calendar-cell ${isToday(date) ? 'calendar-cell--today' : ''} ${canManageAppointments ? 'calendar-cell--clickable' : ''}`}
                                        onClick={() => handleCellClick(date, slot)}
                                    >
                                        <div className={`calendar-cell-events ${multiDoctor ? 'calendar-cell-events--row' : ''}`}>
                                            {doctorGroups.map((appts, groupIdx) => (
                                                <div
                                                    key={groupIdx}
                                                    className={`calendar-doctor-col ${multiDoctor ? 'calendar-doctor-col--shared' : ''}`}
                                                >
                                                    {appts.map((appt) => (
                                                        <button
                                                            key={appt.id}
                                                            className={`calendar-event calendar-event--${appt.estado.toLowerCase()} ${multiDoctor ? 'calendar-event--compact' : ''}`}
                                                            title={`🕐 ${appt.hora}  ·  ${appt.estado}\n👨‍⚕️ ${appt.doctorNombre}\n👤 ${appt.pacienteNombre}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setModalState({ open: true, mode: 'view', appointment: appt, prefill: null });
                                                            }}
                                                        >
                                                            <span className="calendar-event-time">{appt.hora}</span>
                                                            <span className="calendar-event-name">
                                                                {appt.pacienteNombre.split(' ').slice(0, 2).join(' ')}
                                                            </span>
                                                            {!multiDoctor && (
                                                                <span className="calendar-event-doctor">{appt.doctorNombre}</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <AppointmentModal
                isOpen={modalState.open}
                mode={modalState.mode}
                appointment={modalState.appointment}
                prefill={modalState.prefill}
                onClose={() => setModalState({ open: false, mode: 'create', appointment: null, prefill: null })}
                onCreate={handleCreateAppointment}
                onUpdate={handleUpdateAppointment}
                onDelete={(appt) => {
                    setModalState({ open: false, mode: 'create', appointment: null, prefill: null });
                    setDeleteModal({ open: true, appointment: appt });
                }}
                onEdit={() => setModalState((s) => ({ ...s, mode: 'edit' }))}
                canManage={canManageAppointments}
                canChooseDoctor={canChooseDoctor}
            />

            <DeleteConfirmModal
                isOpen={deleteModal.open}
                appointment={deleteModal.appointment}
                onClose={() => setDeleteModal({ open: false, appointment: null })}
                onConfirm={() => handleDeleteAppointment(deleteModal.appointment?.id)}
            />
        </div>
    );
}
