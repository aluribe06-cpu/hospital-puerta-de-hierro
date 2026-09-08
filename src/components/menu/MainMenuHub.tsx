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
      stepNumber: '01',
      title: 'Triage Urgencias',
      subtitle: 'Clasificación Manchester & Choque',
      icon: Activity,
      folderBg: 'linear-gradient(150deg, #6fd2e6 0%, #4faccc 50%, #328ea9 100%)',
      folderAccent: '#36b0d1',
      folderGlow: 'rgba(79, 172, 204, 0.45)',
      badgeBg: '#e0f7fa',
      badgeColor: '#0e7490',
      tagColor: '#0284c7',
      indicator: urgentCount > 0 ? 'CRÍTICO' : '100%',
      badge: urgentCount > 0 ? `${urgentCount} Urgencias Activas` : 'Atención Inmediata',
      norm: 'NOM-004 / NOM-024',
      tag: 'Urgencias 24/7'
    },
    {
      id: 'admision_programada',
      stepNumber: '02',
      title: 'Admisión Programada',
      subtitle: 'Cirugías Electivas & Procedimientos',
      icon: CalendarCheck,
      folderBg: 'linear-gradient(150deg, #9ca6c4 0%, #7d85a1 50%, #5b6480 100%)',
      folderAccent: '#7d85a1',
      folderGlow: 'rgba(125, 133, 161, 0.45)',
      badgeBg: '#eceff7',
      badgeColor: '#475569',
      tagColor: '#475569',
      indicator: '75%',
      badge: '3 Programadas Hoy',
      norm: 'Ayuno & Hemodinamia',
      tag: 'Quirófanos'
    },
    {
      id: 'consultorios',
      stepNumber: '03',
      title: 'Consultorios ECE',
      subtitle: 'Expediente Clínico Electrónico',
      icon: Stethoscope,
      folderBg: 'linear-gradient(150deg, #679ebf 0%, #467591 50%, #29516a 100%)',
      folderAccent: '#467591',
      folderGlow: 'rgba(70, 117, 145, 0.45)',
      badgeBg: '#e2eff7',
      badgeColor: '#1e3a8a',
      tagColor: '#2563eb',
      indicator: '50%',
      badge: 'Consulta Externa',
      norm: 'NOM-024-SSA3-2012',
      tag: 'Especialidades'
    },
    {
      id: 'hospitalizacion',
      stepNumber: '04',
      title: 'Hospitalización y Camas',
      subtitle: 'Censo UCI, UCIN, Terapia y Pisos',
      icon: Bed,
      folderBg: 'linear-gradient(150deg, #5e6e76 0%, #45545b 50%, #29363c 100%)',
      folderAccent: '#45545b',
      folderGlow: 'rgba(69, 84, 91, 0.45)',
      badgeBg: '#e6ebed',
      badgeColor: '#0f172a',
      tagColor: '#334155',
      indicator: '100%',
      badge: `${occupiedBeds}/${totalBeds} Camas Ocupadas`,
      norm: 'Censo en Tiempo Real',
      tag: 'Enfermería Piso'
    },
    {
      id: 'farmacia',
      stepNumber: '05',
      title: 'Farmacia Hospitalaria',
      subtitle: 'Dispensación y Kárdex Clínico',
      icon: Pill,
      folderBg: 'linear-gradient(150deg, #6fd2e6 0%, #4faccc 50%, #328ea9 100%)',
      folderAccent: '#36b0d1',
      folderGlow: 'rgba(79, 172, 204, 0.45)',
      badgeBg: '#e0f7fa',
      badgeColor: '#0e7490',
      tagColor: '#0284c7',
      indicator: '85%',
      badge: 'Psicotrópicos Fracc. I',
      norm: 'Lotes & Caducidades',
      tag: 'Abasto Clínico'
    },
    {
      id: 'laboratorio',
      stepNumber: '06',
      title: 'Laboratorio Clínico',
      subtitle: 'Química, Hemometría & Troponinas',
      icon: FlaskConical,
      folderBg: 'linear-gradient(150deg, #9ca6c4 0%, #7d85a1 50%, #5b6480 100%)',
      folderAccent: '#7d85a1',
      folderGlow: 'rgba(125, 133, 161, 0.45)',
      badgeBg: '#eceff7',
      badgeColor: '#475569',
      tagColor: '#475569',
      indicator: '90%',
      badge: 'Validación QFB en Línea',
      norm: 'NOM-007-SSA3-2011',
      tag: 'Diagnóstico'
    },
    {
      id: 'rayosx',
      stepNumber: '07',
      title: 'Rayos X e Imagen',
      subtitle: 'Tomografía, Ultrasonido y TAC',
      icon: Eye,
      folderBg: 'linear-gradient(150deg, #679ebf 0%, #467591 50%, #29516a 100%)',
      folderAccent: '#467591',
      folderGlow: 'rgba(70, 117, 145, 0.45)',
      badgeBg: '#e2eff7',
      badgeColor: '#1e3a8a',
      tagColor: '#2563eb',
      indicator: '65%',
      badge: 'Visor DICOM Digital',
      norm: 'PACS Hospitalario',
      tag: 'Imagenología'
    },
    {
      id: 'caja',
      stepNumber: '08',
      title: 'Caja y Cobro',
      subtitle: 'Facturación, Seguros & Cortes',
      icon: DollarSign,
      folderBg: 'linear-gradient(150deg, #5e6e76 0%, #45545b 50%, #29363c 100%)',
      folderAccent: '#45545b',
      folderGlow: 'rgba(69, 84, 91, 0.45)',
      badgeBg: '#e6ebed',
      badgeColor: '#0f172a',
      tagColor: '#334155',
      indicator: '100%',
      badge: 'GNP / AXA / MetLife',
      norm: 'CFDI 4.0 Hospitalario',
      tag: 'Financiero'
    },
    {
      id: 'ceye',
      stepNumber: '09',
      title: 'CEYE Quirófano',
      subtitle: 'Esterilización e Instrumental',
      icon: ShieldCheck,
      folderBg: 'linear-gradient(150deg, #6fd2e6 0%, #4faccc 50%, #328ea9 100%)',
      folderAccent: '#36b0d1',
      folderGlow: 'rgba(79, 172, 204, 0.45)',
      badgeBg: '#e0f7fa',
      badgeColor: '#0e7490',
      tagColor: '#0284c7',
      indicator: '100%',
      badge: 'Trazabilidad Storz',
      norm: 'NOM-016-SSA3-2012',
      tag: 'Esterilización'
    },
    {
      id: 'chat',
      stepNumber: '10',
      title: 'Chat Médico & Códigos',
      subtitle: 'Comunicación Tipo WhatsApp',
      icon: MessageSquare,
      folderBg: 'linear-gradient(150deg, #9ca6c4 0%, #7d85a1 50%, #5b6480 100%)',
      folderAccent: '#7d85a1',
      folderGlow: 'rgba(125, 133, 161, 0.45)',
      badgeBg: '#eceff7',
      badgeColor: '#475569',
      tagColor: '#475569',
      indicator: 'ACTIVO',
      badge: 'Código Infarto Activo',
      norm: 'Cifrado End-to-End',
      tag: 'Canal Clínico'
    },
    {
      id: 'personal',
      stepNumber: '11',
      title: 'Personal & Turnos',
      subtitle: 'Gestión Médica, Guardias y Roles',
      icon: Users,
      folderBg: 'linear-gradient(150deg, #679ebf 0%, #467591 50%, #29516a 100%)',
      folderAccent: '#467591',
      folderGlow: 'rgba(70, 117, 145, 0.45)',
      badgeBg: '#e2eff7',
      badgeColor: '#1e3a8a',
      tagColor: '#2563eb',
      indicator: '70%',
      badge: 'Turno Matutino',
      norm: 'Control de Asistencias',
      tag: 'Recursos Humanos'
    },
    {
      id: 'dashboard',
      stepNumber: '12',
      title: 'Dashboard Ejecutivo',
      subtitle: 'Métricas, Ocupación y Monitoreo Global',
      icon: LayoutDashboard,
      folderBg: 'linear-gradient(150deg, #5e6e76 0%, #45545b 50%, #29363c 100%)',
      folderAccent: '#45545b',
      folderGlow: 'rgba(69, 84, 91, 0.45)',
      badgeBg: '#e6ebed',
      badgeColor: '#0f172a',
      tagColor: '#334155',
      indicator: '100%',
      badge: 'Visión 360° Hospitalaria',
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

      {/* Cuadrícula Táctil con Diseño de Expedientes / Folder Tab (Inspirado en Infographic Step) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isClicking = clickingModule === mod.id;
          return (
            <div
              key={mod.id}
              onClick={() => handleCardClick(mod.id)}
              className={`neo-folder-card group ${isClicking ? 'card-clicking' : ''}`}
              style={{ 
                '--folder-bg': mod.folderBg,
                '--folder-accent': mod.folderAccent,
                '--folder-glow': mod.folderGlow,
              } as React.CSSProperties}
            >
              {/* Lado Izquierdo: Carpeta / Expediente Clínico con Pestaña Superior 3D */}
              <div className="neo-folder-left">
                {/* Pestaña Superior del Expediente (Folder Tab) */}
                <div className="neo-folder-tab" />

                {/* Encabezado del Folder: Etiqueta y Micro Icono */}
                <div className="relative z-10 flex items-center justify-between text-white/85">
                  <span className="text-[9px] font-black tracking-widest uppercase">
                    STEP
                  </span>
                  <Icon size={14} className="text-white/95 drop-shadow-xs" />
                </div>

                {/* Número Grande del Paso en Tipografía Negrita de la Referencia */}
                <div className="relative z-10 my-0.5">
                  <span className="text-3xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                    {mod.stepNumber}
                  </span>
                </div>

                {/* Barra de Progreso e Indicador Técnico con Rayas Diagonales ////// */}
                <div className="relative z-10 flex items-center gap-1.5 pt-0.5 border-t border-white/25 text-white">
                  <span className="text-[8.5px] font-mono font-black tracking-tight text-white/90 shrink-0">
                    {mod.indicator}
                  </span>
                  <div className="neo-folder-stripes flex-1 h-1.5 rounded-xs opacity-80" />
                </div>
              </div>

              {/* Lado Derecho: Repisa / Bandeja de Información Clínica en Porcelana Blanca */}
              <div className="neo-folder-right">
                {/* Cabecera de la Repisa: Badge de Servicio y Flecha ↗ */}
                <div className="relative z-10 flex items-center justify-between gap-1">
                  <span 
                    className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border shadow-2xs truncate max-w-[170px]"
                    style={{ 
                      color: mod.badgeColor, 
                      backgroundColor: mod.badgeBg,
                      borderColor: 'rgba(226, 232, 240, 0.8)' 
                    }}
                  >
                    {mod.badge}
                  </span>

                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-100/90 group-hover:scale-110 transition-transform shrink-0 shadow-2xs"
                  >
                    <ArrowUpRight size={12} style={{ color: mod.folderAccent }} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Contenido Clínico: Título y Subtítulo */}
                <div className="relative z-10 mt-1">
                  <h3 className="text-xs md:text-sm font-black text-slate-900 tracking-tight line-clamp-1 group-hover:text-cyan-700 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-600 line-clamp-1 mt-0.5">
                    {mod.subtitle}
                  </p>
                </div>

                {/* Pie de Repisa: Norma Oficial y Enlace de Entrada */}
                <div className="relative z-10 mt-1 pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold truncate max-w-[130px]">
                    {mod.norm}
                  </span>
                  <span 
                    className="font-black group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"
                    style={{ color: mod.tagColor }}
                  >
                    Abrir <ChevronRight size={11} />
                  </span>
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
