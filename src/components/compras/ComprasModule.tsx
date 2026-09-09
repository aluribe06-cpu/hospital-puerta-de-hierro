// ==============================================================================
// MÓDULO 14: ÁREA DE COMPRAS Y PROVEEDORES HOSPITALARIOS
// Hospital Puerta de Hierro (Tepic) - Centro Médico de Alta Especialidad
// ==============================================================================

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  FileSpreadsheet, 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Send, 
  FileText, 
  Star, 
  Phone, 
  Mail, 
  ShieldCheck, 
  X,
  Truck,
  CheckCheck,
  Award
} from 'lucide-react';
import { 
  PurchaseOrder, 
  Supplier, 
  PurchaseRequisition, 
  UserProfile, 
  PurchaseOrderItem, 
  SupplierCategory 
} from '../../types/hospital';
import { exportPurchaseOrdersToExcel } from '../../lib/exportEngine';
import { logAuditAction } from '../../lib/supabaseClient';

interface ComprasModuleProps {
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  requisitions: PurchaseRequisition[];
  currentUser: UserProfile;
  onAddOrder: (order: PurchaseOrder) => void;
  onUpdateOrderStatus: (orderId: string, status: PurchaseOrder['status'], authorizedBy?: string) => void;
  onAddSupplier: (supplier: Supplier) => void;
  onApproveRequisition: (reqId: string) => void;
}

export const ComprasModule: React.FC<ComprasModuleProps> = ({
  orders,
  suppliers,
  requisitions,
  currentUser,
  onAddOrder,
  onUpdateOrderStatus,
  onAddSupplier,
  onApproveRequisition,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ORDENES' | 'REQUISICIONES' | 'PROVEEDORES'>('ORDENES');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');

  // Modales
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);

  // Formulario Nueva OC
  const [orderSupplierId, setOrderSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [orderDepartment, setOrderDepartment] = useState('Almacén General / Quirófano');
  const [orderPaymentTerms, setOrderPaymentTerms] = useState('Crédito 30 días');
  const [orderExpectedDate, setOrderExpectedDate] = useState('2026-09-15');
  const [orderNotes, setOrderNotes] = useState('Suministro hospitalario mensual');
  
  // Partidas de la nueva OC
  const [itemDescription, setItemDescription] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(10);
  const [itemUnitCost, setItemUnitCost] = useState<number>(350);
  const [orderItemsList, setOrderItemsList] = useState<PurchaseOrderItem[]>([
    {
      itemId: 'it-init-1',
      sku: 'ALM-SOL-002',
      description: 'Solución Hartmann Electrolitos 1000ml (Caja c/12)',
      quantity: 20,
      unitCost: 365.00,
      subtotal: 7300.00
    }
  ]);

  // Formulario Nuevo Proveedor
  const [newBizName, setNewBizName] = useState('');
  const [newRfc, setNewRfc] = useState('');
  const [newCommName, setNewCommName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState<SupplierCategory>('MATERIAL_CURACION');
  const [newCreditDays, setNewCreditDays] = useState(30);
  const [newAddress, setNewAddress] = useState('');

  // KPIs
  const totalPresupuesto = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDIENTE_AUTORIZACION');
  const activeSuppliersCount = suppliers.filter(s => s.status === 'ACTIVO').length;
  const pendingRequisitionsCount = requisitions.filter(r => r.status === 'PENDIENTE').length;

  const isSuperAdmin = currentUser.role === 'ADMINISTRADOR_UNICO' || currentUser.role === 'DIRECTOR_MEDICO';

  // Manejador para agregar partida a la OC
  const handleAddItemToOrder = () => {
    if (!itemDescription) return;
    const sub = Number(itemQuantity) * Number(itemUnitCost);
    const newItem: PurchaseOrderItem = {
      itemId: 'it-' + Date.now(),
      sku: 'SKU-' + Math.floor(100 + Math.random() * 900),
      description: itemDescription,
      quantity: Number(itemQuantity),
      unitCost: Number(itemUnitCost),
      subtotal: sub
    };
    setOrderItemsList([...orderItemsList, newItem]);
    setItemDescription('');
    setItemQuantity(10);
  };

  const handleRemoveItemFromOrder = (index: number) => {
    setOrderItemsList(orderItemsList.filter((_, idx) => idx !== index));
  };

  // Crear Orden de Compra
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItemsList.length === 0) {
      alert('Debe agregar al menos una partida a la orden de compra.');
      return;
    }

    const supplierObj = suppliers.find(s => s.id === orderSupplierId) || suppliers[0];
    const subtotal = orderItemsList.reduce((acc, curr) => acc + curr.subtotal, 0);
    const taxIva = subtotal * 0.16;
    const totalAmount = subtotal + taxIva;

    const newOrder: PurchaseOrder = {
      id: 'oc-' + Date.now(),
      orderFolio: 'OC-2026-' + Math.floor(1000 + Math.random() * 9000),
      supplierId: supplierObj.id,
      supplierName: supplierObj.businessName,
      supplierRfc: supplierObj.rfc,
      requestingDepartment: orderDepartment,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: orderExpectedDate,
      paymentTerms: orderPaymentTerms,
      items: orderItemsList,
      subtotal,
      taxIva,
      totalAmount,
      status: 'PENDIENTE_AUTORIZACION',
      notes: orderNotes
    };

    onAddOrder(newOrder);

    logAuditAction({
      userName: currentUser.fullName,
      userRole: currentUser.role,
      actionType: 'GENERACION_ORDEN_COMPRA',
      resourceAffected: `Orden ${newOrder.orderFolio}`,
      details: `Proveedor: ${supplierObj.businessName}. Monto Total: $${totalAmount.toFixed(2)} MXN`,
    });

    setShowNewOrderModal(false);
    setOrderItemsList([]);
  };

  // Autorización con firma del Administrador Único
  const handleAuthorizeOrder = (order: PurchaseOrder) => {
    const authorizedByName = `${currentUser.fullName} (${currentUser.role === 'ADMINISTRADOR_UNICO' ? 'Administrador Único' : 'Dirección Médica'})`;
    onUpdateOrderStatus(order.id, 'AUTORIZADA', authorizedByName);

    logAuditAction({
      userName: currentUser.fullName,
      userRole: currentUser.role,
      actionType: 'AUTORIZACION_EJECUTIVA_COMPRAS',
      resourceAffected: `Orden ${order.orderFolio}`,
      details: `Firma y validación presupuestal ejecutada por ${authorizedByName}. Monto: $${order.totalAmount.toFixed(2)} MXN`,
    });
  };

  // Registrar nuevo proveedor
  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const newSup: Supplier = {
      id: 'sup-' + Date.now(),
      businessName: newBizName,
      rfc: newRfc.toUpperCase(),
      commercialName: newCommName || newBizName,
      contactPerson: newContact,
      email: newEmail,
      phone: newPhone,
      category: newCategory,
      creditDays: Number(newCreditDays),
      rating: 5.0,
      address: newAddress,
      status: 'ACTIVO'
    };

    onAddSupplier(newSup);

    logAuditAction({
      userName: currentUser.fullName,
      userRole: currentUser.role,
      actionType: 'ALTA_PROVEEDOR_HOSPITALARIO',
      resourceAffected: `Proveedor ${newBizName} (${newRfc})`,
      details: `Giro: ${newCategory}. Días de crédito: ${newCreditDays}`,
    });

    setShowNewSupplierModal(false);
    setNewBizName('');
    setNewRfc('');
    setNewContact('');
  };

  // Filtrado de órdenes
  const filteredOrders = orders.filter(ord => {
    const matchQ = 
      ord.orderFolio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.requestingDepartment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'TODAS' || ord.status === statusFilter;
    return matchQ && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* 1. Encabezado Maestro de Compras */}
      <div className="neo-glass-panel p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
              <ShoppingBag size={22} className="animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Área de Compras & Proveedores
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  STEP 14
                </span>
              </h1>
              <p className="text-xs text-slate-300">
                Requisiciones departamentales, órdenes de compra (OC) y padrón de proveedores hospitalarios
              </p>
            </div>
          </div>
        </div>

        {/* Botonera de Acciones Táctiles */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => exportPurchaseOrdersToExcel(orders, suppliers)}
            className="btn-neo btn-neo-defart text-xs px-3.5 py-2 flex items-center gap-2 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-950/40 border border-emerald-500/30 transition-all active:scale-95"
            title="Exportar órdenes de compra a Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} className="text-emerald-400" />
            <span className="font-bold">Exportar Órdenes (.xlsx)</span>
          </button>

          <button
            onClick={() => setShowNewSupplierModal(true)}
            className="btn-neo btn-neo-defart text-xs px-3.5 py-2 flex items-center gap-2 text-sky-300 hover:text-sky-100 hover:bg-sky-950/40 border border-sky-500/30 transition-all active:scale-95"
          >
            <Building2 size={15} className="text-sky-400" />
            <span className="font-bold">Nuevo Proveedor</span>
          </button>

          <button
            onClick={() => setShowNewOrderModal(true)}
            className="btn-neo btn-neo-primary text-xs px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(14,165,233,0.35)] hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Nueva Orden (OC)</span>
          </button>
        </div>
      </div>

      {/* 2. Cuadrícula de KPIs Táctiles de Compras */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Presupuesto Comprometido */}
        <div className="neo-glass-panel p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/20 shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Presupuesto en OC</div>
            <div className="text-xl font-black text-sky-300 font-mono">
              ${totalPresupuesto.toLocaleString('es-MX', { maximumFractionDigits: 0 })} <span className="text-[10px] text-slate-400 font-normal">MXN</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Órdenes Pendientes de Autorización */}
        <div className="neo-glass-panel p-3.5 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${pendingOrders.length > 0 ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/20'}`}>
            <Clock size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Por Autorizar</div>
            <div className={`text-xl font-black font-mono ${pendingOrders.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {pendingOrders.length} <span className="text-xs font-normal text-slate-300">órdenes</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Proveedores Calificados */}
        <div className="neo-glass-panel p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/20 shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Proveedores Activos</div>
            <div className="text-xl font-black text-teal-300 font-mono">{activeSuppliersCount} <span className="text-xs text-slate-400 font-normal">empresas</span></div>
          </div>
        </div>

        {/* KPI 4: Requisiciones Departamentales */}
        <div className="neo-glass-panel p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/20 shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Requisiciones</div>
            <div className="text-xl font-black text-purple-300 font-mono">{pendingRequisitionsCount} <span className="text-xs text-slate-400 font-normal">en espera</span></div>
          </div>
        </div>
      </div>

      {/* 3. Selector de Pestañas Principales del Módulo */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveSubTab('ORDENES')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'ORDENES'
              ? 'bg-sky-500 text-white shadow-[0_4px_14px_rgba(14,165,233,0.4)]'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <ShoppingBag size={15} />
          <span>Órdenes de Compra ({orders.length})</span>
          {pendingOrders.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-slate-950 font-black">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('REQUISICIONES')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'REQUISICIONES'
              ? 'bg-sky-500 text-white shadow-[0_4px_14px_rgba(14,165,233,0.4)]'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <FileText size={15} />
          <span>Requisiciones de Servicios ({requisitions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PROVEEDORES')}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'PROVEEDORES'
              ? 'bg-sky-500 text-white shadow-[0_4px_14px_rgba(14,165,233,0.4)]'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Building2 size={15} />
          <span>Padrón de Proveedores ({suppliers.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: ÓRDENES DE COMPRA (OC) */}
      {/* ========================================================================= */}
      {activeSubTab === 'ORDENES' && (
        <div className="space-y-3">
          {/* Filtros */}
          <div className="neo-glass-panel p-3 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por Folio OC, proveedor o área..."
                className="neo-input text-xs pl-9 pr-3 py-2 w-full bg-slate-900/80 text-white placeholder-slate-400 border-white/10 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: 'TODAS', label: 'Todas' },
                { id: 'PENDIENTE_AUTORIZACION', label: 'Por Autorizar' },
                { id: 'AUTORIZADA', label: 'Autorizadas' },
                { id: 'ENVIADA_PROVEEDOR', label: 'Enviadas' },
                { id: 'SURTIDA_COMPLETA', label: 'Surtidas' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                    statusFilter === st.id
                      ? 'bg-sky-500 text-white shadow-[0_2px_8px_rgba(14,165,233,0.4)]'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listado de Órdenes de Compra */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredOrders.length === 0 ? (
              <div className="col-span-2 neo-glass-panel p-8 text-center text-slate-400">
                No se encontraron órdenes de compra con los filtros especificados.
              </div>
            ) : (
              filteredOrders.map(order => {
                const isPending = order.status === 'PENDIENTE_AUTORIZACION';
                const isAuthorized = order.status === 'AUTORIZADA';
                const isSent = order.status === 'ENVIADA_PROVEEDOR';
                const isFulfilled = order.status === 'SURTIDA_COMPLETA';

                return (
                  <div key={order.id} className="neo-glass-panel p-4 space-y-3 relative overflow-hidden border border-white/10 hover:border-sky-500/30 transition-all">
                    {/* Header de Tarjeta */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-sky-300 bg-sky-950/70 px-2 py-0.5 rounded-md border border-sky-400/30">
                            {order.orderFolio}
                          </span>
                          <span className="text-xs text-slate-400">{order.orderDate}</span>
                        </div>
                        <h2 className="text-sm font-bold text-white mt-1">{order.supplierName}</h2>
                        <div className="text-[11px] text-slate-400 font-mono">
                          RFC: {order.supplierRfc} • Solicitó: <strong className="text-slate-200">{order.requestingDepartment}</strong>
                        </div>
                      </div>

                      {/* Estatus Badge */}
                      <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full border ${
                        isPending ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 animate-pulse' :
                        isAuthorized ? 'bg-sky-950/80 text-sky-300 border-sky-500/40' :
                        isSent ? 'bg-blue-950/80 text-blue-300 border-blue-500/40' :
                        isFulfilled ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Partidas de Insumos */}
                    <div className="bg-black/30 p-2 rounded-xl border border-white/5 space-y-1 text-xs">
                      <div className="text-[10.5px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                        Partidas Adjudicadas:
                      </div>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11.5px] py-0.5 border-b border-white/5 last:border-0">
                          <span className="text-slate-200">• {it.description} <strong className="text-slate-400 font-mono">(x{it.quantity})</strong></span>
                          <span className="font-mono text-slate-300">${it.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totales y Firma */}
                    <div className="flex items-end justify-between pt-1 border-t border-white/10 text-xs">
                      <div>
                        <div className="text-[10.5px] text-slate-400">Condición: {order.paymentTerms}</div>
                        {order.authorizedBy && (
                          <div className="text-[10px] text-teal-300 flex items-center gap-1 mt-0.5">
                            <CheckCircle size={11} className="text-teal-400" />
                            <span>Firmado por: <strong>{order.authorizedBy}</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Total con IVA:</div>
                        <div className="text-lg font-black text-white font-mono">
                          ${order.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs text-sky-400">MXN</span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Acciones de Autorización */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                      {isPending && isSuperAdmin && (
                        <button
                          onClick={() => handleAuthorizeOrder(order)}
                          className="btn-neo btn-neo-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                          title="Autorizar orden de compra con firma del Administrador Único"
                        >
                          <span>⭐</span>
                          <span>Autorizar con Firma Digital</span>
                        </button>
                      )}

                      {isAuthorized && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'ENVIADA_PROVEEDOR')}
                          className="btn-neo text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-xl bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/30 font-bold"
                        >
                          <Send size={13} />
                          <span>Enviar a Proveedor</span>
                        </button>
                      )}

                      {isSent && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, 'SURTIDA_COMPLETA')}
                          className="btn-neo text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-xl bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/30 font-bold"
                        >
                          <Truck size={13} />
                          <span>Ingresar a Almacén</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: REQUISICIONES DE SERVICIOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'REQUISICIONES' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {requisitions.map(req => (
              <div key={req.id} className="neo-glass-panel p-4 space-y-3 border border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-400/30">
                      {req.requisitionFolio}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{req.department}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    req.urgency === 'URGENTE_DESABASTO' ? 'bg-rose-950 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {req.urgency === 'URGENTE_DESABASTO' ? '🚨 Desabasto Crítico' : 'Normal'}
                  </span>
                </div>

                <div className="text-xs text-slate-300 bg-black/30 p-2 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Material Solicitado:</div>
                  <div className="mt-0.5">{req.itemsDescription}</div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                  <div className="text-[11px] text-slate-400">
                    Solicitó: <strong className="text-slate-200">{req.requestedBy}</strong>
                  </div>
                  <div className="font-mono font-bold text-sky-300">
                    ${req.estimatedBudget.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {req.status === 'PENDIENTE' ? (
                  <button
                    onClick={() => {
                      onApproveRequisition(req.id);
                      alert(`Requisición ${req.requisitionFolio} aprobada para asignación de Orden de Compra.`);
                    }}
                    className="w-full btn-neo text-xs py-2 bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-bold rounded-xl shadow-[0_2px_8px_rgba(147,51,234,0.3)] flex items-center justify-center gap-1"
                  >
                    <CheckCheck size={14} />
                    <span>Aprobar Requisición</span>
                  </button>
                ) : (
                  <div className="text-center text-[11px] font-semibold text-teal-300 py-1 bg-teal-950/40 rounded-lg border border-teal-500/30">
                    ✅ Aprobada para OC ({req.linkedOrderFolio || 'Asignada'})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: PADRÓN DE PROVEEDORES HOSPITALARIOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'PROVEEDORES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suppliers.map(sup => (
            <div key={sup.id} className="neo-glass-panel p-4 space-y-3 border border-white/10 hover:border-teal-500/30 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{sup.businessName}</h3>
                  <div className="text-xs text-sky-300 font-semibold">{sup.commercialName}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">RFC: {sup.rfc}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                  {sup.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300 pt-1 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Phone size={12} className="text-slate-400 shrink-0" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Mail size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{sup.email}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Atención: <strong className="text-slate-200">{sup.contactPerson}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center gap-1 text-yellow-400 font-bold">
                  <Star size={13} className="fill-yellow-400 text-yellow-400" />
                  <span>{sup.rating.toFixed(1)}</span>
                </div>
                <div className="text-[11px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  Crédito: {sup.creditDays} días
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVA ORDEN DE COMPRA (OC) */}
      {/* ========================================================================= */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="neo-auth-card w-full max-w-2xl p-6 bg-slate-900/95 border border-sky-500/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-sky-400" />
                <span>Generar Orden de Compra Hospitalaria (OC)</span>
              </h3>
              <button onClick={() => setShowNewOrderModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Seleccionar Proveedor</label>
                  <select
                    value={orderSupplierId}
                    onChange={(e) => setOrderSupplierId(e.target.value)}
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.businessName} (Crédito {s.creditDays} días)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Departamento Destino</label>
                  <input
                    type="text"
                    value={orderDepartment}
                    onChange={(e) => setOrderDepartment(e.target.value)}
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Condición de Pago</label>
                  <select
                    value={orderPaymentTerms}
                    onChange={(e) => setOrderPaymentTerms(e.target.value)}
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                  >
                    <option value="Crédito 30 días">Crédito 30 días</option>
                    <option value="Crédito 45 días">Crédito 45 días</option>
                    <option value="Crédito 60 días">Crédito 60 días</option>
                    <option value="Contado Contra Entrega">Contado Contra Entrega</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Fecha Promesa de Entrega</label>
                  <input
                    type="date"
                    value={orderExpectedDate}
                    onChange={(e) => setOrderExpectedDate(e.target.value)}
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Agregar Partidas */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2">
                <div className="text-xs font-bold text-sky-300">Agregar Partida / Insumo:</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder="Descripción de insumo o material..."
                      className="neo-input w-full p-1.5 bg-slate-950 text-white text-xs rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Number(e.target.value))}
                      placeholder="Cant."
                      min="1"
                      className="neo-input w-full p-1.5 bg-slate-950 text-white text-xs rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      value={itemUnitCost}
                      onChange={(e) => setItemUnitCost(Number(e.target.value))}
                      placeholder="Costo"
                      className="neo-input w-full p-1.5 bg-slate-950 text-white text-xs rounded-lg font-mono"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddItemToOrder}
                  className="btn-neo text-xs px-3 py-1 bg-sky-600 text-white rounded-lg font-semibold"
                >
                  + Agregar a la Lista
                </button>

                {/* Lista de Partidas Agregadas */}
                <div className="mt-2 space-y-1">
                  {orderItemsList.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white/5">
                      <span>• {it.description} (x{it.quantity} @ ${it.unitCost.toFixed(2)})</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-bold">${it.subtotal.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromOrder(idx)}
                          className="text-rose-400 hover:text-rose-300 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Notas y Justificación</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="btn-neo text-xs px-3 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-primary text-xs px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl shadow-[0_4px_12px_rgba(14,165,233,0.4)]"
                >
                  Emitir Orden de Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVO PROVEEDOR */}
      {/* ========================================================================= */}
      {showNewSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="neo-auth-card w-full max-w-lg p-6 bg-slate-900/95 border border-sky-500/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 size={18} className="text-sky-400" />
                <span>Alta de Proveedor Hospitalario</span>
              </h3>
              <button onClick={() => setShowNewSupplierModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Razón Social Oficial</label>
                <input
                  type="text"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  placeholder="Ej: Distribuidora Médica del Pacífico S.A. de C.V."
                  required
                  className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">RFC Oficial</label>
                  <input
                    type="text"
                    value={newRfc}
                    onChange={(e) => setNewRfc(e.target.value)}
                    placeholder="DMP090101AB1"
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Nombre Comercial</label>
                  <input
                    type="text"
                    value={newCommName}
                    onChange={(e) => setNewCommName(e.target.value)}
                    placeholder="DIMEPAC"
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Persona de Contacto</label>
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="Lic. Karla Guzmán"
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Teléfono de Pedidos</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="311-123-4567"
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Correo Electrónico</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ventas@proveedor.com"
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Días de Crédito</label>
                  <input
                    type="number"
                    value={newCreditDays}
                    onChange={(e) => setNewCreditDays(Number(e.target.value))}
                    min="0"
                    required
                    className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Dirección Fiscal / Sede</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Calle, Número, Colonia, Ciudad"
                  className="neo-input w-full p-2 bg-slate-950 text-white border-white/15 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewSupplierModal(false)}
                  className="btn-neo text-xs px-3 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-neo btn-neo-primary text-xs px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl"
                >
                  Registrar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
