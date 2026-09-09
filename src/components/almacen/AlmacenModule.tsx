// ==============================================================================
// MÓDULO 13: ALMACÉN GENERAL DE INSUMOS HOSPITALARIOS
// Hospital Puerta de Hierro (Tepic) - Centro Médico de Alta Especialidad
// ==============================================================================

import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Search, 
  FileSpreadsheet, 
  Layers, 
  MapPin, 
  ClipboardList, 
  TrendingDown, 
  CheckCircle2, 
  X, 
  Boxes, 
  ArrowDownRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { WarehouseItem, WarehouseDispatch, WarehouseItemCategory } from '../../types/hospital';
import { exportWarehouseToExcel } from '../../lib/exportEngine';
import { logAuditAction } from '../../lib/supabaseClient';

interface AlmacenModuleProps {
  inventory: WarehouseItem[];
  dispatches: WarehouseDispatch[];
  onAddItem: (item: WarehouseItem) => void;
  onDispatchItems: (dispatch: WarehouseDispatch) => void;
  onUpdateStock: (id: string, newStock: number) => void;
}

export const AlmacenModule: React.FC<AlmacenModuleProps> = ({
  inventory,
  dispatches,
  onAddItem,
  onDispatchItems,
  onUpdateStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [onlyCritical, setOnlyCritical] = useState(false);

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<WarehouseItem | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);

  // Formulario nuevo insumo
  const [sku, setSku] = useState('ALM-CUR-' + Math.floor(100 + Math.random() * 900));
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<WarehouseItemCategory>('MATERIAL_CURACION');
  const [unit, setUnit] = useState<WarehouseItem['unit']>('CAJA');
  const [stockCurrent, setStockCurrent] = useState(50);
  const [stockMinimum, setStockMinimum] = useState(20);
  const [stockMaximum, setStockMaximum] = useState(200);
  const [locationRack, setLocationRack] = useState('Pasillo A - Estante 1 - Nivel 1');
  const [unitCost, setUnitCost] = useState(250.0);
  const [batchNumber, setBatchNumber] = useState('L-2026-' + Math.floor(10 + Math.random() * 90));
  const [expirationDate, setExpirationDate] = useState('2028-12-31');
  const [notes, setNotes] = useState('');

  // Formulario Vale de Salida
  const [dispatchDept, setDispatchDept] = useState<WarehouseDispatch['requestingDepartment']>('QUIROFANOS');
  const [dispatchRequestedBy, setDispatchRequestedBy] = useState('Dr. Fernando Covarrubias');
  const [dispatchItemId, setDispatchItemId] = useState<string>(inventory[0]?.id || '');
  const [dispatchQty, setDispatchQty] = useState<number>(5);
  const [dispatchNotes, setDispatchNotes] = useState('Suministro para turno de guardia');

  // Cálculos de KPIs
  const totalSkus = inventory.length;
  const totalValuation = inventory.reduce((acc, curr) => acc + (curr.stockCurrent * curr.unitCost), 0);
  const criticalItems = inventory.filter(i => i.stockCurrent <= i.stockMinimum);
  const totalDispatchesCount = dispatches.length;

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: WarehouseItem = {
      id: 'alm-' + Date.now(),
      sku,
      itemName,
      category,
      unit,
      stockCurrent: Number(stockCurrent),
      stockMinimum: Number(stockMinimum),
      stockMaximum: Number(stockMaximum),
      locationRack,
      unitCost: Number(unitCost),
      lastRestockDate: new Date().toISOString().split('T')[0],
      batchNumber,
      expirationDate,
      notes,
    };

    onAddItem(newItem);

    logAuditAction({
      userName: 'Dirección de Almacén',
      userRole: 'JEFE_ALMACEN',
      actionType: 'ALTA_INSUMO_ALMACEN',
      resourceAffected: `Insumo ${itemName} (${sku})`,
      details: `Stock inicial: ${stockCurrent} ${unit}. Ubicación: ${locationRack}`,
    });

    setShowAddModal(false);
    setItemName('');
    setNotes('');
  };

  const handleSaveDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetItem = inventory.find(i => i.id === dispatchItemId);
    if (!targetItem) return;

    if (dispatchQty > targetItem.stockCurrent) {
      alert(`No hay existencia suficiente. Stock actual: ${targetItem.stockCurrent} ${targetItem.unit}`);
      return;
    }

    const newDispatch: WarehouseDispatch = {
      id: 'val-' + Date.now(),
      dispatchFolio: 'VALE-2026-' + Math.floor(1000 + Math.random() * 9000),
      requestingDepartment: dispatchDept,
      requestedBy: dispatchRequestedBy,
      deliveredBy: 'T.S. Gabriel Montes (Almacén Central)',
      dispatchedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'ENTREGADO',
      items: [
        {
          itemId: targetItem.id,
          itemName: targetItem.itemName,
          sku: targetItem.sku,
          quantity: Number(dispatchQty)
        }
      ],
      notes: dispatchNotes
    };

    onDispatchItems(newDispatch);
    onUpdateStock(targetItem.id, targetItem.stockCurrent - Number(dispatchQty));

    logAuditAction({
      userName: 'Dirección de Almacén',
      userRole: 'JEFE_ALMACEN',
      actionType: 'VALE_SURTIMIENTO_ALMACEN',
      resourceAffected: `Vale ${newDispatch.dispatchFolio}`,
      details: `Entregado a ${dispatchDept} (${dispatchRequestedBy}): ${dispatchQty} ${targetItem.unit} de ${targetItem.itemName}`,
    });

    setShowDispatchModal(false);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust) return;

    onUpdateStock(selectedItemForAdjust.id, Number(adjustQuantity));

    logAuditAction({
      userName: 'Dirección de Almacén',
      userRole: 'JEFE_ALMACEN',
      actionType: 'AJUSTE_INVENTARIO_ALMACEN',
      resourceAffected: `Insumo ${selectedItemForAdjust.itemName}`,
      details: `Stock anterior: ${selectedItemForAdjust.stockCurrent}. Nuevo stock: ${adjustQuantity}`,
    });

    setShowAdjustModal(false);
    setSelectedItemForAdjust(null);
  };

  // Filtrado de items
  const filteredItems = inventory.filter(item => {
    const matchQuery = 
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locationRack.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = selectedCategory === 'TODAS' || item.category === selectedCategory;
    const matchCritical = onlyCritical ? item.stockCurrent <= item.stockMinimum : true;

    return matchQuery && matchCategory && matchCritical;
  });

  return (
    <div className="space-y-4">
      {/* 1. Encabezado Maestro de Almacén */}
      <div className="neo-glass-panel p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <Boxes size={22} className="animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Almacén General de Insumos
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  STEP 13
                </span>
              </h1>
              <p className="text-xs text-slate-300">
                Material de curación, soluciones parenterales, estantes/racks y control de desabasto • NOM-024 / NOM-016
              </p>
            </div>
          </div>
        </div>

        {/* Botonera de Acciones Táctiles */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => exportWarehouseToExcel(inventory)}
            className="btn-neo btn-neo-defart text-xs px-3.5 py-2 flex items-center gap-2 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-950/40 border border-emerald-500/30 transition-all active:scale-95"
            title="Exportar Kárdex e inventario completo a Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} className="text-emerald-400" />
            <span className="font-bold">Exportar Kárdex (.xlsx)</span>
          </button>

          <button
            onClick={() => setShowDispatchModal(true)}
            className="btn-neo btn-neo-defart text-xs px-3.5 py-2 flex items-center gap-2 text-amber-300 hover:text-amber-100 hover:bg-amber-950/40 border border-amber-500/30 transition-all active:scale-95"
          >
            <ClipboardList size={15} className="text-amber-400" />
            <span className="font-bold">Vale de Salida</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-neo btn-neo-primary text-xs px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(20,184,166,0.35)] hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Nuevo Insumo</span>
          </button>
        </div>
      </div>

      {/* 2. Cuadrícula de KPIs Táctiles de Almacén */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: SKUs */}
        <div className="neo-glass-panel p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/20 shrink-0">
            <Package size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Catálogo Activo</div>
            <div className="text-xl font-black text-white font-mono">{totalSkus} <span className="text-xs text-teal-400 font-normal">SKUs</span></div>
          </div>
        </div>

        {/* KPI 2: Valuación */}
        <div className="neo-glass-panel p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/20 shrink-0">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Valor de Inventario</div>
            <div className="text-xl font-black text-cyan-300 font-mono">
              ${totalValuation.toLocaleString('es-MX', { maximumFractionDigits: 0 })} <span className="text-[10px] text-slate-400 font-normal">MXN</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Desabasto / Nivel Crítico */}
        <div className="neo-glass-panel p-3.5 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${criticalItems.length > 0 ? 'bg-rose-500/25 text-rose-300 border border-rose-400/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/20'}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nivel Crítico (Reorden)</div>
            <div className={`text-xl font-black font-mono ${criticalItems.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {criticalItems.length} <span className="text-xs font-normal text-slate-300">artículos</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Vales de Surtimiento */}
        <div className="neo-glass-panel p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/20 shrink-0">
            <ClipboardList size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Vales Surtidos</div>
            <div className="text-xl font-black text-amber-300 font-mono">{totalDispatchesCount} <span className="text-xs text-slate-400 font-normal">registros</span></div>
          </div>
        </div>
      </div>

      {/* 3. Barra de Búsqueda y Filtros por Categoría */}
      <div className="neo-glass-panel p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Input Buscador */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por SKU, insumo o rack..."
            className="neo-input text-xs pl-9 pr-3 py-2 w-full bg-slate-900/80 text-white placeholder-slate-400 border-white/10 rounded-xl"
          />
        </div>

        {/* Píldoras de Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'TODAS', label: 'Todos' },
            { id: 'MATERIAL_CURACION', label: 'Curación' },
            { id: 'SOLUCIONES_PARENTERALES', label: 'Soluciones' },
            { id: 'EQUIPO_PROTECCION', label: 'Protección' },
            { id: 'ROPERIA_LENCERIA', label: 'Ropería' },
            { id: 'REACTIVOS_INSUMOS', label: 'Reactivos' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-teal-500 text-white shadow-[0_2px_8px_rgba(20,184,166,0.4)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Toggle Crítico */}
          <button
            onClick={() => setOnlyCritical(!onlyCritical)}
            className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all shrink-0 border ${
              onlyCritical
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.5)]'
                : 'bg-rose-950/30 text-rose-300 border-rose-500/30 hover:bg-rose-900/40'
            }`}
          >
            <AlertTriangle size={13} />
            <span>Críticos</span>
          </button>
        </div>
      </div>

      {/* 4. Tabla de Insumos de Almacén con Barra de Nivel de Stock */}
      <div className="neo-glass-panel p-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-white/5 text-slate-400 text-[11px] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">SKU / Código</th>
                <th className="py-2.5 px-3">Insumo / Descripción Oficial</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Ubicación Rack</th>
                <th className="py-2.5 px-3 text-center">Nivel de Stock</th>
                <th className="py-2.5 px-3 text-right">Costo Unitario</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron insumos hospitalarios con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isCritical = item.stockCurrent <= item.stockMinimum;
                  const stockPct = Math.min(Math.round((item.stockCurrent / item.stockMaximum) * 100), 100);
                  const totalItemVal = item.stockCurrent * item.unitCost;

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                      {/* SKU */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30 font-bold">
                          {item.sku}
                        </span>
                        {item.batchNumber && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Lote: {item.batchNumber}
                          </div>
                        )}
                      </td>

                      {/* Nombre y Detalles */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{item.itemName}</div>
                        <div className="text-[10.5px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Unidad: <strong className="text-slate-200">{item.unit}</strong></span>
                          {item.expirationDate && (
                            <>
                              <span>•</span>
                              <span>Cad: <strong className="text-slate-300">{item.expirationDate}</strong></span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Ubicación en Rack */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-teal-300 text-[11px]">
                          <MapPin size={13} className="shrink-0 text-teal-400" />
                          <span>{item.locationRack}</span>
                        </div>
                      </td>

                      {/* Nivel de Stock con Barra Progresiva */}
                      <td className="py-3 px-3 w-44">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                          <span className={`font-bold ${isCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {item.stockCurrent} <span className="text-[9px] text-slate-400 font-normal">{item.unit.toLowerCase()}s</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Min: {item.stockMinimum}
                          </span>
                        </div>
                        {/* Barra */}
                        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/10">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCritical
                                ? 'bg-gradient-to-r from-rose-600 to-amber-500'
                                : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                            }`}
                            style={{ width: `${Math.max(stockPct, 8)}%` }}
                          />
                        </div>
                        {isCritical && (
                          <div className="text-[9.5px] font-bold text-rose-400 mt-0.5 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            <span>Punto de reorden alcanzado</span>
                          </div>
                        )}
                      </td>

                      {/* Costo Unitario */}
                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        ${item.unitCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Valor Total */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-cyan-300">
                        ${totalItemVal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Acciones Rápidas */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedItemForAdjust(item);
                            setAdjustQuantity(item.stockCurrent);
                            setShowAdjustModal(true);
                          }}
                          className="btn-neo text-[10.5px] px-2.5 py-1 rounded-lg bg-white/10 text-cyan-300 hover:bg-cyan-950 hover:text-white border border-cyan-500/30 font-semibold"
                        >
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Historial Reciente de Vales de Salida */}
      <div className="neo-glass-panel p-4">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <ClipboardList size={16} className="text-amber-400" />
          <span>Últimos Vales de Surtimiento Hospitalario</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dispatches.slice(0, 3).map(disp => (
            <div key={disp.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-amber-300">{disp.dispatchFolio}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                  {disp.status}
                </span>
              </div>
              <div className="text-xs font-bold text-white">
                Destino: <span className="text-teal-300">{disp.requestingDepartment.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Solicitó: <strong className="text-slate-200">{disp.requestedBy}</strong>
              </div>
              <div className="text-[10.5px] text-slate-300 font-mono bg-black/30 p-1.5 rounded-lg border border-white/5">
                {disp.items.map((it, idx) => (
                  <div key={idx}>• {it.itemName} (x{it.quantity})</div>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 text-right">
                {disp.dispatchedDate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ALTA DE NUEVO INSUMO HOSPITALARIO */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="neo-auth-card w-full max-w-lg p-6 bg-slate-900/95 border border-teal-500/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Boxes size={18} className="text-teal-400" />
                <span>Alta de Insumo Hospitalario</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Código SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WarehouseItemCategory)}
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                  >
                    <option value="MATERIAL_CURACION">Material de Curación</option>
                    <option value="SOLUCIONES_PARENTERALES">Soluciones Parenterales</option>
                    <option value="EQUIPO_PROTECCION">Equipo de Protección</option>
                    <option value="ROPERIA_LENCERIA">Ropería / Lencería</option>
                    <option value="REACTIVOS_INSUMOS">Reactivos e Insumos</option>
                    <option value="PAPELERIA_MEDICA">Papelería Médica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Descripción Oficial del Insumo</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Ej: Catéter Intravenoso 18G Verde BD"
                  required
                  className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Unidad</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as WarehouseItem['unit'])}
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                  >
                    <option value="CAJA">Caja</option>
                    <option value="PAQUETE">Paquete</option>
                    <option value="PIEZA">Pieza</option>
                    <option value="FRASCO">Frasco</option>
                    <option value="ROLLO">Rollo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Stock Inicial</label>
                  <input
                    type="number"
                    value={stockCurrent}
                    onChange={(e) => setStockCurrent(Number(e.target.value))}
                    min="1"
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Stock Mínimo</label>
                  <input
                    type="number"
                    value={stockMinimum}
                    onChange={(e) => setStockMinimum(Number(e.target.value))}
                    min="1"
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Ubicación Rack / Estante</label>
                  <input
                    type="text"
                    value={locationRack}
                    onChange={(e) => setLocationRack(e.target.value)}
                    placeholder="Pasillo A - Estante 2 - Nivel 1"
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Costo Unitario ($ MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Lote Fabricante</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Fecha de Caducidad</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Notas y Especificaciones</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles sobre presentación clínica o restricciones de entrega..."
                  rows={2}
                  className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-neo text-xs px-3 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-primary text-xs px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(20,184,166,0.4)]"
                >
                  Registrar en Kárdex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VALE DE SALIDA / SURTIMIENTO */}
      {/* ========================================================================= */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="neo-auth-card w-full max-w-md p-6 bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardList size={18} className="text-amber-400" />
                <span>Vale de Surtimiento Hospitalario</span>
              </h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDispatch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Departamento Destino</label>
                <select
                  value={dispatchDept}
                  onChange={(e) => setDispatchDept(e.target.value as WarehouseDispatch['requestingDepartment'])}
                  className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                >
                  <option value="QUIROFANOS">Quirófanos Centrales</option>
                  <option value="URGENCIAS">Triage & Urgencias Choque</option>
                  <option value="UCI_ADULTOS">Unidad de Cuidados Intensivos (UCI)</option>
                  <option value="UCIN_NEONATAL">UCIN Neonatal</option>
                  <option value="PISOS_HOSPITALIZACION">Pisos de Hospitalización</option>
                  <option value="CONSULTORIOS">Consultorios Consulta Externa</option>
                  <option value="CEYE">Central de Esterilización (CEYE)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Personal Responsable que Recibe</label>
                <input
                  type="text"
                  value={dispatchRequestedBy}
                  onChange={(e) => setDispatchRequestedBy(e.target.value)}
                  placeholder="Nombre de médico o enfermera jefa..."
                  required
                  className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Seleccionar Insumo</label>
                <select
                  value={dispatchItemId}
                  onChange={(e) => setDispatchItemId(e.target.value)}
                  className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} (Stock disponible: {item.stockCurrent} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Cantidad a Surtir</label>
                <input
                  type="number"
                  value={dispatchQty}
                  onChange={(e) => setDispatchQty(Number(e.target.value))}
                  min="1"
                  required
                  className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Justificación / Notas del Vale</label>
                <input
                  type="text"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="Ej: Cirugía programada de urgencia..."
                  className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="btn-neo text-xs px-3 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-primary text-xs px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
                >
                  Confirmar y Descontar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AJUSTE RÁPIDO DE STOCK */}
      {/* ========================================================================= */}
      {showAdjustModal && selectedItemForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="neo-auth-card w-full max-w-sm p-5 bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Ajuste de Existencias Físicas</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-3 text-xs">
              <div className="text-slate-300">
                Insumo: <strong className="text-cyan-300">{selectedItemForAdjust.itemName}</strong>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                SKU: {selectedItemForAdjust.sku} | Ubicación: {selectedItemForAdjust.locationRack}
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nueva Cantidad en Existencia:</label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  min="0"
                  required
                  className="neo-input w-full p-2.5 bg-slate-950 text-white border-cyan-500/30 rounded-lg font-mono text-base font-bold text-center"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="btn-neo text-xs px-3 py-1.5 rounded-xl bg-white/10 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-primary text-xs px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl"
                >
                  Actualizar Kárdex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
