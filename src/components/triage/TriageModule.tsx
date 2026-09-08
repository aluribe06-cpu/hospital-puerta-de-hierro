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
  Scale
} from 'lucide-react';
import { Patient, TriageAdmission, TriagePriority } from '../../types/hospital';
import { generateTriageSheetPDF, exportPatientsToExcel } from '../../lib/exportEngine';
import { logAuditAction } from '../../lib/supabaseClient';

interface TriageModuleProps {
  patients: Patient[];
  triageList: TriageAdmission[];
  onAddTriage: (triage: TriageAdmission) => void;
  onUpdateTriageStatus: (id: string, status: 'EN_ESPERA' | 'EN_ATENCION' | 'TRASLADADO_CAMA' | 'EGRESO_DOMICILIO') => void;
}

export const TriageModule: React.FC<TriageModuleProps> = ({
  patients,
  triageList,
  onAddTriage,
  onUpdateTriageStatus,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('TODAS');

  // Estado del formulario de nuevo Triage
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
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
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    const newTriage: TriageAdmission = {
      id: 'trg-' + Date.now(),
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientNumber: patient.patientNumber,
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
      admissionTimestamp: new Date().toISOString(),
    };

    onAddTriage(newTriage);
    
    // Registrar auditoría NOM-024
    logAuditAction({
      userName: 'Dra. Sofía Valenzuela Ríos',
      userRole: 'MEDICO_URGENCIOLOGO',
      userLicense: '6789123',
      actionType: 'INGRESO_TRIAGE_MANCHESTER',
      resourceAffected: `Expediente ${patient.patientNumber}`,
      details: `Prioridad ${priority} | TA: ${bp}, FC: ${hr}, Temp: ${temp}°C, Peso: ${weightKg}kg, Talla: ${heightCm}cm, IMC: ${calculatedBmi}`,
    });

    setShowModal(false);
    setChiefComplaint('');
    setInitialDiagnosis('');
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
            Evaluación de signos vitales, peso, talla, IMC y estratificación de riesgo según la NOM-004 y NOM-024.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => exportPatientsToExcel(patients)}
            className="btn-neo btn-neo-defart text-xs"
          >
            <FileSpreadsheet size={16} />
            Exportar Excel (.xlsx)
          </button>
          <button 
            onClick={() => setShowModal(true)}
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

      {/* Modal Táctil de Ingreso a Triage */}
      {showModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="neo-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-white">Nuevo Ingreso a Triage</h3>
                <p className="text-xs text-slate-400">Captura de signos vitales, peso, talla y Manchester</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selección de Paciente */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Paciente</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="neo-input neo-select"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.patientNumber} - {p.firstName} {p.lastName} ({p.bloodType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioridad Manchester */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Nivel Manchester</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TriagePriority)}
                  className="neo-input neo-select"
                >
                  <option value="ROJO_REANIMACION" className="bg-slate-900 text-red-400">CÓDIGO ROJO - Reanimación (Atención Inmediata)</option>
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
                    className="neo-input text-center font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Frecuencia Cardíaca (FC)</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={(e) => setHr(Number(e.target.value))}
                    className="neo-input text-center font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Frec. Respiratoria (FR)</label>
                  <input
                    type="number"
                    value={rr}
                    onChange={(e) => setRr(Number(e.target.value))}
                    className="neo-input text-center font-mono"
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
                    className="neo-input text-center font-mono"
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
                    className="neo-input text-center font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Glucosa Capilar (mg/dL)</label>
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(Number(e.target.value))}
                    className="neo-input text-center font-mono"
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
                    className="neo-slider mt-3"
                  />
                </div>
              </div>

              {/* PESO, TALLA E IMC (SOLICITADO POR EL USUARIO) */}
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-3">
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
                      className="neo-input text-center font-mono"
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
                      className="neo-input text-center font-mono"
                      required
                    />
                  </div>
                  <div className="text-center p-2 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Índice Masa Corp.</span>
                    <span className="text-lg font-black text-cyan-400">{calculatedBmi}</span>
                    <span className="text-[9px] text-slate-500 block">kg/m²</span>
                  </div>
                </div>
              </div>

              {/* Motivo y Diagnóstico */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Motivo de Atención</label>
                <textarea
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Describa síntomas agudos, tiempo de evolución y gravedad..."
                  rows={2}
                  className="neo-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Destino Asignado</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value as any)}
                  className="neo-input neo-select"
                >
                  <option value="SALA_CHOQUE" className="bg-slate-900">Sala de Choque (Reanimación Inmediata)</option>
                  <option value="CONSULTORIO_URGENCIAS" className="bg-slate-900">Consultorio de Urgencias</option>
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
                  className="btn-neo btn-neo-active text-xs"
                >
                  Guardar y Emitir Triage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
