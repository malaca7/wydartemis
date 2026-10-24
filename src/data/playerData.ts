import type { DemoPlayerProfile } from '../types';

export const initialDemoProfile: DemoPlayerProfile = {
  displayName: 'Guerreiro_Artemis',
  accountCode: 'ART-2026-9481',
  characters: [
    {
      id: 'dc-1',
      name: 'Sir_Galahad',
      characterClass: 'TransKnight',
      level: 400,
      stage: 'Sub-Celestial',
    },
    {
      id: 'dc-2',
      name: 'Morgana_Moon',
      characterClass: 'Foema',
      level: 395,
      stage: 'Celestial',
    },
    {
      id: 'dc-3',
      name: 'Sylvia_Shadow',
      characterClass: 'Huntress',
      level: 355,
      stage: 'Arch',
    },
  ],
};

export interface AccountActivity {
  id: string;
  date: string;
  event: string;
  ipMasked: string;
  status: 'Sucesso' | 'Alerta';
}

export const mockAccountActivities: AccountActivity[] = [
  { id: 'act-1', date: '23/10/2026 21:15', event: 'Acesso ao Painel do Jogador (Simulado)', ipMasked: '189.40.***.***', status: 'Sucesso' },
  { id: 'act-2', date: '20/10/2026 19:42', event: 'Criação da Conta Demonstrativa', ipMasked: '189.40.***.***', status: 'Sucesso' },
  { id: 'act-3', date: '18/10/2026 14:05', event: 'Tentativa de Login (Demonstração)', ipMasked: '177.18.***.***', status: 'Sucesso' },
];
