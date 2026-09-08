// ==============================================================================
// CHAT MÉDICO INSTITUCIONAL EN TIEMPO REAL (ESTILO WHATSAPP)
// Hospital Puerta de Hierro (Tepic) - Familiar, Seguro y Rápido
// ==============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Search, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  FileText, 
  Image as ImageIcon, 
  Phone, 
  Video, 
  MoreVertical,
  Smile,
  Shield,
  Clock,
  Play,
  Volume2
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../../types/hospital';

interface MedicalChatModuleProps {
  messages: ChatMessage[];
  currentUser: UserProfile;
  staff: UserProfile[];
  onSendMessage: (msg: ChatMessage) => void;
}

export const MedicalChatModule: React.FC<MedicalChatModuleProps> = ({
  messages,
  currentUser,
  staff,
  onSendMessage,
}) => {
  const [activeChannel, setActiveChannel] = useState<string>('URGENCIAS_TRIAGE');
  const [activeRecipient, setActiveRecipient] = useState<UserProfile | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'URGENCIAS_TRIAGE', name: '🚨 Urgencias & Triage', desc: 'Códigos de choque y atención inmediata', unread: 1 },
    { id: 'QUIROFANOS_CEYE', name: '🏥 Quirófanos & CEYE', desc: 'Disponibilidad de salas e instrumental', unread: 0 },
    { id: 'HOSPITALIZACION_PISOS', name: '🛏️ Hospitalización & UCI', desc: 'Censo, traslados y notas de enfermería', unread: 0 },
    { id: 'LABORATORIO_IMAGEN', name: '🧪 Laboratorio & Rayos X', desc: 'Valores críticos y liberación de estudios', unread: 0 },
    { id: 'GUARDIA_MEDICA', name: '👨‍⚕️ Médicos Guardia Tepic', desc: 'Pase de turno y avisos de dirección', unread: 0 },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel, activeRecipient]);

  const handleSend = (text?: string, attachmentType?: ChatMessage['attachmentType']) => {
    const textToSend = text || inputText;
    if (!textToSend.trim() && !attachmentType) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      channelName: activeRecipient ? 'DIRECTO' : activeChannel,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      recipientId: activeRecipient ? activeRecipient.id : undefined,
      messageText: textToSend,
      attachmentType,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onSendMessage(newMsg);
    setInputText('');
    setShowAttachMenu(false);

    // Simular respuesta médica automática si es un canal activo
    if (!activeRecipient) {
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: 'msg-auto-' + Date.now(),
          channelName: activeChannel,
          senderId: 'usr-5',
          senderName: 'Enf. Jefa Rocío Barajas',
          senderRole: 'ENFERMERIA_JEFA',
          messageText: 'Recibido en central de enfermería. Procediendo de acuerdo a indicación médica.',
          isRead: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        onSendMessage(autoReply);
      }, 1500);
    }
  };

  // Filtrar mensajes del canal o chat directo
  const currentMessages = messages.filter(m => {
    if (activeRecipient) {
      return (
        (m.senderId === currentUser.id && m.recipientId === activeRecipient.id) ||
        (m.senderId === activeRecipient.id && m.recipientId === currentUser.id)
      );
    }
    return m.channelName === activeChannel;
  });

  const activeTitle = activeRecipient 
    ? activeRecipient.fullName 
    : channels.find(c => c.id === activeChannel)?.name;

  const activeSubtitle = activeRecipient
    ? `${activeRecipient.role.replace(/_/g, ' ')} • En línea`
    : channels.find(c => c.id === activeChannel)?.desc;

  return (
    <div className="whatsapp-chat-container">
      {/* 1. Barra Lateral Estilo WhatsApp */}
      <div className="whatsapp-sidebar flex flex-col">
        {/* Cabecera de usuario actual */}
        <div className="p-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-[0_0_12px_rgba(37,99,235,0.4)]">
              {currentUser.fullName.split(' ')[1]?.[0] || 'M'}
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">{currentUser.fullName}</div>
              <div className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {currentUser.shift} • {currentUser.specialty || 'Puerta de Hierro'}
              </div>
            </div>
          </div>

          <div className="text-slate-400 hover:text-white cursor-pointer">
            <MoreVertical size={18} />
          </div>
        </div>

        {/* Buscador de Chats */}
        <div className="p-2.5 bg-slate-950/40">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar canal o médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-input text-xs pl-8 py-1.5 bg-slate-900/80"
            />
          </div>
        </div>

        {/* Lista de Canales y Contactos */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">
            Canales de Guardia y Departamentos
          </div>

          {channels.map((chan) => {
            const isSelected = !activeRecipient && activeChannel === chan.id;
            return (
              <div
                key={chan.id}
                onClick={() => {
                  setActiveRecipient(null);
                  setActiveChannel(chan.id);
                }}
                className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-blue-950/50 border-l-4 border-blue-500' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm shrink-0 border border-white/10">
                    🏥
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate">{chan.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{chan.desc}</div>
                  </div>
                </div>
                {chan.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {chan.unread}
                  </span>
                )}
              </div>
            );
          })}

          <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">
            Médicos y Personal Clínico
          </div>

          {staff
            .filter(s => s.id !== currentUser.id)
            .map((user) => {
              const isSelected = activeRecipient?.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => {
                    setActiveRecipient(user);
                  }}
                  className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-blue-950/50 border-l-4 border-blue-500' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                        {user.fullName.split(' ')[1]?.[0] || 'D'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate">{user.fullName}</div>
                      <div className="text-[10px] text-cyan-400 truncate">
                        {user.specialty || user.role.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 2. Área Central de Conversación WhatsApp */}
      <div className="whatsapp-chat-area">
        {/* Cabecera del Chat Activo */}
        <div className="p-3.5 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-lg font-bold border border-blue-500/30">
              {activeRecipient ? '👨‍⚕️' : '🏥'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{activeTitle}</h3>
              <p className="text-[11px] text-cyan-400 flex items-center gap-1">
                {activeSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <button 
              onClick={() => handleSend('🚨 CÓDIGO ROJO - REANIMACIÓN ACTIVADO', 'ALERTA_VITAL')}
              className="btn-neo btn-neo-danger text-xs py-1 px-3"
            >
              🚨 Alerta Código
            </button>
            <div className="hover:text-white cursor-pointer"><MoreVertical size={18} /></div>
          </div>
        </div>

        {/* Mensajes con Burbujas Estilo WhatsApp */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Mensaje de Seguridad Encriptada */}
          <div className="mx-auto text-center my-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] text-amber-300 bg-amber-950/40 border border-amber-500/20">
              <Shield size={10} /> Canal Clínico Cifrado de Extremo a Extremo (NOM-024 / LFPDPPP)
            </span>
          </div>

          {currentMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={isMe ? 'chat-bubble-sent' : 'chat-bubble-received'}
                  style={{ minWidth: '180px' }}
                >
                  {/* Nombre de remitente en canales grupales */}
                  {!isMe && (
                    <div className="text-[10px] font-bold text-cyan-300 mb-0.5">
                      {msg.senderName} ({msg.senderRole.replace(/_/g, ' ')})
                    </div>
                  )}

                  {/* Alerta Vital Especial */}
                  {msg.attachmentType === 'ALERTA_VITAL' && (
                    <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 mb-2 flex items-center gap-2 text-xs font-bold text-red-200 animate-pulse">
                      <AlertTriangle size={18} className="text-red-400 shrink-0" />
                      <span>{msg.messageText}</span>
                    </div>
                  )}

                  {/* Texto habitual */}
                  {msg.attachmentType !== 'ALERTA_VITAL' && (
                    <p className="text-xs leading-relaxed break-words">{msg.messageText}</p>
                  )}

                  {/* Nota de voz simulada */}
                  {msg.attachmentType === 'NOTA_VOZ' && (
                    <div className="flex items-center gap-2.5 mt-1 bg-black/30 p-2 rounded-xl">
                      <button className="w-7 h-7 rounded-full bg-cyan-500 text-slate-900 flex items-center justify-center">
                        <Play size={12} />
                      </button>
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-cyan-400"></div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300">0:18</span>
                    </div>
                  )}

                  {/* Metadatos y Doble Check Azul */}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-300 mt-1">
                    <span>{msg.timestamp}</span>
                    {isMe && (
                      <span className="chat-double-check text-cyan-400">
                        {msg.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chips de Respuestas Rápidas Médicas */}
        <div className="px-4 py-1.5 bg-slate-900/60 border-t border-white/5 flex items-center gap-2 overflow-x-auto">
          {[
            '🚨 Paciente desaturando (<90%)',
            '✓ Muestra recibida en Laboratorio',
            '⏱️ Quirófano 02 listo para inicio',
            '🛏️ Cama UCI-01 preparada',
            '📋 Nota preoperatoria firmada',
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-white/5 shrink-0 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Barra Inferior de Entrada de Mensaje */}
        <div className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2 relative">
          {/* Botón de Adjuntos */}
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Adjuntar Documento o Estudio"
          >
            <Paperclip size={20} />
          </button>

          {/* Menú Flotante de Adjuntos Médicos */}
          {showAttachMenu && (
            <div className="absolute bottom-16 left-3 neo-glass-panel p-3 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl flex flex-col gap-2 z-50">
              <button
                onClick={() => handleSend('🔬 Envío resultado analítico urgente de laboratorio', 'REPORTE_PDF')}
                className="flex items-center gap-2 text-xs text-white hover:text-cyan-400 p-2 rounded-lg hover:bg-slate-800"
              >
                <FileText size={16} className="text-blue-400" />
                Adjuntar Resultado / Nota en PDF
              </button>
              <button
                onClick={() => handleSend('🩻 Comparto estudio de Tomografía Axial Multicorte', 'IMAGEN_ESTUDIO')}
                className="flex items-center gap-2 text-xs text-white hover:text-cyan-400 p-2 rounded-lg hover:bg-slate-800"
              >
                <ImageIcon size={16} className="text-cyan-400" />
                Adjuntar Placa / Estudio de Rayos X
              </button>
              <button
                onClick={() => handleSend('🎙️ Dictamen médico por voz', 'NOTA_VOZ')}
                className="flex items-center gap-2 text-xs text-white hover:text-cyan-400 p-2 rounded-lg hover:bg-slate-800"
              >
                <Mic size={16} className="text-emerald-400" />
                Grabar Dictamen de Voz Rápido
              </button>
            </div>
          )}

          {/* Campo de Entrada de Texto */}
          <input
            type="text"
            placeholder="Escribe un mensaje médico institucional..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="neo-input flex-1 text-xs py-2.5"
          />

          {/* Botón Enviar o Micrófono */}
          {inputText.trim() ? (
            <button
              onClick={() => handleSend()}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-[0_0_12px_rgba(37,99,235,0.6)]"
            >
              <Send size={18} />
            </button>
          ) : (
            <button
              onClick={() => handleSend('🎙️ Nota de voz del médico tratante (18s)', 'NOTA_VOZ')}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center transition-all"
              title="Grabar Mensaje de Voz"
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
