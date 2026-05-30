import { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Calendar, Clock, Briefcase, Eye, FileText, ImagePlus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Shared/Card';
import Button from '../../components/Shared/Button';
import Badge from '../../components/Shared/Badge';
import StatusSelect, { PATIENT_STATUS_OPTIONS } from '../../components/Shared/StatusSelect';
import Input from '../../components/Shared/Input';
import Modal from '../../components/Shared/Modal';
import './Evoluciones.css';

export default function PatientDetail() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { patients, evolutions, appointments, updatePatient, updatePatientMedicalHistory, addEvolution } = useApp();

    const patient = patients.find((p) => p.id === patientId);
    const patientEvolutions = useMemo(() =>
        evolutions.filter((e) => e.pacienteId === patientId).sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
        [evolutions, patientId]
    );

    const [showEvDetail, setShowEvDetail] = useState(null);
    const [showRegister, setShowRegister] = useState(false);
    const [showEditMedical, setShowEditMedical] = useState(false);

    const [registerForm, setRegisterForm] = useState({
        procedimiento: '',
        notas: '',
    });
    const [imagenes, setImagenes] = useState([]);
    const fileInputRef = useRef(null);

    const [medicalForm, setMedicalForm] = useState({});
    const [newDisease, setNewDisease] = useState('');

    if (!patient) {
        return (
            <div className="patient-detail-page">
                <button className="patient-detail-back" onClick={() => navigate('/evoluciones')}>
                    <ArrowLeft size={16} /> Volver a Evoluciones
                </button>
                <p>Paciente no encontrado.</p>
            </div>
        );
    }

    const getInitials = (name) => name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleStatusChange = (estado) => {
        updatePatient(patient.id, { estado });
    };

    const openEditMedical = () => {
        setMedicalForm({ ...patient.antecedentes });
        setShowEditMedical(true);
    };

    const handleSaveMedical = () => {
        updatePatientMedicalHistory(patient.id, medicalForm);
        setShowEditMedical(false);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (imagenes.length + files.length > 5) {
            alert('Solo se permite un máximo de 5 imágenes.');
            return;
        }
        setImagenes(prev => [...prev, ...files].slice(0, 5));
    };

    const removeImage = (index) => {
        setImagenes(prev => prev.filter((_, i) => i !== index));
    };

    const handleRegisterEvolution = async () => {
        const today = new Date();
        const formData = new FormData();
        
        // 1. IDs primero (orden estricto)
        formData.append('doctorId', currentUser.id);
        formData.append('pacienteId', patient.id);
        
        // 2. Resto de campos
        formData.append('fecha', today.toISOString().split('T')[0]);
        formData.append('hora', today.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }));
        formData.append('procedimiento', registerForm.procedimiento);
        formData.append('estado', 'Atendido');
        formData.append('notas', registerForm.notas);
        
        // 3. Imágenes al final
        imagenes.forEach(file => {
            formData.append('imagenes', file);
        });

        await addEvolution(formData);
        
        setRegisterForm({ procedimiento: '', notas: '' });
        setImagenes([]);
        setShowRegister(false);
    };

    const addDisease = () => {
        if (newDisease.trim()) {
            setMedicalForm((f) => ({
                ...f,
                enfermedadesCronicas: [...(f.enfermedadesCronicas || []), newDisease.trim()],
            }));
            setNewDisease('');
        }
    };

    const removeDisease = (idx) => {
        setMedicalForm((f) => ({
            ...f,
            enfermedadesCronicas: f.enfermedadesCronicas.filter((_, i) => i !== idx),
        }));
    };

    return (
        <div className="patient-detail-page">
            <button className="patient-detail-back" onClick={() => navigate('/evoluciones')}>
                <ArrowLeft size={16} /> Volver a Evoluciones
            </button>

            <div className="patient-detail-layout">
                {/* Left: Patient Profile */}
                <Card className="patient-profile-card">
                    <div className="patient-profile-header">
                        <div className="patient-avatar-lg">{getInitials(patient.nombre)}</div>
                        <h3>{patient.nombre}</h3>
                        <Badge text={patient.estado} />
                    </div>

                    <div className="patient-profile-info">
                        <div className="patient-info-row">
                            <span className="patient-info-label">RUT</span>
                            <span className="patient-info-value">{patient.rut}</span>
                        </div>
                        <div className="patient-info-row">
                            <span className="patient-info-label">EDAD</span>
                            <span className="patient-info-value">{patient.edad} años</span>
                        </div>
                        <div className="patient-info-row">
                            <span className="patient-info-label">TELÉFONO</span>
                            <span className="patient-info-value">{patient.telefono || 'No registrado'}</span>
                        </div>
                        <div className="patient-info-row">
                            <span className="patient-info-label">EMAIL</span>
                            <span className="patient-info-value">{patient.email || 'No registrado'}</span>
                        </div>
                        <div className="patient-info-row">
                            <span className="patient-info-label">ALERGIAS</span>
                            <span className="patient-info-value">{patient.antecedentes?.alergias || 'Ninguna conocida'}</span>
                        </div>
                        <div className="patient-info-row">
                            <span className="patient-info-label">GRUPO SANGUÍNEO</span>
                            <span className="patient-info-value">{patient.antecedentes?.grupoSanguineo || 'No registrado'} ({patient.antecedentes?.factorRh})</span>
                        </div>
                    </div>

                    <div className="patient-profile-actions">
                        <Button variant="outline-primary" icon={Edit} fullWidth onClick={openEditMedical}>
                            Editar Antecedentes
                        </Button>
                        <div className="patient-status-select">
                            <span className="text-sm font-medium">Estado paciente:</span>
                            <StatusSelect
                                value={patient.estado}
                                onChange={handleStatusChange}
                                options={PATIENT_STATUS_OPTIONS}
                            />
                        </div>
                    </div>
                </Card>

                {/* Right: Evolutions */}
                <div>
                    <div className="evolutions-section-header">
                        <div>
                            <h2>Historial de Evoluciones</h2>
                            <p className="text-secondary text-sm">{patientEvolutions.length} registros clínicos</p>
                        </div>
                        <Button icon={Plus} onClick={() => setShowRegister(true)}>
                            Agregar Evolución
                        </Button>
                    </div>

                    <div className="evolution-cards">
                        {patientEvolutions.length === 0 ? (
                            <Card className="text-center text-muted" style={{ padding: '48px' }}>
                                No hay evoluciones registradas para este paciente.
                            </Card>
                        ) : (
                            patientEvolutions.map((ev) => (
                                <Card key={ev.id} className="evolution-card">
                                    <div className="evolution-card-header">
                                        <div className="evolution-card-date">
                                            <div>
                                                <Calendar size={16} />
                                                <div>
                                                    <span className="label">FECHA</span>
                                                    <span className="value">{formatDate(ev.fecha)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <Clock size={16} />
                                                <div>
                                                    <span className="label">HORA</span>
                                                    <span className="value">{ev.hora}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge text={ev.estado} />
                                    </div>
                                    <div className="evolution-card-procedure">
                                        <Briefcase size={16} />
                                        {ev.procedimiento}
                                    </div>
                                    <p className="evolution-card-preview">{ev.notas}</p>
                                    
                                    {ev.imagenes && ev.imagenes.length > 0 && (
                                        <div className="evolution-card-images">
                                            {ev.imagenes.map((imgUrl, idx) => (
                                                <img key={idx} src={imgUrl} alt={`Evolución ${idx}`} className="ev-thumbnail" />
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button variant="ghost" size="sm" icon={Eye} onClick={() => setShowEvDetail(ev)}>
                                            Ver detalle
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Evolution Detail Modal */}
            <Modal
                isOpen={!!showEvDetail}
                onClose={() => setShowEvDetail(null)}
                title="Detalle de Evolución"
                subtitle="REGISTRO CLÍNICO DE ATENCIÓN"
                size="lg"
                footer={<Button variant="secondary" onClick={() => setShowEvDetail(null)}>Cerrar</Button>}
            >
                {showEvDetail && (
                    <>
                        <div className="evolution-detail-header">
                            <div>
                                <Calendar size={16} className="text-primary" />
                                <div>
                                    <span className="label" style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>FECHA</span>
                                    <span className="value font-medium">{formatDate(showEvDetail.fecha)}</span>
                                </div>
                            </div>
                            <div>
                                <Clock size={16} className="text-primary" />
                                <div>
                                    <span className="label" style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>HORA</span>
                                    <span className="value font-medium">{showEvDetail.hora}</span>
                                </div>
                            </div>
                            <Badge text={showEvDetail.estado} />
                        </div>

                        <div className="evolution-detail-notes">
                            <div className="evolution-detail-notes-label">
                                <FileText size={16} />
                                Notas Clínicas y Evolución
                                <span className="ev-id">ID: #{showEvDetail.id.toUpperCase()}</span>
                            </div>
                            <div className="evolution-notes-content">
                                {showEvDetail.notas}
                            </div>
                            
                            {showEvDetail.imagenes && showEvDetail.imagenes.length > 0 && (
                                <div className="evolution-detail-images-section">
                                    <h4 className="input-label" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Imágenes Adjuntas</h4>
                                    <div className="evolution-detail-gallery">
                                        {showEvDetail.imagenes.map((imgUrl, idx) => (
                                            <img key={idx} src={imgUrl} alt={`Adjunto ${idx}`} className="ev-gallery-image" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Modal>

            {/* Register Evolution Modal */}
            <Modal
                isOpen={showRegister}
                onClose={() => setShowRegister(false)}
                title="Registrar Evolución"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowRegister(false)}>Cancelar</Button>
                        <Button onClick={handleRegisterEvolution}>Guardar Evolución</Button>
                    </>
                }
            >
                <div className="register-ev-header">
                    <div>
                        <span className="label">FECHA Y HORA</span>
                        <span className="value">{new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>
                        <span className="label">PACIENTE</span>
                        <span className="value">{patient.nombre}</span>
                    </div>
                    <Badge text="Atendido" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <Input
                        label="Procedimiento"
                        placeholder="Ej. Instalación Brackets Cerámicos"
                        value={registerForm.procedimiento}
                        onChange={(e) => setRegisterForm(f => ({ ...f, procedimiento: e.target.value }))}
                    />
                    <Input
                        label="Notas de la atención clínica"
                        type="textarea"
                        placeholder="Escriba aquí la evolución clínica de la atención..."
                        value={registerForm.notas}
                        onChange={(e) => setRegisterForm(f => ({ ...f, notas: e.target.value }))}
                        rows={8}
                    />
                    
                    <div className="images-upload-container">
                        <label className="input-label">IMÁGENES (Máx. 5)</label>
                        <div 
                            className="images-upload-dropzone" 
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImagePlus size={24} className="text-secondary" />
                            <span>Haga clic para subir imágenes</span>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                hidden 
                                ref={fileInputRef} 
                                onChange={handleImageChange} 
                            />
                        </div>
                        {imagenes.length > 0 && (
                            <div className="images-preview-list">
                                {imagenes.map((file, index) => (
                                    <div key={index} className="image-preview-item">
                                        <img src={URL.createObjectURL(file)} alt="preview" />
                                        <button className="remove-image-btn" onClick={() => removeImage(index)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="autosave-notice">AUTOGUARDADO ACTIVADO</p>
                </div>
            </Modal>

            {/* Edit Medical History Modal */}
            <Modal
                isOpen={showEditMedical}
                onClose={() => setShowEditMedical(false)}
                title="Editar Antecedentes Médicos"
                subtitle="Actualice la información clínica relevante del paciente."
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowEditMedical(false)}>Cancelar</Button>
                        <Button onClick={handleSaveMedical}>Guardar Cambios</Button>
                    </>
                }
            >
                <div className="medical-form">
                    <div>
                        <label className="input-label">ENFERMEDADES CRÓNICAS</label>
                        <div className="medical-tags">
                            {medicalForm.enfermedadesCronicas?.map((d, idx) => (
                                <span key={idx} className="medical-tag">
                                    {d}
                                    <button onClick={() => removeDisease(idx)}>×</button>
                                </span>
                            ))}
                            <input
                                className="medical-tag-input"
                                placeholder="Agregar enfermedad..."
                                value={newDisease}
                                onChange={(e) => setNewDisease(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDisease())}
                            />
                        </div>
                    </div>

                    <div className="medical-form-row">
                        <Input
                            label="Alergias"
                            type="textarea"
                            value={medicalForm.alergias || ''}
                            onChange={(e) => setMedicalForm(f => ({ ...f, alergias: e.target.value }))}
                            rows={3}
                        />
                        <Input
                            label="Medicamentos actuales"
                            type="textarea"
                            placeholder="Listado de medicamentos..."
                            value={medicalForm.medicamentos || ''}
                            onChange={(e) => setMedicalForm(f => ({ ...f, medicamentos: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    <div className="medical-form-row">
                        <Input
                            label="Grupo sanguíneo"
                            type="select"
                            value={medicalForm.grupoSanguineo || ''}
                            onChange={(e) => setMedicalForm(f => ({ ...f, grupoSanguineo: e.target.value }))}
                            options={[
                                { value: '', label: 'Seleccionar' },
                                { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
                                { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
                                { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
                                { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
                            ]}
                        />
                        <div>
                            <label className="input-label">FACTOR RH</label>
                            <div className="rh-radio-group">
                                <label>
                                    <input type="radio" name="rh" value="Positivo" checked={medicalForm.factorRh === 'Positivo'} onChange={(e) => setMedicalForm(f => ({ ...f, factorRh: e.target.value }))} />
                                    Positivo
                                </label>
                                <label>
                                    <input type="radio" name="rh" value="Negativo" checked={medicalForm.factorRh === 'Negativo'} onChange={(e) => setMedicalForm(f => ({ ...f, factorRh: e.target.value }))} />
                                    Negativo
                                </label>
                            </div>
                        </div>
                    </div>

                    <Input
                        label="Observaciones generales"
                        type="textarea"
                        placeholder="Detalles adicionales, antecedentes quirúrgicos, etc."
                        value={medicalForm.observaciones || ''}
                        onChange={(e) => setMedicalForm(f => ({ ...f, observaciones: e.target.value }))}
                        rows={3}
                    />
                </div>
            </Modal>
        </div>
    );
}
