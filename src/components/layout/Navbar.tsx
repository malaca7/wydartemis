import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useModal } from '../../hooks/useModal';
import { useAuth } from '../../hooks/useAuth';
import {
  Menu,
  X,
  Download,
  User,
  ChevronRight,
} from 'lucide-react';
import type { NavItem } from '../../types';

const navItems: NavItem[] = [
  { name: 'Início', href: '/' },
  { name: 'O Jogo', href: '/o-jogo' },
  { name: 'Notícias', href: '/noticias' },
  { name: 'Ranking', href: '/ranking' },
  { name: 'Status', href: '/status' },
  { name: 'Download', href: '/download' },
  { name: 'Loja', href: '/loja' },
  { name: 'Comunidade', href: '/comunidade' },
];

export const Navbar: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const activeUser = currentUser || userProfile;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { openPendingModal } = useModal();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsMobileMenuOpen(false);
  }

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openPendingModal({
      title: 'Cliente WYD Artemis',
      featureName: 'Download do Instalador Oficial',
      description: 'O cliente de jogo para a fase de testes está em preparação técnica. A URL oficial de download será liberada no anúncio de lançamento.',
      type: 'download',
    });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#090b10]/95 backdrop-blur-md border-b border-[#c99738]/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-2.5'
            : 'bg-gradient-to-b from-[#07090e]/90 via-[#07090e]/60 to-transparent py-4 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Brand */}
            <Link
              to="/"
              className="group flex items-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] rounded-lg p-1 min-w-0"
              aria-label="WYD Artemis Início"
            >
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl overflow-hidden border border-[#c99738]/70 bg-black/90 shadow-[0_0_16px_rgba(59,130,246,0.35),0_0_10px_rgba(201,151,56,0.3)] transition-transform duration-300 group-hover:scale-105 group-hover:border-[#60a5fa] shrink-0">
                <img
                  src={`${import.meta.env.BASE_URL}assets/artemis-logo.jpg`}
                  alt="WYD Artemis Logo"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-wider gold-gradient-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate">
                    WYD ARTEMIS
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 -mt-0.5 sm:-mt-1">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#93c5fd] font-semibold truncate">
                    MMORPG Medieval
                  </span>
                  <span className="h-1 w-1 rounded-full bg-[#3b82f6] shrink-0 hidden xs:inline" />
                  <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded bg-blue-950/60 text-blue-300 border border-blue-700/40 hidden xs:inline shrink-0">
                    Oficial
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Navegação Principal">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-3.5 py-2 text-sm font-serif font-medium tracking-wide transition-all duration-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#ffd978] ${
                      isActive
                        ? 'text-[#ffd978] bg-[#1a202c]/70 shadow-inner'
                        : 'text-[#d6cebe] hover:text-[#ffd978] hover:bg-[#161b24]/50'
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978] to-transparent shadow-[0_0_8px_#ffd978]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Action Buttons (Visible on lg and above) */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/area-jogador"
                className="btn-medieval-secondary px-4 py-2 rounded text-xs flex items-center gap-2 cursor-pointer"
                title={activeUser ? `Logado como ${activeUser.displayName || activeUser.email}` : "Área do Jogador"}
              >
                <User className="w-3.5 h-3.5 text-[#ffd978]" />
                <span>{activeUser ? (activeUser.displayName || 'Minha Conta') : 'Área do Jogador'}</span>
                {activeUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </Link>

              <button
                onClick={handleDownloadClick}
                className="btn-gold-primary px-4 py-2 rounded text-xs flex items-center gap-2 cursor-pointer"
                title="Baixar Cliente do Jogo"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar o Jogo</span>
              </button>
            </div>

            {/* Tablet & Mobile Actions + Hamburger Toggle (Visible below lg) */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                to="/area-jogador"
                className="hidden sm:inline-flex btn-medieval-secondary p-2 sm:px-3 sm:py-1.5 rounded text-xs items-center gap-1.5"
                title={activeUser ? "Minha Conta" : "Área do Jogador"}
                aria-label="Área do Jogador"
              >
                <User className="w-3.5 h-3.5 text-[#ffd978]" />
                <span className="hidden md:inline">{activeUser ? (activeUser.displayName || 'Minha Conta') : 'Área do Jogador'}</span>
              </Link>

              <button
                onClick={handleDownloadClick}
                className="btn-gold-primary px-2.5 py-1.5 rounded text-[11px] sm:text-xs flex items-center gap-1 cursor-pointer"
                aria-label="Baixar o Jogo"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Download</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-[#141822] border border-[#c99738]/30 text-[#e8dec7] hover:text-[#ffd978] focus:outline-none focus:ring-2 focus:ring-[#ffd978] cursor-pointer"
                aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation with backdrop blur */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-[#0c0f16] border-l border-[#c99738]/40 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#c99738]/70 bg-black shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                    <img
                      src={`${import.meta.env.BASE_URL}assets/artemis-logo.jpg`}
                      alt="WYD Artemis Logo"
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <span className="font-serif font-bold text-lg gold-gradient-text">
                    WYD ARTEMIS
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#ffd978]"
                  aria-label="Fechar menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Server Quick Status */}
              <div className="mt-4 p-3 rounded-lg bg-[#141923] border border-[#c99738]/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-xs text-[#d6cebe] font-medium">Reino Artemis</span>
                </div>
                <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  Prévia Técnica
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="mt-6 space-y-1.5" aria-label="Navegação Mobile">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-serif font-medium transition-colors ${
                        isActive
                          ? 'bg-[#1e2533] text-[#ffd978] border-l-4 border-[#ffd978]'
                          : 'text-[#d6cebe] hover:bg-[#151a24] hover:text-[#ffd978]'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions inside drawer */}
            <div className="pt-6 border-t border-neutral-800 space-y-3">
              <Link
                to="/area-jogador"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full btn-medieval-secondary py-2.5 rounded text-xs flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-[#ffd978]" />
                <span>{activeUser ? (activeUser.displayName || 'Minha Conta') : 'Área do Jogador'}</span>
                {activeUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </Link>

              <button
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  handleDownloadClick(e);
                }}
                className="w-full btn-gold-primary py-2.5 rounded text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Baixar o Jogo</span>
              </button>

              <p className="text-[10px] text-center text-[#8e8778] pt-2">
                Dados demonstrativos • Versão 1.0 Alpha
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
