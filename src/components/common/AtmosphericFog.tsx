import React from 'react';

interface AtmosphericFogProps {
  position?: 'bottom' | 'middle' | 'both';
  className?: string;
}

export const AtmosphericFog: React.FC<AtmosphericFogProps> = ({
  position = 'bottom',
  className = '',
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Primary Slow Rolling Mist Layer */}
      {(position === 'bottom' || position === 'both') && (
        <div className="absolute bottom-0 left-[-15%] right-[-15%] h-64 md:h-80 opacity-40 mix-blend-screen animate-mist-slow">
          <div className="w-full h-full bg-gradient-to-t from-[#0e1626]/80 via-[#182844]/30 to-transparent blur-3xl rounded-[100%]" />
        </div>
      )}

      {/* Secondary Counter-Drifting Arcane Fog Layer */}
      {(position === 'bottom' || position === 'both') && (
        <div className="absolute bottom-6 left-[-10%] right-[-10%] h-48 md:h-64 opacity-30 mix-blend-lighten animate-mist-fast">
          <div className="w-full h-full bg-gradient-to-t from-[#141d2e]/70 via-[#1e3a6a]/20 to-transparent blur-2xl rounded-[100%]" />
        </div>
      )}

      {/* Golden Warm Mist Layer (Ambient Campfire / Citadel Light) */}
      <div className="absolute bottom-0 left-[10%] right-[10%] h-40 opacity-25 mix-blend-screen animate-pulse-glow">
        <div className="w-full h-full bg-gradient-to-t from-[#c99738]/20 via-[#ffd978]/5 to-transparent blur-3xl rounded-[100%]" />
      </div>
    </div>
  );
};
