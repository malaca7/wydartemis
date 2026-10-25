// ---------------------------------------------------------------------------
// Navegação e avisos
// ---------------------------------------------------------------------------

export interface NavItem {
  name: string;
  href: string;
}

export interface PendingFeatureDetail {
  title: string;
  featureName: string;
  description: string;
  type?: 'download' | 'auth' | 'shop' | 'external' | 'general';
}

/** Origem de um conjunto de dados exibido na interface. */
export type DataSourceKind = 'none' | 'demo' | 'live';

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

export type CharacterClass = 'TransKnight' | 'Foema' | 'BeastMaster' | 'Huntress';

export type SortDirection = 'asc' | 'desc';

export interface CharacterRecord {
  id: string;
  name: string;
  characterClass: CharacterClass;
  level: number;
  stage?: 'Mortal' | 'Arch' | 'Celestial' | 'Sub-Celestial';
  guild: string | null;
  score: number;
}

export interface GuildRecord {
  id: string;
  name: string;
  members: number;
  score: number;
}

/** Registro com posição calculada a partir da pontuação. */
export type Ranked<T> = T & { position: number };

export type RankedCharacter = Ranked<CharacterRecord>;
export type RankedGuild = Ranked<GuildRecord>;

// ---------------------------------------------------------------------------
// Status do servidor
// ---------------------------------------------------------------------------

export type ServerState = 'unconnected' | 'unavailable' | 'maintenance' | 'offline' | 'online';

export interface ServerStatusSnapshot {
  state: ServerState;
  /** `null` quando não existe fonte confiável. */
  onlinePlayers: number | null;
  /** Data ISO 8601 da última leitura real; `null` se nunca houve leitura. */
  lastUpdated: string | null;
  message: string | null;
  source: DataSourceKind;
}

// ---------------------------------------------------------------------------
// Links externos e configuração
// ---------------------------------------------------------------------------

export interface ExternalLinkConfig {
  id: string;
  label: string;
  description: string;
  /** `null` enquanto a URL oficial não for fornecida. */
  url: string | null;
}

export interface SiteOperatorConfig {
  name: string | null;
  contactEmail: string | null;
}

export interface RequirementItem {
  label: string;
  value: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface DownloadConfig {
  /** Somente URLs HTTPS reais e autorizadas habilitam o botão de download. */
  downloadUrl: string | null;
  clientVersion: string | null;
  fileSize: string | null;
  releaseDate: string | null;
  minimumRequirements: RequirementItem[] | null;
  recommendedRequirements: RequirementItem[] | null;
  installSteps: string[] | null;
  updateNotices: string[];
  troubleshooting: FaqItem[] | null;
}

// ---------------------------------------------------------------------------
// Loja demonstrativa
// ---------------------------------------------------------------------------

export type ShopCategory = 'Pacotes' | 'Cosméticos' | 'Montarias' | 'Utilitários';

export type ShopArtKey = 'package' | 'shirt' | 'feather' | 'flask' | 'gem' | 'crown' | 'scroll' | 'shield';

export interface ShopProduct {
  id: string;
  name: string;
  category: ShopCategory;
  summary: string;
  details: string[];
  /** Valor fictício, em "créditos de exemplo" — não é preço oficial. */
  demoValue: number;
  art: ShopArtKey;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

// ---------------------------------------------------------------------------
// Área do jogador (demonstração)
// ---------------------------------------------------------------------------

export interface DemoCharacter {
  id: string;
  name: string;
  characterClass: CharacterClass;
  level: number;
  stage: string;
}

export interface GameAccount {
  id: string;
  username: string;
  password?: string;
  numericPin?: string; // Sub-senha de 6 dígitos numéricos
  status: 'active' | 'blocked' | 'suspended';
  createdAt: string;
  characters: DemoCharacter[]; // Até 4 personagens por conta de jogo no WYD
  notes?: string;
}

export interface DemoPlayerProfile {
  displayName: string;
  accountCode: string;
  characters: DemoCharacter[];
  gameAccounts?: GameAccount[];
}

// ---------------------------------------------------------------------------
// Carrossel e Banners Cinematográficos
// ---------------------------------------------------------------------------

export type SlideStatus = 'published' | 'draft' | 'inactive';
export type SlideAlignment = 'left' | 'center' | 'right';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  alignment: SlideAlignment;
  status: SlideStatus;
  order: number;
  startDate?: string | null; // ISO 8601 string or YYYY-MM-DDTHH:mm
  endDate?: string | null;   // ISO 8601 string or YYYY-MM-DDTHH:mm
  overlayIntensity?: 'none' | 'light' | 'medium' | 'dark';
  createdAt: string;
  updatedAt: string;
}

export interface SlideFilterOptions {
  status?: SlideStatus | 'all';
  search?: string;
}

export interface SlideValidationErrors {
  title?: string;
  imageUrl?: string;
  buttonUrl?: string;
  startDate?: string;
  endDate?: string;
  order?: string;
}

