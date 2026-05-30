import { useState, useMemo, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Shared/Button';
import AppointmentModal from './AppointmentModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import AppointmentBubble from './AppointmentBubble';
import './Agenda.css';

// Slots de media hora: 08:00 → 20:00
const TIME_SLOTS = [];
for (let h = 8; h <= 20; h++) {
    TIME_SLOTS.push({ hour: h, minute: 0, label: `${String(h).padStart(2, '0')}:00` });
    if (h < 20) TIME_SLOTS.push({ hour: h, minute: 30, label: `${String(h).padStart(2, '0')}:30` });
}

const DAYS_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

import { getChileDateString, getChileWeekDates } from '../../utils/dateUtils';

export default function Agenda() {
    const { currentUser, canManageAppointments, canChooseDoctor } = useAuth();
    const { appointments, addAppointment, updateAppointment, deleteAppointment, users } = useApp();
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [modalState, setModalState] = useState({ open: false, mode: 'create', appointment: null, prefill: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, appointment: null });
    const [hovered, setHovered] = useState(null); // { id, rect }
    const hoverTimer = useRef(null);

    // Retardo antes de mostrar la viñeta al pasar el mouse (en ms)
    const HOVER_OPEN_DELAY = 200;
    // Retardo al salir, para poder cruzar el hueco entre cita y viñeta (en ms)
    const HOVER_CLOSE_DELAY = 100;

    // Muestra la viñeta tras un breve retardo; cancela cualquier cierre pendiente
    const showBubble = (id, el) => {
        if (hoverTimer.current) {
            clearTimeout(hoverTimer.current);
            hoverTimer.current = null;
        }
        const rect = el ? el.getBoundingClientRect() : null;
        // Si la viñeta ya está abierta (te mueves entre cita y viñeta), no reaplicar retardo
        if (hovered && hovered.id === id) {
            setHovered((prev) => (rect ? { id, rect } : prev));
            return;
        }
        hoverTimer.current = setTimeout(() => {
            setHovered({ id, rect });
            hoverTimer.current = null;
        }, HOVER_OPEN_DELAY);
    };

    // Cierra con un retardo corto para poder cruzar el hueco hacia la viñeta
    const hideBubble = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => {
            setHovered(null);
            hoverTimer.current = null;
        }, HOVER_CLOSE_DELAY);
    };

    // Cierra de inmediato (para el click en la cita), sin retardo
    const closeBubbleNow = () => {
        if (hoverTimer.current) {
            clearTimeout(hoverTimer.current);
            hoverTimer.current = null;
        }
        setHovered(null);
    };

    const handleSaveComment = async (id, comentario) => {
        await updateAppointment(id, { comentario });
    };

    const handleChangeStatus = async (id, estado) => {
        await updateAppointment(id, { estado });
    };

    const weekDates = useMemo(() => getChileWeekDates(currentWeek), [currentWeek]);

    const weekAppointments = useMemo(() => {
        return appointments.filter((appt) => {
            if (currentUser.role === 'doctor' && appt.doctorId !== currentUser.id) return false;
            return weekDates.includes(appt.fecha);
        });
    }, [appointments, weekDates, currentUser]);

    // Devuelve citas cuya hora cae dentro del slot de 30 min
    const getAppointmentsForSlot = (dateStr, slot) => {
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

    const handleCellClick = (dateStr, slot) => {
        if (!canManageAppointments) return;
        setModalState({
            open: true,
            mode: 'create',
            appointment: null,
            prefill: { fecha: dateStr, hora: slot.label },
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
        const startD = new Date(`${start}T12:00:00Z`);
        const endD = new Date(`${end}T12:00:00Z`);
        const formatter = new Intl.DateTimeFormat('es-CL', { month: 'long', timeZone: 'UTC' });
        const startMonth = formatter.format(startD);
        const endMonth = formatter.format(endD);
        const year = startD.getUTCFullYear();
        if (startMonth === endMonth) {
            return `${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} ${year}`;
        }
        return `${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} - ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)} ${year}`;
    };

    const isToday = (dateStr) => dateStr === getChileDateString(new Date());

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
                    {weekDates.map((dateStr, i) => (
                        <div key={i} className={`calendar-day-header ${isToday(dateStr) ? 'calendar-day-header--today' : ''}`}>
                            <span className="calendar-day-name">{DAYS_LABELS[i]}</span>
                            <span className={`calendar-day-number ${isToday(dateStr) ? 'calendar-day-number--today' : ''}`}>
                                {parseInt(dateStr.split('-')[2], 10)}
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

                            {weekDates.map((dateStr, dayIdx) => {
                                const slotAppts = getAppointmentsForSlot(dateStr, slot);

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
                                        className={`calendar-cell ${isToday(dateStr) ? 'calendar-cell--today' : ''} ${canManageAppointments ? 'calendar-cell--clickable' : ''}`}
                                        onClick={() => handleCellClick(dateStr, slot)}
                                    >
                                        <div className={`calendar-cell-events ${multiDoctor ? 'calendar-cell-events--row' : ''}`}>
                                            {doctorGroups.map((appts, groupIdx) => (
                                                <div
                                                    key={groupIdx}
                                                    className={`calendar-doctor-col ${multiDoctor ? 'calendar-doctor-col--shared' : ''}`}
                                                >
                                                    {appts.map((appt) => (
                                                        <div
                                                            key={appt.id}
                                                            className="calendar-event-wrap"
                                                            onMouseEnter={(e) => showBubble(appt.id, e.currentTarget)}
                                                            onMouseLeave={hideBubble}
                                                        >
                                                            <button
                                                                className={`calendar-event calendar-event--${appt.estado.toLowerCase().replace(/\s+/g, '-')} ${multiDoctor ? 'calendar-event--compact' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    closeBubbleNow();
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
                                                            {hovered?.id === appt.id && (
                                                                <AppointmentBubble
                                                                    appt={appt}
                                                                    anchorRect={hovered.rect}
                                                                    canManage={canManageAppointments}
                                                                    onSaveComment={handleSaveComment}
                                                                    onChangeStatus={handleChangeStatus}
                                                                    onEnter={() => showBubble(appt.id)}
                                                                    onLeave={hideBubble}
                                                                />
                                                            )}
                                                        </div>
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
                appointment={
                    // Usar la versión fresca del estado global para que los cambios
                    // (p.ej. estado) se reflejen en el modal en tiempo real
                    modalState.appointment
                        ? appointments.find((a) => a.id === modalState.appointment.id) || modalState.appointment
                        : null
                }
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
