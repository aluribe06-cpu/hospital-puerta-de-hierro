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

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Estado Institucional */}
      <div className="neo-glass-panel p-6 neo-glass-panel-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: 'rgba(37, 99, 235, 0.2)', borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}>
              <span className="neo-badge-dot" style={{ background: '#38bdf8' }}></span>
              SISTEMA CLÍNICO ACTIVO 24/7
            </span>
            <span className="text-xs text-slate-400 font-mono">NOM-024-SSA3-2012 CERTIFICADO</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Panel de Control Hospitalario
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Centro Médico Puerta de Hierro Sede Tepic — Monitorización de Servicios y Áreas Críticas
          </p>
        </div>

        {/* Acciones Rápidas Neo-Tactile */}
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => onNavigateTab('triage')} 
            className="btn-neo btn-neo-danger text-xs md:text-sm"
          >
            <AlertTriangle size={16} />
            Nuevo Triage Urgencias
          </button>
          <button 
            onClick={() => onNavigateTab('admision_programada')} 
            className="btn-neo btn-neo-active text-xs md:text-sm"
          >
            <CalendarCheck size={16} />
            Admisión Programada
          </button>
          <button 
            onClick={() => onNavigateTab('chat')} 
            className="btn-neo btn-neo-defart text-xs md:text-sm"
          >
            💬 Chat Médico
          </button>
        </div>
      </div>

      {/* Grid de KPIs Táctiles de Alta Especialidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ocupación de Camas */}
        <div 
          onClick={() => onNavigateTab('hospitalizacion')} 
          className="neo-glass-panel p-5 cursor-pointer hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Censo de Camas</span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Bed size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{occupancyPercentage}%</span>
            <span className="text-xs text-slate-400">({occupiedBeds}/{totalBeds} ocupadas)</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ 
                width: `${occupancyPercentage}%`,
                background: occupancyPercentage > 85 ? 'linear-gradient(90deg, #f97316, #ef4444)' : 'linear-gradient(90deg, #2563eb, #06b6d4)'
              }}
            />
          </div>
          <span className="text-xs text-blue-400 flex items-center gap-1 mt-3 font-medium">
            Ver censo UCI / Pisos <ChevronRight size={14} />
          </span>
        </div>

        {/* KPI 2: Triage Manchester Activo */}
        <div 
          onClick={() => onNavigateTab('triage')} 
          className="neo-glass-panel p-5 cursor-pointer hover:border-red-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Urgencias / Triage</span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-400">{urgentTriage}</span>
            <span className="text-xs text-slate-400">Casos Rojos/Naranja</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <Clock size={12} className="text-amber-400" />
            Tiempo prom. de espera: <strong className="text-white">8 min</strong>
          </p>
          <span className="text-xs text-red-400 flex items-center gap-1 mt-3 font-medium">
            Atender en Sala de Choque <ChevronRight size={14} />
          </span>
        </div>

        {/* KPI 3: Cirugías y Admisiones Programadas */}
        <div 
          onClick={() => onNavigateTab('admision_programada')} 
          className="neo-glass-panel p-5 cursor-pointer hover:border-cyan-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Programadas Hoy</span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400">{scheduledCount}</span>
            <span className="text-xs text-slate-400">Electivas y Hemodinamia</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" />
            Ayuno y valoración verificados
          </p>
          <span className="text-xs text-cyan-400 flex items-center gap-1 mt-3 font-medium">
            Ver Quirófanos y Horarios <ChevronRight size={14} />
          </span>
        </div>

        {/* KPI 4: Ingresos y Facturación Hospitalaria */}
        <div 
          onClick={() => onNavigateTab('caja')} 
          className="neo-glass-panel p-5 cursor-pointer hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos del Día</span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-emerald-400">
              ${totalDayRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-400" />
            Convenios GNP, AXA y Particulares
          </p>
          <span className="text-xs text-emerald-400 flex items-center gap-1 mt-3 font-medium">
            Corte de caja de turno <ChevronRight size={14} />
          </span>
        </div>
      </div>

      {/* Sección Doble: Estado de Urgencias y Alertas Médicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2 spans): Censo Rápido de Camas por Área Crítica */}
        <div className="lg:col-span-2 neo-glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <h2 className="text-lg font-bold text-white">Monitoreo de Áreas de Alta Especialidad</h2>
            </div>
            <button 
              onClick={() => onNavigateTab('hospitalizacion')} 
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Ver Todas las Camas →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {beds.slice(0, 6).map((bed) => {
              const isOccupied = bed.status === 'OCUPADA';
              const isCleaning = bed.status === 'LIMPIEZA_DESINFECCION';
              return (
                <div 
                  key={bed.id}
                  className="p-3.5 rounded-2xl border transition-all"
                  style={{
                    background: isOccupied 
                      ? 'rgba(30, 58, 138, 0.25)' 
                      : isCleaning 
                      ? 'rgba(234, 88, 12, 0.15)' 
                      : 'rgba(15, 23, 42, 0.4)',
                    borderColor: isOccupied 
                      ? 'rgba(59, 130, 246, 0.4)' 
                      : isCleaning 
                      ? 'rgba(234, 88, 12, 0.4)' 
                      : 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-white">{bed.bedNumber}</span>
                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                      style={{
                        background: isOccupied ? 'rgba(59, 130, 246, 0.2)' : isCleaning ? 'rgba(234, 88, 12, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: isOccupied ? '#60a5fa' : isCleaning ? '#fb923c' : '#34d399'
                      }}
                    >
                      {bed.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    {bed.area.replace(/_/g, ' ')}
                  </div>
                  {bed.currentPatientName ? (
                    <div className="mt-2 text-xs font-semibold text-white truncate">
                      👤 {bed.currentPatientName}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-slate-500 italic">
                      Lista para ingreso
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Alertas de Laboratorio y Farmacia */}
        <div className="neo-glass-panel p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            Alertas Críticas Activas
          </h2>

          {/* Alerta de Laboratorio */}
          <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
              <FlaskConical size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-red-300">Troponina I Positiva (450.2 pg/mL)</div>
              <p className="text-xs text-slate-300 mt-0.5">Don Roberto González (IAM en evolución) — Sala de Choque / Hemodinamia.</p>
              <span className="text-[10px] text-red-400 font-mono mt-1 block">Validado por QFB Zepeda</span>
            </div>
          </div>

          {/* Alerta de CEYE */}
          <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-300">Instrumental Laparoscopía Listo</div>
              <p className="text-xs text-slate-300 mt-0.5">Set Storz con indicador biológico negativo entregado a Quirófano 02.</p>
              <span className="text-[10px] text-blue-400 font-mono mt-1 block">Téc. Beltrán (CEYE)</span>
            </div>
          </div>

          {/* Alerta de Farmacia */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Pill size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">Control de Psicotrópicos Fracc. I</div>
              <p className="text-xs text-slate-300 mt-0.5">Fentanilo en stock de seguridad (18 amp). Reabastecer quirófanos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
