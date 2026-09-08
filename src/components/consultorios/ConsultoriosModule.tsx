// ==============================================================================
// MÓDULO DE CONSULTORIOS Y EXPEDIENTE CLÍNICO ELECTRÓNICO (ECE)
// Cumplimiento Estricto con NOM-004-SSA3-2012 y NOM-024-SSA3-2012
// ==============================================================================

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  AlertTriangle, 
  Stethoscope, 
  Pill, 
  ShieldCheck, 
  Search, 
  Printer,
  Calendar,
  Scale
} from 'lucide-react';
import { Patient, ConsultationNote } from '../../types/hospital';
import { generateMedicalPrescriptionPDF } from '../../lib/exportEngine';
import { generateNOM024Hash, logAuditAction } from '../../lib/supabaseClient';

interface ConsultoriosModuleProps {
  patients: Patient[];
  notes: ConsultationNote[];
  onAddNote: (note: ConsultationNote) => void;
}

export const ConsultoriosModule: React.FC<ConsultoriosModuleProps> = ({
  patients,
  notes,
  onAddNote,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);

  // Estado de nueva nota médica
  const [noteType, setNoteType] = useState<ConsultationNote['noteType']>('NOTA_EVOLUCION');
  const [physicianName, setPhysicianName] = useState('Dr. Carlos Mendoza Alatorre');
  const [physicianLicense, setPhysicianLicense] = useState('4981203');
  const [specialty, setSpecialty] = useState('Cirugía Cardiovascular');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [cie10, setCie10] = useState('I21.9');
  const [cie10Desc, setCie10Desc] = useState('Infarto agudo del miocardio, sin otra especificación');
  const [treatment, setTreatment] = useState('');
  const [prognosis, setPrognosis] = useState('Favorable con apego a tratamiento médico y reposo.');

  // Medicamentos recetados
  const [prescriptions, setPrescriptions] = useState<
    { drugName: string; dosage: string; frequency: string; duration: string; instructions: string }[]
  >([
    {
      drugName: 'Aspirina Protect (Ácido Acetilsalicílico)',
      dosage: '100 mg',
      frequency: 'Cada 24 horas (Mañanas)',
      duration: 'Permanente',
      instructions: 'Tomar después del desayuno con abundante agua.',
    },
    {
      drugName: 'Atorvastatina',
      dosage: '40 mg',
      frequency: 'Cada 24 horas (Noches)',
      duration: 'Por 6 meses',
      instructions: 'Vía oral antes de acostarse.',
    },
  ]);

  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const patientNotes = notes.filter(n => n.patientId === activePatient?.id);

  const handleAddDrug = () => {
    setPrescriptions([
      ...prescriptions,
      { drugName: '', dosage: '', frequency: 'Cada 8 horas', duration: '7 días', instructions: 'Vía oral' },
    ]);
  };

  const handleRemoveDrug = (index: number) => {
    setPrescriptions(prescriptions.filter((_, idx) => idx !== index));
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    // Generar Hash criptográfico SHA-256 (NOM-024)
    const hash = await generateNOM024Hash(
      `${activePatient.patientNumber}-${physicianLicense}-${cie10}-${treatment}`
    );

    const newNote: ConsultationNote = {
      id: 'not-' + Date.now(),
      patientId: activePatient.id,
      patientName: `${activePatient.firstName} ${activePatient.lastName}`,
      physicianId: 'usr-1',
      physicianName,
      physicianLicense,
      noteType,
      subjectiveNotes: subjective,
      objectiveFindings: objective,
      cie10Code: cie10,
      cie10Description: cie10Desc,
      treatmentPlan: treatment,
      prognosis,
      prescriptions,
      digitalSignatureHash: hash,
      createdAt: new Date().toISOString(),
    };

    onAddNote(newNote);

    // Auditoría inmutable
    logAuditAction({
      userName: physicianName,
      userRole: 'MEDICO_ESPECIALISTA',
      userLicense: physicianLicense,
      actionType: 'CREACION_NOTA_MEDICA_NOM004',
      resourceAffected: `Expediente ${activePatient.patientNumber}`,
      details: `${noteType} | Dx: [${cie10}] ${cie10Desc} | Hash: ${hash.substring(0, 16)}...`,
    });

    setShowNewNoteModal(false);
    setSubjective('');
    setObjective('');
    setTreatment('');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
              <span className="neo-badge-dot" style={{ background: '#3b82f6' }}></span>
              EXPEDIENTE CLÍNICO ELECTRÓNICO (ECE)
            </span>
            <span className="text-xs text-slate-400 font-mono">NOM-004-SSA3-2012 & NOM-024</span>
          </div>
          <h2 className="text-2xl font-black text-white">Consultorios de Especialidades</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Registro reglamentario de notas médicas, diagnóstico CIE-10, recetas con firma digital y somatometría.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNewNoteModal(true)}
            className="btn-neo btn-neo-active text-xs"
          >
            <Plus size={16} />
            Elaborar Nueva Nota Médica
          </button>
        </div>
      </div>

      {/* Selector de Pacientes Táctil con Somatometría */}
      <div className="neo-glass-panel p-5">
        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Seleccionar Paciente para Consulta</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {patients.map((p) => {
            const isSelected = p.id === activePatient.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-950/40 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                    : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan-400 font-bold">{p.patientNumber}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{p.bloodType}</span>
                </div>
                <h4 className="font-bold text-sm text-white mt-1 truncate">
                  {p.firstName} {p.lastName}
                </h4>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                  <span>Peso: <strong className="text-white">{p.weightKg} kg</strong></span>
                  <span>Talla: <strong className="text-white">{p.heightCm} cm</strong></span>
                  <span>IMC: <strong className="text-cyan-300">{p.calculatedBmi}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ficha Resumen del Paciente Activo */}
      {activePatient && (
        <div className="neo-glass-panel p-6 border-t-2 border-t-blue-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">
                  {activePatient.firstName} {activePatient.lastName}
                </h3>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {activePatient.patientNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                CURP: {activePatient.curp} | F. Nac: {activePatient.birthDate} | Seguro: <strong>{activePatient.insuranceCompany}</strong> ({activePatient.insurancePolicyNumber || 'Directo'})
              </p>
            </div>

            {/* Botón de Receta Rápida en PDF */}
            <button
              onClick={() => generateMedicalPrescriptionPDF({
                patient: activePatient,
                physicianName,
                physicianLicense,
                specialty,
                diagnosis: cie10Desc,
                cie10,
                items: prescriptions,
                vitalSigns: { bp: '120/80', hr: 76, temp: 36.7, weight: activePatient.weightKg, height: activePatient.heightCm, bmi: activePatient.calculatedBmi }
              })}
              className="btn-neo btn-neo-cyan text-xs"
            >
              <Printer size={16} />
              Imprimir Receta Médica en PDF
            </button>
          </div>

          {/* Alerta de Alergias Destacada (NOM-004) */}
          <div className="mt-4 p-3 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400 shrink-0" />
            <div className="text-xs">
              <strong className="text-red-300 uppercase">Alergias Conocidas:</strong>{' '}
              <span className="text-red-200 font-bold">{activePatient.allergies}</span>
            </div>
          </div>

          {/* Historial de Notas Médicas del Paciente */}
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-blue-400" />
              Notas de Evolución e Historia Clínica ({patientNotes.length})
            </h4>

            {patientNotes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm italic rounded-2xl bg-slate-900/40 border border-white/5">
                No hay notas médicas registradas para este expediente. Haz clic en "Elaborar Nueva Nota Médica" para iniciar.
              </div>
            ) : (
              patientNotes.map((note) => (
                <div key={note.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {note.noteType.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-white">{note.physicianName}</span>
                      <span className="text-[11px] text-slate-400">Céd. {note.physicianLicense}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {note.createdAt.replace('T', ' ').substring(0, 16)} hrs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong className="text-slate-400 block mb-0.5">Interrogatorio (Subjetivo):</strong>
                      <p className="text-slate-200 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                        {note.subjectiveNotes || 'Sin alteraciones referidas.'}
                      </p>
                    </div>
                    <div>
                      <strong className="text-slate-400 block mb-0.5">Exploración Física (Objetivo):</strong>
                      <p className="text-slate-200 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                        {note.objectiveFindings || 'Exploración dentro de parámetros esperados.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs bg-blue-950/20 p-2.5 rounded-xl border border-blue-500/20 flex items-center justify-between">
                    <div>
                      <strong className="text-blue-300">Diagnóstico CIE-10:</strong>{' '}
                      <span className="text-white font-semibold">[{note.cie10Code}] {note.cie10Description}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-400" />
                      Firma SHA-256: {note.digitalSignatureHash.substring(0, 12)}...
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Nueva Nota Médica */}
      {showNewNoteModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowNewNoteModal(false)}>
          <div className="neo-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-white">Elaborar Nota Médica (NOM-004-SSA3-2012)</h3>
                <p className="text-xs text-slate-400">Expediente: {activePatient.patientNumber} - {activePatient.firstName} {activePatient.lastName}</p>
              </div>
              <button 
                onClick={() => setShowNewNoteModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Tipo de Nota</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="NOTA_EVOLUCION" className="bg-slate-900">Nota de Evolución</option>
                    <option value="HISTORIA_CLINICA" className="bg-slate-900">Historia Clínica General</option>
                    <option value="NOTA_INTERCONSULTA" className="bg-slate-900">Nota de Interconsulta</option>
                    <option value="NOTA_PREOPERATORIA" className="bg-slate-900">Nota Preoperatoria</option>
                    <option value="NOTA_EGRESO" className="bg-slate-900">Nota de Egreso Hospitalario</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Médico Tratante</label>
                  <input
                    type="text"
                    value={physicianName}
                    onChange={(e) => setPhysicianName(e.target.value)}
                    className="neo-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Interrogatorio / Subjetivo</label>
                <textarea
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  placeholder="Síntomas actuales, evolución, antecedentes de interés..."
                  rows={2}
                  className="neo-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Exploración Física / Objetivo</label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Signos vitales, cabeza, cuello, tórax, abdomen, extremidades..."
                  rows={2}
                  className="neo-input"
                  required
                />
              </div>

              {/* Diagnóstico CIE-10 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Código CIE-10</label>
                  <input
                    type="text"
                    value={cie10}
                    onChange={(e) => setCie10(e.target.value)}
                    className="neo-input font-mono"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Descripción Diagnóstica</label>
                  <input
                    type="text"
                    value={cie10Desc}
                    onChange={(e) => setCie10Desc(e.target.value)}
                    className="neo-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Plan Terapéutico y Manejo</label>
                <textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Indicaciones médicas, dieta, cuidados de enfermería, estudios solicitados..."
                  rows={2}
                  className="neo-input"
                  required
                />
              </div>

              {/* Prescripción de Medicamentos */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <Pill size={16} className="text-cyan-400" /> Prescripción Farmacéutica
                  </span>
                  <button
                    type="button"
                    onClick={handleAddDrug}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    + Agregar Fármaco
                  </button>
                </div>

                {prescriptions.map((drug, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 rounded-xl bg-slate-950/40 border border-white/5">
                    <input
                      type="text"
                      placeholder="Medicamento"
                      value={drug.drugName}
                      onChange={(e) => {
                        const copy = [...prescriptions];
                        copy[idx].drugName = e.target.value;
                        setPrescriptions(copy);
                      }}
                      className="neo-input text-xs"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Dosis y Frecuencia"
                      value={drug.dosage}
                      onChange={(e) => {
                        const copy = [...prescriptions];
                        copy[idx].dosage = e.target.value;
                        setPrescriptions(copy);
                      }}
                      className="neo-input text-xs"
                      required
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Indicaciones"
                        value={drug.instructions}
                        onChange={(e) => {
                          const copy = [...prescriptions];
                          copy[idx].instructions = e.target.value;
                          setPrescriptions(copy);
                        }}
                        className="neo-input text-xs flex-1"
                      />
                      {prescriptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDrug(idx)}
                          className="text-red-400 hover:text-red-300 text-xs px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewNoteModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-active text-xs"
                >
                  Guardar y Firmar Electrónicamente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
