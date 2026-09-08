// ==============================================================================
// MÓDULO DE PERSONAL, TURNOS Y AUDITORÍA INMUTABLE NOM-024-SSA3-2012
// Hospital Puerta de Hierro (Tepic) - RBAC y Matriz de Permisos
// ==============================================================================

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  ShieldCheck, 
  Lock, 
  Clock, 
  FileText, 
  Key, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, AuditLog } from '../../types/hospital';
import { logAuditAction } from '../../lib/supabaseClient';

interface PersonalTurnosModuleProps {
  staff: UserProfile[];
  auditLogs: AuditLog[];
  onAddUser: (user: UserProfile) => void;
}

export const PersonalTurnosModule: React.FC<PersonalTurnosModuleProps> = ({
  staff,
  auditLogs,
  onAddUser,
}) => {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'AUDITORIA'>('PERSONAL');
  const [selectedShift, setSelectedShift] = useState<string>('TODOS');
  const [showAddModal, setShowAddModal] = useState(false);

  // Formulario nuevo usuario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('MEDICO_ESPECIALISTA');
  const [professionalLicense, setProfessionalLicense] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [shift, setShift] = useState<UserProfile['shift']>('MATUTINO');
  const [phone, setPhone] = useState('311-129-5200');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      email,
      fullName,
      role,
      professionalLicense,
      specialty,
      shift,
      phone,
      isActive: true,
    };

    onAddUser(newUser);

    logAuditAction({
      userName: 'Dr. Carlos Mendoza Alatorre',
      userRole: 'DIRECTOR_MEDICO',
      actionType: 'CREACION_USUARIO_PERSONAL',
      resourceAffected: `Usuario ${fullName}`,
      details: `Rol ${role} asignado al turno ${shift} con cédula ${professionalLicense}`,
    });

    setShowAddModal(false);
    setFullName('');
    setEmail('');
    setProfessionalLicense('');
    setSpecialty('');
  };

  const filteredStaff = staff.filter(s => {
    if (selectedShift === 'TODOS') return true;
    return s.shift === selectedShift;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
              <span className="neo-badge-dot" style={{ background: '#3b82f6' }}></span>
              GESTIÓN DE TALENTO CLÍNICO Y TURNOS
            </span>
            <span className="text-xs text-slate-400 font-mono">NOM-024 REGISTRO DE AUDITORÍA</span>
          </div>
          <h2 className="text-2xl font-black text-white">Personal, Roles y Bitácora Forense</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Administración de accesos por turnos, cédulas profesionales y trazabilidad de acciones clínicas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="neo-action-bar">
            <button
              onClick={() => setActiveTab('PERSONAL')}
              className={`btn-neo text-xs px-4 py-1.5 ${
                activeTab === 'PERSONAL' ? 'btn-neo-active' : 'text-slate-400'
              }`}
            >
              Directorio y Turnos
            </button>
            <button
              onClick={() => setActiveTab('AUDITORIA')}
              className={`btn-neo text-xs px-4 py-1.5 ${
                activeTab === 'AUDITORIA' ? 'btn-neo-active' : 'text-slate-400'
              }`}
            >
              Bitácora NOM-024
            </button>
          </div>

          {activeTab === 'PERSONAL' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-neo btn-neo-active text-xs"
            >
              <Plus size={16} />
              Registrar Empleado
            </button>
          )}
        </div>
      </div>

      {activeTab === 'PERSONAL' && (
        <div className="space-y-4">
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
              <div key={user.id} className="neo-glass-panel p-5 border border-white/10 space-y-3">
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

                <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-white/5">
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
                    <span className="text-slate-300">{user.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bitácora de Auditoría NOM-024 */}
      {activeTab === 'AUDITORIA' && (
        <div className="neo-glass-panel overflow-hidden">
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

      {/* Modal Nuevo Empleado */}
      {showAddModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="neo-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white">Registrar Personal Clínico</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Nombre Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dra. Mariana Ortega Peña"
                  className="neo-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@puertadehierro.com.mx"
                    className="neo-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Cédula Profesional (NOM-004)</label>
                  <input
                    type="text"
                    value={professionalLicense}
                    onChange={(e) => setProfessionalLicense(e.target.value)}
                    placeholder="1234567"
                    className="neo-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Rol Institucional</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="DIRECTOR_MEDICO" className="bg-slate-900">Director Médico</option>
                    <option value="MEDICO_ESPECIALISTA" className="bg-slate-900">Médico Especialista</option>
                    <option value="MEDICO_URGENCIOLOGO" className="bg-slate-900">Médico Urgenciólogo</option>
                    <option value="ENFERMERIA_JEFA" className="bg-slate-900">Enfermera Jefa</option>
                    <option value="ENFERMERIA_GENERAL" className="bg-slate-900">Enfermera General</option>
                    <option value="QUIMICO_QFB" className="bg-slate-900">Químico Fármaco Biólogo (QFB)</option>
                    <option value="RADIOLOGO_IMAGEN" className="bg-slate-900">Médico Radiólogo</option>
                    <option value="FARMACEUTICO" className="bg-slate-900">Farmacéutico Hospitalario</option>
                    <option value="INSTRUMENTISTA_CEYE" className="bg-slate-900">Instrumentista CEYE</option>
                    <option value="CAJERO_RECEPCION" className="bg-slate-900">Cajero / Admisión</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Turno Asignado</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="MATUTINO" className="bg-slate-900">Matutino (07:00 - 15:00)</option>
                    <option value="VESPERTINO" className="bg-slate-900">Vespertino (14:30 - 21:30)</option>
                    <option value="NOCTURNO_A" className="bg-slate-900">Nocturno A (Tercias)</option>
                    <option value="NOCTURNO_B" className="bg-slate-900">Nocturno B (Tercias)</option>
                    <option value="JORNADA_ESPECIAL" className="bg-slate-900">Jornada Especial / Fines de Semana</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Especialidad Clínica</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Cardiología, Traumatología, Cirugía General, Urgencias..."
                  className="neo-input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-active text-xs"
                >
                  Guardar y Activar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
