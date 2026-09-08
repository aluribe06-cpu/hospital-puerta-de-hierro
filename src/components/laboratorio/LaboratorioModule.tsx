// ==============================================================================
// MÓDULO DE LABORATORIO CLÍNICO 24 HORAS (NOM-007-SSA3-2011)
// Hospital Puerta de Hierro (Tepic)
// ==============================================================================

import React, { useState } from 'react';
import { 
  FlaskConical, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  FileSpreadsheet, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { LabOrder, Patient } from '../../types/hospital';
import { logAuditAction } from '../../lib/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LaboratorioModuleProps {
  labOrders: LabOrder[];
  patients: Patient[];
  onValidateOrder: (orderId: string) => void;
  onNewOrder: (order: LabOrder) => void;
}

export const LaboratorioModule: React.FC<LaboratorioModuleProps> = ({
  labOrders,
  patients,
  onValidateOrder,
  onNewOrder,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('TODAS');
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Nueva Orden
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [testName, setTestName] = useState('Perfil Bioquímico Completo (36 Elementos)');
  const [category, setCategory] = useState<LabOrder['category']>('BIOQUIMICA');
  const [priority, setPriority] = useState<LabOrder['priority']>('NORMAL');
  const [requestingPhysician, setRequestingPhysician] = useState('Dra. Sofía Valenzuela Ríos');

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newOrder: LabOrder = {
      id: 'lab-' + Date.now(),
      orderFolio: 'LAB-2026-' + Math.floor(1000 + Math.random() * 9000),
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      testName,
      category,
      priority,
      status: 'SOLICITADO',
      requestingPhysician,
      criticalAlert: priority === 'URGENTE_STAT',
      results: [
        { parameter: 'Glucosa en Ayuno', value: '110.5', unit: 'mg/dL', referenceRange: '70 - 100 mg/dL', isAbnormal: true },
        { parameter: 'Creatinina Sérica', value: '1.1', unit: 'mg/dL', referenceRange: '0.7 - 1.3 mg/dL', isAbnormal: false },
        { parameter: 'Urea', value: '32.0', unit: 'mg/dL', referenceRange: '15 - 45 mg/dL', isAbnormal: false },
      ],
      createdAt: new Date().toISOString(),
    };

    onNewOrder(newOrder);

    logAuditAction({
      userName: requestingPhysician,
      userRole: 'MEDICO_URGENCIOLOGO',
      actionType: 'SOLICITUD_ESTUDIO_LABORATORIO',
      resourceAffected: `Folio ${newOrder.orderFolio}`,
      details: `${testName} para paciente ${patient.patientNumber}. Prioridad ${priority}.`,
    });

    setShowOrderModal(false);
  };

  const printLabReport = (order: LabOrder) => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('CENTRO MÉDICO PUERTA DE HIERRO - LABORATORIO CLÍNICO', 14, 12);
    doc.setFontSize(9);
    doc.text('Servicio 24 Horas | Sede Tepic | Responsable Sanitario: QFB Roberto Zepeda (Céd. 3456789)', 14, 18);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`Folio Estudio: ${order.orderFolio}`, 14, 34);
    doc.text(`Paciente: ${order.patientName}`, 14, 40);
    doc.text(`Estudio: ${order.testName} (${order.category})`, 14, 46);
    doc.text(`Médico Solicitante: ${order.requestingPhysician}`, 14, 52);

    const tableRows = order.results.map(r => [
      r.parameter,
      r.value,
      r.unit,
      r.referenceRange,
      r.isAbnormal ? 'ALERTA / ANORMAL' : 'NORMAL',
    ]);

    autoTable(doc, {
      startY: 58,
      head: [['Parámetro Analítico', 'Resultado', 'Unidades', 'Valores de Referencia', 'Estado']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          if (data.cell.raw === 'ALERTA / ANORMAL') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(8.5);
    doc.text('Validado bajo lineamientos de control de calidad interno y externo según NOM-007-SSA3-2011.', 14, finalY + 15);
    doc.text('Firma Digital: QFB Roberto Zepeda Orozco — Cédula Profesional 3456789', 14, finalY + 20);

    doc.save(`Resultado_${order.orderFolio}_${Date.now()}.pdf`);
  };

  const filtered = labOrders.filter(l => {
    if (filterCategory === 'TODAS') return true;
    return l.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#22d3ee' }}>
              <span className="neo-badge-dot" style={{ background: '#06b6d4' }}></span>
              LABORATORIO CLÍNICO 24 HORAS
            </span>
            <span className="text-xs text-slate-400 font-mono">NOM-007-SSA3-2011 ACREDITADO</span>
          </div>
          <h2 className="text-2xl font-black text-white">Órdenes Analíticas y Validación</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Hematología, bioquímica, tiempos de coagulación, troponinas y gasometría con alertas críticas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowOrderModal(true)}
            className="btn-neo btn-neo-active text-xs"
          >
            <Plus size={16} />
            Nueva Solicitud de Laboratorio
          </button>
        </div>
      </div>

      {/* Filtros de Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['TODAS', 'BIOQUIMICA', 'HEMATOLOGIA', 'COAGULACION', 'INMUNOLOGIA'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`btn-neo text-xs px-3.5 py-2 ${
              filterCategory === cat ? 'btn-neo-active' : 'btn-neo-defart'
            }`}
          >
            {cat === 'TODAS' ? 'Todos los Estudios' : cat}
          </button>
        ))}
      </div>

      {/* Lista de Órdenes de Laboratorio */}
      <div className="space-y-4">
        {filtered.map((order) => {
          const isValidated = order.status === 'VALIDADO_QFB';

          return (
            <div 
              key={order.id}
              className="neo-glass-panel p-5 border-l-4 transition-all"
              style={{
                borderLeftColor: order.criticalAlert ? '#ef4444' : isValidated ? '#10b981' : '#3b82f6'
              }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-cyan-300 font-bold text-xs bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                      {order.orderFolio}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {order.testName}
                    </h3>
                    <span className="text-xs text-slate-300 font-semibold">
                      👤 {order.patientName}
                    </span>
                    {order.priority === 'URGENTE_STAT' && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/40 animate-pulse">
                        🚨 URGENTE STAT
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    Solicita: <strong>{order.requestingPhysician}</strong> | Categoría: {order.category}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isValidated ? (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck size={16} /> Validado por {order.validatingQfb || 'QFB Zepeda'}
                    </span>
                  ) : (
                    <button
                      onClick={() => onValidateOrder(order.id)}
                      className="btn-neo btn-neo-cyan text-xs"
                    >
                      <CheckCircle2 size={14} /> Validar y Firmar (QFB)
                    </button>
                  )}

                  <button
                    onClick={() => printLabReport(order)}
                    className="btn-neo btn-neo-defart text-xs"
                    title="Imprimir Informe de Laboratorio"
                  >
                    <Printer size={16} />
                    Imprimir PDF
                  </button>
                </div>
              </div>

              {/* Tabla de Resultados Analíticos */}
              <div className="mt-4 pt-3 border-t border-white/10 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-slate-400 font-bold">
                    <tr>
                      <th className="pb-2">Parámetro</th>
                      <th className="pb-2">Resultado</th>
                      <th className="pb-2">Unidad</th>
                      <th className="pb-2">Rango Normal</th>
                      <th className="pb-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {order.results.map((res, idx) => (
                      <tr key={idx}>
                        <td className="py-2 text-white font-medium">{res.parameter}</td>
                        <td className={`py-2 font-bold font-mono ${res.isAbnormal ? 'text-red-400' : 'text-white'}`}>
                          {res.value}
                        </td>
                        <td className="py-2 text-slate-400">{res.unit}</td>
                        <td className="py-2 text-slate-400">{res.referenceRange}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            res.isAbnormal ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'text-emerald-400'
                          }`}>
                            {res.isAbnormal ? 'VALOR CRÍTICO' : 'NORMAL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nueva Orden */}
      {showOrderModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowOrderModal(false)}>
          <div className="neo-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white">Solicitud de Estudio de Laboratorio</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Paciente</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="neo-input neo-select"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.patientNumber} - {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Estudio Analítico</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className="neo-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="BIOQUIMICA" className="bg-slate-900">Bioquímica Clínica</option>
                    <option value="HEMATOLOGIA" className="bg-slate-900">Hematología Completa</option>
                    <option value="COAGULACION" className="bg-slate-900">Tiempos de Coagulación</option>
                    <option value="INMUNOLOGIA" className="bg-slate-900">Inmunología y Marcadores</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Prioridad de Procesamiento</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="neo-input neo-select"
                >
                  <option value="NORMAL" className="bg-slate-900">Ordinaria (Ronda habitual)</option>
                  <option value="URGENTE_STAT" className="bg-slate-900 text-red-400">🚨 Urgente STAT (Atención Inmediata &lt; 30 min)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-active text-xs"
                >
                  Emitir Orden Analítica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
