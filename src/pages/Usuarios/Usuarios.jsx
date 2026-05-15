import { useState, useMemo } from 'react';
import { Eye, Edit as EditIcon, Save, Shield, UserPlus, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import SearchBar from '../../components/Shared/SearchBar';
import Table from '../../components/Shared/Table';
import Badge from '../../components/Shared/Badge';
import Button from '../../components/Shared/Button';
import Modal from '../../components/Shared/Modal';
import Input from '../../components/Shared/Input';
import { formatRut } from '../../utils/rut';
import './Usuarios.css';

export default function Usuarios() {
    const { isAdmin } = useAuth();
    const { users, updateUser, addUser } = useApp();
    const [search, setSearch] = useState('');
    const [viewModal, setViewModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [changePassword, setChangePassword] = useState({ open: false, userId: null, password: '', confirm: '' });
    const [createModal, setCreateModal] = useState(false);
    const emptyCreateForm = { nombre: '', username: '', role: 'doctor', password: '', confirmPassword: '', email: '', telefono: '', rut: '', especialidad: '' };
    const [createForm, setCreateForm] = useState(emptyCreateForm);

    const filteredUsers = useMemo(() => {
        if (!search) return users;
        return users.filter((u) =>
            u.nombre.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.role.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    const getInitials = (name) => name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '??';
    const getRoleLabel = (role) => ({ admin: 'Administrador', doctor: 'Doctor', secretaria: 'Secretaria' }[role] || role);

    const openEdit = (user) => {
        setEditForm({
            nombre: user.nombre,
            email: user.email,
            telefono: user.telefono,
            role: user.role,
            especialidad: user.especialidad || '',
        });
        setEditModal(user);
    };

    const handleSaveEdit = () => {
        if (editModal) {
            updateUser(editModal.id, editForm);
        }
        setEditModal(null);
    };

    const handleChangePassword = () => {
        if (changePassword.password && changePassword.password === changePassword.confirm) {
            updateUser(changePassword.userId, { password: changePassword.password });
        }
        setChangePassword({ open: false, userId: null, password: '', confirm: '' });
    };

    const openCreateModal = () => {
        setCreateForm(emptyCreateForm);
        setCreateModal(true);
    };

    const handleCreateUser = () => {
        if (!createForm.nombre || !createForm.username || !createForm.password) return;
        if (createForm.password !== createForm.confirmPassword) return;
        addUser({
            nombre: createForm.nombre,
            username: createForm.username,
            role: createForm.role,
            password: createForm.password,
            email: createForm.email || `${createForm.username}@dentiestefy.cl`,
            telefono: createForm.telefono || '',
            rut: createForm.rut || '',
            especialidad: createForm.role === 'doctor' ? createForm.especialidad : '',
        });
        setCreateModal(false);
    };

    const isCreateFormValid = createForm.nombre && createForm.username && createForm.password && createForm.password === createForm.confirmPassword;

    const columns = [
        { key: 'nombre', label: 'Nombre' },
        { key: 'role', label: 'Rol' },
        { key: 'email', label: 'Correo electrónico' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'acciones', label: 'Acciones', width: '200px' },
    ];

    return (
        <div className="usuarios-page">
            <div className="usuarios-header">
                <div>
                    <h1>Usuarios</h1>
                    <p className="text-secondary">
                        {isAdmin ? 'Gestiona los usuarios del sistema' : 'Directorio de usuarios del sistema'}
                    </p>
                </div>
                {isAdmin && (
                    <Button icon={Plus} onClick={openCreateModal}>Nuevo Usuario</Button>
                )}
            </div>

            <div className="usuarios-toolbar">
                <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre, usuario o rol..." />
            </div>

            <Table
                columns={columns}
                data={filteredUsers}
                emptyMessage="No se encontraron usuarios"
                renderRow={(user) => (
                    <tr key={user.id}>
                        <td>
                            <div className="table-cell-name">
                                <div className="table-avatar">{getInitials(user.nombre)}</div>
                                <div>
                                    <div className="font-medium">{user.nombre}</div>
                                    <div className="text-sm text-muted">@{user.username}</div>
                                </div>
                            </div>
                        </td>
                        <td><Badge text={getRoleLabel(user.role)} variant={user.role} /></td>
                        <td className="text-sm">{user.email}</td>
                        <td className="text-sm">{user.telefono}</td>
                        <td>
                            <div className="table-actions">
                                <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewModal(user)}>
                                    Ver
                                </Button>
                                {isAdmin && (
                                    <Button variant="ghost" size="sm" icon={EditIcon} onClick={() => openEdit(user)}>
                                        Editar
                                    </Button>
                                )}
                            </div>
                        </td>
                    </tr>
                )}
                footer={`Mostrando ${filteredUsers.length} de ${users.length} usuarios`}
            />

            {/* View User Modal */}
            <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Detalle del Usuario" subtitle="Información completa del profesional" size="md"
                footer={<Button variant="secondary" onClick={() => setViewModal(null)}>Cerrar</Button>}
            >
                {viewModal && (
                    <div className="user-detail-grid">
                        <div className="user-detail-center">
                            <div className="user-avatar-xl">{getInitials(viewModal.nombre)}</div>
                            <h3>{viewModal.nombre}</h3>
                            <Badge text={getRoleLabel(viewModal.role)} variant={viewModal.role} />
                        </div>
                        <div className="user-detail-info">
                            <div className="user-detail-item">
                                <span className="user-detail-label">NOMBRE DE USUARIO</span>
                                <span className="user-detail-value">@{viewModal.username}</span>
                            </div>
                            {viewModal.especialidad && (
                                <div className="user-detail-item">
                                    <span className="user-detail-label">ESPECIALIDAD</span>
                                    <span className="user-detail-value">{viewModal.especialidad}</span>
                                </div>
                            )}
                            <div className="user-detail-item">
                                <span className="user-detail-label">CORREO ELECTRÓNICO</span>
                                <span className="user-detail-value">{viewModal.email}</span>
                            </div>
                            <div className="user-detail-item">
                                <span className="user-detail-label">TELÉFONO</span>
                                <span className="user-detail-value">{viewModal.telefono}</span>
                            </div>
                            <div className="user-detail-item">
                                <span className="user-detail-label">RUT</span>
                                <span className="user-detail-value">{viewModal.rut}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit User Modal */}
            <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Editar Usuario" size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setEditModal(null)}>Cancelar</Button>
                        <Button icon={Save} onClick={handleSaveEdit}>Guardar Cambios</Button>
                    </>
                }
            >
                <div className="user-edit-form">
                    <Input label="Nombre completo" value={editForm.nombre || ''} onChange={(e) => setEditForm(f => ({ ...f, nombre: e.target.value }))} />
                    <Input
                        label="Rol"
                        type="select"
                        value={editForm.role || ''}
                        onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                        options={[
                            { value: 'admin', label: 'Administrador' },
                            { value: 'doctor', label: 'Doctor' },
                            { value: 'secretaria', label: 'Secretaria' },
                        ]}
                    />
                    <Input label="Correo electrónico" type="email" value={editForm.email || ''} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />
                    <Input label="Teléfono" value={editForm.telefono || ''} onChange={(e) => setEditForm(f => ({ ...f, telefono: e.target.value }))} />
                    {editForm.role === 'doctor' && (
                        <Input label="Especialidad" value={editForm.especialidad || ''} onChange={(e) => setEditForm(f => ({ ...f, especialidad: e.target.value }))} />
                    )}
                    <Button
                        variant="outline-primary"
                        icon={Shield}
                        fullWidth
                        onClick={() => setChangePassword({ open: true, userId: editModal?.id, password: '', confirm: '' })}
                    >
                        Cambiar Contraseña
                    </Button>
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal isOpen={changePassword.open} onClose={() => setChangePassword({ open: false, userId: null, password: '', confirm: '' })} title="Cambiar Contraseña" size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setChangePassword({ open: false, userId: null, password: '', confirm: '' })}>Cancelar</Button>
                        <Button onClick={handleChangePassword} disabled={!changePassword.password || changePassword.password !== changePassword.confirm}>Confirmar</Button>
                    </>
                }
            >
                <div className="user-edit-form">
                    <Input label="Nueva Contraseña" type="password" value={changePassword.password} onChange={(e) => setChangePassword(cp => ({ ...cp, password: e.target.value }))} />
                    <Input label="Confirmar Contraseña" type="password" value={changePassword.confirm} onChange={(e) => setChangePassword(cp => ({ ...cp, confirm: e.target.value }))}
                        error={changePassword.confirm && changePassword.password !== changePassword.confirm ? 'Las contraseñas no coinciden' : ''}
                    />
                </div>
            </Modal>

            {/* Create User Modal */}
            <Modal
                isOpen={createModal}
                onClose={() => setCreateModal(false)}
                title="Crear Nuevo Usuario"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancelar</Button>
                        <Button icon={UserPlus} onClick={handleCreateUser} disabled={!isCreateFormValid}>Crear Usuario</Button>
                    </>
                }
            >
                <div className="create-user-form">
                    {/* Section: Información del Usuario */}
                    <div className="form-section">
                        <h3 className="form-section-title">Información del Usuario</h3>
                        <div className="form-section-fields">
                            <Input
                                label="Nombre Completo"
                                placeholder="Ej. Dr. Alejandro Méndez"
                                value={createForm.nombre}
                                onChange={(e) => setCreateForm(f => ({ ...f, nombre: e.target.value }))}
                                required
                            />
                            <div className="form-row-2">
                                <Input
                                    label="Nombre de Usuario"
                                    placeholder="amendez_dent"
                                    value={createForm.username}
                                    onChange={(e) => setCreateForm(f => ({ ...f, username: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="Rol"
                                    type="select"
                                    value={createForm.role}
                                    onChange={(e) => setCreateForm(f => ({ ...f, role: e.target.value }))}
                                    options={[
                                        { value: 'doctor', label: 'Doctor' },
                                        { value: 'secretaria', label: 'Secretaria' },
                                        { value: 'admin', label: 'Admin' },
                                    ]}
                                />
                            </div>
                            {createForm.role === 'doctor' && (
                                <Input
                                    label="Especialidad"
                                    placeholder="Ej. Ortodoncia y Ortopedia"
                                    value={createForm.especialidad}
                                    onChange={(e) => setCreateForm(f => ({ ...f, especialidad: e.target.value }))}
                                />
                            )}
                            <div className="form-row-2">
                                <Input
                                    label="Correo Electrónico"
                                    type="email"
                                    placeholder="usuario@dentiestefy.cl"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                                />
                                <Input
                                    label="Teléfono"
                                    placeholder="+56 9 1234 5678"
                                    value={createForm.telefono}
                                    onChange={(e) => setCreateForm(f => ({ ...f, telefono: e.target.value }))}
                                />
                            </div>
                            <Input
                                label="RUT"
                                placeholder="12.345.678-9"
                                value={createForm.rut}
                                onChange={(e) => setCreateForm(f => ({ ...f, rut: formatRut(e.target.value) }))}
                            />
                        </div>
                    </div>

                    {/* Section: Seguridad */}
                    <div className="form-section">
                        <h3 className="form-section-title">Seguridad</h3>
                        <div className="form-section-fields">
                            <Input
                                label="Contraseña"
                                type="password"
                                placeholder="••••••••"
                                value={createForm.password}
                                onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
                                required
                            />
                            <Input
                                label="Confirmar Contraseña"
                                type="password"
                                placeholder="••••••••"
                                value={createForm.confirmPassword}
                                onChange={(e) => setCreateForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                error={createForm.confirmPassword && createForm.password !== createForm.confirmPassword ? 'Las contraseñas no coinciden' : ''}
                                required
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
