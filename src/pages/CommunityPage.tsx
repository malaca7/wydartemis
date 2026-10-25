import React, { useState } from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import { useModal } from '../hooks/useModal';
import {
  MessageSquare,
  Globe,
  HelpCircle,
  Shield,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { communityLinks } from '../config/site';

export const CommunityPage: React.FC = () => {
  const { openPendingModal } = useModal();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChannelClick = (channelKey: keyof typeof communityLinks) => {
    const channel = communityLinks[channelKey];
    if (!channel.url) {
      openPendingModal({
        title: channel.label,
        featureName: 'Canal Oficial da Comunidade',
        description: `O link oficial de acesso para ${channel.label} ainda não foi disponibilizado pela administração. Nenhum link provisório ou não oficial é vinculado para garantir a segurança dos jogadores.`,
        type: 'external',
      });
      return;
    }
    window.open(channel.url, '_blank', 'noopener,noreferrer');
  };

  const channelCards = [
    {
      key: 'discord' as const,
      icon: MessageSquare,
      badgeColor: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40',
      statusText: communityLinks.discord.url ? 'Canal Ativo' : 'Link em Configuração Oficial',
    },
    {
      key: 'community' as const,
      icon: Globe,
      badgeColor: 'text-blue-400 bg-blue-950/40 border-blue-800/40',
      statusText: communityLinks.community.url ? 'Fórum Ativo' : 'Domínio em Configuração',
    },
    {
      key: 'announcements' as const,
      icon: Bell,
      badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
      statusText: communityLinks.announcements.url ? 'Canal Ativo' : 'Canal em Preparação',
    },
    {
      key: 'support' as const,
      icon: HelpCircle,
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
      statusText: communityLinks.support.url ? 'Central Ativa' : 'Sistema em Integração',
    },
  ];

  const guidelines = [
    {
      title: 'Respeito Mútuo e Comunicação Construtiva',
      content:
        'Não serão tolerados insultos, assédio, discriminação, discursos de ódio ou condutas tóxicas em quaisquer canais de voz, texto ou fóruns vinculados ao servidor.',
    },
    {
      title: 'Tolerância Zero contra Cheats e Bots',
      content:
        'O uso de macros automatizados não autorizados, programas de terceiros, injeção de pacotes ou exploração deliberada de falhas acarretará punições imediatas e banimento da conta.',
    },
    {
      title: 'Comércio Justo e Segurança de Contas',
      content:
        'É expressamente proibido comercializar contas, itens ou serviços virtuais por moeda real fora dos sistemas oficiais do jogo. Jamais compartilhe suas senhas com outros jogadores.',
    },
    {
      title: 'Conduta em Guerras e PvP',
      content:
        'A rivalidade saudável entre guildas faz parte da essência do jogo. Mantenha as disputas dentro do ambiente de combate sem estender agressões ao convívio pessoal fora do jogo.',
    },
  ];

  const faqs = [
    {
      q: 'Como posso tirar dúvidas com a equipe de desenvolvimento?',
      a: 'Assim que o canal do Discord e o suporte forem publicados oficialmente, haverá salas exclusivas para dúvidas técnicas, bugs e sugestões com a equipe.',
    },
    {
      q: 'O servidor aceitará recrutamento de guildas antes do lançamento?',
      a: 'Sim! Haverá uma seção dedicada no fórum e no Discord para que os líderes de guilda apresentem seus clãs e organizem suas alianças.',
    },
    {
      q: 'Como denuncio uma infração de regras?',
      a: 'Pela central oficial de tickets. Prints de tela ou vídeos comprovando o ocorrido deverão ser anexados no chamado.',
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
      <div className="text-center max-w-3xl mx-auto mb-12">
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

      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
        {channelCards.map((card) => {
          const channel = communityLinks[card.key];
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="medieval-panel-interactive rounded-xl p-6 sm:p-8 flex flex-col justify-between group cursor-pointer relative"
              onClick={() => handleChannelClick(card.key)}
            >
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978]/30 to-transparent group-hover:via-[#ffd978]/70 transition-all" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3.5 rounded-xl bg-[#141923] border border-[#c99738]/30 text-[#ffd978] group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded border ${card.badgeColor}`}>
                    {card.statusText}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl text-[#f5efe2] group-hover:text-[#ffd978] transition-colors mb-3">
                  {channel.label}
                </h3>

                <p className="text-xs sm:text-sm text-[#a8a090] leading-relaxed mb-6">
                  {channel.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-serif font-bold text-[#ffd978] group-hover:text-[#fff0ba] flex items-center gap-1.5">
                  <span>{channel.url ? 'Acessar Link Oficial' : 'Aguardando Configuração Oficial'}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </span>
                <span className="text-[11px] text-[#71695c]">
                  {channel.url ? 'Link Verificado' : 'Aviso ao Clicar'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guidelines Section */}
      <div className="mb-14 medieval-panel rounded-2xl p-5 sm:p-10 border border-[#c99738]/35 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
          <Shield className="w-6 h-6 text-[#ffd978]" />
          <div>
            <h3 className="font-serif font-bold text-xl text-[#f5efe2]">
              Código de Honra & Diretrizes da Comunidade
            </h3>
            <p className="text-xs text-[#9c9484]">
              Princípios fundamentais de convivência e integridade no servidor
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guidelines.map((rule, index) => (
            <div key={index} className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#c99738] shrink-0" />
                <h4 className="font-serif font-bold text-sm text-[#ffd978]">
                  {rule.title}
                </h4>
              </div>
              <p className="text-xs text-[#a8a090] leading-relaxed pl-6">
                {rule.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Community FAQ */}
      <div className="medieval-panel rounded-2xl p-6 sm:p-10 border border-neutral-800 shadow-xl">
        <h3 className="font-serif font-bold text-xl text-[#f5efe2] mb-6 pb-3 border-b border-neutral-800">
          Perguntas Frequentes sobre a Comunidade
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-neutral-800 bg-[#0f131c] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-medium text-[#ede3cc] hover:text-[#ffd978] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#c99738] transition-transform duration-200 shrink-0 ml-2 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#9c9484] leading-relaxed border-t border-neutral-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
