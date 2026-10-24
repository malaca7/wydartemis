import type { ServerStatusSnapshot, ServerState } from '../types';

export const initialServerStatus: ServerStatusSnapshot = {
  state: 'unconnected',
  onlinePlayers: null,
  lastUpdated: null,
  message: 'O canal de telemetria em tempo real ainda não foi integrado à infraestrutura do servidor de jogos. Os dados serão transmitidos diretamente do cluster na abertura oficial.',
  source: 'none',
};

export interface ServerStateMeta {
  state: ServerState;
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
}

export const serverStateMetas: Record<ServerState, ServerStateMeta> = {
  unconnected: {
    state: 'unconnected',
    label: 'Status Não Conectado',
    badgeClass: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    dotClass: 'bg-zinc-500',
    description: 'Nenhum socket de telemetria ou API externa está vinculado ao portal nesta fase.',
  },
  unavailable: {
    state: 'unavailable',
    label: 'Serviço Indisponível',
    badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    dotClass: 'bg-amber-500',
    description: 'Os nós de conexão do cluster não puderam ser contatados temporariamente.',
  },
  maintenance: {
    state: 'maintenance',
    label: 'Em Manutenção',
    badgeClass: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/60',
    dotClass: 'bg-yellow-500 animate-pulse',
    description: 'Janela de manutenção programada para atualização de arquivos e balanceamento.',
  },
  offline: {
    state: 'offline',
    label: 'Reino Offline',
    badgeClass: 'bg-red-950/60 text-red-300 border-red-800/60',
    dotClass: 'bg-red-500',
    description: 'Os servidores de login e de mapas estão desativados.',
  },
  online: {
    state: 'online',
    label: 'Reino Operacional',
    badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    dotClass: 'bg-emerald-400 animate-ping',
    description: 'Todos os canais de batalha e mundos estão ativos.',
  },
};

export interface ServerSpecItem {
  label: string;
  value: string;
  detail: string;
}

export const serverSpecifications: ServerSpecItem[] = [
  { label: 'Versão Base', value: '7.54 Modificada', detail: 'Compatibilidade com engine clássica e melhorias de segurança' },
  { label: 'Taxa de Experiência', value: 'Média / Moderada (Demo)', detail: 'Progressão com valorização de cada etapa de evolução' },
  { label: 'Drop de Itens', value: 'Dinâmico & Equilibrado', detail: 'Economia sustentável focada no artesanato e refino' },
  { label: 'Capacidade Prevista', value: '1.500 Guerreiros Simultâneos', detail: 'Cluster distribuído de baixa latência em SP / Brasil' },
  { label: 'Sistemas Ativos', value: 'Guerra de Cidades, Noatun, Torre', detail: 'Combates PvP programados aos finais de semana' },
];
