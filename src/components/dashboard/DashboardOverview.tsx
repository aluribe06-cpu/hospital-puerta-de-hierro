// ==============================================================================
// DASHBOARD EJECUTIVO Y MONITOREO CLÍNICO EN TIEMPO REAL
// Hospital Puerta de Hierro (Tepic) - Estilo Neo-Tactile Glassmorphism
// ==============================================================================

import React from 'react';
import { 
  Activity, 
  Bed, 
  AlertTriangle, 
  DollarSign, 
  CalendarCheck, 
  Pill, 
  FlaskConical, 
  FileText, 
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  Patient, 
  TriageAdmission, 
  HospitalBed, 
  ScheduledAdmission,
  PharmacyItem, 
  LabOrder, 
  CashTransaction 
} from '../../types/hospital';

interface DashboardOverviewProps {
  patients: Patient[];
  triageList: TriageAdmission[];
  beds: HospitalBed[];
  scheduledAdmissions: ScheduledAdmission[];
  pharmacy: PharmacyItem[];
  labOrders: LabOrder[];
  transactions: CashTransaction[];
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  patients,
  triageList,
  beds,
  scheduledAdmissions,
  pharmacy,
  labOrders,
  transactions,
  onNavigateTab,
}) => {
  // Cálculos de KPIs
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'OCUPADA').length;
  const occupancyPercentage = Math.round((occupiedBeds / totalBeds) * 100);

  const urgentTriage = triageList.filter(
    t => t.priority === 'ROJO_REANIMACION' || t.priority === 'NARANJA_EMERGENCIA'
  ).length;

  const pendingLab = labOrders.filter(l => l.status !== 'VALIDADO_QFB').length;
  const lowStockDrugs = pharmacy.filter(p => p.stockCurrent <= p.stockMinimum).length;

  const totalDayRevenue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const scheduledCount = scheduledAdmissions.filter(s => s.status === 'PROGRAMADO').length;

  // Estados interactivos Neo-Tactile (Controles idénticos a la imagen de referencia)
  const [surgicalModeOn, setSurgicalModeOn] = React.useState(true);
  const [alarmVolume, setAlarmVolume] = React.useState(80);
  const [selectedService, setSelectedService] = React.useState('TODOS');

  return (
    <div className="space-y-2.5">
      {/* Banner de Bienvenida y Estado Institucional */}
      <div className="neo-glass-panel p-3.5 neo-glass-panel-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: '#2563eb', color: '#ffffff', border: 'none', boxShadow: '0 3px 10px rgba(37,99,235,0.4)', padding: '3px 10px', fontSize: '0.75rem' }}>
              <span className="neo-badge-dot" style={{ background: '#00f2fe' }}></span>
              SISTEMA CLÍNICO ACTIVO 24/7
            </span>
            <span className="text-[11px] text-slate-800 font-mono font-bold bg-white/70 px-2 py-0.5 rounded-full shadow-sm">
              NOM-024-SSA3-2012 CERTIFICADO
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
            Panel de Control Hospitalario
          </h1>
          <p className="text-slate-700 text-xs mt-0.5 font-medium">
            Centro Médico Puerta de Hierro Sede Tepic — Monitorización de Servicios y Áreas Críticas
          </p>
        </div>

        {/* Acciones Rápidas Neo-Tactile */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => onNavigateTab('triage')} 
            className="btn-neo btn-neo-danger text-xs py-1.5 px-3.5"
          >
            <AlertTriangle size={14} />
            Nuevo Triage
          </button>
          <button 
            onClick={() => onNavigateTab('admision_programada')} 
            className="btn-neo btn-neo-active text-xs py-1.5 px-3.5"
          >
            <CalendarCheck size={14} />
            Admisión
          </button>
          <button 
            onClick={() => onNavigateTab('chat')} 
            className="btn-neo btn-neo-defart text-xs py-1.5 px-3.5"
          >
            💬 Chat
          </button>
        </div>
      </div>

      {/* CLUSTER DE CONTROLES NEO-TACTILE (Idéntico a la imagen de referencia del usuario) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* Componente 1: Tarjeta Porcelana Blanca 'Colded' con Selector Táctil */}
        <div className="neo-porcelain-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-extrabold text-slate-800">Servicio Activo</span>
            <span className="text-[10px] font-mono text-slate-400">▼</span>
          </div>
          <select 
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="neo-porcelain-input text-xs py-1.5 px-2.5 cursor-pointer font-bold"
          >
            <option value="TODOS">Todos los Servicios Clínicos</option>
            <option value="UCI">Unidad de Cuidados Intensivos (UCI)</option>
            <option value="URGENCIAS">Sala de Urgencias & Choque</option>
            <option value="QUIROFANOS">Quirófanos de Cirugía Mayor</option>
            <option value="HEMODINAMIA">Sala de Hemodinamia</option>
            <option value="HOSPITALIZACION">Hospitalización General</option>
          </select>
        </div>

        {/* Componente 2: Toggle Switch 'On.' y Slider de Volumen de Alarma */}
        <div className="neo-glass-panel p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-white">Monitoreo Crítico</span>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">
                {surgicalModeOn ? 'ON' : 'OFF'}
              </span>
            </div>
            {/* Toggle Switch Táctil con Pomo Blanco 3D */}
            <label className="neo-toggle" style={{ width: '52px', height: '28px' }}>
              <input 
                type="checkbox" 
                checked={surgicalModeOn} 
                onChange={(e) => setSurgicalModeOn(e.target.checked)} 
              />
              <span className="neo-toggle-track">
                <span className="neo-toggle-thumb" style={{ width: '22px', height: '22px', bottom: '2px', left: '3px' }}></span>
              </span>
            </label>
          </div>

          <div className="space-y-0.5 mt-0.5">
            <div className="flex justify-between text-[10px] text-slate-300 font-semibold">
              <span>Volumen de Alarma</span>
              <span className="text-cyan-300 font-mono">{alarmVolume}%</span>
            </div>
            {/* Slider Táctil con Pomo Blanco 3D y Riel Azul-Cian */}
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={alarmVolume} 
              onChange={(e) => setAlarmVolume(Number(e.target.value))}
              className="neo-slider" 
              style={{ height: '6px' }}
            />
          </div>
        </div>

        {/* Componente 3: Status Ring Neón, Notificación Activa y Capsule Bar */}
        <div className="neo-glass-panel p-2.5 px-3 flex items-center justify-between gap-3">
          {/* Spinner de Carga con Contador */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
              <div className="neo-loading-spinner absolute inset-0 m-auto" style={{ width: '26px', height: '26px' }}></div>
              <span className="relative z-10 text-[11px] font-mono font-black text-cyan-300">4</span>
            </div>
            <div className="shrink-0">
              <div className="text-xs font-bold text-white leading-tight">Sync NOM-024</div>
              <span className="text-[10px] text-cyan-200/80 font-medium">4 nodos en línea</span>
            </div>
          </div>

          {/* Notificación con Punto Neón Cian */}
          <div className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 flex items-center gap-1.5 shadow-md shrink-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe] animate-pulse"></span>
            <span className="text-[11px] font-bold text-white">Alerta Viva</span>
          </div>
        </div>
      </div>

      {/* Grid de KPIs Táctiles de Alta Especialidad (Tarjetas Blancas de Porcelana) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* KPI 1: Ocupación de Camas */}
        <div 
          onClick={() => onNavigateTab('hospitalizacion')} 
          className="neo-porcelain-card p-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Censo de Camas</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 group-hover:scale-105 transition-transform shadow-sm">
              <Bed size={16} />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{occupancyPercentage}%</span>
            <span className="text-[11px] font-semibold text-slate-500">({occupiedBeds}/{totalBeds} ocupadas)</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-1.5 overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ 
                width: `${occupancyPercentage}%`,
                background: occupancyPercentage > 85 ? 'linear-gradient(90deg, #f97316, #ef4444)' : 'linear-gradient(90deg, #2563eb, #06b6d4)'
              }}
            />
          </div>
          <span className="text-[11px] text-blue-600 flex items-center gap-1 mt-1.5 font-bold">
            Ver censo UCI / Pisos <ChevronRight size={12} />
          </span>
        </div>

        {/* KPI 2: Triage Manchester Activo */}
        <div 
          onClick={() => onNavigateTab('triage')} 
          className="neo-porcelain-card p-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Urgencias / Triage</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-100 text-red-600 group-hover:scale-105 transition-transform shadow-sm">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600">{urgentTriage}</span>
            <span className="text-[11px] font-semibold text-slate-500">Rojo/Naranja</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1 font-medium">
            <Clock size={12} className="text-amber-500" />
            Espera prom: <strong className="text-slate-900">8 min</strong>
          </p>
          <span className="text-[11px] text-red-600 flex items-center gap-1 mt-1 font-bold">
            Sala de Choque <ChevronRight size={12} />
          </span>
        </div>

        {/* KPI 3: Cirugías y Admisiones Programadas */}
        <div 
          onClick={() => onNavigateTab('admision_programada')} 
          className="neo-porcelain-card p-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Programadas Hoy</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-100 text-cyan-600 group-hover:scale-105 transition-transform shadow-sm">
              <CalendarCheck size={16} />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-700">{scheduledCount}</span>
            <span className="text-[11px] font-semibold text-slate-500">Electivas & Hemodin.</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1 font-medium">
            <ShieldCheck size={12} className="text-emerald-600" />
            Ayuno y valoración listos
          </p>
          <span className="text-[11px] text-cyan-600 flex items-center gap-1 mt-1 font-bold">
            Ver Quirófanos y Horarios <ChevronRight size={12} />
          </span>
        </div>

        {/* KPI 4: Ingresos y Facturación Hospitalaria */}
        <div 
          onClick={() => onNavigateTab('caja')} 
          className="neo-porcelain-card p-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ingresos del Día</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform shadow-sm">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-black text-emerald-700">
              ${totalDayRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1 font-medium">
            <TrendingUp size={12} className="text-emerald-600" />
            Convenios GNP, AXA y Partic.
          </p>
          <span className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-bold">
            Corte de caja de turno <ChevronRight size={12} />
          </span>
        </div>
      </div>

      {/* Sección Doble: Estado de Urgencias y Alertas Médicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Columna Izquierda (2 spans): Censo Rápido de Camas por Área Crítica */}
        <div className="lg:col-span-2 neo-glass-panel p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-sm font-bold text-white">Monitoreo de Áreas de Alta Especialidad</h2>
            </div>
            <button 
              onClick={() => onNavigateTab('hospitalizacion')} 
              className="text-xs text-cyan-300 hover:text-white font-bold"
            >
              Ver Todas las Camas →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {beds.slice(0, 6).map((bed) => {
              const isOccupied = bed.status === 'OCUPADA';
              const isCleaning = bed.status === 'LIMPIEZA_DESINFECCION';
              return (
                <div 
                  key={bed.id}
                  className="neo-porcelain-card p-2 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-900">{bed.bedNumber}</span>
                    <span 
                      className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase"
                      style={{
                        background: isOccupied ? '#dbeafe' : isCleaning ? '#ffedd5' : '#d1fae5',
                        color: isOccupied ? '#1d4ed8' : isCleaning ? '#c2410c' : '#047857'
                      }}
                    >
                      {bed.status === 'OCUPADA' ? 'OCUP' : bed.status === 'DISPONIBLE' ? 'DISP' : 'LIMP'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold truncate mt-1">
                    {bed.area.replace(/_/g, ' ')}
                  </div>
                  {bed.currentPatientName ? (
                    <div className="mt-1 text-[10px] font-bold text-slate-800 truncate" title={bed.currentPatientName}>
                      👤 {bed.currentPatientName.split(' ')[0]}
                    </div>
                  ) : (
                    <div className="mt-1 text-[10px] text-emerald-600 font-semibold italic">
                      Disponible
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Alertas de Laboratorio y Farmacia */}
        <div className="neo-glass-panel p-3 space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-400" />
            Alertas Críticas Activas
          </h2>

          <div className="space-y-1.5">
            {/* Alerta de Laboratorio */}
            <div className="neo-porcelain-card p-2 flex items-center gap-2.5 border-l-4 border-l-red-500">
              <div className="p-1.5 rounded-lg bg-red-100 text-red-600 shrink-0">
                <FlaskConical size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-red-600 truncate">Troponina I Positiva (450.2 pg/mL)</div>
                <p className="text-[10px] text-slate-700 font-medium truncate">Don Roberto Glez. (IAM) — Choque</p>
              </div>
              <span className="text-[9px] text-red-700 font-mono font-black shrink-0">QFB</span>
            </div>

            {/* Alerta de CEYE */}
            <div className="neo-porcelain-card p-2 flex items-center gap-2.5 border-l-4 border-l-blue-500">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                <ShieldCheck size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-blue-600 truncate">Instrumental Laparoscopía Listo</div>
                <p className="text-[10px] text-slate-700 font-medium truncate">Set Storz biológico (-) a Quirófano 02</p>
              </div>
              <span className="text-[9px] text-blue-700 font-mono font-black shrink-0">CEYE</span>
            </div>

            {/* Alerta de Farmacia */}
            <div className="neo-porcelain-card p-2 flex items-center gap-2.5 border-l-4 border-l-amber-500">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                <Pill size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-amber-600 truncate">Psicotrópicos Fracc. I</div>
                <p className="text-[10px] text-slate-700 font-medium truncate">Fentanilo en stock de seg. (18 amp)</p>
              </div>
              <span className="text-[9px] text-amber-700 font-mono font-black shrink-0">FARM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
