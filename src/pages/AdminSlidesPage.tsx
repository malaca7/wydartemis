import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  KeyRound,
  RefreshCw,
  Search,
  Filter,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { BannerSlide, SlideStatus } from '../types';
import {
  fetchSlides,
  saveSlide,
  deleteSlide,
  reorderSlides,
  isUserAdmin,
  setAdminPasskey,
  clearAdminPasskey,
} from '../services/slidesService';
import { initialDefaultSlides } from '../data/slidesData';
import { SlideEditModal } from '../components/admin/SlideEditModal';
import { SlidePreviewModal } from '../components/admin/SlidePreviewModal';

export const AdminSlidesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Authentication & Passkey State
  const [isLocalAdminUnlocked, setIsLocalAdminUnlocked] = useState(false);
  const isAdminAuthorized = isUserAdmin(currentUser) || isLocalAdminUnlocked;

  const [inputPasskey, setInputPasskey] = useState('');
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SlideStatus>('all');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<BannerSlide | null>(null);
  const [previewSlide, setPreviewSlide] = useState<BannerSlide | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<BannerSlide | null>(null);

  // Load slides on mount
  useEffect(() => {
    let active = true;
    fetchSlides()
      .then((data) => {
        if (active) {
          setSlides(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar slides:', err);
        if (active) {
          setIsLoading(false);
          setFeedback({ message: 'Falha ao sincronizar com o banco de dados.', type: 'error' });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAdminPasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError(null);
    if (setAdminPasskey(inputPasskey.trim())) {
      setIsLocalAdminUnlocked(true);
      setInputPasskey('');
      setFeedback({ message: 'Acesso administrativo autorizado com sucesso!', type: 'success' });
    } else {
      setPasskeyError('Chave administrativa inválida. Utilize a chave oficial do servidor.');
    }
  };

  const handleLogoutAdmin = () => {
    clearAdminPasskey();
    setIsLocalAdminUnlocked(false);
    setFeedback({ message: 'Sessão administrativa encerrada.', type: 'success' });
  };

  // Filtered Slides
  const filteredSlides = useMemo(() => {
    return slides
      .filter((s) => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            s.title.toLowerCase().includes(q) ||
            (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
            (s.buttonText && s.buttonText.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [slides, statusFilter, searchQuery]);

  // Quick Stats
  const stats = useMemo(() => {
    const published = slides.filter((s) => s.status === 'published').length;
    const drafts = slides.filter((s) => s.status === 'draft').length;
    const inactive = slides.filter((s) => s.status === 'inactive').length;
    return { total: slides.length, published, drafts, inactive };
  }, [slides]);

  // CRUD Actions
  const handleCreateNew = () => {
    setEditingSlide(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (slide: BannerSlide) => {
    setEditingSlide(slide);
    setIsEditModalOpen(true);
  };

  const handleDuplicate = useCallback(async (slide: BannerSlide) => {
    const nowIso = new Date().toISOString();
    const duplicated: BannerSlide = {
      ...slide,
      id: `slide-${Date.now()}`,
      title: `${slide.title} (Cópia)`,
      status: 'draft',
      order: slides.length + 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await saveSlide(duplicated);
      setSlides((prev) => [...prev, duplicated]);
      setFeedback({ message: `Slide duplicado com sucesso como rascunho: "${duplicated.title}"`, type: 'success' });
    } catch {
      setFeedback({ message: 'Erro ao duplicar slide.', type: 'error' });
    }
  }, [slides.length]);

  const handleToggleStatus = useCallback(async (slide: BannerSlide) => {
    const newStatus: SlideStatus = slide.status === 'published' ? 'inactive' : 'published';
    const nowIso = new Date().toISOString();
    const updated: BannerSlide = {
      ...slide,
      status: newStatus,
      updatedAt: nowIso,
    };

    try {
      await saveSlide(updated);
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
      setFeedback({
        message: `Status do slide "${slide.title}" alterado para ${newStatus === 'published' ? 'Publicado' : 'Inativo'}.`,
        type: 'success',
      });
    } catch {
      setFeedback({ message: 'Erro ao atualizar status do slide.', type: 'error' });
    }
  }, []);

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredSlides.length) return;

    const copy = [...slides];
    const itemA = filteredSlides[index];
    const itemB = filteredSlides[targetIndex];

    const idxA = copy.findIndex((s) => s.id === itemA.id);
    const idxB = copy.findIndex((s) => s.id === itemB.id);

    const tempOrder = copy[idxA].order;
    copy[idxA].order = copy[idxB].order;
    copy[idxB].order = tempOrder;

    copy.sort((a, b) => a.order - b.order);
    setSlides(copy);

    try {
      await reorderSlides(copy);
      setFeedback({ message: 'Ordem dos slides atualizada no servidor.', type: 'success' });
    } catch {
      setFeedback({ message: 'Falha ao reordenar slides.', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!slideToDelete) return;
    try {
      await deleteSlide(slideToDelete.id);
      setSlides((prev) => prev.filter((s) => s.id !== slideToDelete.id));
      setFeedback({ message: `Slide "${slideToDelete.title}" excluído com sucesso.`, type: 'success' });
    } catch {
      setFeedback({ message: 'Falha ao excluir slide.', type: 'error' });
    } finally {
      setSlideToDelete(null);
    }
  };

  const handleSaveSlide = async (saved: BannerSlide) => {
    await saveSlide(saved);
    setSlides((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      if (exists) {
        return prev.map((s) => (s.id === saved.id ? saved : s));
      }
      return [...prev, saved];
    });
    setFeedback({ message: `Slide "${saved.title}" salvo com sucesso!`, type: 'success' });
  };

  const handleResetToOfficialPresets = async () => {
    if (!window.confirm('Deseja restaurar os 5 banners oficiais iniciais do WYD Artemis?')) return;
    try {
      await reorderSlides(initialDefaultSlides);
      setSlides(initialDefaultSlides);
      setFeedback({ message: 'Os 5 banners oficiais do WYD Artemis foram restaurados.', type: 'success' });
    } catch {
      setFeedback({ message: 'Erro ao restaurar presets.', type: 'error' });
    }
  };

  // Se não estiver autorizado como admin, exibe formulário de acesso
  if (!isAdminAuthorized) {
    return (
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
        <div className="medieval-panel rounded-2xl p-8 border border-[#c99738]/50 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#141924] border border-[#c99738]/50 flex items-center justify-center text-[#ffd978] mx-auto mb-4 shadow-lg">
            <Shield className="w-8 h-8" />
          </div>

          <h1 className="font-serif font-bold text-2xl text-[#f5ebd6] mb-1">
            Painel Administrativo
          </h1>
          <p className="text-xs text-[#9d9484] mb-6">
            Acesso restrito para mestres e administradores do WYD Artemis
          </p>

          {passkeyError && (
            <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800/60 text-xs text-red-300">
              {passkeyError}
            </div>
          )}

          <form onSubmit={handleAdminPasskeySubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs text-[#b8b09f] block mb-1">
                Chave de Segurança Administrativa (PIN / Passkey):
              </label>
              <input
                type="password"
                value={inputPasskey}
                onChange={(e) => setInputPasskey(e.target.value)}
                placeholder="Informe a chave administrativa..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#121622] border border-neutral-700 text-sm text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 block mt-1">
                Dica de auditoria: chave de teste autorizada: <code className="text-[#ffd978]">artemis_admin_2026</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full btn-gold-primary py-3 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Autenticar Acesso Administrativo</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-800 text-xs text-[#8c8475]">
            <Link to="/" className="text-[#ffd978] hover:underline">
              ← Retornar à Página Inicial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Breadcrumb & Admin Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs text-[#9e9585]">
          <Link to="/" className="hover:text-[#ffd978]">Início</Link>
          <span>/</span>
          <Link to="/area-jogador" className="hover:text-[#ffd978]">Área do Jogador</Link>
          <span>/</span>
          <span className="text-[#ffd978] font-semibold">Painel Administrativo</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-semibold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin Conectado: {currentUser?.email || 'Mestre da Torre'}</span>
          </span>

          <button
            onClick={handleLogoutAdmin}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 transition-colors cursor-pointer"
          >
            Sair do Admin
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b2232] border border-[#c99738]/40 text-xs text-[#ffd978] mb-2">
            <Layers className="w-3.5 h-3.5 text-[#ffd978]" />
            <span>Controle de Banners & Exibição</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold gold-gradient-text tracking-wide">
            Gerenciar Slides & Banners
          </h1>
          <p className="text-sm text-[#a8a090] mt-1">
            Controle os banners panorâmicos exibidos na página inicial com suporte a agendamento, ordenação e publicação instantânea.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToOfficialPresets}
            className="btn-medieval-secondary px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
            title="Restaura os 5 banners medievais originais"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#ffd978]" />
            <span className="hidden sm:inline">Restaurar 5 Banners Oficiais</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="btn-gold-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(201,151,56,0.35)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Slide</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 mb-6 rounded-xl flex items-center justify-between gap-3 text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-700/60 text-emerald-200'
              : 'bg-red-950/70 border border-red-700/60 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800">
          <span className="text-[11px] text-[#8c8475] uppercase block font-semibold">Total de Slides</span>
          <span className="text-2xl font-serif font-bold text-[#ffd978]">{stats.total}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800">
          <span className="text-[11px] text-[#8c8475] uppercase block font-semibold">Publicados (Ativos)</span>
          <span className="text-2xl font-serif font-bold text-emerald-400">{stats.published}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800">
          <span className="text-[11px] text-[#8c8475] uppercase block font-semibold">Rascunhos</span>
          <span className="text-2xl font-serif font-bold text-amber-400">{stats.drafts}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800">
          <span className="text-[11px] text-[#8c8475] uppercase block font-semibold">Inativos</span>
          <span className="text-2xl font-serif font-bold text-neutral-400">{stats.inactive}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#111520] border border-neutral-800 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por título, chamada ou botão..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0a0d14] border border-neutral-700 text-xs text-[#f5ebd6] placeholder-neutral-500 focus:border-[#ffd978] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#8c8475] shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | SlideStatus)}
            className="px-3 py-1.5 rounded-lg bg-[#0a0d14] border border-neutral-700 text-xs text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="published">Apenas Publicados</option>
            <option value="draft">Apenas Rascunhos</option>
            <option value="inactive">Apenas Inativos</option>
          </select>
        </div>
      </div>

      {/* Slides Management Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#ffd978]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <span>Carregando slides do Firestore...</span>
        </div>
      ) : filteredSlides.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0f131c] border border-neutral-800">
          <Layers className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-[#f5ebd6] mb-1">
            Nenhum slide encontrado
          </h3>
          <p className="text-xs text-[#8c8475] mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Tente remover os filtros de pesquisa.'
              : 'Clique em "Novo Slide" para cadastrar o primeiro banner.'}
          </p>
          <button
            onClick={handleCreateNew}
            className="btn-gold-primary px-4 py-2 rounded-lg text-xs font-serif font-bold"
          >
            + Criar Novo Slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSlides.map((slide, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredSlides.length - 1;

            return (
              <div
                key={slide.id}
                className="p-4 rounded-xl bg-[#0e121a] border border-neutral-800 hover:border-[#c99738]/50 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
              >
                {/* Left: Reordering & Thumbnail */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {/* Order controls */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleMoveOrder(index, 'up')}
                      disabled={isFirst}
                      className="p-1 rounded bg-[#161b26] hover:bg-[#202838] text-neutral-400 hover:text-[#ffd978] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs font-bold text-[#ffd978]">
                      #{slide.order}
                    </span>
                    <button
                      onClick={() => handleMoveOrder(index, 'down')}
                      disabled={isLast}
                      className="p-1 rounded bg-[#161b26] hover:bg-[#202838] text-neutral-400 hover:text-[#ffd978] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div
                    onClick={() => setPreviewSlide(slide)}
                    className="relative w-32 h-18 sm:w-40 sm:h-22 rounded-lg overflow-hidden border border-[#c99738]/40 bg-black shrink-0 cursor-pointer group/thumb"
                    title="Clique para ampliar pré-visualização"
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover transition-transform group-hover/thumb:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-[#f5ebd6]">
                        {slide.title}
                      </h3>
                      {slide.subtitle && (
                        <span className="text-xs text-[#a8a090] hidden md:inline">
                          — {slide.subtitle}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#8c8475]">
                      {slide.buttonText && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/50 text-blue-300 border border-blue-800/40 text-[10px]">
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>{slide.buttonText} → {slide.buttonUrl}</span>
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>
                          {slide.startDate || slide.endDate
                            ? `${slide.startDate ? new Date(slide.startDate).toLocaleDateString('pt-BR') : 'Início imediato'} até ${slide.endDate ? new Date(slide.endDate).toLocaleDateString('pt-BR') : 'Indeterminado'}`
                            : 'Sempre Ativo'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status badge & Action buttons */}
                <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
                  
                  {/* Status toggle button */}
                  <button
                    onClick={() => handleToggleStatus(slide)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors flex items-center gap-1.5 ${
                      slide.status === 'published'
                        ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                        : slide.status === 'draft'
                        ? 'bg-amber-950/70 border-amber-700/60 text-amber-300 hover:bg-amber-900/60'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                    }`}
                    title="Clique para alternar o status do slide"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        slide.status === 'published'
                          ? 'bg-emerald-400'
                          : slide.status === 'draft'
                          ? 'bg-amber-400'
                          : 'bg-neutral-500'
                      }`}
                    />
                    <span>
                      {slide.status === 'published'
                        ? 'Publicado'
                        : slide.status === 'draft'
                        ? 'Rascunho'
                        : 'Inativo'}
                    </span>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewSlide(slide)}
                      className="p-2 rounded-lg bg-[#141824] hover:bg-[#1d2334] text-neutral-300 hover:text-[#ffd978] transition-colors cursor-pointer"
                      title="Visualizar banner"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(slide)}
                      className="p-2 rounded-lg bg-[#141824] hover:bg-[#1d2334] text-neutral-300 hover:text-[#ffd978] transition-colors cursor-pointer"
                      title="Duplicar slide como rascunho"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleEdit(slide)}
                      className="p-2 rounded-lg bg-[#182030] hover:bg-[#202b42] text-[#93c5fd] hover:text-white transition-colors cursor-pointer border border-[#3b82f6]/30"
                      title="Editar slide"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSlideToDelete(slide)}
                      className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-colors cursor-pointer border border-red-800/40"
                      title="Excluir slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {slideToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0e121a] border border-red-800/60 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif font-bold text-lg text-white">
                Confirmar Exclusão de Slide
              </h3>
            </div>

            <p className="text-xs text-[#c5bcab] mb-4 leading-relaxed">
              Você está prestes a excluir o slide <strong className="text-white font-semibold">"{slideToDelete.title}"</strong>. Esta ação removerá o banner do carrossel no site público.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setSlideToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white cursor-pointer"
              >
                Sim, Excluir Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      <SlideEditModal
        key={editingSlide?.id || (isEditModalOpen ? 'new' : 'closed')}
        isOpen={isEditModalOpen}
        slide={editingSlide}
        currentTotalSlides={slides.length}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSlide(null);
        }}
        onSave={handleSaveSlide}
      />

      {/* Preview Modal */}
      <SlidePreviewModal
        slide={previewSlide}
        onClose={() => setPreviewSlide(null)}
      />
    </div>
  );
};
