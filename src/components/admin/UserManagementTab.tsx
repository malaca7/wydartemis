import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Edit3,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
  Crown,
  RefreshCw,
} from 'lucide-react';
import type { StoredAdminAccountDoc } from '../../services/adminUserService';
import { UserEditModal } from './UserEditModal';

interface UserManagementTabProps {
  accounts: StoredAdminAccountDoc[];
  isLoading: boolean;
  onRefresh: () => void;
  onSaveAccount: (account: Partial<StoredAdminAccountDoc> & { email: string; displayName: string }, password?: string) => Promise<void>;
  onDeleteAccount: (uid: string) => Promise<void>;
  onResetPassword: (uid: string, newPass: string) => Promise<void>;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  accounts,
  isLoading,
  onRefresh,
  onSaveAccount,
  onDeleteAccount,
  onResetPassword,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'gamemaster' | 'player' | 'suspended'>('all');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<StoredAdminAccountDoc | null>(null);

  const [accountToDelete, setAccountToDelete] = useState<StoredAdminAccountDoc | null>(null);
  const [accountToResetPassword, setAccountToResetPassword] = useState<StoredAdminAccountDoc | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filtro inteligente
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        acc.displayName.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.accountCode.toLowerCase().includes(q) ||
        (acc.characters && acc.characters.some((c) => c.name.toLowerCase().includes(q)));

      if (!matchesSearch) return false;

      if (roleFilter === 'all') return true;
      if (roleFilter === 'suspended') return acc.status === 'suspended';
      return acc.role === roleFilter;
    });
  }, [accounts, searchQuery, roleFilter]);

  // Estatísticas Rápidas
  const stats = useMemo(() => {
    const total = accounts.length;
    const admins = accounts.filter((a) => a.role === 'admin').length;
    const gms = accounts.filter((a) => a.role === 'gamemaster').length;
    const active = accounts.filter((a) => a.status === 'active' || a.status === 'vip').length;
    const totalChars = accounts.reduce((acc, curr) => acc + (curr.characters?.length || 0), 0);
    return { total, admins, gms, active, totalChars };
  }, [accounts]);

  const handleOpenCreateModal = () => {
    setEditingAccount(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (account: StoredAdminAccountDoc) => {
    setEditingAccount(account);
    setIsEditModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;
    setIsActionSubmitting(true);
    try {
      await onDeleteAccount(accountToDelete.uid);
      setFeedback({ message: `Conta ${accountToDelete.displayName} excluída com sucesso.`, type: 'success' });
      setAccountToDelete(null);
    } catch (err) {
      setFeedback({ message: err instanceof Error ? err.message : 'Erro ao excluir conta.', type: 'error' });
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const confirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountToResetPassword || !newPasswordInput.trim()) return;
    setIsActionSubmitting(true);
    try {
      await onResetPassword(accountToResetPassword.uid, newPasswordInput.trim());
      setFeedback({ message: `Senha da conta ${accountToResetPassword.displayName} atualizada com sucesso.`, type: 'success' });
      setAccountToResetPassword(null);
      setNewPasswordInput('');
    } catch (err) {
      setFeedback({ message: err instanceof Error ? err.message : 'Erro ao alterar senha.', type: 'error' });
    } finally {
      setIsActionSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0f131c] border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#8c8475] uppercase">Total de Contas</span>
            <Users className="w-4 h-4 text-[#ffd978]" />
          </div>
          <span className="text-2xl font-serif font-bold text-[#f5ebd6] block mt-1">
            {stats.total}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">{stats.totalChars} Personagens</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#17140b] border border-[#ffd978]/40 shadow-[0_0_15px_rgba(255,217,120,0.1)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#ffd978] uppercase">Administradores</span>
            <Crown className="w-4 h-4 text-[#ffd978]" />
          </div>
          <span className="text-2xl font-serif font-bold text-[#ffd978] block mt-1">
            {stats.admins}
          </span>
          <span className="text-[10px] text-[#ffd978]/80 mt-0.5 block">Acesso Supremo</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f131c] border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-400 uppercase">Game Masters</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-serif font-bold text-blue-300 block mt-1">
            {stats.gms}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Moderação & Eventos</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f131c] border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase">Contas Ativas</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-serif font-bold text-emerald-300 block mt-1">
            {stats.active}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Status Regular</span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-700/60 text-emerald-200'
              : 'bg-red-950/70 border border-red-700/60 text-red-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Control Bar: Search, Filters & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por login, e-mail, código ou personagem..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#121622] border border-neutral-700 text-xs text-[#f5ebd6] placeholder-neutral-500 focus:border-[#ffd978] focus:outline-none"
            />
          </div>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-[#121622] border border-neutral-700 text-neutral-300 hover:text-[#ffd978] transition-colors cursor-pointer"
            title="Atualizar lista de contas"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#ffd978]' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="btn-gold-primary px-4 py-2 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Nova Conta</span>
          </button>
        </div>
      </div>

      {/* Role Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: 'Todas as Contas' },
          { key: 'admin', label: '👑 Administradores' },
          { key: 'gamemaster', label: '⚔️ Game Masters' },
          { key: 'player', label: '🛡️ Jogadores' },
          { key: 'suspended', label: '⛔ Suspensas' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRoleFilter(tab.key as typeof roleFilter)}
            className={`px-3 py-1.5 rounded-lg font-serif font-medium whitespace-nowrap transition-colors cursor-pointer ${
              roleFilter === tab.key
                ? 'bg-[#ffd978] text-[#0a0d14] font-bold shadow-sm'
                : 'bg-[#121622] border border-neutral-800 text-neutral-400 hover:text-[#ffd978]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accounts List Table / Cards */}
      {filteredAccounts.length === 0 ? (
        <div className="medieval-panel rounded-2xl p-10 border border-neutral-800 text-center">
          <Users className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
          <h4 className="font-serif font-bold text-sm text-[#f5ebd6]">Nenhuma conta encontrada</h4>
          <p className="text-xs text-neutral-500 mt-1">
            Não há contas que coincidam com o termo de busca ou filtro selecionado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAccounts.map((account) => {
            const isAdminAcc = account.role === 'admin';
            const isGmAcc = account.role === 'gamemaster';
            const isSuspended = account.status === 'suspended';
            const isVip = account.status === 'vip';

            return (
              <div
                key={account.uid}
                className={`medieval-panel rounded-2xl p-4 sm:p-5 border transition-all ${
                  isAdminAcc
                    ? 'border-[#ffd978]/50 bg-gradient-to-r from-[#17140b]/90 via-[#0e121a] to-[#17140b]/90 shadow-[0_0_15px_rgba(255,217,120,0.08)]'
                    : isSuspended
                    ? 'border-red-900/40 bg-[#160d0d]/60 opacity-80'
                    : 'border-neutral-800 hover:border-[#c99738]/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Informações da Conta */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                        isAdminAcc
                          ? 'bg-[#ffd978]/15 border-[#ffd978]/60 text-[#ffd978]'
                          : isGmAcc
                          ? 'bg-blue-950/60 border-blue-700/50 text-blue-400'
                          : 'bg-[#141924] border-neutral-700 text-neutral-300'
                      }`}
                    >
                      {isAdminAcc ? <Crown className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif font-bold text-base text-[#f5ebd6]">
                          {account.displayName}
                        </span>

                        {/* Badge de Cargo */}
                        {isAdminAcc && (
                          <span className="text-[10px] font-bold text-[#ffd978] bg-[#ffd978]/15 px-2 py-0.5 rounded border border-[#c99738]/60">
                            ADMINISTRADOR
                          </span>
                        )}
                        {isGmAcc && (
                          <span className="text-[10px] font-bold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-700/50">
                            GAME MASTER
                          </span>
                        )}
                        {!isAdminAcc && !isGmAcc && (
                          <span className="text-[10px] text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                            JOGADOR
                          </span>
                        )}

                        {/* Badge de Status */}
                        {isSuspended && (
                          <span className="text-[10px] font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
                            SUSPENSO
                          </span>
                        )}
                        {isVip && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/50">
                            VIP
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#9d9484] mt-1 font-mono">
                        <span>E-mail: <strong className="text-[#d6cebe]">{account.email}</strong></span>
                        <span>Código: <strong className="text-[#ffd978]">{account.accountCode}</strong></span>
                        <span className="text-neutral-500">Cadastrado: {account.createdAt}</span>
                      </div>

                      {/* Personagens */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="text-[10px] uppercase text-neutral-500 font-semibold mr-1">
                          Personagens ({account.characters?.length || 0}):
                        </span>
                        {account.characters && account.characters.length > 0 ? (
                          account.characters.map((c) => (
                            <span
                              key={c.id}
                              className="text-[11px] px-2 py-0.5 rounded bg-[#151a24] border border-neutral-800 text-[#f5ebd6]"
                            >
                              <strong>{c.name}</strong> • {c.characterClass} Nv.{c.level} ({c.stage})
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-neutral-500 italic">Nenhum personagem registrado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações Administrativas */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(account)}
                      className="btn-medieval-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                      title="Editar cargo, status e dados da conta"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#ffd978]" />
                      <span>Gerenciar</span>
                    </button>

                    <button
                      onClick={() => setAccountToResetPassword(account)}
                      className="btn-medieval-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                      title="Redefinir senha da conta"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#ffd978]" />
                      <span>Senha</span>
                    </button>

                    {account.email.toLowerCase() !== 'malaca7x@gmail.com' && (
                      <button
                        onClick={() => setAccountToDelete(account)}
                        className="p-1.5 text-red-400 hover:text-red-300 rounded-lg bg-red-950/20 hover:bg-red-900/40 border border-red-800/40 transition-colors cursor-pointer"
                        title="Excluir conta de usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={onSaveAccount}
        initialAccount={editingAccount}
      />

      {/* Modal de Confirmação de Exclusão */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="medieval-panel rounded-2xl max-w-md w-full border border-red-800/60 p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-700/60 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-red-200">
              Excluir Conta Permanentemente?
            </h3>
            <p className="text-xs text-[#d6cebe] mt-2">
              Deseja realmente remover a conta de <strong>{accountToDelete.displayName}</strong> ({accountToDelete.email}) e todos os personagens vinculados? Esta ação não pode ser desfeita.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setAccountToDelete(null)}
                disabled={isActionSubmitting}
                className="px-4 py-2 rounded-xl border border-neutral-700 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isActionSubmitting}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-serif font-bold text-xs shadow-lg"
              >
                {isActionSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rápido de Redefinição de Senha */}
      {accountToResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="medieval-panel rounded-2xl max-w-sm w-full border border-[#c99738]/50 p-6 shadow-2xl text-left">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#141924] border border-[#c99738]/40 flex items-center justify-center text-[#ffd978]">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#f5ebd6]">
                  Redefinir Senha
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {accountToResetPassword.displayName} ({accountToResetPassword.email})
                </p>
              </div>
            </div>

            <form onSubmit={confirmResetPassword} className="space-y-4">
              <div>
                <label className="text-xs text-[#b8b09f] block mb-1">
                  Nova Senha de Acesso:
                </label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#121622] border border-neutral-700 text-xs text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAccountToResetPassword(null);
                    setNewPasswordInput('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-700 text-xs text-neutral-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isActionSubmitting}
                  className="btn-gold-primary px-4 py-1.5 rounded-lg text-xs font-serif font-bold"
                >
                  {isActionSubmitting ? 'Salvando...' : 'Atualizar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
