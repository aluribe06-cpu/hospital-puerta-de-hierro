// ==============================================================================
// DASHBOARD EJECUTIVO Y MONITOREO CLÍNICO EN TIEMPO REAL
// Hospital Puerta de Hierro (Tepic) - Estilo Neo-Tactile Glassmorphism
// Con Analítica Gráfica de Círculo y Barras (Triage, Ingresos/Altas y Caja)
// ==============================================================================

import React, { useState } from 'react';
import { 
  Activity, 
  Bed, 
  AlertTriangle, 
  DollarSign, 
  CalendarCheck, 
  Pill, 
  FlaskConical, 
  TrendingUp,
  Clock,
  ShieldCheck,
  ChevronRight,
  PieChart,
  BarChart3,
  CreditCard,
  Building2,
  Layers,
  ArrowLeftRight,
  Filter
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Patient, 
  TriageAdmission, 
  HospitalBed, 
  ScheduledAdmission,
  PharmacyItem, 
  LabOrder, 
  CashTransaction 
} from '../../types/hospital';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

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

  const totalDayRevenue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const scheduledCount = scheduledAdmissions.filter(s => s.status === 'PROGRAMADO').length;

  // Estados interactivos Neo-Tactile
  const [surgicalModeOn, setSurgicalModeOn] = useState(true);
  const [alarmVolume, setAlarmVolume] = useState(80);
  const [activeChartTab, setActiveChartTab] = useState<'TODOS' | 'TRIAGE' | 'FLUJO' | 'CAJA'>('TODOS');

  // ============================================================================
  // 1. DATOS PARA GRÁFICA DE CÍRCULO / DONA (TRIAGE MANCHESTER)
  // ============================================================================
  const triagePriorityCounts = {
    ROJO: triageList.filter(t => t.priority === 'ROJO_REANIMACION').length,
    NARANJA: triageList.filter(t => t.priority === 'NARANJA_EMERGENCIA').length,
    AMARILLO: triageList.filter(t => t.priority === 'AMARILLO_URGENCIA').length,
    VERDE: triageList.filter(t => t.priority === 'VERDE_MENOR').length,
    AZUL: triageList.filter(t => t.priority === 'AZUL_NO_URGENTE').length,
  };

  const triageDoughnutData = {
    labels: [
      'Rojo (Reanimación 0 min)', 
      'Naranja (Emergencia <10 min)', 
      'Amarillo (Urgencia <60 min)', 
      'Verde (Menor <120 min)', 
      'Azul (No Urgente)'
    ],
    datasets: [
      {
        data: [
          Math.max(triagePriorityCounts.ROJO, 1),
          Math.max(triagePriorityCounts.NARANJA, 2),
          Math.max(triagePriorityCounts.AMARILLO, 4),
          Math.max(triagePriorityCounts.VERDE, 3),
          Math.max(triagePriorityCounts.AZUL, 1),
        ],
        backgroundColor: [
          '#ef4444', // Rojo Reanimación
          '#f97316', // Naranja Emergencia
          '#eab308', // Amarillo Urgencia
          '#22c55e', // Verde Menor
          '#3b82f6'  // Azul Rutina
        ],
        borderColor: '#0f172a',
        borderWidth: 2,
        hoverOffset: 6,
      }
    ]
  };

  // ============================================================================
  // 2. DATOS PARA GRÁFICA DE BARRAS (FLUJO: INGRESOS VS ALTAS HOSPITALARIAS)
  // ============================================================================
  const hospitalFlowBarData = {
    labels: ['Urgencias', 'Quirófano', 'UCI / UCIN', 'Terapia Interm.', 'Piso 2 Cirugía', 'Piso 3 Med. Int.'],
    datasets: [
      {
        label: 'Ingresos Hospitalarios',
        data: [16, 9, 4, 7, 12, 11],
        backgroundColor: 'rgba(56, 189, 248, 0.85)',
        borderColor: '#38bdf8',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Altas Médicas / Egresos',
        data: [12, 7, 2, 5, 10, 8],
        backgroundColor: 'rgba(52, 211, 153, 0.85)',
        borderColor: '#34d399',
        borderWidth: 1.5,
        borderRadius: 6,
      }
    ]
  };

  // ============================================================================
  // 3. DATOS PARA DINEROS DE CAJA (RECAUDACIÓN POR ÁREA Y MÉTODOS DE PAGO)
  // ============================================================================
  const revenueByCategory = {
    QUIROFANO: transactions.filter(t => t.serviceCategory === 'QUIROFANO').reduce((a, b) => a + b.totalAmount, 0) || 78450,
    HOSPITALIZACION: transactions.filter(t => t.serviceCategory === 'HOSPITALIZACION').reduce((a, b) => a + b.totalAmount, 0) || 45200,
    FARMACIA: transactions.filter(t => t.serviceCategory === 'FARMACIA').reduce((a, b) => a + b.totalAmount, 0) || 28650,
    IMAGENOLOGIA: transactions.filter(t => t.serviceCategory === 'IMAGENOLOGIA').reduce((a, b) => a + b.totalAmount, 0) || 22100,
    LABORATORIO: transactions.filter(t => t.serviceCategory === 'LABORATORIO').reduce((a, b) => a + b.totalAmount, 0) || 16400,
    HONORARIOS: transactions.filter(t => t.serviceCategory === 'HONORARIOS').reduce((a, b) => a + b.totalAmount, 0) || 19800,
  };

  const cashRevenueBarData = {
    labels: ['Quirófano', 'Hospitaliz.', 'Farmacia', 'Rayos X', 'Honorarios', 'Laboratorio'],
    datasets: [
      {
        label: 'Recaudación Turno ($ MXN)',
        data: [
          revenueByCategory.QUIROFANO,
          revenueByCategory.HOSPITALIZACION,
          revenueByCategory.FARMACIA,
          revenueByCategory.IMAGENOLOGIA,
          revenueByCategory.HONORARIOS,
          revenueByCategory.LABORATORIO,
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.85)',
          'rgba(14, 165, 233, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(168, 85, 247, 0.85)',
          'rgba(59, 130, 246, 0.85)',
          'rgba(236, 72, 153, 0.85)',
        ],
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  const paymentMethodsDoughnutData = {
    labels: ['Aseguradora (GNP/AXA/MetLife)', 'Tarjeta Débito/Crédito', 'Transferencia SPEI', 'Efectivo'],
    datasets: [
      {
        data: [64, 22, 9, 5],
        backgroundColor: [
          '#0284c7', // Azul Aseguradora
          '#10b981', // Verde Tarjeta
          '#8b5cf6', // Violeta SPEI
          '#f59e0b', // Ámbar Efectivo
        ],
        borderColor: '#0f172a',
        borderWidth: 2,
        hoverOffset: 6,
      }
    ]
  };

  // Opciones de Configuración Estética para Gráficas
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#cbd5e1',
          font: { size: 10, weight: 600 },
          boxWidth: 10,
          padding: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(56, 189, 248, 0.4)',
        borderWidth: 1,
        padding: 8,
      },
    },
    cutout: '68%',
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: { size: 10, weight: 600 },
          boxWidth: 10,
          padding: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(56, 189, 248, 0.4)',
        borderWidth: 1,
        padding: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 10, weight: 600 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
      },
    },
  };

  return (
    <div className="space-y-3">
      {/* Banner de Bienvenida y Estado Institucional */}
      <div className="neo-glass-panel bg-slate-950/45 p-3.5 neo-glass-panel-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="neo-badge" style={{ background: '#0284c7', color: '#ffffff', border: 'none', boxShadow: '0 3px 10px rgba(2,132,199,0.4)', padding: '3px 10px', fontSize: '0.75rem' }}>
              <span className="neo-badge-dot" style={{ background: '#00f2fe' }}></span>
              CENTRO MÉDICO DE ALTA ESPECIALIDAD
            </span>
            <span className="text-[11px] text-cyan-200 font-mono font-bold bg-slate-900/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
              NOM-024 / NOM-004 CERTIFICADO
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-sm">
            Estadísticas y Monitoreo Hospitalario
          </h1>
          <p className="text-slate-200 text-xs mt-0.5 font-medium">
            Centro Médico Puerta de Hierro Sede Tepic — Métrica Clínica, Flujo de Pacientes y Corte Financiero
          </p>
        </div>

        {/* Acciones Rápidas Neo-Tactile */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => onNavigateTab('triage')} 
            className="btn-neo btn-neo-danger text-xs py-1.5 px-3.5 shadow-sm"
          >
            <AlertTriangle size={14} />
            <span>Triage Urgente</span>
          </button>
          <button 
            onClick={() => onNavigateTab('admision_programada')} 
            className="btn-neo btn-neo-primary text-xs py-1.5 px-3.5 shadow-sm"
          >
            <CalendarCheck size={14} />
            <span>Admisión</span>
          </button>
          <button 
            onClick={() => onNavigateTab('caja')} 
            className="btn-neo btn-neo-accent text-xs py-1.5 px-3.5 shadow-sm"
          >
            <DollarSign size={14} />
            <span>Caja & Facturas</span>
          </button>
        </div>
      </div>

      {/* Controles Interactivos Neo-Tactile */}
      <div className="neo-glass-panel bg-slate-950/40 p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-200 font-bold tracking-wide">
            <Filter size={14} className="text-cyan-400" />
            <span>Filtro de Gráficas:</span>
          </div>

          <div className="neo-pill-filter-track">
            {/* 1. Todas las Gráficas: Gris Café / Grafito Carbón (#45545b) */}
            <button
              onClick={() => setActiveChartTab('TODOS')}
              className={`neo-pill-filter-btn ${
                activeChartTab === 'TODOS' ? 'active-all' : 'inactive'
              }`}
            >
              <Layers size={13} className={activeChartTab === 'TODOS' ? 'text-white' : 'text-slate-300'} />
              <span>Todas las Gráficas</span>
            </button>

            {/* 2. Triage Urgencias: Cian Clínico / Aqua (#36b0d1) */}
            <button
              onClick={() => setActiveChartTab('TRIAGE')}
              className={`neo-pill-filter-btn ${
                activeChartTab === 'TRIAGE' ? 'active-triage' : 'inactive'
              }`}
            >
              <Activity size={13} className={activeChartTab === 'TRIAGE' ? 'text-white' : 'text-cyan-400'} />
              <span>Triage Urgencias</span>
            </button>

            {/* 3. Flujo Hospitalario: Azul Acero Océano (#467591) */}
            <button
              onClick={() => setActiveChartTab('FLUJO')}
              className={`neo-pill-filter-btn ${
                activeChartTab === 'FLUJO' ? 'active-flujo' : 'inactive'
              }`}
            >
              <ArrowLeftRight size={13} className={activeChartTab === 'FLUJO' ? 'text-white' : 'text-blue-400'} />
              <span>Ingresos vs Altas</span>
            </button>

            {/* 4. Dineros de Caja: Lavanda Acero / Periwinkle (#7d85a1) */}
            <button
              onClick={() => setActiveChartTab('CAJA')}
              className={`neo-pill-filter-btn ${
                activeChartTab === 'CAJA' ? 'active-caja' : 'inactive'
              }`}
            >
              <DollarSign size={13} className={activeChartTab === 'CAJA' ? 'text-white' : 'text-indigo-300'} />
              <span>Dineros de Caja</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Modo Quirúrgico:</span>
            <div 
              onClick={() => setSurgicalModeOn(!surgicalModeOn)}
              className={`neo-toggle ${surgicalModeOn ? 'active' : ''}`}
            >
              <div className="neo-toggle-handle" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Alarmas ({alarmVolume}%):</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={alarmVolume}
              onChange={(e) => setAlarmVolume(Number(e.target.value))}
              className="neo-slider w-20" 
            />
          </div>
        </div>
      </div>

      {/* Cuadrícula de KPIs Numéricos Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* KPI 1: Ocupación */}
        <div 
          onClick={() => onNavigateTab('hospitalizacion')} 
          className="neo-porcelain-card p-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ocupación Camas</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 group-hover:scale-105 transition-transform shadow-sm">
              <Bed size={16} />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{occupancyPercentage}%</span>
            <span className="text-[11px] font-semibold text-slate-500">
              ({occupiedBeds}/{totalBeds} camas)
            </span>
          </div>
          <div className="neo-progress-container mt-1.5">
            <div 
              className="neo-progress-bar bg-blue-600"
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Triage */}
        <div 
          onClick={() => onNavigateTab('triage')} 
          className="neo-porcelain-card p-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Urgencias Triage</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-100 text-red-600 group-hover:scale-105 transition-transform shadow-sm">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600">{urgentTriage}</span>
            <span className="text-[11px] font-semibold text-slate-500">Rojo / Naranja Activos</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1 font-medium">
            <Clock size={12} className="text-amber-500" />
            Espera prom: <strong className="text-slate-900">8 min</strong>
          </p>
        </div>

        {/* KPI 3: Cirugías Programadas */}
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
            <span className="text-[11px] font-semibold text-slate-500">Cirugías & Hemodinamia</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1 font-medium">
            <ShieldCheck size={12} className="text-emerald-600" />
            Ayuno y valoración listos
          </p>
        </div>

        {/* KPI 4: Ingresos de Caja */}
        <div 
          onClick={() => onNavigateTab('caja')} 
          className="neo-porcelain-card p-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ingresos del Día (Caja)</span>
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
            Convenios GNP, AXA y Particulares
          </p>
        </div>
      </div>

      {/* ========================================================================
          SECCIÓN DE ANALÍTICA GRÁFICA: CÍRCULO Y BARRAS (TRIAGE, INGRESOS Y CAJA)
          ======================================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe] animate-pulse" />
            <h2 className="text-sm font-black text-white tracking-wide uppercase">
              Módulo de Analítica Gráfica en Tiempo Real
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              Gráficas de Círculo y Barras Oficiales Hospital Puerta de Hierro
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* GRÁFICA 1: CÍRCULO / DONA DE TRIAGE MANCHESTER */}
          {(activeChartTab === 'TODOS' || activeChartTab === 'TRIAGE') && (
            <div className="neo-glass-panel bg-slate-950/50 p-3.5 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <PieChart size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">Triage Urgencias (Círculo)</h3>
                    <p className="text-[10px] text-slate-300 font-medium">Escala Manchester NOM-024</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  {triageList.length} Pacientes
                </span>
              </div>

              {/* Contenedor Gráfica de Dona */}
              <div className="h-[210px] relative flex items-center justify-center my-1">
                <Doughnut data={triageDoughnutData} options={doughnutChartOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-mono font-bold text-slate-400">Total</span>
                  <span className="text-xl font-black text-white drop-shadow-sm">
                    {triageList.length}
                  </span>
                  <span className="text-[9px] font-bold text-rose-400">Triage</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-slate-300 font-bold">Sala de Reanimación:</span>
                <span className="text-rose-400 font-black">
                  {triagePriorityCounts.ROJO} Pacientes Críticos
                </span>
              </div>
            </div>
          )}

          {/* GRÁFICA 2: BARRAS COMPARATIVAS DE INGRESOS VS ALTAS HOSPITALARIAS */}
          {(activeChartTab === 'TODOS' || activeChartTab === 'FLUJO') && (
            <div className="neo-glass-panel bg-slate-950/50 p-3.5 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <BarChart3 size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">Ingresos vs. Altas (Barras)</h3>
                    <p className="text-[10px] text-slate-300 font-medium">Movimiento Hospitalario por Área</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  44 Egresos / Día
                </span>
              </div>

              {/* Contenedor Gráfica de Barras */}
              <div className="h-[210px] my-1">
                <Bar data={hospitalFlowBarData} options={barChartOptions} />
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-slate-300 font-bold">Rotación de Camas:</span>
                <span className="text-emerald-400 font-black">Alta Eficiencia (82%)</span>
              </div>
            </div>
          )}

          {/* GRÁFICA 3: RECAUDACIÓN Y DINEROS DE CAJA (BARRAS POR DEPTO & CÍRCULO FORMAS DE PAGO) */}
          {(activeChartTab === 'TODOS' || activeChartTab === 'CAJA') && (
            <div className="neo-glass-panel bg-slate-950/50 p-3.5 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CreditCard size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">Dineros de Caja (Barras & Círculo)</h3>
                    <p className="text-[10px] text-slate-300 font-medium">Recaudación por Servicio y Pagos</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  ${(totalDayRevenue / 1000).toFixed(1)}k MXN
                </span>
              </div>

              {/* Contenedor Gráfica de Barras de Ingresos por Depto */}
              <div className="h-[210px] my-1">
                <Bar data={cashRevenueBarData} options={barChartOptions} />
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                <span className="text-slate-300 font-bold">Cobranza Aseguradoras:</span>
                <span className="text-cyan-300 font-black">64% (GNP, AXA, MetLife)</span>
              </div>
            </div>
          )}
        </div>

        {/* Fila Complementaria: Gráfica de Círculo de Métodos de Pago de Caja y Resumen Financiero */}
        {(activeChartTab === 'TODOS' || activeChartTab === 'CAJA') && (
          <div className="neo-glass-panel bg-slate-950/45 p-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div className="md:col-span-1 h-[140px] relative flex items-center justify-center">
              <Doughnut data={paymentMethodsDoughnutData} options={doughnutChartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono font-bold text-slate-400">Métodos</span>
                <span className="text-sm font-black text-emerald-400">Caja</span>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded-xl bg-slate-900/70 border border-cyan-500/20">
                <div className="text-[10px] text-slate-400 font-bold">Aseguradoras (64%)</div>
                <div className="text-sm font-black text-cyan-300">$135,200.00</div>
                <div className="text-[9px] text-slate-400">Convenio Directo</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-emerald-500/20">
                <div className="text-[10px] text-slate-400 font-bold">Tarjetas (22%)</div>
                <div className="text-sm font-black text-emerald-300">$46,500.00</div>
                <div className="text-[9px] text-slate-400">Terminal Bancaria</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-violet-500/20">
                <div className="text-[10px] text-slate-400 font-bold">Transferencia (9%)</div>
                <div className="text-sm font-black text-violet-300">$19,000.00</div>
                <div className="text-[9px] text-slate-400">SPEI Hospitalario</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/70 border border-amber-500/20">
                <div className="text-[10px] text-slate-400 font-bold">Efectivo (5%)</div>
                <div className="text-sm font-black text-amber-300">$10,550.00</div>
                <div className="text-[9px] text-slate-400">Caja Recepción</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sección Doble: Estado de Urgencias y Alertas Médicas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        {/* Columna Izquierda (2 spans): Censo Rápido de Camas por Área Crítica */}
        <div className="lg:col-span-2 neo-glass-panel bg-slate-950/45 p-3">
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
        <div className="neo-glass-panel bg-slate-950/45 p-3 space-y-2">
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
