import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Check, X } from 'lucide-react';
import StatusSelect from '../../components/Shared/StatusSelect';
import './AppointmentBubble.css';

const BUBBLE_WIDTH = 240;
const GAP = 8;

/**
 * Viñeta de comentario que aparece (instantánea) al pasar el mouse sobre una cita.
 * Muestra paciente, doctor, hora, estado y el comentario particular de la cita.
 * El botón + permite escribir/editar un comentario, distinto a la descripción.
 *
 * Se renderiza en un portal con posición fija calculada desde el rect de la cita,
 * para no ser recortada por el scroll del calendario.
 */
export default function AppointmentBubble({ appt, anchorRect, canManage, onSaveComment, onChangeStatus, onEnter, onLeave }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(appt.comentario || '');
    const [saving, setSaving] = useState(false);
    const [pos, setPos] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const bubbleRef = useRef(null);
    const textareaRef = useRef(null);

    // Mientras el desplegable de estado esté abierto, no cerrar la viñeta al salir
    const handleLeave = () => { if (!menuOpen) onLeave?.(); };

    // Sincroniza el valor si cambia la cita o su comentario externamente
    useEffect(() => {
        setValue(appt.comentario || '');
        setEditing(false);
    }, [appt.id, appt.comentario]);

    useEffect(() => {
        if (editing && textareaRef.current) {
            textareaRef.current.focus();
            const len = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, [editing]);

    // Calcula posición fija: prefiere abrir abajo; si no cabe, arriba.
    // Horizontalmente alinea al borde izquierdo de la cita, corrigiendo si sobresale.
    useLayoutEffect(() => {
        if (!anchorRect) return;
        const height = bubbleRef.current?.offsetHeight || 160;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const spaceBelow = vh - anchorRect.bottom;
        const openUp = spaceBelow < height + GAP && anchorRect.top > spaceBelow;

        let top = openUp ? anchorRect.top - height - GAP : anchorRect.bottom + GAP;
        top = Math.max(8, Math.min(top, vh - height - 8));

        let left = anchorRect.left;
        if (left + BUBBLE_WIDTH > vw - 8) left = vw - BUBBLE_WIDTH - 8;
        left = Math.max(8, left);

        // Posición de la flecha respecto a la viñeta (apunta a la cita)
        const arrowCenter = anchorRect.left + anchorRect.width / 2;
        const arrowLeft = Math.max(12, Math.min(arrowCenter - left, BUBBLE_WIDTH - 24));

        setPos({ top, left, openUp, arrowLeft });
    }, [anchorRect, editing, value]);

    const handleSave = async () => {
        const trimmed = value.trim();
        if (trimmed === (appt.comentario || '')) {
            setEditing(false);
            return;
        }
        setSaving(true);
        try {
            await onSaveComment(appt.id, trimmed);
            setEditing(false);
        } catch (err) {
            console.error('Error guardando comentario', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setValue(appt.comentario || '');
        setEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    const stop = (e) => e.stopPropagation();

    const content = (
        <div
            ref={bubbleRef}
            className={`appt-bubble ${pos?.openUp ? 'appt-bubble--up' : ''}`}
            style={pos ? { top: pos.top, left: pos.left, visibility: 'visible' } : { visibility: 'hidden' }}
            onMouseEnter={onEnter}
            onMouseLeave={handleLeave}
            onClick={stop}
        >
            <div className="appt-bubble__arrow" style={{ left: pos?.arrowLeft }} />

            <div className="appt-bubble__header">
                <span className="appt-bubble__time">{appt.hora}</span>
                <StatusSelect
                    value={appt.estado}
                    onChange={(estado) => onChangeStatus(appt.id, estado)}
                    disabled={!canManage || !onChangeStatus}
                    stopPropagation
                    onOpenChange={setMenuOpen}
                />
            </div>

            <div className="appt-bubble__patient">{appt.pacienteNombre}</div>
            <div className="appt-bubble__doctor">{appt.doctorNombre}</div>

            <div className="appt-bubble__divider" />

            <div className="appt-bubble__comment-area">
                <div className="appt-bubble__comment-label">
                    Comentario
                    {canManage && !editing && (
                        <button
                            type="button"
                            className="appt-bubble__add-btn"
                            onClick={(e) => { stop(e); setEditing(true); }}
                            title={appt.comentario ? 'Editar comentario' : 'Agregar comentario'}
                        >
                            <Plus size={13} />
                        </button>
                    )}
                </div>

                {editing ? (
                    <div className="appt-bubble__edit">
                        <textarea
                            ref={textareaRef}
                            className="appt-bubble__textarea"
                            value={value}
                            placeholder="Escribe un comentario…"
                            rows={3}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onClick={stop}
                        />
                        <div className="appt-bubble__edit-actions">
                            <button
                                type="button"
                                className="appt-bubble__icon-btn appt-bubble__icon-btn--cancel"
                                onClick={(e) => { stop(e); handleCancel(); }}
                                disabled={saving}
                                title="Cancelar"
                            >
                                <X size={14} />
                            </button>
                            <button
                                type="button"
                                className="appt-bubble__icon-btn appt-bubble__icon-btn--save"
                                onClick={(e) => { stop(e); handleSave(); }}
                                disabled={saving}
                                title="Guardar"
                            >
                                <Check size={14} />
                            </button>
                        </div>
                    </div>
                ) : appt.comentario ? (
                    <p className="appt-bubble__comment-text">{appt.comentario}</p>
                ) : (
                    <p className="appt-bubble__comment-empty">Sin comentarios</p>
                )}
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
