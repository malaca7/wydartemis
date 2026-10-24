import React from 'react';

interface MedievalDividerProps {
  variant?: 'gold' | 'arcane' | 'subtle';
  className?: string;
}

export const MedievalDivider: React.FC<MedievalDividerProps> = ({
  variant = 'gold',
  className = '',
}) => {
  const isGold = variant === 'gold';
  const isArcane = variant === 'arcane';

  return (
    <div className={`relative flex items-center justify-center my-8 w-full max-w-4xl mx-auto ${className}`} aria-hidden="true">
      {/* Left line */}
      <div
        className={`h-[1px] flex-1 bg-gradient-to-r from-transparent ${
          isGold
            ? 'to-[#c99738]'
            : isArcane
            ? 'to-[#3b82f6]'
            : 'to-[#4a5568]'
        }`}
      />

      {/* Center filigree & gem */}
      <div className="mx-4 flex items-center gap-2">
        <div
          className={`h-1.5 w-1.5 rotate-45 border ${
            isGold
              ? 'border-[#c99738] bg-[#ffd978]/40'
              : isArcane
              ? 'border-[#3b82f6] bg-[#60a5fa]/40'
              : 'border-[#4a5568] bg-[#718096]/40'
          }`}
        />
        <div
          className={`h-3 w-3 rotate-45 border-2 ${
            isGold
              ? 'border-[#ffd978] bg-[#8c631b] shadow-[0_0_10px_#c99738]'
              : isArcane
              ? 'border-[#93c5fd] bg-[#1e40af] shadow-[0_0_10px_#3b82f6]'
              : 'border-[#718096] bg-[#2d3748]'
          }`}
        />
        <div
          className={`h-1.5 w-1.5 rotate-45 border ${
            isGold
              ? 'border-[#c99738] bg-[#ffd978]/40'
              : isArcane
              ? 'border-[#3b82f6] bg-[#60a5fa]/40'
              : 'border-[#4a5568] bg-[#718096]/40'
          }`}
        />
      </div>

      {/* Right line */}
      <div
        className={`h-[1px] flex-1 bg-gradient-to-l from-transparent ${
          isGold
            ? 'to-[#c99738]'
            : isArcane
            ? 'to-[#3b82f6]'
            : 'to-[#4a5568]'
        }`}
      />
    </div>
  );
};
