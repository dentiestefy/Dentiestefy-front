import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import './TimePicker.css';

// Genera slots de 30 min entre startHour y endHour (formato "HH:MM")
const buildSlots = (startHour, endHour) => {
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        if (h < endHour) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
};

const SLOTS = buildSlots(8, 20);

/**
 * Selector de hora personalizado con el estilo del sistema.
 * Trabaja con strings "HH:MM". onChange recibe { target: { value } }.
 */
export default function TimePicker({ label, value, onChange, id, disabled = false }) {
    const [open, setOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const rootRef = useRef(null);
    const listRef = useRef(null);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    // Al abrir, decide si desplegar hacia arriba según el espacio disponible
    const handleToggle = () => {
        if (disabled) return;
        if (!open && rootRef.current) {
            const rect = rootRef.current.getBoundingClientRect();
            const POPOVER_HEIGHT = 240;
            setOpenUp(window.innerHeight - rect.bottom < POPOVER_HEIGHT && rect.top > POPOVER_HEIGHT);
        }
        setOpen((o) => !o);
    };

    useEffect(() => {
        if (!open) return;
        const onDocClick = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    // Al abrir, hace scroll hasta la opción seleccionada
    useEffect(() => {
        if (open && listRef.current) {
            const active = listRef.current.querySelector('.timepicker-option--active');
            if (active) active.scrollIntoView({ block: 'center' });
        }
    }, [open]);

    const emit = (val) => onChange?.({ target: { value: val } });

    const selectSlot = (slot) => {
        emit(slot);
        setOpen(false);
    };

    return (
        <div className="input-group" ref={rootRef} style={{ position: 'relative' }}>
            {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
            <button
                type="button"
                id={inputId}
                className="timepicker-trigger"
                onClick={handleToggle}
                disabled={disabled}
            >
                <span className={value ? '' : 'timepicker-placeholder'}>
                    {value || '--:--'}
                </span>
                <Clock size={16} className="timepicker-trigger-icon" />
            </button>

            {open && (
                <div className={`timepicker-popover ${openUp ? 'timepicker-popover--up' : ''}`} ref={listRef}>
                    {SLOTS.map((slot) => (
                        <button
                            type="button"
                            key={slot}
                            className={`timepicker-option ${slot === value ? 'timepicker-option--active' : ''}`}
                            onClick={() => selectSlot(slot)}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
