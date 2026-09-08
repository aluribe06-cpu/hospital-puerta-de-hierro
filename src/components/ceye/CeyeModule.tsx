// ==============================================================================
// MÓDULO DE CEYE (CENTRAL DE EQUIPOS Y ESTERILIZACIÓN - NOM-016-SSA3-2012)
// Hospital Puerta de Hierro (Tepic)
// ==============================================================================

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Thermometer, 
  Gauge, 
  Boxes 
} from 'lucide-react';
import { CeyeBatch } from '../../types/hospital';
import { logAuditAction } from '../../lib/supabaseClient';

interface CeyeModuleProps {
  batches: CeyeBatch[];
  onAddBatch: (batch: CeyeBatch) => void;
  onUpdateBatchStatus: (id: string, status: CeyeBatch['status']) => void;
}

export const CeyeModule: React.FC<CeyeModuleProps> = ({
  batches,
  onAddBatch,
  onUpdateBatchStatus,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Formulario nuevo ciclo
  const [autoclaveName, setAutoclaveName] = useState('Autoclave Matachana Vapor 01');
  const [sterilizationMethod, setSterilizationMethod] = useState<CeyeBatch['sterilizationMethod']>('VAPOR_134');
  const [temperatureC, setTemperatureC] = useState(134.5);
  const [pressurePsi, setPressurePsi] = useState(32.0);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [packageDescription, setPackageDescription] = useState('Set Instrumental Cirugía Laparoscópica Storz');
  const [destinationArea, setDestinationArea] = useState('Quirófano 02 (Laparoscopía)');

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();

    const newBatch: CeyeBatch = {
      id: 'ceye-' + Date.now(),
      batchCode: 'CEYE-2026-' + Math.floor(1000 + Math.random() * 9000),
      autoclaveName,
      sterilizationMethod,
      cycleNumber: Math.floor(1 + Math.random() * 6),
      temperatureC: Number(temperatureC),
      pressurePsi: Number(pressurePsi),
      durationMinutes: Number(durationMinutes),
      chemicalIndicatorApproved: true,
      biologicalIndicatorApproved: true,
      sterileExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      packageDescription,
      destinationArea,
      responsibleTechnician: 'Enf. Patricia Beltrán',
      status: 'LIBERADO_ESTERIL',
      createdAt: new Date().toISOString(),
    };

    onAddBatch(newBatch);

    logAuditAction({
      userName: 'Enf. Patricia Beltrán',
      userRole: 'INSTRUMENTISTA_CEYE',
      actionType: 'ESTERILIZACION_LOTE_CEYE',
      resourceAffected: `Lote ${newBatch.batchCode}`,
      details: `${packageDescription} procesado por ${sterilizationMethod} en ${autoclaveName}. Indicadores biológicos aprobados.`,
    });

    setShowModal(false);
    setPackageDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#22d3ee' }}>
              <span className="neo-badge-dot" style={{ background: '#06b6d4' }}></span>
              CENTRAL DE ESTERILIZACIÓN (CEYE)
            </span>
            <span className="text-xs text-slate-400 font-mono">NOM-016-SSA3-2012 PROTOCOLOS QUIRÚRGICOS</span>
          </div>
          <h2 className="text-2xl font-black text-white">Trazabilidad de Instrumental y Autoclaves</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Validación de indicadores químicos y biológicos, ciclos térmicos y dotación estéril a quirófanos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowModal(true)}
            className="btn-neo btn-neo-active text-xs"
          >
            <Plus size={16} />
            Registrar Ciclo de Esterilización
          </button>
        </div>
      </div>

      {/* Indicadores de Autoclaves Activas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neo-glass-panel p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Flame size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Autoclave Matachana 01 (Vapor)</span>
            <span className="text-sm font-bold text-white">134.5°C | 32.0 PSI — Operando</span>
          </div>
        </div>

        <div className="neo-glass-panel p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Sterrad NX 02 (Plasma Gas)</span>
            <span className="text-sm font-bold text-cyan-400">55.0°C — Ciclo Terminado OK</span>
          </div>
        </div>

        <div className="neo-glass-panel p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Boxes size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-semibold">Paquetes Estériles Disponibles</span>
            <span className="text-sm font-bold text-emerald-400">{batches.filter(b => b.status === 'LIBERADO_ESTERIL').length} Cajas Quirúrgicas</span>
          </div>
        </div>
      </div>

      {/* Lista de Lotes Procesados en CEYE */}
      <div className="space-y-4">
        {batches.map((batch) => {
          const isReleased = batch.status === 'LIBERADO_ESTERIL';

          return (
            <div 
              key={batch.id}
              className="neo-glass-panel p-5 border-l-4 transition-all"
              style={{ borderLeftColor: isReleased ? '#10b981' : '#3b82f6' }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-cyan-300 font-bold text-xs bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                      {batch.batchCode}
                    </span>
                    <h3 className="text-base font-bold text-white">{batch.packageDescription}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {batch.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-4 flex-wrap">
                    <span>⚙️ <strong>{batch.autoclaveName}</strong> (Ciclo #{batch.cycleNumber})</span>
                    <span>🌡️ {batch.temperatureC}°C | 💨 {batch.pressurePsi} PSI | ⏱️ {batch.durationMinutes} min</span>
                    <span>📍 Destino: <strong className="text-cyan-300">{batch.destinationArea}</strong></span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="text-emerald-400 flex items-center gap-1">
                      ✓ Indicador Químico Clase 5 Aprobado
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      ✓ Indicador Biológico Negativo (Sin crecimiento)
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Caducidad Estéril: {batch.sterileExpirationDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {batch.status === 'LIBERADO_ESTERIL' ? (
                    <button
                      onClick={() => onUpdateBatchStatus(batch.id, 'UTILIZADO')}
                      className="btn-neo btn-neo-cyan text-xs"
                    >
                      Marcar como Entregado a Quirófano
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold">
                      ✓ Empleado en Cirugía
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nuevo Ciclo */}
      {showModal && (
        <div className="neo-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="neo-modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white">Registrar Ciclo de Esterilización (CEYE)</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Autoclave</label>
                  <select
                    value={autoclaveName}
                    onChange={(e) => setAutoclaveName(e.target.value)}
                    className="neo-input neo-select"
                  >
                    <option value="Autoclave Matachana Vapor 01" className="bg-slate-900">Autoclave Matachana Vapor 01</option>
                    <option value="Sterrad NX Plasma Gas 02" className="bg-slate-900">Sterrad NX Plasma Gas 02</option>
                    <option value="Autoclave Óxido Etileno 03" className="bg-slate-900">Autoclave Óxido Etileno 03</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Método</label>
                  <select
                    value={sterilizationMethod}
                    onChange={(e) => setSterilizationMethod(e.target.value as any)}
                    className="neo-input neo-select"
                  >
                    <option value="VAPOR_134" className="bg-slate-900">Vapor a Presión (134°C - 45 min)</option>
                    <option value="VAPOR_121" className="bg-slate-900">Vapor a Presión (121°C - 60 min)</option>
                    <option value="PLASMA_GAS" className="bg-slate-900">Plasma Gas Peróxido Hidrógeno</option>
                    <option value="OXIDO_ETILENO" className="bg-slate-900">Óxido de Etileno (OE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Descripción del Instrumental / Paquete</label>
                <input
                  type="text"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="Ej. Set Traumatología y Placas de Osteosíntesis"
                  className="neo-input"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperatureC}
                    onChange={(e) => setTemperatureC(Number(e.target.value))}
                    className="neo-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Presión (PSI)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pressurePsi}
                    onChange={(e) => setPressurePsi(Number(e.target.value))}
                    className="neo-input font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Duración (min)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="neo-input font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">Área Quirúrgica Receptora</label>
                <input
                  type="text"
                  value={destinationArea}
                  onChange={(e) => setDestinationArea(e.target.value)}
                  placeholder="Quirófano 01 (Cardiovascular)"
                  className="neo-input"
                  required
                />
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
                  Liberar Lote Estéril
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
