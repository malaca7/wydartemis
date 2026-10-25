import React, { useState, useEffect, useRef } from 'react';
import { useModal } from '../../hooks/useModal';
import { EmbersCanvas } from '../common/EmbersCanvas';
import { AtmosphericFog } from '../common/AtmosphericFog';
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
  const heroRef = useRef<HTMLElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Scroll parallax listener (throttled via requestAnimationFrame)
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Subtle interactive mouse parallax for desktop (weights the logo like a physical relic)
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion || window.innerWidth < 1024) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 18; // Max 9px shift
    const y = (clientY / innerHeight - 0.5) * 18;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

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

  // Parallax calculations
  const bgTranslateY = prefersReducedMotion ? 0 : Math.min(scrollY * 0.28, 120);
  const contentTranslateY = prefersReducedMotion ? 0 : Math.min(scrollY * 0.08, 40);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[96vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 select-none"
    >
      {/* Layer 1: Background Epic Citadel Artwork with Scroll Parallax */}
      <div
        className="absolute inset-0 z-0 will-change-transform"
        style={{
          transform: `translate3d(0, ${bgTranslateY}px, 0) scale(1.08)`,
          transition: prefersReducedMotion ? 'none' : 'transform 0.1s linear',
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}assets/hero-citadel.jpg`}
          alt="Cidadela de Artemis sob luas místicas"
          className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.2] transition-all duration-700"
        />
        {/* Dark Vignette & Atmospheric Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#08090e]/60 to-[#07080c]/90" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#07080c]/55 to-[#07080c]" />
      </div>

      {/* Layer 2: Floating Atmospheric Dual Magic Embers (Canvas) */}
      <EmbersCanvas />

      {/* Layer 3: Layered Rolling Mist & Fog */}
      <AtmosphericFog className="bottom-0 h-72 z-10" />

      {/* Layer 4: Deep Arcane & Golden Atmospheric Light Beams */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[480px] bg-gradient-to-tr from-[#1d4ed8]/25 via-[#c99738]/20 to-[#60a5fa]/18 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 w-[400px] h-[300px] bg-[#3b82f6]/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Layer 5: Hero Content with moderate Parallax */}
      <div
        className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center will-change-transform"
        style={{
          transform: `translate3d(0, -${contentTranslateY}px, 0)`,
        }}
      >
        {/* Server Status Pill (Demonstrative) with Arcane Sapphire Beacon */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#0e131d]/95 border border-[#3b82f6]/40 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(59,130,246,0.25)] backdrop-blur-md mb-6 hover:border-[#60a5fa] transition-colors max-w-full">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_8px_#60a5fa]"></span>
            </span>
            <span className="text-[11px] sm:text-xs uppercase tracking-wider text-[#93c5fd] font-semibold">
              Servidor em Pré-Lançamento
            </span>
          </div>
          <span className="text-neutral-500 hidden sm:inline">•</span>
          <span className="text-[10px] sm:text-[11px] text-[#ffd978] font-medium font-mono">
            Protótipo Demonstrativo
          </span>
        </div>

        {/* Masterpiece Official Logo Emblem with 3D Mouse Micro-Tilt */}
        <div
          className="relative mb-5 group cursor-pointer"
          onClick={handleDownloadClick}
          title="WYD Artemis — Baixar o Jogo"
          style={{
            transform: prefersReducedMotion
              ? 'none'
              : `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0) rotateX(${-mouseOffset.y * 0.4}deg) rotateY(${mouseOffset.x * 0.4}deg)`,
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Luminous Pulsing Aura behind Emblem */}
          <div className="absolute inset-0 rounded-full bg-radial from-[#3b82f6]/35 via-[#c99738]/20 to-transparent blur-3xl scale-125 pointer-events-none animate-pulse-glow" />

          {/* Logo container with multi-layered drop shadow */}
          <div className="relative w-64 sm:w-92 md:w-[460px] max-w-[92vw] transition-all duration-500 group-hover:scale-[1.03] filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] drop-shadow-[0_0_35px_rgba(59,130,246,0.45)] drop-shadow-[0_0_60px_rgba(201,151,56,0.3)]">
            <img
              src={`${import.meta.env.BASE_URL}assets/artemis-logo.jpg`}
              alt="WYD Artemis Logo Oficial"
              className="w-full h-auto object-contain rounded-2xl animate-crystal-aura"
            />
          </div>
        </div>

        {/* Accessibility & SEO Heading */}
        <h1 className="sr-only">WYD Artemis — Servidor Medieval de MMORPG</h1>

        {/* Positioning Subtitle with Gilded Ambient Highlight */}
        <p className="font-serif text-base sm:text-xl md:text-2xl font-semibold text-[#f5ebd6] tracking-wide max-w-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] mb-3 px-2">
          O Renascimento das Batalhas Épicas e da Glória Medieval
        </p>

        <p className="text-xs sm:text-sm md:text-base text-[#b8b09f] max-w-2xl leading-relaxed mb-8 sm:mb-9 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] px-2">
          Entre no universo sagrado de Artemis. Forje armas lendárias com gemas arcanas, domine magias ancestrais e lute ao lado de sua guilda pela supremacia e honra em Noatun.
        </p>

        {/* Main CTA Buttons with Interactive Flare Sweeps */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto mb-10 sm:mb-12 px-4 sm:px-0">
          <button
            onClick={handleDownloadClick}
            className="w-full sm:w-auto btn-gold-primary px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer group shadow-[0_10px_35px_rgba(201,151,56,0.4)]"
          >
            <Download className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span>Baixar o Jogo</span>
            <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-black/40 text-amber-200 border border-amber-300/40">
              Alpha
            </span>
          </button>

          <button
            onClick={scrollToExplore}
            className="w-full sm:w-auto btn-medieval-secondary px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer group border-[#3b82f6]/40 hover:border-[#60a5fa]"
          >
            <Compass className="w-5 h-5 text-[#93c5fd] transition-transform duration-300 group-hover:rotate-45" />
            <span>Explorar o Mundo</span>
          </button>
        </div>

        {/* Server Highlights Pill Grid (Demonstrative) with Hover Glows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 w-full max-w-4xl text-left">
          <div className="medieval-panel p-3.5 sm:p-4 rounded-xl border border-[#c99738]/25 hover:border-[#ffd978]/60 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ffd978] mb-1.5">
              <Swords className="w-4 h-4 text-[#ffd978] group-hover:rotate-12 transition-transform shrink-0" />
              <span>PvP & Honra</span>
            </div>
            <p className="text-xs text-[#a9a190] leading-snug">Guerra de Torre e Cidades com pontuação equilibrada</p>
          </div>

          <div className="medieval-panel p-3.5 sm:p-4 rounded-xl border border-[#3b82f6]/25 hover:border-[#60a5fa]/70 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#93c5fd] mb-1.5">
              <Sparkles className="w-4 h-4 text-[#60a5fa] group-hover:scale-110 transition-transform shrink-0" />
              <span>4 Classes</span>
            </div>
            <p className="text-xs text-[#a9a190] leading-snug">TransKnight, Foema, BeastMaster e Huntress balanceados</p>
          </div>

          <div className="medieval-panel p-3.5 sm:p-4 rounded-xl border border-[#c99738]/25 hover:border-[#ffd978]/60 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#ffd978] mb-1.5">
              <Shield className="w-4 h-4 text-[#ffd978] group-hover:scale-110 transition-transform shrink-0" />
              <span>Forja & Refino</span>
            </div>
            <p className="text-xs text-[#a9a190] leading-snug">Composição clássica de itens até +15 sem perdas injustas</p>
          </div>

          <div className="medieval-panel p-3.5 sm:p-4 rounded-xl border border-emerald-500/25 hover:border-emerald-400/60 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1.5">
              <Server className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>Estabilidade</span>
            </div>
            <p className="text-xs text-[#a9a190] leading-snug">Anti-cheat moderno e infraestrutura de baixa latência</p>
          </div>
        </div>

        <p className="text-[11px] text-[#787163] mt-7 tracking-wide">
          * Todas as informações e parâmetros do servidor acima são dados demonstrativos para a fase de protótipo visual.
        </p>

        <button
          onClick={scrollToExplore}
          className="mt-8 text-neutral-400 hover:text-[#93c5fd] transition-colors p-2 focus:outline-none"
          aria-label="Rolar para ver mais"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
