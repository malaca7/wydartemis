import React, { useState } from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import { Trophy, Shield, Search, ChevronRight, AlertCircle } from 'lucide-react';

interface MockPlayer {
  rank: number;
  name: string;
  classType: string;
  level: string;
  guild: string;
  fame: number;
}

const mockPlayers: MockPlayer[] = [
  { rank: 1, name: 'SirGalahad', classType: 'TransKnight', level: 'Sub-Cel 400', guild: 'Valhalla', fame: 15420 },
  { rank: 2, name: 'MorganaArcane', classType: 'Foema', level: 'Sub-Cel 398', guild: 'Arcana', fame: 14890 },
  { rank: 3, name: 'FenrirWolf', classType: 'BeastMaster', level: 'Sub-Cel 395', guild: 'Valhalla', fame: 13910 },
  { rank: 4, name: 'ArtemisBow', classType: 'Huntress', level: 'Sub-Cel 392', guild: 'Shadows', fame: 13100 },
  { rank: 5, name: 'Lancelot', classType: 'TransKnight', level: 'Celestial 400', guild: 'Templários', fame: 12450 },
  { rank: 6, name: 'Elysia', classType: 'Foema', level: 'Celestial 395', guild: 'Arcana', fame: 11800 },
];

export const RankingPage: React.FC = () => {
  const [tab, setTab] = useState<'players' | 'guilds'>('players');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = mockPlayers.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.guild.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.classType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9e9585] mb-8 font-medium">
        <span>Início</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
        <span className="text-[#ffd978]">Ranking de Jogadores</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#c99738] mb-2 block">
          Panteão dos Campeões
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-wide mb-4">
          Ranking do Servidor
        </h1>
        <p className="text-[#b5ac9c] text-sm md:text-base leading-relaxed">
          Os heróis mais poderosos e as guildas que conquistaram seu nome nas muralhas e calabouços de Artemis.
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#121620] border border-neutral-800">
          <button
            onClick={() => setTab('players')}
            className={`px-5 py-2.5 rounded-lg text-xs font-serif font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              tab === 'players'
                ? 'bg-[#c99738] text-black shadow-md'
                : 'text-[#a8a090] hover:text-[#ffd978]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Top Personagens</span>
          </button>
          <button
            onClick={() => setTab('guilds')}
            className={`px-5 py-2.5 rounded-lg text-xs font-serif font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              tab === 'guilds'
                ? 'bg-[#c99738] text-black shadow-md'
                : 'text-[#a8a090] hover:text-[#ffd978]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Top Guildas</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nome, guilda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#121620] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Ranking Table */}
      <div className="medieval-panel rounded-xl overflow-hidden border border-[#c99738]/30 mb-8 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#141924] border-b border-[#c99738]/30 text-xs font-serif font-bold text-[#ffd978] tracking-wider uppercase">
              <tr>
                <th className="py-4 px-6 text-center w-16">#</th>
                <th className="py-4 px-6">Personagem</th>
                <th className="py-4 px-6">Classe</th>
                <th className="py-4 px-6">Nível / Estágio</th>
                <th className="py-4 px-6">Guilda</th>
                <th className="py-4 px-6 text-right">Pontos de Fama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 text-xs">
              {filteredPlayers.map((player) => (
                <tr
                  key={player.rank}
                  className="hover:bg-[#1a202d]/60 transition-colors"
                >
                  <td className="py-4 px-6 text-center font-bold">
                    {player.rank === 1 && (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500 font-serif">
                        1
                      </span>
                    )}
                    {player.rank === 2 && (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400 font-serif">
                        2
                      </span>
                    )}
                    {player.rank === 3 && (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-800/20 text-amber-600 border border-amber-700 font-serif">
                        3
                      </span>
                    )}
                    {player.rank > 3 && <span className="text-[#8c8577]">{player.rank}</span>}
                  </td>
                  <td className="py-4 px-6 font-serif font-bold text-[#f5efe2]">
                    {player.name}
                  </td>
                  <td className="py-4 px-6 text-[#c99738]">
                    {player.classType}
                  </td>
                  <td className="py-4 px-6 text-[#c5bcab] font-mono">
                    {player.level}
                  </td>
                  <td className="py-4 px-6 text-[#a8a090]">
                    {player.guild}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-[#ffd978]">
                    {player.fame.toLocaleString('pt-BR')} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demonstrative Alert */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
        <p>
          Status demonstrativo: O ranking exibido acima utiliza dados fictícios para fins de prototipagem e validação de layout. Não há conexão ativa com banco de dados do jogo nesta etapa.
        </p>
      </div>
    </div>
  );
};
