import React, { useEffect, useRef } from 'react';
import { useModal } from '../../hooks/useModal';
import { ShieldAlert, X, Info, Download, Lock, ExternalLink, Sparkles } from 'lucide-react';

export const PendingFeatureModal: React.FC = () => {
  const { pendingModal, closePendingModal } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePendingModal();
      }
    };

    if (pendingModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pendingModal, closePendingModal]);

  if (!pendingModal) return null;

  const renderIcon = () => {
    switch (pendingModal.type) {
      case 'download':
        return <Download className="w-3.5 h-3.5 text-amber-400" />;
      case 'auth':
        return <Lock className="w-3.5 h-3.5 text-amber-400" />;
      case 'external':
        return <ExternalLink className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-[#ffd978]" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-200"
      onClick={closePendingModal}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-xl bg-gradient-to-b from-[#181d28] to-[#0c0e14] border-2 border-[#c99738]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(201,151,56,0.15)] text-[#e8dec7] focus:outline-none"
      >
        {/* Ornate corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ffd978]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ffd978]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ffd978]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ffd978]" />

        {/* Top Glow Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#ffd978] to-transparent opacity-75" />

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-black border border-[#c99738]/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                <img
                  src={`${import.meta.env.BASE_URL}assets/artemis-logo.jpg`}
                  alt="WYD Artemis Logo"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 right-0 p-1 bg-black/85 rounded-tl border-t border-l border-[#c99738]/40">
                  {renderIcon()}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold tracking-widest text-[#93c5fd] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#60a5fa]" />
                  Portal Oficial Artemis
                </span>
                <h3 id="modal-title" className="text-lg sm:text-xl font-bold font-serif text-[#f4ecd8] tracking-wide">
                  {pendingModal.title || 'Recurso em Configuração'}
                </h3>
              </div>
            </div>

            <button
              onClick={closePendingModal}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#ffd978] hover:bg-[#202636] transition-colors focus:outline-none focus:ring-2 focus:ring-[#ffd978]"
              aria-label="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <div className="p-3.5 rounded-lg bg-[#11141c] border border-neutral-800 text-sm leading-relaxed text-[#c5bcab]">
              <p className="font-medium text-[#ffd978] mb-1">
                Recurso: <span className="text-[#f1ebe0]">{pendingModal.featureName}</span>
              </p>
              <p>{pendingModal.description}</p>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-200/90 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <p>
                Por conformidade técnica desta fase demonstrativa, nenhum link externo não oficial ou transação fictícia é executada sem confirmação prévia da administração do servidor.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={closePendingModal}
              className="btn-gold-primary px-6 py-2.5 rounded text-sm cursor-pointer"
            >
              Compreendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
