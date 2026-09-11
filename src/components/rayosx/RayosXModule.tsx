// ==============================================================================
// MÓDULO DE RAYOS X, IMAGENOLOGÍA Y HEMODINAMIA
// Hospital Puerta de Hierro (Tepic) - Tomografía, Resonancia y Rayos X
// ==============================================================================

import React, { useState } from 'react';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Contrast, 
  RotateCw, 
  ShieldCheck, 
  FileText, 
  Maximize2 
} from 'lucide-react';
import { ImagingStudy } from '../../types/hospital';

interface RayosXModuleProps {
  studies: ImagingStudy[];
}

export const RayosXModule: React.FC<RayosXModuleProps> = ({ studies }) => {
  const [selectedStudy, setSelectedStudy] = useState<ImagingStudy>(studies[0]);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);

  const resetViewer = () => {
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="neo-badge neo-badge-blue">
              <span className="neo-badge-dot" style={{ background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }}></span>
              IMAGENOLOGÍA DE ALTA DEFINICIÓN
            </span>
            <span className="text-xs text-blue-200 font-bold font-mono tracking-wider drop-shadow-sm">TOMOGRAFÍA, RESONANCIA Y HEMODINAMIA</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">Estudios Radiológicos y Visor Médico</h2>
          <p className="text-slate-100 text-sm mt-1 font-medium leading-relaxed drop-shadow-sm">
            Interpretación diagnóstica con herramientas de visualización de brillo, contraste e inversión negativa.
          </p>
        </div>
      </div>

      {/* Selector de Estudio */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {studies.map((study) => (
          <div
            key={study.id}
            onClick={() => {
              setSelectedStudy(study);
              resetViewer();
            }}
            className={`p-3.5 rounded-2xl cursor-pointer border min-w-[240px] transition-all ${
              selectedStudy.id === study.id
                ? 'border-blue-500 bg-blue-950/40 shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                : 'border-white/10 bg-slate-900/40 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-cyan-400 font-bold">{study.studyFolio}</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-300">
                {study.modality.replace('_', ' ')}
              </span>
            </div>
            <h4 className="font-bold text-sm text-white mt-1 truncate">{study.patientName}</h4>
            <span className="text-xs text-slate-400 block mt-1">{study.bodyPart}</span>
          </div>
        ))}
      </div>

      {/* Visor Médico Interactivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lienzo del Estudio (2 spans) */}
        <div className="lg:col-span-2 neo-glass-panel p-6 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden bg-black/80 border border-white/15">
          {/* Barra de Controles Táctiles Superiores */}
          <div className="neo-action-bar absolute top-4 z-10">
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))} 
              className="neo-icon-btn" 
              title="Aumentar Zoom"
            >
              <ZoomIn size={16} />
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))} 
              className="neo-icon-btn" 
              title="Reducir Zoom"
            >
              <ZoomOut size={16} />
            </button>
            <button 
              onClick={() => setIsInverted(prev => !prev)} 
              className={`neo-icon-btn ${isInverted ? 'neo-icon-btn-active' : ''}`} 
              title="Invertir Negativo Radiológico"
            >
              <Contrast size={16} />
            </button>
            <button 
              onClick={resetViewer} 
              className="neo-icon-btn" 
              title="Restablecer"
            >
              <RotateCw size={16} />
            </button>
          </div>

          {/* Imagen Simulada Radiológica de Alta Precisión */}
          <div 
            className="w-full h-80 flex items-center justify-center transition-all duration-200"
            style={{
              transform: `scale(${zoom})`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`,
            }}
          >
            <div className="relative w-72 h-72 rounded-3xl bg-slate-950 border-2 border-cyan-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.2)]">
              {/* Representación Anatómica Vectorial */}
              <div className="text-center p-4">
                <div className="w-36 h-36 mx-auto rounded-full border-4 border-dashed border-cyan-400/40 flex items-center justify-center animate-pulse">
                  <span className="text-4xl">🫀</span>
                </div>
                <span className="text-xs font-mono text-cyan-300 block mt-3 font-bold">
                  {selectedStudy.bodyPart}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  CORTE AXIAL 1.25mm | TC MULTICORTE
                </span>
              </div>

              {/* Marcas de Orientación Radiológica */}
              <span className="absolute top-2 left-3 text-[10px] font-mono text-cyan-400/60 font-bold">R</span>
              <span className="absolute top-2 right-3 text-[10px] font-mono text-cyan-400/60 font-bold">L</span>
              <span className="absolute bottom-2 left-3 text-[10px] font-mono text-cyan-400/60 font-bold">A</span>
              <span className="absolute bottom-2 right-3 text-[10px] font-mono text-cyan-400/60 font-bold">P</span>
            </div>
          </div>

          {/* Controles Deslizantes Inferiores de Brillo y Contraste */}
          <div className="w-full max-w-md mt-6 grid grid-cols-2 gap-4 bg-slate-900/90 p-3 rounded-2xl border border-white/10">
            <div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                <Sun size={12} /> Brillo ({brightness}%)
              </span>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="neo-slider"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                <Contrast size={12} /> Contraste ({contrast}%)
              </span>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="neo-slider"
              />
            </div>
          </div>
        </div>

        {/* Dictamen e Interpretación Médica */}
        <div className="neo-glass-panel p-6 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <span className="text-xs font-mono text-cyan-400 font-bold">{selectedStudy.studyFolio}</span>
            <h3 className="text-lg font-bold text-white mt-0.5">{selectedStudy.patientName}</h3>
            <span className="text-xs text-slate-400">{selectedStudy.modality.replace('_', ' ')} — {selectedStudy.bodyPart}</span>
          </div>

          <div>
            <strong className="text-xs font-bold text-slate-300 uppercase block mb-1">Indicación Clínica:</strong>
            <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              {selectedStudy.clinicalIndication}
            </p>
          </div>

          <div>
            <strong className="text-xs font-bold text-slate-300 uppercase block mb-1">Interpretación Radiológica:</strong>
            <div className="text-xs text-slate-200 bg-slate-900/80 p-3.5 rounded-2xl border border-blue-500/20 leading-relaxed font-sans">
              {selectedStudy.radiologistInterpretation || 'Estudio en proceso de interpretación por médico radiólogo.'}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-white">{selectedStudy.radiologistName || 'Dr. Javier Santana Lamas'}</div>
              <span className="text-slate-400 text-[11px]">Céd. Profesional: {selectedStudy.radiologistLicense || '4567890'}</span>
            </div>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck size={16} /> Firmado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
