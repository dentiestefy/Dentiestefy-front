import { Trash2, Calendar, Clock, User } from 'lucide-react';
import Modal from '../../components/Shared/Modal';
import Button from '../../components/Shared/Button';

export default function DeleteConfirmModal({ isOpen, appointment, onClose, onConfirm }) {
    if (!appointment) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="delete-modal-content">
                <div className="delete-modal-icon">
                    <Trash2 size={28} />
                </div>
                <h3 className="delete-modal-title">Eliminar Cita</h3>
                <p className="delete-modal-text">
                    ¿Estás seguro de que deseas eliminar esta cita?
                </p>
                <p className="delete-modal-warning">Esta acción no se puede deshacer.</p>

                <div className="delete-modal-info">
                    <div className="delete-modal-info-row">
                        <User size={16} className="text-muted" />
                        <div>
                            <span className="delete-modal-label">PACIENTE</span>
                            <span className="delete-modal-value">{appointment.pacienteNombre}</span>
                        </div>
                    </div>
                    <div className="delete-modal-info-row-grid">
                        <div className="delete-modal-info-row">
                            <Calendar size={16} className="text-muted" />
                            <div>
                                <span className="delete-modal-label">FECHA</span>
                                <span className="delete-modal-value">{formatDate(appointment.fecha)}</span>
                            </div>
                        </div>
                        <div className="delete-modal-info-row">
                            <Clock size={16} className="text-muted" />
                            <div>
                                <span className="delete-modal-label">HORA</span>
                                <span className="delete-modal-value">{appointment.hora}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="delete-modal-actions">
                    <Button variant="danger" fullWidth onClick={onConfirm}>Eliminar Cita</Button>
                    <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
                </div>
            </div>
        </Modal>
    );
}
