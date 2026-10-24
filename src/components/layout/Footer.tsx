import React from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '../../hooks/useModal';
import { MedievalDivider } from '../common/MedievalDivider';
import {
  Shield,
  MessageSquare,
  HelpCircle,
  FileText,
  Lock,
  Flame,
  Globe,
  ChevronRight,
} from 'lucide-react';

const CURRENT_YEAR = 2026;

export const Footer: React.FC = () => {
  const { openPendingModal } = useModal();

  const handlePendingLink = (name: string, category: string) => {
    openPendingModal({
      title: 'Canal em Configuração',
      featureName: `${category} — ${name}`,
      description: `O link oficial para "${name}" ainda não foi fornecido pela administração do servidor. Em conformidade com o projeto, links externos não são inventados.`,
      type: 'external',
    });
  };

  return (
    <footer className="relative bg-[#07080c] border-t border-[#c99738]/20 text-[#c5bcab] pt-16 pb-12 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-gradient-to-t from-[#c99738]/5 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Brand Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          {/* Brand & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#c99738]/70 bg-black/90 shadow-[0_0_18px_rgba(59,130,246,0.35)]">
                <img
                  src={`${import.meta.env.BASE_URL}assets/artemis-logo.jpg`}
                  alt="WYD Artemis Logo Oficial"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold gold-gradient-text tracking-wider">
                  WYD ARTEMIS
                </span>
                <p className="text-xs text-[#9c9484] uppercase tracking-widest font-semibold">
                  Portal Épico de MMORPG
                </p>
              </div>
            </div>

            <p className="text-sm text-[#a39b8c] leading-relaxed max-w-sm">
              Um portal dedicado aos aventureiros do lendário MMORPG medieval. Batalhas de guildas, forja refinada, progressão clássica e uma comunidade forjada na honra.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#131722] border border-[#c99738]/30 text-xs text-[#ffd978]">
                <Shield className="w-3.5 h-3.5 text-[#ffd978]" />
                <span>Servidor em Fase de Demonstração</span>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#ffd978] uppercase tracking-wider mb-4 border-b border-[#c99738]/20 pb-2">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
                  Início
                </Link>
              </li>
              <li>
                <Link to="/o-jogo" className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
                  O Jogo & Classes
                </Link>
              </li>
              <li>
                <Link to="/noticias" className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
                  Notícias & Atualizações
                </Link>
              </li>
              <li>
                <Link to="/ranking" className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
                  Ranking de Jogadores
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
                  Status do Servidor
                </Link>
              </li>
              <li>
                <Link to="/area-jogador" className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
                  Área do Jogador
                </Link>
              </li>
              <li>
                <Link to="/download" className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
                  Download do Cliente
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Support */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#ffd978] uppercase tracking-wider mb-4 border-b border-[#c99738]/20 pb-2">
              Comunidade
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handlePendingLink('Discord Oficial', 'Comunidade')}
                  className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5 text-left w-full cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Discord Oficial</span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1 rounded ml-auto">Pendente</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePendingLink('Fórum de Discussões', 'Comunidade')}
                  className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5 text-left w-full cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Fórum de Discussões</span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1 rounded ml-auto">Pendente</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePendingLink('Central de Suporte', 'Suporte')}
                  className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5 text-left w-full cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Central de Tickets</span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1 rounded ml-auto">Pendente</span>
                </button>
              </li>
              <li>
                <Link to="/loja" className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Loja Demonstrativa</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Terms */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#ffd978] uppercase tracking-wider mb-4 border-b border-[#c99738]/20 pb-2">
              Institucional
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handlePendingLink('Termos de Uso', 'Institucional')}
                  className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5 text-left w-full cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#ffd978]" />
                  <span>Termos de Serviço</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePendingLink('Política de Privacidade', 'Institucional')}
                  className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5 text-left w-full cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#ffd978]" />
                  <span>Privacidade de Dados</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePendingLink('Regras do Jogo e Conduta', 'Institucional')}
                  className="hover:text-[#ffd978] transition-colors flex items-center gap-1.5 text-left w-full cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-[#ffd978]" />
                  <span>Regras de Conduta</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Ornamental Medieval Divider */}
        <MedievalDivider variant="gold" className="my-6" />

        {/* Legal Disclaimer & Identification */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-[#8c8475] gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="font-medium text-[#b3ab9d]">
              © {CURRENT_YEAR} WYD Artemis — Protótipo de Portal Medieval de MMORPG.
            </p>
            <p className="max-w-3xl leading-relaxed text-[11px] text-[#7d7568]">
              Aviso legal: Este projeto é um protótipo visual demonstrativo. Todas as marcas, nomes de classes e propriedades intelectuais originais associadas a "With Your Destiny (WYD)" pertencem a seus respectivos titulares de direitos. Nenhuma transação comercial real, autenticação oficial de terceiros ou vínculo governamental é alegado ou realizado nesta fase.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-[#121620] px-3 py-1.5 rounded border border-neutral-800 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Ambiente: Demonstração v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
