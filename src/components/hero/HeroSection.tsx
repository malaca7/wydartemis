import React from 'react';
import { useModal } from '../../context/ModalContext';
import { EmbersCanvas } from '../common/EmbersCanvas';
import {
  Download,
  Compass,
  Shield,
  Swords,
  Sparkles,
  Server,
  ChevronDown,
} from 'lucide-react';

interface HeroSectionProps {
  onExploreClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const { openPendingModal } = useModal();

  const handleDownloadClick = () => {
    openPendingModal({
      title: 'Cliente de Instalação WYD Artemis',
      featureName: 'Download Direto do Instalador',
      description: 'O download oficial do cliente ainda não possui link de distribuição público confirmado pela administração. Acompanhe os comunicados no portal.',
      type: 'download',
    });
  };

  const scrollToExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const target = document.getElementById('explore-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative min-h-[95vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Layer 1: Background Epic Citadel Artwork */}
      <div className="absolute inset-0 z-0">
        <img
          src={`${import.meta.env.BASE_URL}assets/hero-citadel.jpg`}
          alt="Cidadela de Artemis sob luas místicas"
          className="w-full h-full object-cover object-center filter brightness-[0.40] contrast-[1.18] scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
        />
        {/* Dark Vignette & Atmospheric Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#08090e]/65 to-[#07080c]/90" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#07080c]/60 to-[#07080c]" />
      </div>

      {/* Layer 2: Floating Atmospheric Embers Canvas */}
      <EmbersCanvas />

      {/* Layer 3: Mystical Arcane & Golden Atmospheric Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-[#2563eb]/20 via-[#c99738]/15 to-[#60a5fa]/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Layer 4: Content Container */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Server Status Pill (Demonstrative) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111622]/95 border border-[#3b82f6]/40 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(59,130,246,0.2)] backdrop-blur-md mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span className="text-xs uppercase tracking-wider text-[#93c5fd] font-semibold">
            Servidor em Pré-Lançamento
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-[11px] text-[#ffd978] font-medium">
            Protótipo Demonstrativo
          </span>
        </div>

        {/* Masterpiece Official Logo Emblem */}
        <div
          className="relative mb-6 group cursor-pointer"
          onClick={handleDownloadClick}
          title="WYD Artemis — Baixar o Jogo"
        >
          {/* Ambient Multi-Layer Aura behind Logo */}
          <div className="absolute inset-0 rounded-full bg-radial from-[#3b82f6]/30 via-[#c99738]/20 to-transparent blur-3xl scale-110 pointer-events-none animate-pulse-glow" />

          {/* Logo container with delicate shadow */}
          <div className="relative w-72 sm:w-88 md:w-[440px] max-w-[90vw] transition-transform duration-500 group-hover:scale-105 filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] drop-shadow-[0_0_30px_rgba(59,130,246,0.35)] drop-shadow-[0_0_50px_rgba(201,151,56,0.25)]">
            <img
              src={`${import.meta.env.BASE_URL}assets/artemis-logo.jpg`}
              alt="WYD Artemis Logo Oficial"
              className="w-full h-auto object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* Accessibility & SEO heading */}
        <h1 className="sr-only">WYD Artemis — Servidor Medieval de MMORPG</h1>

        {/* Positioning Subtitle */}
        <p className="font-serif text-lg sm:text-xl md:text-2xl font-semibold text-[#f5ebd6] tracking-wide max-w-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] mb-3">
          O Renascimento das Batalhas Épicas e da Glória Medieval
        </p>

        <p className="text-sm sm:text-base text-[#b8b09f] max-w-2xl leading-relaxed mb-8">
          Entre no universo sagrado de Artemis. Forje armas lendárias com gemas arcanas, domine magias ancestrais e lute ao lado de sua guilda pela supremacia e honra em Noatun.
        </p>

        {/* Main CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
          <button
            onClick={handleDownloadClick}
            className="w-full sm:w-auto btn-gold-primary px-8 py-4 rounded-lg text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer group shadow-[0_10px_30px_rgba(201,151,56,0.35)]"
          >
            <Download className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span>Baixar o Jogo</span>
            <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-black/40 text-amber-200 border border-amber-300/40">
              Alpha
            </span>
          </button>

          <button
            onClick={scrollToExplore}
            className="w-full sm:w-auto btn-medieval-secondary px-8 py-4 rounded-lg text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer group border-[#3b82f6]/40 hover:border-[#60a5fa]"
          >
            <Compass className="w-5 h-5 text-[#93c5fd] transition-transform duration-300 group-hover:rotate-45" />
            <span>Explorar o Mundo</span>
          </button>
        </div>

        {/* Server Highlights Pill Grid (Demonstrative) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl text-left">
          <div className="medieval-panel p-3.5 rounded-lg border border-[#c99738]/25 hover:border-[#3b82f6]/40 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ffd978] mb-1">
              <Swords className="w-4 h-4 text-[#ffd978]" />
              <span>PvP & Honra</span>
            </div>
            <p className="text-xs text-[#a9a190]">Guerra de Torre e Cidades com pontuação equilibrada</p>
          </div>

          <div className="medieval-panel p-3.5 rounded-lg border border-[#c99738]/25 hover:border-[#3b82f6]/40 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#93c5fd] mb-1">
              <Sparkles className="w-4 h-4 text-[#60a5fa]" />
              <span>4 Classes</span>
            </div>
            <p className="text-xs text-[#a9a190]">TransKnight, Foema, BeastMaster e Huntress balanceados</p>
          </div>

          <div className="medieval-panel p-3.5 rounded-lg border border-[#c99738]/25 hover:border-[#3b82f6]/40 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ffd978] mb-1">
              <Shield className="w-4 h-4 text-[#ffd978]" />
              <span>Forja & Refino</span>
            </div>
            <p className="text-xs text-[#a9a190]">Composição clássica de itens até +15 sem perdas injustas</p>
          </div>

          <div className="medieval-panel p-3.5 rounded-lg border border-[#c99738]/25 hover:border-[#3b82f6]/40 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Estabilidade</span>
            </div>
            <p className="text-xs text-[#a9a190]">Anti-cheat moderno e infraestrutura de baixa latência</p>
          </div>
        </div>

        <p className="text-[11px] text-[#787163] mt-6 tracking-wide">
          * Todas as informações e parâmetros do servidor acima são dados demonstrativos para a fase de protótipo visual.
        </p>

        <button
          onClick={scrollToExplore}
          className="mt-8 text-neutral-400 hover:text-[#ffd978] transition-colors p-2 focus:outline-none"
          aria-label="Rolar para ver mais"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
