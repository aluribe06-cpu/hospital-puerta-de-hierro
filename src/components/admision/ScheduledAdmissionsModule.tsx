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
  Calendar
} from 'lucide-react';
import { Patient, ScheduledAdmission, BedArea } from '../../types/hospital';
import { logAuditAction } from '../../lib/supabaseClient';
import * as XLSX from 'xlsx';

interface ScheduledAdmissionsModuleProps {
  patients: Patient[];
  scheduledList: ScheduledAdmission[];
  onAddScheduled: (admission: ScheduledAdmission) => void;
  onUpdateStatus: (id: string, status: ScheduledAdmission['status']) => void;
}

export const ScheduledAdmissionsModule: React.FC<ScheduledAdmissionsModuleProps> = ({
  patients,
  scheduledList,
  onAddScheduled,
  onUpdateStatus,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('TODOS');

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
            onClick={() => setShowModal(true)}
            className="btn-neo btn-neo-active text-xs"
          >
            <Plus size={16} />
            Programar Paciente
          </button>
        </div>
      </div>

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
