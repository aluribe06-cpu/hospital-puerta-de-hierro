// ==============================================================================
// LOGOTIPO OFICIAL CENTRO MÉDICO PUERTA DE HIERRO (TEPIC)
// ==============================================================================

import React from 'react';

interface HospitalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  onClick?: () => void;
}

export const HospitalLogo: React.FC<HospitalLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  onClick,
}) => {
  const logoDimensions = {
    sm: { imgH: '34px', titleSize: '1rem', subSize: '0.7rem' },
    md: { imgH: '46px', titleSize: '1.3rem', subSize: '0.8rem' },
    lg: { imgH: '64px', titleSize: '1.65rem', subSize: '0.92rem' },
  }[size];

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      title={onClick ? 'Volver al Menú Principal' : undefined}
    >
      {/* Placa táctil flotante con halo de resplandor del Hospital Puerta de Hierro */}
      <div className="neo-logo-floating-badge">
        <img
          src="/assets/hospital-logo.jpg"
          alt="Centro Médico Puerta de Hierro"
          style={{ height: logoDimensions.imgH, width: 'auto', objectFit: 'contain', display: 'block', borderRadius: '10px' }}
          onError={(e) => {
            // Fallback si la imagen no cargara directamente
            const target = e.target as HTMLElement;
            target.style.display = 'none';
          }}
        />
      </div>

      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: logoDimensions.titleSize,
              letterSpacing: '-0.02em',
              color: '#0f172a',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.9)',
            }}
          >
            PUERTA DE HIERRO
          </span>
          <span 
            style={{ 
              fontSize: '0.68rem', 
              color: '#ffffff', 
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
              letterSpacing: '0.04em'
            }}
          >
            TEPIC
          </span>
        </div>
        {showSubtitle && (
          <span
            style={{
              fontSize: logoDimensions.subSize,
              color: '#334155',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}
          >
            Centro Médico de Alta Especialidad
          </span>
        )}
      </div>
    </div>
  );
};
