import React, { useState, useMemo } from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import { useModal } from '../hooks/useModal';
import {
  ShieldAlert,
  Sparkles,
  ChevronRight,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  Package,
  Feather,
  Crown,
  Shield,
  FlaskConical,
  Gem,
  Scroll,
  Shirt,
  Search,
  CheckCircle,
} from 'lucide-react';
import { mockShopProducts, calculateCartTotal } from '../data/shopData';
import { recordShopOrder } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import type { ShopProduct, CartLine, ShopArtKey } from '../types';

export const ShopPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState<ShopProduct | null>(null);
  const [checkoutSimulated, setCheckoutSimulated] = useState(false);
  const { openPendingModal } = useModal();

  const categories = ['Todos', 'Pacotes', 'Cosméticos', 'Montarias', 'Utilitários'];

  const filteredItems = useMemo(() => {
    return mockShopProducts.filter((item) => {
      const matchCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => calculateCartTotal(cart), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const handleAddToCart = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.productId === productId) {
            const next = i.quantity + delta;
            return next > 0 ? { ...i, quantity: next } : null;
          }
          return i;
        })
        .filter((i): i is CartLine => i !== null);
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSimulateCheckout = async () => {
    setCheckoutSimulated(true);
    let orderId: string | null = null;
    try {
      orderId = await recordShopOrder(cart, cartTotal, currentUser);
    } catch (e) {
      console.warn('Erro ao registrar pedido no Firebase:', e);
    }

    openPendingModal({
      title: 'Pedido Registrado no Firebase',
      featureName: 'Checkout no Banco de Dados (Firestore)',
      description: `Pedido de ${cartTotal.toLocaleString('pt-BR')} créditos registrado com sucesso no banco de dados do Firebase Firestore${orderId ? ` (ID: ${orderId})` : ''}. Nenhum dado de cartão ou valor financeiro foi cobrado.`,
      type: 'shop',
    });
    setCart([]);
    setIsCartOpen(false);
  };

  const renderProductIcon = (art: ShopArtKey) => {
    switch (art) {
      case 'package':
        return <Package className="w-5 h-5" />;
      case 'crown':
        return <Crown className="w-5 h-5" />;
      case 'feather':
        return <Feather className="w-5 h-5" />;
      case 'shirt':
        return <Shirt className="w-5 h-5" />;
      case 'shield':
        return <Shield className="w-5 h-5" />;
      case 'flask':
        return <FlaskConical className="w-5 h-5" />;
      case 'gem':
        return <Gem className="w-5 h-5" />;
      case 'scroll':
        return <Scroll className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
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
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#c99738] mb-2 block">
          Vitrine de Apoio
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-wide mb-4">
          Loja do Reino Artemis
        </h1>
        <p className="text-[#b5ac9c] text-sm md:text-base leading-relaxed">
          Vitrine visual de cosméticos, pacotes comemorativos e itens utilitários de conveniência.
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Warning Banner: Strict Demonstrative Notice */}
      <div className="medieval-panel rounded-xl p-5 mb-8 border border-amber-500/40 bg-amber-950/20 text-amber-200/90 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <ShieldAlert className="w-8 h-8 shrink-0 text-amber-400" />
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-serif font-bold text-base text-[#ffd978]">
              Vitrine demonstrativa — pagamentos desabilitados
            </p>
            <p className="text-xs text-[#c5bcab] leading-relaxed">
              Não há transações financeiras reais nesta etapa. Todos os valores são exibidos em "Créditos Demonstrativos" para prototipagem de fluxo do usuário.
            </p>
          </div>
        </div>

        {/* Cart Trigger Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="btn-gold-primary px-4 py-2.5 rounded-lg text-xs font-serif font-bold flex items-center gap-2 shrink-0 cursor-pointer shadow-lg"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Carrinho ({cartItemCount})</span>
        </button>
      </div>

      {/* Checkout Success Feedback */}
      {checkoutSimulated && (
        <div className="mb-8 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Simulação de pedido concluída com sucesso! Nenhum pagamento foi cobrado.</span>
          </div>
          <button
            onClick={() => setCheckoutSimulated(false)}
            className="text-emerald-400 hover:text-emerald-200 text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar item na loja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#121620] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="medieval-panel-interactive rounded-xl p-6 flex flex-col justify-between group cursor-pointer relative"
            onClick={() => setActiveProductModal(item)}
          >
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978]/30 to-transparent group-hover:via-[#ffd978]/70 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#141923] border border-[#c99738]/30 text-[#ffd978] group-hover:scale-105 transition-transform">
                  {renderProductIcon(item.art)}
                </div>
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/40">
                  {item.category}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-[#f5efe2] group-hover:text-[#ffd978] transition-colors mb-2">
                {item.name}
              </h3>

              <p className="text-xs text-[#9e9585] leading-relaxed mb-6 line-clamp-2">
                {item.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">Preço Demo</span>
                <span className="text-xs font-mono font-bold text-[#ffd978]">
                  {item.demoValue.toLocaleString('pt-BR')} créditos
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => handleAddToCart(item.id, e)}
                className="btn-gold-primary px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer shadow"
                title="Adicionar ao Carrinho Demonstrativo"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {activeProductModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveProductModal(null)}
        >
          <div
            className="medieval-panel max-w-lg w-full rounded-2xl p-6 sm:p-8 border border-[#c99738]/50 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveProductModal(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-[#141923] border border-[#c99738]/40 text-[#ffd978]">
                {renderProductIcon(activeProductModal.art)}
              </div>
              <div>
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  {activeProductModal.category}
                </span>
                <h3 className="font-serif font-bold text-xl text-[#f5efe2] mt-1">
                  {activeProductModal.name}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#b5ac9c] leading-relaxed mb-5">
              {activeProductModal.summary}
            </p>

            <div className="space-y-2 mb-6">
              <span className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider block">
                Conteúdo & Características:
              </span>
              <ul className="space-y-1.5 text-xs text-[#a8a090]">
                {activeProductModal.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#c99738] mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-200/90 text-xs mb-6">
              Demonstração: Nenhum valor real é cobrado. A compra é um fluxo de teste de usabilidade.
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">Valor Fictício</span>
                <span className="text-base font-mono font-bold text-[#ffd978]">
                  {activeProductModal.demoValue.toLocaleString('pt-BR')} créditos
                </span>
              </div>

              <button
                onClick={() => {
                  handleAddToCart(activeProductModal.id);
                  setActiveProductModal(null);
                  setIsCartOpen(true);
                }}
                className="btn-gold-primary px-5 py-2.5 rounded-lg text-xs font-serif font-bold flex items-center gap-2 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar ao Carrinho</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#0c0f16] border-l border-[#c99738]/40 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#ffd978]" />
                  <h3 className="font-serif font-bold text-lg text-[#f5efe2]">
                    Carrinho Demonstrativo
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs">
                Aviso: Este carrinho é estritamente simulado. Pagamentos estão desabilitados.
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8c8475] space-y-2">
                  <ShoppingCart className="w-10 h-10 mx-auto text-neutral-700" />
                  <p>Seu carrinho demonstrativo está vazio.</p>
                  <p className="text-[11px] text-neutral-500">
                    Adicione itens cosméticos ou pacotes da vitrine acima.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 my-4">
                  {cart.map((line) => {
                    const product = mockShopProducts.find((p) => p.id === line.productId);
                    if (!product) return null;
                    return (
                      <div
                        key={line.productId}
                        className="p-3 rounded-xl bg-[#131722] border border-neutral-800 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <h4 className="text-xs font-serif font-bold text-[#f5efe2] truncate">
                            {product.name}
                          </h4>
                          <span className="text-[11px] font-mono text-[#ffd978]">
                            {(product.demoValue * line.quantity).toLocaleString('pt-BR')} créditos
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateQuantity(line.productId, -1)}
                            className="p-1 rounded bg-[#1c2230] hover:bg-[#252e42] text-neutral-300 cursor-pointer"
                            title="Diminuir quantidade"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono w-5 text-center text-[#f5efe2]">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(line.productId, 1)}
                            className="p-1 rounded bg-[#1c2230] hover:bg-[#252e42] text-neutral-300 cursor-pointer"
                            title="Aumentar quantidade"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(line.productId)}
                            className="p-1 rounded text-red-400 hover:text-red-300 ml-1 cursor-pointer"
                            title="Remover item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#9c9484]">Subtotal Simulado:</span>
                  <span className="font-mono font-bold text-lg text-[#ffd978]">
                    {cartTotal.toLocaleString('pt-BR')} créditos
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleSimulateCheckout}
                    className="w-full btn-gold-primary py-3 rounded-lg text-xs font-serif font-bold tracking-wider cursor-pointer shadow-lg"
                  >
                    Finalizar Demonstração (Sem Cobrança)
                  </button>

                  <button
                    onClick={handleClearCart}
                    className="w-full text-xs text-neutral-400 hover:text-neutral-200 py-1.5 cursor-pointer"
                  >
                    Esvaziar Carrinho
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
