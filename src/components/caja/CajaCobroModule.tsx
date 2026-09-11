// ==============================================================================
// MÓDULO DE CAJA, FACTURACIÓN CFDI 4.0, IVA Y CONVENIOS CON ASEGURADORAS
// Hospital Puerta de Hierro (Tepic) - Alta Especialidad
// Cumplimiento: SAT Anexo 20 CFDI 4.0 / Ley del IVA (Art. 15 Fracc. XIV) / NOM-024
// ==============================================================================

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Plus, 
  CreditCard, 
  FileSpreadsheet, 
  ShieldCheck, 
  Receipt, 
  TrendingUp,
  Clock,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  Building,
  FileCode,
  Search,
  Zap,
  Sparkles,
  Percent,
  Layers,
  Check,
  Shield,
  FileSignature,
  ChevronDown,
  Printer,
  Coins,
  Scale,
  Calculator,
  FileCheck2,
  Banknote
} from 'lucide-react';
import { 
  CashTransaction, 
  Patient, 
  TaxCategory, 
  InvoiceData, 
  InsuranceAgreementData, 
  UserProfile,
  CashAuditRecord,
  ShiftClosingRecord,
  CashDenominations,
  ShiftType
} from '../../types/hospital';
import { 
  exportCashReportToExcel, 
  generateInvoicePDF, 
  generateInvoiceXML, 
  generateCashReceiptPDF,
  generateInsuranceSettlementPDF,
  generateCashAuditPDF,
  generateShiftClosingPDF,
  generateThermalTicketPDF
} from '../../lib/exportEngine';
import { logAuditAction } from '../../lib/supabaseClient';

// Catálogo Oficial Institucional de Aseguradoras con Convenio de Pago Directo
export const HOSPITAL_INSURANCE_AGREEMENTS = [
  {
    id: 'gnp',
    name: 'GNP Seguros',
    rfc: 'GNP9211244Z0',
    businessName: 'GRUPO NACIONAL PROVINCIAL S.A.B.',
    taxRegime: '601 - General de Ley Personas Morales',
    postalCode: '04200',
    creditDays: 30,
    phone: '(800) 400-9000',
    badgeColor: 'from-amber-600 to-yellow-600',
  },
  {
    id: 'axa',
    name: 'AXA Seguros',
    rfc: 'AXA9704288A9',
    businessName: 'AXA SEGUROS S.A. DE C.V.',
    taxRegime: '601 - General de Ley Personas Morales',
    postalCode: '03100',
    creditDays: 30,
    phone: '(800) 900-1292',
    badgeColor: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'metlife',
    name: 'MetLife México',
    rfc: 'MMX010918V56',
    businessName: 'METLIFE MÉXICO S.A. DE C.V.',
    taxRegime: '601 - General de Ley Personas Morales',
    postalCode: '11520',
    creditDays: 45,
    phone: '(800) 006-3854',
    badgeColor: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'mnyl',
    name: 'Seguros Monterrey New York Life',
    rfc: 'SMN9304191Q1',
    businessName: 'SEGUROS MONTERREY NEW YORK LIFE S.A. DE C.V.',
    taxRegime: '601 - General de Ley Personas Morales',
    postalCode: '06600',
    creditDays: 30,
    phone: '(800) 505-4000',
    badgeColor: 'from-indigo-600 to-blue-600',
  },
  {
    id: 'mapfre',
    name: 'Mapfre México',
    rfc: 'MME931215SM2',
    businessName: 'MAPFRE MÉXICO S.A.',
    taxRegime: '601 - General de Ley Personas Morales',
    postalCode: '06500',
    creditDays: 30,
    phone: '(800) 062-7373',
    badgeColor: 'from-red-600 to-rose-600',
  },
  {
    id: 'bupa',
    name: 'Bupa México',
    rfc: 'BME030514F67',
    businessName: 'BUPA MÉXICO COMPAÑÍA DE SEGUROS S.A. DE C.V.',
    taxRegime: '601 - General de Ley Personas Morales',
    postalCode: '11000',
    creditDays: 15,
    phone: '(800) 287-2468',
    badgeColor: 'from-sky-600 to-blue-700',
  }
];

interface CajaCobroModuleProps {
  transactions: CashTransaction[];
  patients: Patient[];
  currentUser?: UserProfile;
  onAddTransaction: (transaction: CashTransaction) => void;
  onUpdateTransaction?: (transaction: CashTransaction) => void;
}

export const CajaCobroModule: React.FC<CajaCobroModuleProps> = ({
  transactions,
  patients,
  currentUser,
  onAddTransaction,
  onUpdateTransaction,
}) => {
  const [activeFilterTab, setActiveFilterTab] = useState<'TODOS' | 'CONVENIOS' | 'FACTURADOS' | 'PENDIENTES_FACTURA' | 'IVA_16' | 'EXENTO'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState('MATUTINO');

  // Modal para Nuevo Cobro y Factura
  const [showModal, setShowModal] = useState(false);

  // Modal para Timbrado Express de Cobro Existente
  const [stampModalOpen, setStampModalOpen] = useState(false);
  const [txToStamp, setTxToStamp] = useState<CashTransaction | null>(null);

  // Estados del Formulario de Nuevo Cobro
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [serviceCategory, setServiceCategory] = useState<CashTransaction['serviceCategory']>('HOSPITALIZACION');
  const [conceptDescription, setConceptDescription] = useState('');
  
  // Desglose de Precios e IVA
  const [subtotalInput, setSubtotalInput] = useState<number>(15000.0);
  const [taxCategory, setTaxCategory] = useState<TaxCategory>('EXENTO_MEDICO');
  const [coverageAmount, setCoverageAmount] = useState<number>(12000.0);
  const [paymentMethod, setPaymentMethod] = useState<CashTransaction['paymentMethod']>('ASEGURADORA_CONVENIO');

  // Convenio con Aseguradora
  const [selectedInsuranceCompany, setSelectedInsuranceCompany] = useState<string>('GNP Seguros');
  const [insurancePolicyNo, setInsurancePolicyNo] = useState<string>('GNP-GMM-0091823');
  const [insuranceClaimNo, setInsuranceClaimNo] = useState<string>('SIN-2026-44120');
  const [insuranceAuthCode, setInsuranceAuthCode] = useState<string>('AUT-GNP-2026-9812');
  const [insuranceInvoiceTarget, setInsuranceInvoiceTarget] = useState<'ASEGURADORA' | 'PACIENTE_COPAGO' | 'AMBOS'>('ASEGURADORA');

  // Facturación Electrónica CFDI 4.0
  const [issueInvoiceNow, setIssueInvoiceNow] = useState<boolean>(true);
  const [rfcRecipient, setRfcRecipient] = useState<string>('GNP9211244Z0');
  const [businessName, setBusinessName] = useState<string>('GRUPO NACIONAL PROVINCIAL S.A.B.');
  const [taxRegime, setTaxRegime] = useState<string>('601 - General de Ley Personas Morales');
  const [postalCode, setPostalCode] = useState<string>('04200');
  const [cfdiUsage, setCfdiUsage] = useState<string>('G03 - Gastos en general');
  const [paymentMethodSat, setPaymentMethodSat] = useState<string>('PPD - Pago en parcialidades o diferido');
  const [paymentFormSat, setPaymentFormSat] = useState<string>('99 - Por definir');

  // Manejar selección de Paciente
  const handleSelectPatient = (selectedId: string) => {
    setPatientId(selectedId);
    const pat = patients.find(p => p.id === selectedId);
    if (pat) {
      if (pat.insuranceCompany && pat.insuranceCompany !== 'Particular') {
        setPaymentMethod('ASEGURADORA_CONVENIO');
        const matched = HOSPITAL_INSURANCE_AGREEMENTS.find(a => 
          pat.insuranceCompany.toLowerCase().includes(a.name.toLowerCase().split(' ')[0])
        );
        if (matched) {
          applyInsuranceAgreementData(matched.name);
        } else {
          applyInsuranceAgreementData('GNP Seguros');
        }
        if (pat.insurancePolicyNumber) {
          setInsurancePolicyNo(pat.insurancePolicyNumber);
        }
      } else {
        setPaymentMethod('TARJETA_CREDITO');
        setRfcRecipient(pat.rfc || 'XAXX010101000');
        setBusinessName(`${pat.firstName} ${pat.lastName}`.toUpperCase());
        setTaxRegime('605 - Sueldos y Salarios e Ingresos Asimilados');
        setPostalCode('63000');
        setCfdiUsage('D01 - Honorarios médicos, dentales y gastos hospitalarios');
        setPaymentMethodSat('PUE - Pago en una sola exhibición');
        setPaymentFormSat('04 - Tarjeta de crédito');
      }
    }
  };

  // Aplicar datos del convenio de la aseguradora al formulario fiscal
  const applyInsuranceAgreementData = (companyName: string) => {
    setSelectedInsuranceCompany(companyName);
    const agr = HOSPITAL_INSURANCE_AGREEMENTS.find(a => a.name === companyName);
    if (agr) {
      if (insuranceInvoiceTarget === 'ASEGURADORA' || insuranceInvoiceTarget === 'AMBOS') {
        setRfcRecipient(agr.rfc);
        setBusinessName(agr.businessName);
        setTaxRegime(agr.taxRegime);
        setPostalCode(agr.postalCode);
        setCfdiUsage('G03 - Gastos en general');
        setPaymentMethodSat('PPD - Pago en parcialidades o diferido');
        setPaymentFormSat('99 - Por definir');
      } else {
        const pat = patients.find(p => p.id === patientId);
        setRfcRecipient(pat?.rfc || 'XAXX010101000');
        setBusinessName(pat ? `${pat.firstName} ${pat.lastName}`.toUpperCase() : 'PACIENTE');
        setTaxRegime('605 - Sueldos y Salarios e Ingresos Asimilados');
        setPostalCode('63000');
        setCfdiUsage('D01 - Honorarios médicos, dentales y gastos hospitalarios');
        setPaymentMethodSat('PUE - Pago en una sola exhibición');
        setPaymentFormSat('04 - Tarjeta de crédito');
      }
    }
  };

  // Alternar destinatario de la factura fiscal
  const handleToggleInvoiceTarget = (target: 'ASEGURADORA' | 'PACIENTE_COPAGO' | 'AMBOS') => {
    setInsuranceInvoiceTarget(target);
    const pat = patients.find(p => p.id === patientId);
    const agr = HOSPITAL_INSURANCE_AGREEMENTS.find(a => a.name === selectedInsuranceCompany);

    if (target === 'ASEGURADORA' && agr) {
      setRfcRecipient(agr.rfc);
      setBusinessName(agr.businessName);
      setTaxRegime(agr.taxRegime);
      setPostalCode(agr.postalCode);
      setCfdiUsage('G03 - Gastos en general');
      setPaymentMethodSat('PPD - Pago en parcialidades o diferido');
      setPaymentFormSat('99 - Por definir');
    } else if (target === 'PACIENTE_COPAGO' && pat) {
      setRfcRecipient(pat.rfc || 'XAXX010101000');
      setBusinessName(`${pat.firstName} ${pat.lastName}`.toUpperCase());
      setTaxRegime('605 - Sueldos y Salarios e Ingresos Asimilados');
      setPostalCode('63000');
      setCfdiUsage('D01 - Honorarios médicos, dentales y gastos hospitalarios');
      setPaymentMethodSat('PUE - Pago en una sola exhibición');
      setPaymentFormSat('04 - Tarjeta de crédito');
    }
  };

  // Cálculo en vivo de IVA y Totales
  const taxRate = taxCategory === 'IVA_16' ? 0.16 : 0.0;
  const taxAmount = Math.round((subtotalInput * taxRate) * 100) / 100;
  const totalAmount = Math.round((subtotalInput + taxAmount) * 100) / 100;
  const copayAmount = Math.max(Math.round((totalAmount - coverageAmount) * 100) / 100, 0);

  // Registrar Nuevo Cobro y Factura
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === patientId) || patients[0];
    if (!patient) return;

    const receiptNo = 'CAJA-2026-' + Math.floor(1000 + Math.random() * 9000);
    const invoiceFolio = 'CFDI-2026-' + Math.floor(1000 + Math.random() * 9000);
    const randomUuid = '4E4766EB-' + Math.floor(1000 + Math.random() * 9000) + '-427E-8E8D-' + Date.now().toString(16).toUpperCase().padStart(12, '0');

    let insuranceAgreement: InsuranceAgreementData | undefined = undefined;
    if (paymentMethod === 'ASEGURADORA_CONVENIO') {
      const agr = HOSPITAL_INSURANCE_AGREEMENTS.find(a => a.name === selectedInsuranceCompany);
      insuranceAgreement = {
        companyName: selectedInsuranceCompany,
        companyRfc: agr?.rfc || 'GNP9211244Z0',
        companyBusinessName: agr?.businessName || selectedInsuranceCompany,
        policyNumber: insurancePolicyNo || 'POL-GMM-001',
        claimNumber: insuranceClaimNo || 'SIN-2026-001',
        authorizationCode: insuranceAuthCode || 'AUT-HPDH-2026-01',
        creditDaysTerms: agr?.creditDays || 30,
        invoiceTarget: insuranceInvoiceTarget,
      };
    }

    let invoiceData: InvoiceData | undefined = undefined;
    if (issueInvoiceNow) {
      invoiceData = {
        invoiceFolio,
        uuidSat: randomUuid,
        rfcRecipient: rfcRecipient.trim().toUpperCase(),
        businessName: (businessName.trim() || `${patient.firstName} ${patient.lastName}`).toUpperCase(),
        taxRegime,
        postalCode: postalCode.trim() || '63000',
        cfdiUsage,
        paymentMethodSat,
        paymentFormSat,
        satCertificateNumber: '00001000000504465028',
        emisorCertificateNumber: '00001000000506148821',
        satDigitalStamp: 'T3xY9kL2m...SAT_STAMP_HPDH_VERIFIED',
        cfdiDigitalStamp: 'dGhpcyBpcyBhIHZhbGlkIGNmZGkgc3RhbXAgb2YgcHVlcnRhIGRlIGhpZXJybyB0ZXBpYw==',
        originalStringSat: `||1.1|${randomUuid}|${new Date().toISOString()}|SAT970701NN3|${subtotalInput.toFixed(2)}|${taxAmount.toFixed(2)}||`,
        timbradoDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        cfdiStatus: 'TIMBRADA_SAT'
      };
    }

    const newTx: CashTransaction = {
      id: 'caj-' + Date.now(),
      receiptNumber: receiptNo,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      serviceCategory,
      conceptDescription: conceptDescription.trim() || 'Servicio y Atención Hospitalaria Integral',
      subtotal: subtotalInput,
      taxCategory,
      taxRate,
      taxAmount,
      totalAmount,
      insuranceCoverageAmount: coverageAmount,
      patientCopayAmount: copayAmount,
      paymentMethod,
      insuranceAgreement,
      cashierName: currentUser?.fullName || 'Lic. Gerardo Salcedo',
      shift: selectedShift as any,
      status: issueInvoiceNow ? 'FACTURADO' : 'PAGADO',
      isInvoiceIssued: issueInvoiceNow,
      invoiceData,
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTx);

    logAuditAction({
      userName: currentUser?.fullName || 'Lic. Gerardo Salcedo',
      userRole: 'CAJERO_RECEPCION',
      actionType: issueInvoiceNow ? 'FACTURA_CFDI_40_TIMBRADA' : 'COBRO_HOSPITALARIO_EMITIDO',
      resourceAffected: `Recibo ${newTx.receiptNumber} ${issueInvoiceNow ? `| Factura ${invoiceFolio}` : ''}`,
      details: `${conceptDescription} para ${patient.patientNumber}. Subtotal: $${subtotalInput} MXN | IVA (${taxCategory}): $${taxAmount} MXN | Convenio: ${selectedInsuranceCompany}. Total: $${totalAmount} MXN.`,
    });

    setShowModal(false);
    setConceptDescription('');
  };

  // Abrir Modal de Timbrado Express para Transacción Existente
  const handleOpenStampModal = (tx: CashTransaction) => {
    setTxToStamp(tx);
    const pat = patients.find(p => p.id === tx.patientId);
    if (tx.paymentMethod === 'ASEGURADORA_CONVENIO' && tx.insuranceAgreement) {
      setRfcRecipient(tx.insuranceAgreement.companyRfc);
      setBusinessName(tx.insuranceAgreement.companyBusinessName);
      setTaxRegime('601 - General de Ley Personas Morales');
      setPostalCode('04200');
      setCfdiUsage('G03 - Gastos en general');
      setPaymentMethodSat('PPD - Pago en parcialidades o diferido');
      setPaymentFormSat('99 - Por definir');
    } else {
      setRfcRecipient(pat?.rfc || 'XAXX010101000');
      setBusinessName(pat ? `${pat.firstName} ${pat.lastName}`.toUpperCase() : tx.patientName.toUpperCase());
      setPostalCode('63000');
      setTaxRegime('605 - Sueldos y Salarios e Ingresos Asimilados');
      setCfdiUsage('D01 - Honorarios médicos, dentales y gastos hospitalarios');
      setPaymentMethodSat('PUE - Pago en una sola exhibición');
      setPaymentFormSat(tx.paymentMethod === 'TARJETA_CREDITO' ? '04 - Tarjeta de crédito' : tx.paymentMethod === 'TARJETA_DEBITO' ? '28 - Tarjeta de débito' : tx.paymentMethod === 'EFECTIVO' ? '01 - Efectivo' : '03 - Transferencia electrónica');
    }
    setStampModalOpen(true);
  };

  // Confirmar Timbrado Express
  const handleConfirmStamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txToStamp) return;

    const invoiceFolio = 'CFDI-2026-' + Math.floor(1000 + Math.random() * 9000);
    const randomUuid = '8A9B1C2D-' + Math.floor(1000 + Math.random() * 9000) + '-46E1-9A7B-' + Date.now().toString(16).toUpperCase().padStart(12, '0');

    const updatedTx: CashTransaction = {
      ...txToStamp,
      status: 'FACTURADO',
      isInvoiceIssued: true,
      invoiceData: {
        invoiceFolio,
        uuidSat: randomUuid,
        rfcRecipient: rfcRecipient.trim().toUpperCase(),
        businessName: businessName.trim().toUpperCase(),
        taxRegime,
        postalCode: postalCode.trim() || '63000',
        cfdiUsage,
        paymentMethodSat,
        paymentFormSat,
        satCertificateNumber: '00001000000504465028',
        emisorCertificateNumber: '00001000000506148821',
        satDigitalStamp: 'P7qM4xL...STAMP_SAT_DIGITAL_EXPRESS',
        cfdiDigitalStamp: 'c2VsbG9fZGlnaXRhbF9ob3NwaXRhbF9wdWVydGFfZGVfaGllcnJv',
        originalStringSat: `||1.1|${randomUuid}|${new Date().toISOString()}|SAT970701NN3|${txToStamp.subtotal.toFixed(2)}|${txToStamp.taxAmount.toFixed(2)}||`,
        timbradoDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        cfdiStatus: 'TIMBRADA_SAT'
      }
    };

    if (onUpdateTransaction) {
      onUpdateTransaction(updatedTx);
    }

    logAuditAction({
      userName: currentUser?.fullName || 'Lic. Gerardo Salcedo',
      userRole: 'CAJERO_RECEPCION',
      actionType: 'FACTURA_CFDI_40_TIMBRADA',
      resourceAffected: `Factura ${invoiceFolio} / UUID ${randomUuid}`,
      details: `Factura CFDI 4.0 timbrada exitosamente para ${txToStamp.patientName} (${rfcRecipient}). Total: $${txToStamp.totalAmount} MXN.`,
    });

    setStampModalOpen(false);
    setTxToStamp(null);
  };

  // Estados para Modales de Ticket, Arqueo y Corte de Turno
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [ticketTx, setTicketTx] = useState<CashTransaction | null>(null);

  const [showCashAuditModal, setShowCashAuditModal] = useState<boolean>(false);
  const [auditFloat, setAuditFloat] = useState<number>(5000);
  const [denominations, setDenominations] = useState<CashDenominations>({
    b1000: 3,
    b500: 6,
    b200: 10,
    b100: 15,
    b50: 20,
    b20: 25,
    m20: 10,
    m10: 20,
    m5: 30,
    m2: 40,
    m1: 50,
    m050: 30,
  });
  const [auditAuditorName, setAuditAuditorName] = useState<string>('Lic. Mariana Velasco / Contraloría');
  const [auditNotes, setAuditNotes] = useState<string>('Conteo físico realizado en presencia del cajero en turno. Sin anomalías en gaveta de seguridad.');

  const [showShiftClosingModal, setShowShiftClosingModal] = useState<boolean>(false);
  const [vaultDepositAmount, setVaultDepositAmount] = useState<number>(8500);
  const [closingSupervisorName, setClosingSupervisorName] = useState<string>(currentUser?.fullName || 'Ing. Alfonso Uribe');
  const [closingNotes, setClosingNotes] = useState<string>('Corte de turno ordinario. Terminales bancarias TPV conciliadas y comprobantes sellados.');

  // Totales dinámicos de Arqueo
  const totalBilletes = 
    (denominations.b1000 * 1000) + 
    (denominations.b500 * 500) + 
    (denominations.b200 * 200) + 
    (denominations.b100 * 100) + 
    (denominations.b50 * 50) + 
    (denominations.b20 * 20);

  const totalMonedas = 
    (denominations.m20 * 20) + 
    (denominations.m10 * 10) + 
    (denominations.m5 * 5) + 
    (denominations.m2 * 2) + 
    (denominations.m1 * 1) + 
    (denominations.m050 * 0.50);

  const physicalCashCounted = totalBilletes + totalMonedas;

  // Transacciones del turno seleccionado
  const shiftTransactions = useMemo(() => {
    return transactions.filter(t => t.shift === selectedShift);
  }, [transactions, selectedShift]);

  const shiftCashTotal = useMemo(() => {
    return shiftTransactions
      .filter(t => t.paymentMethod === 'EFECTIVO')
      .reduce((sum, t) => sum + (t.patientCopayAmount || t.totalAmount), 0);
  }, [shiftTransactions]);

  const systemCashExpected = auditFloat + shiftCashTotal;
  const auditDifference = Math.round((physicalCashCounted - systemCashExpected) * 100) / 100;
  const auditStatus: 'CUADRADO' | 'SOBRANTE' | 'FALTANTE' = 
    auditDifference === 0 ? 'CUADRADO' : auditDifference > 0 ? 'SOBRANTE' : 'FALTANTE';

  // Cálculos de Corte de Turno
  const shiftDebitTotal = shiftTransactions.filter(t => t.paymentMethod === 'TARJETA_DEBITO').reduce((s, t) => s + (t.patientCopayAmount || t.totalAmount), 0);
  const shiftCreditTotal = shiftTransactions.filter(t => t.paymentMethod === 'TARJETA_CREDITO').reduce((s, t) => s + (t.patientCopayAmount || t.totalAmount), 0);
  const shiftSpeiTotal = shiftTransactions.filter(t => t.paymentMethod === 'TRANSFERENCIA_SPEI').reduce((s, t) => s + (t.patientCopayAmount || t.totalAmount), 0);
  const shiftInsuranceTotal = shiftTransactions.filter(t => t.paymentMethod === 'ASEGURADORA_CONVENIO').reduce((s, t) => s + t.insuranceCoverageAmount, 0);
  const shiftTotalIncome = shiftTransactions.reduce((s, t) => s + t.totalAmount, 0);
  const shiftTaxableTotal = shiftTransactions.filter(t => t.taxCategory === 'IVA_16').reduce((s, t) => s + t.subtotal, 0);
  const shiftTaxAmountTotal = shiftTransactions.filter(t => t.taxCategory === 'IVA_16').reduce((s, t) => s + (t.taxAmount || 0), 0);
  const shiftExemptTotal = shiftTransactions.filter(t => t.taxCategory !== 'IVA_16').reduce((s, t) => s + (t.subtotal || t.totalAmount), 0);
  const shiftInvoicedTotal = shiftTransactions.filter(t => t.isInvoiceIssued).reduce((s, t) => s + t.totalAmount, 0);
  const shiftNonInvoicedTotal = shiftTransactions.filter(t => !t.isInvoiceIssued).reduce((s, t) => s + t.totalAmount, 0);
  const remainingFloatAfterDeposit = Math.max(0, physicalCashCounted - vaultDepositAmount);

  // Guardar y Descargar Acta de Arqueo
  const handleSaveCashAudit = () => {
    const record: CashAuditRecord = {
      id: 'ARQ-' + Date.now(),
      auditFolio: 'ARQ-2026-' + Math.floor(1000 + Math.random() * 9000),
      auditDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      shift: selectedShift as ShiftType,
      cashierName: currentUser?.fullName || 'Lic. Gerardo Salcedo',
      auditorName: auditAuditorName,
      initialCashFloat: auditFloat,
      systemCashExpected,
      physicalCashCounted,
      difference: auditDifference,
      differenceStatus: auditStatus,
      denominations,
      notes: auditNotes,
      status: auditDifference === 0 ? 'APROBADO' : 'CON_OBSERVACIONES',
      createdAt: new Date().toISOString()
    };

    generateCashAuditPDF(record);
    logAuditAction({
      userName: currentUser?.fullName || 'Lic. Gerardo Salcedo',
      userRole: 'CAJERO_RECEPCION',
      actionType: 'ARQUEO_DE_CAJA_REALIZADO',
      resourceAffected: record.auditFolio,
      details: `Arqueo en turno ${selectedShift}. Físico: $${physicalCashCounted} MXN | Sistema: $${systemCashExpected} MXN | Diferencia: $${auditDifference} MXN (${auditStatus}).`,
    });
    setShowCashAuditModal(false);
  };

  // Guardar y Descargar Corte de Caja Oficial
  const handleSaveShiftClosing = () => {
    const record: ShiftClosingRecord = {
      id: 'CORTE-' + Date.now(),
      closingFolio: 'CORTE-2026-' + Math.floor(1000 + Math.random() * 9000),
      shift: selectedShift as ShiftType,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      cashierName: currentUser?.fullName || 'Lic. Gerardo Salcedo',
      supervisorName: closingSupervisorName,
      totalTransactionsCount: shiftTransactions.length,
      totalIncome: shiftTotalIncome,
      cashTotal: shiftCashTotal,
      debitCardTotal: shiftDebitTotal,
      creditCardTotal: shiftCreditTotal,
      speiTotal: shiftSpeiTotal,
      insuranceAgreementTotal: shiftInsuranceTotal,
      subtotalTaxable: shiftTaxableTotal,
      taxIva16Total: shiftTaxAmountTotal,
      subtotalExempt: shiftExemptTotal,
      invoicedCfdiTotal: shiftInvoicedTotal,
      nonInvoicedTotal: shiftNonInvoicedTotal,
      cashDepositedToVault: vaultDepositAmount,
      cashRemainingForNextShift: remainingFloatAfterDeposit,
      status: 'CERRADO_CONCILIADO',
      notes: closingNotes,
      createdAt: new Date().toISOString()
    };

    generateShiftClosingPDF(record);
    logAuditAction({
      userName: currentUser?.fullName || 'Lic. Gerardo Salcedo',
      userRole: 'CAJERO_RECEPCION',
      actionType: 'CORTE_DE_CAJA_TURNO_CERRADO',
      resourceAffected: record.closingFolio,
      details: `Corte de turno ${selectedShift} cerrado. Total: $${shiftTotalIncome} MXN en ${shiftTransactions.length} operaciones. Bóveda: $${vaultDepositAmount} MXN.`,
    });
    setShowShiftClosingModal(false);
  };


  // Cálculos Financieros Generales
  const totalCollected = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalSubtotal = transactions.reduce((sum, t) => sum + t.subtotal, 0);
  const totalTaxAmount = transactions.reduce((sum, t) => sum + (t.taxAmount || 0), 0);
  const totalExempt = transactions
    .filter(t => t.taxCategory === 'EXENTO_MEDICO' || t.taxRate === 0 || (!t.taxCategory && !t.taxAmount))
    .reduce((sum, t) => sum + (t.subtotal || t.totalAmount || 0), 0);
  const totalInvoicedCount = transactions.filter(t => t.isInvoiceIssued).length;
  const totalInvoicedAmount = transactions.filter(t => t.isInvoiceIssued).reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalInsurance = transactions.reduce((sum, t) => sum + t.insuranceCoverageAmount, 0);
  const totalInsuranceCases = transactions.filter(t => t.insuranceAgreement || t.paymentMethod === 'ASEGURADORA_CONVENIO').length;
  const totalCopay = transactions.reduce((sum, t) => sum + t.patientCopayAmount, 0);

  // Filtrado de Transacciones
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Filtro por pestaña
      if (activeFilterTab === 'CONVENIOS' && tx.paymentMethod !== 'ASEGURADORA_CONVENIO' && !tx.insuranceAgreement) return false;
      if (activeFilterTab === 'FACTURADOS' && !tx.isInvoiceIssued) return false;
      if (activeFilterTab === 'PENDIENTES_FACTURA' && tx.isInvoiceIssued) return false;
      if (activeFilterTab === 'IVA_16' && tx.taxCategory !== 'IVA_16') return false;
      if (activeFilterTab === 'EXENTO' && tx.taxCategory === 'IVA_16') return false;

      // Filtro por búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPatient = tx.patientName.toLowerCase().includes(q);
        const matchesReceipt = tx.receiptNumber.toLowerCase().includes(q);
        const matchesConcept = tx.conceptDescription.toLowerCase().includes(q);
        const matchesFolio = tx.invoiceData?.invoiceFolio?.toLowerCase().includes(q);
        const matchesRfc = tx.invoiceData?.rfcRecipient?.toLowerCase().includes(q);
        const matchesUuid = tx.invoiceData?.uuidSat?.toLowerCase().includes(q);
        const matchesIns = tx.insuranceAgreement?.companyName.toLowerCase().includes(q) || tx.insuranceAgreement?.authorizationCode.toLowerCase().includes(q);
        return matchesPatient || matchesReceipt || matchesConcept || matchesFolio || matchesRfc || matchesUuid || Boolean(matchesIns);
      }

      return true;
    });
  }, [transactions, activeFilterTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Encabezado Oficial con Alto Contraste */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="neo-badge neo-badge-green">
              <span className="neo-badge-dot" style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
              CAJA, CONVENIOS ASEGURADORAS (GMM), IVA Y CFDI 4.0
            </span>
            <span className="text-xs text-emerald-200 font-bold font-mono tracking-wider drop-shadow-sm">
              GNP • AXA • METLIFE • MONTERREY NYL • MAPFRE • BUPA
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
            Administración de Cobros, Convenios y Facturación Directa
          </h2>
          <p className="text-slate-100 text-sm mt-1 font-medium leading-relaxed drop-shadow-sm">
            Gestión de pagos directos con aseguradoras, cartas de autorización, cálculo de IVA (16% vs Exento LIVA), facturación fiscal a crédito PPD o copago paciente.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Selector de Turno Táctil */}
          <div className="neo-shift-pill">
            <div className="neo-shift-icon-box">
              <Clock size={14} />
            </div>
            <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wider">TURNO:</span>
            <div className="neo-shift-select-container">
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="neo-shift-select"
                title="Seleccionar Turno de Operación en Caja"
              >
                <option value="MATUTINO">MATUTINO (07-15h)</option>
                <option value="VESPERTINO">VESPERTINO (14-21h)</option>
                <option value="NOCTURNO_A">NOCTURNO A</option>
                <option value="NOCTURNO_B">NOCTURNO B</option>
              </select>
              <ChevronDown size={13} className="neo-shift-chevron" />
            </div>
          </div>

          {/* Botón Facturar CFDI 4.0 Directo */}
          <button 
            onClick={() => {
              const targetTx = transactions.find(t => !t.isInvoiceIssued) || transactions[0];
              if (targetTx) {
                handleOpenStampModal(targetTx);
              }
            }}
            className="btn-neo-factura-head"
            title="Emitir y timbrar Factura SAT CFDI 4.0 (Anexo 20)"
          >
            <FileText size={15} />
            <span>Facturar CFDI 4.0</span>
          </button>

          {/* Botón Ticket de Pago Térmico */}
          <button 
            onClick={() => {
              const targetTx = transactions[0];
              if (targetTx) {
                setTicketTx(targetTx);
                setShowTicketModal(true);
              }
            }}
            className="btn-neo-ticket-head"
            title="Emitir e imprimir Ticket Térmico Oficial de Caja (80mm)"
          >
            <Printer size={15} />
            <span>Ticket de Pago</span>
          </button>

          {/* Botón Arqueo de Dinero / Conteo Físico */}
          <button 
            onClick={() => setShowCashAuditModal(true)}
            className="btn-neo-audit-head"
            title="Conteo interactivo de billetes/monedas y conciliación de caja en tiempo real"
          >
            <Coins size={15} />
            <span>Arqueo de Caja</span>
          </button>

          {/* Botón Corte de Turno */}
          <button 
            onClick={() => setShowShiftClosingModal(true)}
            className="btn-neo-corte-head"
            title="Balance financiero por turno, retiro a bóveda y acta oficial"
          >
            <Scale size={15} />
            <span>Corte de Turno</span>
          </button>

          {/* Botón Exportar Corte Fiscal Excel (.xlsx) */}
          <button 
            onClick={() => exportCashReportToExcel(transactions, selectedShift)}
            className="btn-neo-excel"
            title="Descargar libro de cálculo oficial de corte de caja con desglose de convenios, IVA y UUID SAT"
          >
            <FileSpreadsheet size={16} />
            <span>Exportar Corte Fiscal</span>
            <span className="badge-xlsx">.XLSX</span>
          </button>
          
          <button 
            onClick={() => {
              if (patients.length > 0) {
                handleSelectPatient(patients[0].id);
              }
              setShowModal(true);
            }}
            className="btn-neo btn-neo-success text-xs font-bold"
          >
            <Plus size={16} />
            Nuevo Cobro / Convenio Seguro
          </button>
        </div>
      </div>

      {/* 2. Resumen Financiero Táctil de Ingresos, Impuestos y Convenios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Cobrado */}
        <div className="neo-glass-panel p-4 flex flex-col justify-between border-t-2 border-t-emerald-400">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Facturación Total</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            ${totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10.5px] text-emerald-400 font-semibold mt-1">✓ Pagos conciliados</span>
        </div>

        {/* Cobertura Aseguradoras con Convenio */}
        <div className="neo-glass-panel p-4 flex flex-col justify-between border-t-2 border-t-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Convenios GMM</span>
            <Building size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2 font-mono">
            ${totalInsurance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10.5px] text-slate-300 font-mono mt-1">{totalInsuranceCases} casos en pago directo</span>
        </div>

        {/* IVA Trasladado 16% */}
        <div className="neo-glass-panel p-4 flex flex-col justify-between border-t-2 border-t-cyan-400">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">IVA 16% Trasladado</span>
            <Percent size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-2 font-mono">
            ${totalTaxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10.5px] text-cyan-200 font-mono mt-1">Impuesto a declarar al SAT</span>
        </div>

        {/* Actos Médicos Exentos (LIVA) */}
        <div className="neo-glass-panel p-4 flex flex-col justify-between border-t-2 border-t-blue-400">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Subtotal Exento</span>
            <ShieldCheck size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-200 mt-2 font-mono">
            ${totalExempt.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10.5px] text-slate-300 font-semibold mt-1">Art. 15 Fracc. XIV LIVA</span>
        </div>

        {/* CFDI 4.0 Timbrados */}
        <div className="neo-glass-panel p-4 flex flex-col justify-between border-t-2 border-t-indigo-400">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">CFDI 4.0 Timbrados</span>
            <FileText size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-200 mt-2 font-mono">
            {totalInvoicedCount} <span className="text-xs font-normal text-slate-400">({Math.round((totalInvoicedCount / (transactions.length || 1)) * 100)}%)</span>
          </div>
          <span className="text-[10.5px] text-slate-300 font-mono mt-1">${totalInvoicedAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda Interactiva con Diseño Neo-Tactile */}
      <div className="neo-filter-bar">
        {/* Pestañas de Filtro con Diseño y Colores Especializados */}
        <div className="neo-filter-tabs-wrapper">
          {[
            {
              id: 'TODOS',
              label: 'Todos los Movimientos',
              count: transactions.length,
              icon: Layers,
              btnClass: 'neo-filter-btn-all',
            },
            {
              id: 'CONVENIOS',
              label: 'Convenios Aseguradoras',
              count: totalInsuranceCases,
              icon: Shield,
              btnClass: 'neo-filter-btn-insurance',
            },
            {
              id: 'FACTURADOS',
              label: 'Facturados (CFDI 4.0)',
              count: totalInvoicedCount,
              icon: CheckCircle2,
              btnClass: 'neo-filter-btn-invoiced',
            },
            {
              id: 'PENDIENTES_FACTURA',
              label: 'Pendientes Facturar',
              count: transactions.filter(t => !t.isInvoiceIssued).length,
              icon: Clock,
              btnClass: 'neo-filter-btn-pending',
            },
            {
              id: 'IVA_16',
              label: 'Con IVA 16%',
              count: transactions.filter(t => t.taxCategory === 'IVA_16' || t.taxRate === 0.16).length,
              icon: Percent,
              btnClass: 'neo-filter-btn-iva',
            },
            {
              id: 'EXENTO',
              label: 'Exentos Médico',
              count: transactions.filter(t => t.taxCategory === 'EXENTO_MEDICO' || t.taxRate === 0 || (!t.taxCategory && !t.taxAmount)).length,
              icon: ShieldCheck,
              btnClass: 'neo-filter-btn-exempt',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id as any)}
                className={`neo-filter-btn ${tab.btnClass} ${isActive ? 'active' : ''}`}
              >
                <Icon size={14} className="shrink-0" />
                <span>{tab.label}</span>
                <span className="neo-filter-badge">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador Rápido con Estilo Táctil */}
        <div className="neo-filter-search-box">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por aseguradora, póliza, RFC, UUID..."
            className="neo-filter-search-input font-mono"
          />
        </div>
      </div>

      {/* 4. Tabla de Movimientos, Convenios y Facturas CFDI 4.0 */}
      <div className="neo-glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-white">Transacciones, Convenios GMM y Facturación</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
              {filteredTransactions.length} registros
            </span>
          </div>
          <span className="text-xs text-slate-300 font-mono">Cajero en Turno: {currentUser?.fullName || 'Lic. Gerardo Salcedo'}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-300 uppercase font-bold border-b border-white/10">
              <tr>
                <th className="p-3.5">Recibo / Factura SAT</th>
                <th className="p-3.5">Paciente & RFC</th>
                <th className="p-3.5">Aseguradora & Convenio</th>
                <th className="p-3.5">Servicio & Concepto</th>
                <th className="p-3.5 text-right">Subtotal</th>
                <th className="p-3.5 text-center">Régimen IVA</th>
                <th className="p-3.5 text-right">Total Facturado</th>
                <th className="p-3.5 text-right">Copago</th>
                <th className="p-3.5 text-center">Documentos & CFDI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((tx) => {
                const isGravado = tx.taxCategory === 'IVA_16';
                const hasInvoice = tx.isInvoiceIssued && tx.invoiceData;
                const hasInsurance = tx.insuranceAgreement || tx.paymentMethod === 'ASEGURADORA_CONVENIO';

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                    {/* Folio Recibo y CFDI */}
                    <td className="p-3.5">
                      <div className="font-mono text-cyan-300 font-black">{tx.receiptNumber}</div>
                      {hasInvoice ? (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                            <CheckCircle2 size={10} />
                            {tx.invoiceData?.invoiceFolio}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                            <Clock size={10} />
                            PENDIENTE CFDI
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Paciente y RFC */}
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm">{tx.patientName}</div>
                      <div className="text-[11px] font-mono text-slate-300 mt-0.5">
                        RFC: <strong className="text-cyan-200">{tx.invoiceData?.rfcRecipient || 'XAXX010101000'}</strong>
                      </div>
                    </td>

                    {/* Aseguradora y Convenio de Pago Directo */}
                    <td className="p-3.5">
                      {hasInsurance ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10.5px] border border-amber-400/30">
                            <Building size={11} />
                            {tx.insuranceAgreement?.companyName || 'Aseguradora GMM'}
                          </span>
                          {tx.insuranceAgreement?.authorizationCode && (
                            <div className="text-[10px] font-mono text-slate-300 mt-1">
                              Pase: <span className="text-amber-200 font-semibold">{tx.insuranceAgreement.authorizationCode}</span>
                            </div>
                          )}
                          <div className="text-[9.5px] text-cyan-400 font-mono">
                            Seguro: -${tx.insuranceCoverageAmount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-semibold">
                          Particular / Sin Convenio
                        </span>
                      )}
                    </td>

                    {/* Servicio y Concepto */}
                    <td className="p-3.5 max-w-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 text-[10px] font-bold tracking-wide">
                        {tx.serviceCategory}
                      </span>
                      <p className="text-slate-200 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {tx.conceptDescription}
                      </p>
                    </td>

                    {/* Subtotal */}
                    <td className="p-3.5 text-right font-mono font-semibold text-slate-200">
                      ${tx.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Desglose de IVA */}
                    <td className="p-3.5 text-center">
                      {isGravado ? (
                        <div className="inline-block px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-400/40 text-center">
                          <span className="text-[10px] font-bold text-cyan-300 block">IVA 16%</span>
                          <span className="text-xs font-mono font-black text-cyan-200">
                            +${tx.taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-block px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-center">
                          <span className="text-[10px] font-bold text-emerald-400 block">EXENTO LIVA</span>
                          <span className="text-[10.5px] font-mono text-slate-300">$0.00 IVA</span>
                        </div>
                      )}
                    </td>

                    {/* Total Bruto */}
                    <td className="p-3.5 text-right font-mono font-black text-white text-sm">
                      ${tx.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Copago o Deducible Paciente */}
                    <td className="p-3.5 text-right">
                      <div className="text-emerald-300 font-mono font-bold">
                        ${tx.patientCopayAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[9.5px] text-slate-400 font-mono block">
                        {tx.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Botones de Acción de Facturación, Convenio y Recibos */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Botón Finiquito de Convenio con Aseguradora (si aplica) */}
                        {hasInsurance && (
                          <button
                            onClick={() => generateInsuranceSettlementPDF(tx)}
                            className="btn-action-doc btn-action-finiquito"
                            title="Descargar Carta de Liquidación, Finiquito y Convenio con Aseguradora en PDF"
                          >
                            <Shield size={13} />
                            <span>Finiquito GMM</span>
                          </button>
                        )}

                        {hasInvoice ? (
                          <>
                            {/* Botón Factura Oficial PDF */}
                            <button
                              onClick={() => generateInvoicePDF(tx)}
                              className="btn-action-doc btn-action-factura"
                              title="Descargar Factura Oficial SAT CFDI 4.0 en PDF"
                            >
                              <FileText size={13} />
                              <span>Factura PDF</span>
                            </button>

                            {/* Botón XML SAT Oficial */}
                            <button
                              onClick={() => generateInvoiceXML(tx)}
                              className="btn-action-doc btn-action-xml"
                              title="Descargar archivo XML oficial SAT Anexo 20"
                            >
                              <FileCode size={13} />
                              <span>XML</span>
                            </button>
                          </>
                        ) : (
                          /* Botón Timbrar CFDI Express */
                          <button
                            onClick={() => handleOpenStampModal(tx)}
                            className="btn-action-doc btn-action-stamp"
                            title="Timbrar Factura CFDI 4.0 ante el SAT para este cargo"
                          >
                            <Zap size={13} />
                            <span>Timbrar CFDI</span>
                          </button>
                        )}

                        {/* Botón Ticket Térmico 80mm */}
                        <button
                          onClick={() => {
                            setTicketTx(tx);
                            setShowTicketModal(true);
                          }}
                          className="btn-action-doc btn-action-ticket"
                          title="Emitir e imprimir Ticket Térmico Oficial de Pago (80mm)"
                        >
                          <Printer size={13} />
                          <span>Ticket</span>
                        </button>

                        {/* Botón Recibo de Caja */}
                        <button
                          onClick={() => generateCashReceiptPDF(tx)}
                          className="btn-action-doc btn-action-receipt"
                          title="Descargar Recibo Oficial de Caja en PDF"
                        >
                          <Receipt size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal: Nuevo Cobro con Selector de Convenio con Aseguradora, IVA y CFDI 4.0 */}
      {showModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="neo-modal-content max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-sm">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Emitir Cargo, Convenio con Seguro y Factura</h3>
                  <p className="text-xs text-slate-300">Desglose de Pago Directo, deducibles, IVA y timbrado CFDI 4.0</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Paciente */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Paciente y Expediente</label>
                <select
                  value={patientId}
                  onChange={(e) => handleSelectPatient(e.target.value)}
                  className="neo-input neo-select"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.patientNumber} - {p.firstName} {p.lastName} (Seguro: {p.insuranceCompany}) - RFC: {p.rfc || 'Sin RFC'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Departamento y Forma de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Departamento Hospitalario</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="HOSPITALIZACION" className="bg-slate-900">Hospitalización y Camas</option>
                    <option value="QUIROFANO" className="bg-slate-900">Quirófano y Hemodinamia</option>
                    <option value="FARMACIA" className="bg-slate-900">Farmacia e Insumos Médicos</option>
                    <option value="LABORATORIO" className="bg-slate-900">Laboratorio Clínico</option>
                    <option value="IMAGENOLOGIA" className="bg-slate-900">Rayos X e Imagenología</option>
                    <option value="HONORARIOS" className="bg-slate-900">Honorarios Médicos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Modalidad de Cobro</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setPaymentMethod(val);
                      if (val === 'ASEGURADORA_CONVENIO') {
                        applyInsuranceAgreementData(selectedInsuranceCompany);
                      }
                    }}
                    className="neo-input neo-select text-amber-300 font-semibold"
                  >
                    <option value="ASEGURADORA_CONVENIO" className="bg-slate-900 text-amber-300 font-bold">
                      🛡️ Aseguradora (Convenio Pago Directo GMM)
                    </option>
                    <option value="TARJETA_CREDITO" className="bg-slate-900 text-white">Tarjeta de Crédito</option>
                    <option value="TARJETA_DEBITO" className="bg-slate-900 text-white">Tarjeta de Débito</option>
                    <option value="TRANSFERENCIA_SPEI" className="bg-slate-900 text-white">Transferencia Electrónica SPEI</option>
                    <option value="EFECTIVO" className="bg-slate-900 text-white">Efectivo</option>
                  </select>
                </div>
              </div>

              {/* SECCIÓN ESPECIAL: CONVENIO DE PAGO DIRECTO CON ASEGURADORA */}
              {paymentMethod === 'ASEGURADORA_CONVENIO' && (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-950 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Building size={15} />
                      Datos del Convenio y Carta de Autorización GMM
                    </span>
                    <span className="text-[10px] text-amber-200 font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                      PAGO DIRECTO HOSPITALARIO
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Aseguradora con Convenio */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Compañía Aseguradora en Convenio *
                      </label>
                      <select
                        value={selectedInsuranceCompany}
                        onChange={(e) => applyInsuranceAgreementData(e.target.value)}
                        className="neo-input neo-select font-bold text-amber-300"
                      >
                        {HOSPITAL_INSURANCE_AGREEMENTS.map(agr => (
                          <option key={agr.id} value={agr.name} className="bg-slate-900 text-white">
                            {agr.name} (Crédito {agr.creditDays} días) - RFC: {agr.rfc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Folio de Autorización / Pase Médico */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Folio Carta de Autorización del Seguro *
                      </label>
                      <input
                        type="text"
                        value={insuranceAuthCode}
                        onChange={(e) => setInsuranceAuthCode(e.target.value.toUpperCase())}
                        placeholder="Ej. AUT-GNP-2026-9812"
                        className="neo-input font-mono font-bold text-amber-300 uppercase"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        No. de Póliza de Gastos Médicos
                      </label>
                      <input
                        type="text"
                        value={insurancePolicyNo}
                        onChange={(e) => setInsurancePolicyNo(e.target.value.toUpperCase())}
                        placeholder="POL-GMM-883192"
                        className="neo-input font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        No. de Siniestro / Reporte Médico
                      </label>
                      <input
                        type="text"
                        value={insuranceClaimNo}
                        onChange={(e) => setInsuranceClaimNo(e.target.value.toUpperCase())}
                        placeholder="SIN-2026-44120"
                        className="neo-input font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Selector de a quién se emite la factura */}
                  <div className="pt-2 border-t border-amber-500/20">
                    <label className="block text-[11px] font-bold text-amber-200 mb-1.5">
                      ¿A nombre de quién se emite la Factura Electrónica (CFDI 4.0)?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleInvoiceTarget('ASEGURADORA')}
                        className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                          insuranceInvoiceTarget === 'ASEGURADORA'
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-amber-300 font-black">🏢 A la Aseguradora (Pago Directo)</div>
                        <div className="text-[10px] text-slate-300 mt-0.5">CFDI PPD a crédito con RFC de la Aseguradora ({selectedInsuranceCompany})</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleInvoiceTarget('PACIENTE_COPAGO')}
                        className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                          insuranceInvoiceTarget === 'PACIENTE_COPAGO'
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-emerald-300 font-black">👤 Al Paciente (Copago / Deducible)</div>
                        <div className="text-[10px] text-slate-300 mt-0.5">CFDI PUE con RFC del Paciente para su deducción anual SAT (D01)</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Concepto del Cobro / Procedimiento</label>
                <input
                  type="text"
                  value={conceptDescription}
                  onChange={(e) => setConceptDescription(e.target.value)}
                  placeholder="Ej. Procedimiento de Hemodinamia y colocación de Stent / Honorarios"
                  className="neo-input"
                  required
                />
              </div>

              {/* SECCIÓN DE PRECIOS E IMPUESTO AL VALOR AGREGADO (IVA) */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent size={14} />
                    Desglose Fiscal de Precios e Impuesto (IVA)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ley del IVA México</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Subtotal Base */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Subtotal Base (Antes de IVA) ($ MXN)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={subtotalInput}
                      onChange={(e) => setSubtotalInput(Number(e.target.value))}
                      className="neo-input font-mono font-bold text-white text-base"
                      required
                    />
                  </div>

                  {/* Régimen de IVA */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Tipo de Gravamen / Tasa IVA
                    </label>
                    <select
                      value={taxCategory}
                      onChange={(e) => setTaxCategory(e.target.value as TaxCategory)}
                      className="neo-input neo-select font-semibold text-emerald-300"
                    >
                      <option value="EXENTO_MEDICO" className="bg-slate-900 text-white">
                        Exento de IVA (Servicios Médicos / Art. 15 LIVA)
                      </option>
                      <option value="IVA_16" className="bg-slate-900 text-white">
                        IVA 16% (Insumos, Materiales y Servicios Gravados)
                      </option>
                      <option value="TASA_0" className="bg-slate-900 text-white">
                        Tasa 0% (Medicamentos de Patente Fracc. IV)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Cobertura Aseguradora y Copago */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Monto Cubierto por la Aseguradora ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={coverageAmount}
                      onChange={(e) => setCoverageAmount(Number(e.target.value))}
                      className="neo-input font-mono text-amber-300 font-bold"
                    />
                  </div>

                  {/* Resumen Calculado en Vivo */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col justify-center text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Monto IVA Trasladado ({taxRate * 100}%):</span>
                      <strong className="font-mono text-cyan-300">+${taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="flex items-center justify-between text-white font-bold">
                      <span>Total de la Cuenta:</span>
                      <strong className="font-mono text-white text-sm">${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="flex items-center justify-between text-emerald-400 font-black border-t border-white/10 pt-1">
                      <span>Deducible / Copago a Pagar por Paciente:</span>
                      <strong className="font-mono text-emerald-300 text-sm">${copayAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN FACTURA ELECTRÓNICA SAT CFDI 4.0 */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={issueInvoiceNow}
                      onChange={(e) => setIssueInvoiceNow(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/20 focus:ring-emerald-400"
                    />
                    <span className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1">
                      <Sparkles size={14} className="text-amber-400" />
                      Generar y Timbrar Factura Electrónica (CFDI 4.0)
                    </span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">SAT ANEXO 20</span>
                </div>

                {issueInvoiceNow && (
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          RFC del Receptor Fiscal *
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={rfcRecipient}
                            onChange={(e) => setRfcRecipient(e.target.value.toUpperCase())}
                            placeholder="GNP9211244Z0"
                            className="neo-input font-mono uppercase font-bold text-cyan-300"
                            maxLength={13}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setRfcRecipient('XAXX010101000')}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] text-slate-200 font-mono shrink-0"
                            title="Usar RFC genérico para Público en General"
                          >
                            Público Gral.
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Nombre o Razón Social Fiscal *
                        </label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value.toUpperCase())}
                          placeholder="NOMBRE COMPLETO SEGÚN CONSTANCIA SAT"
                          className="neo-input font-bold uppercase text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          C.P. Fiscal Domicilio *
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="63000"
                          maxLength={5}
                          className="neo-input font-mono"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Régimen Fiscal del Receptor *
                        </label>
                        <select
                          value={taxRegime}
                          onChange={(e) => setTaxRegime(e.target.value)}
                          className="neo-input neo-select text-xs"
                        >
                          <option value="601 - General de Ley Personas Morales">601 - General de Ley Personas Morales (Aseguradoras)</option>
                          <option value="605 - Sueldos y Salarios e Ingresos Asimilados">605 - Sueldos y Salarios e Ingresos Asimilados (Pacientes)</option>
                          <option value="612 - Personas Físicas con Actividades Empresariales">612 - Personas Físicas con Actividades Empresariales</option>
                          <option value="626 - Régimen Simplificado de Confianza (RESICO)">626 - Régimen Simplificado de Confianza (RESICO)</option>
                          <option value="616 - Sin obligaciones fiscales">616 - Sin obligaciones fiscales</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Uso del CFDI (Deducción Fiscal)
                        </label>
                        <select
                          value={cfdiUsage}
                          onChange={(e) => setCfdiUsage(e.target.value)}
                          className="neo-input neo-select text-xs"
                        >
                          <option value="G03 - Gastos en general">G03 - Gastos en general (Para Aseguradoras)</option>
                          <option value="D01 - Honorarios médicos, dentales y gastos hospitalarios">D01 - Honorarios médicos y gastos hospitalarios (Deducible Paciente)</option>
                          <option value="D07 - Gastos médicos por incapacidad o discapacidad">D07 - Gastos médicos por incapacidad</option>
                          <option value="CP01 - Pagos">CP01 - Pagos</option>
                          <option value="S01 - Sin efectos fiscales">S01 - Sin efectos fiscales</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Método de Pago SAT
                        </label>
                        <select
                          value={paymentMethodSat}
                          onChange={(e) => setPaymentMethodSat(e.target.value)}
                          className="neo-input neo-select text-xs"
                        >
                          <option value="PPD - Pago en parcialidades o diferido">PPD - Pago en parcialidades o diferido (Crédito Aseguradora)</option>
                          <option value="PUE - Pago en una sola exhibición">PUE - Pago en una sola exhibición (Contado Paciente)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-success text-xs font-bold"
                >
                  {issueInvoiceNow ? 'Registrar Cobro y Timbrar Factura CFDI' : 'Registrar Cobro y Recibo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Timbrado Express para Cobro Existente */}
      {stampModalOpen && txToStamp && (
        <div className="neo-modal-backdrop" onClick={() => setStampModalOpen(false)}>
          <div className="neo-modal-content max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Timbrar Factura Electrónica CFDI 4.0</h3>
                  <p className="text-xs text-slate-300">Asignar folio fiscal SAT y generar factura digital para el recibo {txToStamp.receiptNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setStampModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmStamp} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block">Concepto:</span>
                  <strong className="text-white">{txToStamp.conceptDescription}</strong>
                  {txToStamp.insuranceAgreement && (
                    <span className="text-[10px] text-amber-300 block mt-0.5">
                      Convenio: {txToStamp.insuranceAgreement.companyName} ({txToStamp.insuranceAgreement.authorizationCode})
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Total a Facturar:</span>
                  <strong className="text-emerald-400 font-mono text-base">${txToStamp.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">RFC Receptor *</label>
                  <input
                    type="text"
                    value={rfcRecipient}
                    onChange={(e) => setRfcRecipient(e.target.value.toUpperCase())}
                    className="neo-input font-mono uppercase font-bold text-cyan-300"
                    maxLength={13}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Razón Social Fiscal *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value.toUpperCase())}
                    className="neo-input font-bold uppercase text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">C.P. Fiscal *</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="neo-input font-mono"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Régimen Fiscal *</label>
                  <select
                    value={taxRegime}
                    onChange={(e) => setTaxRegime(e.target.value)}
                    className="neo-input neo-select text-xs"
                  >
                    <option value="601 - General de Ley Personas Morales">601 - General de Ley Personas Morales</option>
                    <option value="605 - Sueldos y Salarios e Ingresos Asimilados">605 - Sueldos y Salarios</option>
                    <option value="612 - Personas Físicas con Actividades Empresariales">612 - Actividades Empresariales</option>
                    <option value="626 - Régimen Simplificado de Confianza (RESICO)">626 - RESICO</option>
                    <option value="616 - Sin obligaciones fiscales">616 - Sin obligaciones fiscales</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Uso de CFDI</label>
                <select
                  value={cfdiUsage}
                  onChange={(e) => setCfdiUsage(e.target.value)}
                  className="neo-input neo-select text-xs"
                >
                  <option value="G03 - Gastos en general">G03 - Gastos en general (Aseguradoras)</option>
                  <option value="D01 - Honorarios médicos, dentales y gastos hospitalarios">D01 - Honorarios médicos y gastos hospitalarios</option>
                  <option value="D07 - Gastos médicos por incapacidad o discapacidad">D07 - Gastos médicos por incapacidad</option>
                  <option value="S01 - Sin efectos fiscales">S01 - Sin efectos fiscales</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStampModalOpen(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-active text-xs font-bold"
                >
                  Confirmar y Timbrar CFDI SAT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Ticket Térmico 80mm Oficial */}
      {showTicketModal && ticketTx && (
        <div className="neo-modal-backdrop" onClick={() => setShowTicketModal(false)}>
          <div className="neo-modal-content max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <Printer size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Ticket Térmico de Pago (80mm)</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Folio: {ticketTx.receiptNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTicketModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Vista Previa del Ticket Térmico Realista */}
            <div className="neo-thermal-ticket font-mono text-[11px] leading-tight text-slate-900 bg-white p-5 rounded shadow-2xl max-h-[60vh] overflow-y-auto">
              <div className="text-center pb-3 border-b border-dashed border-slate-400 mb-3">
                <h4 className="font-extrabold text-sm tracking-tight text-black">CENTRO MÉDICO PUERTA DE HIERRO</h4>
                <p className="text-[10px] text-slate-600 font-semibold">ALTA ESPECIALIDAD TEPIC</p>
                <p className="text-[9px] text-slate-500">RFC: CMP080425H89</p>
                <p className="text-[9px] text-slate-500">Blvd. Puerta de Hierro 5150, Fracc. Las Brisas</p>
                <p className="text-[9px] text-slate-500">Tepic, Nayarit C.P. 63175 | Tel: (311) 129-5000</p>
              </div>

              <div className="space-y-1 pb-2 border-b border-dashed border-slate-400 mb-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">FOLIO RECIBO:</span>
                  <span className="font-bold text-black">{ticketTx.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">FECHA Y HORA:</span>
                  <span>{ticketTx.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">TURNO / CAJA:</span>
                  <span>{ticketTx.shift} - CAJA 01</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">CAJERO:</span>
                  <span>{currentUser?.fullName || 'Lic. Gerardo Salcedo'}</span>
                </div>
              </div>

              <div className="space-y-1 pb-2 border-b border-dashed border-slate-400 mb-2 text-[10px]">
                <div>
                  <span className="text-slate-600 block text-[9px]">PACIENTE:</span>
                  <span className="font-bold text-black block">{ticketTx.patientName}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>EXP: {ticketTx.patientId.substring(0, 8).toUpperCase()}</span>
                  <span>HAB: 304 - PISO 3</span>
                </div>
              </div>

              {/* Convenio Aseguradora */}
              {ticketTx.insuranceAgreement && (
                <div className="p-2 bg-slate-100 rounded border border-slate-300 mb-2 text-[9px] space-y-0.5">
                  <div className="font-bold text-emerald-800 flex items-center justify-between">
                    <span>CONVENIO GMM:</span>
                    <span>{ticketTx.insuranceAgreement.companyName}</span>
                  </div>
                  <div>PÓLIZA: {ticketTx.insuranceAgreement.policyNumber}</div>
                  <div>AUT: {ticketTx.insuranceAgreement.authorizationCode}</div>
                </div>
              )}

              {/* Desglose de Concepto */}
              <div className="py-1 border-b border-dashed border-slate-400 mb-2">
                <div className="flex justify-between font-bold text-black mb-1">
                  <span>DESCRIPCIÓN</span>
                  <span>IMPORTE</span>
                </div>
                <div className="text-[10px] space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="pr-2">{ticketTx.conceptDescription}</span>
                    <span className="font-semibold">${ticketTx.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Totales */}
              <div className="space-y-1 pb-2 border-b border-slate-800 mb-2 text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>${ticketTx.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>{ticketTx.taxCategory === 'IVA_16' ? 'IVA TRASLADADO (16%):' : 'IVA (EXENTO ART. 15 LIVA):'}</span>
                  <span>${(ticketTx.taxAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                {ticketTx.insuranceCoverageAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold text-[10px]">
                    <span>COBERTURA ASEGURADORA:</span>
                    <span>-${ticketTx.insuranceCoverageAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm text-black pt-1 border-t border-slate-400">
                  <span>{ticketTx.insuranceCoverageAmount > 0 ? 'COPAGO PAGADO:' : 'TOTAL PAGADO:'}</span>
                  <span>${(ticketTx.patientCopayAmount || ticketTx.totalAmount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-0.5 text-[9px] text-slate-600 mb-3">
                <div className="flex justify-between">
                  <span>MÉTODO DE COBRO:</span>
                  <span className="font-bold text-black">{ticketTx.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>ESTADO DE TRANSACCIÓN:</span>
                  <span className="font-bold text-emerald-700">{ticketTx.status}</span>
                </div>
                {ticketTx.isInvoiceIssued && ticketTx.invoiceData && (
                  <div className="text-cyan-800 font-semibold mt-1">
                    FACTURA CFDI 4.0: {ticketTx.invoiceData.invoiceFolio}
                    <br />UUID: {ticketTx.invoiceData.uuidSat.substring(0, 18)}...
                  </div>
                )}
              </div>

              {/* Pie con Serrated Edge y Leyendas */}
              <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[8px] text-slate-500 space-y-1">
                <p>GRACIAS POR SU CONFIANZA</p>
                <p>Este comprobante certifica la recepción de los fondos indicados.</p>
                <p>Conserve este ticket para cualquier aclaración o solicitud de factura CFDI 4.0.</p>
                <div className="mt-2 text-[10px] tracking-widest font-mono text-slate-400">
                  * * * * * * * * * * * * * * * * * *
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="btn-neo btn-neo-defart text-xs"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => generateThermalTicketPDF(ticketTx)}
                className="btn-neo btn-neo-active text-xs flex items-center gap-1.5"
              >
                <Download size={14} />
                Descargar Ticket PDF (80mm)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-neo btn-neo-success text-xs font-bold flex items-center gap-1.5"
              >
                <Printer size={14} />
                Imprimir Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Arqueo de Dinero y Conciliación Física */}
      {showCashAuditModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowCashAuditModal(false)}>
          <div className="neo-modal-content neo-modal-dark max-w-3xl p-6" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm">
                  <Coins size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Arqueo de Dinero y Conteo Físico de Caja</h3>
                  <p className="text-xs text-slate-300 font-mono">Turno: <strong className="text-amber-300">{selectedShift}</strong> • Gaveta de Seguridad Caja 01</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCashAuditModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Panel de Balances y Conciliación en Tiempo Real */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="bg-slate-800/90 p-3 rounded-xl border border-white/15">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Fondo Fijo Inicial</span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-slate-400 text-xs font-mono">$</span>
                  <input 
                    type="number"
                    value={auditFloat}
                    onChange={(e) => setAuditFloat(Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-white/30 rounded px-2 py-0.5 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="bg-slate-800/90 p-3 rounded-xl border border-white/15">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Cobros Efectivo Turno</span>
                <span className="text-sm font-mono font-bold text-emerald-400 mt-1 block">
                  ${shiftCashTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">{shiftTransactions.filter(t => t.paymentMethod === 'EFECTIVO').length} operaciones</span>
              </div>

              <div className="bg-slate-800/90 p-3 rounded-xl border border-white/15">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Efectivo Físico Contado</span>
                <span className="text-sm font-mono font-black text-amber-300 mt-1 block">
                  ${physicalCashCounted.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">Billetes: ${totalBilletes} | Monedas: ${totalMonedas}</span>
              </div>

              <div className={`p-3 rounded-xl border ${
                auditDifference === 0 
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300' 
                  : auditDifference > 0 
                    ? 'bg-blue-950/70 border-cyan-400/50 text-cyan-300'
                    : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
              }`}>
                <span className="text-[10px] font-bold uppercase block opacity-90 text-slate-300">Diferencia / Estatus</span>
                <span className={`text-base font-mono font-black mt-1 block ${
                  auditDifference === 0 ? 'text-emerald-400' : auditDifference > 0 ? 'text-cyan-300' : 'text-rose-400'
                }`}>
                  {auditDifference >= 0 ? '+' : ''}${auditDifference.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  {auditStatus}
                </span>
              </div>
            </div>

            {/* Grid Interactivo de Denominaciones: Billetes y Monedas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Columna Billetes */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Banknote size={16} />
                    <span>BILLETES NACIONALES (MXN)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    Subtotal: ${totalBilletes.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'b1000', label: '$1,000 MXN', val: 1000, color: 'text-purple-400' },
                    { key: 'b500', label: '$500 MXN', val: 500, color: 'text-blue-400' },
                    { key: 'b200', label: '$200 MXN', val: 200, color: 'text-emerald-400' },
                    { key: 'b100', label: '$100 MXN', val: 100, color: 'text-rose-400' },
                    { key: 'b50', label: '$50 MXN', val: 50, color: 'text-amber-400' },
                    { key: 'b20', label: '$20 MXN', val: 20, color: 'text-cyan-400' }
                  ].map((denom) => (
                    <div key={denom.key} className="denomination-row">
                      <span className={`text-xs font-bold font-mono ${denom.color} w-20`}>{denom.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Pzas:</span>
                        <input
                          type="number"
                          min="0"
                          value={denominations[denom.key as keyof CashDenominations]}
                          onChange={(e) => {
                            const count = Math.max(0, parseInt(e.target.value) || 0);
                            setDenominations(prev => ({ ...prev, [denom.key]: count }));
                          }}
                          className="denomination-input"
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-200 text-right w-24">
                        ${(denominations[denom.key as keyof CashDenominations] * denom.val).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna Monedas */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Coins size={16} />
                    <span>MONEDAS METÁLICAS (MXN)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    Subtotal: ${totalMonedas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'm20', label: '$20 MXN', val: 20, color: 'text-amber-300' },
                    { key: 'm10', label: '$10 MXN', val: 10, color: 'text-amber-400' },
                    { key: 'm5', label: '$5 MXN', val: 5, color: 'text-slate-300' },
                    { key: 'm2', label: '$2 MXN', val: 2, color: 'text-slate-300' },
                    { key: 'm1', label: '$1 MXN', val: 1, color: 'text-slate-300' },
                    { key: 'm050', label: '$0.50 MXN', val: 0.50, color: 'text-amber-500' }
                  ].map((denom) => (
                    <div key={denom.key} className="denomination-row">
                      <span className={`text-xs font-bold font-mono ${denom.color} w-20`}>{denom.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Pzas:</span>
                        <input
                          type="number"
                          min="0"
                          value={denominations[denom.key as keyof CashDenominations]}
                          onChange={(e) => {
                            const count = Math.max(0, parseInt(e.target.value) || 0);
                            setDenominations(prev => ({ ...prev, [denom.key]: count }));
                          }}
                          className="denomination-input"
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-200 text-right w-24">
                        ${(denominations[denom.key as keyof CashDenominations] * denom.val).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Supervisión y Observaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Auditor / Supervisor en Turno</label>
                <input
                  type="text"
                  value={auditAuditorName}
                  onChange={(e) => setAuditAuditorName(e.target.value)}
                  className="neo-input text-xs font-bold"
                  placeholder="Nombre de quien audita"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Observaciones / Justificación de Caja</label>
                <input
                  type="text"
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  className="neo-input text-xs"
                  placeholder="Sin anomalías, billetes verificados con luz UV..."
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCashAuditModal(false)}
                className="btn-neo btn-neo-defart text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCashAudit}
                className="btn-neo btn-neo-audit-head text-xs font-bold flex items-center gap-1.5"
              >
                <FileCheck2 size={16} />
                Guardar Arqueo y Descargar Acta Oficial PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Corte de Caja y Cierre de Turno Oficial */}
      {showShiftClosingModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowShiftClosingModal(false)}>
          <div className="neo-modal-content neo-modal-dark max-w-3xl p-6" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 shadow-sm">
                  <Scale size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Corte y Cierre Oficial de Caja por Turno</h3>
                  <p className="text-xs text-slate-300 font-mono">
                    Turno: <strong className="text-purple-300">{selectedShift}</strong> • Conciliación Integral de Métodos de Pago e IVA
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowShiftClosingModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Resumen Superior */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-800/90 p-3 rounded-xl border border-white/15">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Operaciones Turno</span>
                <span className="text-base font-mono font-black text-white mt-1 block">
                  {shiftTransactions.length}
                </span>
                <span className="text-[10px] text-slate-400">Recibos emitidos</span>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-white/15">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Ingreso Consolidado</span>
                <span className="text-base font-mono font-black text-emerald-400 mt-1 block">
                  ${shiftTotalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">Total en caja y crédito</span>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-white/15">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Facturado CFDI 4.0</span>
                <span className="text-base font-mono font-black text-cyan-300 mt-1 block">
                  ${shiftInvoicedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">SAT Anexo 20</span>
              </div>
              <div className="bg-slate-800/90 p-3 rounded-xl border border-white/15">
                <span className="text-[10px] text-slate-300 font-bold uppercase block">Pendiente Facturar</span>
                <span className="text-base font-mono font-black text-amber-300 mt-1 block">
                  ${shiftNonInvoicedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">Recibos sin timbrar</span>
              </div>
            </div>

            {/* Desglose por Método de Cobro y Balance Fiscal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Desglose por Método */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-white/15">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-2 border-b border-white/10 mb-3 flex items-center gap-2">
                  <CreditCard size={15} className="text-cyan-400" />
                  <span>Desglose por Método de Pago</span>
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-300">Efectivo en Caja:</span>
                    <span className="font-bold text-emerald-400">${shiftCashTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-300">Tarjeta Débito (TPV):</span>
                    <span className="font-bold text-white">${shiftDebitTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-300">Tarjeta Crédito (TPV):</span>
                    <span className="font-bold text-white">${shiftCreditTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-300">Transferencia SPEI:</span>
                    <span className="font-bold text-cyan-300">${shiftSpeiTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-300">Convenios Aseguradoras GMM:</span>
                    <span className="font-bold text-purple-300">${shiftInsuranceTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Balance Fiscal SAT Anexo 20 & Retiro a Bóveda */}
              <div className="space-y-3">
                <div className="bg-slate-900/90 p-4 rounded-xl border border-white/15">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-2 border-b border-white/10 mb-3 flex items-center gap-2">
                    <Percent size={15} className="text-emerald-400" />
                    <span>Balance Fiscal SAT (IVA 16% vs Exento)</span>
                  </h4>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Gravado IVA 16%:</span>
                      <span className="text-white font-bold">${shiftTaxableTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">IVA Trasladado (16%):</span>
                      <span className="font-bold text-emerald-400">${shiftTaxAmountTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Exento Médico (Art. 15 LIVA):</span>
                      <span className="text-white font-bold">${shiftExemptTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Retiro a Bóveda */}
                <div className="bg-emerald-950/70 p-3.5 rounded-xl border border-emerald-500/50 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">Concentración / Depósito a Bóveda:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-emerald-400 font-bold">$</span>
                      <input 
                        type="number"
                        min="0"
                        value={vaultDepositAmount}
                        onChange={(e) => setVaultDepositAmount(Number(e.target.value) || 0)}
                        className="w-32 bg-slate-900 border border-emerald-400/60 rounded px-2 py-1 text-xs text-emerald-300 font-mono font-bold text-right outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-200 pt-1.5 border-t border-emerald-500/30">
                    <span>Remanente en Caja para Turno Siguiente:</span>
                    <strong className="text-white font-black">${remainingFloatAfterDeposit.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos de Entrega-Recepción */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Supervisor de Caja / Bóveda (Receptor)</label>
                <input
                  type="text"
                  value={closingSupervisorName}
                  onChange={(e) => setClosingSupervisorName(e.target.value)}
                  className="neo-input text-xs font-bold"
                  placeholder="Nombre de quien recibe valores"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Notas de Entrega-Recepción de Turno</label>
                <input
                  type="text"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="neo-input text-xs"
                  placeholder="Lotes de terminal bancaria cerrados, gaveta bajo llave..."
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowShiftClosingModal(false)}
                className="btn-neo btn-neo-defart text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveShiftClosing}
                className="btn-neo btn-neo-corte-head text-xs font-bold flex items-center gap-1.5"
              >
                <Scale size={16} />
                Confirmar Cierre de Turno y Descargar Acta Oficial PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
