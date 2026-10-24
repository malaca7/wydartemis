import React, { useState } from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import { useModal } from '../context/ModalContext';
import { ShieldAlert, Sparkles, ChevronRight, Lock } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  category: 'Pacotes' | 'Cosméticos' | 'Consumíveis' | 'Montarias';
  desc: string;
  demoPrice: string;
}

const mockShopItems: ShopItem[] = [
  {
    id: '1',
    name: 'Pacote Pioneiro de Artemis',
    category: 'Pacotes',
    desc: 'Título visual exclusivo "Pioneiro", capa ornamental com brasão e consumíveis de conveniência.',
    demoPrice: 'Demonstrativo',
  },
  {
    id: '2',
    name: 'Traje de Cavaleiro Sagrado',
    category: 'Cosméticos',
    desc: 'Aparência cosmética visual com temática da guarda de honra do castelo de Noatun.',
    demoPrice: 'Demonstrativo',
  },
  {
    id: '3',
    name: 'Montaria Grifo Místico',
    category: 'Montarias',
    desc: 'Montaria alada cosmética com animação customizada de corrida e descanso.',
    demoPrice: 'Demonstrativo',
  },
  {
    id: '4',
    name: 'Bolsa de Pedras da Forja',
    category: 'Consumíveis',
    desc: 'Pacote utilitário de pedras de refino e poções de velocidade de movimento.',
    demoPrice: 'Demonstrativo',
  },
];

export const ShopPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const { openPendingModal } = useModal();

  const categories = ['Todos', 'Pacotes', 'Cosméticos', 'Montarias', 'Consumíveis'];

  const filteredItems =
    selectedCategory === 'Todos'
      ? mockShopItems
      : mockShopItems.filter((i) => i.category === selectedCategory);

  const handleItemClick = (item: ShopItem) => {
    openPendingModal({
      title: 'Loja Demonstrativa',
      featureName: item.name,
      description: `Esta é uma vitrine de demonstração visual. O sistema de doações e aquisição de itens cosméticos está desabilitado nesta versão, sem pagamentos ou movimentação financeira.`,
      type: 'shop',
    });
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9e9585] mb-8 font-medium">
        <span>Início</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
        <span className="text-[#ffd978]">Loja Demonstrativa</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#c99738] mb-2 block">
          Vitrine de Apoio
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-wide mb-4">
          Loja do Reino
        </h1>
        <p className="text-[#b5ac9c] text-sm md:text-base leading-relaxed">
          Vitrine visual de itens de apoio cosméticos e pacotes de conveniência.
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Big Warning Banner: Payments disabled */}
      <div className="medieval-panel rounded-xl p-5 mb-10 border border-amber-500/40 bg-amber-950/20 text-amber-200/90 text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-4">
        <ShieldAlert className="w-8 h-8 shrink-0 text-amber-400" />
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-serif font-bold text-base text-[#ffd978]">
            Aviso Importante: Pagamentos e Checkout Desabilitados
          </p>
          <p className="text-xs text-[#c5bcab] leading-relaxed">
            Esta vitrine é estritamente demonstrativa. Não há integração com gateways de pagamento, checkout real ou transações monetárias autorizadas nesta etapa.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-serif font-bold tracking-wider uppercase transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#c99738] text-black shadow-md'
                : 'bg-[#121620] text-[#a8a090] border border-neutral-800 hover:border-[#c99738]/50 hover:text-[#ffd978]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="medieval-panel-interactive rounded-xl p-6 flex flex-col justify-between group cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-[#141923] border border-[#c99738]/30 text-[#ffd978]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  {item.category}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-[#f5efe2] group-hover:text-[#ffd978] transition-colors mb-2">
                {item.name}
              </h3>

              <p className="text-xs text-[#9e9585] leading-relaxed mb-6">
                {item.desc}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">Valor</span>
                <span className="text-xs font-mono font-bold text-[#ffd978]">
                  {item.demoPrice}
                </span>
              </div>

              <button
                type="button"
                className="btn-medieval-secondary px-3 py-1.5 rounded text-xs flex items-center gap-1.5"
              >
                <Lock className="w-3 h-3 text-neutral-400" />
                <span>Ver Detalhes</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
