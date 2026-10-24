import React from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import { useModal } from '../context/ModalContext';
import {
  MessageSquare,
  Globe,
  HelpCircle,
  Shield,
  ChevronRight,
  ExternalLink,
  Clock,
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const { openPendingModal } = useModal();

  const handlePendingChannel = (name: string, description: string) => {
    openPendingModal({
      title: 'Canal de Comunidade',
      featureName: name,
      description: `${description} O link oficial de acesso será vinculado assim que for confirmado pela administração.`,
      type: 'external',
    });
  };

  const channels = [
    {
      id: 'discord',
      title: 'Discord Oficial',
      description: 'O ponto de encontro dos guerreiros. Salas de voz para guildas, avisos em tempo real, suporte rápido e comunidade ativa.',
      icon: MessageSquare,
      status: 'Convite em Configuração',
      badgeColor: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40',
    },
    {
      id: 'forum',
      title: 'Fórum da Comunidade',
      description: 'Espaço para guias de classes, comércio demonstrativo de itens, estratégias de guerra e sugestões técnicas da comunidade.',
      icon: Globe,
      status: 'Domínio em Configuração',
      badgeColor: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
    },
    {
      id: 'support',
      title: 'Central de Atendimento & Suporte',
      description: 'Abertura de tickets para dúvidas operacionais, denúncias de conduta e suporte para testes de conexão.',
      icon: HelpCircle,
      status: 'Sistema em Configuração',
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    },
    {
      id: 'rules',
      title: 'Código de Honra & Diretrizes',
      description: 'Normas de boa convivência, regras de PvP e política de tolerância zero contra bots e trapaças.',
      icon: Shield,
      status: 'Documento em Revisão',
      badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    },
  ];

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9e9585] mb-8 font-medium">
        <span>Início</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
        <span className="text-[#ffd978]">Comunidade & Canais Oficiais</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#c99738] mb-2 block">
          Aliança dos Guerreiros
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-wide mb-4">
          Comunidade WYD Artemis
        </h1>
        <p className="text-[#b5ac9c] text-sm md:text-base leading-relaxed">
          Encontre aliados para suas jornadas, monte sua guilda e participe das discussões sobre o futuro do servidor.
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <div
              key={channel.id}
              className="medieval-panel-interactive rounded-xl p-6 sm:p-8 flex flex-col justify-between group cursor-pointer"
              onClick={() => handlePendingChannel(channel.title, channel.description)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 rounded-xl bg-[#141923] border border-[#c99738]/30 text-[#ffd978] group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded border ${channel.badgeColor}`}>
                    {channel.status}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl text-[#f5efe2] group-hover:text-[#ffd978] transition-colors mb-3">
                  {channel.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#a8a090] leading-relaxed mb-6">
                  {channel.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#ffd978] group-hover:text-[#fff0ba] flex items-center gap-1.5">
                  <span>Acessar Canal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] text-[#71695c]">Link em validação</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Community Event Notice */}
      <div className="medieval-panel rounded-xl p-6 border border-[#c99738]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-[#ffd978]">
            <Clock className="w-4 h-4 text-[#ffd978]" />
            <span>Recrutamento de Moderadores Voluntários</span>
          </div>
          <p className="text-xs text-[#a8a090]">
            Em breve abriremos formulário de voluntários para moderação do Discord e suporte à comunidade de jogadores.
          </p>
        </div>

        <button
          onClick={() =>
            openPendingModal({
              title: 'Recrutamento de Voluntários',
              featureName: 'Formulário de Inscrição',
              description: 'O formulário de candidatura voluntária para moderação será anunciado oficialmente no Discord do servidor.',
              type: 'general',
            })
          }
          className="btn-gold-primary px-5 py-2.5 rounded text-xs font-serif font-bold shrink-0 cursor-pointer"
        >
          Saiba Mais
        </button>
      </div>
    </div>
  );
};
