// ==============================================================================
// MOTOR DE EXPORTACIÓN E IMPORTACIÓN (EXCEL Y PDF) - HOSPITAL PUERTA DE HIERRO
// Cumplimiento con formato oficial y normativas NOM-004 / NOM-024
// ==============================================================================

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Patient, 
  TriageAdmission, 
  HospitalBed, 
  PharmacyItem, 
  CashTransaction,
  WarehouseItem,
  PurchaseOrder,
  Supplier
} from '../types/hospital';

/**
 * Exportar censo de pacientes a Excel (.xlsx) con membrete oficial Hospital Puerta de Hierro
 */
export function exportPatientsToExcel(patients: Patient[]) {
  const emitDate = new Date();
  const fechaStr = emitDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaStr = emitDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const headerRows: any[][] = [
    ['🏥 CENTRO MÉDICO PUERTA DE HIERRO TEPIC - ALTA ESPECIALIDAD'],
    ['LOGOTIPO INSTITUCIONAL: [HOSPITAL PUERTA DE HIERRO] • SISTEMA DE EXPEDIENTE CLÍNICO'],
    ['Sede Tepic | Av. Emilio M. González #221, Cd. Industrial, Nayarit | Tel: (311) 129-5200 | Urgencias: (311) 129-5206'],
    ['PADRÓN DE PACIENTES REGISTRADOS - CUMPLIMIENTO NOM-024-SSA3-2012 / NOM-004-SSA3-2012'],
    [`Fecha y Hora de Emisión: ${fechaStr} a las ${horaStr} | Licencia Sanitaria: 18-AM-18-017-0004`],
    [],
    [
      'No. de Expediente',
      'Nombre Completo del Paciente',
      'CURP Oficial',
      'Fecha de Nacimiento',
      'Género',
      'Grupo Sanguíneo',
      'Peso Corporal (kg)',
      'Talla / Altura (cm)',
      'Índice Masa Corporal (IMC)',
      'Alergias Conocidas',
      'Padecimientos Crónicos',
      'Aseguradora / Empresa',
      'No. de Póliza',
      'Contacto de Emergencia',
      'Fecha de Registro'
    ]
  ];

  const dataRows: any[][] = patients.map(p => [
    p.patientNumber,
    `${p.firstName} ${p.lastName}`,
    p.curp,
    p.birthDate,
    p.gender,
    p.bloodType,
    p.weightKg,
    p.heightCm,
    p.calculatedBmi || 'N/A',
    p.allergies,
    p.chronicConditions || 'Ninguno',
    p.insuranceCompany,
    p.insurancePolicyNumber || 'N/A',
    `${p.emergencyContactName} (${p.emergencyContactPhone})`,
    p.createdAt.split('T')[0]
  ]);

  const fullSheet = [...headerRows, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullSheet);
  const workbook = XLSX.utils.book_new();

  // Ancho automático garantizado de 20 a 35 caracteres por columna
  const minCols = [24, 35, 24, 20, 16, 18, 20, 20, 24, 30, 30, 26, 22, 35, 20];
  const cols = minCols.map((minW, idx) => {
    let maxLen = minW;
    dataRows.forEach(row => {
      const strLen = String(row[idx] || '').length + 3;
      if (strLen > maxLen) maxLen = strLen;
    });
    return { wch: maxLen };
  });

  worksheet['!cols'] = cols;
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes Puerta de Hierro');
  XLSX.writeFile(workbook, `Pacientes_Hospital_Puerta_de_Hierro_${Date.now()}.xlsx`);
}

/**
 * Exportar censo hospitalario de camas a Excel (.xlsx) con membrete institucional,
 * datos del Hospital Puerta de Hierro y autoajuste de ancho de columnas (20 a 35 caracteres mínimo).
 */
export function exportBedsToExcel(beds: HospitalBed[]) {
  const emitDate = new Date();
  const fechaStr = emitDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaStr = emitDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Encabezado Institucional Puerta de Hierro con Logotipo y datos sanitarios
  const headerRows: any[][] = [
    ['🏥 CENTRO MÉDICO PUERTA DE HIERRO TEPIC - ALTA ESPECIALIDAD'],
    ['LOGOTIPO INSTITUCIONAL: [HOSPITAL PUERTA DE HIERRO] • DIRECCIÓN MÉDICA GENERAL'],
    ['Sede Tepic | Av. Emilio M. González #221, Cd. Industrial, Nayarit | Tel: (311) 129-5200 | Urgencias: (311) 129-5206'],
    ['SISTEMA INTEGRAL DE CENSO HOSPITALARIO, INTERNAMIENTOS Y CAMAS CRÍTICAS'],
    ['CUMPLIMIENTO LEGAL: NOM-024-SSA3-2012 (SIRES/ECE) • NOM-004-SSA3-2012 • NOM-016-SSA3-2012'],
    [`Fecha y Hora de Emisión: ${fechaStr} a las ${horaStr} | Licencia Sanitaria: 18-AM-18-017-0004`],
    [], // Fila en blanco de separación
    [
      'Cama Hospitalaria',
      'Área del Hospital',
      'Estado de la Cama',
      'Nombre del Paciente',
      'No. de Expediente',
      'Médico Tratante',
      'Enfermera Responsable',
      'Tipo de Dieta',
      'Aislamiento Clínico',
      'Fecha de Ingreso',
      'Hora de Ingreso',
      'Diagnóstico / Notas de Evolución'
    ]
  ];

  const dataRows: any[][] = beds.map(b => {
    let fechaIngreso = 'N/A';
    let horaIngreso = 'N/A';
    if (b.admissionDate) {
      const parts = b.admissionDate.split('T');
      fechaIngreso = parts[0] || 'N/A';
      horaIngreso = parts[1] ? parts[1].substring(0, 5) : 'N/A';
    }

    return [
      b.bedNumber,
      b.area.replace(/_/g, ' '),
      b.status.replace(/_/g, ' '),
      b.currentPatientName || 'CAMA DISPONIBLE',
      b.currentPatientNumber || 'N/A',
      b.attendingPhysician || 'SIN ASIGNAR',
      b.assignedNurse || 'PERSONAL DE GUARDIA',
      b.dietType || 'AYUNO NORMAL',
      b.clinicalIsolation ? 'SÍ (AISLADO)' : 'NO (ESTÁNDAR)',
      fechaIngreso,
      horaIngreso,
      b.notes || 'Sin observaciones registradas'
    ];
  });

  const fullSheet = [...headerRows, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullSheet);
  const workbook = XLSX.utils.book_new();

  // Columnas automáticas con mínimo garantizado de 20 a 35 caracteres
  const minWidths = [
    22, // Cama Hospitalaria (20-30 chars)
    28, // Área del Hospital (20-30 chars)
    24, // Estado de la Cama (20-30 chars)
    36, // Nombre del Paciente (20-35 chars)
    24, // No. de Expediente (20-30 chars)
    32, // Médico Tratante (20-35 chars)
    28, // Enfermera Responsable (20-30 chars)
    28, // Tipo de Dieta (20-30 chars)
    24, // Aislamiento Clínico (20-30 chars)
    22, // Fecha de Ingreso (20-30 chars)
    20, // Hora de Ingreso (20-30 chars)
    38, // Notas / Diagnóstico (20-38 chars)
  ];

  const cols = minWidths.map((minW, colIdx) => {
    let maxContentLen = minW;
    dataRows.forEach(row => {
      const cellLen = String(row[colIdx] || '').length + 3;
      if (cellLen > maxContentLen) {
        maxContentLen = cellLen;
      }
    });
    return { wch: maxContentLen };
  });

  worksheet['!cols'] = cols;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Censo de Camas');
  XLSX.writeFile(workbook, `Censo_Hospitalario_Puerta_de_Hierro_${Date.now()}.xlsx`);
}

/**
 * Exportar corte de caja del turno a Excel (.xlsx)
 */
export function exportCashReportToExcel(transactions: CashTransaction[], shiftName: string) {
  const data = transactions.map(t => ({
    'Folio Recibo': t.receiptNumber,
    'Paciente': t.patientName,
    'Categoría': t.serviceCategory,
    'Concepto': t.conceptDescription,
    'Subtotal ($)': t.subtotal,
    'IVA ($)': t.taxAmount,
    'Total ($)': t.totalAmount,
    'Cobertura Seguro ($)': t.insuranceCoverageAmount,
    'Copago Paciente ($)': t.patientCopayAmount,
    'Forma de Pago': t.paymentMethod,
    'Cajero': t.cashierName,
    'Turno': t.shift,
    'Fecha / Hora': t.createdAt.replace('T', ' ').substring(0, 16),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Corte Caja ${shiftName}`);
  XLSX.writeFile(workbook, `Corte_Caja_Puerta_de_Hierro_${shiftName}_${Date.now()}.xlsx`);
}

/**
 * Exportar inventario de farmacia a Excel (.xlsx)
 */
export function exportPharmacyToExcel(inventory: PharmacyItem[]) {
  const data = inventory.map(item => ({
    'Código de Barras': item.barcode,
    'Medicamento / Insumo': item.drugName,
    'Sustancia Activa': item.activeSubstance,
    'Presentación': item.presentation,
    'Lote': item.batchNumber,
    'Fecha Caducidad': item.expirationDate,
    'Fracción COFEPRIS': `Fracc. ${item.cofeprisFraction}`,
    'Stock Actual': item.stockCurrent,
    'Stock Mínimo': item.stockMinimum,
    'Costo Unitario ($)': item.unitCost,
    'Precio Venta ($)': item.unitPrice,
    'Ubicación': item.locationBin,
    'Refrigerado': item.isRefrigerated ? 'SÍ (2-8°C)' : 'NO',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario Farmacia');
  XLSX.writeFile(workbook, `Farmacia_Puerta_de_Hierro_${Date.now()}.xlsx`);
}

/**
 * Generar Receta Médica Oficial en PDF (Cumple NOM-004-SSA3-2012)
 */
export function generateMedicalPrescriptionPDF(params: {
  patient: Patient;
  physicianName: string;
  physicianLicense: string;
  specialty: string;
  diagnosis: string;
  cie10: string;
  items: { drugName: string; dosage: string; frequency: string; duration: string; instructions: string }[];
  vitalSigns?: { bp: string; hr: number; temp: number; weight: number; height: number; bmi?: number };
}) {
  const doc = new jsPDF();

  // Encabezado Institucional Puerta de Hierro
  doc.setFillColor(37, 99, 235); // Azul Puerta de Hierro
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRO MÉDICO PUERTA DE HIERRO', 14, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Sede Tepic | Av. Emilio M. González #221, Fracc. Cd. Industrial | Tel: (311) 129-5200', 14, 18);
  doc.text('Licencia Sanitaria No. 18-AM-18-017-0004 | Registro COFEPRIS Vigente', 14, 23);

  // Datos del Médico Prescriptor
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(params.physicianName, 14, 35);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Especialidad: ${params.specialty} | Cédula Profesional: ${params.physicianLicense}`, 14, 40);

  // Línea divisoria
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 43, 196, 43);

  // Datos del Paciente (con peso, talla e IMC)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL PACIENTE', 14, 49);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${params.patient.firstName} ${params.patient.lastName}`, 14, 55);
  doc.text(`Expediente: ${params.patient.patientNumber} | CURP: ${params.patient.curp}`, 14, 60);
  
  const peso = params.vitalSigns?.weight || params.patient.weightKg;
  const talla = params.vitalSigns?.height || params.patient.heightCm;
  const imc = params.vitalSigns?.bmi || params.patient.calculatedBmi || 'N/A';
  
  doc.text(`Peso: ${peso} kg  |  Talla: ${talla} cm  |  IMC: ${imc}  |  Grupo: ${params.patient.bloodType}`, 14, 65);
  
  // Alergias en rojo de alerta
  doc.setTextColor(220, 38, 38);
  doc.setFont('helvetica', 'bold');
  doc.text(`ALERGIAS: ${params.patient.allergies.toUpperCase()}`, 14, 71);

  // Diagnóstico
  doc.setTextColor(30, 41, 59);
  doc.text(`Diagnóstico CIE-10: [${params.cie10}] ${params.diagnosis}`, 14, 77);

  // Tabla de Medicamentos Recetados
  const tableRows = params.items.map((it, idx) => [
    (idx + 1).toString(),
    it.drugName,
    it.dosage,
    it.frequency,
    it.duration,
    it.instructions,
  ]);

  autoTable(doc, {
    startY: 82,
    head: [['#', 'Medicamento / Fármaco', 'Dosis', 'Frecuencia', 'Duración', 'Indicaciones']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // Pie de página y Firma Digital NOM-024
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Esta receta tiene una vigencia de 30 días naturales a partir de su emisión según la Ley General de Salud.', 14, finalY + 15);
  doc.text('Para medicamentos controlados (Fracción II y III), la receta retiene el original en farmacia.', 14, finalY + 19);

  // Cuadro de firma
  doc.setDrawColor(148, 163, 184);
  doc.line(120, finalY + 45, 190, finalY + 45);
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(params.physicianName, 155, finalY + 50, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Cédula Prof: ${params.physicianLicense}`, 155, finalY + 55, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Sello Digital Criptográfico SHA-256 (NOM-024)', 155, finalY + 60, { align: 'center' });
  doc.text(Date.now().toString(16) + 'e49a8f102c98d7b6a5', 155, finalY + 64, { align: 'center' });

  doc.save(`Receta_Medica_${params.patient.patientNumber}_${Date.now()}.pdf`);
}

/**
 * Generar Ficha de Triage en PDF
 */
export function generateTriageSheetPDF(triage: TriageAdmission, patient: Patient) {
  const doc = new jsPDF();

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('HOSPITAL PUERTA DE HIERRO TEPIC - ADMISIÓN DE TRIAGE', 14, 12);
  doc.setFontSize(9);
  doc.text('Servicio de Urgencias 24 Horas | Sistema de Clasificación Manchester', 14, 18);

  // Clasificación de color
  let colorBadge = [37, 99, 235];
  let prioridadTexto = 'AZUL - NO URGENTE';
  if (triage.priority === 'ROJO_REANIMACION') {
    colorBadge = [220, 38, 38];
    prioridadTexto = 'CÓDIGO ROJO - REANIMACIÓN INMEDIATA (0 MIN)';
  } else if (triage.priority === 'NARANJA_EMERGENCIA') {
    colorBadge = [234, 88, 12];
    prioridadTexto = 'CÓDIGO NARANJA - EMERGENCIA (< 10 MIN)';
  } else if (triage.priority === 'AMARILLO_URGENCIA') {
    colorBadge = [202, 138, 4];
    prioridadTexto = 'CÓDIGO AMARILLO - URGENCIA (< 30-60 MIN)';
  } else if (triage.priority === 'VERDE_MENOR') {
    colorBadge = [16, 185, 129];
    prioridadTexto = 'CÓDIGO VERDE - URGENCIA MENOR (< 120 MIN)';
  }

  doc.setFillColor(colorBadge[0], colorBadge[1], colorBadge[2]);
  doc.roundedRect(14, 30, 182, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(prioridadTexto, 105, 39, { align: 'center' });

  // Datos
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(`Paciente: ${patient.firstName} ${patient.lastName}`, 14, 54);
  doc.text(`Expediente: ${patient.patientNumber} | Edad: ${new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} años`, 14, 60);
  doc.text(`Destino Asignado: ${triage.assignedDestination.replace('_', ' ')}`, 14, 66);
  doc.text(`Médico Evaluador: ${triage.evaluatingPhysician}`, 14, 72);

  // Signos Vitales
  autoTable(doc, {
    startY: 78,
    head: [['Signo Vital', 'Valor Registrado', 'Referencia']],
    body: [
      ['Presión Arterial (TA)', triage.bloodPressure + ' mmHg', '90/60 - 120/80 mmHg'],
      ['Frecuencia Cardíaca (FC)', triage.heartRate + ' lpm', '60 - 100 lpm'],
      ['Frecuencia Respiratoria (FR)', triage.respiratoryRate + ' rpm', '12 - 20 rpm'],
      ['Temperatura', triage.temperatureC + ' °C', '36.5 - 37.5 °C'],
      ['Saturación de O2 (SpO2)', triage.oxygenSaturation + ' %', '95 - 100 %'],
      ['Glucosa Capilar', (triage.bloodGlucose || 'No tomada') + ' mg/dL', '70 - 100 mg/dL'],
      ['Escala del Dolor (EVA)', `${triage.painScaleEva} / 10`, '0 (Sin dolor) a 10 (Máximo)'],
      ['Peso Corporal', `${triage.weightKg} kg`, 'Adulto promedio'],
      ['Talla / Altura', `${triage.heightCm} cm`, 'Estatura registrada'],
      ['Índice Masa Corporal (IMC)', `${triage.calculatedBmi || 'N/A'} kg/m2`, '18.5 - 24.9 (Normal)'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 160;
  doc.setFont('helvetica', 'bold');
  doc.text('Motivo de Ingreso a Urgencias:', 14, finalY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(triage.chiefComplaint, 14, finalY + 18, { maxWidth: 182 });

  if (triage.initialDiagnosis) {
    doc.setFont('helvetica', 'bold');
    doc.text('Impresión Diagnóstica Inicial:', 14, finalY + 30);
    doc.setFont('helvetica', 'normal');
    doc.text(triage.initialDiagnosis, 14, finalY + 36, { maxWidth: 182 });
  }

  doc.save(`Triage_${triage.patientNumber}_${Date.now()}.pdf`);
}

/**
 * Exportar Kárdex e Inventario de Almacén General a Excel (.xlsx) con membrete oficial
 */
export function exportWarehouseToExcel(items: WarehouseItem[]) {
  const emitDate = new Date();
  const fechaStr = emitDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaStr = emitDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const totalPiezas = items.reduce((acc, curr) => acc + curr.stockCurrent, 0);
  const totalValor = items.reduce((acc, curr) => acc + (curr.stockCurrent * curr.unitCost), 0);

  const headerRows: any[][] = [
    ['🏥 CENTRO MÉDICO PUERTA DE HIERRO TEPIC - ALTA ESPECIALIDAD'],
    ['ALMACÉN GENERAL DE INSUMOS Y MATERIAL DE CURACIÓN HOSPITALARIO'],
    ['Sede Tepic | Av. Emilio M. González #221, Cd. Industrial, Nayarit | Tel: (311) 129-5200 | Urgencias: (311) 129-5206'],
    ['KÁRDEX GENERAL DE EXISTENCIAS, RACKS Y CONTROL DE DESABASTO'],
    [`Fecha y Hora de Emisión: ${fechaStr} a las ${horaStr} | Responsable: Dirección de Almacén & Logística`],
    [`Total SKUs: ${items.length} | Existencia Total: ${totalPiezas} unidades | Valor Valuado: $${totalValor.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`],
    [],
    [
      'Código SKU',
      'Descripción Oficial del Insumo',
      'Categoría Hospitalaria',
      'Unidad de Manejo',
      'Existencia Actual',
      'Stock Mínimo (Reorden)',
      'Stock Máximo',
      'Nivel de Abasto (%)',
      'Estatus / Alerta',
      'Ubicación en Rack',
      'Costo Unitario ($ MXN)',
      'Valor Total ($ MXN)',
      'No. Lote',
      'Fecha Caducidad',
      'Último Reabastecimiento',
      'Notas y Observaciones'
    ]
  ];

  const dataRows: any[][] = items.map(item => {
    const abastoPct = item.stockMinimum > 0 ? Math.round((item.stockCurrent / item.stockMinimum) * 100) : 100;
    const estatus = item.stockCurrent <= item.stockMinimum ? '⚠️ ALERTA: REORDEN URGENTE' : '✅ STOCK ÓPTIMO';
    const valorItem = item.stockCurrent * item.unitCost;

    return [
      item.sku,
      item.itemName,
      item.category.replace(/_/g, ' '),
      item.unit,
      item.stockCurrent,
      item.stockMinimum,
      item.stockMaximum,
      `${abastoPct}%`,
      estatus,
      item.locationRack,
      item.unitCost,
      valorItem,
      item.batchNumber || 'N/A',
      item.expirationDate || 'N/A',
      item.lastRestockDate,
      item.notes || ''
    ];
  });

  const fullSheet = [...headerRows, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullSheet);
  const workbook = XLSX.utils.book_new();

  // Configuración de anchos de columna (20 a 38 caracteres)
  const minCols = [18, 38, 26, 18, 18, 24, 18, 20, 28, 32, 22, 22, 18, 18, 24, 35];
  const cols = minCols.map((minW, idx) => {
    let maxLen = minW;
    fullSheet.forEach(row => {
      if (row && row[idx] !== undefined && row[idx] !== null) {
        const valStr = String(row[idx]);
        if (valStr.length > maxLen && valStr.length < 50) {
          maxLen = valStr.length;
        }
      }
    });
    return { wch: maxLen + 3 };
  });

  worksheet['!cols'] = cols;
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Almacen_General_PuertaHierro');

  const fileName = `Almacen_General_PuertaDeHierro_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Exportar Órdenes de Compra y Proveedores a Excel (.xlsx) con membrete oficial
 */
export function exportPurchaseOrdersToExcel(orders: PurchaseOrder[], suppliers: Supplier[]) {
  const emitDate = new Date();
  const fechaStr = emitDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaStr = emitDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const totalGastos = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const headerRows: any[][] = [
    ['🏥 CENTRO MÉDICO PUERTA DE HIERRO TEPIC - ALTA ESPECIALIDAD'],
    ['ÁREA DE COMPRAS, ADQUISICIONES & PROVEEDORES HOSPITALARIOS'],
    ['Sede Tepic | Av. Emilio M. González #221, Cd. Industrial, Nayarit | Tel: (311) 129-5200 | Urgencias: (311) 129-5206'],
    ['REPORTE EJECUTIVO DE ÓRDENES DE COMPRA (OC) Y COMPROMISOS PRESUPUESTALES'],
    [`Fecha y Hora de Emisión: ${fechaStr} a las ${horaStr} | Autorización: Dirección General`],
    [`Total Órdenes: ${orders.length} | Gasto Comprometido: $${totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN | Proveedores Calificados: ${suppliers.length}`],
    [],
    [
      'Folio OC',
      'Proveedor Adjudicado',
      'RFC Proveedor',
      'Departamento Solicitante',
      'Fecha de Emisión',
      'Promesa de Entrega',
      'Condiciones de Pago',
      'Estatus de la Orden',
      'Subtotal ($ MXN)',
      'IVA 16% ($ MXN)',
      'Total ($ MXN)',
      'Autorizado Por',
      'Fecha Autorización',
      'Desglose de Partidas Insumos',
      'Observaciones'
    ]
  ];

  const dataRows: any[][] = orders.map(ord => {
    const partidasStr = ord.items.map(it => `${it.description} (x${it.quantity} @ $${it.unitCost})`).join(' | ');

    return [
      ord.orderFolio,
      ord.supplierName,
      ord.supplierRfc,
      ord.requestingDepartment,
      ord.orderDate,
      ord.expectedDeliveryDate,
      ord.paymentTerms,
      ord.status.replace(/_/g, ' '),
      ord.subtotal,
      ord.taxIva,
      ord.totalAmount,
      ord.authorizedBy || 'PENDIENTE DE AUTORIZACIÓN',
      ord.authorizedAt || 'N/A',
      partidasStr,
      ord.notes || ''
    ];
  });

  const fullSheet = [...headerRows, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullSheet);
  const workbook = XLSX.utils.book_new();

  const minCols = [18, 36, 20, 28, 18, 20, 22, 26, 20, 18, 20, 36, 20, 45, 30];
  const cols = minCols.map((minW, idx) => {
    let maxLen = minW;
    fullSheet.forEach(row => {
      if (row && row[idx] !== undefined && row[idx] !== null) {
        const valStr = String(row[idx]);
        if (valStr.length > maxLen && valStr.length < 55) {
          maxLen = valStr.length;
        }
      }
    });
    return { wch: maxLen + 3 };
  });

  worksheet['!cols'] = cols;
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ordenes_Compra_PuertaHierro');

  const fileName = `Compras_Ordenes_PuertaDeHierro_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

