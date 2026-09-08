// ==============================================================================
// MÓDULO DE CAJA, COBROS Y CONVENIOS CON ASEGURADORAS
// Hospital Puerta de Hierro (Tepic)
// ==============================================================================

import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  CreditCard, 
  FileSpreadsheet, 
  ShieldCheck, 
  Receipt, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { CashTransaction, Patient } from '../../types/hospital';
import { exportCashReportToExcel } from '../../lib/exportEngine';
import { logAuditAction } from '../../lib/supabaseClient';

interface CajaCobroModuleProps {
  transactions: CashTransaction[];
  patients: Patient[];
  onAddTransaction: (transaction: CashTransaction) => void;
}

export const CajaCobroModule: React.FC<CajaCobroModuleProps> = ({
  transactions,
  patients,
  onAddTransaction,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState('MATUTINO');

  // Formulario nuevo cobro
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [serviceCategory, setServiceCategory] = useState<CashTransaction['serviceCategory']>('HOSPITALIZACION');
  const [conceptDescription, setConceptDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState(15000.0);
  const [coverageAmount, setCoverageAmount] = useState(12000.0);
  const [paymentMethod, setPaymentMethod] = useState<CashTransaction['paymentMethod']>('ASEGURADORA_CONVENIO');

  const copayAmount = Math.max(totalAmount - coverageAmount, 0);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newTx: CashTransaction = {
      id: 'caj-' + Date.now(),
      receiptNumber: 'CAJA-2026-' + Math.floor(1000 + Math.random() * 9000),
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      serviceCategory,
      conceptDescription,
      subtotal: totalAmount,
      taxAmount: 0.0,
      totalAmount,
      insuranceCoverageAmount: coverageAmount,
      patientCopayAmount: copayAmount,
      paymentMethod,
      cashierName: 'Lic. Gerardo Salcedo',
      shift: selectedShift as any,
      status: 'PAGADO',
      createdAt: new Date().toISOString(),
    };

    onAddTransaction(newTx);

    logAuditAction({
      userName: 'Lic. Gerardo Salcedo',
      userRole: 'CAJERO_RECEPCION',
      actionType: 'COBRO_HOSPITALARIO_EMITIDO',
      resourceAffected: `Recibo ${newTx.receiptNumber}`,
      details: `${conceptDescription} para ${patient.patientNumber}. Total: $${totalAmount} MXN.`,
    });

    setShowModal(false);
    setConceptDescription('');
  };

  const totalCollected = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalInsurance = transactions.reduce((sum, t) => sum + t.insuranceCoverageAmount, 0);
  const totalCopay = transactions.reduce((sum, t) => sum + t.patientCopayAmount, 0);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}>
              <span className="neo-badge-dot" style={{ background: '#10b981' }}></span>
              CAJA Y FACTURACIÓN HOSPITALARIA
            </span>
            <span className="text-xs text-slate-400 font-mono">CONVENIOS GMM Y COBROS PARTICULARES</span>
          </div>
          <h2 className="text-2xl font-black text-white">Administración de Cobros y Cortes de Caja</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Liquidación de cuentas maestras, deducibles, coaseguros y corte por turnos de guardia.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => exportCashReportToExcel(transactions, selectedShift)}
            className="btn-neo btn-neo-defart text-xs"
          >
            <FileSpreadsheet size={16} />
            Exportar Corte de Turno (.xlsx)
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-neo btn-neo-active text-xs"
          >
            <Plus size={16} />
            Emitir Cargo / Recibo
          </button>
        </div>
      </div>

      {/* Resumen Financiero Táctil */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neo-glass-panel p-5">
          <span className="text-xs text-slate-400 font-bold uppercase">Facturación Total del Turno</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-2">
            ${totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-emerald-400 block mt-1">✓ Pagos validados y conciliados</span>
        </div>

        <div className="neo-glass-panel p-5">
          <span className="text-xs text-slate-400 font-bold uppercase">Cobertura Aseguradoras (GNP/AXA)</span>
          <div className="text-2xl md:text-3xl font-extrabold text-cyan-400 mt-2">
            ${totalInsurance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 block mt-1">Convenios de Pago Directo</span>
        </div>

        <div className="neo-glass-panel p-5">
          <span className="text-xs text-slate-400 font-bold uppercase">Copago y Deducible Recaudado</span>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-2">
            ${totalCopay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 block mt-1">Efectivo y Tarjeta Bancaria</span>
        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className="neo-glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Transacciones del Turno Activo</h3>
          <span className="text-xs text-slate-400 font-mono">Cajero en Turno: Lic. Gerardo Salcedo</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-bold border-b border-white/10">
              <tr>
                <th className="p-3.5">Recibo / Folio</th>
                <th className="p-3.5">Paciente</th>
                <th className="p-3.5">Servicio</th>
                <th className="p-3.5">Concepto</th>
                <th className="p-3.5 text-right">Total</th>
                <th className="p-3.5 text-right">Aseguradora</th>
                <th className="p-3.5 text-right">Copago</th>
                <th className="p-3.5">Método de Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono text-cyan-400 font-bold">{tx.receiptNumber}</td>
                  <td className="p-3.5 font-bold text-white">{tx.patientName}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                      {tx.serviceCategory}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">{tx.conceptDescription}</td>
                  <td className="p-3.5 text-right font-bold text-white">${tx.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3.5 text-right text-cyan-300 font-mono">${tx.insuranceCoverageAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3.5 text-right text-emerald-400 font-mono font-bold">${tx.patientCopayAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3.5 text-slate-300">{tx.paymentMethod.replace(/_/g, ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Cobro */}
      {showModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="neo-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white">Emitir Cargo y Recibo Hospitalario</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Paciente</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="neo-input neo-select"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.patientNumber} - {p.firstName} {p.lastName} ({p.insuranceCompany})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Departamento / Servicio</label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="HOSPITALIZACION" className="bg-slate-900">Hospitalización y Camas</option>
                    <option value="QUIROFANO" className="bg-slate-900">Quirófano y Hemodinamia</option>
                    <option value="FARMACIA" className="bg-slate-900">Farmacia e Insumos</option>
                    <option value="LABORATORIO" className="bg-slate-900">Laboratorio Clínico</option>
                    <option value="IMAGENOLOGIA" className="bg-slate-900">Rayos X e Imagenología</option>
                    <option value="HONORARIOS" className="bg-slate-900">Honorarios Médicos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Forma de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="ASEGURADORA_CONVENIO" className="bg-slate-900">Aseguradora (GMM Convenio)</option>
                    <option value="TARJETA_DEBITO" className="bg-slate-900">Tarjeta de Débito</option>
                    <option value="TARJETA_CREDITO" className="bg-slate-900">Tarjeta de Crédito</option>
                    <option value="TRANSFERENCIA_SPEI" className="bg-slate-900">Transferencia SPEI</option>
                    <option value="EFECTIVO" className="bg-slate-900">Efectivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Concepto del Cobro</label>
                <input
                  type="text"
                  value={conceptDescription}
                  onChange={(e) => setConceptDescription(e.target.value)}
                  placeholder="Ej. Estancia Cama UCI monitorizada 24 hrs"
                  className="neo-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Importe Total ($)</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="neo-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Cobertura Seguro ($)</label>
                  <input
                    type="number"
                    value={coverageAmount}
                    onChange={(e) => setCoverageAmount(Number(e.target.value))}
                    className="neo-input font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300">Copago o Deducible Paciente:</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  ${copayAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>

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
                  className="btn-neo btn-neo-active text-xs"
                >
                  Registrar Cobro y Facturar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
