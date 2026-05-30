import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import './DatePicker.css';

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Parsea "YYYY-MM-DD" a {y, m, d} sin desfases de zona horaria
const parseStr = (str) => {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    const [y, m, d] = str.split('-').map(Number);
    return { y, m: m - 1, d };
};

const toStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const formatDisplay = (str) => {
    const p = parseStr(str);
    if (!p) return '';
    return `${String(p.d).padStart(2, '0')}/${String(p.m + 1).padStart(2, '0')}/${p.y}`;
};

/**
 * Selector de fecha personalizado (calendario mensual) con el estilo del sistema.
 * Trabaja con strings "YYYY-MM-DD". onChange recibe { target: { value } }.
 */
export default function DatePicker({ label, value, onChange, id, disabled = false }) {
    const [open, setOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const selected = parseStr(value);
    // Mes visible en el calendario (basado en el valor o en una fecha por defecto)
    const [view, setView] = useState(() => selected || { y: 2026, m: 4, d: 1 });
    const rootRef = useRef(null);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    // Al abrir, decide si desplegar hacia arriba según el espacio disponible
    const handleToggle = () => {
        if (disabled) return;
        if (!open && rootRef.current) {
            const rect = rootRef.current.getBoundingClientRect();
            const POPOVER_HEIGHT = 290;
            setOpenUp(window.innerHeight - rect.bottom < POPOVER_HEIGHT && rect.top > POPOVER_HEIGHT);
        }
        setOpen((o) => !o);
    };

    useEffect(() => {
        if (open && selected) setView({ y: selected.y, m: selected.m, d: selected.d });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

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

    const emit = (val) => onChange?.({ target: { value: val } });

    const changeMonth = (delta) => {
        setView((v) => {
            let m = v.m + delta;
            let y = v.y;
            if (m < 0) { m = 11; y -= 1; }
            if (m > 11) { m = 0; y += 1; }
            return { ...v, m, y };
        });
    };

    const selectDay = (d) => {
        emit(toStr(view.y, view.m, d));
        setOpen(false);
    };

    // Construye la grilla: primer día de la semana (lunes=0)
    const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isSelected = (d) =>
        selected && selected.y === view.y && selected.m === view.m && selected.d === d;

    return (
        <div className="input-group" ref={rootRef} style={{ position: 'relative' }}>
            {label && <label className="input-label" htmlFor={inputId}>{label}</label>}
            <button
                type="button"
                id={inputId}
                className="datepicker-trigger"
                onClick={handleToggle}
                disabled={disabled}
            >
                <span className={value ? '' : 'datepicker-placeholder'}>
                    {value ? formatDisplay(value) : 'dd/mm/aaaa'}
                </span>
                <Calendar size={16} className="datepicker-trigger-icon" />
            </button>

            {open && (
                <div className={`datepicker-popover ${openUp ? 'datepicker-popover--up' : ''}`}>
                    <div className="datepicker-head">
                        <button type="button" className="datepicker-nav" onClick={() => changeMonth(-1)}>
                            <ChevronLeft size={16} />
                        </button>
                        <span className="datepicker-title">{MONTHS[view.m]} {view.y}</span>
                        <button type="button" className="datepicker-nav" onClick={() => changeMonth(1)}>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="datepicker-weekdays">
                        {DAY_LABELS.map((d, i) => <span key={i}>{d}</span>)}
                    </div>

                    <div className="datepicker-grid">
                        {cells.map((d, i) => (
                            d === null
                                ? <span key={i} className="datepicker-cell datepicker-cell--empty" />
                                : (
                                    <button
                                        type="button"
                                        key={i}
                                        className={`datepicker-cell ${isSelected(d) ? 'datepicker-cell--selected' : ''}`}
                                        onClick={() => selectDay(d)}
                                    >
                                        {d}
                                    </button>
                                )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
