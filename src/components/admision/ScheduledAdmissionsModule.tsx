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
  X,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Patient, ScheduledAdmission, BedArea, TriageAdmission } from '../../types/hospital';
import { logAuditAction } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

interface ScheduledAdmissionsModuleProps {
  patients: Patient[];
  scheduledList: ScheduledAdmission[];
  onAddScheduled: (admission: ScheduledAdmission) => void;
  onUpdateStatus: (id: string, status: ScheduledAdmission['status']) => void;
  onAddPatient: (patient: Patient) => void;
  onEmergencyAdmit: (patient: Patient, triage: TriageAdmission) => void;
}

export const ScheduledAdmissionsModule: React.FC<ScheduledAdmissionsModuleProps> = ({
  patients,
  scheduledList,
  onAddScheduled,
  onUpdateStatus,
  onAddPatient,
  onEmergencyAdmit,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [patientSaved, setPatientSaved] = useState(false);
  const [emergencySaved, setEmergencySaved] = useState(false);
  const [emergencyExpediente, setEmergencyExpediente] = useState('');

  // ---- Formulario Emergencia (campos mínimos) ----
  const [emFirstName, setEmFirstName] = useState('NN');
  const [emLastName, setEmLastName]   = useState('No identificado');
  const [emAge, setEmAge]             = useState(30);
  const [emGender, setEmGender]       = useState<Patient['gender']>('MASCULINO');
  const [emBloodType, setEmBloodType] = useState<Patient['bloodType']>('O+');
  const [emCause, setEmCause]         = useState('');
  const [emBp, setEmBp]               = useState('120/80');
  const [emHr, setEmHr]               = useState(80);
  const [emSpo2, setEmSpo2]           = useState(95);
  const [emTemp, setEmTemp]           = useState(36.5);
  const [emDestination, setEmDestination] = useState<'SALA_CHOQUE' | 'CONSULTORIO_URGENCIAS' | 'SALA_OBSERVACION' | 'HOSPITALIZACION'>('SALA_CHOQUE');

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

  // Guardar ingreso de emergencia directa (Código Rojo)
  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const year = now.getFullYear();
    const seq = String(patients.length + 1).padStart(4, '0');
    const expediente = `HPDH-${year}-${seq}`;

    const newPatient: Patient = {
      id: 'pat-' + Date.now(),
      patientNumber: expediente,
      firstName: emFirstName.trim() || 'NN',
      lastName: emLastName.trim() || 'No identificado',
      birthDate: `${year - (Number(emAge) || 30)}-01-01`,
      age: Number(emAge) || 30,
      gender: emGender,
      curp: 'EMERGENCIA-PENDIENTE',
      bloodType: emBloodType,
      allergies: 'No evaluado (Emergencia)',
      weightKg: 70,
      heightCm: 170,
      emergencyContactName: 'Pendiente de captura',
      emergencyContactPhone: 'Pendiente',
      insuranceCompany: 'Particular (Urgencias)',
      createdAt: now.toISOString(),
    };

    const newTriage: TriageAdmission = {
      id: 'trg-' + Date.now(),
      patientId: newPatient.id,
      patientName: `${newPatient.firstName} ${newPatient.lastName}`,
      patientNumber: expediente,
      priority: 'ROJO_REANIMACION',
      bloodPressure: emBp || '120/80',
      heartRate: Number(emHr) || 80,
      respiratoryRate: 20,
      temperatureC: Number(emTemp) || 36.5,
      oxygenSaturation: Number(emSpo2) || 95,
      bloodGlucose: 100,
      painScaleEva: 10,
      weightKg: 70,
      heightCm: 170,
      chiefComplaint: emCause.trim() || 'Ingreso directo por Código Rojo de Urgencias',
      initialDiagnosis: emCause.trim() || 'En valoración emergente - Código Rojo',
      evaluatingPhysician: 'Médico Urgencias / Código Rojo',
      assignedDestination: emDestination,
      waitTimeMinutes: 0,
      status: 'EN_ATENCION',
      admissionTimestamp: now.toISOString(),
    };

    onEmergencyAdmit(newPatient, newTriage);
    setEmergencyExpediente(expediente);
    setEmergencySaved(true);

    logAuditAction({
      userName: 'Admisión Urgencias',
      userRole: 'ENFERMERO_TRIAGE',
      actionType: 'INGRESO_EMERGENCIA_ROJO',
      resourceAffected: `Expediente ${expediente}`,
      details: `Ingreso emergente directo Código Rojo: ${newPatient.firstName} ${newPatient.lastName}. Causa: ${emCause}. Destino: ${emDestination}.`,
    });

    setTimeout(() => {
      setEmergencySaved(false);
      setShowEmergencyModal(false);
      // Reset
      setEmFirstName('NN');
      setEmLastName('No identificado');
      setEmAge(30);
      setEmCause('');
      setEmBp('120/80');
      setEmHr(80);
      setEmSpo2(95);
      setEmTemp(36.5);
      setEmDestination('SALA_CHOQUE');
    }, 1800);
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
          {/* BOTÓN ROJO DE EMERGENCIA DIRECTA */}
          <button 
            onClick={() => setShowEmergencyModal(true)}
            className="btn-neo text-xs font-black flex items-center gap-1.5 animate-pulse"
            style={{ 
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.45))', 
              borderColor: 'rgba(239, 68, 68, 0.8)', 
              color: '#fca5a5',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)'
            }}
          >
            <AlertTriangle size={16} className="text-red-400 animate-bounce" />
            <span>🚨 INGRESO DE EMERGENCIA</span>
          </button>

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

      {/* ===== MODAL INGRESO DE EMERGENCIA DIRECTA (CÓDIGO ROJO) ===== */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="neo-glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/20 text-red-400 border border-red-500/30">
                  <AlertTriangle size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-red-300 flex items-center gap-2">
                    Ingreso Rápido de Emergencia
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-mono">
                      CÓDIGO ROJO / SALA DE CHOQUE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Captura expedita para reanimación inmediata. Los datos completos y kardex se complementan después.</p>
                </div>
              </div>
              <button onClick={() => setShowEmergencyModal(false)} className="text-slate-400 hover:text-white transition-colors p-1 bg-transparent border-none" style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>

            {emergencySaved && (
              <div className="mb-4 p-4 rounded-xl bg-red-950/80 border border-red-500/60 text-white space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 size={18} /> ¡Código Rojo Activado e Ingreso Registrado!
                </div>
                <p className="text-xs text-slate-200">
                  Expediente generado: <span className="font-mono font-bold text-red-300">{emergencyExpediente}</span>. Paciente canalizado a <span className="font-semibold text-white">{emDestination.replace(/_/g, ' ')}</span> con prioridad <span className="text-red-400 font-bold">ROJO REANIMACIÓN</span>.
                </p>
              </div>
            )}

            <form onSubmit={handleEmergencySubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 flex items-center gap-2">
                <Zap size={16} className="text-red-400 shrink-0" />
                <span>Genera automáticamente el expediente y la ficha de Triage en código rojo con pase directo a atención.</span>
              </div>

              {/* Datos Generales Rápidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombre(s) del Paciente / NN</label>
                  <input value={emFirstName} onChange={e => setEmFirstName(e.target.value)}
                    className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm"
                    placeholder="NN si no está identificado"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Apellidos / Referencia</label>
                  <input value={emLastName} onChange={e => setEmLastName(e.target.value)}
                    className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm"
                    placeholder="No identificado / Familiar que acompaña"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Edad Aprox.</label>
                  <input type="number" min={0} max={120} value={emAge} onChange={e => setEmAge(Number(e.target.value))}
                    className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Género</label>
                  <select value={emGender} onChange={e => setEmGender(e.target.value as Patient['gender'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm">
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Sangre</label>
                  <select value={emBloodType} onChange={e => setEmBloodType(e.target.value as Patient['bloodType'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm">
                    {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Motivo de Urgencia / Causa */}
              <div>
                <label className="block text-xs font-bold text-red-300 mb-1">Motivo de Emergencia / Causa de Ingreso *</label>
                <input required value={emCause} onChange={e => setEmCause(e.target.value)}
                  className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-red-500/50 text-white text-sm"
                  placeholder="Ej: Paro cardiorrespiratorio, Politraumatismo, Choque hipovolémico, EVC..."
                />
              </div>

              {/* Signos Vitales Rápidos */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-600/30 space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-cyan-400" />
                  Signos Vitales Rápidos de Ingreso
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">T/A (Presión)</label>
                    <input value={emBp} onChange={e => setEmBp(e.target.value)}
                      className="neo-auth-input w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-600/40 text-white text-xs font-mono text-center"
                      placeholder="120/80"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">FC (lpm)</label>
                    <input type="number" value={emHr} onChange={e => setEmHr(Number(e.target.value))}
                      className="neo-auth-input w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-600/40 text-white text-xs font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">SpO2 (%)</label>
                    <input type="number" value={emSpo2} onChange={e => setEmSpo2(Number(e.target.value))}
                      className="neo-auth-input w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-600/40 text-white text-xs font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Temp (°C)</label>
                    <input type="number" step="0.1" value={emTemp} onChange={e => setEmTemp(Number(e.target.value))}
                      className="neo-auth-input w-full px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-600/40 text-white text-xs font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Destino Inmediato */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Destino Inmediato del Paciente</label>
                <select value={emDestination} onChange={e => setEmDestination(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-600/40 text-white text-sm">
                  <option value="SALA_CHOQUE">🚨 Sala de Choque / Reanimación (Prioridad 1)</option>
                  <option value="CONSULTORIO_URGENCIAS">Consultorio de Urgencias</option>
                  <option value="SALA_OBSERVACION">Sala de Observación</option>
                  <option value="HOSPITALIZACION">Hospitalización Directa</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-600/40 text-slate-300 text-sm hover:bg-slate-700/40 transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 0 15px rgba(220, 38, 38, 0.4)' }}>
                  <AlertTriangle size={16} />
                  ACTIVAR CÓDIGO ROJO E INGRESAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
