// ==============================================================================
// MÓDULO DE CONSULTORIOS Y EXPEDIENTE CLÍNICO ELECTRÓNICO (ECE)
// Con Admisión/Triage Prellenado, Catálogo OMS CIE-11 y Dr. AI Copilot Farmacológico
// Cumplimiento Estricto con NOM-004-SSA3-2012 y NOM-024-SSA3-2012
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  AlertTriangle, 
  Stethoscope, 
  Pill, 
  ShieldCheck, 
  Search, 
  Printer,
  Scale,
  Sparkles,
  Bot,
  AlertOctagon,
  CheckCircle2,
  HeartPulse,
  Thermometer,
  Activity,
  Syringe,
  FileBadge,
  ArrowRight,
  ShieldAlert,
  ClipboardList,
  Flame,
  Info,
  ChevronDown,
  Droplet,
  Wind
} from 'lucide-react';
import { Patient, ConsultationNote, TriageAdmission, Cie11Disease } from '../../types/hospital';
import { generateMedicalPrescriptionPDF } from '../../lib/exportEngine';
import { generateNOM024Hash, logAuditAction } from '../../lib/supabaseClient';
import { 
  CIE11_MASTER_CATALOG, 
  searchCie11Diseases, 
  checkPatientDrugAllergies, 
  checkPathologyContraindications 
} from '../../lib/cie11AiEngine';

// Configuración de Estilo y Color de Alto Contraste para Patologías Frecuentes CIE-11
const FREQUENT_DISEASE_CHIPS = [
  {
    code: 'BA41.0',
    label: 'Infarto IAM',
    cie11Code: 'BA41.0',
    icon: Activity,
    className: 'cie11-chip-rose',
    dotColor: '#f43f5e',
  },
  {
    code: 'BA00',
    label: 'Hipertensión',
    cie11Code: 'BA00',
    icon: HeartPulse,
    className: 'cie11-chip-blue',
    dotColor: '#3b82f6',
  },
  {
    code: '5A11',
    label: 'Diabetes Tipo 2',
    cie11Code: '5A11',
    icon: Droplet,
    className: 'cie11-chip-amber',
    dotColor: '#f59e0b',
  },
  {
    code: '1B10',
    label: 'Dengue con/sin signos',
    cie11Code: '1B10',
    icon: Flame,
    className: 'cie11-chip-orange',
    dotColor: '#f97316',
  },
  {
    code: 'DB10.0',
    label: 'Apendicitis Aguda',
    cie11Code: 'DB10.0',
    icon: ShieldAlert,
    className: 'cie11-chip-purple',
    dotColor: '#a855f7',
  },
  {
    code: 'CA23',
    label: 'Asma Bronquial',
    cie11Code: 'CA23',
    icon: Wind,
    className: 'cie11-chip-cyan',
    dotColor: '#06b6d4',
  },
  {
    code: 'DC11',
    label: 'Colecistitis',
    cie11Code: 'DC11',
    icon: Stethoscope,
    className: 'cie11-chip-emerald',
    dotColor: '#10b981',
  },
];

interface ConsultoriosModuleProps {
  patients: Patient[];
  notes: ConsultationNote[];
  triageList?: TriageAdmission[];
  onAddNote: (note: ConsultationNote) => void;
}

export const ConsultoriosModule: React.FC<ConsultoriosModuleProps> = ({
  patients,
  notes,
  triageList = [],
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
  
  // Diagnósticos CIE-11 y CIE-10
  const [cie11Code, setCie11Code] = useState('BA41.0');
  const [cie11Title, setCie11Title] = useState('Infarto agudo de miocardio transmural con elevación del ST (IAMCEST)');
  const [cie10, setCie10] = useState('I21.0');
  const [cie10Desc, setCie10Desc] = useState('Infarto transmural agudo del miocardio de la pared anterior');
  const [selectedDisease, setSelectedDisease] = useState<Cie11Disease | null>(
    CIE11_MASTER_CATALOG.find(d => d.code === 'BA41.0') || CIE11_MASTER_CATALOG[0]
  );
  const [cie11SearchQuery, setCie11SearchQuery] = useState('');
  const [showCie11Dropdown, setShowCie11Dropdown] = useState(false);

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

  // Obtener ficha de admisión / triage del paciente seleccionado
  const activeTriage: TriageAdmission = useMemo(() => {
    const found = triageList.find(t => t.patientId === activePatient?.id);
    if (found) return found;

    // Fallback sintetizado si no se ha registrado triage explícito
    return {
      id: `trg-syn-${activePatient?.id || 'gen'}`,
      patientId: activePatient?.id || '',
      patientName: `${activePatient?.firstName || ''} ${activePatient?.lastName || ''}`,
      patientNumber: activePatient?.patientNumber || 'HPDH-2026',
      priority: 'AMARILLO_URGENCIA',
      bloodPressure: '120/80',
      heartRate: 76,
      respiratoryRate: 18,
      temperatureC: 36.7,
      oxygenSaturation: 98,
      bloodGlucose: 96,
      painScaleEva: 3,
      weightKg: activePatient?.weightKg || 70,
      heightCm: activePatient?.heightCm || 170,
      calculatedBmi: activePatient?.calculatedBmi || 24.2,
      chiefComplaint: activePatient?.chronicConditions 
        ? `Ingreso por seguimiento y control de: ${activePatient.chronicConditions}`
        : 'Valoración médica general por sintomatología de reciente comienzo',
      initialDiagnosis: 'En estudio clínico',
      evaluatingPhysician: 'Dra. Sofía Valenzuela Ríos (Admisión/Triage)',
      assignedDestination: 'CONSULTORIO_URGENCIAS',
      waitTimeMinutes: 8,
      status: 'EN_ATENCION',
      admissionTimestamp: activePatient?.createdAt || new Date().toISOString(),
    };
  }, [triageList, activePatient]);

  // Búsqueda en catálogo CIE-11
  const cie11SearchResults = useMemo(() => {
    if (!cie11SearchQuery.trim()) {
      return CIE11_MASTER_CATALOG.slice(0, 8);
    }
    return searchCie11Diseases(cie11SearchQuery);
  }, [cie11SearchQuery]);

  // Selección de diagnóstico CIE-11
  const handleSelectCie11 = (disease: Cie11Disease) => {
    setSelectedDisease(disease);
    setCie11Code(disease.code);
    setCie11Title(disease.title);
    setCie10(disease.cie10Equivalent);
    setCie10Desc(disease.title);
    setShowCie11Dropdown(false);
    setCie11SearchQuery('');
  };

  // Abrir Modal de Nota Médica con prellenado automático de Admisión y Triage
  const handleOpenNewNoteModal = () => {
    // Autollenado Subjetivo
    const defaultSubjective = `Paciente ingresa derivado de Admisión / Triage Hospitalario.\nMotivo referido: "${activeTriage.chiefComplaint}".\nAntecedentes Patológicos: ${activePatient?.pathologicalHistory || 'Sin antecedentes patológicos mayores referidos.'}\nAntecedentes Heredofamiliares: ${activePatient?.familyHistory || 'No aportados en interrogatorio previo.'}`;
    
    // Autollenado Objetivo con Signos Vitales y Somatometría de Triage
    const defaultObjective = `Signos Vitales recabados en Admisión / Triage:\n• TA: ${activeTriage.bloodPressure} mmHg | FC: ${activeTriage.heartRate} lpm | FR: ${activeTriage.respiratoryRate} rpm | Temp: ${activeTriage.temperatureC} °C\n• SpO2: ${activeTriage.oxygenSaturation}% | Glucemia: ${activeTriage.bloodGlucose ? `${activeTriage.bloodGlucose} mg/dL` : 'No valorada'} | Dolor (EVA): ${activeTriage.painScaleEva}/10\n• Somatometría: Peso ${activeTriage.weightKg || activePatient?.weightKg} kg | Talla ${activeTriage.heightCm || activePatient?.heightCm} cm | IMC ${activeTriage.calculatedBmi || activePatient?.calculatedBmi} kg/m² (${getBmiInterpretation(activeTriage.calculatedBmi || activePatient?.calculatedBmi || 22)}).\n• Paciente alerta, orientado en tiempo, espacio y persona. Ruidos cardíacos y campos pulmonares en evaluación.`;

    setSubjective(defaultSubjective);
    setObjective(defaultObjective);

    // Sugerir CIE-11 inicial acorde al motivo si aplica
    if (activeTriage.chiefComplaint.toLowerCase().includes('tórax') || activeTriage.chiefComplaint.toLowerCase().includes('pecho') || activeTriage.chiefComplaint.toLowerCase().includes('infarto')) {
      const infarto = CIE11_MASTER_CATALOG.find(d => d.code === 'BA41.0');
      if (infarto) handleSelectCie11(infarto);
    } else if (activeTriage.chiefComplaint.toLowerCase().includes('apéndice') || activeTriage.chiefComplaint.toLowerCase().includes('mcburney') || activeTriage.chiefComplaint.toLowerCase().includes('fosa ilíaca')) {
      const apen = CIE11_MASTER_CATALOG.find(d => d.code === 'DB10.0');
      if (apen) handleSelectCie11(apen);
    } else if (activeTriage.chiefComplaint.toLowerCase().includes('vesícula') || activeTriage.chiefComplaint.toLowerCase().includes('colecist')) {
      const cole = CIE11_MASTER_CATALOG.find(d => d.code === 'DC11');
      if (cole) handleSelectCie11(cole);
    } else if (activeTriage.chiefComplaint.toLowerCase().includes('asma') || activeTriage.chiefComplaint.toLowerCase().includes('sibilan')) {
      const asma = CIE11_MASTER_CATALOG.find(d => d.code === 'CA23');
      if (asma) handleSelectCie11(asma);
    }

    setShowNewNoteModal(true);
  };

  const handleAddDrug = () => {
    setPrescriptions([
      ...prescriptions,
      { drugName: '', dosage: '', frequency: 'Cada 8 horas', duration: '7 días', instructions: 'Vía oral con alimentos' },
    ]);
  };

  // Botón Dr. AI Copilot: Prescribir con 1-Clic
  const handlePrescribeAiDrug = (drug: any) => {
    // Verificar si ya está en la receta
    const alreadyExists = prescriptions.some(p => p.drugName.toLowerCase() === drug.drugName.toLowerCase());
    if (alreadyExists) {
      alert(`El medicamento "${drug.drugName}" ya se encuentra agregado en la receta.`);
      return;
    }

    // Agregar directamente a la lista de prescripciones
    setPrescriptions([
      ...prescriptions,
      {
        drugName: drug.drugName,
        dosage: drug.dosage,
        frequency: drug.frequency,
        duration: drug.duration,
        instructions: drug.instructions,
      }
    ]);

    // Anexar recomendación de cuidados al tratamiento si está vacío
    if (!treatment.includes(drug.drugName)) {
      setTreatment(prev => {
        const prefix = prev.trim() ? `${prev.trim()}\n` : '';
        return `${prefix}• Iniciar ${drug.drugName} ${drug.dosage} ${drug.frequency}. Razón clínica IA: ${drug.rationale}`;
      });
    }
  };

  // Botón Dr. AI Copilot: Agregar Laboratorio o Estudio
  const handleAddAiStudy = (studyName: string) => {
    setTreatment(prev => {
      if (prev.includes(studyName)) return prev;
      const prefix = prev.trim() ? `${prev.trim()}\n` : '';
      return `${prefix}• Solicitar de carácter prioritario: ${studyName}`;
    });
  };

  // Botón Dr. AI Copilot: Agregar Medida Higiénico-Dietética
  const handleAddAiCare = (careText: string) => {
    setTreatment(prev => {
      if (prev.includes(careText)) return prev;
      const prefix = prev.trim() ? `${prev.trim()}\n` : '';
      return `${prefix}• Indicación al paciente: ${careText}`;
    });
  };

  const handleRemoveDrug = (index: number) => {
    setPrescriptions(prescriptions.filter((_, idx) => idx !== index));
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    // Generar Hash criptográfico SHA-256 (NOM-024)
    const hash = await generateNOM024Hash(
      `${activePatient.patientNumber}-${physicianLicense}-${cie11Code}-${cie10}-${treatment}`
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
      cie11Code,
      cie11Description: cie11Title,
      aiAssistedPrescription: true,
      aiRecommendedLabs: selectedDisease?.suggestedLabs || [],
      aiGeneralCare: selectedDisease?.generalCare || [],
      treatmentPlan: treatment,
      prognosis,
      prescriptions,
      digitalSignatureHash: hash,
      triageVitalSignsSnap: {
        bp: activeTriage.bloodPressure,
        hr: activeTriage.heartRate,
        rr: activeTriage.respiratoryRate,
        temp: activeTriage.temperatureC,
        spo2: activeTriage.oxygenSaturation,
        glucose: activeTriage.bloodGlucose,
        eva: activeTriage.painScaleEva,
        weight: activeTriage.weightKg || activePatient.weightKg,
        height: activeTriage.heightCm || activePatient.heightCm,
        bmi: activeTriage.calculatedBmi || activePatient.calculatedBmi,
        triagePriority: activeTriage.priority
      },
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
      details: `${noteType} | Dx CIE-11: [${cie11Code}] ${cie11Title} | CIE-10: [${cie10}] | Hash: ${hash.substring(0, 16)}...`,
    });

    setShowNewNoteModal(false);
  };

  function getBmiInterpretation(bmi: number): string {
    if (bmi < 18.5) return 'Bajo peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    if (bmi < 35) return 'Obesidad Grado I';
    return 'Obesidad Grado II/III';
  }

  function getPriorityBadgeColor(priority: string) {
    switch (priority) {
      case 'ROJO_REANIMACION':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'NARANJA_EMERGENCIA':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'AMARILLO_URGENCIA':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'VERDE_MENOR':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  }

  function getPriorityLabel(priority: string) {
    switch (priority) {
      case 'ROJO_REANIMACION':
        return 'Prioridad I - Reanimación Crítica';
      case 'NARANJA_EMERGENCIA':
        return 'Prioridad II - Emergencia Médica';
      case 'AMARILLO_URGENCIA':
        return 'Prioridad III - Urgencia Calificada';
      case 'VERDE_MENOR':
        return 'Prioridad IV - Urgencia Menor';
      default:
        return 'Prioridad V - No Urgente / Consulta';
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Principal de Consultorios */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <span className="neo-badge neo-badge-blue">
              <span className="neo-badge-dot" style={{ background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }}></span>
              EXPEDIENTE CLÍNICO ELECTRÓNICO (ECE)
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 font-bold flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" /> OMS CIE-11 & Dr. AI Copilot
            </span>
            <span className="text-xs text-blue-200 font-bold font-mono tracking-wider">NOM-004 & NOM-024</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm flex items-center gap-2.5">
            <Stethoscope className="text-blue-400" size={26} />
            Consultorios Médicos de Especialidades
          </h2>
          <p className="text-slate-200 text-sm mt-1 font-medium leading-relaxed">
            Expediente alimentado en tiempo real desde <strong>Admisión y Triage</strong> con somatometría, vacunas, signos vitales, catálogo <strong>OMS CIE-11</strong> y autoayuda farmacológica con IA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenNewNoteModal}
            className="btn-neo btn-neo-active text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
          >
            <Plus size={16} />
            Elaborar Nota Médica con IA
          </button>
        </div>
      </div>

      {/* Selector de Pacientes Táctil con Somatometría */}
      <div className="neo-glass-panel p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ClipboardList size={14} className="text-blue-400" />
            Pacientes en Espera de Consulta / Expedientes Activos ({patients.length})
          </label>
          <span className="text-[11px] text-slate-400 font-medium">Haz clic en un paciente para abrir su expediente integral</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {patients.map((p) => {
            const isSelected = p.id === activePatient?.id;
            const patientTriage = triageList.find(t => t.patientId === p.id);
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-950/50 shadow-[0_0_24px_rgba(37,99,235,0.4)] scale-[1.01]' 
                    : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan-400 font-bold">{p.patientNumber}</span>
                  <div className="flex items-center gap-1.5">
                    {patientTriage && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityBadgeColor(patientTriage.priority)}`}>
                        {patientTriage.priority.substring(0, 4)}
                      </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{p.bloodType}</span>
                  </div>
                </div>
                <h4 className="font-bold text-sm text-white mt-1.5 truncate">
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

      {/* ============================================================================== */}
      {/* FICHA INTEGRAL DE ADMISIÓN, TRIAGE Y EXPEDIENTE CLÍNICO PRELLENADO              */}
      {/* ============================================================================== */}
      {activePatient && (
        <div className="neo-glass-panel p-6 border-t-4 border-t-blue-500 shadow-2xl space-y-6">
          {/* Header del Paciente */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {activePatient.firstName} {activePatient.lastName}
                </h3>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-0.5 rounded-lg shadow-sm">
                  {activePatient.patientNumber}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${getPriorityBadgeColor(activeTriage.priority)}`}>
                  <Flame size={13} />
                  {getPriorityLabel(activeTriage.priority)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold border border-white/10">
                  Grupo: {activePatient.bloodType}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 font-medium flex items-center gap-2 flex-wrap">
                <span>CURP: <strong className="text-white font-mono">{activePatient.curp}</strong></span>
                <span>•</span>
                <span>F. Nacimiento: <strong className="text-white">{activePatient.birthDate}</strong></span>
                <span>•</span>
                <span>Sexo: <strong className="text-white">{activePatient.gender}</strong></span>
                <span>•</span>
                <span>Aseguradora: <strong className="text-emerald-300">{activePatient.insuranceCompany}</strong> ({activePatient.insurancePolicyNumber || 'Pago Directo'})</span>
              </p>
            </div>

            {/* Acciones de Cabecera */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleOpenNewNoteModal}
                className="btn-neo btn-neo-active text-xs flex items-center gap-1.5"
              >
                <Plus size={15} />
                Elaborar Nota Médica
              </button>

              <button
                onClick={() => generateMedicalPrescriptionPDF({
                  patient: activePatient,
                  physicianName,
                  physicianLicense,
                  specialty,
                  diagnosis: cie10Desc,
                  cie10,
                  cie11: cie11Code,
                  cie11Desc: cie11Title,
                  items: prescriptions,
                  vitalSigns: { 
                    bp: activeTriage.bloodPressure, 
                    hr: activeTriage.heartRate, 
                    temp: activeTriage.temperatureC, 
                    weight: activeTriage.weightKg || activePatient.weightKg, 
                    height: activeTriage.heightCm || activePatient.heightCm, 
                    bmi: activeTriage.calculatedBmi || activePatient.calculatedBmi,
                    spo2: activeTriage.oxygenSaturation,
                    glucose: activeTriage.bloodGlucose,
                    painScale: activeTriage.painScaleEva
                  },
                  generalCare: selectedDisease?.generalCare
                })}
                className="btn-neo btn-neo-cyan text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
              >
                <Printer size={15} />
                Descargar Receta Oficial en PDF
              </button>
            </div>
          </div>

          {/* Banner Rojo de Alergias (Crítico NOM-004) */}
          <div className="p-4 rounded-2xl bg-red-950/40 border-2 border-red-500/50 flex items-start sm:items-center gap-3.5 shadow-lg shadow-red-950/40">
            <div className="p-2 rounded-xl bg-red-600/30 border border-red-500/50 text-red-300 shrink-0">
              <AlertOctagon size={22} />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <strong className="text-red-300 uppercase font-black text-sm tracking-wide">
                  ALERGIAS MEDICAMENTOSAS / ADVERSAS:
                </strong>
                <span className="px-2 py-0.2 rounded bg-red-500/30 text-red-200 text-[10px] font-bold border border-red-500/40">
                  REVISIÓN OBLIGATORIA
                </span>
              </div>
              <p className="text-red-100 font-bold text-sm mt-0.5">
                {activePatient.allergies}
              </p>
              <span className="text-red-300/80 text-[11px] block mt-0.5">
                * El Dr. AI Copilot bloqueará automáticamente cualquier prescripción incompatible con este historial de hipersensibilidad.
              </span>
            </div>
          </div>

          {/* Panel de Datos Recabados en Admisión y Triage */}
          <div className="rounded-2xl bg-slate-900/70 border border-blue-500/30 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="text-rose-400" size={18} />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Ficha de Admisión y Triage Hospitalario (Prellenado Automático)
                </h4>
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <span>Evaluador: <strong className="text-white">{activeTriage.evaluatingPhysician}</strong></span>
                <span>•</span>
                <span className="font-mono text-cyan-300">{activeTriage.admissionTimestamp.replace('T', ' ').substring(0, 16)} hrs</span>
              </div>
            </div>

            {/* Cuadrícula de Signos Vitales y Somatometría */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* Presión Arterial */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presión Arterial</span>
                <span className="text-lg font-black text-white mt-1 font-mono">{activeTriage.bloodPressure}</span>
                <span className="text-[10px] text-slate-400">mmHg (TA)</span>
              </div>

              {/* Frecuencia Cardíaca */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frec. Cardíaca</span>
                <span className="text-lg font-black text-rose-400 mt-1 font-mono">{activeTriage.heartRate}</span>
                <span className="text-[10px] text-slate-400">lpm (FC)</span>
              </div>

              {/* Frecuencia Respiratoria */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frec. Respiratoria</span>
                <span className="text-lg font-black text-blue-400 mt-1 font-mono">{activeTriage.respiratoryRate}</span>
                <span className="text-[10px] text-slate-400">rpm (FR)</span>
              </div>

              {/* Temperatura */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temperatura</span>
                <span className={`text-lg font-black mt-1 font-mono ${activeTriage.temperatureC >= 38 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {activeTriage.temperatureC} °C
                </span>
                <span className="text-[10px] text-slate-400">{activeTriage.temperatureC >= 38 ? 'Hipertermia' : 'Afebril'}</span>
              </div>

              {/* Saturación SpO2 */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Oximetría SpO2</span>
                <span className={`text-lg font-black mt-1 font-mono ${activeTriage.oxygenSaturation < 93 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {activeTriage.oxygenSaturation}%
                </span>
                <span className="text-[10px] text-slate-400">{activeTriage.oxygenSaturation < 93 ? 'Desaturación' : 'Adecuada'}</span>
              </div>

              {/* Glucosa Capilar */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Glucemia</span>
                <span className="text-lg font-black text-amber-300 mt-1 font-mono">
                  {activeTriage.bloodGlucose ? `${activeTriage.bloodGlucose}` : '--'}
                </span>
                <span className="text-[10px] text-slate-400">mg/dL</span>
              </div>

              {/* Dolor EVA */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dolor (EVA)</span>
                <span className={`text-lg font-black mt-1 font-mono ${activeTriage.painScaleEva >= 7 ? 'text-rose-500' : activeTriage.painScaleEva >= 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {activeTriage.painScaleEva}/10
                </span>
                <span className="text-[10px] text-slate-400">{activeTriage.painScaleEva >= 7 ? 'Severo' : activeTriage.painScaleEva >= 4 ? 'Moderado' : 'Leve/Nulo'}</span>
              </div>
            </div>

            {/* Somatometría e IMC */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-6 flex-wrap">
                <span className="text-slate-300">
                  Peso al Ingreso: <strong className="text-white text-sm font-mono">{activeTriage.weightKg || activePatient.weightKg} kg</strong>
                </span>
                <span className="text-slate-300">
                  Talla: <strong className="text-white text-sm font-mono">{activeTriage.heightCm || activePatient.heightCm} cm</strong>
                </span>
                <span className="text-slate-300">
                  IMC: <strong className="text-cyan-300 text-sm font-mono">{activeTriage.calculatedBmi || activePatient.calculatedBmi} kg/m²</strong>
                  <span className="ml-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 text-[10px] font-bold">
                    {getBmiInterpretation(activeTriage.calculatedBmi || activePatient.calculatedBmi || 22)}
                  </span>
                </span>
              </div>
              <div className="text-slate-400">
                Destino asignado: <strong className="text-white">{activeTriage.assignedDestination}</strong>
              </div>
            </div>

            {/* Motivo de Consulta en Triage */}
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs space-y-1">
              <strong className="text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                <Info size={14} /> Motivo de Ingreso / Triage Capturado por Admisión:
              </strong>
              <p className="text-white font-medium pl-5 text-sm">
                "{activeTriage.chiefComplaint}"
              </p>
              {activeTriage.initialDiagnosis && (
                <p className="text-slate-300 text-[11px] pl-5">
                  Impresión diagnóstica inicial en Triage: <strong className="text-cyan-300">{activeTriage.initialDiagnosis}</strong>
                </p>
              )}
            </div>

            {/* Vacunas y Antecedentes en Dos Columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs pt-1">
              {/* Esquema de Vacunación */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  <Syringe size={15} />
                  Esquema de Vacunación Registrado en Admisión
                </div>
                {activePatient.vaccinationHistory && activePatient.vaccinationHistory.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activePatient.vaccinationHistory.map((vax, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-400" />
                        {vax}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Esquema básico al corriente según interrogatorio.</p>
                )}
              </div>

              {/* Antecedentes Clínicos */}
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
                  <FileBadge size={15} />
                  Antecedentes Patológicos y Heredofamiliares
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <strong className="text-slate-400">Patológicos: </strong>
                    <span className="text-slate-200">{activePatient.pathologicalHistory || activePatient.chronicConditions || 'Sin antecedentes de importancia.'}</span>
                  </div>
                  <div>
                    <strong className="text-slate-400">Heredofamiliares: </strong>
                    <span className="text-slate-200">{activePatient.familyHistory || 'Negados por el paciente.'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Notas Médicas del Expediente */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-blue-400" />
                Notas de Evolución e Historia Clínica ({patientNotes.length})
              </h4>
              <button
                onClick={handleOpenNewNoteModal}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
              >
                <Plus size={14} /> Nueva Nota
              </button>
            </div>

            {patientNotes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic rounded-2xl bg-slate-900/40 border border-white/5">
                No hay notas médicas registradas para este expediente. Haz clic en "Elaborar Nota Médica con IA" para comenzar.
              </div>
            ) : (
              patientNotes.map((note) => (
                <div key={note.id} className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3 shadow-md hover:border-white/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-0.5 rounded-lg font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {note.noteType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-semibold text-white">{note.physicianName}</span>
                      <span className="text-[11px] text-slate-400">Céd. {note.physicianLicense}</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400">
                      {note.createdAt.replace('T', ' ').substring(0, 16)} hrs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong className="text-slate-400 block mb-1">Interrogatorio / Subjetivo:</strong>
                      <div className="text-slate-200 bg-slate-950/50 p-3 rounded-xl border border-white/5 whitespace-pre-line">
                        {note.subjectiveNotes || 'Sin alteraciones referidas.'}
                      </div>
                    </div>
                    <div>
                      <strong className="text-slate-400 block mb-1">Exploración Física / Objetivo:</strong>
                      <div className="text-slate-200 bg-slate-950/50 p-3 rounded-xl border border-white/5 whitespace-pre-line">
                        {note.objectiveFindings || 'Exploración dentro de parámetros normales.'}
                      </div>
                    </div>
                  </div>

                  {/* Diagnóstico Doble CIE-11 & CIE-10 */}
                  <div className="text-xs bg-indigo-950/30 p-3 rounded-xl border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      {note.cie11Code && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                            CIE-11 OMS
                          </span>
                          <span className="text-white font-bold">[{note.cie11Code}] {note.cie11Description}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
                          CIE-10 NOM-004
                        </span>
                        <span className="text-slate-200 font-medium">[{note.cie10Code}] {note.cie10Description}</span>
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 shrink-0 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <ShieldCheck size={13} />
                      NOM-024: {note.digitalSignatureHash.substring(0, 14)}...
                    </span>
                  </div>

                  {/* Fármacos Prescritos en esta Nota */}
                  {note.prescriptions && note.prescriptions.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/10 text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                        <strong className="text-cyan-300 flex items-center gap-1.5">
                          <Pill size={14} /> Prescripción Médica Oficial ({note.prescriptions.length} fármacos):
                        </strong>
                        <button
                          type="button"
                          onClick={() => generateMedicalPrescriptionPDF({
                            patient: activePatient,
                            physicianName: note.physicianName,
                            physicianLicense: note.physicianLicense,
                            specialty: 'Medicina General y Especialidades',
                            diagnosis: note.cie10Description,
                            cie10: note.cie10Code,
                            cie11: note.cie11Code,
                            cie11Desc: note.cie11Description,
                            items: note.prescriptions.map(p => ({
                              drugName: p.drugName,
                              dosage: p.dosage,
                              frequency: p.frequency || 'Cada 8 hrs',
                              duration: p.duration || '7 días',
                              instructions: p.instructions || 'Vía oral con alimentos'
                            })),
                            vitalSigns: note.triageVitalSignsSnap ? {
                              bp: note.triageVitalSignsSnap.bp,
                              hr: note.triageVitalSignsSnap.hr,
                              temp: note.triageVitalSignsSnap.temp,
                              weight: note.triageVitalSignsSnap.weight,
                              height: note.triageVitalSignsSnap.height,
                              bmi: note.triageVitalSignsSnap.bmi,
                              spo2: note.triageVitalSignsSnap.spo2,
                              glucose: note.triageVitalSignsSnap.glucose,
                              painScale: note.triageVitalSignsSnap.eva
                            } : undefined,
                            generalCare: note.aiGeneralCare
                          })}
                          className="btn-neo btn-neo-cyan text-xs flex items-center gap-1.5 px-3 py-1 shadow-sm shrink-0"
                        >
                          <Printer size={13} />
                          Descargar Receta en PDF
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {note.prescriptions.map((pr, i) => (
                          <div key={i} className="text-slate-300 flex items-center gap-2 flex-wrap">
                            <span className="text-cyan-400 font-bold">• {pr.drugName}</span>
                            <span className="text-slate-400 font-mono font-medium">({pr.dosage}, {pr.frequency})</span>
                            <span className="text-slate-500 italic">- {pr.instructions}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MODAL PARA ELABORACIÓN DE NOTA MÉDICA CON DR. AI COPILOT Y CIE-11              */}
      {/* ============================================================================== */}
      {showNewNoteModal && activePatient && (
        <div className="neo-modal-backdrop" onClick={() => setShowNewNoteModal(false)}>
          <div 
            className="neo-modal-content p-6 max-w-4xl max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={20} />
                    Elaboración de Nota Médica con IA (NOM-004-SSA3-2012)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Expediente: <strong className="text-blue-700 font-mono font-bold">{activePatient.patientNumber}</strong> — <span className="font-semibold text-slate-800">{activePatient.firstName} {activePatient.lastName}</span> | Triage: <span className="text-amber-700 font-black">{activeTriage.priority}</span>
                </p>
              </div>
              <button 
                onClick={() => setShowNewNoteModal(false)}
                className="text-slate-400 hover:text-slate-800 text-xl font-bold p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Aviso de Prellenado desde Admisión / Triage */}
            <div className="p-3 rounded-xl bg-blue-50/90 border border-blue-200 flex items-center justify-between text-xs text-blue-900 shadow-sm">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                Signos vitales de Triage, somatometría y motivo de urgencia fueron precargados automáticamente.
              </span>
              <span className="font-mono text-[11px] text-blue-800 font-bold shrink-0 ml-2">TA: {activeTriage.bloodPressure} | Temp: {activeTriage.temperatureC}°C | FC: {activeTriage.heartRate}</span>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Tipo de Nota Reglamentaria</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="NOTA_EVOLUCION">Nota de Evolución Médica</option>
                    <option value="HISTORIA_CLINICA">Historia Clínica General Integral</option>
                    <option value="NOTA_INTERCONSULTA">Nota de Interconsulta Especializada</option>
                    <option value="NOTA_PREOPERATORIA">Nota Preoperatoria / Prequirúrgica</option>
                    <option value="NOTA_EGRESO">Nota de Egreso Hospitalario</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Médico Tratante y Cédula</label>
                  <input
                    type="text"
                    value={physicianName}
                    onChange={(e) => setPhysicianName(e.target.value)}
                    className="neo-input"
                    required
                  />
                </div>
              </div>

              {/* Subjetivo y Objetivo Prellenados */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Interrogatorio / Subjetivo (Motivo de Triage & Padecimiento Actual)
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">NOM-004 SOAP</span>
                </div>
                <textarea
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  rows={3}
                  className="neo-input text-xs leading-relaxed"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Exploración Física / Objetivo (Signos Vitales de Triage & Somatometría)
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">NOM-004 SOAP</span>
                </div>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  rows={4}
                  className="neo-input text-xs leading-relaxed"
                  required
                />
              </div>

              {/* ============================================================================== */}
              {/* BUSCADOR Y CATÁLOGO OFICIAL OMS CIE-11 CON EQUIVALENCIA CIE-10                 */}
              {/* ============================================================================== */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <Search size={16} />
                    </span>
                    <strong className="text-sm text-slate-900 uppercase tracking-wide font-black">
                      Catálogo Oficial OMS CIE-11 (Clasificación Internacional 11.ª Revisión)
                    </strong>
                  </div>
                  <span className="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Equivalencia Automática NOM-004 CIE-10
                  </span>
                </div>

                {/* Input de Búsqueda Predictiva */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar diagnóstico por nombre, código CIE-11 (ej. BA41.0, 5A11, DB10.0) o categoría..."
                    value={cie11SearchQuery}
                    onChange={(e) => {
                      setCie11SearchQuery(e.target.value);
                      setShowCie11Dropdown(true);
                    }}
                    onFocus={() => setShowCie11Dropdown(true)}
                    className="neo-input pl-9 text-xs"
                  />
                  <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                  
                  {/* Dropdown de Resultados */}
                  {showCie11Dropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100">
                      {cie11SearchResults.length === 0 ? (
                        <div className="p-3 text-xs text-slate-500 text-center">
                          No se encontraron patologías en el catálogo para "{cie11SearchQuery}"
                        </div>
                      ) : (
                        cie11SearchResults.map((dis) => (
                          <div
                            key={dis.code}
                            onClick={() => handleSelectCie11(dis)}
                            className="p-2.5 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px] border border-blue-200">
                                  {dis.code}
                                </span>
                                <span className="font-bold text-slate-900">{dis.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                {dis.chapter} • <strong className="text-slate-700">{dis.clinicalCategory}</strong>
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-600 font-mono shrink-0 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                              CIE-10: {dis.cie10Equivalent}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Chips de Accesos Rápidos de Patologías Comunes con Alto Contraste y Color */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="cie11-frecuentes-tag">
                    <Sparkles size={13} className="text-amber-500" /> Frecuentes:
                  </span>
                  {FREQUENT_DISEASE_CHIPS.map((chip) => {
                    const isSelected = cie11Code === chip.code;
                    const IconComponent = chip.icon;
                    return (
                      <button
                        key={chip.code}
                        type="button"
                        onClick={() => {
                          const found = CIE11_MASTER_CATALOG.find(d => d.code === chip.code);
                          if (found) handleSelectCie11(found);
                        }}
                        className={`cie11-chip-btn ${chip.className} ${isSelected ? 'active' : ''}`}
                      >
                        <span 
                          style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '9999px', 
                            backgroundColor: isSelected ? '#ffffff' : chip.dotColor,
                            boxShadow: isSelected ? '0 0 8px #ffffff' : `0 0 6px ${chip.dotColor}`,
                            flexShrink: 0
                          }} 
                        />
                        <IconComponent size={14} className="cie11-chip-icon shrink-0" />
                        <span className="cie11-chip-label">{chip.label}</span>
                        <span className="cie11-chip-badge">{chip.cie11Code}</span>
                        {isSelected && (
                          <CheckCircle2 size={14} className="cie11-chip-check shrink-0 ml-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Ficha del Diagnóstico Seleccionado con Alto Contraste */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded bg-cyan-100 text-cyan-900 border border-cyan-300 font-mono font-black text-xs shadow-sm">
                        CIE-11: {cie11Code}
                      </span>
                      <strong className="text-sm font-black text-slate-900 tracking-tight">{cie11Title}</strong>
                    </div>
                    <div className="text-slate-600 mt-1 flex items-center gap-3 flex-wrap">
                      <span>Equivalencia CIE-10: <strong className="font-mono text-slate-900">{cie10}</strong></span>
                      <span>•</span>
                      <span>Capítulo: <strong className="text-blue-700 font-semibold">{selectedDisease?.chapter}</strong></span>
                    </div>
                  </div>
                  <span className="text-[11px] text-indigo-800 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0 shadow-sm">
                    {selectedDisease?.clinicalCategory || 'Especialidad Médica'}
                  </span>
                </div>
              </div>

              {/* ============================================================================== */}
              {/* DR. AI COPILOT: AUTOAYUDA FARMACOLÓGICA Y GUARDIÁN DE ALERGIAS                 */}
              {/* ============================================================================== */}
              {selectedDisease && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-cyan-50/40 to-blue-50/50 border border-indigo-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200">
                        <Bot size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          Dr. AI Copilot: Autoayuda Farmacológica y Asistencia Clínica
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold">
                            CENETEC & OMS GPC
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          Recomendaciones calibradas para <strong className="text-indigo-900">{selectedDisease.title}</strong> con verificación de alergias del paciente en tiempo real.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fármacos Recomendados de 1ra y 2da Línea */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      Fármacos Recomendados por Guías de Práctica Clínica (Haz clic en "+ Prescribir" para agregar):
                    </span>
                    <div className="space-y-2.5">
                      {selectedDisease.suggestedDrugs.map((drug) => {
                        // Comprobar conflicto con alergias del paciente
                        const allergyCheck = checkPatientDrugAllergies(
                          activePatient.allergies, 
                          drug.drugName, 
                          drug.activeSubstance
                        );

                        // Comprobar contraindicación de patología (ej: AINEs en Dengue)
                        const contraCheck = checkPathologyContraindications(
                          selectedDisease.code,
                          drug.drugName
                        );

                        const hasSafetyAlert = allergyCheck.hasConflict || contraCheck.isContraindicated;

                        return (
                          <div 
                            key={drug.id}
                            className={`p-3 rounded-xl border transition-all ${
                              hasSafetyAlert
                                ? 'bg-red-50 border-2 border-red-300 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-md'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    drug.line === 'PRIMERA_LINEA'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                                  }`}>
                                    {drug.line === 'PRIMERA_LINEA' ? '1.ª Línea de Elección' : '2.ª Línea / Coadyuvante'}
                                  </span>
                                  <strong className="text-slate-900 text-sm font-bold">{drug.drugName}</strong>
                                  <span className="text-xs text-blue-700 font-mono font-bold">({drug.dosage})</span>
                                </div>
                                <p className="text-[11px] text-slate-700 mt-1">
                                  <strong className="text-slate-900">Posología:</strong> {drug.frequency} por {drug.duration} • <span className="text-slate-600">{drug.instructions}</span>
                                </p>
                                <p className="text-[11px] text-slate-600 mt-0.5 italic">
                                  💡 <strong className="text-slate-800">Razón Clínica:</strong> {drug.rationale}
                                </p>
                              </div>

                              {/* Botón de Prescripción con 1-Clic o Bloqueo por Alergia */}
                              <div className="shrink-0 pt-1 sm:pt-0">
                                {hasSafetyAlert ? (
                                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-red-100 text-red-700 border border-red-300 flex items-center gap-1.5 shadow-sm">
                                    <ShieldAlert size={14} /> Fármaco Contraindicado
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handlePrescribeAiDrug(drug)}
                                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all hover:scale-105"
                                  >
                                    <Plus size={14} /> + Prescribir con 1-Clic
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Alerta de Seguridad Desplegada */}
                            {allergyCheck.hasConflict && (
                              <div className="mt-2.5 p-2 rounded-lg bg-red-100 border border-red-300 flex items-center gap-2 text-xs text-red-800">
                                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                                <span>{allergyCheck.warningMessage}</span>
                              </div>
                            )}

                            {contraCheck.isContraindicated && (
                              <div className="mt-2.5 p-2 rounded-lg bg-red-100 border border-red-300 flex items-center gap-2 text-xs text-red-800">
                                <AlertOctagon size={16} className="text-red-600 shrink-0" />
                                <span>{contraCheck.warning}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Estudios de Laboratorio y Gabinete Sugeridos */}
                  {selectedDisease.suggestedLabs && selectedDisease.suggestedLabs.length > 0 && (
                    <div className="pt-2 border-t border-indigo-100">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Estudios de Laboratorio Recomendados (Haz clic para anexar al plan):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDisease.suggestedLabs.map((lab, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAddAiStudy(lab)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-cyan-500 hover:text-cyan-800 hover:bg-cyan-50 transition-all flex items-center gap-1 shadow-sm font-medium"
                          >
                            <Plus size={11} className="text-cyan-600" />
                            {lab}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medidas Higiénico Dietéticas Sugeridas */}
                  {selectedDisease.generalCare && selectedDisease.generalCare.length > 0 && (
                    <div className="pt-2 border-t border-indigo-100">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Medidas Higiénico-Dietéticas Recomendadas por IA (Haz clic para anexar):
                      </span>
                      <div className="space-y-1">
                        {selectedDisease.generalCare.map((care, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm">
                            <span>• {care}</span>
                            <button
                              type="button"
                              onClick={() => handleAddAiCare(care)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold ml-2 shrink-0"
                            >
                              + Anexar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Plan Terapéutico y Manejo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Plan Terapéutico y Manejo Médico</label>
                <textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Indicaciones médicas, dieta, cuidados de enfermería, estudios solicitados..."
                  rows={3}
                  className="neo-input text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Prescripción Farmacéutica */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <Pill size={16} className="text-blue-600" /> Prescripción Farmacéutica Oficial ({prescriptions.length} fármacos)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddDrug}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> + Agregar Fármaco Manual
                  </button>
                </div>

                {prescriptions.map((drug, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
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
                        placeholder="Indicaciones de toma"
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
                          className="text-red-500 hover:text-red-700 text-xs px-2 py-1 font-bold"
                          title="Eliminar fármaco"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pronóstico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Pronóstico Médico (NOM-004)</label>
                <input
                  type="text"
                  value={prognosis}
                  onChange={(e) => setPrognosis(e.target.value)}
                  className="neo-input text-xs"
                  required
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewNoteModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-active text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <ShieldCheck size={16} />
                  Firmar Electrónicamente y Guardar (NOM-024)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
