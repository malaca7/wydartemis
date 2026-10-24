import React from 'react';
import { useModal } from '../../hooks/useModal';
import { MedievalDivider } from '../common/MedievalDivider';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import {
  Swords,
  Sparkles,
  Castle,
  Crown,
  ArrowRight,
  Gem,
  Award,
} from 'lucide-react';

export const FeaturesOverview: React.FC = () => {
  const { openPendingModal } = useModal();
  const sectionRef = useScrollReveal<HTMLElement>();

  const handleLearnMore = (title: string) => {
    openPendingModal({
      title: `Detalhes do Sistema: ${title}`,
      featureName: title,
      description: 'O compêndio detalhado e a wiki oficial do sistema estão em fase de elaboração técnica. Os parâmetros apresentados refletem o conceito demonstrativo.',
      type: 'general',
    });
  };

  const features = [
    {
      icon: Swords,
      title: 'Quatro Classes Lendárias',
      subtitle: 'Equilíbrio Ancestral',
      description:
        'TransKnight, Foema, BeastMaster e Huntress com árvores de habilidades lapidadas para combates dinâmicos e cooperação tática em grupo.',
      accent: 'gold',
      glowColor: 'group-hover:border-[#ffd978]/60 group-hover:shadow-[0_0_25px_rgba(201,151,56,0.25)]',
      iconBg: 'border-[#c99738]/40 text-[#ffd978]',
      tag: 'Demonstrativo',
    },
    {
      icon: Castle,
      title: 'Guerras de Guilda & Cidades',
      subtitle: 'Domínio Territorial',
      description:
        'Disputas semanais pelo controle de Noatun e cidades periféricas. Recompensas de honra, impostos reais e glória eterna para o clã vencedor.',
      accent: 'crimson',
      glowColor: 'group-hover:border-red-500/60 group-hover:shadow-[0_0_25px_rgba(220,38,38,0.25)]',
      iconBg: 'border-red-600/40 text-red-400',
      tag: 'Demonstrativo',
    },
    {
      icon: Gem,
      title: 'Forja & Alquimia Mística',
      subtitle: 'Composição de Itens',
      description:
        'Evolução gradual de refino de equipamentos até +15, jóias arcanas e composições lendárias com taxas transparentes e justas.',
      accent: 'arcane',
      glowColor: 'group-hover:border-[#60a5fa]/70 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]',
      iconBg: 'border-blue-500/40 text-[#93c5fd]',
      tag: 'Demonstrativo',
    },
    {
      icon: Crown,
      title: 'Progressão Clássica',
      subtitle: 'Mortal a Sub-Celestial',
      description:
        'Reviva a lendária jornada de evolução por estágios: Mortal, Arch, Celestial e Sub-Celestial com quests desafiadoras e recompensas únicas.',
      accent: 'gold',
      glowColor: 'group-hover:border-[#ffd978]/60 group-hover:shadow-[0_0_25px_rgba(201,151,56,0.25)]',
      iconBg: 'border-[#c99738]/40 text-[#ffd978]',
      tag: 'Demonstrativo',
    },
  ];

  return (
    <section
      id="explore-section"
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Ambient background glow behind section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[350px] bg-gradient-to-r from-[#1e3a6a]/15 via-[#c99738]/10 to-[#1e3a6a]/15 blur-[150px] pointer-events-none rounded-full" />

      {/* Section Header with Scroll Reveal */}
      <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#141924] border border-[#c99738]/30 text-xs text-[#ffd978] mb-3 shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
          <Sparkles className="w-3.5 h-3.5 text-[#ffd978]" />
          <span>Pilares do Reino Artemis</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#f5efe2] tracking-wide mb-4">
          A Verdadeira Essência do <span className="gold-gradient-text">MMORPG Medieval</span>
        </h2>

        <p className="text-sm sm:text-base text-[#a8a090] leading-relaxed">
          Projetado para honrar a nostalgia clássica enquanto incorpora estabilidade moderna, combates fluídos e um ecossistema focado no mérito e na comunidade.
        </p>

        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Feature Cards Grid with Staggered Scroll Reveal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, index) => {
          const Icon = feat.icon;
          return (
            <div
              key={index}
              style={{ transitionDelay: `${index * 120}ms` }}
              className={`medieval-panel-interactive rounded-2xl p-6 flex flex-col justify-between relative group overflow-hidden scroll-reveal ${feat.glowColor}`}
            >
              {/* Top ambient highlight on card */}
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978]/30 to-transparent group-hover:via-[#ffd978]/80 transition-all duration-500" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-[#121620] border ${feat.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black/50 text-[#a8a090] border border-neutral-800">
                    {feat.tag}
                  </span>
                </div>

                <span className="text-xs font-semibold text-[#c99738] tracking-wider uppercase block mb-1">
                  {feat.subtitle}
                </span>

                <h3 className="text-lg font-serif font-bold text-[#ede3cc] group-hover:text-[#ffd978] transition-colors mb-2.5">
                  {feat.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#9c9484] leading-relaxed mb-6">
                  {feat.description}
                </p>
              </div>

              <button
                onClick={() => handleLearnMore(feat.title)}
                className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#ffd978] group-hover:text-[#fff0ba] transition-colors mt-auto group/btn cursor-pointer pt-3 border-t border-neutral-800/80"
              >
                <span>Conhecer Detalhes</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1 text-[#c99738]" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Server Transparency Callout Banner with Scroll Reveal */}
      <div className="mt-14 medieval-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#c99738]/35 relative scroll-reveal shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-radial from-[#c99738]/5 via-transparent to-transparent pointer-events-none rounded-2xl" />

        <div className="space-y-2 text-center md:text-left relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <Award className="w-5 h-5 text-[#ffd978]" />
            <h4 className="font-serif font-bold text-lg md:text-xl text-[#f5efe2]">
              Compromisso com o Equilíbrio e a Nostalgia
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-[#a8a090] max-w-2xl leading-relaxed">
            Nenhum item que quebre o equilíbrio do combate no jogo será vendido. O progresso de cada guerreiro no WYD Artemis é conquistado nas arenas, calabouços e guerras de clãs.
          </p>
        </div>

        <button
          onClick={() =>
            openPendingModal({
              title: 'Diretrizes do Servidor',
              featureName: 'Manifesto de Equilíbrio & Gameplay',
              description: 'O documento oficial de regras e diretrizes de gameplay está em fase de revisão pela administração.',
              type: 'general',
            })
          }
          className="btn-gold-primary px-7 py-3.5 rounded-xl text-xs font-serif font-bold shrink-0 cursor-pointer shadow-lg relative z-10"
        >
          Ver Manifesto do Servidor
        </button>
      </div>
    </section>
  );
};
