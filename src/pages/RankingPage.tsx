import React, { useState, useMemo, useEffect } from 'react';
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
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  mockCharacters,
  mockGuilds,
  paginate,
} from '../data/rankingData';
import {
  fetchCharactersFromFirestore,
  fetchGuildsFromFirestore,
} from '../services/firebaseService';
import type { CharacterClass, SortDirection, CharacterRecord, GuildRecord } from '../types';

export const RankingPage: React.FC = () => {
  const [tab, setTab] = useState<'players' | 'guilds'>('players');
  const [characters, setCharacters] = useState<CharacterRecord[]>(mockCharacters);
  const [guilds, setGuilds] = useState<GuildRecord[]>(mockGuilds);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Tempo Real');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass | 'All'>('All');
  const [characterSort, setCharacterSort] = useState<'score' | 'level' | 'name'>('score');
  const [characterSortDir, setCharacterSortDir] = useState<SortDirection>('desc');
  const [guildSort, setGuildSort] = useState<'score' | 'members' | 'name'>('score');
  const [guildSortDir, setGuildSortDir] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchCharactersFromFirestore(), fetchGuildsFromFirestore()])
      .then(([chars, glds]) => {
        if (isMounted) {
          if (chars.length > 0) setCharacters(chars);
          if (glds.length > 0) setGuilds(glds);
          setIsFirebaseSynced(true);
          setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
          setSyncError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSyncError('Não foi possível carregar os dados mais recentes do ranking.');
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [chars, glds] = await Promise.all([
        fetchCharactersFromFirestore(),
        fetchGuildsFromFirestore(),
      ]);
      if (chars.length > 0) setCharacters(chars);
      if (glds.length > 0) setGuilds(glds);
      setIsFirebaseSynced(true);
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
      setSyncError(null);
    } catch {
      setSyncError('Não foi possível carregar os dados mais recentes do ranking.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const classes: Array<{ id: CharacterClass | 'All'; label: string }> = [
    { id: 'All', label: 'Todas as Classes' },
    { id: 'TransKnight', label: 'TransKnight' },
    { id: 'Foema', label: 'Foema' },
    { id: 'BeastMaster', label: 'BeastMaster' },
    { id: 'Huntress', label: 'Huntress' },
  ];

  const rankedCharacters = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const filtered = characters.filter((char) => {
      if (selectedClass !== 'All' && char.characterClass !== selectedClass) return false;
      if (normalized) {
        const matchName = char.name.toLowerCase().includes(normalized);
        const matchGuild = char.guild ? char.guild.toLowerCase().includes(normalized) : false;
        const matchClass = char.characterClass.toLowerCase().includes(normalized);
        if (!matchName && !matchGuild && !matchClass) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      let comp = 0;
      if (characterSort === 'score') comp = b.score - a.score;
      else if (characterSort === 'level') comp = b.level - a.level;
      else if (characterSort === 'name') comp = a.name.localeCompare(b.name);
      return characterSortDir === 'asc' ? -comp : comp;
    });

    return filtered.map((c, i) => ({ ...c, position: i + 1 }));
  }, [characters, searchTerm, selectedClass, characterSort, characterSortDir]);

  const rankedGuilds = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const filtered = guilds.filter((g) => {
      if (!normalized) return true;
      return g.name.toLowerCase().includes(normalized);
    });

    filtered.sort((a, b) => {
      let comp = 0;
      if (guildSort === 'score') comp = b.score - a.score;
      else if (guildSort === 'members') comp = b.members - a.members;
      else if (guildSort === 'name') comp = a.name.localeCompare(b.name);
      return guildSortDir === 'asc' ? -comp : comp;
    });

    return filtered.map((g, i) => ({ ...g, position: i + 1 }));
  }, [guilds, searchTerm, guildSort, guildSortDir]);

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

      {/* Alert Banner with Firebase Status, Refresh & Timestamp */}
      <div className="mb-8 p-4 rounded-xl bg-[#0e121a] border border-[#c99738]/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#c99738]" />
          <div>
            <p className="text-[#c5bcab]">
              <strong className="text-[#ffd978]">Ranking de Honra:</strong> Registros sincronizados com o cluster Artemis via Firestore.
            </p>
            <span className="text-[11px] text-neutral-400 font-mono">
              Última atualização: {lastSyncTime}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-2 bg-[#141924] px-3 py-1.5 rounded-lg border border-neutral-800">
            <span className={`w-2 h-2 rounded-full ${isFirebaseSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-mono text-emerald-300">
              {isFirebaseSynced ? 'Firestore Conectado' : 'Conectando ao Firebase...'}
            </span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 px-3 rounded-lg bg-[#141824] hover:bg-[#1a2030] border border-[#c99738]/40 text-[#ffd978] text-xs flex items-center gap-1.5 font-serif font-bold cursor-pointer transition-all shadow disabled:opacity-50"
            title="Atualizar rankings agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>

      {syncError && (
        <div className="mb-6 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{syncError}</span>
        </div>
      )}

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#121620] border border-neutral-800 w-full sm:w-auto">
          <button
            onClick={() => handleTabChange('players')}
            className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-lg text-xs font-serif font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
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
            className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-lg text-xs font-serif font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-3 rounded-xl bg-[#0e121a] border border-neutral-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
            <span className="text-[11px] font-semibold text-[#8c8475] uppercase tracking-wider mr-1 shrink-0">
              Classe:
            </span>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => handleClassChange(cls.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedClass === cls.id
                    ? 'bg-[#c99738]/20 text-[#ffd978] border border-[#c99738]/50'
                    : 'bg-[#141822] text-[#9c9484] hover:text-[#ede3cc] border border-neutral-800'
                }`}
              >
                {cls.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto sm:ml-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/60 shrink-0">
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
                  <th className="py-4 px-6">Evolução</th>
                  <th className="py-4 px-6">Classe</th>
                  <th className="py-4 px-6">Nível</th>
                  <th className="py-4 px-6">Guilda</th>
                  <th className="py-4 px-6 text-right">Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 text-xs">
                {paginatedCharacters.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#8c8475]">
                      Nenhum personagem encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedCharacters.items.map((char) => {
                    const stage = char.stage || (char.level >= 355 ? 'Arch' : 'Mortal');
                    return (
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            stage === 'Celestial' || stage === 'Sub-Celestial'
                              ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                              : stage === 'Arch'
                              ? 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                              : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                          }`}>
                            {stage}
                          </span>
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
                    );
                  })
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
            paginatedCharacters.items.map((char) => {
              const stage = char.stage || (char.level >= 355 ? 'Arch' : 'Mortal');
              return (
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
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                        stage === 'Celestial' || stage === 'Sub-Celestial'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                          : stage === 'Arch'
                          ? 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                      }`}>
                        {stage}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#131722] text-[#c99738] border border-[#c99738]/20">
                        {char.characterClass}
                      </span>
                      <span className="text-neutral-400">Nv. {char.level}</span>
                    </div>
                    <span className="text-xs text-[#9c9484] truncate max-w-[120px] text-right">
                      {char.guild || 'Sem Guilda'}
                    </span>
                  </div>
                </div>
              );
            })
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

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#141822] border border-neutral-800 text-[#a8a090] hover:text-[#ffd978] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: currentResult.totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 rounded-lg text-xs font-serif font-bold cursor-pointer transition-colors shrink-0 ${
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
              className="p-2 rounded-lg bg-[#141822] border border-neutral-800 text-[#a8a090] hover:text-[#ffd978] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
              aria-label="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Ranking Architecture & Rules Box */}
      <div className="mt-8 p-4 rounded-xl bg-[#0b0e14] border border-[#c99738]/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-neutral-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#ffd978] shrink-0" />
          <span>
            <strong>Critérios de Pontuação:</strong> Nível, evolução de classe, histórico de PK/PvP e conquistas de guilda nos castelos de Noatun e Erion.
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#c99738] shrink-0">
          Cluster: Artemis-BR01
        </span>
      </div>
    </div>
  );
};
