// ==============================================================================
// MÓDULO DE ADMISIÓN HOSPITALARIA PROGRAMADA (CIRUGÍAS, HEMODINAMIA, ELECTIVAS)
// Hospital Puerta de Hierro (Tepic) - Pacientes Programados
// ==============================================================================

import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  Clock, 
  UserCheck, 
  CheckSquare, 
  FileSpreadsheet, 
  Activity, 
  ShieldCheck, 
  FileText,
  Bed,
  CheckCircle2,
  Calendar,
  UserPlus,
  X
} from 'lucide-react';
import { Patient, ScheduledAdmission, BedArea } from '../../types/hospital';
import { logAuditAction } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

interface ScheduledAdmissionsModuleProps {
  patients: Patient[];
  scheduledList: ScheduledAdmission[];
  onAddScheduled: (admission: ScheduledAdmission) => void;
  onUpdateStatus: (id: string, status: ScheduledAdmission['status']) => void;
  onAddPatient: (patient: Patient) => void;
}

export const ScheduledAdmissionsModule: React.FC<ScheduledAdmissionsModuleProps> = ({
  patients,
  scheduledList,
  onAddScheduled,
  onUpdateStatus,
  onAddPatient,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [patientSaved, setPatientSaved] = useState(false);

  // Formulario Nuevo Paciente
  const [npFirstName, setNpFirstName]     = useState('');
  const [npLastName, setNpLastName]       = useState('');
  const [npBirthDate, setNpBirthDate]     = useState('');
  const [npGender, setNpGender]           = useState<Patient['gender']>('MASCULINO');
  const [npCurp, setNpCurp]               = useState('');
  const [npRfc, setNpRfc]                 = useState('');
  const [npPhone, setNpPhone]             = useState('');
  const [npOriginario, setNpOriginario]   = useState('');
  const [npAddress, setNpAddress]         = useState('');
  const [npBloodType, setNpBloodType]     = useState<Patient['bloodType']>('O+');
  const [npAllergies, setNpAllergies]     = useState('Ninguna conocida');
  const [npInsurance, setNpInsurance]     = useState('Particular');
  const [npEcName, setNpEcName]           = useState('');
  const [npEcPhone, setNpEcPhone]         = useState('');

  // Formulario
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [admissionType, setAdmissionType] = useState<ScheduledAdmission['admissionType']>('CIRUGIA_PROGRAMADA');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [procedureName, setProcedureName] = useState('');
  const [physician, setPhysician] = useState('Dr. Fernando Covarrubias (Cirujano)');
  const [bedArea, setBedArea] = useState<BedArea>('PISO_2_QUIRURGICO');
  const [bedNumber, setBedNumber] = useState('P2-204');
  const [operatingRoom, setOperatingRoom] = useState('Quirófano 02');
  const [preanesthetic, setPreanesthetic] = useState(true);
  const [fasting, setFasting] = useState(true);
  const [consent, setConsent] = useState(true);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newAdmission: ScheduledAdmission = {
      id: 'sch-' + Date.now(),
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientNumber: patient.patientNumber,
      admissionType,
      scheduledDate,
      scheduledTime,
      procedureName,
      attendingPhysician: physician,
      reservedBedArea: bedArea,
      reservedBedNumber: bedNumber,
      operatingRoomNumber: operatingRoom,
      preanestheticEvaluationCompleted: preanesthetic,
      fastingConfirmed: fasting,
      consentFormSigned: consent,
      estimatedDurationHours: 2.5,
      status: 'PROGRAMADO',
      notes,
      createdAt: new Date().toISOString(),
    };

    onAddScheduled(newAdmission);

    logAuditAction({
      userName: physician,
      userRole: 'MEDICO_ESPECIALISTA',
      actionType: 'ADMISIÓN_HOSPITALARIA_PROGRAMADA',
      resourceAffected: `Expediente ${patient.patientNumber}`,
      details: `Programado para ${procedureName} el ${scheduledDate} a las ${scheduledTime} en ${operatingRoom}. Cama reservada ${bedNumber}.`,
    });

    setShowModal(false);
    setProcedureName('');
    setNotes('');
  };

  // Guardar nuevo paciente
  const handleSaveNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const year = now.getFullYear();
    const seq  = String(patients.length + 1).padStart(4, '0');
    const newPatient: Patient = {
      id: 'pat-' + Date.now(),
      patientNumber: `HPDH-${year}-${seq}`,
      firstName: npFirstName.trim(),
      lastName:  npLastName.trim(),
      birthDate: npBirthDate,
      gender:    npGender,
      curp:      npCurp.trim().toUpperCase(),
      rfc:       npRfc.trim().toUpperCase() || undefined,
      phone:     npPhone.trim() || undefined,
      originario: npOriginario.trim() || undefined,
      address:   npAddress.trim() || undefined,
      bloodType: npBloodType,
      allergies: npAllergies.trim(),
      weightKg:  70,
      heightCm:  170,
      emergencyContactName:  npEcName.trim(),
      emergencyContactPhone: npEcPhone.trim(),
      insuranceCompany: npInsurance,
      createdAt: now.toISOString(),
    };
    onAddPatient(newPatient);
    setPatientSaved(true);
    setTimeout(() => {
      setPatientSaved(false);
      setShowNewPatientModal(false);
      // Reset
      setNpFirstName(''); setNpLastName(''); setNpBirthDate('');
      setNpCurp(''); setNpRfc(''); setNpPhone('');
      setNpOriginario(''); setNpAddress('');
      setNpEcName(''); setNpEcPhone('');
      setNpAllergies('Ninguna conocida');
    }, 1200);
  };

  const exportScheduledExcel = () => {
    const data = scheduledList.map(s => ({
      'Folio Paciente': s.patientNumber,
      'Paciente': s.patientName,
      'Tipo Admisión': s.admissionType.replace('_', ' '),
      'Procedimiento': s.procedureName,
      'Fecha': s.scheduledDate,
      'Hora': s.scheduledTime,
      'Médico Tratante': s.attendingPhysician,
      'Área Reservada': s.reservedBedArea.replace(/_/g, ' '),
      'Cama': s.reservedBedNumber || 'Por asignar',
      'Quirófano / Sala': s.operatingRoomNumber || 'N/A',
      'Valoración Preanestésica': s.preanestheticEvaluationCompleted ? 'SÍ' : 'NO',
      'Ayuno Confirmado': s.fastingConfirmed ? 'SÍ' : 'NO',
      'Consentimiento Firmado': s.consentFormSigned ? 'SÍ' : 'NO',
      'Estado': s.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Admisiones Programadas');
    XLSX.writeFile(workbook, `Admisiones_Programadas_Puerta_de_Hierro_${Date.now()}.xlsx`);
  };

  const filtered = scheduledList.filter(s => {
    if (filterType === 'TODOS') return true;
    return s.admissionType === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#22d3ee' }}>
              <span className="neo-badge-dot" style={{ background: '#06b6d4' }}></span>
              PROGRAMACIÓN QUIRÚRGICA Y ELECTIVA
            </span>
            <span className="text-xs text-slate-400 font-mono">GESTIÓN DE INGRESOS PLANEADOS</span>
          </div>
          <h2 className="text-2xl font-black text-white">Admisión Hospitalaria Programada</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Control de pacientes con cirugías electivas, hemodinamia o consultas de internamiento planeado.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={exportScheduledExcel}
            className="btn-neo btn-neo-defart text-xs"
          >
            <FileSpreadsheet size={16} />
            Exportar Agenda (.xlsx)
          </button>
          <button 
            onClick={() => setShowNewPatientModal(true)}
            className="btn-neo text-xs"
            style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)', color: '#34d399' }}
          >
            <UserPlus size={16} />
            Nuevo Paciente
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-neo btn-neo-active text-xs"
          >
            <Plus size={16} />
            Programar Paciente
          </button>
        </div>
      </div>

      {/* ===== MODAL NUEVO PACIENTE ===== */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="neo-glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <UserPlus size={20} className="text-emerald-400" />
                  Alta de Nuevo Paciente
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Registro inicial en el directorio hospitalario</p>
              </div>
              <button onClick={() => setShowNewPatientModal(false)} className="text-slate-400 hover:text-white transition-colors p-1 bg-transparent border-none" style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>

            {patientSaved && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-2 text-emerald-300 text-sm">
                <CheckCircle2 size={18} /> Paciente registrado exitosamente
              </div>
            )}

            <form onSubmit={handleSaveNewPatient} className="space-y-4">
              {/* Nombre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombre(s) *</label>
                  <input required value={npFirstName} onChange={e => setNpFirstName(e.target.value)}
                    className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm"
                    placeholder="Ej: Roberto"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Apellidos *</label>
                  <input required value={npLastName} onChange={e => setNpLastName(e.target.value)}
                    className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm"
                    placeholder="Ej: González Parra"
                  />
                </div>
              </div>

              {/* Fecha nacimiento y Género */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha de Nacimiento *</label>
                  <input required type="date" value={npBirthDate} onChange={e => setNpBirthDate(e.target.value)}
                    className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Género</label>
                  <select value={npGender} onChange={e => setNpGender(e.target.value as Patient['gender'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm">
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              {/* CURP y RFC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">CURP *</label>
                  <input required value={npCurp} onChange={e => setNpCurp(e.target.value.toUpperCase())}
                    maxLength={18}
                    className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm font-mono uppercase"
                    placeholder="GOPR850312HNLNRB09"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">RFC <span className="text-slate-500">(opcional)</span></label>
                  <input value={npRfc} onChange={e => setNpRfc(e.target.value.toUpperCase())}
                    maxLength={13}
                    className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm font-mono uppercase"
                    placeholder="GOPR850312XXX"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono de Contacto</label>
                <input type="tel" value={npPhone} onChange={e => setNpPhone(e.target.value)}
                  className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm"
                  placeholder="311 XXX XXXX"
                />
              </div>

              {/* Originario y Domicilio */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Originario de <span className="text-slate-500">(ciudad / estado)</span></label>
                <input value={npOriginario} onChange={e => setNpOriginario(e.target.value)}
                  className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm"
                  placeholder="Ej: Tepic, Nayarit"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Domicilio Actual</label>
                <textarea value={npAddress} onChange={e => setNpAddress(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm resize-none"
                  placeholder="Calle, Número, Colonia, Ciudad, CP"
                />
              </div>

              {/* Sangre y Seguro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Sangre</label>
                  <select value={npBloodType} onChange={e => setNpBloodType(e.target.value as Patient['bloodType'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm">
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Aseguradora / Servicio</label>
                  <select value={npInsurance} onChange={e => setNpInsurance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm">
                    {['Particular','IMSS','ISSSTE','GNP','AXA','MetLife','Mapfre','HDI'].map(ins => <option key={ins} value={ins}>{ins}</option>)}
                  </select>
                </div>
              </div>

              {/* Alergias */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Alergias conocidas</label>
                <input value={npAllergies} onChange={e => setNpAllergies(e.target.value)}
                  className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm"
                  placeholder="Ninguna conocida / Penicilina..."
                />
              </div>

              {/* Contacto de emergencia */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-600/30 space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contacto de Emergencia</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                    <input required value={npEcName} onChange={e => setNpEcName(e.target.value)}
                      className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-600/40 text-white text-sm"
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Teléfono *</label>
                    <input required type="tel" value={npEcPhone} onChange={e => setNpEcPhone(e.target.value)}
                      className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-600/40 text-white text-sm"
                      placeholder="311 XXX XXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewPatientModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-600/40 text-slate-300 text-sm hover:bg-slate-700/40 transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                  <CheckCircle2 size={16} className="inline mr-1.5" />
                  Registrar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tarjetas de Resumen de Protocolo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neo-glass-panel p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Total Programados</span>
            <span className="text-xl font-bold text-white">{scheduledList.length} Pacientes</span>
          </div>
        </div>

        <div className="neo-glass-panel p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Consentimientos y Ayuno</span>
            <span className="text-xl font-bold text-emerald-400">
              {scheduledList.filter(s => s.consentFormSigned && s.fastingConfirmed).length} Listos
            </span>
          </div>
        </div>

        <div className="neo-glass-panel p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Bed size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Camas y Quirófanos Asignados</span>
            <span className="text-xl font-bold text-blue-400">
              {scheduledList.filter(s => s.reservedBedNumber).length} Reservados
            </span>
          </div>
        </div>
      </div>

      {/* Filtros por tipo de admisión */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['TODOS', 'CIRUGIA_PROGRAMADA', 'HEMODINAMIA', 'INTERNAMIENTO_ELECTIVO', 'VALORACION_ESPECIAL'].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFilterType(tipo)}
            className={`btn-neo text-xs px-4 py-2 ${
              filterType === tipo ? 'btn-neo-active' : 'btn-neo-defart'
            }`}
          >
            {tipo === 'TODOS' ? 'Todos los Procedimientos' : tipo.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Lista de Admisiones Programadas */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div 
            key={item.id}
            className="neo-glass-panel p-5 border-l-4 transition-all hover:translate-x-1"
            style={{
              borderLeftColor: item.admissionType === 'HEMODINAMIA' ? '#06b6d4' : item.admissionType === 'CIRUGIA_PROGRAMADA' ? '#2563eb' : '#10b981'
            }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {item.admissionType.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {item.patientName}
                  </h3>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                    Exp: {item.patientNumber}
                  </span>
                </div>

                <div className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                  <span>🔬 {item.procedureName}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 text-white">
                    <Clock size={14} className="text-amber-400" />
                    {item.scheduledDate} a las {item.scheduledTime} hrs
                  </span>
                  <span>👨‍⚕️ {item.attendingPhysician}</span>
                  <span>🏥 {item.reservedBedNumber || item.reservedBedArea}</span>
                  <span>🚪 {item.operatingRoomNumber}</span>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 italic">
                    Notas: {item.notes}
                  </p>
                )}
              </div>

              {/* Protocolo Preoperatorio Checkmarks */}
              <div className="flex flex-col gap-1.5 bg-slate-900/60 p-3 rounded-2xl border border-white/5 shrink-0 text-xs">
                <div className="flex items-center gap-2">
                  <span className={item.preanestheticEvaluationCompleted ? 'text-emerald-400' : 'text-slate-500'}>
                    {item.preanestheticEvaluationCompleted ? '✓' : '○'} Valoración Preanestésica
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={item.fastingConfirmed ? 'text-emerald-400' : 'text-slate-500'}>
                    {item.fastingConfirmed ? '✓' : '○'} Horas de Ayuno Verificadas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={item.consentFormSigned ? 'text-emerald-400' : 'text-slate-500'}>
                    {item.consentFormSigned ? '✓' : '○'} Consentimiento Informado Firmado
                  </span>
                </div>
              </div>

              {/* Estatus y Botones de Flujo */}
              <div className="flex items-center gap-2 shrink-0">
                {item.status === 'PROGRAMADO' && (
                  <button
                    onClick={() => onUpdateStatus(item.id, 'EN_PREOPERATORIO')}
                    className="btn-neo btn-neo-active text-xs"
                  >
                    Ingresar a Preoperatorio
                  </button>
                )}

                {item.status === 'EN_PREOPERATORIO' && (
                  <button
                    onClick={() => onUpdateStatus(item.id, 'EN_QUIROFANO')}
                    className="btn-neo btn-neo-cyan text-xs"
                  >
                    Pasar a Quirófano
                  </button>
                )}

                {item.status === 'EN_QUIROFANO' && (
                  <button
                    onClick={() => onUpdateStatus(item.id, 'HOSPITALIZADO')}
                    className="btn-neo btn-neo-success text-xs"
                  >
                    Pase a Hospitalización
                  </button>
                )}

                {item.status === 'HOSPITALIZADO' && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={16} /> En Cama Hospitalaria
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Programar Paciente */}
      {showModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="neo-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-white">Programar Admisión Hospitalaria</h3>
                <p className="text-xs text-slate-400">Cirugía electiva, hemodinamia o internamiento planeado</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Paciente</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="neo-input neo-select"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.patientNumber} - {p.firstName} {p.lastName} (Peso: {p.weightKg}kg, Talla: {p.heightCm}cm)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Tipo de Procedimiento</label>
                  <select
                    value={admissionType}
                    onChange={(e) => setAdmissionType(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="CIRUGIA_PROGRAMADA" className="bg-slate-900">Cirugía Programada</option>
                    <option value="HEMODINAMIA" className="bg-slate-900">Cateterismo / Hemodinamia</option>
                    <option value="INTERNAMIENTO_ELECTIVO" className="bg-slate-900">Internamiento Electivo</option>
                    <option value="VALORACION_ESPECIAL" className="bg-slate-900">Consulta / Valoración Especial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Nombre del Procedimiento</label>
                  <input
                    type="text"
                    value={procedureName}
                    onChange={(e) => setProcedureName(e.target.value)}
                    placeholder="Ej. Colecistectomía Laparoscópica"
                    className="neo-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Fecha Programada</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="neo-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Hora de Entrada</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="neo-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Médico Tratante</label>
                  <input
                    type="text"
                    value={physician}
                    onChange={(e) => setPhysician(e.target.value)}
                    className="neo-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Cama Reservada</label>
                  <input
                    type="text"
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    placeholder="P2-204"
                    className="neo-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Quirófano / Sala</label>
                  <input
                    type="text"
                    value={operatingRoom}
                    onChange={(e) => setOperatingRoom(e.target.value)}
                    placeholder="Quirófano 02"
                    className="neo-input"
                    required
                  />
                </div>
              </div>

              {/* Protocolo de Seguridad (Checkboxes) */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-300 block mb-2">Protocolo Preoperatorio Obligatorio:</span>
                <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preanesthetic}
                    onChange={(e) => setPreanesthetic(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  Valoración Preanestésica Completada y Aprobada
                </label>
                <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fasting}
                    onChange={(e) => setFasting(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  Horas de Ayuno Confirmadas (8 horas sólidos / 4 horas líquidos)
                </label>
                <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  Consentimiento Informado Firmado por Paciente o Responsable Legal
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Instrucciones y Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Requisitos especiales de CEYE, reserva de sangre, instrumental..."
                  rows={2}
                  className="neo-input"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-active text-xs"
                >
                  Guardar Admisión Programada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
