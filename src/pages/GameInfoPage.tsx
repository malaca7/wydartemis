import React, { useState } from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import { useModal } from '../hooks/useModal';
import { Sparkles, ChevronRight, Info } from 'lucide-react';

const classesData = [
  {
    id: 'tk',
    name: 'TransKnight',
    role: 'Guerreiro & Mestre de Espadas',
    desc: 'Mestres do combate corpo a corpo, dotados de armaduras pesadas e maestria nas disciplinas de Confiança, Trans e Espada.',
    weapons: 'Espadas de uma ou duas mãos, Escudos',
    focus: 'Alta resistência, controle de grupo e impacto físico brutal.',
  },
  {
    id: 'foema',
    name: 'Foema',
    role: 'Maga Elemental & Suporte Divino',
    desc: 'Canalizadoras dos mistérios arcanos, dominam os elementos do Fogo, Gelo, Trovão e magias sagradas de cura e suporte.',
    weapons: 'Cajados Arcanos, Cetros Mágicos',
    focus: 'Dano mágico massivo em área e suporte vital para o grupo.',
  },
  {
    id: 'bm',
    name: 'BeastMaster',
    role: 'Mestre da Natureza & Evocação',
    desc: 'Guerreiros em sintonia com a terra ancestral, capazes de invocar espíritos das feras e transformar sua própria essência.',
    weapons: 'Machados e Lanças Elementais',
    focus: 'Transformações de combate, invocações e venenos.',
  },
  {
    id: 'ht',
    name: 'Huntress',
    role: 'Arqueira & Caçadora Sombria',
    desc: 'Ágeis e letais à longa distância, desferem flechadas devastadoras e dominam armadilhas táticas e sobrevivência.',
    weapons: 'Arcos Longos e Garras de Precisão',
    focus: 'Dano crítico contínuo à distância e altíssima evasão.',
  },
];

export const GameInfoPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState(classesData[0]);
  const { openPendingModal } = useModal();

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9e9585] mb-8 font-medium">
        <span>Início</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
        <span className="text-[#ffd978]">O Jogo & Classes</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#c99738] mb-2 block">
          Guia do Aventureiro
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-wide mb-4">
          O Mundo de WYD Artemis
        </h1>
        <p className="text-[#b5ac9c] text-sm md:text-base leading-relaxed">
          Conheça as linhagens, as disciplinas de combate e as forças ancestrais que moldam os quatro guerreiros sagrados de Artemis.
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Class Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
        {classesData.map((cls) => {
          const isActive = selectedClass.id === cls.id;
          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`p-3 sm:p-4 rounded-xl border text-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1b2230] border-[#ffd978] shadow-[0_0_15px_rgba(201,151,56,0.25)]'
                  : 'bg-[#0f1218] border-neutral-800 hover:border-[#c99738]/40 text-[#c5bcab]'
              }`}
            >
              <h3 className={`font-serif font-bold text-sm sm:text-base ${isActive ? 'text-[#ffd978]' : 'text-neutral-300'}`}>
                {cls.name}
              </h3>
              <span className="text-[10px] sm:text-[11px] text-[#938a79] block mt-0.5">{cls.role}</span>
            </button>
          );
        })}
      </div>

      {/* Class Detail Card */}
      <div className="medieval-panel rounded-2xl p-5 sm:p-10 border border-[#c99738]/40 mb-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#171d2b] border border-[#c99738]/30 text-xs text-[#ffd978]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{selectedClass.role}</span>
            </div>

            <h2 className="text-3xl font-serif font-bold text-[#f5efe2]">
              {selectedClass.name}
            </h2>

            <p className="text-[#c5bcab] text-sm md:text-base leading-relaxed">
              {selectedClass.desc}
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-[#11141b] border border-neutral-800">
                <span className="text-xs text-[#ffd978] font-semibold block mb-1">Armamentos Principais</span>
                <p className="text-xs text-[#a9a190]">{selectedClass.weapons}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#11141b] border border-neutral-800">
                <span className="text-xs text-[#ffd978] font-semibold block mb-1">Estilo de Combate</span>
                <p className="text-xs text-[#a9a190]">{selectedClass.focus}</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 p-5 rounded-xl bg-[#121620] border border-[#c99738]/30 flex flex-col justify-between shrink-0">
            <div>
              <span className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider block mb-2">
                Status da Classe
              </span>
              <p className="text-xs text-[#9e9585] mb-4">
                Balanceamento em refinamento para a versão alpha pública.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">Dano Físico/Mágico</span>
                  <span className="text-[#ffd978] font-mono">Balanceado</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800">
                  <span className="text-neutral-400">Defesa Base</span>
                  <span className="text-[#ffd978] font-mono">Ajustada</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">PvP / GvG</span>
                  <span className="text-emerald-400 font-mono">Calibrado</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                openPendingModal({
                  title: `Árvore de Habilidades: ${selectedClass.name}`,
                  featureName: `Guia de Skills do ${selectedClass.name}`,
                  description: 'A wiki detalhada com árvore de habilidades, consumos de MP e fórmulas matemáticas de dano está em fase de redação.',
                  type: 'general',
                })
              }
              className="mt-6 w-full btn-gold-primary py-2.5 rounded text-xs font-serif font-bold cursor-pointer"
            >
              Ver Árvore de Skills
            </button>
          </div>
        </div>
      </div>

      {/* Demonstrative Alert */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-xs flex items-center gap-3">
        <Info className="w-5 h-5 shrink-0 text-amber-400" />
        <p>
          Nota demonstrativa: As descrições acima são apresentadas como referência para navegação e experiência visual. As estatísticas definitivas e guias de evolução serão publicados após os testes internos do servidor.
        </p>
      </div>
    </div>
  );
};
