// ==============================================================================
// MÓDULO DE TRABAJO SOCIAL HOSPITALARIO
// Centro Médico Puerta de Hierro (Tepic) - Alta Especialidad
// Cumplimiento con NOM-004-SSA3-2012, NOM-046 y Trámites de Registro Civil
// ==============================================================================

import React, { useState } from 'react';
import {
  HeartHandshake,
  UserPlus,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  Printer,
  Phone,
  Building2,
  AlertTriangle,
  Scale,
  X,
  FileCheck,
  Award,
  Calendar,
  DollarSign,
  UserCheck
} from 'lucide-react';
import {
  Patient,
  UserProfile,
  SocialWorkRecord,
  SocialWorkCaseType,
  SocialCaseStatus,
  SocioeconomicLevel
} from '../../types/hospital';
import {
  exportSocialWorkToExcel,
  generateSocialWorkStudyPDF,
  generateDeathCertificateNoticePDF
} from '../../lib/exportEngine';

interface TrabajoSocialModuleProps {
  cases: SocialWorkRecord[];
  patients: Patient[];
  currentUser: UserProfile;
  onAddCase: (newCase: SocialWorkRecord) => void;
  onUpdateCaseStatus: (caseId: string, status: SocialCaseStatus) => void;
}

export const TrabajoSocialModule: React.FC<TrabajoSocialModuleProps> = ({
  cases,
  patients,
  currentUser,
  onAddCase,
  onUpdateCaseStatus
}) => {
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modales
  const [showStudyModal, setShowStudyModal] = useState<boolean>(false);
  const [showDeathModal, setShowDeathModal] = useState<boolean>(false);
  const [showMpModal, setShowMpModal] = useState<boolean>(false);
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);

  // Formulario Estudio Socioeconómico
  const [sePatientId, setSePatientId] = useState<string>(patients[0]?.id || '');
  const [seArea, setSeArea] = useState<string>('HOSPITALIZACION');
  const [seBed, setSeBed] = useState<string>('P2-204');
  const [seContactName, setSeContactName] = useState<string>('');
  const [seContactKinship, setSeContactKinship] = useState<string>('Cónyuge');
  const [seContactPhone, setSeContactPhone] = useState<string>('');
  const [seIncome, setSeIncome] = useState<number>(12000);
  const [seExpenses, setSeExpenses] = useState<number>(11500);
  const [seHousing, setSeHousing] = useState<'PROPIA' | 'RENTADA' | 'PRESTADA' | 'IRREGULAR'>('RENTADA');
  const [seFamilyCount, setSeFamilyCount] = useState<number>(4);
  const [seLevel, setSeLevel] = useState<SocioeconomicLevel>('NIVEL_2');
  const [seDiscount, setSeDiscount] = useState<number>(40);
  const [sePatronatoCode, setSePatronatoCode] = useState<string>('PAT-2026-NVR40');
  const [seDiagnosis, setSeDiagnosis] = useState<string>('Paciente vulnerable con ingresos familiares reducidos e internamiento de alta especialidad.');
  const [seActions, setSeActions] = useState<string>('Cédula socioeconómica aplicada. Convenio turnado a Patronato para exención parcial.');

  // Formulario Defunción
  const [dfPatientId, setDfPatientId] = useState<string>(patients[0]?.id || '');
  const [dfArea, setDfArea] = useState<string>('UCI_ADULTOS');
  const [dfBed, setDfBed] = useState<string>('UCI-03');
  const [dfDate, setDfDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dfTime, setDfTime] = useState<string>('23:45');
  const [dfCertFolio, setDfCertFolio] = useState<string>('CERT-SSA-2026-');
  const [dfCausePrimary, setDfCausePrimary] = useState<string>('Choque cardiogénico refractario irreversible');
  const [dfCauseSecondary, setDfCauseSecondary] = useState<string>('Infarto Agudo al Miocardio');
  const [dfPhysician, setDfPhysician] = useState<string>('Dr. Fernando Covarrubias');
  const [dfPhysicianLicense, setDfPhysicianLicense] = useState<string>('11245980-SSA');
  const [dfClaimantName, setDfClaimantName] = useState<string>('');
  const [dfClaimantKinship, setDfClaimantKinship] = useState<string>('Hijo/a');
  const [dfClaimantPhone, setDfClaimantPhone] = useState<string>('');
  const [dfClaimantId, setDfClaimantId] = useState<string>('INE Verificada');
  const [dfFuneralHome, setDfFuneralHome] = useState<string>('Funeraria San Román Tepic');
  const [dfCivilFolio, setDfCivilFolio] = useState<string>('ACTA-REG-CIVIL-2026-');
  const [dfCivilOffice, setDfCivilOffice] = useState<string>('Oficialía 01 del Registro Civil de Tepic');
  const [dfDestination, setDfDestination] = useState<'INHUMACION' | 'CREMACION' | 'TRASLADO_FORANEO' | 'SEMEFO'>('INHUMACION');
  const [dfBelongings, setDfBelongings] = useState<boolean>(true);
  const [dfNotes, setDfNotes] = useState<string>('Trámite de defunción realizado con emisión de acta oficial y entrega digna de restos a deudos legales.');

  // Formulario Ministerio Público
  const [mpPatientId, setMpPatientId] = useState<string>(patients[0]?.id || '');
  const [mpArea, setMpArea] = useState<string>('URGENCIAS');
  const [mpReportNo, setMpReportNo] = useState<string>('OF-MP-TEP-2026-');
  const [mpAgency, setMpAgency] = useState<string>('Fiscalía General del Estado de Nayarit - Agencia 02 de Delitos Viales');
  const [mpAgent, setMpAgent] = useState<string>('Lic. Mariana Morales Orozco (M.P.)');
  const [mpReason, setMpReason] = useState<string>('Hecho de tránsito vehicular con politraumatismo');
  const [mpDiagnosis, setMpDiagnosis] = useState<string>('Ingreso en Código Rojo por lesiones médico-legales. Notificación reglamentaria turnada de inmediato.');

  // Formulario Canalización
  const [refPatientId, setRefPatientId] = useState<string>(patients[0]?.id || '');
  const [refInstitution, setRefInstitution] = useState<string>('DIF Estatal Nayarit / Hospital Civil');
  const [refReason, setRefReason] = useState<string>('Interconsulta y valoración de tercer nivel de atención');
  const [refAmbulance, setRefAmbulance] = useState<boolean>(true);
  const [refDiagnosis, setRefDiagnosis] = useState<string>('Se gestiona apoyo institucional y traslado asistido.');

  // Filtrado
  const filteredCases = cases.filter(c => {
    const matchesType = filterType === 'TODOS' || c.caseType === filterType;
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patientExpNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.socialDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Métricas
  const totalCases = cases.length;
  const studiesCount = cases.filter(c => c.caseType === 'ESTUDIO_SOCIOECONOMICO').length;
  const deathsCount = cases.filter(c => c.caseType === 'TRAMITE_DEFUNCION').length;
  const mpCount = cases.filter(c => c.caseType === 'CASO_MEDICO_LEGAL').length;
  const referralsCount = cases.filter(c => c.caseType === 'CANALIZACION_EXTERNA').length;

  // Guardar Estudio Socioeconómico
  const handleSaveStudy = (e: React.FormEvent) => {
    e.preventDefault();
    const selPat = patients.find(p => p.id === sePatientId) || patients[0];
    const newCase: SocialWorkRecord = {
      id: `ts-case-${Date.now()}`,
      folio: `TS-2026-00${cases.length + 10}`,
      patientId: selPat.id,
      patientName: `${selPat.firstName} ${selPat.lastName}`,
      patientExpNumber: selPat.patientNumber,
      patientAge: 50,
      patientGender: selPat.gender,
      areaService: seArea,
      bedNumber: seBed,
      caseType: 'ESTUDIO_SOCIOECONOMICO',
      status: 'APROBADO_PATRONATO',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      socialWorkerName: currentUser.fullName,
      familyContactName: seContactName || `${selPat.firstName} Familiar`,
      familyContactRelationship: seContactKinship,
      familyContactPhone: seContactPhone || '(311) 555-0100',
      socioeconomicLevel: seLevel,
      familyIncomeMonthly: seIncome,
      familyExpensesMonthly: seExpenses,
      housingType: seHousing,
      familyMembersCount: seFamilyCount,
      supportDiscountApprovedPercentage: seDiscount,
      patronatoAuthorizationCode: sePatronatoCode,
      socialDiagnosis: seDiagnosis,
      actionsTaken: seActions
    };
    onAddCase(newCase);
    setShowStudyModal(false);
  };

  // Guardar Trámite de Defunción
  const handleSaveDeath = (e: React.FormEvent) => {
    e.preventDefault();
    const selPat = patients.find(p => p.id === dfPatientId) || patients[0];
    const newCase: SocialWorkRecord = {
      id: `ts-death-${Date.now()}`,
      folio: `TS-DEF-2026-00${cases.length + 1}`,
      patientId: selPat.id,
      patientName: `${selPat.firstName} ${selPat.lastName}`,
      patientExpNumber: selPat.patientNumber,
      patientAge: 78,
      patientGender: selPat.gender,
      areaService: dfArea,
      bedNumber: dfBed,
      caseType: 'TRAMITE_DEFUNCION',
      status: 'ACTA_EMITIDA',
      date: dfDate,
      time: dfTime,
      socialWorkerName: currentUser.fullName,
      familyContactName: dfClaimantName || 'Familiar Deudo',
      familyContactRelationship: dfClaimantKinship,
      familyContactPhone: dfClaimantPhone || '(311) 987-6543',
      deathData: {
        deathCertificateFolio: dfCertFolio,
        deathDate: dfDate,
        deathTime: dfTime,
        deathCausePrimary: dfCausePrimary,
        deathCauseSecondary: dfCauseSecondary,
        certifyingPhysician: dfPhysician,
        certifyingPhysicianCedula: dfPhysicianLicense,
        legalClaimantName: dfClaimantName,
        legalClaimantKinship: dfClaimantKinship,
        legalClaimantPhone: dfClaimantPhone,
        legalClaimantOfficialId: dfClaimantId,
        funeralHomeName: dfFuneralHome,
        civilRegistryFolio: dfCivilFolio,
        civilRegistryOffice: dfCivilOffice,
        bodyDestination: dfDestination,
        personalBelongingsDelivered: dfBelongings
      },
      socialDiagnosis: `Fallecimiento hospitalario en ${dfArea}. Certificado emitido y cuerpo entregado a deudos legales con acta oficial de Registro Civil.`,
      actionsTaken: dfNotes
    };
    onAddCase(newCase);
    setShowDeathModal(false);
  };

  // Guardar Notificación MP
  const handleSaveMp = (e: React.FormEvent) => {
    e.preventDefault();
    const selPat = patients.find(p => p.id === mpPatientId) || patients[0];
    const newCase: SocialWorkRecord = {
      id: `ts-mp-${Date.now()}`,
      folio: `TS-MP-2026-00${cases.length + 1}`,
      patientId: selPat.id,
      patientName: `${selPat.firstName} ${selPat.lastName}`,
      patientExpNumber: selPat.patientNumber,
      areaService: mpArea,
      caseType: 'CASO_MEDICO_LEGAL',
      status: 'NOTIFICADO_MP',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      socialWorkerName: currentUser.fullName,
      familyContactName: 'Familiar Legal',
      familyContactRelationship: 'Informante',
      familyContactPhone: '(311) 555-0199',
      mpReportNumber: mpReportNo,
      mpAgencyName: mpAgency,
      mpAgentName: mpAgent,
      mpNotificationReason: mpReason,
      mpDeliveryDate: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`,
      socialDiagnosis: mpDiagnosis,
      actionsTaken: 'Oficio de notificación entregado a Fiscalía / Ministerio Público. Acuse integrado a Expediente Clínico.'
    };
    onAddCase(newCase);
    setShowMpModal(false);
  };

  // Guardar Canalización
  const handleSaveReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const selPat = patients.find(p => p.id === refPatientId) || patients[0];
    const newCase: SocialWorkRecord = {
      id: `ts-ref-${Date.now()}`,
      folio: `TS-REF-2026-00${cases.length + 1}`,
      patientId: selPat.id,
      patientName: `${selPat.firstName} ${selPat.lastName}`,
      patientExpNumber: selPat.patientNumber,
      areaService: 'HOSPITALIZACION',
      caseType: 'CANALIZACION_EXTERNA',
      status: 'EN_EVALUACION',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      socialWorkerName: currentUser.fullName,
      familyContactName: 'Familiar Responsable',
      familyContactRelationship: 'Tutor',
      familyContactPhone: '(311) 456-7890',
      referralInstitution: refInstitution,
      referralReason: refReason,
      ambulanceTransferRequired: refAmbulance,
      socialDiagnosis: refDiagnosis,
      actionsTaken: 'Enlace interinstitucional formalizado y trámite de traslado asistido en proceso.'
    };
    onAddCase(newCase);
    setShowReferralModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ===== ENCABEZADO MAESTRO DE TRABAJO SOCIAL ===== */}
      <div className="neo-glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="neo-badge neo-badge-cyan">
              <span className="neo-badge-dot" style={{ background: '#00f2fe', boxShadow: '0 0 10px #00f2fe' }}></span>
              NOM-004-SSA3-2012 & TRABAJO SOCIAL MÉDICO
            </span>
            <span className="text-xs text-cyan-200 font-bold font-mono tracking-wider drop-shadow-sm">
              ASISTENCIA SOCIAL, ACTAS DE DEFUNCIÓN Y CASOS LEGALES
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
            Trabajo Social y Atención al Paciente
          </h2>
          <p className="text-slate-100 text-sm mt-1 font-medium leading-relaxed drop-shadow-sm">
            Estudios socioeconómicos, dictámenes de descuento, enlace de actas de defunción, trámites funerarios y notificaciones ministeriales.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Botón Estudio Socioeconómico */}
          <button
            onClick={() => setShowStudyModal(true)}
            className="btn-neo btn-neo-success text-xs font-bold flex items-center gap-1.5"
            title="Aplicar estudio socioeconómico y evaluar descuento"
          >
            <UserPlus size={16} />
            <span>+ Estudio Socioeconómico</span>
          </button>

          {/* Botón Trámite de Defunción */}
          <button
            onClick={() => setShowDeathModal(true)}
            className="btn-neo text-xs font-extrabold flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(180deg, #334155 0%, #1e293b 100%)',
              color: '#ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5), inset 0 2px 2px rgba(255, 255, 255, 0.3)'
            }}
            title="Registrar trámite y acta de defunción hospitalaria"
          >
            <FileText size={16} className="text-amber-300" />
            <span>Trámite Defunción</span>
          </button>

          {/* Botón Aviso al Ministerio Público */}
          <button
            onClick={() => setShowMpModal(true)}
            className="btn-neo btn-neo-emergency btn-neo-emergency-pulse text-xs font-black flex items-center gap-2 group"
            title="Emitir notificación oficial al Ministerio Público"
          >
            <ShieldAlert size={16} className="text-white group-hover:rotate-12 transition-transform duration-200" />
            <span>Aviso al M.P.</span>
          </button>

          {/* Botón Nueva Canalización */}
          <button
            onClick={() => setShowReferralModal(true)}
            className="btn-neo btn-neo-active text-xs font-bold flex items-center gap-1.5"
            title="Canalizar paciente a DIF u hospital externo"
          >
            <ArrowUpRight size={16} />
            <span>Canalización</span>
          </button>

          {/* Botón Exportar Excel */}
          <button
            onClick={() => exportSocialWorkToExcel(cases)}
            className="btn-neo btn-neo-defart text-xs"
            title="Descargar padrón completo de Trabajo Social en Excel"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <span>Exportar Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* ===== TARJETAS DE INDICADORES CLAVE (MÉTRICAS) ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="neo-glass-panel p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30">
            <HeartHandshake size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-200 font-semibold block">Casos Totales</span>
            <span className="text-xl font-black text-white">{totalCases}</span>
          </div>
        </div>

        <div className="neo-glass-panel p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
            <Award size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-200 font-semibold block">Estudios con Apoyo</span>
            <span className="text-xl font-black text-emerald-400">{studiesCount}</span>
          </div>
        </div>

        <div className="neo-glass-panel p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-700/40 text-amber-300 flex items-center justify-center shrink-0 border border-white/20">
            <FileCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-200 font-semibold block">Actas de Defunción</span>
            <span className="text-xl font-black text-amber-300">{deathsCount}</span>
          </div>
        </div>

        <div className="neo-glass-panel p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-300 flex items-center justify-center shrink-0 border border-red-400/30">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-200 font-semibold block">Avisos al M.P.</span>
            <span className="text-xl font-black text-red-400">{mpCount}</span>
          </div>
        </div>

        <div className="neo-glass-panel p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/30">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <span className="text-xs text-slate-200 font-semibold block">Canalizaciones</span>
            <span className="text-xl font-black text-blue-300">{referralsCount}</span>
          </div>
        </div>
      </div>

      {/* ===== BARRA DE FILTROS Y BÚSQUEDA ===== */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Pestañas de Filtro */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'TODOS', label: 'Todos los Casos' },
            { id: 'ESTUDIO_SOCIOECONOMICO', label: 'Estudios Socioeconómicos' },
            { id: 'TRAMITE_DEFUNCION', label: 'Actas de Defunción' },
            { id: 'CASO_MEDICO_LEGAL', label: 'Casos Legales (MP)' },
            { id: 'CANALIZACION_EXTERNA', label: 'Canalizaciones' },
            { id: 'LOCALIZACION_FAMILIARES', label: 'Búsqueda Familiares' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`btn-neo text-xs px-3.5 py-2 whitespace-nowrap ${
                filterType === tab.id ? 'btn-neo-active' : 'btn-neo-defart'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por paciente, folio o expediente..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-900/80 border border-white/20 text-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* ===== LISTADO DE CASOS DE TRABAJO SOCIAL ===== */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <div className="neo-glass-panel p-12 text-center text-slate-200">
            <HeartHandshake size={48} className="mx-auto text-slate-400 mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-white mb-1">No se encontraron expedientes</h3>
            <p className="text-xs text-slate-300">No hay casos registrados con el filtro o término de búsqueda seleccionado.</p>
          </div>
        ) : (
          filteredCases.map(item => {
            const isDeath = item.caseType === 'TRAMITE_DEFUNCION';
            const isMp = item.caseType === 'CASO_MEDICO_LEGAL';
            const isStudy = item.caseType === 'ESTUDIO_SOCIOECONOMICO';
            const isReferral = item.caseType === 'CANALIZACION_EXTERNA';

            return (
              <div
                key={item.id}
                className="neo-glass-panel p-5 border-l-4 transition-all hover:translate-x-1"
                style={{
                  borderLeftColor: isDeath ? '#f59e0b' : isMp ? '#ef4444' : isStudy ? '#10b981' : '#06b6d4'
                }}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    {/* Encabezado de la Tarjeta */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-cyan-200 font-bold bg-slate-900/90 border border-cyan-400/40 px-2.5 py-0.5 rounded-full shadow-sm">
                        {item.folio}
                      </span>

                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-extrabold border"
                        style={{
                          background: isDeath ? 'rgba(245, 158, 11, 0.2)' : isMp ? 'rgba(239, 68, 68, 0.2)' : isStudy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                          borderColor: isDeath ? '#f59e0b' : isMp ? '#ef4444' : isStudy ? '#10b981' : '#06b6d4',
                          color: isDeath ? '#fbbf24' : isMp ? '#fca5a5' : isStudy ? '#6ee7b7' : '#67e8f9'
                        }}
                      >
                        {item.caseType.replace(/_/g, ' ')}
                      </span>

                      <span className="text-xs font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                        {item.status.replace(/_/g, ' ')}
                      </span>

                      <span className="text-xs text-slate-300 font-mono">
                        {item.date} a las {item.time} hrs
                      </span>
                    </div>

                    {/* Nombre y Expediente */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-black text-white">
                        {item.patientName}
                      </h3>
                      <span className="text-xs font-mono text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-white/10">
                        Exp: {item.patientExpNumber}
                      </span>
                      <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                        Área: {item.areaService} {item.bedNumber ? `(${item.bedNumber})` : ''}
                      </span>
                    </div>

                    {/* SECCIÓN ESPECÍFICA: TRÁMITE DE DEFUNCIÓN */}
                    {isDeath && item.deathData && (
                      <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2 flex-wrap text-amber-200 font-semibold">
                          <span>📜 Certificado SSA: <strong className="text-white font-mono">{item.deathData.deathCertificateFolio}</strong></span>
                          <span>🏛️ Acta Registro Civil: <strong className="text-white font-mono">{item.deathData.civilRegistryFolio || 'En proceso'}</strong></span>
                          <span>⚰️ Funeraria: <strong className="text-white">{item.deathData.funeralHomeName}</strong></span>
                        </div>
                        <div className="text-slate-200">
                          <strong>Causa Principal:</strong> {item.deathData.deathCausePrimary}
                        </div>
                        <div className="flex items-center gap-4 text-slate-300 flex-wrap">
                          <span>👨‍⚕️ Certificó: {item.deathData.certifyingPhysician}</span>
                          <span>👤 Familiar que Reclama: {item.deathData.legalClaimantName} ({item.deathData.legalClaimantKinship})</span>
                          <span>📦 Pertenencias: {item.deathData.personalBelongingsDelivered ? '✓ Entregadas' : 'Pendiente'}</span>
                        </div>
                      </div>
                    )}

                    {/* SECCIÓN ESPECÍFICA: ESTUDIO SOCIOECONÓMICO */}
                    {isStudy && (
                      <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 text-xs">
                        <div className="flex items-center gap-4 flex-wrap text-emerald-200 font-semibold">
                          <span>📊 Nivel: <strong className="text-white">{item.socioeconomicLevel?.replace(/_/g, ' ')}</strong></span>
                          <span>💵 Ingreso: <strong className="text-white">${item.familyIncomeMonthly?.toLocaleString('es-MX')}</strong></span>
                          <span>📉 Egreso: <strong className="text-white">${item.familyExpensesMonthly?.toLocaleString('es-MX')}</strong></span>
                          <span>🏷️ Descuento: <strong className="text-emerald-300 font-black text-sm">{item.supportDiscountApprovedPercentage}% Aprobado</strong></span>
                          <span>🏛️ Folio Patronato: <strong className="text-cyan-300 font-mono">{item.patronatoAuthorizationCode}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* SECCIÓN ESPECÍFICA: MINISTERIO PÚBLICO */}
                    {isMp && (
                      <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2 text-xs">
                        <div className="flex items-center gap-4 flex-wrap text-red-200 font-semibold">
                          <span>⚖️ Oficio MP: <strong className="text-white font-mono">{item.mpReportNumber}</strong></span>
                          <span>🏛️ Agencia: <strong className="text-white">{item.mpAgencyName}</strong></span>
                          <span>👮 Agente: <strong className="text-white">{item.mpAgentName}</strong></span>
                        </div>
                        <div className="text-slate-200">
                          <strong>Motivo de Interés Legal:</strong> {item.mpNotificationReason}
                        </div>
                      </div>
                    )}

                    {/* Contacto Familiar y Diagnóstico Social */}
                    <div className="text-xs text-slate-200 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap text-slate-300">
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-cyan-400" />
                          Contacto: <strong className="text-white">{item.familyContactName}</strong> ({item.familyContactRelationship})
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={13} className="text-emerald-400" />
                          {item.familyContactPhone}
                        </span>
                        <span>• Trabajador(a) Social: <strong className="text-white">{item.socialWorkerName}</strong></span>
                      </div>
                      <p className="text-slate-100 font-medium">
                        <strong>Diagnóstico Social:</strong> {item.socialDiagnosis}
                      </p>
                      <p className="text-slate-300 italic text-[11px]">
                        Acciones: {item.actionsTaken}
                      </p>
                    </div>
                  </div>

                  {/* Botones de Acción sobre el Caso */}
                  <div className="flex flex-row lg:flex-col items-end gap-2 shrink-0">
                    {isStudy && (
                      <button
                        onClick={() => generateSocialWorkStudyPDF(item)}
                        className="btn-neo btn-neo-defart text-xs flex items-center gap-1.5 font-bold"
                        title="Imprimir Dictamen Oficial Socioeconómico"
                      >
                        <Printer size={14} className="text-cyan-600" />
                        <span>Dictamen PDF</span>
                      </button>
                    )}

                    {isDeath && (
                      <button
                        onClick={() => generateDeathCertificateNoticePDF(item)}
                        className="btn-neo text-xs flex items-center gap-1.5 font-bold"
                        style={{
                          background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
                          color: '#0f172a',
                          border: '1px solid rgba(255,255,255,0.9)'
                        }}
                        title="Imprimir Hoja de Trámite y Defunción"
                      >
                        <Printer size={14} className="text-amber-600" />
                        <span>Acta Defunción PDF</span>
                      </button>
                    )}

                    {item.status !== 'CONCLUIDO' && (
                      <button
                        onClick={() => onUpdateCaseStatus(item.id, 'CONCLUIDO')}
                        className="btn-neo text-xs px-3 py-1.5 text-emerald-300 border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60"
                        title="Marcar expediente como concluido"
                      >
                        <CheckCircle2 size={13} />
                        <span>Concluir</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== MODAL 1: NUEVO ESTUDIO SOCIOECONÓMICO ===== */}
      {showStudyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="neo-glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 border-t-2 border-t-emerald-400">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserPlus size={22} className="text-emerald-400" />
                  Nuevo Estudio Socioeconómico y Dictamen
                </h3>
                <p className="text-xs text-slate-300">Evaluación asistencial conforme a NOM-004-SSA3-2012 y Patronato</p>
              </div>
              <button onClick={() => setShowStudyModal(false)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStudy} className="space-y-4">
              {/* Paciente y Ubicación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-200 mb-1">PACIENTE *</label>
                  <select
                    value={sePatientId}
                    onChange={e => setSePatientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} (Exp: {p.patientNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">SERVICIO / ÁREA *</label>
                  <select
                    value={seArea}
                    onChange={e => setSeArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  >
                    <option value="HOSPITALIZACION">Hospitalización</option>
                    <option value="URGENCIAS">Urgencias</option>
                    <option value="UCI">UCI Adultos</option>
                    <option value="UCIN">UCIN Neonatal</option>
                    <option value="CONSULTORIOS">Consultorios</option>
                  </select>
                </div>
              </div>

              {/* Familiar Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">FAMILIAR INFORMANTE *</label>
                  <input
                    required
                    value={seContactName}
                    onChange={e => setSeContactName(e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">PARENTESCO *</label>
                  <input
                    required
                    value={seContactKinship}
                    onChange={e => setSeContactKinship(e.target.value)}
                    placeholder="Cónyuge, Hijo, Hermano..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">TELÉFONO *</label>
                  <input
                    required
                    value={seContactPhone}
                    onChange={e => setSeContactPhone(e.target.value)}
                    placeholder="(311) 000-0000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  />
                </div>
              </div>

              {/* Evaluación Económica */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
                <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wide">
                  Datos Económicos y Cédula Socioeconómica
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">INGRESO FAMILIAR ($)</label>
                    <input
                      type="number"
                      value={seIncome}
                      onChange={e => setSeIncome(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/20 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">EGRESO MENSUAL ($)</label>
                    <input
                      type="number"
                      value={seExpenses}
                      onChange={e => setSeExpenses(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/20 text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">VIVIENDA</label>
                    <select
                      value={seHousing}
                      onChange={e => setSeHousing(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/20 text-white text-xs"
                    >
                      <option value="PROPIA">Propia</option>
                      <option value="RENTADA">Rentada</option>
                      <option value="PRESTADA">Prestada</option>
                      <option value="IRREGULAR">Asentamiento</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">MIEMBROS HOGAR</label>
                    <input
                      type="number"
                      value={seFamilyCount}
                      onChange={e => setSeFamilyCount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/20 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">NIVEL ASIGNADO</label>
                    <select
                      value={seLevel}
                      onChange={e => setSeLevel(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
                    >
                      <option value="NIVEL_1">Nivel 1 (Vulnerabilidad Extrema)</option>
                      <option value="NIVEL_2">Nivel 2 (Vulnerabilidad Alta)</option>
                      <option value="NIVEL_3">Nivel 3 (Vulnerabilidad Media)</option>
                      <option value="NIVEL_4">Nivel 4 (Vulnerabilidad Baja)</option>
                      <option value="NIVEL_5">Nivel 5 (Tabulador Preferente)</option>
                      <option value="PARTICULAR_PLENO">Particular Pleno (Sin subsidio)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">% DESCUENTO APROBADO</label>
                    <input
                      type="number"
                      value={seDiscount}
                      onChange={e => setSeDiscount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">CÓDIGO PATRONATO</label>
                    <input
                      value={sePatronatoCode}
                      onChange={e => setSePatronatoCode(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/20 text-cyan-300 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnóstico y Acciones */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">DIAGNÓSTICO DE TRABAJO SOCIAL *</label>
                <textarea
                  rows={2}
                  value={seDiagnosis}
                  onChange={e => setSeDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">ACCIONES Y RESOLUCIÓN *</label>
                <textarea
                  rows={2}
                  value={seActions}
                  onChange={e => setSeActions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowStudyModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-success text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  Guardar y Emitir Dictamen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL 2: TRÁMITE Y ACTA DE DEFUNCIÓN ===== */}
      {showDeathModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="neo-glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 border-t-2 border-t-amber-400">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={22} className="text-amber-400" />
                  Trámite de Acta y Certificado de Defunción
                </h3>
                <p className="text-xs text-slate-300">Enlace con Registro Civil, Funeraria y entrega digna de restos (NOM-004)</p>
              </div>
              <button onClick={() => setShowDeathModal(false)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDeath} className="space-y-4">
              {/* Paciente y Fallecimiento */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-200 mb-1">FINADO(A) / PACIENTE *</label>
                  <select
                    value={dfPatientId}
                    onChange={e => setDfPatientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} (Exp: {p.patientNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">FOLIO CERTIFICADO SSA *</label>
                  <input
                    required
                    value={dfCertFolio}
                    onChange={e => setDfCertFolio(e.target.value)}
                    placeholder="CERT-SSA-2026-XXXX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              {/* Fecha y Causa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">FECHA DE FALLECIMIENTO *</label>
                  <input
                    type="date"
                    required
                    value={dfDate}
                    onChange={e => setDfDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">HORA EXACTA *</label>
                  <input
                    type="time"
                    required
                    value={dfTime}
                    onChange={e => setDfTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">DESTINO FINAL *</label>
                  <select
                    value={dfDestination}
                    onChange={e => setDfDestination(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  >
                    <option value="INHUMACION">Inhumación (Sepultura)</option>
                    <option value="CREMACION">Cremación</option>
                    <option value="TRASLADO_FORANEO">Traslado Foráneo / Interestatal</option>
                    <option value="SEMEFO">SEMEFO (Médico-Legal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">CAUSA DETERMINANTE (PRIMARIA) *</label>
                <input
                  required
                  value={dfCausePrimary}
                  onChange={e => setDfCausePrimary(e.target.value)}
                  placeholder="Ej: Choque cardiogénico refractario irreversible"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs font-bold"
                />
              </div>

              {/* Médico Certificador */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">MÉDICO QUE CERTIFICA *</label>
                  <input
                    required
                    value={dfPhysician}
                    onChange={e => setDfPhysician(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">CÉDULA PROFESIONAL *</label>
                  <input
                    required
                    value={dfPhysicianLicense}
                    onChange={e => setDfPhysicianLicense(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Familiar y Funeraria */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">
                  Reclamación Legal de Restos y Enlace Funerario
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">FAMILIAR QUE RECLAMA *</label>
                    <input
                      required
                      value={dfClaimantName}
                      onChange={e => setDfClaimantName(e.target.value)}
                      placeholder="Nombre deudo legal"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/20 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">PARENTESCO *</label>
                    <input
                      required
                      value={dfClaimantKinship}
                      onChange={e => setDfClaimantKinship(e.target.value)}
                      placeholder="Esposo/a, Hijo/a..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/20 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">TELÉFONO CONTACTO *</label>
                    <input
                      required
                      value={dfClaimantPhone}
                      onChange={e => setDfClaimantPhone(e.target.value)}
                      placeholder="(311) 000-0000"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/20 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">AGENCIA FUNERARIA ASIGNADA *</label>
                    <input
                      required
                      value={dfFuneralHome}
                      onChange={e => setDfFuneralHome(e.target.value)}
                      placeholder="Ej: Funeraria San Román / Jardines del Edén"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/20 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">OFICIALÍA REGISTRO CIVIL</label>
                    <input
                      value={dfCivilOffice}
                      onChange={e => setDfCivilOffice(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-white/20 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="dfBelongingsCheck"
                    checked={dfBelongings}
                    onChange={e => setDfBelongings(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-800 border-slate-600"
                  />
                  <label htmlFor="dfBelongingsCheck" className="text-xs font-semibold text-slate-200">
                    Pertenencias personales inventariadas y entregadas formalmente a deudos legales
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowDeathModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo text-xs font-bold flex items-center gap-1.5"
                  style={{
                    background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  Registrar Trámite y Generar Acta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL 3: NOTIFICACIÓN AL MINISTERIO PÚBLICO ===== */}
      {showMpModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="neo-glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 border-t-2 border-t-red-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldAlert size={22} className="text-red-400" />
                  Aviso al Ministerio Público (Caso Médico-Legal)
                </h3>
                <p className="text-xs text-slate-300">Cumplimiento obligatorio con NOM-004-SSA3-2012 y Código Penal</p>
              </div>
              <button onClick={() => setShowMpModal(false)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">PACIENTE / LESIONADO *</label>
                  <select
                    value={mpPatientId}
                    onChange={e => setMpPatientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} (Exp: {p.patientNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">OFICIO MINISTERIAL *</label>
                  <input
                    required
                    value={mpReportNo}
                    onChange={e => setMpReportNo(e.target.value)}
                    placeholder="OF-MP-TEP-2026-XXXX"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-red-500/40 text-red-300 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">MOTIVO DE INTERÉS MÉDICO-LEGAL *</label>
                <input
                  required
                  value={mpReason}
                  onChange={e => setMpReason(e.target.value)}
                  placeholder="Accidente vehicular, herida por arma de fuego/blanca, agresión física..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">AGENCIA / FISCALÍA RECEPTORA *</label>
                  <input
                    required
                    value={mpAgency}
                    onChange={e => setMpAgency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">AGENTE DEL M.P. RECEPTOR *</label>
                  <input
                    required
                    value={mpAgent}
                    onChange={e => setMpAgent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">DESCRIPCIÓN DE LESIONES Y RESUMEN *</label>
                <textarea
                  rows={3}
                  value={mpDiagnosis}
                  onChange={e => setMpDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowMpModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-emergency text-xs font-black flex items-center gap-1.5"
                >
                  <ShieldAlert size={16} />
                  Turnar Notificación Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL 4: CANALIZACIÓN EXTERNA ===== */}
      {showReferralModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="neo-glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 border-t-2 border-t-blue-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ArrowUpRight size={22} className="text-blue-400" />
                  Nueva Canalización y Referencia Externa
                </h3>
                <p className="text-xs text-slate-300">Enlace con DIF, albergues y centros de alta especialidad</p>
              </div>
              <button onClick={() => setShowReferralModal(false)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReferral} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">PACIENTE *</label>
                  <select
                    value={refPatientId}
                    onChange={e => setRefPatientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} (Exp: {p.patientNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">INSTITUCIÓN RECEPTORA *</label>
                  <input
                    required
                    value={refInstitution}
                    onChange={e => setRefInstitution(e.target.value)}
                    placeholder="Ej: DIF Estatal / Hospital Civil Tepic"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">MOTIVO DE LA CANALIZACIÓN *</label>
                <input
                  required
                  value={refReason}
                  onChange={e => setRefReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="refAmbulanceCheck"
                  checked={refAmbulance}
                  onChange={e => setRefAmbulance(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 focus:ring-blue-400 bg-slate-800 border-slate-600"
                />
                <label htmlFor="refAmbulanceCheck" className="text-xs font-semibold text-slate-200">
                  Requiere traslado asistido con ambulancia de cuidados intensivos / soporte vital
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">DIAGNÓSTICO SOCIAL Y RESUMEN *</label>
                <textarea
                  rows={3}
                  value={refDiagnosis}
                  onChange={e => setRefDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="btn-neo btn-neo-defart text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-active text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowUpRight size={16} />
                  Generar Canalización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
