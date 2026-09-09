// ==============================================================================
// DEFINICIONES DE TIPOS HOSPITAL PUERTA DE HIERRO (TEPIC)
// Cumplimiento con NOM-024-SSA3-2012, NOM-004-SSA3-2012 y Normas Hospitalarias
// ==============================================================================

export type UserRole =
  | 'ADMINISTRADOR_UNICO'
  | 'DIRECTOR_MEDICO'
  | 'MEDICO_ESPECIALISTA'
  | 'MEDICO_URGENCIOLOGO'
  | 'ENFERMERIA_JEFA'
  | 'ENFERMERIA_GENERAL'
  | 'QUIMICO_QFB'
  | 'RADIOLOGO_IMAGEN'
  | 'FARMACEUTICO'
  | 'INSTRUMENTISTA_CEYE'
  | 'CAJERO_RECEPCION'
  | 'ADMINISTRADOR_SISTEMA';

export type ShiftType =
  | 'MATUTINO'     // 07:00 - 15:00
  | 'VESPERTINO'   // 14:30 - 21:30
  | 'NOCTURNO_A'   // 21:00 - 08:00
  | 'NOCTURNO_B'   // 21:00 - 08:00
  | 'JORNADA_ESPECIAL'; // Fin de semana / Festivos

export type TriagePriority =
  | 'ROJO_REANIMACION'   // 0 min - Paro cardiorrespiratorio, shock severo
  | 'NARANJA_EMERGENCIA' // <10 min - Dolor torácico opresivo, dificultad respiratoria
  | 'AMARILLO_URGENCIA'  // <30-60 min - Dolor abdominal agudo, fracturas
  | 'VERDE_MENOR'        // <120 min - Infección leve, contusión
  | 'AZUL_NO_URGENTE';   // <240 min - Valoración de rutina, curación

export type BedStatus =
  | 'DISPONIBLE'
  | 'OCUPADA'
  | 'LIMPIEZA_DESINFECCION'
  | 'AISLAMIENTO_INFECCIOSO'
  | 'MANTENIMIENTO';

export type BedArea =
  | 'UCI_ADULTOS'
  | 'UCIN_NEONATAL'
  | 'TERAPIA_INTERMEDIA'
  | 'PISO_2_QUIRURGICO'
  | 'PISO_3_HOSPITALIZACION'
  | 'SUITES_ESPECIALES';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  password?: string;
  fullName: string;
  role: UserRole;
  professionalLicense: string; // Cédula Profesional (NOM-004)
  specialty?: string;
  shift: ShiftType;
  phone?: string;
  isActive: boolean;
  avatarUrl?: string;
  allowedModules?: string[]; // ['*'] para todos los módulos o lista específica
}

export interface Patient {
  id: string;
  patientNumber: string; // Expediente HPDH-2026-XXXX
  curp: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string;
  chronicConditions?: string;
  weightKg: number;      // Peso en kg
  heightCm: number;      // Talla / Altura en cm
  calculatedBmi?: number;// IMC automático
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceCompany: string; // GNP, AXA, MetLife, Particular, etc.
  insurancePolicyNumber?: string;
  createdAt: string;
}

// Admisión Hospitalaria Programada (Cirugías, Hemodinamia, Internamientos planeados)
export interface ScheduledAdmission {
  id: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  admissionType: 'CIRUGIA_PROGRAMADA' | 'HEMODINAMIA' | 'INTERNAMIENTO_ELECTIVO' | 'VALORACION_ESPECIAL';
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  procedureName: string; // Ej: Colecistectomía Laparoscópica, Cateterismo Cardíaco
  attendingPhysician: string;
  reservedBedArea: BedArea;
  reservedBedNumber?: string;
  operatingRoomNumber?: string;
  preanestheticEvaluationCompleted: boolean;
  fastingConfirmed: boolean;
  consentFormSigned: boolean;
  estimatedDurationHours: number;
  status: 'PROGRAMADO' | 'EN_PREOPERATORIO' | 'EN_QUIROFANO' | 'HOSPITALIZADO' | 'CANCELADO';
  notes?: string;
  createdAt: string;
}

export interface TriageAdmission {
  id: string;
  patientId: string;
  patientName: string;
  patientNumber: string;
  priority: TriagePriority;
  bloodPressure: string;   // mmHg ej: 120/80
  heartRate: number;       // lpm
  respiratoryRate: number; // rpm
  temperatureC: number;    // °C
  oxygenSaturation: number;// % SpO2
  bloodGlucose?: number;   // mg/dL
  painScaleEva: number;    // 0-10
  weightKg: number;        // Peso al triage
  heightCm: number;        // Talla al triage
  calculatedBmi?: number;  // IMC calculado
  chiefComplaint: string;  // Motivo de urgencia
  initialDiagnosis?: string;
  evaluatingPhysician: string;
  assignedDestination: 'SALA_CHOQUE' | 'CONSULTORIO_URGENCIAS' | 'SALA_OBSERVACION' | 'HOSPITALIZACION';
  waitTimeMinutes: number;
  status: 'EN_ESPERA' | 'EN_ATENCION' | 'TRASLADADO_CAMA' | 'EGRESO_DOMICILIO';
  admissionTimestamp: string;
}

export interface ConsultationNote {
  id: string;
  patientId: string;
  patientName: string;
  physicianId: string;
  physicianName: string;
  physicianLicense: string;
  noteType: 'HISTORIA_CLINICA' | 'NOTA_EVOLUCION' | 'NOTA_INTERCONSULTA' | 'NOTA_PREOPERATORIA' | 'NOTA_EGRESO';
  subjectiveNotes: string; // Interrogatorio
  objectiveFindings: string; // Exploración y signos
  cie10Code: string; // Ej: I10, E11.9
  cie10Description: string;
  treatmentPlan: string;
  prognosis: string;
  prescriptions: {
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  digitalSignatureHash: string; // SHA-256 (NOM-024)
  createdAt: string;
}

export interface HospitalBed {
  id: string;
  bedNumber: string; // Ej: UCI-01, P2-204, STE-301
  area: BedArea;
  status: BedStatus;
  currentPatientId?: string;
  currentPatientName?: string;
  currentPatientNumber?: string;
  attendingPhysician?: string;
  assignedNurse?: string;
  admissionDate?: string;
  dietType: string;
  clinicalIsolation: boolean;
  notes?: string;
}

export interface PharmacyItem {
  id: string;
  barcode: string;
  drugName: string;
  activeSubstance: string;
  presentation: string;
  batchNumber: string; // Lote
  expirationDate: string; // Caducidad
  cofeprisFraction: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  stockCurrent: number;
  stockMinimum: number;
  unitCost: number;
  unitPrice: number;
  locationBin: string;
  isRefrigerated: boolean;
}

export interface LabOrder {
  id: string;
  orderFolio: string; // LAB-2026-XXXX
  patientId: string;
  patientName: string;
  testName: string;
  category: 'HEMATOLOGIA' | 'BIOQUIMICA' | 'COAGULACION' | 'INMUNOLOGIA' | 'GASOMETRIA' | 'UROANALISIS';
  priority: 'NORMAL' | 'URGENTE_STAT';
  status: 'SOLICITADO' | 'MUESTRA_TOMADA' | 'EN_ANALISIS' | 'VALIDADO_QFB';
  requestingPhysician: string;
  validatingQfb?: string;
  validatedAt?: string;
  criticalAlert: boolean;
  results: {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
  }[];
  createdAt: string;
}

export interface ImagingStudy {
  id: string;
  studyFolio: string; // IMG-2026-XXXX
  patientId: string;
  patientName: string;
  modality: 'TOMOGRAFIA_TC' | 'RESONANCIA_RM' | 'RAYOS_X_DIGITAL' | 'ULTRASONIDO' | 'MASTOGRAFIA' | 'HEMODINAMIA';
  bodyPart: string;
  clinicalIndication: string;
  imagePreviewUrl?: string;
  radiologistInterpretation?: string;
  radiologistName?: string;
  radiologistLicense?: string;
  status: 'PROGRAMADO' | 'ADQUISICION' | 'INTERPRETADO_FIRMADO';
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  receiptNumber: string; // CAJA-2026-XXXX
  patientId: string;
  patientName: string;
  serviceCategory: 'FARMACIA' | 'HOSPITALIZACION' | 'LABORATORIO' | 'IMAGENOLOGIA' | 'QUIROFANO' | 'HONORARIOS';
  conceptDescription: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  insuranceCoverageAmount: number;
  patientCopayAmount: number;
  paymentMethod: 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA_SPEI' | 'ASEGURADORA_CONVENIO';
  cashierName: string;
  shift: ShiftType;
  status: 'PAGADO' | 'PENDIENTE' | 'FACTURADO';
  createdAt: string;
}

export interface CeyeBatch {
  id: string;
  batchCode: string; // CEYE-2026-XXXX
  autoclaveName: string;
  sterilizationMethod: 'VAPOR_134' | 'VAPOR_121' | 'OXIDO_ETILENO' | 'PLASMA_GAS';
  cycleNumber: number;
  temperatureC: number;
  pressurePsi: number;
  durationMinutes: number;
  chemicalIndicatorApproved: boolean;
  biologicalIndicatorApproved: boolean;
  sterileExpirationDate: string;
  packageDescription: string; // Set Cirugía Mayor, Equipo Laparoscopía, etc.
  destinationArea: string; // Quirófano 1, Quirófano 2, Tococirugía, Urgencias
  responsibleTechnician: string;
  status: 'EN_CICLO' | 'CUARENTENA_BIOLOGICA' | 'LIBERADO_ESTERIL' | 'UTILIZADO' | 'VENCIDO';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channelName: string; // 'URGENCIAS_TRIAGE', 'HOSPITALIZACION_PISOS', 'QUIROFANOS_CEYE', 'LABORATORIO_IMAGEN', 'GUARDIA_MEDICA'
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId?: string; // Para mensajes 1 a 1 directos
  messageText: string;
  attachmentType?: 'IMAGEN_ESTUDIO' | 'REPORTE_PDF' | 'ALERTA_VITAL' | 'NOTA_VOZ';
  attachmentUrl?: string;
  attachmentName?: string;
  isRead: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  userLicense?: string;
  ipAddress: string;
  actionType: string;
  resourceAffected: string;
  details: string;
  sha256Hash: string; // Cumplimiento inmutable NOM-024
}
