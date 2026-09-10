// ==============================================================================
// MÓDULO DE TRIAGE Y URGENCIAS 24/7 (SISTEMA MANCHESTER)
// Hospital Puerta de Hierro (Tepic) - Incluye Peso, Talla y Cálculo de IMC
// ==============================================================================

import React, { useState } from 'react';
import { 
  Activity, 
  Plus, 
  FileDown, 
  FileSpreadsheet, 
  AlertCircle, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  HeartPulse,
  Scale,
  UserPlus,
  AlertTriangle,
  Zap,
  X,
  User
} from 'lucide-react';
import { Patient, TriageAdmission, TriagePriority } from '../../types/hospital';
import { generateTriageSheetPDF, exportPatientsToExcel } from '../../lib/exportEngine';
import { logAuditAction } from '../../lib/supabaseClient';

interface TriageModuleProps {
  patients: Patient[];
  triageList: TriageAdmission[];
  onAddTriage: (triage: TriageAdmission) => void;
  onUpdateTriageStatus: (id: string, status: 'EN_ESPERA' | 'EN_ATENCION' | 'TRASLADADO_CAMA' | 'EGRESO_DOMICILIO') => void;
  onAddPatient?: (patient: Patient) => void;
  onEmergencyAdmit?: (patient: Patient, triage: TriageAdmission) => void;
}

export const TriageModule: React.FC<TriageModuleProps> = ({
  patients,
  triageList,
  onAddTriage,
  onUpdateTriageStatus,
  onAddPatient,
  onEmergencyAdmit,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('TODAS');

  // Modo en el modal de Triage: 'EXISTENTE' o 'NUEVO'
  const [patientMode, setPatientMode] = useState<'EXISTENTE' | 'NUEVO'>('EXISTENTE');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');

  // Formulario de Nuevo Paciente dentro de Triage
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

  // Formulario de Ingreso Rápido de Emergencia (Código Rojo)
  const [emFirstName, setEmFirstName]     = useState('NN');
  const [emLastName, setEmLastName]       = useState('No identificado');
  const [emAge, setEmAge]                 = useState(30);
  const [emGender, setEmGender]           = useState<Patient['gender']>('MASCULINO');
  const [emBloodType, setEmBloodType]     = useState<Patient['bloodType']>('O+');
  const [emCause, setEmCause]             = useState('');
  const [emBp, setEmBp]                   = useState('120/80');
  const [emHr, setEmHr]                   = useState(80);
  const [emSpo2, setEmSpo2]               = useState(95);
  const [emTemp, setEmTemp]               = useState(36.5);
  const [emDestination, setEmDestination] = useState<'SALA_CHOQUE' | 'CONSULTORIO_URGENCIAS' | 'SALA_OBSERVACION' | 'HOSPITALIZACION'>('SALA_CHOQUE');
  const [emergencySaved, setEmergencySaved] = useState(false);
  const [emergencyExpediente, setEmergencyExpediente] = useState('');

  // Estado del formulario de nuevo Triage
  const [priority, setPriority] = useState<TriagePriority>('AMARILLO_URGENCIA');
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState(76);
  const [rr, setRr] = useState(18);
  const [temp, setTemp] = useState(36.7);
  const [spo2, setSpo2] = useState(98);
  const [glucose, setGlucose] = useState(95);
  const [painEva, setPainEva] = useState(4);
  const [weightKg, setWeightKg] = useState(70.0);
  const [heightCm, setHeightCm] = useState(170.0);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [initialDiagnosis, setInitialDiagnosis] = useState('');
  const [destination, setDestination] = useState<'SALA_CHOQUE' | 'CONSULTORIO_URGENCIAS' | 'SALA_OBSERVACION' | 'HOSPITALIZACION'>('CONSULTORIO_URGENCIAS');

  // Cálculo en tiempo real de IMC
  const calculatedBmi = heightCm > 0 
    ? Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(2)) 
    : 0;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Bajo Peso', color: '#38bdf8' };
    if (bmi < 25) return { label: 'Peso Normal', color: '#34d399' };
    if (bmi < 30) return { label: 'Sobrepeso', color: '#fbbf24' };
    if (bmi < 35) return { label: 'Obesidad Grado I', color: '#f97316' };
    return { label: 'Obesidad Grado II/Mórbida', color: '#ef4444' };
  };

  const bmiInfo = getBmiCategory(calculatedBmi);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const year = now.getFullYear();

    let targetPatient: Patient | undefined;

    if (patientMode === 'NUEVO') {
      const seq = String(patients.length + 1).padStart(4, '0');
      const newPatient: Patient = {
        id: 'pat-' + Date.now(),
        patientNumber: `HPDH-${year}-${seq}`,
        firstName: npFirstName.trim() || 'Paciente',
        lastName: npLastName.trim() || 'Nuevo',
        birthDate: npBirthDate || `${year - 30}-01-01`,
        gender: npGender,
        curp: npCurp.trim().toUpperCase() || 'SIN-CURP',
        rfc: npRfc.trim().toUpperCase() || undefined,
        phone: npPhone.trim() || undefined,
        originario: npOriginario.trim() || undefined,
        address: npAddress.trim() || undefined,
        bloodType: npBloodType,
        allergies: npAllergies.trim() || 'Ninguna conocida',
        weightKg: Number(weightKg) || 70,
        heightCm: Number(heightCm) || 170,
        calculatedBmi,
        emergencyContactName: npEcName.trim() || 'N/A',
        emergencyContactPhone: npEcPhone.trim() || 'N/A',
        insuranceCompany: npInsurance,
        createdAt: now.toISOString(),
      };

      if (onAddPatient) {
        onAddPatient(newPatient);
      }
      targetPatient = newPatient;
    } else {
      targetPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
    }

    if (!targetPatient) return;

    const newTriage: TriageAdmission = {
      id: 'trg-' + Date.now(),
      patientId: targetPatient.id,
      patientName: `${targetPatient.firstName} ${targetPatient.lastName}`,
      patientNumber: targetPatient.patientNumber,
      priority,
      bloodPressure: bp,
      heartRate: Number(hr),
      respiratoryRate: Number(rr),
      temperatureC: Number(temp),
      oxygenSaturation: Number(spo2),
      bloodGlucose: Number(glucose),
      painScaleEva: Number(painEva),
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      calculatedBmi,
      chiefComplaint,
      initialDiagnosis,
      evaluatingPhysician: 'Dra. Sofía Valenzuela Ríos (Urgencióloga)',
      assignedDestination: destination,
      waitTimeMinutes: priority === 'ROJO_REANIMACION' ? 0 : 5,
      status: priority === 'ROJO_REANIMACION' ? 'EN_ATENCION' : 'EN_ESPERA',
      admissionTimestamp: now.toISOString(),
    };

    onAddTriage(newTriage);
    
    // Registrar auditoría NOM-024
    logAuditAction({
      userName: 'Dra. Sofía Valenzuela Ríos',
      userRole: 'MEDICO_URGENCIOLOGO',
      userLicense: '6789123',
      actionType: 'INGRESO_TRIAGE_MANCHESTER',
      resourceAffected: `Expediente ${targetPatient.patientNumber}`,
      details: `Prioridad ${priority} | TA: ${bp}, FC: ${hr}, Temp: ${temp}°C, Peso: ${weightKg}kg, Talla: ${heightCm}cm, IMC: ${calculatedBmi}`,
    });

    setShowModal(false);
    setChiefComplaint('');
    setInitialDiagnosis('');
    // Limpiar formulario de nuevo paciente si se usó
    setNpFirstName('');
    setNpLastName('');
    setNpBirthDate('');
    setNpCurp('');
    setNpRfc('');
    setNpPhone('');
    setNpOriginario('');
    setNpAddress('');
    setNpEcName('');
    setNpEcPhone('');
    setPatientMode('EXISTENTE');
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

    if (onEmergencyAdmit) {
      onEmergencyAdmit(newPatient, newTriage);
    } else if (onAddPatient) {
      onAddPatient(newPatient);
      onAddTriage(newTriage);
    }

    setEmergencyExpediente(expediente);
    setEmergencySaved(true);

    logAuditAction({
      userName: 'Admisión Urgencias',
      userRole: 'ENFERMERO_TRIAGE',
      actionType: 'INGRESO_EMERGENCIA_ROJO',
      resourceAffected: `Expediente ${expediente}`,
      details: `Ingreso emergente Código Rojo: ${newPatient.firstName} ${newPatient.lastName}. Causa: ${emCause}. Destino: ${emDestination}.`,
    });

    setTimeout(() => {
      setEmergencySaved(false);
      setShowEmergencyModal(false);
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

  const filteredTriage = triageList.filter(t => {
    if (filterPriority === 'TODAS') return true;
    return t.priority === filterPriority;
  });

  const getPriorityBadge = (pri: TriagePriority) => {
    switch (pri) {
      case 'ROJO_REANIMACION':
        return { label: 'ROJO - REANIMACIÓN (0 MIN)', bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', border: '#ef4444' };
      case 'NARANJA_EMERGENCIA':
        return { label: 'NARANJA - EMERGENCIA (<10 MIN)', bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316', border: '#f97316' };
      case 'AMARILLO_URGENCIA':
        return { label: 'AMARILLO - URGENCIA (<60 MIN)', bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308', border: '#eab308' };
      case 'VERDE_MENOR':
        return { label: 'VERDE - MENOR (<120 MIN)', bg: 'rgba(16, 185, 129, 0.2)', text: '#10b981', border: '#10b981' };
      case 'AZUL_NO_URGENTE':
        return { label: 'AZUL - NO URGENTE (<240 MIN)', bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6', border: '#3b82f6' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Encabezado y Filtros */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}>
              <span className="neo-badge-dot" style={{ background: '#ef4444' }}></span>
              URGENCIAS MÉDICO-QUIRÚRGICAS 24/7
            </span>
            <span className="text-xs text-slate-400 font-mono">SELECCIÓN Y CLASIFICACIÓN MANCHESTER</span>
          </div>
          <h2 className="text-2xl font-black text-white">Triage Hospitalario de Admisión</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Evaluación de signos vitales, somatometría, IMC y estratificación de riesgo según la NOM-004 y NOM-024.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* BOTÓN ROJO DE EMERGENCIA DIRECTA */}
          <button 
            onClick={() => setShowEmergencyModal(true)}
            className="btn-neo text-xs font-black flex items-center gap-1.5 animate-pulse"
            style={{ 
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.35), rgba(220, 38, 38, 0.55))', 
              borderColor: 'rgba(239, 68, 68, 0.85)', 
              color: '#fca5a5',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.35)'
            }}
          >
            <AlertTriangle size={16} className="text-red-400 animate-bounce" />
            <span>🚨 INGRESO DE EMERGENCIA</span>
          </button>

          <button 
            onClick={() => exportPatientsToExcel(patients)}
            className="btn-neo btn-neo-defart text-xs"
          >
            <FileSpreadsheet size={16} />
            Exportar Excel (.xlsx)
          </button>

          <button 
            onClick={() => {
              setPatientMode('NUEVO');
              setShowModal(true);
            }}
            className="btn-neo text-xs"
            style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)', color: '#34d399' }}
          >
            <UserPlus size={16} />
            + Alta Nuevo Paciente
          </button>

          <button 
            onClick={() => {
              setPatientMode('EXISTENTE');
              setShowModal(true);
            }}
            className="btn-neo btn-neo-active text-xs"
          >
            <Plus size={16} />
            Ingresar Paciente a Triage
          </button>
        </div>
      </div>

      {/* Selector de Prioridades Manchester */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['TODAS', 'ROJO_REANIMACION', 'NARANJA_EMERGENCIA', 'AMARILLO_URGENCIA', 'VERDE_MENOR', 'AZUL_NO_URGENTE'].map((pri) => (
          <button
            key={pri}
            onClick={() => setFilterPriority(pri)}
            className={`btn-neo text-xs px-4 py-2 ${
              filterPriority === pri ? 'btn-neo-active' : 'btn-neo-defart'
            }`}
          >
            {pri === 'TODAS' ? 'Todos los Niveles' : pri.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Lista de Pacientes en Triage */}
      <div className="space-y-4">
        {filteredTriage.length === 0 ? (
          <div className="neo-glass-panel p-12 text-center text-slate-400">
            No hay pacientes registrados en este nivel de Triage en este momento.
          </div>
        ) : (
          filteredTriage.map((triage) => {
            const badge = getPriorityBadge(triage.priority);
            const patient = patients.find(p => p.id === triage.patientId);

            return (
              <div 
                key={triage.id}
                className="neo-glass-panel p-5 border-l-4 transition-all hover:translate-x-1"
                style={{ borderLeftColor: badge.border }}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Información Principal */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span 
                        className="text-xs px-2.5 py-1 rounded-full font-bold"
                        style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}
                      >
                        {badge.label}
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {triage.patientName}
                      </h3>
                      <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                        Exp: {triage.patientNumber}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300">
                      <strong className="text-white">Motivo:</strong> {triage.chiefComplaint}
                    </p>
                    {triage.initialDiagnosis && (
                      <p className="text-xs text-blue-300">
                        <strong>Impresión Diagnóstica:</strong> {triage.initialDiagnosis}
                      </p>
                    )}
                  </div>

                  {/* Signos Vitales, Peso, Talla e IMC */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-900/60 p-3 rounded-2xl border border-white/5 shrink-0">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">T/A</span>
                      <span className="text-xs font-bold text-white">{triage.bloodPressure}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">FC / FR</span>
                      <span className="text-xs font-bold text-white">{triage.heartRate} / {triage.respiratoryRate}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">SpO2 / Temp</span>
                      <span className="text-xs font-bold text-white">{triage.oxygenSaturation}% / {triage.temperatureC}°</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">Glucosa</span>
                      <span className="text-xs font-bold text-white">{triage.bloodGlucose || '--'} mg</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">Peso / Talla</span>
                      <span className="text-xs font-bold text-white">{triage.weightKg}k / {triage.heightCm}c</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">IMC</span>
                      <span className="text-xs font-bold text-cyan-400">{triage.calculatedBmi || '--'}</span>
                    </div>
                  </div>

                  {/* Acciones Táctiles */}
                  <div className="flex items-center gap-2 shrink-0">
                    {patient && (
                      <button
                        onClick={() => generateTriageSheetPDF(triage, patient)}
                        title="Imprimir Ficha de Triage Oficial en PDF"
                        className="btn-neo btn-neo-defart text-xs p-2.5"
                      >
                        <FileDown size={16} />
                      </button>
                    )}

                    {triage.status === 'EN_ESPERA' && (
                      <button
                        onClick={() => onUpdateTriageStatus(triage.id, 'EN_ATENCION')}
                        className="btn-neo btn-neo-active text-xs"
                      >
                        Pasar a Atención
                      </button>
                    )}

                    {triage.status === 'EN_ATENCION' && (
                      <button
                        onClick={() => onUpdateTriageStatus(triage.id, 'TRASLADADO_CAMA')}
                        className="btn-neo btn-neo-cyan text-xs"
                      >
                        Asignar Cama
                      </button>
                    )}

                    {triage.status === 'TRASLADADO_CAMA' && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={16} /> Cama Asignada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== MODAL DE INGRESO A TRIAGE CON OPCIÓN DE NUEVO PACIENTE ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="neo-glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity size={22} className="text-cyan-400" />
                  Nuevo Ingreso a Triage Manchester
                </h3>
                <p className="text-xs text-slate-400">Captura de signos vitales, somatometría y clasificación de urgencia</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 bg-transparent border-none"
                style={{ background: 'none' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Pestañas de Selección: Paciente Existente vs Nuevo Paciente */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl bg-slate-900/80 border border-white/10">
              <button
                type="button"
                onClick={() => setPatientMode('EXISTENTE')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  patientMode === 'EXISTENTE' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User size={15} />
                Paciente ya Registrado
              </button>
              <button
                type="button"
                onClick={() => setPatientMode('NUEVO')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  patientMode === 'NUEVO' 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus size={15} />
                + Alta de Nuevo Paciente
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* MODO 1: SELECCIÓN DE PACIENTE EXISTENTE */}
              {patientMode === 'EXISTENTE' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Seleccionar Paciente de la Base de Datos</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.patientNumber} - {p.firstName} {p.lastName} ({p.bloodType})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* MODO 2: FORMULARIO COMPLETO DE ALTA DE NUEVO PACIENTE */
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase">
                      <UserPlus size={16} /> Datos de Identificación del Paciente
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      NUEVO EXPEDIENTE AUTOMÁTICO
                    </span>
                  </div>

                  {/* Nombre y Apellidos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Nombre(s) *</label>
                      <input required value={npFirstName} onChange={e => setNpFirstName(e.target.value)}
                        className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm"
                        placeholder="Ej: Roberto"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Apellidos *</label>
                      <input required value={npLastName} onChange={e => setNpLastName(e.target.value)}
                        className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm"
                        placeholder="Ej: González Parra"
                      />
                    </div>
                  </div>

                  {/* Fecha Nacimiento y Género */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Fecha de Nacimiento *</label>
                      <input required type="date" value={npBirthDate} onChange={e => setNpBirthDate(e.target.value)}
                        className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Género</label>
                      <select value={npGender} onChange={e => setNpGender(e.target.value as Patient['gender'])}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm">
                        <option value="MASCULINO">Masculino</option>
                        <option value="FEMENINO">Femenino</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>
                  </div>

                  {/* CURP y RFC */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">CURP *</label>
                      <input required value={npCurp} onChange={e => setNpCurp(e.target.value.toUpperCase())}
                        maxLength={18}
                        className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm font-mono uppercase"
                        placeholder="GOPR850312HNLNRB09"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">RFC <span className="text-slate-500">(opcional)</span></label>
                      <input value={npRfc} onChange={e => setNpRfc(e.target.value.toUpperCase())}
                        maxLength={13}
                        className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm font-mono uppercase"
                        placeholder="GOPR850312XXX"
                      />
                    </div>
                  </div>

                  {/* Teléfono y Originario */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono de Contacto</label>
                      <input type="tel" value={npPhone} onChange={e => setNpPhone(e.target.value)}
                        className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm"
                        placeholder="311 XXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Originario de <span className="text-slate-500">(ciudad/estado)</span></label>
                      <input value={npOriginario} onChange={e => setNpOriginario(e.target.value)}
                        className="neo-auth-input w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm"
                        placeholder="Ej: Tepic, Nayarit"
                      />
                    </div>
                  </div>

                  {/* Domicilio */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Domicilio Actual</label>
                    <textarea value={npAddress} onChange={e => setNpAddress(e.target.value)}
                      rows={1}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm resize-none"
                      placeholder="Calle, Número, Colonia, Ciudad, CP"
                    />
                  </div>

                  {/* Sangre y Seguro */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Sangre</label>
                      <select value={npBloodType} onChange={e => setNpBloodType(e.target.value as Patient['bloodType'])}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm">
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Aseguradora / Servicio</label>
                      <select value={npInsurance} onChange={e => setNpInsurance(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm">
                        {['Particular','IMSS','ISSSTE','GNP','AXA','MetLife','Mapfre','HDI'].map(ins => <option key={ins} value={ins}>{ins}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Contacto de Emergencia */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Contacto Emergencia (Nombre)</label>
                      <input value={npEcName} onChange={e => setNpEcName(e.target.value)}
                        className="neo-auth-input w-full px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-600/40 text-white text-xs"
                        placeholder="Nombre familiar"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Contacto Emergencia (Teléfono)</label>
                      <input type="tel" value={npEcPhone} onChange={e => setNpEcPhone(e.target.value)}
                        className="neo-auth-input w-full px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-600/40 text-white text-xs"
                        placeholder="311 XXX XXXX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Prioridad Manchester */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Nivel Manchester (Triage)</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TriagePriority)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm"
                >
                  <option value="ROJO_REANIMACION" className="bg-slate-900 text-red-400">CÓDIGO ROJO - Reanimación (Atención Inmediata 0 min)</option>
                  <option value="NARANJA_EMERGENCIA" className="bg-slate-900 text-orange-400">CÓDIGO NARANJA - Emergencia (&lt; 10 min)</option>
                  <option value="AMARILLO_URGENCIA" className="bg-slate-900 text-yellow-400">CÓDIGO AMARILLO - Urgencia (&lt; 60 min)</option>
                  <option value="VERDE_MENOR" className="bg-slate-900 text-emerald-400">CÓDIGO VERDE - Menor (&lt; 120 min)</option>
                  <option value="AZUL_NO_URGENTE" className="bg-slate-900 text-blue-400">CÓDIGO AZUL - No Urgente (&lt; 240 min)</option>
                </select>
              </div>

              {/* Grid de Signos Vitales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Presión Arterial (TA)</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-xs font-mono text-center"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Frecuencia Cardíaca (FC)</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={(e) => setHr(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-xs font-mono text-center"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Frec. Respiratoria (FR)</label>
                  <input
                    type="number"
                    value={rr}
                    onChange={(e) => setRr(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-xs font-mono text-center"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-xs font-mono text-center"
                    required
                  />
                </div>
              </div>

              {/* Grid 2: SpO2, Glucosa y Dolor */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Saturación O2 (SpO2 %)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-xs font-mono text-center"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Glucosa Capilar (mg/dL)</label>
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Escala Dolor EVA ({painEva}/10)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painEva}
                    onChange={(e) => setPainEva(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              {/* SOMATOMETRÍA Y CÁLCULO DE IMC */}
              <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 uppercase">
                    <Scale size={16} /> Somatometría y Cálculo de IMC
                  </span>
                  <span 
                    className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(255,255,255,0.08)', color: bmiInfo.color }}
                  >
                    {bmiInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-xs font-mono text-center"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Talla / Altura (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-xs font-mono text-center"
                      required
                    />
                  </div>
                  <div className="text-center p-1.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Índice Masa Corp.</span>
                    <span className="text-base font-black text-cyan-400">{calculatedBmi}</span>
                    <span className="text-[9px] text-slate-500 block">kg/m²</span>
                  </div>
                </div>
              </div>

              {/* Motivo y Diagnóstico */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Motivo de Atención *</label>
                <textarea
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Describa síntomas agudos, tiempo de evolución y gravedad..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Destino Asignado</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm"
                >
                  <option value="CONSULTORIO_URGENCIAS" className="bg-slate-900">Consultorio de Urgencias</option>
                  <option value="SALA_CHOQUE" className="bg-slate-900">🚨 Sala de Choque (Reanimación Inmediata)</option>
                  <option value="SALA_OBSERVACION" className="bg-slate-900">Sala de Observación / Corta Estancia</option>
                  <option value="HOSPITALIZACION" className="bg-slate-900">Hospitalización / UCI Directo</option>
                </select>
              </div>

              {/* Botones de acción */}
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
                  className="btn-neo btn-neo-active text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  {patientMode === 'NUEVO' ? 'Registrar Paciente y Emitir Triage' : 'Guardar y Emitir Triage'}
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
    </div>
  );
};
