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
  Bell,
  Home,
  ChevronRight,
  LogOut,
  Boxes,
  ShoppingBag,
  HeartHandshake
} from 'lucide-react';

import { LoginWelcomeModal } from './components/auth/LoginWelcomeModal';
import { HospitalLogo } from './components/common/HospitalLogo';
import { MainMenuHub } from './components/menu/MainMenuHub';
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
import { AlmacenModule } from './components/almacen/AlmacenModule';
import { ComprasModule } from './components/compras/ComprasModule';
import { TrabajoSocialModule } from './components/trabajosocial/TrabajoSocialModule';

import {
  INITIAL_STAFF,
  INITIAL_PATIENTS,
  INITIAL_SCHEDULED_ADMISSIONS,
  INITIAL_TRIAGE,
  INITIAL_CONSULTATION_NOTES,
  INITIAL_BEDS,
  INITIAL_PHARMACY,
  INITIAL_LAB_ORDERS,
  INITIAL_IMAGING,
  INITIAL_CEYE,
  INITIAL_TRANSACTIONS,
  INITIAL_CHAT,
  INITIAL_AUDIT_LOGS,
  INITIAL_WAREHOUSE_ITEMS,
  INITIAL_WAREHOUSE_DISPATCHES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_REQUISITIONS,
  INITIAL_SOCIAL_WORK_CASES,
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
  UserProfile,
  WarehouseItem,
  WarehouseDispatch,
  Supplier,
  PurchaseOrder,
  PurchaseRequisition,
  SocialWorkRecord,
  SocialCaseStatus
} from './types/hospital';

import { exportPatientsToExcel } from './lib/exportEngine';

export function App() {
  // Pestaña Activa (Por defecto inicia en el Menú Principal)
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredMobileItem, setHoveredMobileItem] = useState<string | null>(null);

  const handleDrawerTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const btn = target?.closest<HTMLButtonElement>('[data-drawer-id]');
    if (btn) {
      const id = btn.getAttribute('data-drawer-id');
      if (id && id !== hoveredMobileItem) {
        setHoveredMobileItem(id);
      }
    }
  };

  const handleDrawerTouchEnd = () => {
    setTimeout(() => {
      setHoveredMobileItem(null);
    }, 250);
  };

  // Estados de Datos con persistencia local
  const [staff, setStaff] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('hpdh_staff');
    if (saved) {
      try {
        const parsed: UserProfile[] = JSON.parse(saved);
        // Si algún usuario no tiene contraseña (datos viejos), resetear al estado inicial
        const hasValidPasswords = parsed.every(u => u.password && u.password.length > 0);
        if (!hasValidPasswords || parsed.length === 0) {
          localStorage.removeItem('hpdh_staff');
          return INITIAL_STAFF;
        }
        return parsed;
      } catch {
        return INITIAL_STAFF;
      }
    }
    return INITIAL_STAFF;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('hpdh_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Estado de Autenticación y Sesión Clínica
  const [authUser, setAuthUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('hpdh_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null; // Muestra el portal flotante de bienvenida y login al inicio
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return staff[0] || INITIAL_STAFF[0]; // Ing. Alfonso Uribe (Administrador Único)
  });

  const handleLoginSuccess = (user: UserProfile) => {
    setAuthUser(user);
    setCurrentUser(user);
    localStorage.setItem('hpdh_auth_user', JSON.stringify(user));

    // Registrar inicio de sesión en la bitácora NOM-024
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const formattedTime = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: AuditLog = {
      id: 'log-login-' + Date.now(),
      timestamp: now.toISOString(),
      userName: user.fullName,
      userRole: user.role,
      userLicense: user.professionalLicense || 'N/A',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 80 + 10)} (Terminal HPDH)`,
      actionType: 'INICIO_SESION_EXITOSO',
      resourceAffected: 'Portal de Seguridad / Estación Clínica',
      details: `Inicio de sesión verificado para ${user.fullName} (${user.role.replace(/_/g, ' ')}). Acceso autorizado a las ${formattedTime} del ${formattedDate}.`,
      sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('hpdh_auth_user');
  };

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
    return saved ? JSON.parse(saved) : INITIAL_CONSULTATION_NOTES;
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_TRANSACTIONS.length && parsed[0]?.taxCategory) {
          return parsed;
        }
      } catch (e) {
        // fallback to INITIAL_TRANSACTIONS
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('hpdh_chat');
    return saved ? JSON.parse(saved) : INITIAL_CHAT;
  });


  const [warehouse, setWarehouse] = useState<WarehouseItem[]>(() => {
    const saved = localStorage.getItem('hpdh_warehouse');
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSE_ITEMS;
  });

  const [warehouseDispatches, setWarehouseDispatches] = useState<WarehouseDispatch[]>(() => {
    const saved = localStorage.getItem('hpdh_warehouse_dispatches');
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSE_DISPATCHES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('hpdh_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('hpdh_purchase_orders');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>(() => {
    const saved = localStorage.getItem('hpdh_requisitions');
    return saved ? JSON.parse(saved) : INITIAL_REQUISITIONS;
  });

  const [socialWorkCases, setSocialWorkCases] = useState<SocialWorkRecord[]>(() => {
    const saved = localStorage.getItem('hpdh_social_work_cases');
    return saved ? JSON.parse(saved) : INITIAL_SOCIAL_WORK_CASES;
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

  useEffect(() => {
    localStorage.setItem('hpdh_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('hpdh_warehouse', JSON.stringify(warehouse));
  }, [warehouse]);

  useEffect(() => {
    localStorage.setItem('hpdh_warehouse_dispatches', JSON.stringify(warehouseDispatches));
  }, [warehouseDispatches]);

  useEffect(() => {
    localStorage.setItem('hpdh_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('hpdh_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('hpdh_requisitions', JSON.stringify(requisitions));
  }, [requisitions]);

  useEffect(() => {
    localStorage.setItem('hpdh_social_work_cases', JSON.stringify(socialWorkCases));
  }, [socialWorkCases]);

  // Manejadores de eventos de actualización
  const handleAddSocialWorkCase = (newCase: SocialWorkRecord) => {
    setSocialWorkCases(prev => [newCase, ...prev]);
  };

  const handleUpdateSocialWorkStatus = (id: string, status: SocialCaseStatus) => {
    setSocialWorkCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };
  const handleAddTriage = (newTriage: TriageAdmission) => {
    setTriageList([newTriage, ...triageList]);
  };

  const handleUpdateTriageStatus = (id: string, status: TriageAdmission['status']) => {
    setTriageList(triageList.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleAddScheduled = (admission: ScheduledAdmission) => {
    setScheduledAdmissions([admission, ...scheduledAdmissions]);
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients([newPatient, ...patients]);
  };

  // Ingreso de emergencia: crea paciente + triage ROJO al mismo tiempo
  const handleEmergencyAdmit = (newPatient: Patient, triage: TriageAdmission) => {
    setPatients(prev => [newPatient, ...prev]);
    setTriageList(prev => [triage, ...prev]);
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

  const handleUpdateTransaction = (updatedTx: CashTransaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
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

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setStaff(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (authUser && authUser.id === updatedUser.id) {
      setAuthUser(updatedUser);
      setCurrentUser(updatedUser);
      localStorage.setItem('hpdh_auth_user', JSON.stringify(updatedUser));
    }
  };

  const handleDeleteUser = (userId: string) => {
    setStaff(prev => prev.filter(u => u.id !== userId));
  };

  // Manejadores de Almacén General
  const handleAddWarehouseItem = (item: WarehouseItem) => {
    setWarehouse([item, ...warehouse]);
  };

  const handleDispatchWarehouse = (disp: WarehouseDispatch) => {
    setWarehouseDispatches([disp, ...warehouseDispatches]);
  };

  const handleUpdateWarehouseStock = (id: string, newStock: number) => {
    setWarehouse(warehouse.map(item => item.id === id ? { ...item, stockCurrent: newStock } : item));
  };

  // Manejadores de Compras y Proveedores
  const handleAddPurchaseOrder = (order: PurchaseOrder) => {
    setPurchaseOrders([order, ...purchaseOrders]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: PurchaseOrder['status'], authorizedBy?: string) => {
    setPurchaseOrders(purchaseOrders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          authorizedBy: authorizedBy || o.authorizedBy,
          authorizedAt: authorizedBy ? new Date().toISOString().replace('T', ' ').substring(0, 16) : o.authorizedAt
        };
      }
      return o;
    }));
  };

  const handleAddSupplier = (supplier: Supplier) => {
    setSuppliers([supplier, ...suppliers]);
  };

  const handleApproveRequisition = (reqId: string) => {
    setRequisitions(requisitions.map(r => r.id === reqId ? { ...r, status: 'APROBADA_PARA_OC' } : r));
  };

  // Elementos de navegación
  const allNavItems = [
    { id: 'menu', label: 'Menú Principal', icon: Home },
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
    { id: 'almacen', label: 'Almacén General', icon: Boxes, badge: warehouse.filter(i => i.stockCurrent <= i.stockMinimum).length > 0 ? '⚠️' : undefined },
    { id: 'compras', label: 'Compras & Proveedores', icon: ShoppingBag, badge: purchaseOrders.filter(o => o.status === 'PENDIENTE_AUTORIZACION').length > 0 ? '📝' : undefined },
    { id: 'trabajo_social', label: 'Trabajo Social', icon: HeartHandshake },
  ];

  const isFullAdmin = currentUser.role === 'ADMINISTRADOR_UNICO' || (currentUser.allowedModules && currentUser.allowedModules.includes('*'));

  const navItems = isFullAdmin
    ? allNavItems
    : allNavItems.filter(item => item.id === 'menu' || (currentUser.allowedModules && currentUser.allowedModules.includes(item.id)));

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden text-slate-100">
      {/* 1. Encabezado Maestro Hospital Puerta de Hierro */}
      <header className="shrink-0 z-50 neo-glass-panel border-x-0 border-t-0 rounded-none px-4 md:px-6 py-2 bg-white/10 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Logotipo y Título */}
          <div className="flex items-center gap-4">
            <button 
              id="mobile-menu-trigger-btn"
              aria-label="Abrir Menú Módulos"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden neo-mobile-menu-trigger ${mobileMenuOpen ? 'active' : ''}`}
              title="Módulos Hospitalarios"
            >
              {mobileMenuOpen ? <X size={20} strokeWidth={2.6} /> : <Menu size={21} strokeWidth={2.6} />}
            </button>
            <HospitalLogo size="md" onClick={() => setActiveTab('menu')} />
          </div>

          {/* Barra de Acciones Neo-Tactile (Idéntica a la imagen de referencia) */}
          <div className="hidden xl:flex items-center gap-4">
            {/* Cluster de Acciones Táctiles con Botón de Anillo Neón Cian */}
            <div className="neo-action-bar">
              <button 
                onClick={() => setActiveTab('menu')} 
                className={`neo-icon-btn ${activeTab === 'menu' ? 'neo-icon-btn-active' : ''}`}
                title="Menú Principal (Inicio)"
              >
                🏠
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`neo-icon-btn ${activeTab === 'dashboard' ? 'neo-icon-btn-active' : ''}`}
                title="Panel de Control General"
              >
                ≡
              </button>
              <button 
                onClick={() => setActiveTab('triage')} 
                className={`neo-icon-btn ${activeTab === 'triage' ? 'neo-icon-btn-active' : ''}`}
                title="Triage Choque"
              >
                +
              </button>
              <button 
                onClick={() => setActiveTab('hospitalizacion')} 
                className={`neo-icon-btn ${activeTab === 'hospitalizacion' ? 'neo-icon-btn-active' : ''}`}
                title="Camas"
              >
                ·
              </button>
              <button 
                onClick={() => setActiveTab('chat')} 
                className="neo-icon-btn neo-icon-btn-ring neo-icon-btn-active"
                title="Chat Médico y Códigos de Urgencia"
              >
                💬
              </button>
            </div>
          </div>

          {/* Información de Guardia y Usuario Activo */}
          <div className="flex items-center gap-3">
            {/* Badge de Administrador Único si aplica */}
            {currentUser.role === 'ADMINISTRADOR_UNICO' ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-600/30 to-cyan-500/30 border border-cyan-400 text-xs shadow-[0_0_15px_rgba(0,242,254,0.35)]">
                <span className="text-yellow-400 text-xs">⭐</span>
                <span className="text-cyan-200 font-extrabold tracking-wide">ADMIN ÚNICO</span>
              </div>
            ) : (
              /* Badge de Turno */
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/15 text-xs shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                <span className="neo-badge-dot bg-cyan-400"></span>
                <span className="text-slate-400">TURNO:</span>
                <strong className="text-cyan-300 font-mono">MATUTINO (07:00 - 15:00)</strong>
              </div>
            )}

            {/* Selector de Usuario Activo Táctil */}
            <div className="relative">
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const u = staff.find(s => s.id === e.target.value);
                  if (u) {
                    setCurrentUser(u);
                    setAuthUser(u);
                    localStorage.setItem('hpdh_auth_user', JSON.stringify(u));
                  }
                }}
                className="neo-input neo-select text-xs py-1.5 pl-3 pr-8 font-semibold bg-slate-900/90 text-white border-blue-500/40"
              >
                {staff.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.fullName} ({u.role === 'ADMINISTRADOR_UNICO' ? '⭐ ADMIN ÚNICO' : u.role.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Cerrar Sesión 3D Porcelana */}
            <button
              onClick={handleLogout}
              className="btn-neo btn-neo-defart text-xs px-2.5 py-1.5 flex items-center gap-1 text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 border border-rose-500/30 transition-all active:scale-95"
              title="Cerrar sesión y volver a la pantalla de bienvenida"
            >
              <LogOut size={13} className="text-rose-400 shrink-0" />
              <span className="hidden sm:inline font-bold">Salir</span>
            </button>

            {/* Botón de Emergencia Táctil */}
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

      {/* 2. Barra de Navegación Táctil Neo-Tactile (Solo visible cuando se navega dentro de un módulo para no duplicar el Menú Principal) */}
      {activeTab !== 'menu' && (
        <nav className="shrink-0 neo-glass-panel border-x-0 rounded-none px-4 md:px-6 py-1.5 overflow-x-auto hidden lg:flex items-center gap-2 bg-white/5 backdrop-blur-xl animate-fadeIn">
          {/* Botón Destacado para Regresar al Menú Principal con diseño y efecto idéntico a los demás botones */}
          <button
            onClick={() => setActiveTab('menu')}
            className="btn-neo btn-neo-defart text-xs px-4 py-2 shrink-0 flex items-center gap-1.5 font-bold"
            title="Volver al Menú Principal"
          >
            <Home size={15} className="text-cyan-600 shrink-0" />
            <span>← Menú Principal</span>
          </button>

          <div className="w-px h-5 bg-white/20 shrink-0 mx-1"></div>

          {navItems.filter(item => item.id !== 'menu').map((item) => {
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
      )}

      {/* Menú Móvil Desplegable (Drawer Modal Neo-Tactile con Botones 3D Porcelana) */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden neo-mobile-drawer-overlay animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="neo-mobile-drawer-sheet">
            {/* Header del Modal */}
            <div className="neo-mobile-drawer-header">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-sm">
                  <Menu size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white tracking-wide">Módulos Hospitalarios</h3>
                  <p className="text-[10px] font-semibold text-slate-400">Hospital Puerta de Hierro Tepic</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all active:scale-90"
                title="Cerrar Menú"
              >
                <X size={16} />
              </button>
            </div>

            {/* Lista de Botones 3D Porcelana Táctil con Iluminación Azul Interactiva */}
            <div 
              className="neo-mobile-drawer-body"
              onTouchMove={handleDrawerTouchMove}
              onTouchEnd={handleDrawerTouchEnd}
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const isHovered = hoveredMobileItem === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    data-drawer-id={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                      setHoveredMobileItem(null);
                    }}
                    onMouseEnter={() => setHoveredMobileItem(item.id)}
                    onMouseLeave={() => setHoveredMobileItem(null)}
                    onTouchStart={() => setHoveredMobileItem(item.id)}
                    className={`neo-mobile-drawer-btn ${isActive ? 'active' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  >
                    <div className="neo-drawer-icon-box">
                      <Icon size={17} />
                    </div>
                    <span className="neo-drawer-label flex-1 text-xs font-black">{item.label}</span>
                    {item.badge && (
                      <span className="text-[11px] font-black mr-1">{item.badge}</span>
                    )}
                    <ChevronRight size={15} className="neo-drawer-chevron" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Contenido Principal con espaciado inferior seguro para el dock móvil */}
      <main className="flex-1 overflow-y-auto px-4 py-2.5 md:px-6 md:py-2.5 max-w-7xl w-full mx-auto pb-28 lg:pb-2">
        {activeTab === 'menu' && (
          <MainMenuHub
            currentUser={currentUser}
            triageList={triageList}
            beds={beds}
            criticalWarehouseCount={warehouse.filter(i => i.stockCurrent <= i.stockMinimum).length}
            pendingOrdersCount={purchaseOrders.filter(o => o.status === 'PENDIENTE_AUTORIZACION').length}
            onSelectModule={(tab) => setActiveTab(tab)}
          />
        )}

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
            onAddPatient={handleAddPatient}
            onEmergencyAdmit={handleEmergencyAdmit}
          />
        )}

        {activeTab === 'admision_programada' && (
          <ScheduledAdmissionsModule
            patients={patients}
            scheduledList={scheduledAdmissions}
            onAddScheduled={handleAddScheduled}
            onUpdateStatus={handleUpdateScheduledStatus}
            onAddPatient={handleAddPatient}
            onEmergencyAdmit={handleEmergencyAdmit}
          />
        )}

        {activeTab === 'consultorios' && (
          <ConsultoriosModule
            patients={patients}
            notes={notes}
            triageList={triageList}
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
            currentUser={currentUser}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
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
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'almacen' && (
          <AlmacenModule
            inventory={warehouse}
            dispatches={warehouseDispatches}
            onAddItem={handleAddWarehouseItem}
            onDispatchItems={handleDispatchWarehouse}
            onUpdateStock={handleUpdateWarehouseStock}
          />
        )}

        {activeTab === 'compras' && (
          <ComprasModule
            orders={purchaseOrders}
            suppliers={suppliers}
            requisitions={requisitions}
            currentUser={currentUser}
            onAddOrder={handleAddPurchaseOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAddSupplier={handleAddSupplier}
            onApproveRequisition={handleApproveRequisition}
          />
        )}

        {activeTab === 'trabajo_social' && (
          <TrabajoSocialModule
            cases={socialWorkCases}
            patients={patients}
            currentUser={currentUser}
            onAddCase={handleAddSocialWorkCase}
            onUpdateCaseStatus={handleUpdateSocialWorkStatus}
          />
        )}

        {/* Pie de Página Móvil Institucional que scrollea naturalmente */}
        <div className="lg:hidden text-center pt-3 pb-6 text-[10.5px] text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span>🏛️ Hospital Puerta de Hierro Tepic</span>
            <span>•</span>
            <span className="text-cyan-300 font-mono font-semibold">NOM-024 / NOM-004 / NOM-016</span>
          </div>
          <div className="text-cyan-400 font-bold font-mono">
            Urgencias: (311) 129-5206
          </div>
        </div>
      </main>

      {/* 4. Barra Inferior Táctil para Dispositivos Móviles (Smartphones e iPhone en mano) */}
      <nav className="lg:hidden neo-mobile-bottom-nav">
        {[
          { id: 'menu', label: 'Inicio', icon: Home },
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
              className={`neo-mobile-nav-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} className="neo-mobile-nav-icon" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 5. Pie de Página Institucional y Cumplimiento de Normas Mexicanas (Barra de estado compacta) */}
      <footer className="shrink-0 border-t border-white/15 bg-white/5 backdrop-blur-xl py-1.5 px-4 md:px-6 text-xs text-slate-400 hidden lg:flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span>🏛️ Hospital Puerta de Hierro Tepic</span>
          <span>•</span>
          <span className="text-cyan-300 font-mono font-semibold">NOM-024 / NOM-004 / NOM-016 / NOM-007</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline text-slate-400">Protección LFPDPPP</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span>Av. Emilio M. González #221, Cd. Industrial</span>
          <span>•</span>
          <span className="text-cyan-400 font-bold font-mono">Urgencias: (311) 129-5206</span>
        </div>
      </footer>

      {/* Portal Flotante y Moderno de Bienvenida y Autenticación con Logotipo Oficial 3D */}
      {!authUser && (
        <LoginWelcomeModal
          staffList={staff}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;
