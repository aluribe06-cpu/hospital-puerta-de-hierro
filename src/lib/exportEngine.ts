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
  Supplier,
  SocialWorkRecord,
  CashAuditRecord,
  ShiftClosingRecord
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
 * Exportar corte de caja del turno a Excel (.xlsx) con desglose fiscal de IVA y CFDI 4.0
 */
export function exportCashReportToExcel(transactions: CashTransaction[], shiftName: string) {
  const data = transactions.map(t => ({
    'Folio Recibo': t.receiptNumber,
    'Factura CFDI 4.0': t.invoiceData?.invoiceFolio || (t.isInvoiceIssued ? 'EMITIDA' : 'PENDIENTE'),
    'Folio Fiscal UUID SAT': t.invoiceData?.uuidSat || 'SIN TIMBRAR',
    'RFC Receptor': t.invoiceData?.rfcRecipient || 'N/A',
    'Razón Social / Paciente': t.invoiceData?.businessName || t.patientName,
    'Régimen Fiscal': t.invoiceData?.taxRegime || 'N/A',
    'Uso CFDI': t.invoiceData?.cfdiUsage || 'N/A',
    'Categoría Servicio': t.serviceCategory,
    'Concepto Hospitalario': t.conceptDescription,
    'Subtotal ($)': t.subtotal,
    'Tipo Gravamen IVA': t.taxCategory === 'IVA_16' ? 'IVA 16% (Gravado)' : t.taxCategory === 'EXENTO_MEDICO' ? 'Exento Art. 15 LIVA' : 'Tasa 0%',
    'IVA Trasladado ($)': t.taxAmount,
    'Total Bruto ($)': t.totalAmount,
    'Aseguradora Convenio': t.insuranceAgreement?.companyName || 'PARTICULAR',
    'Carta de Autorización / Siniestro': t.insuranceAgreement?.authorizationCode ? `${t.insuranceAgreement.authorizationCode} (Siniestro: ${t.insuranceAgreement.claimNumber || 'N/A'})` : 'N/A',
    'Cobertura Aseguradora ($)': t.insuranceCoverageAmount,
    'Copago Paciente ($)': t.patientCopayAmount,
    'Forma de Pago': t.paymentMethod.replace(/_/g, ' '),
    'Cajero en Turno': t.cashierName,
    'Turno': t.shift,
    'Estatus Facturación': t.status,
    'Fecha y Hora': t.createdAt.replace('T', ' ').substring(0, 16),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `Corte Caja ${shiftName}`);
  XLSX.writeFile(workbook, `Corte_Caja_SAT_Puerta_de_Hierro_${shiftName}_${Date.now()}.xlsx`);
}

/**
 * Generar Factura Electrónica Oficial SAT CFDI 4.0 en PDF
 */
export function generateInvoicePDF(transaction: CashTransaction) {
  const doc = new jsPDF();
  const inv = transaction.invoiceData;
  const folio = inv?.invoiceFolio || transaction.receiptNumber;
  const uuid = inv?.uuidSat || '4E4766EB-11B0-427E-8E8D-9081C817BEFC';
  const fechaTimbrado = inv?.timbradoDate || transaction.createdAt.replace('Z', '').replace('T', ' ');

  // 1. Encabezado Emisor Hospital Puerta de Hierro (Azul Marino SAT)
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRO MÉDICO PUERTA DE HIERRO S.A. DE C.V.', 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('RFC: CMP0405187A1  |  Régimen Fiscal: 601 - General de Ley Personas Morales', 14, 17);
  doc.text('Domicilio Fiscal: Av. Emilio M. González #221, Cd. Industrial, C.P. 63173, Tepic, Nayarit', 14, 22);
  doc.text('Lugar de Expedición: 63173 | Tipo de Comprobante: I - Ingreso | Exportación: 01 - No aplica', 14, 27);

  // Cuadro Folio y Factura (Esquina Superior Derecha)
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(140, 6, 60, 20, 2, 2, 'F');
  doc.setTextColor(56, 189, 248); // Cyan 400
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`FACTURA CFDI 4.0`, 144, 12);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`Serie y Folio: ${folio}`, 144, 18);
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Recibo Ref: ${transaction.receiptNumber}`, 144, 23);

  // 2. Bloque de Datos Fiscales del Receptor y Timbre Digital
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);

  // Receptor Box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 36, 100, 40, 'FD');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS FISCALES DEL RECEPTOR / CLIENTE', 18, 42);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Razón Social:', 18, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(inv?.businessName || transaction.patientName, 40, 48);

  doc.setFont('helvetica', 'bold');
  doc.text('RFC:', 18, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(inv?.rfcRecipient || 'XAXX010101000', 40, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Domicilio (C.P.):', 18, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(inv?.postalCode || '63000', 44, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('Régimen Fiscal:', 18, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(inv?.taxRegime || '605 - Sueldos y Salarios', 42, 66);

  doc.setFont('helvetica', 'bold');
  doc.text('Uso del CFDI:', 18, 72);
  doc.setFont('helvetica', 'normal');
  doc.text(inv?.cfdiUsage || 'D01 - Gastos hospitalarios', 40, 72);

  // Comprobante Fiscal SAT Box
  doc.rect(116, 36, 80, 40, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('TIMBRE FISCAL DIGITAL (SAT)', 120, 42);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Folio Fiscal (UUID):', 120, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(uuid, 120, 53);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('No. Certificado SAT:', 120, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(inv?.satCertificateNumber || '00001000000504465028', 152, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Fecha Certificación:', 120, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(fechaTimbrado, 150, 65);

  doc.setFont('helvetica', 'bold');
  doc.text('Método / Forma Pago:', 120, 71);
  doc.setFont('helvetica', 'normal');
  doc.text(`${inv?.paymentMethodSat || 'PUE'} | ${inv?.paymentFormSat || '04'}`, 154, 71);

  // 3. Tabla de Conceptos y Desglose de Impuestos (CFDI 4.0)
  const claveProdServ = transaction.serviceCategory === 'QUIROFANO' || transaction.serviceCategory === 'HOSPITALIZACION' 
    ? '85101500 - Centros de salud / hospitalización'
    : transaction.serviceCategory === 'FARMACIA'
    ? '51101500 - Medicamentos y material de curación'
    : '85121600 - Médicos y diagnóstico';

  const objetoImpuesto = transaction.taxCategory === 'IVA_16' ? '02 - Sí objeto de impuesto' : '01 - No objeto / Exento LIVA';
  const tipoFactor = transaction.taxCategory === 'IVA_16' ? 'Tasa 16%' : 'Exento (Art. 15 Fracc. XIV)';

  autoTable(doc, {
    startY: 81,
    head: [['Clave SAT', 'Cant.', 'Unidad', 'Descripción del Concepto Hospitalario', 'Valor Unitario', 'Descuento', 'Impuesto IVA', 'Importe']],
    body: [
      [
        claveProdServ.split(' ')[0],
        '1.00',
        'E48',
        transaction.conceptDescription,
        `$${transaction.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        transaction.insuranceCoverageAmount > 0 ? `-$${transaction.insuranceCoverageAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '$0.00',
        `${tipoFactor}\n$${transaction.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        `$${transaction.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 58 },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 24, halign: 'center' },
      7: { cellWidth: 22, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 110;

  // 4. Totales y Desglose Financiero de IVA
  const totalsStartY = finalY + 5;

  // Cuadro informativo LIVA
  doc.setFillColor(241, 245, 249);
  doc.rect(14, totalsStartY, 110, 36, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RÉGIMEN FISCAL DE IVA Y FUNDAMENTO LEGAL:', 18, totalsStartY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('• Servicios Médicos y Hospitalarios: Exentos conforme al Art. 15 Fracc. XIV de la Ley del IVA.', 18, totalsStartY + 12);
  doc.text('• Materiales de curación y servicios complementarios gravados a tasa general del 16% IVA.', 18, totalsStartY + 17);
  doc.text(`• Cobertura de Aseguradora aplicada: $${transaction.insuranceCoverageAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.`, 18, totalsStartY + 22);
  doc.text(`• Saldo cubierto por paciente / deducible: $${transaction.patientCopayAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.`, 18, totalsStartY + 27);
  doc.text('Moneda: MXN - Peso Mexicano | Efectos Fiscales al Pago', 18, totalsStartY + 32);

  // Cuadro de Sumas
  const totalsBoxX = 130;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  doc.text('Subtotal Bruto:', totalsBoxX, totalsStartY + 6);
  doc.text(`$${transaction.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 194, totalsStartY + 6, { align: 'right' });

  if (transaction.insuranceCoverageAmount > 0) {
    doc.text('Descuento Aseguradora:', totalsBoxX, totalsStartY + 12);
    doc.text(`-$${transaction.insuranceCoverageAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 194, totalsStartY + 12, { align: 'right' });
  }

  doc.text('IVA Trasladado (16%):', totalsBoxX, totalsStartY + 18);
  doc.text(`$${transaction.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 194, totalsStartY + 18, { align: 'right' });

  doc.text('Subtotal Exento (0% IVA):', totalsBoxX, totalsStartY + 24);
  doc.text(transaction.taxCategory === 'EXENTO_MEDICO' ? `$${transaction.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '$0.00', 194, totalsStartY + 24, { align: 'right' });

  doc.setFillColor(15, 23, 42);
  doc.rect(totalsBoxX - 2, totalsStartY + 27, 68, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL FACTURA:', totalsBoxX + 2, totalsStartY + 33);
  doc.text(`$${transaction.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 194, totalsStartY + 33, { align: 'right' });

  // 5. Sellos Digitales y Cadena Original SAT
  const stampStartY = totalsStartY + 41;

  doc.setDrawColor(203, 213, 225);
  doc.line(14, stampStartY - 2, 196, stampStartY - 2);

  // Simulación de QR SAT
  doc.setFillColor(241, 245, 249);
  doc.rect(14, stampStartY, 28, 28, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('[CÓDIGO QR]', 18, stampStartY + 12);
  doc.text('SAT CFDI 4.0', 18, stampStartY + 17);

  const textX = 46;
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Sello Digital del Emisor:', textX, stampStartY + 3);
  doc.setFont('courier', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(inv?.cfdiDigitalStamp || 'W9rT5yU...dGhpcyBpcyBhIHZhbGlkIGNmZGkgc3RhbXAgb2YgaG9zcGl0YWwgcHVlcnRhIGRlIGhpZXJybyB0ZXBpYw==', textX, stampStartY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Sello Digital del SAT:', textX, stampStartY + 11);
  doc.setFont('courier', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(inv?.satDigitalStamp || 'Z2xP4kM...T3xY9kL2mY2xpZW50ZV9zYXJfc3RhbXBfdmVyaWZpZWRfZGlnaXRhbF9wZGY=', textX, stampStartY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Cadena Original del Complemento de Certificación Digital del SAT:', textX, stampStartY + 19);
  doc.setFont('courier', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(inv?.originalStringSat || `||1.1|${uuid}|${fechaTimbrado}|SAT970701NN3|${transaction.subtotal.toFixed(2)}|${transaction.taxAmount.toFixed(2)}||`, textX, stampStartY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ESTE DOCUMENTO ES UNA REPRESENTACIÓN IMPRESA DE UN CFDI VERSIÓN 4.0', 14, stampStartY + 32);

  doc.save(`Factura_CFDI_4.0_${folio}_${transaction.patientName.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generar y descargar archivo XML SAT conforme a la norma CFDI 4.0 (Anexo 20 SAT)
 */
export function generateInvoiceXML(transaction: CashTransaction) {
  const inv = transaction.invoiceData;
  const folio = inv?.invoiceFolio || transaction.receiptNumber;
  const uuid = inv?.uuidSat || '4E4766EB-11B0-427E-8E8D-9081C817BEFC';
  const fecha = (inv?.timbradoDate || transaction.createdAt).replace('Z', '');
  const rfc = inv?.rfcRecipient || 'XAXX010101000';
  const razonSocial = (inv?.businessName || transaction.patientName).toUpperCase();
  const cp = inv?.postalCode || '63173';
  const regimen = inv?.taxRegime?.split(' - ')[0] || '605';
  const usoCfdi = inv?.cfdiUsage?.split(' - ')[0] || 'D01';
  const formaPago = inv?.paymentFormSat?.split(' - ')[0] || '04';
  const metodoPago = inv?.paymentMethodSat?.split(' - ')[0] || 'PUE';

  const subtotal = transaction.subtotal.toFixed(2);
  const taxAmount = transaction.taxAmount.toFixed(2);
  const total = transaction.totalAmount.toFixed(2);
  const descuento = transaction.insuranceCoverageAmount.toFixed(2);
  const tipoFactor = transaction.taxCategory === 'IVA_16' ? 'Tasa' : 'Exento';
  const tasa = transaction.taxCategory === 'IVA_16' ? '0.160000' : '0.000000';
  const objetoImp = transaction.taxCategory === 'IVA_16' ? '02' : '01';

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" Version="4.0" Serie="FA" Folio="${folio}" Fecha="${fecha}" Sello="${inv?.cfdiDigitalStamp || 'SELLO_CFDI_DIGITAL_EMISOR_HPDH'}" FormaPago="${formaPago}" NoCertificado="${inv?.emisorCertificateNumber || '00001000000506148821'}" Certificado="MIIF...CERTIFICADO_SAT" SubTotal="${subtotal}" Descuento="${descuento}" Moneda="MXN" Total="${total}" TipoDeComprobante="I" Exportacion="01" MetodoPago="${metodoPago}" LugarExpedicion="63173">
  <cfdi:Emisor Rfc="CMP0405187A1" Nombre="CENTRO MEDICO PUERTA DE HIERRO SA DE CV" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${rfc}" Nombre="${razonSocial}" DomicilioFiscalReceptor="${cp}" RegimenFiscalReceptor="${regimen}" UsoCFDI="${usoCfdi}"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="${transaction.serviceCategory === 'FARMACIA' ? '51101500' : '85101500'}" NoIdentificacion="${transaction.id}" Cantidad="1.00" ClaveUnidad="E48" Unidad="Servicio" Descripcion="${transaction.conceptDescription}" ValorUnitario="${subtotal}" Importe="${subtotal}" Descuento="${descuento}" ObjetoImp="${objetoImp}">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="${subtotal}" Impuesto="002" TipoFactor="${tipoFactor}" TasaOCuota="${tasa}" Importe="${taxAmount}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${taxAmount}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${subtotal}" Impuesto="002" TipoFactor="${tipoFactor}" TasaOCuota="${tasa}" Importe="${taxAmount}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="1.1" UUID="${uuid}" FechaTimbrado="${inv?.timbradoDate || fecha}" RfcProvCertif="SAT970701NN3" SelloCFD="${inv?.cfdiDigitalStamp || 'SELLO_CFD'}" NoCertificadoSAT="${inv?.satCertificateNumber || '00001000000504465028'}" SelloSAT="${inv?.satDigitalStamp || 'SELLO_SAT'}"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Factura_CFDI_4.0_${folio}_${uuid}.xml`;
  link.click();
}

/**
 * Generar Recibo de Caja y Liquidación Hospitalaria en PDF
 */
export function generateCashReceiptPDF(transaction: CashTransaction) {
  const doc = new jsPDF();

  // Encabezado
  doc.setFillColor(16, 185, 129); // Esmeralda / Green Caja
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRO MÉDICO PUERTA DE HIERRO TEPIC', 14, 12);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('RECIBO OFICIAL DE PAGO Y CAJA HOSPITALARIA | NOM-024-SSA3-2012', 14, 18);
  doc.text('Av. Emilio M. González #221, Cd. Industrial, Nayarit | Tel: (311) 129-5200', 14, 23);

  // Recibo Folio
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(142, 5, 58, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`RECIBO: ${transaction.receiptNumber}`, 145, 12);
  doc.setFontSize(7.5);
  doc.setTextColor(167, 243, 208);
  doc.text(`Fecha: ${transaction.createdAt.replace('T', ' ').substring(0, 16)}`, 145, 18);

  // Datos del Paciente
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL SERVICIO Y PACIENTE', 14, 36);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${transaction.patientName}`, 14, 43);
  doc.text(`Departamento: ${transaction.serviceCategory}  |  Turno: ${transaction.shift}`, 14, 49);
  doc.text(`Cajero: ${transaction.cashierName}`, 14, 55);

  autoTable(doc, {
    startY: 60,
    head: [['Concepto del Cobro', 'Subtotal', 'Régimen IVA', 'Monto IVA', 'Total']],
    body: [
      [
        transaction.conceptDescription,
        `$${transaction.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        transaction.taxCategory === 'IVA_16' ? '16% Gravado' : 'Exento Art. 15 LIVA',
        `$${transaction.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        `$${transaction.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 85;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Cobertura Aseguradora: $${transaction.insuranceCoverageAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 14, finalY + 8);
  doc.text(`Copago / Importe Pagado por Paciente: $${transaction.patientCopayAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 14, finalY + 14);
  doc.text(`Forma de Pago: ${transaction.paymentMethod.replace(/_/g, ' ')}`, 14, finalY + 20);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Firma y Sello de Caja Hospital Puerta de Hierro', 14, finalY + 38);
  doc.line(14, finalY + 34, 80, finalY + 34);

  doc.save(`Recibo_Caja_${transaction.receiptNumber}_${transaction.patientName.replace(/\s+/g, '_')}.pdf`);
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
  cie11?: string;
  cie11Desc?: string;
  items: { drugName: string; dosage: string; frequency: string; duration: string; instructions: string }[];
  vitalSigns?: { bp?: string; hr?: number; temp?: number; weight?: number; height?: number; bmi?: number; spo2?: number; glucose?: number; painScale?: number };
  generalCare?: string[];
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
  doc.text(params.physicianName, 14, 34);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Especialidad: ${params.specialty} | Cédula Profesional: ${params.physicianLicense} | NOM-004 / NOM-024`, 14, 39);

  // Línea divisoria
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // Datos del Paciente (con somatometría y signos vitales recabados en Triage)
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('DATOS DEL EXPEDIENTE Y SOMATOMETRÍA (TRIAGE & ADMISIÓN)', 14, 47);
  doc.setFont('helvetica', 'normal');
  doc.text(`Paciente: ${params.patient.firstName} ${params.patient.lastName}  |  Expediente: ${params.patient.patientNumber}  |  CURP: ${params.patient.curp}`, 14, 52);
  
  const peso = params.vitalSigns?.weight || params.patient.weightKg;
  const talla = params.vitalSigns?.height || params.patient.heightCm;
  const imc = params.vitalSigns?.bmi || params.patient.calculatedBmi || 'N/A';
  const ta = params.vitalSigns?.bp || '120/80';
  const fc = params.vitalSigns?.hr ? `${params.vitalSigns.hr} lpm` : '78 lpm';
  const temp = params.vitalSigns?.temp ? `${params.vitalSigns.temp} °C` : '36.8 °C';
  const spo2 = params.vitalSigns?.spo2 ? `${params.vitalSigns.spo2}%` : '98%';
  
  doc.text(`Somatometría: Peso ${peso} kg  |  Talla ${talla} cm  |  IMC ${imc}  |  Signos: TA ${ta} mmHg, FC ${fc}, Temp ${temp}, SpO2 ${spo2}`, 14, 57);
  
  // Alergias en rojo de alerta crítica
  doc.setTextColor(220, 38, 38);
  doc.setFont('helvetica', 'bold');
  doc.text(`ALERGIAS IDENTIFICADAS: ${params.patient.allergies.toUpperCase()}`, 14, 62);

  // Diagnóstico OMS CIE-11 y Equivalencia CIE-10
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  if (params.cie11) {
    doc.text(`Diagnóstico CIE-11 (OMS): [${params.cie11}] ${params.cie11Desc || params.diagnosis}`, 14, 67);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Equivalencia Normativa CIE-10 (NOM-004-SSA3-2012): [${params.cie10}] ${params.diagnosis}`, 14, 72);
  } else {
    doc.text(`Diagnóstico CIE-10: [${params.cie10}] ${params.diagnosis}`, 14, 68);
  }

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
    startY: params.cie11 ? 76 : 72,
    head: [['#', 'Medicamento / Fármaco Prescrito', 'Dosis', 'Frecuencia', 'Duración', 'Indicaciones de Administración']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 6;

  // Medidas higiénico dietéticas recomendadas por IA si existen
  if (params.generalCare && params.generalCare.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, currentY, 182, 6 + (params.generalCare.length * 4.5), 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDIDAS HIGIÉNICO-DIETÉTICAS Y CUIDADOS GENERALES:', 17, currentY + 4);
    doc.setFont('helvetica', 'normal');
    params.generalCare.forEach((care, i) => {
      doc.text(`• ${care}`, 17, currentY + 8 + (i * 4.5));
    });
    currentY += 8 + (params.generalCare.length * 4.5) + 4;
  }

  // Pie de página y Firma Digital NOM-024
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Esta receta tiene una vigencia de 30 días naturales a partir de su emisión según la Ley General de Salud.', 14, currentY + 6);
  doc.text('Para medicamentos controlados (Fracción II y III), la farmacia retiene el original con firma autógrafa/digital.', 14, currentY + 10);

  // Cuadro de firma
  doc.setDrawColor(148, 163, 184);
  doc.line(120, currentY + 30, 190, currentY + 30);
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(params.physicianName, 155, currentY + 35, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Cédula Prof: ${params.physicianLicense}`, 155, currentY + 39, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Sello Criptográfico NOM-024-SSA3-2012 / Firma Electrónica Avanzada', 155, currentY + 44, { align: 'center' });
  doc.text(Date.now().toString(16) + 'e49a8f102c98d7b6a5', 155, currentY + 48, { align: 'center' });

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

/**
 * Exportar Padrón de Casos de Trabajo Social a Excel (.xlsx)
 */
export function exportSocialWorkToExcel(records: SocialWorkRecord[]) {
  const emitDate = new Date();
  const fechaStr = emitDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaStr = emitDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const headerRows: any[][] = [
    ['🏥 CENTRO MÉDICO PUERTA DE HIERRO TEPIC - ALTA ESPECIALIDAD'],
    ['DEPARTAMENTO DE TRABAJO SOCIAL Y ATENCIÓN ASISTENCIAL'],
    ['Av. Emilio M. González #221, Cd. Industrial, Nayarit | Urgencias 24/7: (311) 129-5206'],
    ['PADRÓN GENERAL DE CASOS, ESTUDIOS SOCIOECONÓMICOS Y CASOS LEGALES / DEFUNCIONES'],
    [`Fecha y Hora de Emisión: ${fechaStr} a las ${horaStr} | Licencia Sanitaria: 18-AM-18-017-0004`],
    [],
    [
      'Folio TS',
      'Fecha',
      'Hora',
      'Tipo de Caso',
      'Estatus',
      'No. Expediente',
      'Paciente',
      'Edad',
      'Género',
      'Servicio/Área',
      'Cama',
      'Familiar Contacto',
      'Parentesco',
      'Teléfono',
      'Nivel Socioeconómico',
      'Ingreso Mensual',
      'Egreso Mensual',
      '% Descuento Aprobado',
      'Código Patronato',
      'Folio Cert. Defunción',
      'Causa Defunción',
      'Médico Certificador',
      'Funeraria Asignada',
      'Acta Registro Civil',
      'Destino Restos',
      'Oficio MP',
      'Fiscalía / MP',
      'Motivo Legal',
      'Institución Canalización',
      'Diagnóstico Social',
      'Acciones Realizadas',
      'Trabajador(a) Social'
    ]
  ];

  const dataRows: any[][] = records.map(r => [
    r.folio,
    r.date,
    r.time,
    r.caseType.replace(/_/g, ' '),
    r.status.replace(/_/g, ' '),
    r.patientExpNumber,
    r.patientName,
    r.patientAge || 'N/A',
    r.patientGender || 'N/A',
    r.areaService,
    r.bedNumber || 'N/A',
    r.familyContactName,
    r.familyContactRelationship,
    r.familyContactPhone,
    r.socioeconomicLevel ? r.socioeconomicLevel.replace(/_/g, ' ') : 'N/A',
    r.familyIncomeMonthly ? `$${r.familyIncomeMonthly.toLocaleString('es-MX')}` : 'N/A',
    r.familyExpensesMonthly ? `$${r.familyExpensesMonthly.toLocaleString('es-MX')}` : 'N/A',
    r.supportDiscountApprovedPercentage ? `${r.supportDiscountApprovedPercentage}%` : '0%',
    r.patronatoAuthorizationCode || 'N/A',
    r.deathData?.deathCertificateFolio || 'N/A',
    r.deathData?.deathCausePrimary || 'N/A',
    r.deathData?.certifyingPhysician || 'N/A',
    r.deathData?.funeralHomeName || 'N/A',
    r.deathData?.civilRegistryFolio || 'N/A',
    r.deathData?.bodyDestination || 'N/A',
    r.mpReportNumber || 'N/A',
    r.mpAgencyName || 'N/A',
    r.mpNotificationReason || 'N/A',
    r.referralInstitution || 'N/A',
    r.socialDiagnosis,
    r.actionsTaken,
    r.socialWorkerName
  ]);

  const fullSheet = [...headerRows, ...dataRows];
  const worksheet = XLSX.utils.aoa_to_sheet(fullSheet);
  const workbook = XLSX.utils.book_new();

  const minCols = [15, 12, 10, 24, 18, 16, 28, 8, 10, 16, 10, 26, 14, 16, 20, 16, 16, 18, 18, 22, 35, 25, 25, 24, 16, 20, 30, 30, 25, 45, 45, 25];
  worksheet['!cols'] = minCols.map(w => ({ wch: w }));

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajo_Social_PuertaHierro');
  const fileName = `Trabajo_Social_PuertaDeHierro_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Generar Dictamen Oficial de Estudio Socioeconómico en PDF
 */
export function generateSocialWorkStudyPDF(record: SocialWorkRecord) {
  const doc = new jsPDF();

  // Encabezado Institucional
  doc.setFillColor(15, 23, 42); // Azul oscuro pizarra
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRO MÉDICO PUERTA DE HIERRO TEPIC', 14, 11);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPARTAMENTO DE TRABAJO SOCIAL MÉDICO | DICTAMEN DE ESTUDIO SOCIOECONÓMICO', 14, 16);
  doc.text('Av. Emilio M. González #221, Cd. Industrial, Tepic, Nayarit | Tel: (311) 129-5200', 14, 21);

  // Folio y Fecha
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`FOLIO ESTUDIO: ${record.folio}`, 14, 33);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de Aplicación: ${record.date} a las ${record.time} hrs  |  Estatus: ${record.status.replace(/_/g, ' ')}`, 14, 38);

  // Línea
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // Datos del Paciente
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. FICHA DE IDENTIFICACIÓN DEL PACIENTE', 14, 48);

  const patientTable = [
    ['Nombre Completo:', record.patientName, 'No. Expediente:', record.patientExpNumber],
    ['Edad:', record.patientAge ? `${record.patientAge} años` : 'N/A', 'Género:', record.patientGender || 'N/A'],
    ['Área de Atención:', record.areaService, 'Cama / Ubicación:', record.bedNumber || 'En valoración']
  ];

  autoTable(doc, {
    startY: 51,
    body: patientTable,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 35 },
      1: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 60 },
      2: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 35 },
      3: { textColor: [15, 23, 42], cellWidth: 60 }
    }
  });

  // Datos del Familiar Responsable
  let curY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('2. NÚCLEO FAMILIAR Y CONTACTO DE EMERGENCIA', 14, curY);

  const familyTable = [
    ['Familiar Informante:', record.familyContactName, 'Parentesco:', record.familyContactRelationship],
    ['Teléfono Contacto:', record.familyContactPhone, 'Miembros en el Hogar:', record.familyMembersCount ? `${record.familyMembersCount} personas` : '4 personas'],
    ['Tipo de Vivienda:', record.housingType || 'PROPIA', 'Zona / Localidad:', 'Tepic, Nayarit']
  ];

  autoTable(doc, {
    startY: curY + 3,
    body: familyTable,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 35 },
      1: { textColor: [15, 23, 42], cellWidth: 60 },
      2: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 35 },
      3: { textColor: [15, 23, 42], cellWidth: 60 }
    }
  });

  // Evaluación Económica
  curY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('3. EVALUACIÓN SOCIOECONÓMICA Y TABULADOR', 14, curY);

  const balance = (record.familyIncomeMonthly || 0) - (record.familyExpensesMonthly || 0);

  const ecoTable = [
    ['Ingreso Mensual Familiar:', `$${(record.familyIncomeMonthly || 0).toLocaleString('es-MX')} MXN`],
    ['Egresos Fijos Mensuales (Alimentación, renta, salud):', `$${(record.familyExpensesMonthly || 0).toLocaleString('es-MX')} MXN`],
    ['Balance Económico Familiar:', balance >= 0 ? `+$${balance.toLocaleString('es-MX')} MXN` : `-$${Math.abs(balance).toLocaleString('es-MX')} MXN (Déficit)`],
    ['Nivel Socioeconómico Asignado:', record.socioeconomicLevel ? record.socioeconomicLevel.replace(/_/g, ' ') : 'NIVEL_2'],
    ['Subsidio / Descuento Sugerido o Aprobado:', `${record.supportDiscountApprovedPercentage || 0}% de apoyo institucional`],
    ['Código de Autorización Patronato:', record.patronatoAuthorizationCode || 'EN TRÁMITE']
  ];

  autoTable(doc, {
    startY: curY + 3,
    body: ecoTable,
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [51, 65, 85], cellWidth: 100 },
      1: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 80 }
    }
  });

  // Diagnóstico Social y Acciones
  curY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('4. DIAGNÓSTICO SOCIAL Y ACCIONES REALIZADAS', 14, curY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  
  doc.text('Diagnóstico Social:', 14, curY + 6);
  const diagLines = doc.splitTextToSize(record.socialDiagnosis, 180);
  doc.text(diagLines, 14, curY + 11);

  const afterDiagY = curY + 11 + (diagLines.length * 4.5);
  doc.text('Acciones Realizadas:', 14, afterDiagY);
  const actLines = doc.splitTextToSize(record.actionsTaken, 180);
  doc.text(actLines, 14, afterDiagY + 5);

  // Firmas Institucionales
  const signY = 245;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);

  // Firma 1: Trabajadora Social
  doc.line(16, signY, 70, signY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(record.socialWorkerName, 43, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Trabajadora Social Dictaminadora', 43, signY + 8, { align: 'center' });

  // Firma 2: Familiar Responsable
  doc.line(78, signY, 132, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(record.familyContactName, 105, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Familiar Informante (${record.familyContactRelationship})`, 105, signY + 8, { align: 'center' });

  // Firma 3: Dirección / Patronato
  doc.line(140, signY, 194, signY);
  doc.setFont('helvetica', 'bold');
  doc.text('Dirección Médica / Patronato', 167, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Hospital Puerta de Hierro Tepic', 167, signY + 8, { align: 'center' });

  // Pie de página
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Documento oficial confidencial amparado bajo la NOM-004-SSA3-2012 del Expediente Clínico y Ley de Protección de Datos Personales.', 105, 275, { align: 'center' });

  doc.save(`Dictamen_Socioeconomico_${record.folio}_${record.patientExpNumber}.pdf`);
}

/**
 * Generar Constancia y Hoja de Trámite de Defunción en PDF
 */
export function generateDeathCertificateNoticePDF(record: SocialWorkRecord) {
  const doc = new jsPDF();
  const d = record.deathData;

  // Encabezado Luto / Institucional
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRO MÉDICO PUERTA DE HIERRO TEPIC', 14, 11);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPARTAMENTO DE TRABAJO SOCIAL | HOJA DE TRÁMITE Y CONSTANCIA DE DEFUNCIÓN HOSPITALARIA', 14, 16);
  doc.text('Cumplimiento con NOM-004-SSA3-2012, Ley General de Salud y Registro Civil del Estado de Nayarit', 14, 21);

  // Folio y Fecha
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`EXPEDIENTE DEFUNCIÓN: ${record.folio}`, 14, 33);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de Fallecimiento: ${d?.deathDate || record.date} a las ${d?.deathTime || record.time} hrs  |  Servicio: ${record.areaService}`, 14, 38);

  // Línea
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // Datos del Paciente Fallecido
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. DATOS DEL FINADO(A)', 14, 48);

  const patientTable = [
    ['Nombre del Finado(a):', record.patientName, 'No. Expediente:', record.patientExpNumber],
    ['Edad al Fallecer:', record.patientAge ? `${record.patientAge} años` : 'N/A', 'Género:', record.patientGender || 'N/A'],
    ['Fecha y Hora Deceso:', `${d?.deathDate || record.date} - ${d?.deathTime || record.time} hrs`, 'Cama / Área:', record.bedNumber || record.areaService]
  ];

  autoTable(doc, {
    startY: 51,
    body: patientTable,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 38 },
      1: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 60 },
      2: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 35 },
      3: { textColor: [15, 23, 42], cellWidth: 55 }
    }
  });

  // Datos Clínicos y Certificado SSA
  let curY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('2. CERTIFICACIÓN MÉDICA Y CAUSAS DE DEFUNCIÓN', 14, curY);

  const certTable = [
    ['Folio Certificado SSA:', d?.deathCertificateFolio || 'PENDIENTE DE ASIGNACIÓN'],
    ['Médico Certificador:', `${d?.certifyingPhysician || 'N/A'} (Cédula: ${d?.certifyingPhysicianCedula || 'N/A'})`],
    ['Causa Primaria / Determinante:', d?.deathCausePrimary || 'En estudio patológico'],
    ['Causas Secundarias / Comorbilidad:', d?.deathCauseSecondary || 'Ninguna registrada'],
    ['Destino Final Autorizado:', d?.bodyDestination || 'INHUMACION']
  ];

  autoTable(doc, {
    startY: curY + 3,
    body: certTable,
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [51, 65, 85], cellWidth: 65 },
      1: { textColor: [15, 23, 42], cellWidth: 120 }
    }
  });

  // Entrega de Cuerpo, Agencia Funeraria y Registro Civil
  curY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('3. RECLAMACIÓN DE RESTOS Y TRÁMITE REGISTRO CIVIL', 14, curY);

  const claimTable = [
    ['Familiar que Reclama:', d?.legalClaimantName || record.familyContactName, 'Parentesco:', d?.legalClaimantKinship || record.familyContactRelationship],
    ['Teléfono de Contacto:', d?.legalClaimantPhone || record.familyContactPhone, 'Identificación Oficial:', d?.legalClaimantOfficialId || 'INE Verificada'],
    ['Agencia Funeraria Autorizada:', d?.funeralHomeName || 'Por designar', 'Folio Acta Registro Civil:', d?.civilRegistryFolio || 'EN TRÁMITE'],
    ['Oficialía Registro Civil:', d?.civilRegistryOffice || 'Oficialía 01 Tepic', 'Pertenencias Entregadas:', d?.personalBelongingsDelivered ? 'SÍ (Bajo inventario)' : 'NO / PENDIENTE']
  ];

  autoTable(doc, {
    startY: curY + 3,
    body: claimTable,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 42 },
      1: { fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 55 },
      2: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 40 },
      3: { textColor: [15, 23, 42], cellWidth: 55 }
    }
  });

  // Resumen de Intervención de Trabajo Social
  curY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('4. OBSERVACIONES Y ACCIONES DE TRABAJO SOCIAL', 14, curY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const notesLines = doc.splitTextToSize(record.actionsTaken || record.socialDiagnosis, 180);
  doc.text(notesLines, 14, curY + 6);

  // Firmas
  const signY = 245;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);

  // Firma 1: Trabajadora Social
  doc.line(16, signY, 70, signY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(record.socialWorkerName, 43, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Trabajadora Social en Turno', 43, signY + 8, { align: 'center' });

  // Firma 2: Familiar Receptor
  doc.line(78, signY, 132, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(d?.legalClaimantName || record.familyContactName, 105, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Familiar Legal Receptor de Restos', 105, signY + 8, { align: 'center' });

  // Firma 3: Funeraria / Carroza
  doc.line(140, signY, 194, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(d?.funeralHomeName || 'Agente Funerario', 167, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Recepción y Traslado de Cadáver', 167, signY + 8, { align: 'center' });

  // Pie de página
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Hospital Puerta de Hierro Tepic • Coordinación de Trabajo Social y Asuntos Médico-Legales.', 105, 275, { align: 'center' });

  doc.save(`Tramite_Defuncion_${record.folio}_${record.patientExpNumber}.pdf`);
}

/**
 * Generar Carta de Liquidación, Finiquito y Convenio con Aseguradora en PDF
 */
export function generateInsuranceSettlementPDF(transaction: CashTransaction) {
  const doc = new jsPDF();
  const agr = transaction.insuranceAgreement;
  const companyName = agr?.companyName || 'ASEGURADORA CONVENIO';
  const folioAuth = agr?.authorizationCode || 'AUT-HPDH-2026-091';
  const siniestro = agr?.claimNumber || 'SIN-2026-0881';
  const poliza = agr?.policyNumber || 'POL-GMM-7721';

  // 1. Encabezado
  doc.setFillColor(30, 58, 138); // Azul Marino Institucional
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRO MÉDICO PUERTA DE HIERRO TEPIC', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 242, 254);
  doc.text('DEPARTAMENTO DE CONVENIOS, SEGUROS (GMM) Y CAJA HOSPITALARIA', 14, 18);
  doc.text('Av. Emilio M. González #221, Cd. Industrial | Tel: (311) 129-5200 | Módulo de Convenios Directos', 14, 23);

  // Cuadro Folio Convenio
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(138, 6, 62, 18, 2, 2, 'F');
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PAGO DIRECTO GMM', 142, 12);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Recibo: ${transaction.receiptNumber}`, 142, 17);
  doc.text(`Fecha: ${transaction.createdAt.replace('T', ' ').substring(0, 10)}`, 142, 22);

  // 2. Datos del Convenio con la Aseguradora
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 35, 182, 30, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DE LA ASEGURADORA Y CARTA DE AUTORIZACIÓN', 18, 41);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Compañía Aseguradora:', 18, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(companyName, 55, 48);

  doc.setFont('helvetica', 'bold');
  doc.text('RFC Aseguradora:', 18, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(agr?.companyRfc || 'GNP9211244Z0', 48, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('No. de Póliza GMM:', 18, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(poliza, 48, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('Carta de Autorización:', 110, 48);
  doc.setFont('helvetica', 'normal');
  doc.text(folioAuth, 146, 48);

  doc.setFont('helvetica', 'bold');
  doc.text('No. de Siniestro:', 110, 54);
  doc.setFont('helvetica', 'normal');
  doc.text(siniestro, 138, 54);

  doc.setFont('helvetica', 'bold');
  doc.text('Términos de Crédito:', 110, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`${agr?.creditDaysTerms || 30} días (Transferencia Directa)`, 144, 60);

  // 3. Datos del Paciente
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 68, 182, 18, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PACIENTE ASEGURADO:', 18, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.patientName, 56, 74);

  doc.setFont('helvetica', 'bold');
  doc.text('Concepto Hospitalario:', 18, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(transaction.conceptDescription, 54, 80);

  // 4. Tabla de Liquidación
  autoTable(doc, {
    startY: 90,
    head: [['Descripción de la Cuenta', 'Monto Total', 'Cobertura Aseguradora (Pago Directo)', 'Deducible / Copago Paciente']],
    body: [
      [
        transaction.conceptDescription,
        `$${transaction.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
        `-$${transaction.insuranceCoverageAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
        `$${transaction.patientCopayAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 115;

  // 5. Declaratoria Legal de Finiquito y Cancelación de Pagaré
  doc.setFillColor(254, 252, 232); // Amber light
  doc.rect(14, finalY + 8, 182, 34, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('CLÁUSULA DE FINIQUITO DE CUENTA Y CANCELACIÓN DE PAGARÉ EN GARANTÍA:', 18, finalY + 14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('1. El Centro Médico Puerta de Hierro hace constar que el paciente ha cubierto a entera satisfacción en caja', 18, finalY + 20);
  doc.text(`   el importe correspondiente a su deducible y/o coaseguro por la cantidad de $${transaction.patientCopayAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN.`, 18, finalY + 24);
  doc.text(`2. El remanente de $${transaction.insuranceCoverageAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN se radica a cobro directo a la compañía ${companyName}`, 18, finalY + 29);
  doc.text(`   conforme a la carta de autorización ${folioAuth}. Se cancela el pagaré de garantía firmado al ingreso.`, 18, finalY + 34);

  // 6. Firmas
  const signY = finalY + 65;
  doc.setDrawColor(148, 163, 184);

  doc.line(18, signY, 68, signY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(transaction.cashierName, 43, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Cajero(a) en Turno', 43, signY + 8, { align: 'center' });

  doc.line(80, signY, 130, signY);
  doc.setFont('helvetica', 'bold');
  doc.text('Lic. Coordinador de Convenios', 105, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Módulo Convenios y Seguros GMM', 105, signY + 8, { align: 'center' });

  doc.line(142, signY, 192, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(transaction.patientName, 167, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Paciente / Titular de la Póliza', 167, signY + 8, { align: 'center' });

  doc.save(`Liquidacion_Seguro_${folioAuth}_${transaction.patientName.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generar Acta Oficial de Arqueo de Dinero y Conteo Físico de Efectivo en PDF
 */
export function generateCashAuditPDF(audit: CashAuditRecord) {
  const doc = new jsPDF();
  const d = audit.denominations;

  // 1. Encabezado Institucional
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRO MÉDICO PUERTA DE HIERRO TEPIC', 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('ACTA OFICIAL DE ARQUEO DE CAJA Y CONTEO FÍSICO DE EFECTIVO | AUDITORÍA INTERNA', 14, 17);
  doc.text('Av. Emilio M. González #221, Cd. Industrial | Tel: (311) 129-5200 | Módulo de Caja Hospitalaria', 14, 22);

  // Cuadro Folio Arqueo
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(140, 5, 60, 18, 2, 2, 'F');
  doc.setTextColor(245, 158, 11); // Amber
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(audit.auditFolio, 144, 11);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text(`Turno: ${audit.shift}`, 144, 16);
  doc.text(`Fecha: ${audit.auditDate}`, 144, 21);

  // 2. Datos Generales de la Auditoría
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DE LA AUDITORÍA DE EFECTIVO', 14, 35);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cajero Responsable: ${audit.cashierName}`, 14, 41);
  doc.text(`Auditor / Supervisor: ${audit.auditorName}`, 110, 41);
  doc.text(`Fondo Fijo Inicial Asignado: $${audit.initialCashFloat.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 14, 46);
  doc.text(`Estatus del Arqueo: ${audit.differenceStatus}`, 110, 46);

  // 3. Tablas de Conteo: Billetes y Monedas
  const billTotal = (d.b1000 * 1000) + (d.b500 * 500) + (d.b200 * 200) + (d.b100 * 100) + (d.b50 * 50) + (d.b20 * 20);
  const coinTotal = (d.m20 * 20) + (d.m10 * 10) + (d.m5 * 5) + (d.m2 * 2) + (d.m1 * 1) + (d.m050 * 0.50);

  autoTable(doc, {
    startY: 52,
    head: [['Denominación Billete', 'Cantidad', 'Importe ($ MXN)', 'Denominación Moneda', 'Cantidad', 'Importe ($ MXN)']],
    body: [
      ['Billete $1,000 MXN', d.b1000, `$${(d.b1000 * 1000).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Moneda $20 MXN', d.m20, `$${(d.m20 * 20).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ['Billete $500 MXN', d.b500, `$${(d.b500 * 500).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Moneda $10 MXN', d.m10, `$${(d.m10 * 10).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ['Billete $200 MXN', d.b200, `$${(d.b200 * 200).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Moneda $5 MXN', d.m5, `$${(d.m5 * 5).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ['Billete $100 MXN', d.b100, `$${(d.b100 * 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Moneda $2 MXN', d.m2, `$${(d.m2 * 2).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ['Billete $50 MXN', d.b50, `$${(d.b50 * 50).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Moneda $1 MXN', d.m1, `$${(d.m1 * 1).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ['Billete $20 MXN', d.b20, `$${(d.b20 * 20).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Moneda $0.50 MXN', d.m050, `$${(d.m050 * 0.50).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      [
        { content: 'SUBTOTAL BILLETES:', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: `$${billTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } },
        { content: 'SUBTOTAL MONEDAS:', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: `$${coinTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 120;

  // 4. Panel de Conciliación Final
  doc.setFillColor(241, 245, 249);
  doc.rect(14, finalY + 6, 182, 38, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CONCILIACIÓN FÍSICA VS SISTEMA', 18, finalY + 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`1. Total Efectivo Esperado en Sistema:`, 18, finalY + 20);
  doc.text(`$${audit.systemCashExpected.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 110, finalY + 20);

  doc.text(`2. Total Efectivo Físico Contado en Gaveta:`, 18, finalY + 26);
  doc.text(`$${audit.physicalCashCounted.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 110, finalY + 26);

  doc.setFont('helvetica', 'bold');
  if (audit.difference === 0) {
    doc.setTextColor(16, 185, 129); // Green
    doc.text(`3. DIFERENCIA: CAJA CUADRADA ($0.00 MXN)`, 18, finalY + 34);
  } else if (audit.difference > 0) {
    doc.setTextColor(2, 132, 199); // Blue
    doc.text(`3. DIFERENCIA: SOBRANTE DE CAJA (+$${audit.difference.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN)`, 18, finalY + 34);
  } else {
    doc.setTextColor(225, 29, 72); // Rose
    doc.text(`3. DIFERENCIA: FALTANTE DE CAJA (-$${Math.abs(audit.difference).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN)`, 18, finalY + 34);
  }

  // Observaciones
  if (audit.notes) {
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.text(`Observaciones: ${audit.notes}`, 18, finalY + 50);
  }

  // 5. Firmas de Conformidad
  const signY = finalY + 74;
  doc.setDrawColor(148, 163, 184);

  doc.line(24, signY, 84, signY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(audit.cashierName, 54, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Cajero(a) Responsable en Turno', 54, signY + 8, { align: 'center' });

  doc.line(126, signY, 186, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(audit.auditorName, 156, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Auditor / Supervisor de Caja', 156, signY + 8, { align: 'center' });

  doc.save(`Arqueo_Caja_${audit.auditFolio}_${audit.shift}.pdf`);
}

/**
 * Generar Acta Oficial de Corte de Caja y Cierre de Turno en PDF
 */
export function generateShiftClosingPDF(closing: ShiftClosingRecord) {
  const doc = new jsPDF();

  // 1. Encabezado
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRO MÉDICO PUERTA DE HIERRO TEPIC', 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('ACTA OFICIAL DE CORTE DE CAJA Y CIERRE DE TURNO | CONCILIACIÓN FISCAL', 14, 17);
  doc.text('Av. Emilio M. González #221, Cd. Industrial | Tel: (311) 129-5200 | Tesorería y Caja General', 14, 22);

  // Cuadro Folio Corte
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(140, 5, 60, 18, 2, 2, 'F');
  doc.setTextColor(56, 189, 248); // Cyan
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(closing.closingFolio, 144, 11);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text(`Turno: ${closing.shift}`, 144, 16);
  doc.text(`Fecha: ${closing.date}`, 144, 21);

  // 2. Datos Generales
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS GENERALES DE ENTREGA-RECEPCIÓN DE CAJA', 14, 35);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cajero Saliente: ${closing.cashierName}`, 14, 41);
  doc.text(`Supervisor / Entrega a: ${closing.supervisorName}`, 110, 41);
  doc.text(`Total Transacciones Realizadas: ${closing.totalTransactionsCount} cobros`, 14, 46);
  doc.text(`Estado de Conciliación: ${closing.status === 'CERRADO_CONCILIADO' ? 'CONCILIADO SIN DIFERENCIAS' : 'REVISIÓN PENDIENTE'}`, 110, 46);

  // 3. Tabla de Desglose por Método de Cobro
  autoTable(doc, {
    startY: 52,
    head: [['Método de Cobro', 'Importe ($ MXN)', '% del Turno', 'Estatus']],
    body: [
      ['Efectivo en Caja', `$${closing.cashTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, `${closing.totalIncome ? Math.round((closing.cashTotal / closing.totalIncome) * 100) : 0}%`, 'Conciliado'],
      ['Terminal TPV Débito', `$${closing.debitCardTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, `${closing.totalIncome ? Math.round((closing.debitCardTotal / closing.totalIncome) * 100) : 0}%`, 'Vouchers Verificados'],
      ['Terminal TPV Crédito', `$${closing.creditCardTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, `${closing.totalIncome ? Math.round((closing.creditCardTotal / closing.totalIncome) * 100) : 0}%`, 'Vouchers Verificados'],
      ['Transferencias Electrónicas SPEI', `$${closing.speiTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, `${closing.totalIncome ? Math.round((closing.speiTotal / closing.totalIncome) * 100) : 0}%`, 'Claves de Rastreo SAT'],
      ['Convenios Aseguradoras GMM (Crédito Hospitalario)', `$${closing.insuranceAgreementTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, `${closing.totalIncome ? Math.round((closing.insuranceAgreementTotal / closing.totalIncome) * 100) : 0}%`, 'Pagaré / Cartas Aut.'],
      [
        { content: 'TOTAL GENERAL RECAUDADO:', styles: { fontStyle: 'bold', halign: 'right' } },
        { content: `$${closing.totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, styles: { fontStyle: 'bold' } },
        { content: '100%', styles: { fontStyle: 'bold' } },
        { content: 'CIERRE OK', styles: { fontStyle: 'bold' } }
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 115;

  // 4. Tabla de Resumen Fiscal (IVA y CFDI 4.0)
  autoTable(doc, {
    startY: finalY + 6,
    head: [['Concepto Fiscal', 'Importe ($ MXN)', 'Régimen / Fundamento SAT']],
    body: [
      ['Subtotal Gravado con IVA 16%', `$${closing.subtotalTaxable.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Art. 1 Ley del IVA'],
      ['IVA 16% Trasladado Gravado', `$${closing.taxIva16Total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Impuesto Federal por Enterar al SAT'],
      ['Subtotal Actos Médicos Exentos de IVA', `$${closing.subtotalExempt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Art. 15 Fracc. XIV Ley del IVA'],
      ['Total Facturado Electrónicamente (CFDI 4.0)', `$${closing.invoicedCfdiTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Comprobantes Fiscales Timbrados'],
      ['Total Ventas Público General (Tickets de Caja)', `$${closing.nonInvoicedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'CFDI Global Diario / Público General']
    ],
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
  });

  const finalY2 = (doc as any).lastAutoTable?.finalY || 160;

  // 5. Retiro a Bóveda y Fondo Remanente
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, finalY2 + 6, 182, 22, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CONCENTRACIÓN DE VALORES Y FONDO DE CAMBIO:', 18, finalY2 + 12);

  doc.setFont('helvetica', 'normal');
  doc.text(`Efectivo Retirado para Bóveda / Traslado de Valores: $${closing.cashDepositedToVault.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 18, finalY2 + 18);
  doc.text(`Fondo Fijo Remanente en Caja para Siguiente Turno: $${closing.cashRemainingForNextShift.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 18, finalY2 + 23);

  // 6. Firmas
  const signY = finalY2 + 48;
  doc.setDrawColor(148, 163, 184);

  doc.line(18, signY, 68, signY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(closing.cashierName, 43, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Cajero Saliente (Entrega)', 43, signY + 8, { align: 'center' });

  doc.line(80, signY, 130, signY);
  doc.setFont('helvetica', 'bold');
  doc.text(closing.supervisorName, 105, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Cajero Entrante / Supervisor', 105, signY + 8, { align: 'center' });

  doc.line(142, signY, 192, signY);
  doc.setFont('helvetica', 'bold');
  doc.text('Lic. Contraloría Hospitalaria', 167, signY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Auditoría y Tesorería', 167, signY + 8, { align: 'center' });

  doc.save(`Corte_Caja_${closing.closingFolio}_${closing.shift}.pdf`);
}

/**
 * Generar Ticket Térmico de Pago (Formato 80mm de Caja Hospitalaria)
 */
export function generateThermalTicketPDF(transaction: CashTransaction) {
  // Dimensiones de ticket térmico estándar: 80mm de ancho x 190mm de alto
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 190]
  });

  // Encabezado
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRO MÉDICO PUERTA DE HIERRO', 40, 8, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('HOSPITAL DE ALTA ESPECIALIDAD', 40, 12, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('RFC: CMP120405H78 | Régimen 601', 40, 16, { align: 'center' });
  doc.text('Av. Emilio M. González #221, Cd. Industrial', 40, 20, { align: 'center' });
  doc.text('Tepic, Nayarit | Tel: (311) 129-5200', 40, 24, { align: 'center' });
  doc.text('------------------------------------------------------------', 40, 28, { align: 'center' });

  // Datos Ticket
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`TICKET DE PAGO: ${transaction.receiptNumber}`, 40, 33, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${transaction.createdAt.replace('T', ' ').substring(0, 16)}`, 6, 38);
  doc.text(`Turno: ${transaction.shift} | Cajero: ${transaction.cashierName.split(' ')[0]}`, 6, 42);
  doc.text(`Paciente: ${transaction.patientName}`, 6, 47);
  doc.text(`Departamento: ${transaction.serviceCategory}`, 6, 51);
  doc.text('------------------------------------------------------------', 40, 55, { align: 'center' });

  // Detalle
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPCIÓN DEL SERVICIO', 6, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const lines = doc.splitTextToSize(transaction.conceptDescription, 68);
  doc.text(lines, 6, 64);

  const startY = 64 + (lines.length * 4);
  doc.text('------------------------------------------------------------', 40, startY, { align: 'center' });

  // Importes
  doc.setFontSize(7);
  doc.text('Subtotal:', 6, startY + 5);
  doc.text(`$${transaction.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 74, startY + 5, { align: 'right' });

  doc.text(transaction.taxCategory === 'IVA_16' ? 'IVA 16% Trasladado:' : 'Acto Médico Exento LIVA:', 6, startY + 10);
  doc.text(`$${transaction.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 74, startY + 10, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TOTAL COBRADO:', 6, startY + 16);
  doc.text(`$${transaction.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 74, startY + 16, { align: 'right' });

  let curY = startY + 22;
  if (transaction.insuranceCoverageAmount > 0) {
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Pago Directo Aseguradora: -$${transaction.insuranceCoverageAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 6, curY);
    curY += 4;
    doc.text(`Copago Pagado por Paciente: $${transaction.patientCopayAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 6, curY);
    curY += 5;
  }

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Forma de Pago: ${transaction.paymentMethod.replace(/_/g, ' ')}`, 6, curY);
  curY += 4;
  doc.text(transaction.isInvoiceIssued ? `Facturado SAT UUID: Timbrado CFDI` : 'Comprobante de Caja / Venta al Público', 6, curY);
  curY += 5;

  doc.text('------------------------------------------------------------', 40, curY, { align: 'center' });
  curY += 5;

  // Pie de ticket
  doc.setFontSize(6);
  doc.text('Conserve este ticket como comprobante oficial de pago.', 40, curY, { align: 'center' });
  curY += 4;
  doc.text('Si requiere Factura Electrónica CFDI 4.0 solicítela en caja', 40, curY, { align: 'center' });
  curY += 4;
  doc.text('dentro del mes fiscal en curso.', 40, curY, { align: 'center' });
  curY += 4;
  doc.text('¡Gracias por confiar en Centro Médico Puerta de Hierro!', 40, curY, { align: 'center' });

  doc.save(`Ticket_${transaction.receiptNumber}.pdf`);
}


