import type {
  CharacterRecord,
  GuildRecord,
  RankedCharacter,
  RankedGuild,
  CharacterClass,
  SortDirection,
} from '../types';

export const mockCharacters: CharacterRecord[] = [
  { id: 'c1', name: 'Galahad_Artemis', characterClass: 'TransKnight', level: 400, guild: 'Valhalla', score: 28450 },
  { id: 'c2', name: 'Morgana_Arcana', characterClass: 'Foema', level: 399, guild: 'Arcana', score: 27920 },
  { id: 'c3', name: 'Fenrir_Lupus', characterClass: 'BeastMaster', level: 398, guild: 'Valhalla', score: 26800 },
  { id: 'c4', name: 'Sylvia_Wind', characterClass: 'Huntress', level: 397, guild: 'Shadows', score: 26150 },
  { id: 'c5', name: 'Arthur_Pendragon', characterClass: 'TransKnight', level: 396, guild: 'Templarios', score: 25400 },
  { id: 'c6', name: 'Selene_Moon', characterClass: 'Foema', level: 395, guild: 'Arcana', score: 24900 },
  { id: 'c7', name: 'Varg_Beast', characterClass: 'BeastMaster', level: 394, guild: 'Guardioes', score: 24200 },
  { id: 'c8', name: 'Artemis_Hunter', characterClass: 'Huntress', level: 393, guild: 'Shadows', score: 23800 },
  { id: 'c9', name: 'Lancelot_DuLac', characterClass: 'TransKnight', level: 392, guild: 'Templarios', score: 23100 },
  { id: 'c10', name: 'Ignis_Mage', characterClass: 'Foema', level: 391, guild: 'Solaris', score: 22750 },
  { id: 'c11', name: 'Thor_Storm', characterClass: 'TransKnight', level: 390, guild: 'Valhalla', score: 22100 },
  { id: 'c12', name: 'Skadi_Frost', characterClass: 'Huntress', level: 389, guild: 'Valkyries', score: 21600 },
  { id: 'c13', name: 'Krom_Ursus', characterClass: 'BeastMaster', level: 388, guild: 'Guardioes', score: 21050 },
  { id: 'c14', name: 'Merlin_Sage', characterClass: 'Foema', level: 387, guild: 'Arcana', score: 20400 },
  { id: 'c15', name: 'Freya_Gold', characterClass: 'Huntress', level: 386, guild: 'Valkyries', score: 19800 },
  { id: 'c16', name: 'Baldur_Shield', characterClass: 'TransKnight', level: 385, guild: 'Solaris', score: 19300 },
  { id: 'c17', name: 'Ursoc_Claw', characterClass: 'BeastMaster', level: 384, guild: null, score: 18750 },
  { id: 'c18', name: 'Circe_Witch', characterClass: 'Foema', level: 383, guild: 'Shadows', score: 18200 },
  { id: 'c19', name: 'Gawain_Sun', characterClass: 'TransKnight', level: 382, guild: 'Templarios', score: 17650 },
  { id: 'c20', name: 'Diana_Arrow', characterClass: 'Huntress', level: 381, guild: 'Valkyries', score: 17100 },
  { id: 'c21', name: 'Rex_Beast', characterClass: 'BeastMaster', level: 380, guild: 'Valhalla', score: 16500 },
  { id: 'c22', name: 'Astraea_Star', characterClass: 'Foema', level: 379, guild: 'Solaris', score: 15900 },
  { id: 'c23', name: 'Percival_Knight', characterClass: 'TransKnight', level: 378, guild: 'Templarios', score: 15300 },
  { id: 'c24', name: 'Kallisto_Bear', characterClass: 'BeastMaster', level: 377, guild: 'Guardioes', score: 14800 },
  { id: 'c25', name: 'Atalanta_Swift', characterClass: 'Huntress', level: 376, guild: null, score: 14200 },
];

export const mockGuilds: GuildRecord[] = [
  { id: 'g1', name: 'Valhalla', members: 48, score: 148500 },
  { id: 'g2', name: 'Arcana', members: 45, score: 139200 },
  { id: 'g3', name: 'Templarios', members: 46, score: 131800 },
  { id: 'g4', name: 'Shadows', members: 42, score: 124500 },
  { id: 'g5', name: 'Guardioes', members: 39, score: 112000 },
  { id: 'g6', name: 'Valkyries', members: 38, score: 106400 },
  { id: 'g7', name: 'Solaris', members: 35, score: 98700 },
  { id: 'g8', name: 'IronClad', members: 30, score: 85400 },
  { id: 'g9', name: 'Mythic', members: 26, score: 76200 },
  { id: 'g10', name: 'DarkLegion', members: 24, score: 68100 },
];

export interface CharacterFilterOptions {
  search?: string;
  characterClass?: CharacterClass | 'All';
  sortBy?: 'score' | 'level' | 'name';
  sortDirection?: SortDirection;
}

export function getRankedCharacters(options: CharacterFilterOptions = {}): RankedCharacter[] {
  const {
    search = '',
    characterClass = 'All',
    sortBy = 'score',
    sortDirection = 'desc',
  } = options;

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = mockCharacters.filter((char) => {
    if (characterClass !== 'All' && char.characterClass !== characterClass) {
      return false;
    }
    if (normalizedSearch) {
      const matchName = char.name.toLowerCase().includes(normalizedSearch);
      const matchGuild = char.guild ? char.guild.toLowerCase().includes(normalizedSearch) : false;
      const matchClass = char.characterClass.toLowerCase().includes(normalizedSearch);
      if (!matchName && !matchGuild && !matchClass) {
        return false;
      }
    }
    return true;
  });

  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'score') {
      comparison = b.score - a.score;
    } else if (sortBy === 'level') {
      comparison = b.level - a.level;
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    }
    return sortDirection === 'asc' ? -comparison : comparison;
  });

  return filtered.map((char, index) => ({
    ...char,
    position: index + 1,
  }));
}

export interface GuildFilterOptions {
  search?: string;
  sortBy?: 'score' | 'members' | 'name';
  sortDirection?: SortDirection;
}

export function getRankedGuilds(options: GuildFilterOptions = {}): RankedGuild[] {
  const {
    search = '',
    sortBy = 'score',
    sortDirection = 'desc',
  } = options;

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = mockGuilds.filter((g) => {
    if (!normalizedSearch) return true;
    return g.name.toLowerCase().includes(normalizedSearch);
  });

  filtered.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'score') {
      comparison = b.score - a.score;
    } else if (sortBy === 'members') {
      comparison = b.members - a.members;
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    }
    return sortDirection === 'asc' ? -comparison : comparison;
  });

  return filtered.map((g, index) => ({
    ...g,
    position: index + 1,
  }));
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, totalItems);
  const pageItems = items.slice(startIndex, endIndex);

  return {
    items: pageItems,
    totalItems,
    totalPages,
    currentPage,
    pageSize: safePageSize,
    startIndex: totalItems === 0 ? 0 : startIndex + 1,
    endIndex,
  };
}
