import React, { useState, useMemo } from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import {
  Trophy,
  Shield,
  Search,
  ChevronRight,
  AlertCircle,
  ChevronLeft,
  ArrowUpDown,
  Users,
} from 'lucide-react';
import {
  getRankedCharacters,
  getRankedGuilds,
  paginate,
} from '../data/rankingData';
import type { CharacterClass, SortDirection } from '../types';

export const RankingPage: React.FC = () => {
  const [tab, setTab] = useState<'players' | 'guilds'>('players');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | 'All'>('All');
  const [characterSort, setCharacterSort] = useState<'score' | 'level' | 'name'>('score');
  const [characterSortDir, setCharacterSortDir] = useState<SortDirection>('desc');
  const [guildSort, setGuildSort] = useState<'score' | 'members' | 'name'>('score');
  const [guildSortDir, setGuildSortDir] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const classes: Array<{ id: CharacterClass | 'All'; label: string }> = [
    { id: 'All', label: 'Todas as Classes' },
    { id: 'TransKnight', label: 'TransKnight' },
    { id: 'Foema', label: 'Foema' },
    { id: 'BeastMaster', label: 'BeastMaster' },
    { id: 'Huntress', label: 'Huntress' },
  ];

  const rankedCharacters = useMemo(() => {
    return getRankedCharacters({
      search: searchTerm,
      characterClass: selectedClass,
      sortBy: characterSort,
      sortDirection: characterSortDir,
    });
  }, [searchTerm, selectedClass, characterSort, characterSortDir]);

  const rankedGuilds = useMemo(() => {
    return getRankedGuilds({
      search: searchTerm,
      sortBy: guildSort,
      sortDirection: guildSortDir,
    });
  }, [searchTerm, guildSort, guildSortDir]);

  const paginatedCharacters = useMemo(() => {
    return paginate(rankedCharacters, currentPage, pageSize);
  }, [rankedCharacters, currentPage]);

  const paginatedGuilds = useMemo(() => {
    return paginate(rankedGuilds, currentPage, pageSize);
  }, [rankedGuilds, currentPage]);

  const handleTabChange = (newTab: 'players' | 'guilds') => {
    setTab(newTab);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleClassChange = (cls: CharacterClass | 'All') => {
    setSelectedClass(cls);
    setCurrentPage(1);
  };

  const currentResult = tab === 'players' ? paginatedCharacters : paginatedGuilds;

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9e9585] mb-8 font-medium">
        <span>Início</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
        <span className="text-[#ffd978]">Ranking de Honra</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
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

      {/* Demonstrative Alert Banner */}
      <div className="mb-8 p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
        <p>
          <strong className="text-[#ffd978]">Dados demonstrativos:</strong> Este ranking utiliza registros fictícios organizados para prototipagem de interface e testes de usabilidade. Não representa o ranking oficial de jogadores reais.
        </p>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#121620] border border-neutral-800 self-start">
          <button
            onClick={() => handleTabChange('players')}
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
            onClick={() => handleTabChange('guilds')}
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

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder={tab === 'players' ? 'Buscar personagem ou guilda...' : 'Buscar guilda...'}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#121620] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Filters & Sorting Bar */}
      {tab === 'players' && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-xl bg-[#0e121a] border border-neutral-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#8c8475] uppercase tracking-wider mr-1">
              Classe:
            </span>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => handleClassChange(cls.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedClass === cls.id
                    ? 'bg-[#c99738]/20 text-[#ffd978] border border-[#c99738]/50'
                    : 'bg-[#141822] text-[#9c9484] hover:text-[#ede3cc] border border-neutral-800'
                }`}
              >
                {cls.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] font-semibold text-[#8c8475] uppercase tracking-wider">
              Ordenar:
            </span>
            <select
              value={characterSort}
              onChange={(e) => setCharacterSort(e.target.value as 'score' | 'level' | 'name')}
              className="bg-[#141822] border border-neutral-800 text-xs text-[#ede3cc] px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#c99738]"
            >
              <option value="score">Pontuação</option>
              <option value="level">Nível</option>
              <option value="name">Nome (A-Z)</option>
            </select>
            <button
              onClick={() => setCharacterSortDir(characterSortDir === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-md bg-[#141822] border border-neutral-800 text-[#ffd978] hover:border-[#c99738] cursor-pointer"
              title={`Direção: ${characterSortDir === 'asc' ? 'Crescente' : 'Decrescente'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {tab === 'guilds' && (
        <div className="flex items-center justify-between gap-3 mb-6 p-3 rounded-xl bg-[#0e121a] border border-neutral-800/80">
          <span className="text-xs text-[#9c9484]">
            Total de guildas listadas: <strong className="text-[#ffd978]">{rankedGuilds.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#8c8475] uppercase tracking-wider">
              Ordenar:
            </span>
            <select
              value={guildSort}
              onChange={(e) => setGuildSort(e.target.value as 'score' | 'members' | 'name')}
              className="bg-[#141822] border border-neutral-800 text-xs text-[#ede3cc] px-2.5 py-1.5 rounded-md focus:outline-none focus:border-[#c99738]"
            >
              <option value="score">Pontuação de Honra</option>
              <option value="members">Número de Membros</option>
              <option value="name">Nome da Guilda</option>
            </select>
            <button
              onClick={() => setGuildSortDir(guildSortDir === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-md bg-[#141822] border border-neutral-800 text-[#ffd978] hover:border-[#c99738] cursor-pointer"
              title={`Direção: ${guildSortDir === 'asc' ? 'Crescente' : 'Decrescente'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Characters Desktop Table */}
      {tab === 'players' && (
        <div className="hidden md:block medieval-panel rounded-xl overflow-hidden border border-[#c99738]/30 mb-6 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#141924] border-b border-[#c99738]/30 text-xs font-serif font-bold text-[#ffd978] tracking-wider uppercase">
                <tr>
                  <th className="py-4 px-6 text-center w-20">Posição</th>
                  <th className="py-4 px-6">Personagem</th>
                  <th className="py-4 px-6">Classe</th>
                  <th className="py-4 px-6">Nível</th>
                  <th className="py-4 px-6">Guilda</th>
                  <th className="py-4 px-6 text-right">Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 text-xs">
                {paginatedCharacters.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#8c8475]">
                      Nenhum personagem encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedCharacters.items.map((char) => (
                    <tr key={char.id} className="hover:bg-[#1a202d]/60 transition-colors">
                      <td className="py-4 px-6 text-center font-bold">
                        {char.position === 1 && (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500 font-serif font-bold">
                            1
                          </span>
                        )}
                        {char.position === 2 && (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400 font-serif font-bold">
                            2
                          </span>
                        )}
                        {char.position === 3 && (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-800/20 text-amber-600 border border-amber-700 font-serif font-bold">
                            3
                          </span>
                        )}
                        {char.position > 3 && <span className="text-[#8c8577]">{char.position}</span>}
                      </td>
                      <td className="py-4 px-6 font-serif font-bold text-[#f5efe2]">
                        {char.name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#131722] border border-[#c99738]/30 text-[#ffd978]">
                          {char.characterClass}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[#c5bcab]">
                        {char.level}
                      </td>
                      <td className="py-4 px-6 text-[#a8a090]">
                        {char.guild || <span className="text-neutral-600 italic">Sem Guilda</span>}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-[#ffd978]">
                        {char.score.toLocaleString('pt-BR')} pts
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Characters Mobile Cards View */}
      {tab === 'players' && (
        <div className="md:hidden space-y-3 mb-6">
          {paginatedCharacters.items.length === 0 ? (
            <div className="medieval-panel p-6 rounded-xl text-center text-xs text-[#8c8475]">
              Nenhum personagem encontrado.
            </div>
          ) : (
            paginatedCharacters.items.map((char) => (
              <div
                key={char.id}
                className="medieval-panel rounded-xl p-4 border border-[#c99738]/30 flex flex-col gap-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#121620] border border-neutral-700 inline-flex items-center justify-center text-xs font-bold font-serif text-[#ffd978]">
                      #{char.position}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-[#f5efe2]">
                      {char.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#ffd978]">
                    {char.score.toLocaleString('pt-BR')} pts
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#131722] text-[#c99738] border border-[#c99738]/20">
                      {char.characterClass}
                    </span>
                    <span className="text-neutral-400">Nível {char.level}</span>
                  </div>
                  <span className="text-xs text-[#9c9484]">
                    {char.guild || 'Sem Guilda'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Guilds Desktop Table */}
      {tab === 'guilds' && (
        <div className="hidden md:block medieval-panel rounded-xl overflow-hidden border border-[#c99738]/30 mb-6 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#141924] border-b border-[#c99738]/30 text-xs font-serif font-bold text-[#ffd978] tracking-wider uppercase">
                <tr>
                  <th className="py-4 px-6 text-center w-20">Posição</th>
                  <th className="py-4 px-6">Nome da Guilda</th>
                  <th className="py-4 px-6">Membros</th>
                  <th className="py-4 px-6 text-right">Pontuação Coletiva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 text-xs">
                {paginatedGuilds.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#8c8475]">
                      Nenhuma guilda encontrada.
                    </td>
                  </tr>
                ) : (
                  paginatedGuilds.items.map((guild) => (
                    <tr key={guild.id} className="hover:bg-[#1a202d]/60 transition-colors">
                      <td className="py-4 px-6 text-center font-bold">
                        {guild.position === 1 && (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500 font-serif font-bold">
                            1
                          </span>
                        )}
                        {guild.position === 2 && (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400 font-serif font-bold">
                            2
                          </span>
                        )}
                        {guild.position === 3 && (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-800/20 text-amber-600 border border-amber-700 font-serif font-bold">
                            3
                          </span>
                        )}
                        {guild.position > 3 && <span className="text-[#8c8577]">{guild.position}</span>}
                      </td>
                      <td className="py-4 px-6 font-serif font-bold text-[#f5efe2] flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#c99738]" />
                        <span>{guild.name}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[#c5bcab]">
                        {guild.members} guerreiros
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-[#ffd978]">
                        {guild.score.toLocaleString('pt-BR')} pts
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guilds Mobile Cards View */}
      {tab === 'guilds' && (
        <div className="md:hidden space-y-3 mb-6">
          {paginatedGuilds.items.length === 0 ? (
            <div className="medieval-panel p-6 rounded-xl text-center text-xs text-[#8c8475]">
              Nenhuma guilda encontrada.
            </div>
          ) : (
            paginatedGuilds.items.map((guild) => (
              <div
                key={guild.id}
                className="medieval-panel rounded-xl p-4 border border-[#c99738]/30 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#121620] border border-neutral-700 inline-flex items-center justify-center text-xs font-bold font-serif text-[#ffd978]">
                      #{guild.position}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-[#f5efe2] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#c99738]" />
                      {guild.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#ffd978]">
                    {guild.score.toLocaleString('pt-BR')} pts
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800 text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-neutral-500" />
                    {guild.members} membros ativos
                  </span>
                  <span className="text-[11px] text-[#c99738]">Guilda Registrada</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {currentResult.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#0e121a] border border-neutral-800">
          <p className="text-xs text-[#8c8475]">
            Exibindo <strong className="text-[#ede3cc]">{currentResult.startIndex}</strong> a{' '}
            <strong className="text-[#ede3cc]">{currentResult.endIndex}</strong> de{' '}
            <strong className="text-[#ffd978]">{currentResult.totalItems}</strong> registros
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#141822] border border-neutral-800 text-[#a8a090] hover:text-[#ffd978] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: currentResult.totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 rounded-lg text-xs font-serif font-bold cursor-pointer transition-colors ${
                  currentPage === num
                    ? 'bg-[#c99738] text-black shadow-md'
                    : 'bg-[#141822] border border-neutral-800 text-[#a8a090] hover:text-[#ffd978]'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(currentResult.totalPages, p + 1))}
              disabled={currentPage === currentResult.totalPages}
              className="p-2 rounded-lg bg-[#141822] border border-neutral-800 text-[#a8a090] hover:text-[#ffd978] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
