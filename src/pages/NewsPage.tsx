import React, { useState } from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import { useModal } from '../hooks/useModal';
import { Calendar, ChevronRight, ArrowRight, AlertCircle } from 'lucide-react';

interface NewsItem {
  id: string;
  category: 'Atualização' | 'Evento' | 'Aviso' | 'Manutenção';
  title: string;
  summary: string;
  date: string;
  isDemonstrative: boolean;
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    category: 'Atualização',
    title: 'Ajustes no Motor de Combate e Balanceamento de Habilidades',
    summary: 'A equipe técnica concluiu a primeira rodada de testes de colisão e tempos de conjuração das disciplinas sagradas das quatro classes.',
    date: '20/10/2026',
    isDemonstrative: true,
  },
  {
    id: '2',
    category: 'Aviso',
    title: 'Abertura do Pré-Cadastro do Servidor WYD Artemis',
    summary: 'O portal visual foi liberado para demonstração da comunidade. Participe das discussões e acompanhe a evolução do projeto.',
    date: '18/10/2026',
    isDemonstrative: true,
  },
  {
    id: '3',
    category: 'Evento',
    title: 'Planejamento das Guerras Semanais de Castelo e Cidades',
    summary: 'Conheça o formato proposto para as batalhas de Noatun, Erion e Azran com cronograma favorável aos clãs brasileiros.',
    date: '15/10/2026',
    isDemonstrative: true,
  },
  {
    id: '4',
    category: 'Manutenção',
    title: 'Testes de Estresse na Infraestrutura de Baixa Latência',
    summary: 'Simulações de carga de conexões simultâneas para garantir estabilidade máxima no lançamento da versão de testes.',
    date: '12/10/2026',
    isDemonstrative: true,
  },
];

export const NewsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const { openPendingModal } = useModal();

  const categories = ['Todos', 'Atualização', 'Evento', 'Aviso', 'Manutenção'];

  const filteredNews =
    activeCategory === 'Todos'
      ? mockNews
      : mockNews.filter((n) => n.category === activeCategory);

  const handleReadNews = (item: NewsItem) => {
    openPendingModal({
      title: item.title,
      featureName: `Artigo Completo: ${item.category}`,
      description: `Esta publicação é um conteúdo demonstrativo para estruturação do portal de notícias. O anúncio oficial será divulgado com os detalhes finais.`,
      type: 'general',
    });
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9e9585] mb-8 font-medium">
        <span>Início</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
        <span className="text-[#ffd978]">Notícias & Atualizações</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#c99738] mb-2 block">
          Boletim do Reino
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-wide mb-4">
          Notícias & Atualizações
        </h1>
        <p className="text-[#b5ac9c] text-sm md:text-base leading-relaxed">
          Acompanhe todos os comunicados técnicos, notas de atualização, cronogramas de manutenção e eventos do WYD Artemis.
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-serif font-bold tracking-wider uppercase transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#c99738] text-black shadow-[0_0_15px_rgba(201,151,56,0.4)]'
                  : 'bg-[#121620] text-[#a8a090] border border-neutral-800 hover:border-[#c99738]/50 hover:text-[#ffd978]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {filteredNews.map((news) => (
          <article
            key={news.id}
            className="medieval-panel-interactive rounded-xl p-6 flex flex-col justify-between group cursor-pointer"
            onClick={() => handleReadNews(news)}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold text-[#ffd978] bg-[#1d2332] border border-[#c99738]/30 px-2.5 py-0.5 rounded">
                  {news.category}
                </span>

                <div className="flex items-center gap-2 text-xs text-[#8c8577]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{news.date}</span>
                  <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-[10px] text-neutral-400">
                    Demonstrativo
                  </span>
                </div>
              </div>

              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#f5efe2] group-hover:text-[#ffd978] transition-colors mb-3 leading-snug">
                {news.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#a8a090] leading-relaxed mb-6">
                {news.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80">
              <span className="text-xs font-serif font-bold text-[#ffd978] group-hover:text-[#fff0ba] flex items-center gap-1.5">
                <span>Ler comunicado</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
              <span className="text-[11px] text-[#6b6559]">WYD Artemis Staff</span>
            </div>
          </article>
        ))}
      </div>

      {/* Demonstrative Alert */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-xs flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
        <p>
          Aviso: Os comunicados acima são dados demonstrativos para simulação de layout de portal. Não representam datas oficiais ou alterações ativas de servidores.
        </p>
      </div>
    </div>
  );
};
