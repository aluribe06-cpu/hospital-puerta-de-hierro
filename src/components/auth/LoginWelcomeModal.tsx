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
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Normaliza texto quitando puntuación para comparación flexible
  const normalize = (str: string) =>
    str.toLowerCase().replace(/[^a-záéíóúüñ0-9@._\s]/gi, '').replace(/\s+/g, ' ').trim();

  // Buscar usuario coincidente cuando haya ingresado su identificador
  const matchedUser = usernameInput.trim().length >= 3 ? staffList.find(s => {
    const query = normalize(usernameInput);
    return (
      normalize(s.fullName).includes(query) ||
      normalize(s.email).includes(query) ||
      (s.username && normalize(s.username).includes(query))
    );
  }) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = normalize(usernameInput);
      const cleanPass = passwordInput.trim();

      // Buscar usuario en catálogo de personal con comparación flexible
      const found = staffList.find(s => {
        const nameNorm = normalize(s.fullName);
        const emailNorm = normalize(s.email);
        const userNorm = s.username ? normalize(s.username) : '';
        return (
          nameNorm === cleanUser ||
          emailNorm === cleanUser ||
          userNorm === cleanUser ||
          nameNorm.includes(cleanUser) ||
          userNorm.includes(cleanUser) ||
          emailNorm.includes(cleanUser)
        );
      });

      if (!found) {
        setErrorMsg('Usuario no encontrado en el directorio hospitalario.');
        setIsLoading(false);
        return;
      }

      // Validar contraseña secreta
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

        {/* Formulario de Inicio de Sesión */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
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
                placeholder="Nombre de usuario o correo institucional"
                className="neo-auth-input"
                autoComplete="username"
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
                placeholder="Ingrese su contraseña"
                className="neo-auth-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-cyan-300 transition-colors p-1 bg-transparent border-none outline-none"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                style={{ background: 'none' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Indicador de Rol y Atributos Detectados */}
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

        {/* Pie Institucional Limpio y Seguro */}
        <div className="mt-5 pt-3 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-400 font-mono">
            Hospital Puerta de Hierro • Av. Emilio M. González #221, Cd. Industrial
          </p>
        </div>
      </div>
    </div>
  );
};
