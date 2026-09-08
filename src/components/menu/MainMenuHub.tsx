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
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#e11d48',
      glowColor: 'rgba(225, 29, 72, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
      iconShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
      badge: urgentCount > 0 ? `${urgentCount} Urgencias Activas` : 'Atención Inmediata',
      badgeBg: '#ffe4e6',
      badgeColor: '#9f1239',
      badgeBorder: '#fca5a5',
      norm: 'NOM-004 / NOM-024',
      tag: 'Urgencias 24/7'
    },
    {
      id: 'admision_programada',
      title: 'Admisión Programada',
      subtitle: 'Cirugías Electivas & Procedimientos',
      icon: CalendarCheck,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: '3 Programadas Hoy',
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
      norm: 'Ayuno & Hemodinamia',
      tag: 'Quirófanos'
    },
    {
      id: 'consultorios',
      title: 'Consultorios ECE',
      subtitle: 'Expediente Clínico Electrónico',
      icon: Stethoscope,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: 'Consulta Externa',
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
      norm: 'NOM-024-SSA3-2012',
      tag: 'Especialidades'
    },
    {
      id: 'hospitalizacion',
      title: 'Hospitalización y Camas',
      subtitle: 'Censo UCI, UCIN, Terapia y Pisos',
      icon: Bed,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: `${occupiedBeds}/${totalBeds} Camas Ocupadas`,
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
      norm: 'Censo en Tiempo Real',
      tag: 'Enfermería Piso'
    },
    {
      id: 'farmacia',
      title: 'Farmacia Hospitalaria',
      subtitle: 'Dispensación y Kárdex Clínico',
      icon: Pill,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: 'Psicotrópicos Fracc. I',
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
      norm: 'Lotes & Caducidades',
      tag: 'Abasto Clínico'
    },
    {
      id: 'laboratorio',
      title: 'Laboratorio Clínico',
      subtitle: 'Química, Hemometría & Troponinas',
      icon: FlaskConical,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: 'Validación QFB en Línea',
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
      norm: 'NOM-007-SSA3-2011',
      tag: 'Diagnóstico'
    },
    {
      id: 'rayosx',
      title: 'Rayos X e Imagen',
      subtitle: 'Tomografía, Ultrasonido y TAC',
      icon: Eye,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: 'Visor DICOM Digital',
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
      norm: 'PACS Hospitalario',
      tag: 'Imagenología'
    },
    {
      id: 'caja',
      title: 'Caja y Cobro',
      subtitle: 'Facturación, Seguros & Cortes',
      icon: DollarSign,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: 'GNP / AXA / MetLife',
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
      norm: 'CFDI 4.0 Hospitalario',
      tag: 'Financiero'
    },
    {
      id: 'ceye',
      title: 'CEYE Quirófano',
      subtitle: 'Esterilización e Instrumental',
      icon: ShieldCheck,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: 'Trazabilidad Storz',
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
      norm: 'NOM-016-SSA3-2012',
      tag: 'Esterilización'
    },
    {
      id: 'chat',
      title: 'Chat Médico & Códigos',
      subtitle: 'Comunicación Tipo WhatsApp',
      icon: MessageSquare,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: 'Código Infarto Activo',
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
      norm: 'Cifrado End-to-End',
      tag: 'Canal Clínico'
    },
    {
      id: 'personal',
      title: 'Personal & Turnos',
      subtitle: 'Gestión Médica, Guardias y Roles',
      icon: Users,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: 'Turno Matutino',
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
      norm: 'Control de Asistencias',
      tag: 'Recursos Humanos'
    },
    {
      id: 'dashboard',
      title: 'Dashboard Ejecutivo',
      subtitle: 'Métricas, Ocupación y Monitoreo Global',
      icon: LayoutDashboard,
      cardBg: 'linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)',
      cardBorder: 'rgba(226, 232, 240, 0.95)',
      cardAccent: '#0284c7',
      glowColor: 'rgba(0, 242, 254, 0.4)',
      titleColor: '#0f172a',
      subColor: '#475569',
      iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e3a8a 100%)',
      iconShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
      badge: 'Visión 360° Hospitalaria',
      badgeBg: '#f1f5f9',
      badgeColor: '#0f172a',
      badgeBorder: '#cbd5e1',
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
          <p className="text-xs text-slate-300 mt-0.5">
            Haga clic en el módulo deseado para acceder de inmediato a su estación de trabajo hospitalaria.
          </p>
        </div>

        {/* Badges del Sistema en Banner */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 font-mono text-[11px]">
            <Shield size={12} className="text-cyan-400" />
            <span>NOM-024 / NOM-004 Certificado</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-200 font-mono text-[11px]">
            <Clock size={12} className="text-amber-400" />
            <span>Turno Matutino</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 font-mono text-[11px]">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span>4 Nodos Sincronizados</span>
          </div>
        </div>
      </div>

      {/* Cuadrícula Táctil de Módulos Flotantes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isClicking = clickingModule === mod.id;
          return (
            <div
              key={mod.id}
              onClick={() => handleCardClick(mod.id)}
              className={`neo-tech-floating-card p-3 md:p-3.5 flex flex-col justify-between group ${
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
              {/* Encabezado de la Tarjeta */}
              <div className="relative z-10 flex items-start justify-between gap-2">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white border border-white/60 group-hover:scale-110 transition-transform shrink-0 shadow-md"
                  style={{ 
                    background: mod.iconBg,
                    boxShadow: mod.iconShadow
                  }}
                >
                  <Icon size={20} className="text-white drop-shadow-sm" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span 
                    className="text-[9px] px-2 py-0.5 rounded-full font-bold border tracking-tight flex items-center gap-1 shadow-xs"
                    style={{
                      backgroundColor: mod.badgeBg,
                      color: mod.badgeColor,
                      borderColor: mod.badgeBorder
                    }}
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: mod.cardAccent }}
                    ></span>
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

              {/* Título y Subtítulo */}
              <div className="relative z-10 mt-1.5">
                <h3 
                  className="text-xs md:text-[13px] font-black tracking-tight"
                  style={{ color: mod.titleColor }}
                >
                  {mod.title}
                </h3>
                <p 
                  className="text-[10.5px] font-bold line-clamp-1 mt-0.5"
                  style={{ color: mod.subColor }}
                >
                  {mod.subtitle}
                </p>
              </div>

              {/* Footer con Botón Píldora Blanco 3D Elevado (Referencia Exacta) */}
              <div className="relative z-10 mt-2 pt-1 flex items-center justify-between border-t border-black/5">
                <span className="text-[9.5px] font-bold opacity-75 truncate max-w-[95px]" style={{ color: mod.titleColor }}>
                  {mod.norm}
                </span>
                <div 
                  className="neo-clay-pill-btn"
                  style={{ color: mod.titleColor }}
                >
                  <span>Abrir Módulo</span>
                  <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
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
