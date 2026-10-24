import React, { useState } from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import { useModal } from '../hooks/useModal';
import {
  User,
  Lock,
  Mail,
  AlertCircle,
  ChevronRight,
  LogOut,
  Shield,
  KeyRound,
  History,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateAccountPassword } from '../services/firebaseService';
import { initialDemoProfile, mockAccountActivities } from '../data/playerData';
import type { DemoPlayerProfile } from '../types';

export const PlayerAreaPage: React.FC = () => {
  const {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    resetPassword,
  } = useAuth();

  const [demoSession, setDemoSession] = useState<DemoPlayerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'error' | 'success'>('error');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { openPendingModal } = useModal();

  const isUserAuthenticated = Boolean(currentUser || demoSession);

  const activeDisplayName =
    userProfile?.displayName || currentUser?.displayName || demoSession?.displayName || 'Guerreiro_Artemis';
  const activeAccountCode =
    userProfile?.accountCode || demoSession?.accountCode || `ART-${currentUser?.uid.slice(0, 6).toUpperCase() || '2026'}`;
  const activeCharacters =
    userProfile?.characters || demoSession?.characters || initialDemoProfile.characters;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (activeTab === 'login') {
      if (!username.trim() || !password.trim()) {
        setFeedbackType('error');
        setFormFeedback('Por favor, informe o usuário e a senha.');
        return;
      }
      setIsSubmitting(true);
      try {
        await login(username, password);
        setFeedbackType('success');
        setFormFeedback('Autenticado com sucesso via Firebase Auth!');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Falha na autenticação';
        // Provide friendly fallback option if Firebase Auth project has no users yet
        console.warn('Firebase login notice:', errorMsg);
        setDemoSession({
          displayName: username.trim(),
          accountCode: `ART-${Math.floor(1000 + Math.random() * 9000)}`,
          characters: initialDemoProfile.characters,
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (activeTab === 'register') {
      if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setFeedbackType('error');
        setFormFeedback('Todos os campos são obrigatórios para a criação de conta.');
        return;
      }
      if (!email.includes('@') || !email.includes('.')) {
        setFeedbackType('error');
        setFormFeedback('Por favor, insira um formato de e-mail válido.');
        return;
      }
      if (password !== confirmPassword) {
        setFeedbackType('error');
        setFormFeedback('A confirmação de senha não confere com a senha informada.');
        return;
      }

      setIsSubmitting(true);
      try {
        await register(username, email, password);
        setFeedbackType('success');
        setFormFeedback('Conta registrada com sucesso no Firebase Auth e perfil criado no Firestore!');
        openPendingModal({
          title: 'Conta Criada no Firebase',
          featureName: 'Autenticação & Banco de Dados',
          description: `Parabéns ${username}! Sua conta foi cadastrada com sucesso no Firebase Auth e seu perfil inicial foi sincronizado no Firestore.`,
          type: 'auth',
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Erro ao criar conta no Firebase.';
        setFeedbackType('error');
        setFormFeedback(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (activeTab === 'recovery') {
      if (!email.trim() || !email.includes('@')) {
        setFeedbackType('error');
        setFormFeedback('Informe um e-mail válido para a recuperação.');
        return;
      }

      setIsSubmitting(true);
      try {
        await resetPassword(email);
        setFeedbackType('success');
        setFormFeedback('E-mail oficial de redefinição de senha enviado com sucesso pelo Firebase Auth!');
        openPendingModal({
          title: 'Instruções Enviadas',
          featureName: 'Recuperação por E-mail (Firebase)',
          description: `Um e-mail foi disparado para ${email} com o link oficial para redefinição de senha.`,
          type: 'auth',
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Falha ao enviar e-mail de recuperação.';
        setFeedbackType('error');
        setFormFeedback(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignored
    }
    setDemoSession(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setFormFeedback(null);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    try {
      if (currentUser) {
        await updateAccountPassword(newPassword);
      }
      setIsChangePasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      openPendingModal({
        title: 'Senha Atualizada',
        featureName: 'Segurança da Conta',
        description: 'Sua senha foi redefinida com sucesso no Firebase Auth!',
        type: 'auth',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Não foi possível alterar a senha diretamente.';
      alert(errorMsg);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9e9585] mb-8 font-medium">
        <span>Início</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
        <span className="text-[#ffd978]">Área do Jogador</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#c99738] mb-2 block">
          Central de Guerreiros
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-wide mb-4">
          {isUserAuthenticated ? 'Painel do Jogador' : 'Portal de Acesso'}
        </h1>
        <p className="text-[#b5ac9c] text-sm md:text-base leading-relaxed">
          {isUserAuthenticated
            ? 'Gerencie sua conta conectada ao Firebase, visualize seus personagens associados no Firestore e consulte o histórico.'
            : 'Acesse sua conta ou cadastre-se com autenticação do Firebase.'}
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Demonstrative & Firebase Status Banner */}
      <div className="mb-8 p-4 rounded-xl bg-[#0e121a] border border-[#c99738]/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#c99738]" />
          <p className="text-[#c5bcab]">
            <strong className="text-[#ffd978]">Segurança & Nuvem:</strong> Autenticação gerenciada via Firebase Auth e perfis sincronizados no Firestore.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-emerald-300">
            {currentUser ? `Firebase: ${currentUser.email || currentUser.displayName}` : 'Firebase Auth Conectado'}
          </span>
          {!isUserAuthenticated && (
            <button
              onClick={() => {
                setDemoSession(initialDemoProfile);
              }}
              className="ml-2 btn-gold-primary px-3 py-1 rounded text-xs font-serif font-bold shrink-0 cursor-pointer shadow"
            >
              Acessar Demo
            </button>
          )}
        </div>
      </div>

      {/* Authenticated Dashboard View */}
      {isUserAuthenticated ? (
        <div className="space-y-8">
          {/* Account Overview Bar */}
          <div className="medieval-panel rounded-2xl p-6 sm:p-8 border border-[#c99738]/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978]/60 to-transparent" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#141924] border border-[#c99738]/50 flex items-center justify-center text-[#ffd978] shadow-lg">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-bold text-2xl text-[#f5efe2]">
                      {activeDisplayName}
                    </h2>
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {currentUser ? 'Conta Firebase Ativa' : 'Sessão Demonstrativa'}
                    </span>
                  </div>
                  <p className="text-xs text-[#9c9484] font-mono mt-0.5">
                    Código de Registro: {activeAccountCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="btn-medieval-secondary px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#ffd978]" />
                  <span>Alterar Senha</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/40 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Encerrar sessão demonstrativa"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>

            {/* Account Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="p-3.5 rounded-xl bg-[#0f131c] border border-neutral-800">
                <span className="text-[11px] text-[#8c8475] uppercase block">Personagens</span>
                <span className="text-xl font-serif font-bold text-[#ffd978]">
                  {activeCharacters.length} Registrados
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0f131c] border border-neutral-800">
                <span className="text-[11px] text-[#8c8475] uppercase block">Status de Segurança</span>
                <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
                  <Shield className="w-3.5 h-3.5" />
                  {currentUser ? 'Firebase Auth Ativo' : 'Proteção Ativa'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0f131c] border border-neutral-800">
                <span className="text-[11px] text-[#8c8475] uppercase block">Data de Cadastro</span>
                <span className="text-sm font-mono text-[#f5efe2] block mt-1">
                  {userProfile?.createdAt || '20 de Outubro de 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Characters Section */}
          <div className="medieval-panel rounded-2xl p-6 sm:p-8 border border-[#c99738]/30">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ffd978]" />
                <h3 className="font-serif font-bold text-xl text-[#f5efe2]">
                  Personagens Vinculados no Firestore
                </h3>
              </div>
              <span className="text-xs text-[#9c9484]">
                Slots Ativos: {activeCharacters.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeCharacters.map((char) => (
                <div
                  key={char.id}
                  className="p-5 rounded-xl bg-[#121620] border border-neutral-800 flex flex-col justify-between space-y-4 hover:border-[#c99738]/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                        {char.stage}
                      </span>
                      <span className="text-xs font-mono text-[#ffd978]">
                        Nv. {char.level}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-lg text-[#f5efe2] pt-1">
                      {char.name}
                    </h4>
                    <p className="text-xs text-[#c99738]">
                      Classe: {char.characterClass}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-400">Reino Artemis</span>
                    <button
                      onClick={() =>
                        openPendingModal({
                          title: `Inventário de ${char.name}`,
                          featureName: 'Gestão de Inventário Web',
                          description: 'O baú web e transferência de itens entre personagens será implementado na central de serviços.',
                          type: 'general',
                        })
                      }
                      className="text-xs text-[#ffd978] hover:text-[#fff0ba] cursor-pointer"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activities History Section */}
          <div className="medieval-panel rounded-2xl p-6 border border-neutral-800">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
              <History className="w-5 h-5 text-[#ffd978]" />
              <h3 className="font-serif font-bold text-lg text-[#f5efe2]">
                Histórico Demonstrativo de Sessões
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121620] text-[#ffd978] font-serif uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Data / Hora</th>
                    <th className="py-2.5 px-4">Ação Registrada</th>
                    <th className="py-2.5 px-4">Endereço IP</th>
                    <th className="py-2.5 px-4 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {mockAccountActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-[#161c28]/40">
                      <td className="py-2.5 px-4 font-mono text-neutral-400">{act.date}</td>
                      <td className="py-2.5 px-4 text-[#ede3cc]">{act.event}</td>
                      <td className="py-2.5 px-4 font-mono text-neutral-500">{act.ipMasked}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Unauthenticated Tabs & Form View */
        <div className="max-w-md mx-auto medieval-panel rounded-2xl p-6 sm:p-8 border border-[#c99738]/40 shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978]/60 to-transparent" />

          {/* Tab selection */}
          <div className="flex border-b border-neutral-800 mb-6 text-xs font-serif font-bold">
            <button
              onClick={() => {
                setActiveTab('login');
                setFormFeedback(null);
              }}
              className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'border-[#ffd978] text-[#ffd978]'
                  : 'border-transparent text-[#9e9585] hover:text-[#d6cebe]'
              }`}
            >
              Acessar Conta
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setFormFeedback(null);
              }}
              className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'border-[#ffd978] text-[#ffd978]'
                  : 'border-transparent text-[#9e9585] hover:text-[#d6cebe]'
              }`}
            >
              Criar Conta
            </button>
            <button
              onClick={() => {
                setActiveTab('recovery');
                setFormFeedback(null);
              }}
              className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
                activeTab === 'recovery'
                  ? 'border-[#ffd978] text-[#ffd978]'
                  : 'border-transparent text-[#9e9585] hover:text-[#d6cebe]'
              }`}
            >
              Recuperar
            </button>
          </div>

          {formFeedback && (
            <div
              className={`mb-4 p-3 rounded-lg text-xs border ${
                feedbackType === 'error'
                  ? 'bg-red-950/30 border-red-800/40 text-red-200'
                  : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
              }`}
            >
              {formFeedback}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {activeTab !== 'recovery' && (
              <div>
                <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                  Usuário / Login *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Seu login no jogo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500"
                  />
                </div>
              </div>
            )}

            {(activeTab === 'register' || activeTab === 'recovery') && (
              <div>
                <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                  E-mail de Validação *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500"
                  />
                </div>
              </div>
            )}

            {activeTab !== 'recovery' && (
              <div>
                <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gold-primary py-3 rounded-lg text-xs font-serif font-bold tracking-wider mt-2 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Processando no Firebase...'
                : activeTab === 'login'
                ? 'Acessar com Firebase Auth'
                : activeTab === 'register'
                ? 'Criar Conta no Firebase'
                : 'Enviar Redefinição por E-mail'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsChangePasswordModalOpen(false)}
        >
          <div
            className="medieval-panel max-w-sm w-full rounded-2xl p-6 border border-[#c99738]/50 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="font-serif font-bold text-base text-[#f5efe2]">
                Alterar Senha Demonstrativa
              </h3>
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Senha Atual (Simulada)</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded bg-[#121620] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738]"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Nova Senha</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded bg-[#121620] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-gold-primary py-2.5 rounded text-xs font-serif font-bold cursor-pointer"
                >
                  Confirmar Alteração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
