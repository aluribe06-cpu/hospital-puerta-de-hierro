// ==============================================================================
// MÓDULO DE FARMACIA HOSPITALARIA Y MEDICAMENTOS CONTROLADOS COFEPRIS
// Hospital Puerta de Hierro (Tepic)
// ==============================================================================

import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  AlertTriangle, 
  Search, 
  FileSpreadsheet, 
  ThermometerSnowflake, 
  ShieldCheck,
  CheckCircle2,
  Package
} from 'lucide-react';
import { PharmacyItem } from '../../types/hospital';
import { exportPharmacyToExcel } from '../../lib/exportEngine';
import { logAuditAction } from '../../lib/supabaseClient';

interface FarmaciaModuleProps {
  inventory: PharmacyItem[];
  onAddDrug: (drug: PharmacyItem) => void;
  onDispenseDrug: (id: string, qty: number) => void;
}

export const FarmaciaModule: React.FC<FarmaciaModuleProps> = ({
  inventory,
  onAddDrug,
  onDispenseDrug,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFraction, setFilterFraction] = useState('TODAS');
  const [showAddModal, setShowAddModal] = useState(false);

  // Formulario nuevo medicamento
  const [barcode, setBarcode] = useState('750100' + Math.floor(1000000 + Math.random() * 9000000));
  const [drugName, setDrugName] = useState('');
  const [activeSubstance, setActiveSubstance] = useState('');
  const [presentation, setPresentation] = useState('');
  const [batchNumber, setBatchNumber] = useState('LT-2026-' + Math.floor(10 + Math.random() * 90));
  const [expirationDate, setExpirationDate] = useState('2028-06-30');
  const [cofeprisFraction, setCofeprisFraction] = useState<PharmacyItem['cofeprisFraction']>('IV');
  const [stockCurrent, setStockCurrent] = useState(50);
  const [stockMinimum, setStockMinimum] = useState(15);
  const [unitCost, setUnitCost] = useState(120.0);
  const [unitPrice, setUnitPrice] = useState(250.0);
  const [isRefrigerated, setIsRefrigerated] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newDrug: PharmacyItem = {
      id: 'ph-' + Date.now(),
      barcode,
      drugName,
      activeSubstance,
      presentation,
      batchNumber,
      expirationDate,
      cofeprisFraction,
      stockCurrent: Number(stockCurrent),
      stockMinimum: Number(stockMinimum),
      unitCost: Number(unitCost),
      unitPrice: Number(unitPrice),
      locationBin: isRefrigerated ? 'Refrigerador Clínico (2-8°C)' : 'Gabinete General',
      isRefrigerated,
    };

    onAddDrug(newDrug);

    logAuditAction({
      userName: 'Lic. Andrea Miramontes',
      userRole: 'FARMACEUTICO',
      actionType: 'ALTA_MEDICAMENTO_FARMACIA',
      resourceAffected: `Fármaco ${drugName}`,
      details: `Lote ${batchNumber}, Caducidad ${expirationDate}, Fracc. COFEPRIS ${cofeprisFraction}, Stock inicial ${stockCurrent}`,
    });

    setShowAddModal(false);
    setDrugName('');
    setActiveSubstance('');
    setPresentation('');
  };

  const filtered = inventory.filter(item => {
    const matchesSearch = 
      item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.activeSubstance.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm);

    if (filterFraction === 'TODAS') return matchesSearch;
    return matchesSearch && item.cofeprisFraction === filterFraction;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="neo-badge neo-badge-green">
              <span className="neo-badge-dot" style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
              FARMACIA HOSPITALARIA CENTRAL
            </span>
            <span className="text-xs text-emerald-200 font-bold font-mono tracking-wider drop-shadow-sm">DISPENSACIÓN Y CONTROL COFEPRIS</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">Inventario y Control de Fármacos</h2>
          <p className="text-slate-100 text-sm mt-1 font-medium leading-relaxed drop-shadow-sm">
            Trazabilidad de lotes, fechas de caducidad, psicotrópicos controlados y cadena de frío.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => exportPharmacyToExcel(inventory)}
            className="btn-neo btn-neo-defart text-xs"
          >
            <FileSpreadsheet size={16} />
            Exportar Excel (.xlsx)
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-neo btn-neo-active text-xs"
          >
            <Plus size={16} />
            Ingresar Medicamento
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros COFEPRIS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, sustancia activa o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['TODAS', 'I', 'II', 'III', 'IV'].map((frac) => (
            <button
              key={frac}
              onClick={() => setFilterFraction(frac)}
              className={`btn-neo text-xs px-3 py-2 ${
                filterFraction === frac ? 'btn-neo-active' : 'btn-neo-defart'
              }`}
            >
              {frac === 'TODAS' ? 'Todas las Fracciones' : `Fracc. ${frac}`}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla Táctil de Medicamentos */}
      <div className="neo-glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase font-bold border-b border-white/10">
              <tr>
                <th className="p-4">Medicamento / Sustancia</th>
                <th className="p-4">Presentación</th>
                <th className="p-4">Lote / Caducidad</th>
                <th className="p-4">COFEPRIS</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-right">Precio Venta</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((item) => {
                const isLowStock = item.stockCurrent <= item.stockMinimum;
                const isControlled = item.cofeprisFraction === 'I' || item.cofeprisFraction === 'II';

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {item.drugName}
                        {item.isRefrigerated && (
                          <span title="Requiere Refrigeración 2-8°C" className="text-cyan-400">
                            <ThermometerSnowflake size={14} />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{item.activeSubstance}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{item.barcode}</div>
                    </td>
                    <td className="p-4 text-xs text-slate-300">
                      {item.presentation}
                    </td>
                    <td className="p-4 text-xs">
                      <span className="font-mono text-cyan-300 block">{item.batchNumber}</span>
                      <span className="text-slate-400">Vence: {item.expirationDate}</span>
                    </td>
                    <td className="p-4 text-xs">
                      <span 
                        className="px-2 py-0.5 rounded-full font-bold text-[10px]"
                        style={{
                          background: isControlled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: isControlled ? '#f87171' : '#60a5fa',
                          border: isControlled ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)'
                        }}
                      >
                        Fracc. {item.cofeprisFraction} {isControlled && '🔒'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span 
                        className={`text-sm font-extrabold px-2.5 py-1 rounded-full ${
                          isLowStock ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {item.stockCurrent}
                      </span>
                      {isLowStock && (
                        <span className="text-[10px] text-red-400 block mt-1">Bajo mínimo</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-bold text-white">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onDispenseDrug(item.id, 1)}
                        disabled={item.stockCurrent <= 0}
                        className="btn-neo btn-neo-cyan text-xs py-1.5 px-3"
                      >
                        Surtir 1
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Medicamento */}
      {showAddModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="neo-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-white">Ingresar Medicamento al Inventario</h3>
                <p className="text-xs text-slate-400">Control de Lote, Caducidad y Clasificación COFEPRIS</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Nombre Comercial</label>
                  <input
                    type="text"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="Ej. Ceftriaxona 1g"
                    className="neo-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Sustancia Activa</label>
                  <input
                    type="text"
                    value={activeSubstance}
                    onChange={(e) => setActiveSubstance(e.target.value)}
                    placeholder="Ej. Ceftriaxona Sódica"
                    className="neo-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Presentación</label>
                  <input
                    type="text"
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    placeholder="Frasco ámpula con diluyente"
                    className="neo-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Fracción COFEPRIS</label>
                  <select
                    value={cofeprisFraction}
                    onChange={(e) => setCofeprisFraction(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="I" className="bg-slate-900">Fracción I (Estupefacientes controlados)</option>
                    <option value="II" className="bg-slate-900">Fracción II (Psicotrópicos)</option>
                    <option value="III" className="bg-slate-900">Fracción III (Controlados con receta)</option>
                    <option value="IV" className="bg-slate-900">Fracción IV (Antibióticos con receta)</option>
                    <option value="V" className="bg-slate-900">Fracción V (Venta sin receta médica)</option>
                    <option value="VI" className="bg-slate-900">Fracción VI (Libre venta)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Número de Lote</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="neo-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Fecha de Caducidad</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="neo-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Stock Inicial</label>
                  <input
                    type="number"
                    value={stockCurrent}
                    onChange={(e) => setStockCurrent(Number(e.target.value))}
                    className="neo-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Costo Unitario ($)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="neo-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Precio Venta ($)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="neo-input font-mono"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isRefrigerated}
                  onChange={(e) => setIsRefrigerated(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Requiere Cadena de Frío (Refrigerador 2-8°C con monitoreo de temperatura)
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-active text-xs"
                >
                  Guardar en Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
