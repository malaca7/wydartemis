import type { ShopProduct, CartLine } from '../types';

export const mockShopProducts: ShopProduct[] = [
  {
    id: 'pkg-01',
    name: 'Pacote Pioneiro de Artemis',
    category: 'Pacotes',
    summary: 'Conjunto comemorativo de pré-lançamento com título exclusivo e itens visuais.',
    details: [
      'Título visual no jogo: "Pioneiro de Artemis"',
      'Manto Celestial com brasão gravado em fios dourados',
      '30 dias de Passe de Conveniência (Baú Remoto e Selo do Guardião)',
      '1x Caixa de Fogos de Artifício do Reino',
    ],
    demoValue: 2500,
    art: 'package',
  },
  {
    id: 'pkg-02',
    name: 'Pacote da Guilda Real',
    category: 'Pacotes',
    summary: 'Kit coletivo para líderes que planejam estabelecer domínio territorial.',
    details: [
      'Emblema de Guilda personalizado em alta definição',
      'Bandeira cerimonial para a sede da guilda em Erion ou Noatun',
      '50x Pergaminhos de Teleporte para o Salão do Clã',
      '5x Poções de Bônus de Experiência em Grupo (2h)',
    ],
    demoValue: 4200,
    art: 'crown',
  },
  {
    id: 'cosm-01',
    name: 'Traje de Cavaleiro Sagrado',
    category: 'Cosméticos',
    summary: 'Armadura cerimonial polida inspirada na guarda de elite do templo solar.',
    details: [
      'Compatível com TransKnight e BeastMaster',
      'Efeito de partículas luminosas ao caminhar',
      'Não altera os atributos de combate (puramente visual)',
      'Permanente na conta demonstrativa',
    ],
    demoValue: 1800,
    art: 'shirt',
  },
  {
    id: 'cosm-02',
    name: 'Vestes da Feiticeira Lunar',
    category: 'Cosméticos',
    summary: 'Túnica de seda translúcida com véu de ametista e ornamentos de safira.',
    details: [
      'Compatível com Foema e Huntress',
      'Efeito de névoa mágica ao conjurar habilidades',
      'Visual exclusivo de prévia técnica',
      'Visual cosmético sem alteração de status',
    ],
    demoValue: 1800,
    art: 'feather',
  },
  {
    id: 'cosm-03',
    name: 'Capa da Sombra Tempestuosa',
    category: 'Cosméticos',
    summary: 'Manto etéreo que se agita com eletricidade estática sutil ao movimento.',
    details: [
      'Compatível com todas as classes',
      'Brilho azul arcano customizado nas bordas',
      'Cosmético de costas permanente',
    ],
    demoValue: 1200,
    art: 'shield',
  },
  {
    id: 'mount-01',
    name: 'Montaria Grifo Místico',
    category: 'Montarias',
    summary: 'Nobre criatura alada das montanhas de Artemis com asas de plumagem dourada.',
    details: [
      'Velocidade base de montaria: 100% (padrão do jogo)',
      'Animação única de pouso e descanso',
      'Aura com penas luminescentes cadentes',
      'Requer nível 100+ para utilização',
    ],
    demoValue: 3000,
    art: 'feather',
  },
  {
    id: 'mount-02',
    name: 'Lobo Fantasma de Niflheim',
    category: 'Montarias',
    summary: 'Predador lendário das tundras gélidas envolvido por névoa de geada.',
    details: [
      'Passos que deixam marcas temporárias de gelo no solo',
      'Uivo sonoro especial ao pressionar a tecla de animação',
      'Totalmente estético — mesmo desempenho das montarias normais',
    ],
    demoValue: 2800,
    art: 'shield',
  },
  {
    id: 'mount-03',
    name: 'Cavalo de Batalha Pesado',
    category: 'Montarias',
    summary: 'Corcel blindado em placas de aço negro forjado nos calabouços de Kefra.',
    details: [
      'Barda de ferro escovado com crina reforçada',
      'Aparência imponente para líderes de incursão e tanques',
      'Compatível com sela de transporte',
    ],
    demoValue: 2200,
    art: 'shield',
  },
  {
    id: 'util-01',
    name: 'Selo do Alquimista Supremo',
    category: 'Utilitários',
    summary: 'Item de conveniência que permite abrir a janela de composição em qualquer local.',
    details: [
      'Duração de 30 dias',
      'Economiza tempo de viagem até o NPC Alquimista de Azran',
      'Não altera as taxas matemáticas de sucesso das refinações',
    ],
    demoValue: 950,
    art: 'flask',
  },
  {
    id: 'util-02',
    name: 'Baú de Expansão de Inventário',
    category: 'Utilitários',
    summary: 'Aumenta permanentemente 2 abas extras de armazenamento no banco de Azran.',
    details: [
      'Expansão de 60 slots adicionais no Baú Comum',
      'Válido para todos os personagens da conta',
      'Limite de até 2 compras por conta',
    ],
    demoValue: 1400,
    art: 'package',
  },
  {
    id: 'util-03',
    name: 'Pedra de Redefinição de Atributos',
    category: 'Utilitários',
    summary: 'Permite redistribuir pontos de Força, Inteligência, Destreza e Constituição.',
    details: [
      'Consumível de uso único',
      'Retorna todos os pontos de atributos para redistribuição manual',
      'Não afeta o nível ou habilidades da classe',
    ],
    demoValue: 750,
    art: 'gem',
  },
  {
    id: 'util-04',
    name: 'Pergaminho de Teleporte Mundial',
    category: 'Utilitários',
    summary: 'Pacote com 50 pergaminhos de deslocamento imediato para cidades seguras.',
    details: [
      'Destinos: Armia, Azran, Erion e Gelo',
      'Tempo de recarga de 30 segundos entre usos',
      'Uso bloqueado durante estados de combate PvP ativo',
    ],
    demoValue: 500,
    art: 'scroll',
  },
];

export function calculateCartTotal(cart: CartLine[], products: ShopProduct[] = mockShopProducts): number {
  return cart.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return total;
    return total + product.demoValue * item.quantity;
  }, 0);
}
