import React from 'react';
import {
  X,
  Heart,
  Droplet,
  Swords,
  Sparkles,
} from 'lucide-react';
import type { DemoCharacter } from '../../types';

interface CharacterDetailModalProps {
  character: DemoCharacter | null;
  onClose: () => void;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  onClose,
}) => {
  if (!character) return null;

  // Atributos temáticos fiéis às classes do WYD
  const isTk = character.characterClass === 'TransKnight';
  const isFm = character.characterClass === 'Foema';
  const isBm = character.characterClass === 'BeastMaster';

  const stats = isTk
    ? {
        role: 'Cavaleiro Sagrado & Defensor',
        str: 85,
        dex: 65,
        int: 30,
        con: 75,
        hp: 520,
        maxHp: 520,
        mp: 180,
        maxMp: 180,
        atk: '145 - 180',
        def: '135',
        lore: 'Mestres no combate corpo a corpo e no manejo de escudos pesados e montarias. Os TransKnights canalizam a força sagrada para proteger seus aliados.',
        skills: ['Espada Sagrada', 'Julgamento Divino', 'Aura Celestial', 'Impacto Cósmico'],
      }
    : isFm
    ? {
        role: 'Maga Elemental & Invocadora Divina',
        str: 25,
        dex: 35,
        int: 95,
        con: 55,
        hp: 340,
        maxHp: 340,
        mp: 680,
        maxMp: 680,
        atk: '85 - 110 (Mágico: 220)',
        def: '75',
        lore: 'Dominadoras das tempestades celestiais, gelo ancestral e magias de regeneração. As Foemas são o pilar mágico de qualquer grupo.',
        skills: ['Nevasca Arcana', 'Meteoro Flamejante', 'Cura Superior', 'Escudo de Mana'],
      }
    : isBm
    ? {
        role: 'Metamorfo & Domador das Feras',
        str: 60,
        dex: 50,
        int: 70,
        con: 65,
        hp: 460,
        maxHp: 460,
        mp: 420,
        maxMp: 420,
        atk: '125 - 150',
        def: '105',
        lore: 'Guerreiros xamânicos capazes de se transformar em criaturas ancestrais e convocar guardiões elementais.',
        skills: ['Metamorfose Lupina', 'Golpe Sísmico', 'Chamado da Matilha', 'Fúria Selvagem'],
      }
    : {
        role: 'Arqueira Mística & Sentinela',
        str: 45,
        dex: 95,
        int: 35,
        con: 50,
        hp: 390,
        maxHp: 390,
        mp: 260,
        maxMp: 260,
        atk: '160 - 195 (Distância)',
        def: '85',
        lore: 'Especialistas em ataques precisos com arcos longos e garras letais com esquiva sobre-humana.',
        skills: ['Chuva de Flechas', 'Tiro Triplo', 'Olho de Águia', 'Passo das Sombras'],
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0c0f16] border border-[#c99738]/50 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#121622] border-b border-[#c99738]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a2232] border border-[#c99738]/40 flex items-center justify-center text-[#ffd978]">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#f5ebd6]">
                  {character.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/40">
                  {character.stage}
                </span>
              </div>
              <p className="text-xs text-[#9d9484]">
                {character.characterClass} • Nível {character.level} • {stats.role}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Fechar detalhes do personagem"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto flex-1">
          
          {/* Health & Mana Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-[#111622] border border-neutral-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-serif font-bold text-red-400">
                  <Heart className="w-3.5 h-3.5 fill-red-500/20" />
                  <span>Pontos de Vida (HP)</span>
                </span>
                <span className="font-mono text-[#f5ebd6] font-semibold">
                  {stats.hp} / {stats.maxHp}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-900 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-red-400 w-full" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111622] border border-neutral-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 font-serif font-bold text-blue-400">
                  <Droplet className="w-3.5 h-3.5 fill-blue-500/20" />
                  <span>Pontos de Mana (MP)</span>
                </span>
                <span className="font-mono text-[#f5ebd6] font-semibold">
                  {stats.mp} / {stats.maxMp}
                </span>
              </div>
              <div className="h-2 rounded-full bg-neutral-900 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-full" />
              </div>
            </div>
          </div>

          {/* Core WYD Attributes (STR, DEX, INT, CON) */}
          <div>
            <h4 className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider mb-3">
              Atributos Primários do Herói
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#141924] border border-[#c99738]/25 text-center">
                <span className="text-[10px] uppercase text-[#9e9585] block font-semibold">
                  Força (STR)
                </span>
                <span className="text-xl font-serif font-bold text-[#ffd978] block mt-0.5">
                  {stats.str}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#141924] border border-[#c99738]/25 text-center">
                <span className="text-[10px] uppercase text-[#9e9585] block font-semibold">
                  Destreza (DEX)
                </span>
                <span className="text-xl font-serif font-bold text-[#ffd978] block mt-0.5">
                  {stats.dex}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#141924] border border-[#3b82f6]/30 text-center">
                <span className="text-[10px] uppercase text-[#93c5fd] block font-semibold">
                  Inteligência (INT)
                </span>
                <span className="text-xl font-serif font-bold text-[#93c5fd] block mt-0.5">
                  {stats.int}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#141924] border border-emerald-500/30 text-center">
                <span className="text-[10px] uppercase text-emerald-400 block font-semibold">
                  Constituição (CON)
                </span>
                <span className="text-xl font-serif font-bold text-emerald-400 block mt-0.5">
                  {stats.con}
                </span>
              </div>
            </div>
          </div>

          {/* Combat Ratings */}
          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Poder de Ataque</span>
              <span className="font-mono text-[#ffd978] text-sm font-bold block mt-0.5">
                {stats.atk}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Defesa Física</span>
              <span className="font-mono text-[#ffd978] text-sm font-bold block mt-0.5">
                {stats.def}
              </span>
            </div>
          </div>

          {/* Class Lore */}
          <div className="p-4 rounded-xl bg-[#131722] border border-[#c99738]/30">
            <span className="text-[11px] font-serif font-bold text-[#ffd978] uppercase tracking-wider block mb-1">
              Doutrina da Classe
            </span>
            <p className="text-xs text-[#c5bcab] leading-relaxed">
              {stats.lore}
            </p>
          </div>

          {/* Skills Preview */}
          <div>
            <span className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider block mb-2">
              Habilidades Iniciais da Linhagem
            </span>
            <div className="flex flex-wrap gap-2">
              {stats.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs bg-[#161c28] border border-neutral-700 text-[#d8d0c2] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#0a0d14] border-t border-neutral-800 flex items-center justify-between text-xs text-[#8c8475] shrink-0">
          <span className="flex items-center gap-1.5 truncate mr-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ffd978] shrink-0" />
            <span className="truncate">Sincronizado com o Firestore</span>
          </span>

          <button
            onClick={onClose}
            className="btn-gold-primary px-4 py-1.5 rounded-lg text-xs font-serif font-bold cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
