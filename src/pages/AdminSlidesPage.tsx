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
  Users,
  Server,
  Crown,
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
import {
  fetchAllAccounts,
  saveOrUpdateAccount,
  deleteAccount,
  resetAccountPassword,
  type StoredAdminAccountDoc,
} from '../services/adminUserService';
import { SlideEditModal } from '../components/admin/SlideEditModal';
import { SlidePreviewModal } from '../components/admin/SlidePreviewModal';
import { UserManagementTab } from '../components/admin/UserManagementTab';
import { AccessManagementTab } from '../components/admin/AccessManagementTab';
import { ServerSettingsTab } from '../components/admin/ServerSettingsTab';

export const AdminSlidesPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'slides' | 'users' | 'access' | 'server'>('slides');

  // Slides State
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Accounts State
  const [accounts, setAccounts] = useState<StoredAdminAccountDoc[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);

  // Authentication & Passkey State
  const [isLocalAdminUnlocked, setIsLocalAdminUnlocked] = useState(false);
  const isAdminAuthorized = isUserAdmin(currentUser, userProfile) || isLocalAdminUnlocked;

  const [inputPasskey, setInputPasskey] = useState('');
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  // Filter & Search (Slides)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SlideStatus>('all');

  // Modals (Slides)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<BannerSlide | null>(null);
  const [previewSlide, setPreviewSlide] = useState<BannerSlide | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<BannerSlide | null>(null);

  // Carrega contas
  const loadAccounts = useCallback(async () => {
    setIsAccountsLoading(true);
    try {
      const list = await fetchAllAccounts();
      setAccounts(list);
    } catch (err) {
      console.warn('Erro ao carregar lista de contas:', err);
    } finally {
      setIsAccountsLoading(false);
    }
  }, []);

  // Sincronização inicial
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

    loadAccounts();

    return () => {
      active = false;
    };
  }, [loadAccounts]);

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

  // ---------------------------------------------------------------------------
  // Ações de Usuários & Contas
  // ---------------------------------------------------------------------------
  const handleSaveAccount = async (
    account: Partial<StoredAdminAccountDoc> & { email: string; displayName: string },
    password?: string
  ) => {
    await saveOrUpdateAccount(account, password, userProfile?.displayName || 'MALACA');
    await loadAccounts();
    setFeedback({ message: `Conta ${account.displayName} salva com sucesso!`, type: 'success' });
  };

  const handleDeleteAccount = async (uid: string) => {
    await deleteAccount(uid, userProfile?.displayName || 'MALACA');
    await loadAccounts();
    setFeedback({ message: 'Conta de usuário excluída com sucesso.', type: 'success' });
  };

  const handleResetAccountPassword = async (uid: string, newPass: string) => {
    await resetAccountPassword(uid, newPass, userProfile?.displayName || 'MALACA');
    await loadAccounts();
    setFeedback({ message: 'Senha da conta atualizada com sucesso!', type: 'success' });
  };

  const handleNotify = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
  };

  // ---------------------------------------------------------------------------
  // Ações de Slides
  // ---------------------------------------------------------------------------
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

  const slideStats = useMemo(() => {
    const published = slides.filter((s) => s.status === 'published').length;
    const drafts = slides.filter((s) => s.status === 'draft').length;
    const inactive = slides.filter((s) => s.status === 'inactive').length;
    return { total: slides.length, published, drafts, inactive };
  }, [slides]);

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
      const updated = [...slides, duplicated];
      setSlides(updated);
      setFeedback({ message: `Slide duplicado como rascunho com sucesso!`, type: 'success' });
    } catch {
      setFeedback({ message: 'Falha ao duplicar slide.', type: 'error' });
    }
  }, [slides]);

  const handleSaveSlide = async (savedSlide: BannerSlide) => {
    try {
      await saveSlide(savedSlide);
      const exists = slides.some((s) => s.id === savedSlide.id);
      let updated: BannerSlide[];
      if (exists) {
        updated = slides.map((s) => (s.id === savedSlide.id ? savedSlide : s));
      } else {
        updated = [...slides, savedSlide];
      }
      setSlides(updated);
      setIsEditModalOpen(false);
      setEditingSlide(null);
      setFeedback({ message: 'Slide salvo com sucesso!', type: 'success' });
    } catch {
      setFeedback({ message: 'Erro ao salvar slide no banco de dados.', type: 'error' });
    }
  };

  const handleDeletePrompt = (slide: BannerSlide) => {
    setSlideToDelete(slide);
  };

  const handleConfirmDelete = async () => {
    if (!slideToDelete) return;
    try {
      await deleteSlide(slideToDelete.id);
      const remaining = slides.filter((s) => s.id !== slideToDelete.id);
      setSlides(remaining);
      setSlideToDelete(null);
      setFeedback({ message: 'Slide excluído com sucesso.', type: 'success' });
    } catch {
      setFeedback({ message: 'Erro ao excluir slide.', type: 'error' });
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredSlides.length) return;

    const newSorted = [...filteredSlides];
    const temp = newSorted[index];
    newSorted[index] = newSorted[targetIndex];
    newSorted[targetIndex] = temp;

    const reordered = newSorted.map((item, idx) => ({
      ...item,
      order: idx + 1,
      updatedAt: new Date().toISOString(),
    }));

    setSlides(reordered);

    try {
      await reorderSlides(reordered);
      setFeedback({ message: 'Ordenação dos slides atualizada!', type: 'success' });
    } catch {
      setFeedback({ message: 'Falha ao sincronizar ordenação com o banco.', type: 'error' });
    }
  };

  const handleResetToOfficialPresets = async () => {
    try {
      await reorderSlides(initialDefaultSlides);
      setSlides(initialDefaultSlides);
      setFeedback({ message: 'Todos os 5 banners medievais oficiais foram restaurados com sucesso!', type: 'success' });
    } catch {
      setFeedback({ message: 'Erro ao restaurar banners padrão.', type: 'error' });
    }
  };

  // Se não estiver autorizado como admin, exibe formulário de acesso por chave
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

          <div className="mt-6 pt-4 border-t border-neutral-800 text-xs text-[#8c8475] space-y-2">
            <p>
              Ou faça login na <Link to="/area-jogador" className="text-[#ffd978] hover:underline font-semibold">Área do Jogador</Link> com a conta de administrador <strong>MALACA</strong> (<code>malaca7x@gmail.com</code>).
            </p>
            <div>
              <Link to="/" className="text-[#ffd978] hover:underline">
                ← Retornar à Página Inicial
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeAdminLabel = userProfile?.displayName
    ? `${userProfile.displayName} (${userProfile.email || 'malaca7x@gmail.com'})`
    : (currentUser?.email ? `${currentUser.displayName || 'MALACA'} (${currentUser.email})` : 'MALACA (malaca7x@gmail.com)');

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Admin Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-[#9e9585]">
          <Link to="/" className="hover:text-[#ffd978]">Início</Link>
          <span>/</span>
          <Link to="/area-jogador" className="hover:text-[#ffd978]">Área do Jogador</Link>
          <span>/</span>
          <span className="text-[#ffd978] font-semibold">Painel Administrativo</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-semibold text-emerald-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin Conectado: <strong>{activeAdminLabel}</strong></span>
          </span>

          <button
            onClick={handleLogoutAdmin}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 transition-colors cursor-pointer"
          >
            Sair do Admin
          </button>
        </div>
      </div>

      {/* Main Admin Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b2232] border border-[#c99738]/40 text-xs text-[#ffd978] mb-2">
          <Crown className="w-3.5 h-3.5 text-[#ffd978]" />
          <span>Controle Mestre do Servidor • WYD Artemis</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold gold-gradient-text tracking-wide">
          Painel de Gerenciamento Administrativo
        </h1>
        <p className="text-sm text-[#a8a090] mt-1">
          Controle centralizado de carrossel de banners, contas de jogadores, permissões administrativas e infraestrutura do reino.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-800 mb-8 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('slides')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'slides'
              ? 'btn-gold-primary shadow-[0_0_15px_rgba(255,217,120,0.25)]'
              : 'bg-[#121622] text-[#d6cebe] hover:text-[#ffd978] border border-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Banners & Carrossel</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40">
            {slides.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('users');
            loadAccounts();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'btn-gold-primary shadow-[0_0_15px_rgba(255,217,120,0.25)]'
              : 'bg-[#121622] text-[#d6cebe] hover:text-[#ffd978] border border-neutral-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Contas & Usuários</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40">
            {accounts.length || '•'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('access')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'access'
              ? 'btn-gold-primary shadow-[0_0_15px_rgba(255,217,120,0.25)]'
              : 'bg-[#121622] text-[#d6cebe] hover:text-[#ffd978] border border-neutral-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Acessos & Segurança</span>
        </button>

        <button
          onClick={() => setActiveTab('server')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'server'
              ? 'btn-gold-primary shadow-[0_0_15px_rgba(255,217,120,0.25)]'
              : 'bg-[#121622] text-[#d6cebe] hover:text-[#ffd978] border border-neutral-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Servidor & Backups</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
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

      {/* TAB 1: Banners & Carrossel */}
      {activeTab === 'slides' && (
        <div>
          {/* Header Actions for Slides */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif font-bold text-xl text-[#f5ebd6]">
                Gerenciamento de Banners Panorâmicos
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Crie, ordene e configure agendamento dos slides da página inicial.
              </p>
            </div>

            <button
              onClick={handleCreateNew}
              className="btn-gold-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-serif font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(201,151,56,0.35)] cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Slide</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800">
              <span className="text-[11px] text-[#8c8475] uppercase block font-semibold">Total de Slides</span>
              <span className="text-2xl font-serif font-bold text-[#ffd978]">{slideStats.total}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800">
              <span className="text-[11px] text-emerald-400 uppercase block font-semibold">Publicados</span>
              <span className="text-2xl font-serif font-bold text-emerald-400">{slideStats.published}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800">
              <span className="text-[11px] text-amber-400 uppercase block font-semibold">Rascunhos</span>
              <span className="text-2xl font-serif font-bold text-amber-400">{slideStats.drafts}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800">
              <span className="text-[11px] text-neutral-400 uppercase block font-semibold">Inativos</span>
              <span className="text-2xl font-serif font-bold text-neutral-400">{slideStats.inactive}</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#0f131c] border border-neutral-800 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, subtítulo ou botão..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141924] border border-neutral-700 text-xs text-[#f5ebd6] placeholder-neutral-500 focus:border-[#ffd978] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-neutral-400 shrink-0 hidden sm:block" />
              {(['all', 'published', 'draft', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === status
                      ? 'bg-[#ffd978] text-[#0a0d14] font-bold shadow-sm'
                      : 'bg-[#141924] text-neutral-400 hover:text-[#ffd978]'
                  }`}
                >
                  {status === 'all' && 'Todos'}
                  {status === 'published' && 'Publicados'}
                  {status === 'draft' && 'Rascunhos'}
                  {status === 'inactive' && 'Inativos'}
                </button>
              ))}
            </div>
          </div>

          {/* Slide List */}
          {isLoading ? (
            <div className="p-12 text-center text-xs text-neutral-400">
              <RefreshCw className="w-6 h-6 animate-spin text-[#ffd978] mx-auto mb-2" />
              <span>Sincronizando slides com o banco de dados...</span>
            </div>
          ) : filteredSlides.length === 0 ? (
            <div className="medieval-panel rounded-2xl p-12 text-center border border-neutral-800">
              <Layers className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <h3 className="font-serif font-bold text-sm text-[#f5ebd6]">Nenhum slide encontrado</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Ajuste os filtros de busca ou crie um novo slide para exibi-lo no carrossel.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSlides.map((slide, index) => {
                const isFirst = index === 0;
                const isLast = index === filteredSlides.length - 1;

                return (
                  <div
                    key={slide.id}
                    className="medieval-panel rounded-2xl p-4 sm:p-5 border border-neutral-800 hover:border-[#c99738]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Drag / Order controls */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={isFirst}
                          className={`p-1 rounded hover:bg-neutral-800 transition-colors ${
                            isFirst ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer text-[#ffd978]'
                          }`}
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono font-bold text-[#c99738]">
                          #{slide.order}
                        </span>
                        <button
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={isLast}
                          className={`p-1 rounded hover:bg-neutral-800 transition-colors ${
                            isLast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer text-[#ffd978]'
                          }`}
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image Thumbnail */}
                      <div className="w-24 sm:w-32 h-16 sm:h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-neutral-700 relative">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              `${import.meta.env.BASE_URL}assets/artemis-logo.jpg`;
                          }}
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-white">
                          {slide.alignment}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-base text-[#f5ebd6] truncate">
                            {slide.title}
                          </h4>

                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              slide.status === 'published'
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
                                : slide.status === 'draft'
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/40'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            }`}
                          >
                            {slide.status === 'published' && 'Publicado'}
                            {slide.status === 'draft' && 'Rascunho'}
                            {slide.status === 'inactive' && 'Inativo'}
                          </span>
                        </div>

                        {slide.subtitle && (
                          <p className="text-xs text-[#a8a090] truncate mt-0.5">
                            {slide.subtitle}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500 mt-2 font-mono">
                          {slide.buttonText && (
                            <span className="text-[#ffd978]">
                              Botão: <strong>{slide.buttonText}</strong>
                            </span>
                          )}
                          {(slide.startDate || slide.endDate) && (
                            <span className="flex items-center gap-1 text-neutral-400">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>
                                {slide.startDate ? new Date(slide.startDate).toLocaleDateString() : 'Início'} até{' '}
                                {slide.endDate ? new Date(slide.endDate).toLocaleDateString() : 'Sempre'}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                      <button
                        onClick={() => setPreviewSlide(slide)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                        title="Pré-visualizar banner"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(slide)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                        title="Duplicar slide"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEdit(slide)}
                        className="btn-medieval-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                        title="Editar conteúdo do slide"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#ffd978]" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDeletePrompt(slide)}
                        className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 transition-colors cursor-pointer"
                        title="Excluir slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Contas & Usuários */}
      {activeTab === 'users' && (
        <UserManagementTab
          accounts={accounts}
          isLoading={isAccountsLoading}
          onRefresh={loadAccounts}
          onSaveAccount={handleSaveAccount}
          onDeleteAccount={handleDeleteAccount}
          onResetPassword={handleResetAccountPassword}
        />
      )}

      {/* TAB 3: Acessos & Segurança */}
      {activeTab === 'access' && (
        <AccessManagementTab onNotify={handleNotify} />
      )}

      {/* TAB 4: Servidor & Sistema */}
      {activeTab === 'server' && (
        <ServerSettingsTab
          onNotify={handleNotify}
          onResetBanners={handleResetToOfficialPresets}
        />
      )}

      {/* Slide Modals */}
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

      <SlidePreviewModal
        slide={previewSlide}
        onClose={() => setPreviewSlide(null)}
      />
    </div>
  );
};
