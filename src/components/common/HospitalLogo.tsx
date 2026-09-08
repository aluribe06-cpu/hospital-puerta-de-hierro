// ==============================================================================
// LOGOTIPO OFICIAL CENTRO MÉDICO PUERTA DE HIERRO (TEPIC)
// ==============================================================================

import React from 'react';

interface HospitalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const HospitalLogo: React.FC<HospitalLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const logoDimensions = {
    sm: { imgH: '32px', titleSize: '0.95rem', subSize: '0.68rem' },
    md: { imgH: '44px', titleSize: '1.2rem', subSize: '0.78rem' },
    lg: { imgH: '64px', titleSize: '1.6rem', subSize: '0.9rem' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Contenedor táctil con el logotipo oficial del Hospital Puerta de Hierro */}
      <div 
        style={{
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(37, 99, 235, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: '#ffffff',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <img
          src="/assets/hospital-logo.jpg"
          alt="Centro Médico Puerta de Hierro"
          style={{ height: logoDimensions.imgH, width: 'auto', objectFit: 'contain', display: 'block' }}
          onError={(e) => {
            // Fallback si la imagen no cargara directamente
            const target = e.target as HTMLElement;
            target.style.display = 'none';
          }}
        />
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: logoDimensions.titleSize,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(180deg, #ffffff 30%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            PUERTA DE HIERRO
          </span>
          <span 
            style={{ 
              fontSize: '0.65rem', 
              color: '#38bdf8', 
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '999px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}
          >
            TEPIC
          </span>
        </div>
        {showSubtitle && (
          <span
            style={{
              fontSize: logoDimensions.subSize,
              color: '#94a3b8',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Centro Médico de Alta Especialidad
          </span>
        )}
      </div>
    </div>
  );
};
