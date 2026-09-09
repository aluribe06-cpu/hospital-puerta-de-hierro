import React, { useState } from 'react';
import { UserProfile } from '../../types/hospital';
import { HospitalLogo } from '../common/HospitalLogo';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginWelcomeModalProps {
  staffList: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginWelcomeModal: React.FC<LoginWelcomeModalProps> = ({
  staffList,
  onLoginSuccess,
}) => {
  // Por defecto precargado con el Administrador Único para máxima conveniencia
  const defaultAdmin = staffList.find(s => s.role === 'ADMINISTRADOR_UNICO') || staffList[0];

  const [usernameInput, setUsernameInput] = useState(defaultAdmin ? defaultAdmin.fullName : 'Ing. Alfonso Uribe');
  const [passwordInput, setPasswordInput] = useState(defaultAdmin?.password || 'password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar usuario coincidente en tiempo real por nombre, usuario o email
  const matchedUser = staffList.find(s => {
    const query = usernameInput.trim().toLowerCase();
    if (!query) return false;
    return (
      s.fullName.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      (s.username && s.username.toLowerCase().includes(query))
    );
  });

  const handleSelectQuickAccount = (user: UserProfile) => {
    setUsernameInput(user.fullName);
    setPasswordInput(user.password || 'password123');
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = usernameInput.trim().toLowerCase();
      const cleanPass = passwordInput.trim();

      // Buscar usuario en catálogo de personal
      const found = staffList.find(s => {
        return (
          s.fullName.toLowerCase() === cleanUser ||
          s.email.toLowerCase() === cleanUser ||
          (s.username && s.username.toLowerCase() === cleanUser) ||
          s.fullName.toLowerCase().includes(cleanUser)
        );
      });

      if (!found) {
        setErrorMsg('Usuario no encontrado en el directorio hospitalario.');
        setIsLoading(false);
        return;
      }

      // Validar contraseña (por defecto password123)
      const validPass = found.password || 'password123';
      if (cleanPass !== validPass) {
        setErrorMsg('Contraseña incorrecta. Por favor verifique sus credenciales.');
        setIsLoading(false);
        return;
      }

      // Login exitoso
      setIsLoading(false);
      onLoginSuccess(found);
    }, 400);
  };

  return (
    <div className="neo-auth-overlay">
      <div className="neo-auth-card">
        {/* Cabecera con Logotipo Oficial 3D y Resplandor Tecnológico */}
        <div className="neo-auth-badge-container">
          <div className="mb-3 transform hover:scale-105 transition-transform duration-300">
            <HospitalLogo size="md" showSubtitle={false} textColor="#ffffff" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-[11px] font-mono font-bold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] mb-2">
            <ShieldCheck size={13} className="text-cyan-400" />
            <span>ACCESO HOSPITALARIO NOM-024 / NOM-004</span>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">
            Estación de Trabajo Clínica
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Centro Médico de Alta Especialidad • Tepic
          </p>
        </div>

        {/* Píldoras de Acceso Rápido */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Acceso Rápido por Perfil:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {defaultAdmin && (
              <button
                type="button"
                onClick={() => handleSelectQuickAccount(defaultAdmin)}
                className={`neo-quick-role-pill admin-special ${
                  matchedUser?.id === defaultAdmin.id ? 'ring-2 ring-cyan-400' : ''
                }`}
                title="Acceso total irrestricto a todos los módulos"
              >
                <Sparkles size={12} className="text-yellow-400 shrink-0" />
                <span className="font-extrabold text-cyan-100">Ing. Alfonso Uribe (Admin Único)</span>
              </button>
            )}

            {staffList
              .filter(s => s.role !== 'ADMINISTRADOR_UNICO')
              .slice(0, 3)
              .map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectQuickAccount(user)}
                  className={`neo-quick-role-pill ${
                    matchedUser?.id === user.id ? 'active' : ''
                  }`}
                >
                  <span>{user.role === 'MEDICO_URGENCIOLOGO' ? '🩺' : user.role === 'FARMACEUTICO' ? '💊' : '🏨'}</span>
                  <span>{user.fullName.split(' ')[0]} {user.fullName.split(' ')[1]}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Formulario de Inicio de Sesión */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Campo de Usuario */}
          <div>
            <label className="block text-[11.5px] font-bold text-slate-300 mb-1.5">
              Nombre de Usuario o Correo
            </label>
            <div className="neo-auth-input-box">
              <User size={17} className="text-cyan-400 shrink-0" />
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Ej. Ing. Alfonso Uribe o alfonso.uribe"
                className="neo-auth-input"
              />
            </div>
          </div>

          {/* Campo de Contraseña */}
          <div>
            <label className="block text-[11.5px] font-bold text-slate-300 mb-1.5">
              Contraseña de Acceso
            </label>
            <div className="neo-auth-input-box">
              <Lock size={17} className="text-cyan-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Ingrese contraseña"
                className="neo-auth-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Indicador de Rol y Atributos Detectados en Vivo */}
          {matchedUser && (
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                <div>
                  <div className="font-extrabold text-cyan-200">
                    {matchedUser.role === 'ADMINISTRADOR_UNICO' 
                      ? '⭐ ADMINISTRADOR ÚNICO' 
                      : matchedUser.role.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {matchedUser.role === 'ADMINISTRADOR_UNICO'
                      ? 'Todos los atributos clínicos y administrativos habilitados'
                      : matchedUser.specialty || 'Personal Clínico Autorizado'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                {matchedUser.role === 'ADMINISTRADOR_UNICO' ? 'TOTAL' : 'ROL VINCULADO'}
              </span>
            </div>
          )}

          {/* Alerta de Error */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-2 text-xs text-rose-200 animate-fadeIn">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botón 3D de Ingreso */}
          <button
            type="submit"
            disabled={isLoading}
            className="neo-auth-submit-btn mt-2"
          >
            {isLoading ? (
              <span className="inline-block animate-spin mr-2">⚙️</span>
            ) : (
              <>
                <span>Entrar a la Plataforma</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Pie Normativo y Credenciales de Ayuda */}
        <div className="mt-5 pt-3 border-t border-white/10 text-center">
          <p className="text-[10.5px] text-slate-400">
            Administrador Único Registrado: <strong className="text-cyan-300">Ing. Alfonso Uribe</strong> (Clave: <code className="bg-slate-900/80 px-1 py-0.5 rounded text-cyan-200 font-mono">password123</code>)
          </p>
          <p className="text-[9.5px] text-slate-500 mt-1 font-mono">
            Hospital Puerta de Hierro • Av. Emilio M. González #221, Cd. Industrial
          </p>
        </div>
      </div>
    </div>
  );
};
