import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import type { BannerSlide } from '../../types';

interface SlidePreviewModalProps {
  slide: BannerSlide | null;
  onClose: () => void;
}

export const SlidePreviewModal: React.FC<SlidePreviewModalProps> = ({
  slide,
  onClose,
}) => {
  if (!slide) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#090b10] border border-[#c99738]/60 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#10141f] border-b border-[#c99738]/30">
          <div className="flex items-center gap-2 truncate mr-2">
            <span className="h-2 w-2 rounded-full bg-[#ffd978] shadow-[0_0_8px_#ffd978] shrink-0" />
            <h3 className="font-serif font-bold text-sm text-[#f5ebd6] truncate">
              Visualização do Banner: {slide.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar pré-visualização"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panoramic Banner Frame */}
        <div className="relative w-full h-[180px] sm:h-[300px] md:h-[400px] bg-black overflow-hidden">
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35 pointer-events-none" />

          {/* CTA Overlay */}
          {slide.buttonText && (
            <div
              className={`absolute bottom-4 sm:bottom-6 z-20 px-4 sm:px-8 flex ${
                slide.alignment === 'left'
                  ? 'justify-start left-0'
                  : slide.alignment === 'center'
                  ? 'justify-center left-0 right-0'
                  : 'justify-end right-0'
              }`}
            >
              <div className="btn-gold-primary px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold tracking-wide flex items-center gap-2 shadow-[0_8px_25px_rgba(201,151,56,0.45)]">
                <span>{slide.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Metadata Details Footer */}
        <div className="p-4 sm:p-6 bg-[#0e121a] border-t border-[#c99738]/30 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs text-[#a8a090]">
          <div>
            <span className="text-[10px] text-[#787163] uppercase block font-semibold">Status</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold mt-1 ${
                slide.status === 'published'
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                  : slide.status === 'draft'
                  ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-700'
              }`}
            >
              {slide.status === 'published'
                ? 'Publicado'
                : slide.status === 'draft'
                ? 'Rascunho'
                : 'Inativo'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#787163] uppercase block font-semibold">Ordem de Exibição</span>
            <span className="text-sm font-mono text-[#ffd978] block mt-1">
              Posição #{slide.order}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#787163] uppercase block font-semibold">Destino do Botão</span>
            <span className="text-xs font-mono text-[#93c5fd] block mt-1 truncate">
              {slide.buttonUrl || 'Sem link configurado'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#787163] uppercase block font-semibold">Última Atualização</span>
            <span className="text-xs text-[#d8d0c2] block mt-1">
              {new Date(slide.updatedAt).toLocaleDateString('pt-BR')} às{' '}
              {new Date(slide.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
