// ==============================================================================
// CENTRO MÉDICO PUERTA DE HIERRO (TEPIC) - PLATAFORMA HOSPITALARIA INTEGRAL
// Diseño: Neo-Tactile Glassmorphism | Cumplimiento: NOM-024, NOM-004, NOM-016, NOM-007
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Bed, 
  CalendarCheck, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  Eye, 
  DollarSign, 
  ShieldCheck, 
  MessageSquare, 
  Users, 
  LayoutDashboard,
  Shield,
  FileSpreadsheet,
  Menu,
  X,
  Bell
} from 'lucide-react';

import { HospitalLogo } from './components/common/HospitalLogo';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { TriageModule } from './components/triage/TriageModule';
import { ScheduledAdmissionsModule } from './components/admision/ScheduledAdmissionsModule';
import { ConsultoriosModule } from './components/consultorios/ConsultoriosModule';
import { HospitalizacionModule } from './components/hospitalizacion/HospitalizacionModule';
import { FarmaciaModule } from './components/farmacia/FarmaciaModule';
import { LaboratorioModule } from './components/laboratorio/LaboratorioModule';
import { RayosXModule } from './components/rayosx/RayosXModule';
import { CajaCobroModule } from './components/caja/CajaCobroModule';
import { CeyeModule } from './components/ceye/CeyeModule';
import { MedicalChatModule } from './components/chat/MedicalChatModule';
import { PersonalTurnosModule } from './components/personal/PersonalTurnosModule';

import {
  INITIAL_STAFF,
  INITIAL_PATIENTS,
  INITIAL_SCHEDULED_ADMISSIONS,
  INITIAL_TRIAGE,
  INITIAL_BEDS,
  INITIAL_PHARMACY,
  INITIAL_LAB_ORDERS,
  INITIAL_IMAGING,
  INITIAL_CEYE,
  INITIAL_TRANSACTIONS,
  INITIAL_CHAT,
  INITIAL_AUDIT_LOGS,
} from './lib/hospitalData';

import { 
  Patient, 
  ScheduledAdmission, 
  TriageAdmission, 
  ConsultationNote, 
  HospitalBed, 
  PharmacyItem, 
  LabOrder, 
  ImagingStudy, 
  CashTransaction, 
  CeyeBatch, 
  ChatMessage, 
  AuditLog, 
  UserProfile 
} from './types/hospital';

import { exportPatientsToExcel } from './lib/exportEngine';

export function App() {
  // Pestaña Activa
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados de Datos con persistencia local
  const [staff, setStaff] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('hpdh_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(staff[1] || INITIAL_STAFF[1]); // Dra. Sofía Valenzuela

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('hpdh_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [scheduledAdmissions, setScheduledAdmissions] = useState<ScheduledAdmission[]>(() => {
    const saved = localStorage.getItem('hpdh_scheduled');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULED_ADMISSIONS;
  });

  const [triageList, setTriageList] = useState<TriageAdmission[]>(() => {
    const saved = localStorage.getItem('hpdh_triage');
    return saved ? JSON.parse(saved) : INITIAL_TRIAGE;
  });

  const [notes, setNotes] = useState<ConsultationNote[]>(() => {
    const saved = localStorage.getItem('hpdh_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [beds, setBeds] = useState<HospitalBed[]>(() => {
    const saved = localStorage.getItem('hpdh_beds');
    return saved ? JSON.parse(saved) : INITIAL_BEDS;
  });

  const [pharmacy, setPharmacy] = useState<PharmacyItem[]>(() => {
    const saved = localStorage.getItem('hpdh_pharmacy');
    return saved ? JSON.parse(saved) : INITIAL_PHARMACY;
  });

  const [labOrders, setLabOrders] = useState<LabOrder[]>(() => {
    const saved = localStorage.getItem('hpdh_lab_orders');
    return saved ? JSON.parse(saved) : INITIAL_LAB_ORDERS;
  });

  const [imaging, setImaging] = useState<ImagingStudy[]>(() => {
    const saved = localStorage.getItem('hpdh_imaging');
    return saved ? JSON.parse(saved) : INITIAL_IMAGING;
  });

  const [ceyeBatches, setCeyeBatches] = useState<CeyeBatch[]>(() => {
    const saved = localStorage.getItem('hpdh_ceye');
    return saved ? JSON.parse(saved) : INITIAL_CEYE;
  });

  const [transactions, setTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem('hpdh_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('hpdh_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('hpdh_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Guardar en LocalStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('hpdh_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('hpdh_scheduled', JSON.stringify(scheduledAdmissions));
  }, [scheduledAdmissions]);

  useEffect(() => {
    localStorage.setItem('hpdh_triage', JSON.stringify(triageList));
  }, [triageList]);

  useEffect(() => {
    localStorage.setItem('hpdh_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('hpdh_beds', JSON.stringify(beds));
  }, [beds]);

  useEffect(() => {
    localStorage.setItem('hpdh_pharmacy', JSON.stringify(pharmacy));
  }, [pharmacy]);

  useEffect(() => {
    localStorage.setItem('hpdh_lab_orders', JSON.stringify(labOrders));
  }, [labOrders]);

  useEffect(() => {
    localStorage.setItem('hpdh_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('hpdh_ceye', JSON.stringify(ceyeBatches));
  }, [ceyeBatches]);

  useEffect(() => {
    localStorage.setItem('hpdh_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('hpdh_staff', JSON.stringify(staff));
  }, [staff]);

  // Manejadores de eventos de actualización
  const handleAddTriage = (newTriage: TriageAdmission) => {
    setTriageList([newTriage, ...triageList]);
  };

  const handleUpdateTriageStatus = (id: string, status: TriageAdmission['status']) => {
    setTriageList(triageList.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleAddScheduled = (admission: ScheduledAdmission) => {
    setScheduledAdmissions([admission, ...scheduledAdmissions]);
  };

  const handleUpdateScheduledStatus = (id: string, status: ScheduledAdmission['status']) => {
    setScheduledAdmissions(scheduledAdmissions.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleAddNote = (newNote: ConsultationNote) => {
    setNotes([newNote, ...notes]);
  };

  const handleUpdateBed = (updatedBed: HospitalBed) => {
    setBeds(beds.map(b => b.id === updatedBed.id ? updatedBed : b));
  };

  const handleAddDrug = (newDrug: PharmacyItem) => {
    setPharmacy([newDrug, ...pharmacy]);
  };

  const handleDispenseDrug = (id: string, qty: number) => {
    setPharmacy(pharmacy.map(p => {
      if (p.id === id) {
        return { ...p, stockCurrent: Math.max(p.stockCurrent - qty, 0) };
      }
      return p;
    }));
  };

  const handleValidateLab = (orderId: string) => {
    setLabOrders(labOrders.map(l => {
      if (l.id === orderId) {
        return {
          ...l,
          status: 'VALIDADO_QFB',
          validatingQfb: 'QFB Roberto Zepeda Orozco',
          validatedAt: new Date().toISOString(),
        };
      }
      return l;
    }));
  };

  const handleAddLabOrder = (newOrder: LabOrder) => {
    setLabOrders([newOrder, ...labOrders]);
  };

  const handleAddTransaction = (newTx: CashTransaction) => {
    setTransactions([newTx, ...transactions]);
  };

  const handleAddCeyeBatch = (batch: CeyeBatch) => {
    setCeyeBatches([batch, ...ceyeBatches]);
  };

  const handleUpdateCeyeStatus = (id: string, status: CeyeBatch['status']) => {
    setCeyeBatches(ceyeBatches.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleSendMessage = (msg: ChatMessage) => {
    setChatMessages(prev => [...prev, msg]);
  };

  const handleAddUser = (user: UserProfile) => {
    setStaff([...staff, user]);
  };

  // Elementos de navegación
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'triage', label: 'Triage Urgencias', icon: Activity, badge: triageList.filter(t => t.priority === 'ROJO_REANIMACION').length > 0 ? '🚨' : undefined },
    { id: 'admision_programada', label: 'Admisión Programada', icon: CalendarCheck },
    { id: 'consultorios', label: 'Consultorios ECE', icon: Stethoscope },
    { id: 'hospitalizacion', label: 'Hospitalización', icon: Bed },
    { id: 'farmacia', label: 'Farmacia', icon: Pill },
    { id: 'laboratorio', label: 'Laboratorio', icon: FlaskConical },
    { id: 'rayosx', label: 'Rayos X e Imagen', icon: Eye },
    { id: 'caja', label: 'Caja y Cobro', icon: DollarSign },
    { id: 'ceye', label: 'CEYE Quirófano', icon: ShieldCheck },
    { id: 'chat', label: 'Chat Médico', icon: MessageSquare, badge: '💬' },
    { id: 'personal', label: 'Personal & Turnos', icon: Users },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* 1. Encabezado Maestro Hospital Puerta de Hierro */}
      <header className="sticky top-0 z-50 neo-glass-panel border-x-0 border-t-0 rounded-none px-4 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logotipo y Título */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <HospitalLogo size="md" />
          </div>

          {/* Información de Guardia y Usuario Activo */}
          <div className="flex items-center gap-3">
            {/* Badge de Turno */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-slate-400">TURNO:</span>
              <strong className="text-cyan-300 font-mono">MATUTINO (07:00 - 15:00)</strong>
            </div>

            {/* Selector de Usuario Activo Táctil */}
            <div className="relative">
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const u = staff.find(s => s.id === e.target.value);
                  if (u) setCurrentUser(u);
                }}
                className="neo-input neo-select text-xs py-1.5 pl-3 pr-8 font-semibold bg-slate-900/90 text-white border-blue-500/40"
              >
                {staff.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.fullName} ({u.role.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Botón de Emergencia Táctil con Anillo Neón */}
            <button 
              onClick={() => {
                setActiveTab('chat');
              }}
              title="Centro de Alertas de Choque y Chat Médico"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.7)] hover:scale-105 transition-all"
            >
              <Bell size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Barra de Navegación Táctil Neo-Tactile (Píldoras Defart / Active) */}
      <nav className="neo-glass-panel border-x-0 rounded-none px-4 md:px-8 py-2.5 overflow-x-auto hidden lg:flex items-center gap-2 bg-slate-950/60">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`btn-neo text-xs px-4 py-2 shrink-0 ${
                isActive ? 'btn-neo-active' : 'btn-neo-defart'
              }`}
            >
              <Icon size={15} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold ml-1">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <div className="lg:hidden neo-glass-panel m-3 p-4 rounded-2xl border border-white/15 space-y-2 z-40 animate-fadeIn">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="ml-auto">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Contenido Principal */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            patients={patients}
            triageList={triageList}
            beds={beds}
            scheduledAdmissions={scheduledAdmissions}
            pharmacy={pharmacy}
            labOrders={labOrders}
            transactions={transactions}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'triage' && (
          <TriageModule
            patients={patients}
            triageList={triageList}
            onAddTriage={handleAddTriage}
            onUpdateTriageStatus={handleUpdateTriageStatus}
          />
        )}

        {activeTab === 'admision_programada' && (
          <ScheduledAdmissionsModule
            patients={patients}
            scheduledList={scheduledAdmissions}
            onAddScheduled={handleAddScheduled}
            onUpdateStatus={handleUpdateScheduledStatus}
          />
        )}

        {activeTab === 'consultorios' && (
          <ConsultoriosModule
            patients={patients}
            notes={notes}
            onAddNote={handleAddNote}
          />
        )}

        {activeTab === 'hospitalizacion' && (
          <HospitalizacionModule
            beds={beds}
            patients={patients}
            onUpdateBed={handleUpdateBed}
          />
        )}

        {activeTab === 'farmacia' && (
          <FarmaciaModule
            inventory={pharmacy}
            onAddDrug={handleAddDrug}
            onDispenseDrug={handleDispenseDrug}
          />
        )}

        {activeTab === 'laboratorio' && (
          <LaboratorioModule
            labOrders={labOrders}
            patients={patients}
            onValidateOrder={handleValidateLab}
            onNewOrder={handleAddLabOrder}
          />
        )}

        {activeTab === 'rayosx' && (
          <RayosXModule studies={imaging} />
        )}

        {activeTab === 'caja' && (
          <CajaCobroModule
            transactions={transactions}
            patients={patients}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {activeTab === 'ceye' && (
          <CeyeModule
            batches={ceyeBatches}
            onAddBatch={handleAddCeyeBatch}
            onUpdateBatchStatus={handleUpdateCeyeStatus}
          />
        )}

        {activeTab === 'chat' && (
          <MedicalChatModule
            messages={chatMessages}
            currentUser={currentUser}
            staff={staff}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'personal' && (
          <PersonalTurnosModule
            staff={staff}
            auditLogs={auditLogs}
            onAddUser={handleAddUser}
          />
        )}
      </main>

      {/* 4. Barra Inferior Táctil para Dispositivos Móviles (Smartphones e iPad en mano) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 neo-glass-panel border-x-0 border-b-0 rounded-none px-3 py-2 flex items-center justify-around z-40 bg-slate-950/90 backdrop-blur-xl">
        {[
          { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
          { id: 'triage', label: 'Triage', icon: Activity },
          { id: 'admision_programada', label: 'Cirugías', icon: CalendarCheck },
          { id: 'hospitalizacion', label: 'Camas', icon: Bed },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
        ].map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1 text-[10px] font-bold ${
                isActive ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Pie de Página Institucional y Cumplimiento de Normas Mexicanas */}
      <footer className="border-t border-white/10 bg-slate-950/90 py-6 px-4 md:px-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-4 flex-wrap text-[11px] text-slate-400">
          <span>🏛️ Hospital Puerta de Hierro Tepic</span>
          <span>•</span>
          <span>Av. Emilio M. González #221, Cd. Industrial, Tepic, Nayarit</span>
          <span>•</span>
          <span>Tel: (311) 129-5200</span>
          <span>•</span>
          <span className="text-cyan-400">Urgencias: (311) 129-5206</span>
        </div>
        <p>
          Sistema Certificado en cumplimiento de las Normas Oficiales Mexicanas: <strong>NOM-024-SSA3-2012</strong> (Sistemas de Información de Registro Electrónico para la Salud), <strong>NOM-004-SSA3-2012</strong> (Del Expediente Clínico), <strong>NOM-016-SSA3-2012</strong> (Infraestructura Quirúrgica y CEYE) y <strong>NOM-007-SSA3-2011</strong> (Laboratorios Clínicos).
        </p>
        <p className="text-[10px] text-slate-600">
          Protección de Datos Personales Sensibles de Salud garantizada bajo la Ley Federal de Protección de Datos Personales en Posesión de Particulares (LFPDPPP).
        </p>
      </footer>
    </div>
  );
}

export default App;
