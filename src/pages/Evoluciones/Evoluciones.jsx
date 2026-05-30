import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { PATIENT_STATUS } from '../../data/mockData';
import SearchBar from '../../components/Shared/SearchBar';
import Table from '../../components/Shared/Table';
import Button from '../../components/Shared/Button';
import StatusSelect, { PATIENT_STATUS_OPTIONS } from '../../components/Shared/StatusSelect';
import './Evoluciones.css';

export default function Evoluciones() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { patients, appointments, updatePatient } = useApp();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(PATIENT_STATUS.ACTIVO);

    const doctorPatients = useMemo(() => {
        let list = patients;
        if (currentUser.role === 'doctor') {
            list = list.filter((p) => p.doctorId === currentUser.id);
        }
        if (statusFilter) {
            list = list.filter((p) => p.estado === statusFilter);
        }
        if (search) {
            list = list.filter((p) =>
                p.nombre.toLowerCase().includes(search.toLowerCase()) ||
                p.rut.toLowerCase().includes(search.toLowerCase())
            );
        }
        return list.map((p) => {
            const patientAppts = appointments
                .filter((a) => a.pacienteId === p.id && a.estado === 'Atendido')
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            return { ...p, ultimaAtencion: patientAppts[0]?.fecha || null };
        });
    }, [patients, appointments, currentUser, search, statusFilter]);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Sin atenciones';
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getInitials = (name) => name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';

    const columns = [
        { key: 'nombre', label: 'Nombre' },
        { key: 'ultimaAtencion', label: 'Última Atención' },
        { key: 'estado', label: 'Estado' },
        { key: 'accion', label: 'Acción', width: '140px' },
    ];

    return (
        <div className="evoluciones-page">
            <div className="evoluciones-header">
                <div>
                    <h1>Evoluciones</h1>
                    <p className="text-secondary">Gestiona las evoluciones clínicas de tus pacientes</p>
                </div>
            </div>

            <div className="evoluciones-toolbar">
                <SearchBar value={search} onChange={setSearch} placeholder="Buscar paciente por nombre o RUT..." />
                <div className="evoluciones-filters">
                    <Filter size={16} className="text-muted" />
                    <button
                        className={`filter-btn ${statusFilter === PATIENT_STATUS.ACTIVO ? 'filter-btn--active' : ''}`}
                        onClick={() => setStatusFilter(PATIENT_STATUS.ACTIVO)}
                    >
                        Activo
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === PATIENT_STATUS.DE_ALTA ? 'filter-btn--active' : ''}`}
                        onClick={() => setStatusFilter(PATIENT_STATUS.DE_ALTA)}
                    >
                        De alta
                    </button>
                    <button
                        className={`filter-btn ${!statusFilter ? 'filter-btn--active' : ''}`}
                        onClick={() => setStatusFilter('')}
                    >
                        Todos
                    </button>
                </div>
            </div>

            <Table
                columns={columns}
                data={doctorPatients}
                emptyMessage="No se encontraron pacientes"
                renderRow={(patient) => (
                    <tr key={patient.id}>
                        <td>
                            <div className="table-cell-name">
                                <div className="table-avatar">{getInitials(patient.nombre)}</div>
                                <div>
                                    <div className="font-medium">{patient.nombre}</div>
                                    <div className="text-sm text-muted">{patient.rut}</div>
                                </div>
                            </div>
                        </td>
                        <td>{formatDate(patient.ultimaAtencion)}</td>
                        <td>
                            <StatusSelect
                                value={patient.estado}
                                onChange={(estado) => updatePatient(patient.id, { estado })}
                                options={PATIENT_STATUS_OPTIONS}
                            />
                        </td>
                        <td>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                icon={Eye}
                                onClick={() => navigate(`/evoluciones/${patient.id}`)}
                            >
                                Ver evoluciones
                            </Button>
                        </td>
                    </tr>
                )}
                footer={`Mostrando ${doctorPatients.length} pacientes`}
            />
        </div>
    );
}
