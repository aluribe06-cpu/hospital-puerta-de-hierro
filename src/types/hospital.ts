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
  | 'JEFE_ALMACEN'
  | 'COORDINADOR_COMPRAS'
  | 'TRABAJADOR_SOCIAL'
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
  rfc?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  age?: number;
  gender: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone?: string;
  originario?: string;   // Ciudad/Estado de origen
  address?: string;      // Domicilio completo
  allergies: string;
  chronicConditions?: string;
  weightKg: number;      // Peso en kg
  heightCm: number;      // Talla / Altura en cm
  calculatedBmi?: number;// IMC automático
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceCompany: string; // GNP, AXA, MetLife, Particular, etc.
  insurancePolicyNumber?: string;
  vaccinationHistory?: string[]; // Historial de vacunas (COVID-19, Influenza, Tétanos, etc.)
  familyHistory?: string;       // Antecedentes Heredofamiliares
  pathologicalHistory?: string; // Antecedentes Personales Patológicos
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

// Clasificación Internacional de Enfermedades 11.ª Revisión (OMS / WHO CIE-11)
export interface AiDrugRecommendation {
  id: string;
  drugName: string;
  activeSubstance: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  line: 'PRIMERA_LINEA' | 'SEGUNDA_LINEA' | 'COADYUVANTE';
  rationale: string;
  warnings?: string[];
  requiresRenalAdjustment?: boolean;
}

export interface Cie11Disease {
  code: string;               // Ej: 5A11, BA00, CA40.0, 1B10
  title: string;              // Nombre clínico en español
  cie10Equivalent: string;    // Equivalencia normativa (CIE-10 ej: E11.9, I10)
  chapter: string;            // Capítulo OMS (ej. 05 Enf. Endocrinas, 11 Enf. Circulatorias)
  clinicalCategory: string;   // Especialidad (Cardiología, Neumología, etc.)
  suggestedDrugs: AiDrugRecommendation[];
  contraindicatedDrugs?: string[]; // Ej: AINEs en Dengue, Metformina en FGe < 30
  suggestedLabs?: string[];        // Estudios de Laboratorio recomendados
  suggestedImaging?: string[];     // Estudios de Gabinete / Imagenología recomendados
  generalCare?: string[];          // Medidas higiénico-dietéticas
  clinicalPearls?: string;         // Criterios de alarma y perlas de práctica clínica
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
  cie11Code?: string; // Clasificación CIE-11 OMS ej: BA00, 5A11
  cie11Description?: string;
  treatmentPlan: string;
  prognosis: string;
  prescriptions: {
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  aiAssistedPrescription?: boolean;
  aiSafetyAlerts?: string[];
  aiRecommendedLabs?: string[];
  aiGeneralCare?: string[];
  triageVitalSignsSnap?: {
    bp: string;
    hr: number;
    rr: number;
    temp: number;
    spo2: number;
    glucose?: number;
    eva: number;
    weight: number;
    height: number;
    bmi?: number;
    triagePriority?: string;
  };
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

export type TaxCategory = 'EXENTO_MEDICO' | 'IVA_16' | 'TASA_0';

export interface InvoiceData {
  invoiceFolio: string;          // Ej: "CFDI-2026-0814"
  uuidSat: string;               // Folio Fiscal Digital SAT UUID (e.g. 4E4766EB-11B0-427E-8E8D-9081C817BEFC)
  rfcRecipient: string;          // RFC del receptor (e.g. GOPR580914HX8 o XAXX010101000)
  businessName: string;          // Razón Social / Nombre Fiscal
  taxRegime: string;             // Régimen Fiscal (ej. "605 - Sueldos y Salarios", "612 - Personas Físicas con Actividades Empresariales", "601 - General de Ley Personas Morales")
  postalCode: string;            // Código Postal Fiscal (Domicilio)
  cfdiUsage: string;             // Uso del CFDI (ej. "D01 - Honorarios médicos, dentales y gastos hospitalarios", "G03 - Gastos en general")
  paymentMethodSat: string;      // "PUE - Pago en una sola exhibición" | "PPD - Pago en parcialidades o diferido"
  paymentFormSat: string;        // "01 - Efectivo", "03 - Transferencia electrónica", "04 - Tarjeta de crédito", "28 - Tarjeta de débito"
  satCertificateNumber: string;  // No. de Serie Certificado SAT
  emisorCertificateNumber: string; // No. de Serie Certificado Emisor
  satDigitalStamp: string;       // Sello Digital SAT
  cfdiDigitalStamp: string;      // Sello Digital CFDI
  originalStringSat: string;     // Cadena original del complemento de certificación
  timbradoDate: string;          // Fecha y hora oficial de timbrado SAT
  cfdiStatus: 'TIMBRADA_SAT' | 'PENDIENTE' | 'CANCELADA';
}

export interface InsuranceAgreementData {
  companyName: string;            // 'GNP Seguros' | 'AXA Seguros' | 'MetLife México' | 'Seguros Monterrey NYL' | 'Mapfre México' | 'Bupa' | 'Inbursa' | 'Banorte'
  companyRfc: string;             // RFC Fiscal de la aseguradora (ej. GNP9211244Z0)
  companyBusinessName: string;    // Razón Social oficial
  policyNumber: string;           // No. de Póliza
  claimNumber?: string;           // No. de Siniestro
  authorizationCode: string;      // Folio Carta de Autorización de Pago Directo
  creditDaysTerms?: number;       // Días de crédito convenidos (ej. 30 días)
  invoiceTarget: 'ASEGURADORA' | 'PACIENTE_COPAGO' | 'AMBOS';
  copayInvoiceFolio?: string;     // Folio Factura CFDI del deducible/coaseguro del paciente
}

export interface CashTransaction {
  id: string;
  receiptNumber: string;         // CAJA-2026-XXXX
  patientId: string;
  patientName: string;
  serviceCategory: 'FARMACIA' | 'HOSPITALIZACION' | 'LABORATORIO' | 'IMAGENOLOGIA' | 'QUIROFANO' | 'HONORARIOS';
  conceptDescription: string;
  subtotal: number;
  taxCategory?: TaxCategory;     // 'EXENTO_MEDICO' | 'IVA_16' | 'TASA_0'
  taxRate?: number;              // 0.16 | 0.0
  taxAmount: number;             // IVA en MXN
  totalAmount: number;
  insuranceCoverageAmount: number;
  patientCopayAmount: number;
  paymentMethod: 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA_SPEI' | 'ASEGURADORA_CONVENIO';
  insuranceAgreement?: InsuranceAgreementData; // Datos del convenio y pago directo
  cashierName: string;
  shift: ShiftType;
  status: 'PAGADO' | 'PENDIENTE' | 'FACTURADO';
  isInvoiceIssued?: boolean;
  invoiceData?: InvoiceData;
  createdAt: string;
}

export interface CashDenominations {
  b1000: number; // $1,000
  b500: number;  // $500
  b200: number;  // $200
  b100: number;  // $100
  b50: number;   // $50
  b20: number;   // $20
  m20: number;   // $20 moneda
  m10: number;   // $10
  m5: number;    // $5
  m2: number;    // $2
  m1: number;    // $1
  m050: number;  // $0.50
}

export interface CashAuditRecord {
  id: string;
  auditFolio: string;           // ARQ-2026-XXXX
  auditDate: string;
  shift: ShiftType;
  cashierName: string;
  auditorName: string;
  initialCashFloat: number;     // Fondo fijo inicial (ej. $5,000)
  systemCashExpected: number;   // Fondo inicial + ventas en efectivo del turno
  physicalCashCounted: number;  // Billetes + Monedas contados
  difference: number;           // physicalCashCounted - systemCashExpected
  differenceStatus: 'CUADRADO' | 'SOBRANTE' | 'FALTANTE';
  denominations: CashDenominations;
  notes?: string;
  status: 'AUDITADO' | 'APROBADO' | 'CON_OBSERVACIONES';
  createdAt: string;
}

export interface ShiftClosingRecord {
  id: string;
  closingFolio: string;         // CORTE-2026-XXXX
  shift: ShiftType;
  date: string;
  cashierName: string;
  supervisorName: string;
  totalTransactionsCount: number;
  totalIncome: number;
  cashTotal: number;
  debitCardTotal: number;
  creditCardTotal: number;
  speiTotal: number;
  insuranceAgreementTotal: number;
  subtotalTaxable: number;
  taxIva16Total: number;
  subtotalExempt: number;
  invoicedCfdiTotal: number;
  nonInvoicedTotal: number;
  cashDepositedToVault: number; // Retiro de efectivo para bóveda / valores
  cashRemainingForNextShift: number; // Fondo de cambio que queda en caja
  status: 'CERRADO_CONCILIADO' | 'PENDIENTE_REVISION';
  notes?: string;
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

// ==============================================================================
// MÓDULO 13: ALMACÉN GENERAL DE INSUMOS HOSPITALARIOS
// ==============================================================================

export type WarehouseItemCategory =
  | 'MATERIAL_CURACION'        // Gasas, jeringas, catéteres, agujas, apósitos, cintas
  | 'SOLUCIONES_PARENTERALES'   // Fisiológica, Hartmann, Dextrosa, Cloruro de Sodio
  | 'EQUIPO_PROTECCION'        // Guantes estériles, cubrebocas N95, batas quirúrgicas
  | 'ROPERIA_LENCERIA'         // Sábanas, campos quirúrgicos, fundas, compresas
  | 'REACTIVOS_INSUMOS'        // Tubos vacutainer, lancetas, gel conductor
  | 'PAPELERIA_MEDICA';        // Formatos NOM, recetas, brazaletes de paciente

export interface WarehouseItem {
  id: string;
  sku: string; // Ej: ALM-CUR-001, ALM-SOL-004
  itemName: string;
  category: WarehouseItemCategory;
  unit: 'PIEZA' | 'CAJA' | 'PAQUETE' | 'FRASCO' | 'ROLLO' | 'EQUIPO';
  stockCurrent: number;
  stockMinimum: number;
  stockMaximum: number;
  locationRack: string; // Ej: 'Pasillo A - Estante 2 - Nivel 3'
  unitCost: number;     // Costo de compra $ MXN
  lastRestockDate: string;
  batchNumber?: string;
  expirationDate?: string;
  notes?: string;
}

export interface WarehouseDispatch {
  id: string;
  dispatchFolio: string; // VALE-2026-XXXX
  requestingDepartment: 'QUIROFANOS' | 'URGENCIAS' | 'UCI_ADULTOS' | 'UCIN_NEONATAL' | 'PISOS_HOSPITALIZACION' | 'CONSULTORIOS' | 'CEYE';
  requestedBy: string;
  deliveredBy: string;
  dispatchedDate: string;
  items: {
    itemId: string;
    itemName: string;
    sku: string;
    quantity: number;
  }[];
  notes?: string;
  status: 'ENTREGADO' | 'PENDIENTE' | 'CANCELADO';
}

// ==============================================================================
// MÓDULO 14: ÁREA DE COMPRAS Y PROVEEDORES
// ==============================================================================

export type SupplierCategory =
  | 'MATERIAL_CURACION'
  | 'FARMACOS_SOLUCIONES'
  | 'EQUIPO_BIOMEDICO'
  | 'GASES_MEDICINALES'
  | 'ROPERIA_UNIFORMES'
  | 'MANTENIMIENTO_HOSPITALARIO';

export interface Supplier {
  id: string;
  businessName: string; // Razón Social Oficial
  rfc: string;          // Registro Federal de Contribuyentes
  commercialName: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: SupplierCategory;
  creditDays: number;   // Días de crédito ej: 30, 45, 60
  rating: number;       // 1-5 estrellas
  address: string;
  status: 'ACTIVO' | 'EN_EVALUACION' | 'SUSPENDIDO';
}

export type PurchaseOrderStatus =
  | 'BORRADOR'
  | 'PENDIENTE_AUTORIZACION'
  | 'AUTORIZADA'
  | 'ENVIADA_PROVEEDOR'
  | 'SURTIDA_COMPLETA'
  | 'SURTIDA_PARCIAL'
  | 'CANCELADA';

export interface PurchaseOrderItem {
  itemId: string;
  sku: string;
  description: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  orderFolio: string; // OC-2026-XXXX
  supplierId: string;
  supplierName: string;
  supplierRfc: string;
  requestingDepartment: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxIva: number; // 16% IVA
  totalAmount: number;
  status: PurchaseOrderStatus;
  authorizedBy?: string; // Ej: 'Ing. Alfonso Uribe (Administrador Único)'
  authorizedAt?: string;
  paymentTerms: string; // 'Crédito 30 días', 'Contado', etc.
  notes?: string;
}

export interface PurchaseRequisition {
  id: string;
  requisitionFolio: string; // REQ-2026-XXXX
  department: string;
  requestedBy: string;
  requestDate: string;
  urgency: 'NORMAL' | 'URGENTE_DESABASTO' | 'EXTRAORDINARIA';
  itemsDescription: string;
  estimatedBudget: number;
  status: 'PENDIENTE' | 'APROBADA_PARA_OC' | 'RECHAZADA';
  linkedOrderFolio?: string;
  notes?: string;
}

// ==============================================================================
// TIPOS DE TRABAJO SOCIAL HOSPITALARIO (ESTUDIOS, MP, CANALIZACIONES Y DEFUNCIONES)
// Cumplimiento con NOM-004-SSA3-2012, NOM-046 y Registro Civil
// ==============================================================================

export type SocialWorkCaseType =
  | 'ESTUDIO_SOCIOECONOMICO'
  | 'TRAMITE_DEFUNCION'
  | 'CASO_MEDICO_LEGAL'
  | 'CANALIZACION_EXTERNA'
  | 'LOCALIZACION_FAMILIARES'
  | 'APOYO_MEDICAMENTOS_DONACION';

export type SocioeconomicLevel = 
  | 'NIVEL_1'           // Vulnerabilidad extrema - Exención / 50%
  | 'NIVEL_2'           // Vulnerabilidad alta - 35-40% descuento
  | 'NIVEL_3'           // Vulnerabilidad media - 20-25% descuento
  | 'NIVEL_4'           // Vulnerabilidad baja - 10-15% descuento
  | 'NIVEL_5'           // Tabulador preferente - 5% descuento
  | 'PARTICULAR_PLENO'; // Sin subsidio asistencial

export type SocialCaseStatus = 
  | 'ABIERTO' 
  | 'EN_EVALUACION' 
  | 'APROBADO_PATRONATO' 
  | 'NOTIFICADO_MP' 
  | 'ACTA_EMITIDA' 
  | 'CONCLUIDO';

export interface DeathRecordData {
  deathCertificateFolio: string; // Folio SSA/INEGI e.g. "CERT-2026-0914"
  deathDate: string;             // YYYY-MM-DD
  deathTime: string;             // HH:mm
  deathCausePrimary: string;     // Causa determinante principal
  deathCauseSecondary?: string;   // Causa antecedente / comorbilidad
  certifyingPhysician: string;   // Médico tratante que certifica
  certifyingPhysicianCedula: string;
  legalClaimantName: string;     // Familiar que reclama restos legalmente
  legalClaimantKinship: string;  // Parentesco (Esposo/a, Hijo/a, etc.)
  legalClaimantPhone: string;
  legalClaimantOfficialId?: string; // INE / Pasaporte
  funeralHomeName: string;       // Agencia Funeraria asignada
  civilRegistryFolio?: string;   // Folio de Acta de Defunción Registro Civil
  civilRegistryOffice?: string;  // Oficialía del Registro Civil (ej: Oficialía 01 Tepic)
  bodyDestination: 'INHUMACION' | 'CREMACION' | 'TRASLADO_FORANEO' | 'SEMEFO';
  personalBelongingsDelivered: boolean; // Deslinde y entrega de pertenencias
}

export interface SocialWorkRecord {
  id: string;
  folio: string;                 // e.g. "TS-2026-0038"
  patientId: string;
  patientName: string;
  patientExpNumber: string;
  patientAge?: number;
  patientGender?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  areaService: string;           // 'URGENCIAS' | 'UCI' | 'HOSPITALIZACION' | 'QUIRÓFANO' | 'CONSULTORIOS'
  bedNumber?: string;
  caseType: SocialWorkCaseType;
  status: SocialCaseStatus;
  date: string;
  time: string;
  socialWorkerName: string;
  familyContactName: string;
  familyContactRelationship: string;
  familyContactPhone: string;
  
  // Estudio Socioeconómico
  socioeconomicLevel?: SocioeconomicLevel;
  familyIncomeMonthly?: number;
  familyExpensesMonthly?: number;
  housingType?: 'PROPIA' | 'RENTADA' | 'PRESTADA' | 'IRREGULAR';
  familyMembersCount?: number;
  supportDiscountApprovedPercentage?: number; // Ej: 40%
  patronatoAuthorizationCode?: string;

  // Trámite de Defunción y Registro Civil
  deathData?: DeathRecordData;

  // Notificación Legal / Ministerio Público
  mpReportNumber?: string;       // Oficio Ministerial e.g. "OF-MP-2026-0419"
  mpAgencyName?: string;         // Fiscalía / Agencia del MP
  mpAgentName?: string;          // Agente del MP receptor
  mpNotificationReason?: string; // Causa (Hechos de tránsito, arma de fuego, etc.)
  mpDeliveryDate?: string;

  // Canalización Externa
  referralInstitution?: string;  // Ej: 'DIF Estatal Nayarit', 'Hospital Civil Tepic'
  referralReason?: string;
  ambulanceTransferRequired?: boolean;

  // Diagnóstico y Dictamen de Trabajo Social
  socialDiagnosis: string;
  actionsTaken: string;
  notes?: string;
}

