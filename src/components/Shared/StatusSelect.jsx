import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import './StatusSelect.css';

// Estados de CITA disponibles en todo el sistema (con su variante de color)
export const APPOINTMENT_STATUS_OPTIONS = [
    { value: 'Pendiente', variant: 'pendiente' },
    { value: 'Confirmada', variant: 'confirmada' },
    { value: 'En espera', variant: 'en-espera' },
    { value: 'Atendido', variant: 'atendido' },
    { value: 'Cancelada', variant: 'cancelada' },
];

// Estados de PACIENTE (Activo / De alta)
export const PATIENT_STATUS_OPTIONS = [
    { value: 'Activo', variant: 'activo' },
    { value: 'De alta', variant: 'de-alta' },
];

// Lista plana de valores de cita (compat. con usos previos)
export const APPOINTMENT_STATUSES = APPOINTMENT_STATUS_OPTIONS.map((o) => o.value);

// slug para clases CSS a partir del valor, como respaldo si no hay variant
export const statusSlug = (estado) => (estado || '').toLowerCase().replace(/\s+/g, '-');

/**
 * Selector tipo badge con desplegable propio (sin <select> nativo). El menú se
 * renderiza en un portal con posición fija, por lo que no se recorta dentro de
 * contenedores con overflow (tablas, modales, etc.).
 *
 * Props:
 *  - value: valor actual (string)
 *  - onChange: (nuevoValor) => void
 *  - options: [{ value, variant }] — por defecto, estados de CITA
 *  - size: 'sm' | 'md' (default 'md')
 *  - disabled: si true, se muestra como badge estático no editable
 *  - stopPropagation: evita que el click burbujee (útil dentro de la viñeta)
 *  - onOpenChange: (bool) => void, notifica cuando el menú abre/cierra
 */
export default function StatusSelect({
    value,
    onChange,
    options = APPOINTMENT_STATUS_OPTIONS,
    size = 'md',
    disabled = false,
    stopPropagation = false,
    onOpenChange,
}) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(null);
    const rootRef = useRef(null);
    const menuRef = useRef(null);
    const stop = (e) => { if (stopPropagation) e.stopPropagation(); };

    const MENU_WIDTH = 170;
    const MENU_HEIGHT = Math.max(120, options.length * 40 + 16);

    const variantOf = (val) => {
        const opt = options.find((o) => o.value === val);
        return opt ? opt.variant : statusSlug(val);
    };
    const slug = variantOf(value);

    useEffect(() => {
        if (onOpenChange) onOpenChange(open);
    }, [open, onOpenChange]);

    useLayoutEffect(() => {
        if (!open || !rootRef.current) return;
        const rect = rootRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const openUp = vh - rect.bottom < MENU_HEIGHT && rect.top > vh - rect.bottom;
        let left = rect.left;
        if (left + MENU_WIDTH > vw - 8) left = vw - MENU_WIDTH - 8;
        left = Math.max(8, left);
        const top = openUp ? rect.top - 6 : rect.bottom + 6;
        setPos({ top, left, openUp });
    }, [open, MENU_HEIGHT]);

    useEffect(() => {
        if (!open) return;
        const onDocClick = (e) => {
            if (
                rootRef.current && !rootRef.current.contains(e.target) &&
                menuRef.current && !menuRef.current.contains(e.target)
            ) setOpen(false);
        };
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    if (disabled) {
        return (
            <span className={`status-select status-select--${size} status-select--${slug} status-select--static`}>
                {value}
            </span>
        );
    }

    const handleSelect = (e, val) => {
        stop(e);
        setOpen(false);
        if (val !== value) onChange(val);
    };

    const menu = open && (
        <div
            ref={menuRef}
            className={`status-menu ${size === 'sm' ? 'status-menu--sm' : ''} ${pos?.openUp ? 'status-menu--up' : ''}`}
            role="listbox"
            onClick={stop}
            style={pos ? { top: pos.top, left: pos.left, visibility: 'visible' } : { visibility: 'hidden' }}
        >
            {options.map((opt) => (
                <button
                    type="button"
                    key={opt.value}
                    role="option"
                    aria-selected={opt.value === value}
                    className={`status-menu__item ${opt.value === value ? 'status-menu__item--active' : ''}`}
                    onClick={(e) => handleSelect(e, opt.value)}
                >
                    <span className={`status-menu__dot status-select--${opt.variant}`} />
                    <span className="status-menu__text">{opt.value}</span>
                    {opt.value === value && <Check size={14} className="status-menu__check" />}
                </button>
            ))}
        </div>
    );

    return (
        <div className="status-select-root" ref={rootRef} onClick={stop}>
            <button
                type="button"
                className={`status-select status-select--${size} status-select--${slug}`}
                onClick={(e) => { stop(e); setOpen((o) => !o); }}
                title="Cambiar estado"
            >
                <span className="status-select__label">{value}</span>
                <ChevronDown size={size === 'sm' ? 11 : 13} className="status-select__chevron" />
            </button>
            {menu && createPortal(menu, document.body)}
        </div>
    );
}
