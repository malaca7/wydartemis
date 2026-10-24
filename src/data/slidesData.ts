import type { BannerSlide, SlideValidationErrors } from '../types';

const BASE_URL =
  typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL
    ? (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL
    : '/';

export const presetBannerImages = [
  {
    id: 'banner-cadastro',
    label: 'Cadastre-se e Faça Parte dessa História',
    url: `${BASE_URL}assets/slides/slide-cadastro.png`,
    category: 'Oficial',
  },
  {
    id: 'banner-atualizacao',
    label: 'Servidor Atualizado — Mais Estabilidade e Desempenho',
    url: `${BASE_URL}assets/slides/slide-atualizacao.png`,
    category: 'Oficial',
  },
  {
    id: 'banner-lenda',
    label: 'A Lenda Continua — O Clássico que Você Ama',
    url: `${BASE_URL}assets/slides/slide-lenda.png`,
    category: 'Oficial',
  },
  {
    id: 'banner-pvp',
    label: 'Sistema de PvP — Teste sua Força, Mostre seu Valor',
    url: `${BASE_URL}assets/slides/slide-pvp.png`,
    category: 'Oficial',
  },
  {
    id: 'banner-comunidade',
    label: 'Somos Mais que um Servidor — Uma Comunidade e Família',
    url: `${BASE_URL}assets/slides/slide-comunidade.png`,
    category: 'Oficial',
  },
];

export const initialDefaultSlides: BannerSlide[] = [
  {
    id: 'slide-cadastre-se',
    title: 'Cadastre-se no WYD Artemis',
    subtitle: 'E Faça Parte Dessa História Épica!',
    description: 'Crie sua conta agora mesmo e garanta sua vaga na jornada sagrada de Artemis.',
    imageUrl: `${BASE_URL}assets/slides/slide-cadastro.png`,
    buttonText: 'Cadastrar Agora',
    buttonUrl: '/area-jogador',
    alignment: 'left',
    status: 'published',
    order: 1,
    startDate: null,
    endDate: null,
    overlayIntensity: 'none',
    createdAt: '2026-10-23T22:00:00.000Z',
    updatedAt: '2026-10-23T22:00:00.000Z',
  },
  {
    id: 'slide-servidor-atualizado',
    title: 'Servidor Atualizado',
    subtitle: 'Mais Estabilidade, Melhor Desempenho e Segurança',
    description: 'Otimizações contínuas de latência, anti-hack ativo e proteção integrada para todos os aventureiros.',
    imageUrl: `${BASE_URL}assets/slides/slide-atualizacao.png`,
    buttonText: 'Ver Atualizações',
    buttonUrl: '/noticias',
    alignment: 'right',
    status: 'published',
    order: 2,
    startDate: null,
    endDate: null,
    overlayIntensity: 'none',
    createdAt: '2026-10-23T22:00:00.000Z',
    updatedAt: '2026-10-23T22:00:00.000Z',
  },
  {
    id: 'slide-a-lenda-continua',
    title: 'A Lenda Continua',
    subtitle: 'O Clássico que Você Ama, Agora em um Novo Tempo',
    description: 'O verdadeiro espírito do MMORPG medieval revivido com fidelidade, honra e novas conquistas.',
    imageUrl: `${BASE_URL}assets/slides/slide-lenda.png`,
    buttonText: 'Conhecer o Jogo',
    buttonUrl: '/o-jogo',
    alignment: 'right',
    status: 'published',
    order: 3,
    startDate: null,
    endDate: null,
    overlayIntensity: 'none',
    createdAt: '2026-10-23T22:00:00.000Z',
    updatedAt: '2026-10-23T22:00:00.000Z',
  },
  {
    id: 'slide-sistema-pvp',
    title: 'Sistema de PvP & Honra',
    subtitle: 'Teste sua Força. Mostre seu Valor.',
    description: 'Batalhas de guilda, Guerras de Torres e disputas de Cidades eletrizantes em Kersef e Noatun.',
    imageUrl: `${BASE_URL}assets/slides/slide-pvp.png`,
    buttonText: 'Ver Ranking',
    buttonUrl: '/ranking',
    alignment: 'center',
    status: 'published',
    order: 4,
    startDate: null,
    endDate: null,
    overlayIntensity: 'none',
    createdAt: '2026-10-23T22:00:00.000Z',
    updatedAt: '2026-10-23T22:00:00.000Z',
  },
  {
    id: 'slide-comunidade',
    title: 'Somos Mais Que Um Servidor',
    subtitle: 'Uma Comunidade, Uma Família e Uma Grande Jornada',
    description: 'Eventos diários, equipe ativa, suporte próximo e comunidade vibrante.',
    imageUrl: `${BASE_URL}assets/slides/slide-comunidade.png`,
    buttonText: 'Entrar na Comunidade',
    buttonUrl: '/comunidade',
    alignment: 'right',
    status: 'published',
    order: 5,
    startDate: null,
    endDate: null,
    overlayIntensity: 'none',
    createdAt: '2026-10-23T22:00:00.000Z',
    updatedAt: '2026-10-23T22:00:00.000Z',
  },
];

/**
 * Verifica se um slide é ativo e elegível para exibição pública na data especificada.
 */
export function isSlideActive(slide: BannerSlide, referenceDate = new Date()): boolean {
  if (slide.status !== 'published') {
    return false;
  }

  const nowMs = referenceDate.getTime();

  if (slide.startDate) {
    const startMs = new Date(slide.startDate).getTime();
    if (!Number.isNaN(startMs) && startMs > nowMs) {
      return false; // Agendado para o futuro
    }
  }

  if (slide.endDate) {
    const endMs = new Date(slide.endDate).getTime();
    if (!Number.isNaN(endMs) && endMs < nowMs) {
      return false; // Expirado
    }
  }

  return true;
}

/**
 * Filtra e ordena os slides ativos para exibição pública.
 */
export function filterActiveSlides(slides: BannerSlide[], referenceDate = new Date()): BannerSlide[] {
  return slides
    .filter((s) => isSlideActive(s, referenceDate))
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

/**
 * Validação rigorosa dos campos de um slide.
 */
export function validateSlide(slide: Partial<BannerSlide>): SlideValidationErrors {
  const errors: SlideValidationErrors = {};

  if (!slide.title || slide.title.trim().length === 0) {
    errors.title = 'O título do slide é obrigatório.';
  } else if (slide.title.trim().length > 100) {
    errors.title = 'O título não pode exceder 100 caracteres.';
  }

  if (!slide.imageUrl || slide.imageUrl.trim().length === 0) {
    errors.imageUrl = 'A URL ou imagem do slide é obrigatória.';
  }

  if (slide.buttonText && slide.buttonText.trim().length > 0) {
    if (!slide.buttonUrl || slide.buttonUrl.trim().length === 0) {
      errors.buttonUrl = 'Informe o link ou rota de destino do botão.';
    }
  }

  if (slide.buttonUrl && slide.buttonUrl.trim().length > 0) {
    const url = slide.buttonUrl.trim();
    const isInternal = url.startsWith('/') || url.startsWith('#');
    const isExternal = url.startsWith('http://') || url.startsWith('https://');
    if (!isInternal && !isExternal) {
      errors.buttonUrl = 'O link deve ser uma rota interna (ex: /area-jogador) ou URL https://';
    }
  }

  if (slide.startDate && slide.endDate) {
    const start = new Date(slide.startDate).getTime();
    const end = new Date(slide.endDate).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
      errors.endDate = 'A data de encerramento deve ser posterior à data de início.';
    }
  }

  if (slide.order !== undefined && (typeof slide.order !== 'number' || slide.order < 1)) {
    errors.order = 'A ordem deve ser um número inteiro igual ou superior a 1.';
  }

  return errors;
}
