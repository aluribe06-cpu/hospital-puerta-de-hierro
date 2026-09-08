// ==============================================================================
// MÓDULO DE HOSPITALIZACIÓN Y CENSO DE CAMAS
// Hospital Puerta de Hierro (Tepic) - UCI, UCIN, Terapia Intermedia, Pisos y Suites
// ==============================================================================

import React, { useState } from 'react';
import { 
  Bed, 
  UserCheck, 
  Sparkles, 
  AlertOctagon, 
  FileSpreadsheet, 
  CheckCircle2, 
  UserPlus, 
  LogOut,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { HospitalBed, BedArea, BedStatus, Patient } from '../../types/hospital';
import { logAuditAction } from '../../lib/supabaseClient';
import { exportBedsToExcel } from '../../lib/exportEngine';
import * as XLSX from 'xlsx';

interface HospitalizacionModuleProps {
  beds: HospitalBed[];
  patients: Patient[];
  onUpdateBed: (updatedBed: HospitalBed) => void;
}

export const HospitalizacionModule: React.FC<HospitalizacionModuleProps> = ({
  beds,
  patients,
  onUpdateBed,
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('TODAS');
  const [activeBedModal, setActiveBedModal] = useState<HospitalBed | null>(null);

  // Asignar paciente a cama
  const [patientToAssignId, setPatientToAssignId] = useState(patients[0]?.id || '');
  const [attendingPhysician, setAttendingPhysician] = useState('Dr. Carlos Mendoza Alatorre');
  const [dietType, setDietType] = useState('Dieta Blanda Asistida');
  const [clinicalIsolation, setClinicalIsolation] = useState(false);

  const handleAssignPatient = (bed: HospitalBed) => {
    const patient = patients.find(p => p.id === patientToAssignId);
    if (!patient) return;

    const updated: HospitalBed = {
      ...bed,
      status: 'OCUPADA',
      currentPatientId: patient.id,
      currentPatientName: `${patient.firstName} ${patient.lastName}`,
      currentPatientNumber: patient.patientNumber,
      attendingPhysician,
      assignedNurse: 'Enf. Jefa Rocío Barajas',
      admissionDate: new Date().toISOString(),
      dietType,
      clinicalIsolation,
    };

    onUpdateBed(updated);
    logAuditAction({
      userName: attendingPhysician,
      userRole: 'MEDICO_ESPECIALISTA',
      actionType: 'ASIGNACION_CAMA_HOSPITALIZACION',
      resourceAffected: `Cama ${bed.bedNumber}`,
      details: `Paciente ${patient.patientNumber} (${patient.firstName} ${patient.lastName}) asignado a ${bed.bedNumber} (${bed.area})`,
    });

    setActiveBedModal(null);
  };

  const handleDischargePatient = (bed: HospitalBed) => {
    const updated: HospitalBed = {
      ...bed,
      status: 'LIMPIEZA_DESINFECCION',
      currentPatientId: undefined,
      currentPatientName: undefined,
      currentPatientNumber: undefined,
      attendingPhysician: undefined,
      assignedNurse: undefined,
      admissionDate: undefined,
      notes: 'Paciente egresado. Requiere desinfección terminal.',
    };

    onUpdateBed(updated);
    logAuditAction({
      userName: 'Dra. Sofía Valenzuela Ríos',
      userRole: 'MEDICO_URGENCIOLOGO',
      actionType: 'ALTA_MEDICA_DESOCUPACION_CAMA',
      resourceAffected: `Cama ${bed.bedNumber}`,
      details: `Alta hospitalaria efectuada para cama ${bed.bedNumber}. Pasa a estatus de limpieza.`,
    });

    setActiveBedModal(null);
  };

  const handleCleanBed = (bed: HospitalBed) => {
    const updated: HospitalBed = {
      ...bed,
      status: 'DISPONIBLE',
      notes: 'Desinfección terminal completada bajo norma NOM-016.',
    };

    onUpdateBed(updated);
    setActiveBedModal(null);
  };

  const handleExportBeds = () => {
    exportBedsToExcel(beds);
  };

  const filteredBeds = beds.filter(b => {
    if (selectedArea === 'TODAS') return true;
    return b.area === selectedArea;
  });

  const getStatusColor = (status: BedStatus) => {
    switch (status) {
      case 'DISPONIBLE':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
      case 'OCUPADA':
        return { bg: 'rgba(37, 99, 235, 0.25)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.5)' };
      case 'LIMPIEZA_DESINFECCION':
        return { bg: 'rgba(234, 88, 12, 0.2)', text: '#fb923c', border: 'rgba(234, 88, 12, 0.4)' };
      case 'AISLAMIENTO_INFECCIOSO':
        return { bg: 'rgba(220, 38, 38, 0.25)', text: '#f87171', border: 'rgba(220, 38, 38, 0.5)' };
      case 'MANTENIMIENTO':
        return { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8', border: 'rgba(100, 116, 139, 0.4)' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: 'rgba(37, 99, 235, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
              <span className="neo-badge-dot" style={{ background: '#3b82f6' }}></span>
              CENSO DINÁMICO HOSPITALARIO
            </span>
            <span className="text-xs text-slate-400 font-mono">MAPA DE CAMAS EN TIEMPO REAL</span>
          </div>
          <h2 className="text-2xl font-black text-white">Hospitalización y Cuidados Críticos</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Monitoreo interactivo de camas en UCI Adultos, UCIN Neonatal, Terapia Intermedia, Pisos y Suites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportBeds}
            className="btn-neo btn-neo-defart text-xs"
          >
            <FileSpreadsheet size={16} />
            Exportar Censo (.xlsx)
          </button>
        </div>
      </div>

      {/* Selector de Áreas Hospitalarias */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'TODAS', label: 'Todas las Áreas' },
          { id: 'UCI_ADULTOS', label: 'UCI Adultos' },
          { id: 'UCIN_NEONATAL', label: 'UCIN Neonatal' },
          { id: 'TERAPIA_INTERMEDIA', label: 'Terapia Intermedia' },
          { id: 'PISO_2_QUIRURGICO', label: 'Piso 2 Quirúrgico' },
          { id: 'PISO_3_HOSPITALIZACION', label: 'Piso 3 Medicina Interna' },
          { id: 'SUITES_ESPECIALES', label: 'Suites Puerta de Hierro' },
        ].map((area) => (
          <button
            key={area.id}
            onClick={() => setSelectedArea(area.id)}
            className={`btn-neo text-xs px-4 py-2 shrink-0 ${
              selectedArea === area.id ? 'btn-neo-active' : 'btn-neo-defart'
            }`}
          >
            {area.label}
          </button>
        ))}
      </div>

      {/* Grid Táctil de Camas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeds.map((bed) => {
          const statusStyle = getStatusColor(bed.status);
          const isOccupied = bed.status === 'OCUPADA';
          const patient = patients.find(p => p.id === bed.currentPatientId);

          return (
            <div
              key={bed.id}
              onClick={() => setActiveBedModal(bed)}
              className="neo-glass-panel p-5 cursor-pointer border-2 transition-all hover:translate-y-[-2px] hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
              style={{ borderColor: statusStyle.border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm"
                    style={{ background: statusStyle.bg, color: statusStyle.text }}
                  >
                    <Bed size={20} />
                  </div>
                  <div>
                    <h3 className="font-mono text-base font-extrabold text-white">{bed.bedNumber}</h3>
                    <span className="text-[11px] text-slate-400 block">{bed.area.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <span 
                  className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                  style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}
                >
                  {bed.status.replace(/_/g, ' ')}
                </span>
              </div>

              {isOccupied ? (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-xs">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    👤 {bed.currentPatientName}
                  </div>
                  <div className="text-cyan-300 font-mono text-[11px]">
                    Exp: {bed.currentPatientNumber}
                  </div>
                  {patient && (
                    <div className="text-slate-400 text-[11px]">
                      Peso: <strong className="text-white">{patient.weightKg} kg</strong> | Talla: <strong className="text-white">{patient.heightCm} cm</strong> (IMC: {patient.calculatedBmi})
                    </div>
                  )}
                  <div className="text-slate-400 text-[11px]">
                    Médico: <strong>{bed.attendingPhysician}</strong>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Dieta: <em>{bed.dietType}</em>
                  </div>
                  {bed.clinicalIsolation && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                      <ShieldAlert size={12} /> Aislamiento Infeccioso
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-5 pt-3 border-t border-white/10 text-center text-xs text-slate-400 italic">
                  {bed.status === 'DISPONIBLE' && '✓ Cama lista para recibir paciente'}
                  {bed.status === 'LIMPIEZA_DESINFECCION' && '⚠️ Requiere desinfección terminal'}
                  {bed.status === 'MANTENIMIENTO' && '🛠️ En revisión técnica'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Táctil de Gestión de Cama */}
      {activeBedModal && (
        <div className="neo-modal-backdrop" onClick={() => setActiveBedModal(null)}>
          <div className="neo-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bed size={22} className="text-blue-400" /> Cama {activeBedModal.bedNumber}
                </h3>
                <p className="text-xs text-slate-400">{activeBedModal.area.replace(/_/g, ' ')}</p>
              </div>
              <button 
                onClick={() => setActiveBedModal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Si la cama está disponible -> Asignar paciente */}
            {activeBedModal.status === 'DISPONIBLE' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-cyan-300">Asignar Paciente a esta Cama</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Paciente</label>
                  <select
                    value={patientToAssignId}
                    onChange={(e) => setPatientToAssignId(e.target.value)}
                    className="neo-input neo-select"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.patientNumber} - {p.firstName} {p.lastName} ({p.bloodType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Médico Tratante</label>
                    <input
                      type="text"
                      value={attendingPhysician}
                      onChange={(e) => setAttendingPhysician(e.target.value)}
                      className="neo-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Tipo de Dieta</label>
                    <input
                      type="text"
                      value={dietType}
                      onChange={(e) => setDietType(e.target.value)}
                      className="neo-input"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={clinicalIsolation}
                    onChange={(e) => setClinicalIsolation(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Aislamiento Clínico / Precaución de Contacto o Gotas
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setActiveBedModal(null)}
                    className="btn-neo btn-neo-defart text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleAssignPatient(activeBedModal)}
                    className="btn-neo btn-neo-active text-xs"
                  >
                    Confirmar Asignación de Cama
                  </button>
                </div>
              </div>
            )}

            {/* Si la cama está ocupada -> Dar de alta */}
            {activeBedModal.status === 'OCUPADA' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-2">
                  <span className="text-slate-400 block font-bold uppercase">Información del Paciente en Cama:</span>
                  <div className="text-base font-bold text-white">{activeBedModal.currentPatientName}</div>
                  <div className="text-cyan-300 font-mono">Expediente: {activeBedModal.currentPatientNumber}</div>
                  <div className="text-slate-300">Médico: {activeBedModal.attendingPhysician}</div>
                  <div className="text-slate-300">Enfermera Responsable: {activeBedModal.assignedNurse}</div>
                  <div className="text-slate-300">Dieta: {activeBedModal.dietType}</div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setActiveBedModal(null)}
                    className="btn-neo btn-neo-defart text-xs"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => handleDischargePatient(activeBedModal)}
                    className="btn-neo btn-neo-danger text-xs"
                  >
                    <LogOut size={16} />
                    Dar Alta Médica y Desocupar Cama
                  </button>
                </div>
              </div>
            )}

            {/* Si la cama está en limpieza -> Completar desinfección */}
            {activeBedModal.status === 'LIMPIEZA_DESINFECCION' && (
              <div className="space-y-4 text-center py-4">
                <Sparkles size={40} className="text-amber-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Desinfección Terminal en Proceso</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  La cama ha sido sanitizada con solución de grado hospitalario y esterilizada según los protocolos de bioseguridad NOM-016.
                </p>
                <div className="flex justify-center gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setActiveBedModal(null)}
                    className="btn-neo btn-neo-defart text-xs"
                  >
                    Mantener en Proceso
                  </button>
                  <button
                    onClick={() => handleCleanBed(activeBedModal)}
                    className="btn-neo btn-neo-success text-xs"
                  >
                    ✓ Marcar como Disponible y Sanitizada
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
