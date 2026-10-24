import React from 'react';
import { useModal } from '../../context/ModalContext';
import { MedievalDivider } from '../common/MedievalDivider';
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
      tag: 'Demonstrativo',
    },
    {
      icon: Castle,
      title: 'Guerras de Guilda & Cidades',
      subtitle: 'Domínio Territorial',
      description:
        'Disputas semanais pelo controle de Noatun e cidades periféricas. Recompensas de honra, impostos reais e glória eterna para o clã vencedor.',
      accent: 'crimson',
      tag: 'Demonstrativo',
    },
    {
      icon: Gem,
      title: 'Forja & Alquimia Mística',
      subtitle: 'Composição de Itens',
      description:
        'Evolução gradual de refino de equipamentos até +15, jóias arcanas e composições lendárias com taxas transparentes e justas.',
      accent: 'arcane',
      tag: 'Demonstrativo',
    },
    {
      icon: Crown,
      title: 'Progressão Clássica',
      subtitle: 'Mortal a Sub-Celestial',
      description:
        'Reviva a lendária jornada de evolução por estágios: Mortal, Arch, Celestial e Sub-Celestial com quests desafiadoras e recompensas únicas.',
      accent: 'gold',
      tag: 'Demonstrativo',
    },
  ];

  return (
    <section id="explore-section" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181d28] border border-[#c99738]/30 text-xs text-[#ffd978] mb-3">
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

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, index) => {
          const Icon = feat.icon;
          return (
            <div
              key={index}
              className="medieval-panel-interactive rounded-xl p-6 flex flex-col justify-between relative group overflow-hidden"
            >
              {/* Top ambient highlight on card */}
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978]/30 to-transparent group-hover:via-[#ffd978]/70 transition-all duration-300" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-[#141823] border border-[#c99738]/30 text-[#ffd978] group-hover:scale-110 group-hover:border-[#ffd978]/60 transition-all duration-300 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-[#9c9482] border border-neutral-800">
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
                className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#ffd978] hover:text-[#fff0ba] transition-colors mt-auto group/btn cursor-pointer"
              >
                <span>Conhecer Detalhes</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Server Transparency Callout Banner */}
      <div className="mt-14 medieval-panel rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#c99738]/35 relative">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
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
          className="btn-gold-primary px-6 py-3 rounded text-xs font-serif font-bold shrink-0 cursor-pointer"
        >
          Ver Manifesto do Servidor
        </button>
      </div>
    </section>
  );
};
