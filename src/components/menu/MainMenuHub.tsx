import React, { useState } from 'react';
import { 
  Activity, 
  CalendarCheck, 
  Stethoscope, 
  Bed, 
  Pill, 
  FlaskConical, 
  Eye, 
  DollarSign, 
  ShieldCheck, 
  MessageSquare, 
  Users, 
  LayoutDashboard,
  Clock,
  CheckCircle2,
  ChevronRight,
  Shield,
  Zap,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { UserProfile, TriageAdmission, HospitalBed } from '../../types/hospital';

interface MainMenuHubProps {
  currentUser: UserProfile;
  triageList: TriageAdmission[];
  beds: HospitalBed[];
  onSelectModule: (moduleId: string) => void;
}

export const MainMenuHub: React.FC<MainMenuHubProps> = ({
  currentUser,
  triageList,
  beds,
  onSelectModule,
}) => {
  const [clickingModule, setClickingModule] = useState<string | null>(null);

  const urgentCount = triageList.filter(t => t.priority === 'ROJO_REANIMACION' || t.priority === 'NARANJA_EMERGENCIA').length;
  const occupiedBeds = beds.filter(b => b.status === 'OCUPADA').length;
  const totalBeds = beds.length;

  const handleCardClick = (modId: string) => {
    setClickingModule(modId);
    setTimeout(() => {
      onSelectModule(modId);
    }, 180);
  };

  const modules = [
    {
      id: 'triage',
      title: 'Triage Urgencias',
      subtitle: 'Clasificación Manchester & Choque',
      icon: Activity,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #fff1f2 100%)',
      cardBorder: 'rgba(244, 63, 94, 0.35)',
      cardAccent: '#e11d48',
      glowColor: 'rgba(225, 29, 72, 0.35)',
      titleColor: '#9f1239',
      subColor: '#be123c',
      iconBg: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
      iconShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
      badge: urgentCount > 0 ? `${urgentCount} Urgencias Activas` : 'Atención Inmediata',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      badgeDot: 'bg-rose-600',
      norm: 'NOM-004 / NOM-024',
      tag: 'Urgencias 24/7'
    },
    {
      id: 'admision_programada',
      title: 'Admisión Programada',
      subtitle: 'Cirugías Electivas & Procedimientos',
      icon: CalendarCheck,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #ecfeff 100%)',
      cardBorder: 'rgba(6, 182, 212, 0.35)',
      cardAccent: '#0891b2',
      glowColor: 'rgba(6, 182, 212, 0.35)',
      titleColor: '#0e7490',
      subColor: '#155e75',
      iconBg: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
      iconShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
      badge: '3 Programadas Hoy',
      badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      badgeDot: 'bg-cyan-600',
      norm: 'Ayuno & Hemodinamia',
      tag: 'Quirófanos'
    },
    {
      id: 'consultorios',
      title: 'Consultorios ECE',
      subtitle: 'Expediente Clínico Electrónico',
      icon: Stethoscope,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #eff6ff 100%)',
      cardBorder: 'rgba(37, 99, 235, 0.35)',
      cardAccent: '#2563eb',
      glowColor: 'rgba(37, 99, 235, 0.35)',
      titleColor: '#1e40af',
      subColor: '#1d4ed8',
      iconBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      iconShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
      badge: 'Consulta Externa',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      badgeDot: 'bg-blue-600',
      norm: 'NOM-024-SSA3-2012',
      tag: 'Especialidades'
    },
    {
      id: 'hospitalizacion',
      title: 'Hospitalización y Camas',
      subtitle: 'Censo UCI, UCIN, Terapia y Pisos',
      icon: Bed,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #fff7ed 100%)',
      cardBorder: 'rgba(249, 115, 22, 0.35)',
      cardAccent: '#ea580c',
      glowColor: 'rgba(234, 88, 12, 0.35)',
      titleColor: '#9a3412',
      subColor: '#c2410c',
      iconBg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
      iconShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
      badge: `${occupiedBeds}/${totalBeds} Camas Ocupadas`,
      badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
      badgeDot: 'bg-orange-600',
      norm: 'Censo en Tiempo Real',
      tag: 'Enfermería Piso'
    },
    {
      id: 'farmacia',
      title: 'Farmacia Hospitalaria',
      subtitle: 'Dispensación y Kárdex Clínico',
      icon: Pill,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #fffbeb 100%)',
      cardBorder: 'rgba(245, 158, 11, 0.35)',
      cardAccent: '#d97706',
      glowColor: 'rgba(245, 158, 11, 0.35)',
      titleColor: '#92400e',
      subColor: '#b45309',
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      iconShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
      badge: 'Psicotrópicos Fracc. I',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeDot: 'bg-amber-600',
      norm: 'Lotes & Caducidades',
      tag: 'Abasto Clínico'
    },
    {
      id: 'laboratorio',
      title: 'Laboratorio Clínico',
      subtitle: 'Química, Hemometría & Troponinas',
      icon: FlaskConical,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #fdf2f8 100%)',
      cardBorder: 'rgba(236, 72, 153, 0.35)',
      cardAccent: '#db2777',
      glowColor: 'rgba(236, 72, 153, 0.35)',
      titleColor: '#9d174d',
      subColor: '#be185d',
      iconBg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      iconShadow: '0 4px 14px rgba(236, 72, 153, 0.4)',
      badge: 'Validación QFB en Línea',
      badgeBg: 'bg-pink-100 text-pink-900 border-pink-300',
      badgeDot: 'bg-pink-600',
      norm: 'NOM-007-SSA3-2011',
      tag: 'Diagnóstico'
    },
    {
      id: 'rayosx',
      title: 'Rayos X e Imagen',
      subtitle: 'Tomografía, Ultrasonido y TAC',
      icon: Eye,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #f5f3ff 100%)',
      cardBorder: 'rgba(139, 92, 246, 0.35)',
      cardAccent: '#7c3aed',
      glowColor: 'rgba(124, 58, 237, 0.35)',
      titleColor: '#5b21b6',
      subColor: '#6d28d9',
      iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      iconShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
      badge: 'Visor DICOM Digital',
      badgeBg: 'bg-violet-100 text-violet-900 border-violet-300',
      badgeDot: 'bg-violet-600',
      norm: 'PACS Hospitalario',
      tag: 'Imagenología'
    },
    {
      id: 'caja',
      title: 'Caja y Cobro',
      subtitle: 'Facturación, Seguros & Cortes',
      icon: DollarSign,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #ecfdf5 100%)',
      cardBorder: 'rgba(16, 185, 129, 0.35)',
      cardAccent: '#059669',
      glowColor: 'rgba(16, 185, 129, 0.35)',
      titleColor: '#065f46',
      subColor: '#047857',
      iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      iconShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
      badge: 'GNP / AXA / MetLife',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      badgeDot: 'bg-emerald-600',
      norm: 'CFDI 4.0 Hospitalario',
      tag: 'Financiero'
    },
    {
      id: 'ceye',
      title: 'CEYE Quirófano',
      subtitle: 'Esterilización e Instrumental',
      icon: ShieldCheck,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)',
      cardBorder: 'rgba(56, 189, 248, 0.35)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(56, 189, 248, 0.35)',
      titleColor: '#0369a1',
      subColor: '#0284c7',
      iconBg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
      iconShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
      badge: 'Trazabilidad Storz',
      badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
      badgeDot: 'bg-sky-600',
      norm: 'NOM-016-SSA3-2012',
      tag: 'Esterilización'
    },
    {
      id: 'chat',
      title: 'Chat Médico & Códigos',
      subtitle: 'Comunicación Tipo WhatsApp',
      icon: MessageSquare,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #ecfeff 100%)',
      cardBorder: 'rgba(6, 182, 212, 0.35)',
      cardAccent: '#0891b2',
      glowColor: 'rgba(6, 182, 212, 0.35)',
      titleColor: '#0f766e',
      subColor: '#155e75',
      iconBg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      iconShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
      badge: 'Código Infarto Activo',
      badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      badgeDot: 'bg-cyan-600',
      norm: 'Cifrado End-to-End',
      tag: 'Canal Clínico'
    },
    {
      id: 'personal',
      title: 'Personal & Turnos',
      subtitle: 'Gestión Médica, Guardias y Roles',
      icon: Users,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
      cardBorder: 'rgba(100, 116, 139, 0.35)',
      cardAccent: '#475569',
      glowColor: 'rgba(100, 116, 139, 0.35)',
      titleColor: '#0f172a',
      subColor: '#334155',
      iconBg: 'linear-gradient(135deg, #64748b 0%, #334155 100%)',
      iconShadow: '0 4px 14px rgba(71, 85, 105, 0.4)',
      badge: 'Turno Matutino',
      badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
      badgeDot: 'bg-slate-600',
      norm: 'Control de Asistencias',
      tag: 'Recursos Humanos'
    },
    {
      id: 'dashboard',
      title: 'Dashboard Ejecutivo',
      subtitle: 'Métricas, Ocupación y Monitoreo Global',
      icon: LayoutDashboard,
      cardBg: 'linear-gradient(145deg, #ffffff 0%, #eff6ff 100%)',
      cardBorder: 'rgba(37, 99, 235, 0.35)',
      cardAccent: '#1d4ed8',
      glowColor: 'rgba(37, 99, 235, 0.35)',
      titleColor: '#1e3a8a',
      subColor: '#1d4ed8',
      iconBg: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      iconShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
      badge: 'Visión 360° Hospitalaria',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeDot: 'bg-blue-600',
      norm: 'KPIs en Tiempo Real',
      tag: 'Dirección Médica'
    },
  ];

  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      {/* Banner de Bienvenida y Estado del Menú Principal */}
      <div className="neo-glass-panel p-3 md:p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2fe] animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={12} className="text-cyan-400" />
              Menú Principal de Servicios Clínicos
            </span>
            <span className="hidden sm:inline text-xs text-slate-400">•</span>
            <span className="hidden sm:inline text-[11px] text-slate-300 font-medium">
              Centro Médico Puerta de Hierro Tepic
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-white tracking-tight mt-0.5">
            Bienvenido, {currentUser.fullName}
          </h1>
          <p className="text-xs text-slate-300">
            Haga clic en el módulo deseado para acceder de inmediato a su estación de trabajo hospitalaria.
          </p>
        </div>

        {/* Badges de Enlace Rápido y Cumplimiento Normativo */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-start md:justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 border border-cyan-400/35 text-xs shadow-md">
            <Shield size={14} className="text-cyan-400" />
            <span className="text-[11px] font-bold text-slate-200">NOM-024 / NOM-004 Certificado</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 border border-white/15 text-xs shadow-md">
            <Clock size={14} className="text-amber-400" />
            <span className="text-[11px] font-bold text-slate-200">Turno Matutino</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/85 border border-emerald-500/40 text-xs text-emerald-300 shadow-md font-bold">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>4 Nodos Sincronizados</span>
          </div>
        </div>
      </div>

      {/* Cuadrícula Táctil de Módulos Flotantes con Colores Pasteles y Letras de Contraste (12 Módulos) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isClicking = clickingModule === mod.id;
          return (
            <div
              key={mod.id}
              onClick={() => handleCardClick(mod.id)}
              className={`neo-tech-floating-card p-3.5 flex flex-col justify-between group ${
                isClicking ? 'card-clicking' : ''
              }`}
              style={{ 
                '--card-bg': mod.cardBg,
                '--card-border': mod.cardBorder,
                '--card-accent': mod.cardAccent,
                '--card-glow': mod.glowColor,
                minHeight: '138px' 
              } as React.CSSProperties}
            >
              {/* Barra Superior con Efecto Neón Resplandeciente */}
              <div className="neo-card-neon-strip" />

              {/* Encabezado de la Tarjeta: Icono Flotante Sólido y Píldora de Estatus */}
              <div className="relative z-10 flex items-start justify-between gap-2">
                <div 
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white border border-white/40 group-hover:scale-110 transition-transform shrink-0"
                  style={{ 
                    background: mod.iconBg,
                    boxShadow: mod.iconShadow
                  }}
                >
                  <Icon size={22} className="text-white drop-shadow-sm" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border tracking-tight flex items-center gap-1 shadow-xs ${mod.badgeBg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${mod.badgeDot} animate-pulse`}></span>
                    {mod.badge}
                  </span>
                  <span 
                    className="text-[9px] font-black tracking-wider uppercase"
                    style={{ color: mod.subColor }}
                  >
                    {mod.tag}
                  </span>
                </div>
              </div>

              {/* Título y Subtítulo con color que va de acuerdo a cada módulo */}
              <div className="relative z-10 mt-2">
                <h3 
                  className="text-xs md:text-sm font-black transition-colors flex items-center justify-between"
                  style={{ color: mod.titleColor }}
                >
                  <span>{mod.title}</span>
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 shadow-xs"
                    style={{ background: 'rgba(0, 0, 0, 0.05)', color: mod.titleColor }}
                  >
                    <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </h3>
                <p 
                  className="text-[11px] font-bold line-clamp-1 mt-0.5"
                  style={{ color: mod.subColor }}
                >
                  {mod.subtitle}
                </p>
              </div>

              {/* Footer de Tarjeta con Línea Divisoria y Enlace de Entrada */}
              <div className="relative z-10 mt-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-bold truncate">{mod.norm}</span>
                <span 
                  className="font-black group-hover:underline flex items-center gap-0.5"
                  style={{ color: mod.titleColor }}
                >
                  Abrir Módulo <ChevronRight size={11} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra Inferior Táctil de Acciones de Emergencia Rápida */}
      <div className="neo-glass-panel p-2.5 px-4 flex flex-wrap items-center justify-between gap-2 text-xs shadow-md">
        <div className="flex items-center gap-2 text-slate-300">
          <Zap size={14} className="text-amber-400" />
          <span className="font-bold text-white">Accesos Rápidos de Emergencia:</span>
          <span className="text-slate-400 hidden sm:inline">Pase directo a áreas de atención crítica inmediata</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleCardClick('triage')}
            className="neo-floating-action-btn"
            style={{
              '--btn-bg': 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
              '--btn-border': 'rgba(254, 205, 211, 0.6)',
              '--btn-glow': 'rgba(244, 63, 94, 0.65)'
            } as React.CSSProperties}
          >
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-ping shrink-0" />
            <Activity size={13} className="text-white drop-shadow-sm" />
            <span>Ingreso Triage Choque</span>
          </button>
          <button
            onClick={() => handleCardClick('chat')}
            className="neo-floating-action-btn"
            style={{
              '--btn-bg': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              '--btn-border': 'rgba(165, 243, 252, 0.6)',
              '--btn-glow': 'rgba(6, 182, 212, 0.65)'
            } as React.CSSProperties}
          >
            <MessageSquare size={13} className="text-white drop-shadow-sm" />
            <span>Código Alerta Médica</span>
          </button>
          <button
            onClick={() => handleCardClick('hospitalizacion')}
            className="neo-floating-action-btn"
            style={{
              '--btn-bg': 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
              '--btn-border': 'rgba(254, 215, 170, 0.6)',
              '--btn-glow': 'rgba(249, 115, 22, 0.65)'
            } as React.CSSProperties}
          >
            <Bed size={13} className="text-white drop-shadow-sm" />
            <span>Censo Rápido Camas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
