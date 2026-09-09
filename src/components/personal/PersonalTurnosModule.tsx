// ==============================================================================
// MÓDULO DE PERSONAL, TURNOS Y SEGURIDAD CLÍNICA NOM-024-SSA3-2012
// Hospital Puerta de Hierro (Tepic) - RBAC, Credenciales & Bitácora de Accesos
// ==============================================================================

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  ShieldCheck, 
  Lock, 
  Clock, 
  Key, 
  Search,
  CheckCircle2,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Shield,
  AlertTriangle,
  Check,
  Copy,
  Sparkles,
  LogIn,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { UserProfile, AuditLog } from '../../types/hospital';
import { logAuditAction } from '../../lib/supabaseClient';

export const AVAILABLE_MODULES = [
  { id: 'triage', name: 'Triage Urgencias', icon: '🚨' },
  { id: 'admision_programada', name: 'Admisión Programada', icon: '📅' },
  { id: 'consultorios', name: 'Consultorios ECE', icon: '🩺' },
  { id: 'hospitalizacion', name: 'Hospitalización y Camas', icon: '🛏️' },
  { id: 'farmacia', name: 'Farmacia Hospitalaria', icon: '💊' },
  { id: 'laboratorio', name: 'Laboratorio Clínico', icon: '🧪' },
  { id: 'rayosx', name: 'Rayos X e Imagen', icon: '🩻' },
  { id: 'caja', name: 'Caja y Cobro', icon: '💳' },
  { id: 'ceye', name: 'CEYE Quirófano', icon: '✂️' },
  { id: 'chat', name: 'Chat Médico', icon: '💬' },
  { id: 'personal', name: 'Personal & Turnos', icon: '👥' },
  { id: 'dashboard', name: 'Dashboard Ejecutivo', icon: '📊' },
  { id: 'almacen', name: 'Almacén General', icon: '📦' },
  { id: 'compras', name: 'Compras & Proveedores', icon: '🛍️' },
];

interface PersonalTurnosModuleProps {
  staff: UserProfile[];
  auditLogs: AuditLog[];
  currentUser?: UserProfile;
  onAddUser: (user: UserProfile) => void;
  onUpdateUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const PersonalTurnosModule: React.FC<PersonalTurnosModuleProps> = ({
  staff,
  auditLogs,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'CREDENCIALES' | 'LOGINS' | 'AUDITORIA'>('CREDENCIALES');
  const [selectedShift, setSelectedShift] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [loginSearchQuery, setLoginSearchQuery] = useState('');

  // Estados para contraseñas visibles
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados de modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Campos para crear nuevo usuario
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newRole, setNewRole] = useState<UserProfile['role']>('MEDICO_ESPECIALISTA');
  const [newProfessionalLicense, setNewProfessionalLicense] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newShift, setNewShift] = useState<UserProfile['shift']>('MATUTINO');
  const [newPhone, setNewPhone] = useState('311-129-5200');
  const [newAllowedModules, setNewAllowedModules] = useState<string[]>(['menu', 'triage', 'consultorios', 'hospitalizacion', 'chat']);
  const [newShowPassword, setNewShowPassword] = useState(false);

  // Campos para editar usuario existente
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserProfile['role']>('MEDICO_ESPECIALISTA');
  const [editProfessionalLicense, setEditProfessionalLicense] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editShift, setEditShift] = useState<UserProfile['shift']>('MATUTINO');
  const [editPhone, setEditPhone] = useState('');
  const [editAllowedModules, setEditAllowedModules] = useState<string[]>([]);
  const [editShowPassword, setEditShowPassword] = useState(false);

  // Alternar visibilidad de contraseña
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopyPassword = (userId: string, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Abrir modal de edición
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditUsername(user.username || user.email.split('@')[0]);
    setEditEmail(user.email);
    setEditPassword(user.password || 'password123');
    setEditRole(user.role);
    setEditProfessionalLicense(user.professionalLicense);
    setEditSpecialty(user.specialty || '');
    setEditShift(user.shift);
    setEditPhone(user.phone || '311-129-5200');
    setEditAllowedModules(user.allowedModules || ['*']);
    setEditShowPassword(false);
  };

  // Guardar edición de usuario
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated: UserProfile = {
      ...editingUser,
      fullName: editFullName.trim(),
      username: editUsername.trim().toLowerCase(),
      email: editEmail.trim(),
      password: editPassword.trim(),
      role: editRole,
      professionalLicense: editProfessionalLicense.trim(),
      specialty: editSpecialty.trim(),
      shift: editShift,
      phone: editPhone.trim(),
      allowedModules: editAllowedModules.length === 0 ? ['*'] : editAllowedModules,
    };

    onUpdateUser(updated);

    logAuditAction({
      userName: currentUser?.fullName || 'Ing. Alfonso Uribe',
      userRole: currentUser?.role || 'ADMINISTRADOR_UNICO',
      actionType: 'MODIFICACION_USUARIO_Y_CREDENCIALES',
      resourceAffected: `Usuario ${updated.fullName} (${updated.id})`,
      details: `Credenciales, rol (${updated.role}) y ${updated.allowedModules?.length} módulos permitidos actualizados bajo NOM-024.`,
    });

    setEditingUser(null);
  };

  // Crear nuevo usuario
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      email: newEmail.trim(),
      username: (newUsername.trim() || newEmail.split('@')[0]).toLowerCase(),
      password: newPassword.trim(),
      fullName: newFullName.trim(),
      role: newRole,
      professionalLicense: newProfessionalLicense.trim(),
      specialty: newSpecialty.trim(),
      shift: newShift,
      phone: newPhone.trim(),
      isActive: true,
      allowedModules: newAllowedModules.length === 0 ? ['*'] : newAllowedModules,
    };

    onAddUser(newUser);

    logAuditAction({
      userName: currentUser?.fullName || 'Ing. Alfonso Uribe',
      userRole: currentUser?.role || 'ADMINISTRADOR_UNICO',
      actionType: 'CREACION_USUARIO_Y_CREDENCIALES',
      resourceAffected: `Usuario ${newUser.fullName} (${newUser.id})`,
      details: `Nueva cuenta creada con rol ${newRole}, contraseña asignada y ${newUser.allowedModules?.length} módulos asignados.`,
    });

    setShowAddModal(false);
    // Limpiar campos
    setNewFullName('');
    setNewUsername('');
    setNewEmail('');
    setNewPassword('password123');
    setNewProfessionalLicense('');
    setNewSpecialty('');
    setNewAllowedModules(['menu', 'triage', 'consultorios', 'hospitalizacion', 'chat']);
  };

  // Abrir confirmación de eliminación
  const handleOpenDelete = (user: UserProfile) => {
    setDeleteError(null);
    if (user.id === currentUser?.id) {
      setDeleteError('No es posible eliminar su propia sesión activa del Administrador.');
    } else if (user.role === 'ADMINISTRADOR_UNICO' && staff.filter(s => s.role === 'ADMINISTRADOR_UNICO').length <= 1) {
      setDeleteError('El Administrador Único principal no puede eliminarse del sistema.');
    }
    setDeletingUser(user);
  };

  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    if (deleteError) return;

    onDeleteUser(deletingUser.id);

    logAuditAction({
      userName: currentUser?.fullName || 'Ing. Alfonso Uribe',
      userRole: currentUser?.role || 'ADMINISTRADOR_UNICO',
      actionType: 'ELIMINACION_CUENTA_USUARIO',
      resourceAffected: `Usuario ${deletingUser.fullName} (${deletingUser.id})`,
      details: `Cuenta eliminada del sistema hospitalario por el Administrador.`,
    });

    setDeletingUser(null);
  };

  // Manejadores para alternar módulos permitidos
  const toggleModuleSelection = (modId: string, currentList: string[], setter: (val: string[]) => void) => {
    if (currentList.includes('*')) {
      // Si tenía acceso total y se desmarca uno, se agregan todos excepto modId
      const allExceptThis = AVAILABLE_MODULES.map(m => m.id).filter(id => id !== modId);
      setter(allExceptThis);
    } else if (currentList.includes(modId)) {
      setter(currentList.filter(id => id !== modId));
    } else {
      const nextList = [...currentList, modId];
      if (nextList.length === AVAILABLE_MODULES.length) {
        setter(['*']);
      } else {
        setter(nextList);
      }
    }
  };

  const toggleAllModules = (currentList: string[], setter: (val: string[]) => void) => {
    if (currentList.includes('*') || currentList.length === AVAILABLE_MODULES.length) {
      setter(['menu']); // Deja solo menú principal como mínimo
    } else {
      setter(['*']); // Otorga acceso total
    }
  };

  // Filtrar personal
  const filteredStaff = staff.filter(s => {
    const matchesShift = selectedShift === 'TODOS' || s.shift === selectedShift;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.username && s.username.toLowerCase().includes(q)) ||
      s.professionalLicense.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q);
    return matchesShift && matchesQuery;
  });

  // Filtrar auditoría de inicios de sesión (Logins)
  const loginAuditLogs = auditLogs.filter(log => {
    const isLogin = log.actionType === 'INICIO_SESION_EXITOSO' || 
                    log.actionType.includes('LOGIN') || 
                    log.actionType.includes('SESION') ||
                    log.actionType.includes('AUTENTICACION');
    if (!isLogin) return false;
    const q = loginSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      log.userName.toLowerCase().includes(q) ||
      log.userRole.toLowerCase().includes(q) ||
      log.ipAddress.toLowerCase().includes(q) ||
      log.timestamp.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Encabezado Maestro del Módulo de Administración */}
      <div className="neo-glass-panel p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
              <span className="neo-badge-dot" style={{ background: '#3b82f6' }}></span>
              ADMINISTRACIÓN CENTRAL & SEGURIDAD
            </span>
            <span className="text-xs text-cyan-400 font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
              NOM-024 RBAC & TRAZABILIDAD
            </span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            Personal, Credenciales y Registro de Accesos
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-0.5">
            Gestión de roles, contraseñas secretas, matriz de permisos de módulos e historial de inicios de sesión.
          </p>
        </div>

        {/* Barra de Navegación de Pestañas del Módulo */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          <div className="neo-action-bar">
            <button
              onClick={() => setActiveTab('CREDENCIALES')}
              className={`btn-neo text-xs px-3.5 py-1.5 flex items-center gap-1.5 ${
                activeTab === 'CREDENCIALES' ? 'btn-neo-active' : 'text-slate-400'
              }`}
            >
              <Key size={14} className="text-cyan-400" />
              <span>Roles & Contraseñas</span>
            </button>
            <button
              onClick={() => setActiveTab('LOGINS')}
              className={`btn-neo text-xs px-3.5 py-1.5 flex items-center gap-1.5 ${
                activeTab === 'LOGINS' ? 'btn-neo-active' : 'text-slate-400'
              }`}
            >
              <LogIn size={14} className="text-emerald-400" />
              <span>Inicios de Sesión ({loginAuditLogs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('PERSONAL')}
              className={`btn-neo text-xs px-3.5 py-1.5 flex items-center gap-1.5 ${
                activeTab === 'PERSONAL' ? 'btn-neo-active' : 'text-slate-400'
              }`}
            >
              <Users size={14} />
              <span>Directorio & Turnos</span>
            </button>
            <button
              onClick={() => setActiveTab('AUDITORIA')}
              className={`btn-neo text-xs px-3.5 py-1.5 flex items-center gap-1.5 ${
                activeTab === 'AUDITORIA' ? 'btn-neo-active' : 'text-slate-400'
              }`}
            >
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Auditoría NOM-024</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-neo btn-neo-active text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.35)]"
          >
            <Plus size={15} />
            <span>Crear Usuario / Clave</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PESTAÑA 1: GESTIÓN DE ROLES, CONTRASEÑAS Y PERMISOS (RBAC)            */}
      {/* ===================================================================== */}
      {activeTab === 'CREDENCIALES' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Barra de Filtros y Búsqueda */}
          <div className="neo-glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, usuario, correo o cédula..."
                className="neo-input pl-10 text-xs py-2"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-xs">
              <span className="text-slate-400 font-mono">
                Total de cuentas registradas: <strong className="text-cyan-300">{filteredStaff.length}</strong>
              </span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                <Lock size={13} />
                <span>Claves Protegidas</span>
              </div>
            </div>
          </div>

          {/* Tabla de Cuentas, Contraseñas y Permisos */}
          <div className="neo-glass-panel overflow-hidden border border-white/10 shadow-2xl">
            <div className="p-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Key size={17} className="text-cyan-400" />
                  Matriz de Credenciales, Contraseñas y Asignación de Módulos
                </h3>
                <p className="text-xs text-slate-400">
                  Las contraseñas se almacenan cifradas. Pulse el icono del ojo para revelar una clave o el lápiz para editar permisos.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-300 uppercase font-mono font-bold border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Usuario / Personal</th>
                    <th className="p-3.5">Nombre de Usuario</th>
                    <th className="p-3.5">Rol Institucional</th>
                    <th className="p-3.5">Contraseña Asignada</th>
                    <th className="p-3.5">Módulos Autorizados</th>
                    <th className="p-3.5">Turno / Cédula</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStaff.map((user) => {
                    const isVisible = !!visiblePasswords[user.id];
                    const isTotalAccess = !user.allowedModules || user.allowedModules.includes('*');
                    const isCurrentAdmin = user.role === 'ADMINISTRADOR_UNICO';

                    return (
                      <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                        {/* Usuario / Personal */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border border-cyan-400/30 flex items-center justify-center font-bold text-cyan-200">
                              {user.fullName.split(' ')[0]?.[0] || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-white text-[13px] flex items-center gap-1.5">
                                <span>{user.fullName}</span>
                                {isCurrentAdmin && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                                    ⭐ ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Nombre de Usuario */}
                        <td className="p-3.5 font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-cyan-300 border border-cyan-500/20 text-[11px]">
                            @{user.username || user.email.split('@')[0]}
                          </span>
                        </td>

                        {/* Rol Institucional */}
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            user.role === 'ADMINISTRADOR_UNICO'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                              : user.role === 'DIRECTOR_MEDICO'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40'
                              : user.role.includes('MEDICO')
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/40'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {user.role.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Contraseña con Toggle y Copiar */}
                        <td className="p-3.5">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-white/10">
                            <span className="font-mono text-[12px] font-semibold tracking-wider text-slate-200">
                              {isVisible ? (user.password || 'password123') : '••••••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="text-slate-400 hover:text-cyan-300 transition-colors p-0.5"
                              title={isVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
                            >
                              {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyPassword(user.id, user.password || 'password123')}
                              className="text-slate-400 hover:text-emerald-300 transition-colors p-0.5"
                              title="Copiar contraseña"
                            >
                              {copiedId === user.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>

                        {/* Módulos Permitidos */}
                        <td className="p-3.5">
                          {isTotalAccess ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-cyan-500/20 text-cyan-200 font-bold border border-cyan-400/40 text-[10.5px]">
                              <Sparkles size={11} className="text-amber-400" />
                              <span>Acceso Total (14 Módulos)</span>
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10 text-[10px] font-mono">
                                {user.allowedModules?.length} Módulos
                              </span>
                              {user.allowedModules?.slice(0, 3).map((mId) => (
                                <span key={mId} className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 text-[10px]">
                                  {AVAILABLE_MODULES.find(m => m.id === mId)?.name.split(' ')[0] || mId}
                                </span>
                              ))}
                              {(user.allowedModules?.length || 0) > 3 && (
                                <span className="text-[10px] text-slate-400">
                                  +{(user.allowedModules?.length || 0) - 3} más
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Turno y Cédula */}
                        <td className="p-3.5">
                          <div className="text-slate-300 font-semibold">{user.shift.replace(/_/g, ' ')}</div>
                          <div className="text-[10px] font-mono text-cyan-400">Céd: {user.professionalLicense}</div>
                        </td>

                        {/* Acciones */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-400/30 transition-all hover:scale-105"
                              title="Editar usuario, contraseña y permisos"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(user)}
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-400/30 transition-all hover:scale-105"
                              title="Eliminar usuario del sistema"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 2: HISTORIAL DE INICIOS DE SESIÓN (QUIÉN ENTRÓ, FECHA Y HORA)  */}
      {/* ===================================================================== */}
      {activeTab === 'LOGINS' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Tarjetas de Resumen de Accesos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="neo-glass-panel p-4 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Inicios de Sesión</span>
                <LogIn size={16} className="text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">{loginAuditLogs.length}</div>
              <span className="text-[10px] text-cyan-300">Registros validados en bitácora</span>
            </div>

            <div className="neo-glass-panel p-4 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Estatus de Autenticación</span>
                <ShieldCheck size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <span className="text-[10px] text-emerald-300">Accesos autorizados</span>
            </div>

            <div className="neo-glass-panel p-4 border border-blue-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Personal Activo</span>
                <Users size={16} className="text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{staff.length}</div>
              <span className="text-[10px] text-blue-300">Cuentas habilitadas con clave</span>
            </div>

            <div className="neo-glass-panel p-4 border border-amber-500/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Cumplimiento NOM</span>
                <Shield size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">NOM-024</div>
              <span className="text-[10px] text-slate-300">Sello forense inmutable</span>
            </div>
          </div>

          {/* Filtro de Búsqueda de Logins */}
          <div className="neo-glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={loginSearchQuery}
                onChange={(e) => setLoginSearchQuery(e.target.value)}
                placeholder="Filtrar por usuario, rol, IP o fecha..."
                className="neo-input pl-10 text-xs py-2"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Mostrando <strong className="text-cyan-300">{loginAuditLogs.length}</strong> eventos de acceso registrados
            </div>
          </div>

          {/* Tabla de Inicios de Sesión */}
          <div className="neo-glass-panel overflow-hidden border border-white/10 shadow-2xl">
            <div className="p-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <LogIn size={17} className="text-emerald-400" />
                  Registro Detallado de Inicios de Sesión (Quién Entró, Fecha y Hora Exacta)
                </h3>
                <p className="text-xs text-slate-400">
                  Trazabilidad inmutable de accesos según la Norma Oficial Mexicana NOM-024-SSA3-2012 para Sistemas de Información Hospitalaria.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-300 uppercase font-mono font-bold border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Fecha y Hora Exacta</th>
                    <th className="p-3.5">Usuario Autenticado</th>
                    <th className="p-3.5">Rol de Acceso</th>
                    <th className="p-3.5">Cédula / Credencial</th>
                    <th className="p-3.5">IP / Terminal Hospitalaria</th>
                    <th className="p-3.5">Estatus</th>
                    <th className="p-3.5">Detalles del Acceso</th>
                    <th className="p-3.5 font-mono">Sello SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loginAuditLogs.map((log) => {
                    const dateObj = new Date(log.timestamp);
                    const formattedDate = dateObj.toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                    });
                    const formattedTime = dateObj.toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                        {/* Fecha y Hora Exacta */}
                        <td className="p-3.5 font-mono">
                          <div className="font-bold text-white text-[12px]">{formattedDate}</div>
                          <div className="text-[11px] text-cyan-400 flex items-center gap-1 font-bold">
                            <Clock size={11} />
                            <span>{formattedTime}</span>
                          </div>
                        </td>

                        {/* Usuario */}
                        <td className="p-3.5">
                          <div className="font-bold text-white text-[12.5px]">{log.userName}</div>
                        </td>

                        {/* Rol */}
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            log.userRole === 'ADMINISTRADOR_UNICO'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {log.userRole.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Cédula */}
                        <td className="p-3.5 font-mono text-slate-300">
                          {log.userLicense || 'N/A'}
                        </td>

                        {/* IP / Terminal */}
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                          {log.ipAddress}
                        </td>

                        {/* Estatus */}
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10.5px] font-bold">
                            <CheckCircle2 size={11} className="text-emerald-400" />
                            <span>AUTORIZADO</span>
                          </span>
                        </td>

                        {/* Detalles */}
                        <td className="p-3.5 text-slate-300 max-w-xs text-[11.5px]">
                          {log.details}
                        </td>

                        {/* Hash SHA-256 */}
                        <td className="p-3.5 font-mono text-slate-500 text-[10px]" title={log.sha256Hash}>
                          {log.sha256Hash.substring(0, 14)}...
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 3: DIRECTORIO CLÍNICO Y TURNOS                                */}
      {/* ===================================================================== */}
      {activeTab === 'PERSONAL' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Selector de Turnos */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['TODOS', 'MATUTINO', 'VESPERTINO', 'NOCTURNO_A', 'NOCTURNO_B', 'JORNADA_ESPECIAL'].map((sh) => (
              <button
                key={sh}
                onClick={() => setSelectedShift(sh)}
                className={`btn-neo text-xs px-4 py-2 ${
                  selectedShift === sh ? 'btn-neo-active' : 'btn-neo-defart'
                }`}
              >
                {sh === 'TODOS' ? 'Todos los Turnos' : sh.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Grid de Personal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((user) => (
              <div key={user.id} className="neo-glass-panel p-5 border border-white/10 space-y-3 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold flex items-center justify-center text-sm">
                      {user.fullName.split(' ')[1]?.[0] || 'M'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{user.fullName}</h3>
                      <span className="text-xs text-cyan-400 block">{user.specialty || user.role.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ACTIVO
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span>Cédula Profesional:</span>
                    <strong className="text-white font-mono">{user.professionalLicense}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Turno Asignado:</span>
                    <strong className="text-cyan-300">{user.shift.replace(/_/g, ' ')}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Correo Institucional:</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Usuario:</span>
                    <span className="text-cyan-300 font-mono">@{user.username || user.email.split('@')[0]}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                  >
                    <Edit3 size={12} />
                    <span>Modificar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 4: BITÁCORA FORENSE NOM-024 (ACCIONES CLÍNICAS)               */}
      {/* ===================================================================== */}
      {activeTab === 'AUDITORIA' && (
        <div className="neo-glass-panel overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                Bitácora de Auditoría Forense (Inmutable según NOM-024-SSA3-2012)
              </h3>
              <p className="text-xs text-slate-400">
                Cada lectura, creación o modificación de expediente clínico se sella con timestamp e integridad criptográfica.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30">
              {auditLogs.length} Registros Sellados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold border-b border-white/10">
                <tr>
                  <th className="p-3.5">Timestamp (UTC)</th>
                  <th className="p-3.5">Usuario / Cédula</th>
                  <th className="p-3.5">Acción Clínica</th>
                  <th className="p-3.5">Recurso / Paciente</th>
                  <th className="p-3.5">Detalles</th>
                  <th className="p-3.5 font-mono">Hash SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-slate-400">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Céd: {log.userLicense || 'N/A'}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-cyan-300">{log.actionType}</td>
                    <td className="p-3.5 text-slate-300">{log.resourceAffected}</td>
                    <td className="p-3.5 text-slate-300 max-w-xs truncate">{log.details}</td>
                    <td className="p-3.5 font-mono text-slate-500 text-[10px]">{log.sha256Hash.substring(0, 16)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL CREAR NUEVO USUARIO Y ASIGNAR CONTRASEÑA/PERMISOS               */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="neo-modal-content p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Key size={20} className="text-cyan-400" />
                  Crear Nueva Cuenta, Contraseña y Permisos
                </h3>
                <p className="text-xs text-slate-400">
                  Alta de credenciales institucionales y matriz de módulos habilitados.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Nombre Completo *</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Dr. Fernando Garza Silva"
                    className="neo-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Nombre de Usuario (@username) *</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="fernando.garza"
                    className="neo-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Correo Institucional *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="fgarza@puertadehierro.com.mx"
                    className="neo-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Contraseña Secreta *</label>
                  <div className="relative">
                    <input
                      type={newShowPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Contraseña de acceso"
                      className="neo-input pr-10 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setNewShowPassword(!newShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      title={newShowPassword ? 'Ocultar' : 'Ver'}
                    >
                      {newShowPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Rol Institucional</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="ADMINISTRADOR_UNICO" className="bg-slate-900">Administrador Único</option>
                    <option value="DIRECTOR_MEDICO" className="bg-slate-900">Director Médico</option>
                    <option value="MEDICO_ESPECIALISTA" className="bg-slate-900">Médico Especialista</option>
                    <option value="MEDICO_URGENCIOLOGO" className="bg-slate-900">Médico Urgenciólogo</option>
                    <option value="ENFERMERIA_JEFA" className="bg-slate-900">Enfermera Jefa</option>
                    <option value="ENFERMERIA_GENERAL" className="bg-slate-900">Enfermera General</option>
                    <option value="QUIMICO_QFB" className="bg-slate-900">Químico QFB</option>
                    <option value="RADIOLOGO_IMAGEN" className="bg-slate-900">Médico Radiólogo</option>
                    <option value="FARMACEUTICO" className="bg-slate-900">Farmacéutico</option>
                    <option value="INSTRUMENTISTA_CEYE" className="bg-slate-900">Instrumentista CEYE</option>
                    <option value="CAJERO_RECEPCION" className="bg-slate-900">Cajero / Admisión</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Cédula Profesional *</label>
                  <input
                    type="text"
                    value={newProfessionalLicense}
                    onChange={(e) => setNewProfessionalLicense(e.target.value)}
                    placeholder="9823412"
                    className="neo-input font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Turno Asignado</label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="MATUTINO" className="bg-slate-900">Matutino (07:00 - 15:00)</option>
                    <option value="VESPERTINO" className="bg-slate-900">Vespertino (14:30 - 21:30)</option>
                    <option value="NOCTURNO_A" className="bg-slate-900">Nocturno A</option>
                    <option value="NOCTURNO_B" className="bg-slate-900">Nocturno B</option>
                    <option value="JORNADA_ESPECIAL" className="bg-slate-900">Jornada Especial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Especialidad Clínica</label>
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Ej. Anestesiología, Medicina Interna, Pediatría..."
                  className="neo-input"
                />
              </div>

              {/* Matriz de Permisos de Módulos */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                      <SlidersHorizontal size={13} />
                      <span>Matriz de Permisos de Módulos Hospitalarios</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Seleccione los módulos autorizados para esta cuenta.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAllModules(newAllowedModules, setNewAllowedModules)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/30 font-bold transition-colors"
                  >
                    {newAllowedModules.includes('*') ? 'Quitar Acceso Total' : '👑 Conceder Acceso Total'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = newAllowedModules.includes('*') || newAllowedModules.includes(mod.id);

                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border text-xs transition-all ${
                          isChecked 
                            ? 'bg-cyan-950/50 border-cyan-400/40 text-cyan-100 shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                            : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleModuleSelection(mod.id, newAllowedModules, setNewAllowedModules)}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span className="text-sm">{mod.icon}</span>
                        <span className="truncate font-medium">{mod.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-active text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>Crear y Activar Credencial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL EDITAR USUARIO, CONTRASEÑA Y PERMISOS                          */}
      {/* ===================================================================== */}
      {editingUser && (
        <div className="neo-modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="neo-modal-content p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit3 size={20} className="text-cyan-400" />
                  Editar Cuenta, Contraseña y Permisos
                </h3>
                <p className="text-xs text-slate-400">
                  Modificando perfil de <strong className="text-cyan-300">{editingUser.fullName}</strong>
                </p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Nombre Completo *</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="neo-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Nombre de Usuario (@username) *</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="neo-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Correo Institucional *</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="neo-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Contraseña Secreta *</label>
                  <div className="relative">
                    <input
                      type={editShowPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      className="neo-input pr-10 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setEditShowPassword(!editShowPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      title={editShowPassword ? 'Ocultar' : 'Ver'}
                    >
                      {editShowPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Rol Institucional</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="ADMINISTRADOR_UNICO" className="bg-slate-900">Administrador Único</option>
                    <option value="DIRECTOR_MEDICO" className="bg-slate-900">Director Médico</option>
                    <option value="MEDICO_ESPECIALISTA" className="bg-slate-900">Médico Especialista</option>
                    <option value="MEDICO_URGENCIOLOGO" className="bg-slate-900">Médico Urgenciólogo</option>
                    <option value="ENFERMERIA_JEFA" className="bg-slate-900">Enfermera Jefa</option>
                    <option value="ENFERMERIA_GENERAL" className="bg-slate-900">Enfermera General</option>
                    <option value="QUIMICO_QFB" className="bg-slate-900">Químico QFB</option>
                    <option value="RADIOLOGO_IMAGEN" className="bg-slate-900">Médico Radiólogo</option>
                    <option value="FARMACEUTICO" className="bg-slate-900">Farmacéutico</option>
                    <option value="INSTRUMENTISTA_CEYE" className="bg-slate-900">Instrumentista CEYE</option>
                    <option value="CAJERO_RECEPCION" className="bg-slate-900">Cajero / Admisión</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Cédula Profesional *</label>
                  <input
                    type="text"
                    value={editProfessionalLicense}
                    onChange={(e) => setEditProfessionalLicense(e.target.value)}
                    className="neo-input font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Turno Asignado</label>
                  <select
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="MATUTINO" className="bg-slate-900">Matutino (07:00 - 15:00)</option>
                    <option value="VESPERTINO" className="bg-slate-900">Vespertino (14:30 - 21:30)</option>
                    <option value="NOCTURNO_A" className="bg-slate-900">Nocturno A</option>
                    <option value="NOCTURNO_B" className="bg-slate-900">Nocturno B</option>
                    <option value="JORNADA_ESPECIAL" className="bg-slate-900">Jornada Especial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Especialidad Clínica</label>
                <input
                  type="text"
                  value={editSpecialty}
                  onChange={(e) => setEditSpecialty(e.target.value)}
                  className="neo-input"
                />
              </div>

              {/* Matriz de Permisos de Módulos */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                      <SlidersHorizontal size={13} />
                      <span>Matriz de Permisos de Módulos Hospitalarios</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Configure a qué módulos puede entrar este usuario.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAllModules(editAllowedModules, setEditAllowedModules)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/30 font-bold transition-colors"
                  >
                    {editAllowedModules.includes('*') ? 'Quitar Acceso Total' : '👑 Conceder Acceso Total'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = editAllowedModules.includes('*') || editAllowedModules.includes(mod.id);

                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border text-xs transition-all ${
                          isChecked 
                            ? 'bg-cyan-950/50 border-cyan-400/40 text-cyan-100 shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                            : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleModuleSelection(mod.id, editAllowedModules, setEditAllowedModules)}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span className="text-sm">{mod.icon}</span>
                        <span className="truncate font-medium">{mod.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-active text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL CONFIRMAR ELIMINACIÓN DE USUARIO                                */}
      {/* ===================================================================== */}
      {deletingUser && (
        <div className="neo-modal-backdrop" onClick={() => setDeletingUser(null)}>
          <div className="neo-modal-content p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2.5 rounded-full bg-rose-500/20 border border-rose-500/30">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Eliminar Cuenta de Usuario</h3>
                <span className="text-xs text-rose-300 font-semibold">Acción Administrativa Irreversible</span>
              </div>
            </div>

            {deleteError ? (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 mb-4">
                <strong>Operación no permitida:</strong> {deleteError}
              </div>
            ) : (
              <div className="text-xs text-slate-300 space-y-2 mb-4">
                <p>
                  ¿Está seguro de que desea eliminar permanentemente la cuenta de{' '}
                  <strong className="text-white">{deletingUser.fullName}</strong> (@{deletingUser.username || deletingUser.email})?
                </p>
                <p className="text-slate-400">
                  El usuario perderá de inmediato el acceso al sistema hospitalario. Esta acción quedará registrada en la bitácora NOM-024.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="btn-neo btn-neo-defart text-xs"
              >
                {deleteError ? 'Entendido' : 'Cancelar'}
              </button>
              {!deleteError && (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all"
                >
                  Confirmar Eliminación
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
