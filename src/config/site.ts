import type {
  DownloadConfig,
  ExternalLinkConfig,
  SiteOperatorConfig,
} from '../types';

/**
 * Configuração central de canais, integrações e informações oficiais.
 *
 * IMPORTANTE: preencha os campos somente com dados oficiais e autorizados pela
 * administração do WYD Artemis. Enquanto um valor for `null`, a interface exibe
 * o estado "Link ainda não configurado" / "Aguardando configuração oficial" e
 * nenhum link ou ação real é renderizado.
 */

export type CommunityLinkKey = 'discord' | 'community' | 'announcements' | 'support';

export const communityLinks: Record<CommunityLinkKey, ExternalLinkConfig> = {
  discord: {
    id: 'discord',
    label: 'Discord',
    description: 'Espaço previsto para conversas da comunidade, organização de guildas e avisos rápidos.',
    url: null,
  },
  community: {
    id: 'community',
    label: 'Fórum da comunidade',
    description: 'Espaço previsto para guias, discussões sobre classes e sugestões dos jogadores.',
    url: null,
  },
  announcements: {
    id: 'announcements',
    label: 'Canal de anúncios',
    description: 'Canal previsto para comunicados oficiais da administração.',
    url: null,
  },
  support: {
    id: 'support',
    label: 'Central de suporte',
    description: 'Canal previsto para abertura de chamados e atendimento aos jogadores.',
    url: null,
  },
};

export type LegalLinkKey = 'terms' | 'privacy' | 'rules';

export const legalLinks: Record<LegalLinkKey, ExternalLinkConfig> = {
  terms: {
    id: 'terms',
    label: 'Termos de Serviço',
    description: 'Documento ainda não publicado pela administração.',
    url: null,
  },
  privacy: {
    id: 'privacy',
    label: 'Política de Privacidade',
    description: 'Documento ainda não publicado pela administração.',
    url: null,
  },
  rules: {
    id: 'rules',
    label: 'Regras de Conduta',
    description: 'Documento ainda não publicado pela administração.',
    url: null,
  },
};

/** Redes sociais oficiais. Lista vazia = nenhuma rede informada. */
export const socialLinks: ExternalLinkConfig[] = [];

/** Identificação do responsável pelo servidor (não preencher sem confirmação). */
export const siteOperator: SiteOperatorConfig = {
  name: null,
  contactEmail: null,
};

/** Fonte de dados do status do servidor. `null` = não conectado. */
export const statusSource: { endpoint: string | null } = {
  endpoint: null,
};

/** Informações do cliente de jogo. Nada é exibido como fato até ser preenchido. */
export const downloadConfig: DownloadConfig = {
  downloadUrl: null,
  clientVersion: null,
  fileSize: null,
  releaseDate: null,
  minimumRequirements: null,
  recommendedRequirements: null,
  installSteps: null,
  updateNotices: [],
  troubleshooting: null,
};
