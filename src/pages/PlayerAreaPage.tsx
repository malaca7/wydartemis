import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  Layers,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateAccountPassword } from '../services/firebaseService';
import { initialDemoProfile, mockAccountActivities } from '../data/playerData';
import type { DemoPlayerProfile, DemoCharacter } from '../types';
import { sanitizeText, evaluatePasswordStrength } from '../utils/security';
import { CharacterDetailModal } from '../components/player/CharacterDetailModal';
import { isUserAdmin } from '../services/slidesService';

export const PlayerAreaPage: React.FC = () => {
  const {
    currentUser,
    userProfile,
    isAuthenticated,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<DemoCharacter | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'error' | 'success'>('error');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { openPendingModal } = useModal();
  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const isUserAuthenticated = Boolean(isAuthenticated || demoSession);
  const isAdmin = isUserAdmin(currentUser, userProfile);

  const activeDisplayName =
    userProfile?.displayName || currentUser?.displayName || demoSession?.displayName || 'Guerreiro_Artemis';
  const activeAccountCode =
    userProfile?.accountCode || demoSession?.accountCode || `ART-${(userProfile?.uid || currentUser?.uid || '2026').slice(0, 6).toUpperCase()}`;
  const activeCharacters =
    userProfile?.characters || demoSession?.characters || initialDemoProfile.characters;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (activeTab === 'login') {
      const cleanUsername = sanitizeText(username.trim());
      if (!cleanUsername || !password.trim()) {
        setFeedbackType('error');
        setFormFeedback('Por favor, informe o usuário e a senha.');
        return;
      }
      setIsSubmitting(true);
      try {
        await login(cleanUsername, password);
        setFeedbackType('success');
        setFormFeedback('Autenticado com sucesso!');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Falha na autenticação';
        setFeedbackType('error');
        setFormFeedback(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (activeTab === 'register') {
      const cleanUsername = sanitizeText(username.trim());
      const cleanEmail = sanitizeText(email.trim());
      if (!cleanUsername || !cleanEmail || !password.trim() || !confirmPassword.trim()) {
        setFeedbackType('error');
        setFormFeedback('Todos os campos são obrigatórios para a criação de conta.');
        return;
      }
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
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
        await register(cleanUsername, cleanEmail, password);
        setFeedbackType('success');
        setFormFeedback('Conta registrada com sucesso! Seus personagens iniciais já estão disponíveis.');
        openPendingModal({
          title: 'Conta Criada com Sucesso!',
          featureName: 'Área do Guerreiro Artemis',
          description: `Parabéns ${cleanUsername}! Sua conta foi cadastrada e seus personagens iniciais foram vinculados com sucesso. Bem-vindo ao universo sagrado de Artemis!`,
          type: 'auth',
        });
      } catch (err: unknown) {
        const rawMsg = err instanceof Error ? err.message : 'Erro ao criar conta.';
        setFeedbackType('error');
        setFormFeedback(rawMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (activeTab === 'recovery') {
      const cleanEmail = sanitizeText(email.trim());
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setFeedbackType('error');
        setFormFeedback('Informe um e-mail válido para a recuperação.');
        return;
      }

      setIsSubmitting(true);
      try {
        await resetPassword(cleanEmail);
        setFeedbackType('success');
        setFormFeedback('E-mail oficial de redefinição de senha enviado com sucesso pelo Firebase Auth!');
        openPendingModal({
          title: 'Instruções Enviadas',
          featureName: 'Recuperação por E-mail (Firebase)',
          description: `Um e-mail foi disparado para ${cleanEmail} com o link oficial para redefinição de senha.`,
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
            ? 'Gerencie sua conta conectada, visualize seus personagens associados no Artemis e consulte seu histórico de jornada.'
            : 'Acesse sua conta ou cadastre-se para iniciar sua jornada com segurança no Artemis Realm.'}
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
            {currentUser?.email || userProfile?.email ? `Conectado: ${currentUser?.email || userProfile?.email}` : 'Firebase Auth Conectado'}
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif font-bold text-2xl text-[#f5efe2]">
                      {activeDisplayName}
                    </h2>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-serif font-bold text-[#ffd978] bg-[#ffd978]/15 px-2.5 py-0.5 rounded-full border border-[#c99738]/60 shadow-[0_0_12px_rgba(255,217,120,0.35)]">
                        <Shield className="w-3.5 h-3.5 text-[#ffd978]" />
                        <span>Administrador Geral</span>
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {currentUser || userProfile ? 'Conta Artemis Ativa' : 'Sessão Demonstrativa'}
                    </span>
                  </div>
                  <p className="text-xs text-[#9c9484] font-mono mt-0.5">
                    Código de Registro: {activeAccountCode} • E-mail: {userProfile?.email || currentUser?.email || (isAdmin ? 'malaca7x@gmail.com' : 'Não informado')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                <Link
                  to="/admin/slides"
                  className={`flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md ${
                    isAdmin
                      ? 'btn-gold-primary font-bold shadow-[0_0_14px_rgba(201,151,56,0.35)]'
                      : 'btn-gold-primary'
                  }`}
                  title="Acessar painel de gerenciamento de slides e banners"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{isAdmin ? 'Painel Administrativo' : 'Gerenciar Slides'}</span>
                </Link>

                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="flex-1 sm:flex-initial justify-center btn-medieval-secondary px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#ffd978]" />
                  <span>Alterar Senha</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/40 text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  title="Encerrar sessão"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="inline sm:hidden md:inline">Sair</span>
                </button>
              </div>
            </div>

            {/* Account Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              <div className="p-3.5 rounded-xl bg-[#0f131c] border border-neutral-800">
                <span className="text-[11px] text-[#8c8475] uppercase block">Personagens</span>
                <span className="text-xl font-serif font-bold text-[#ffd978]">
                  {activeCharacters.length} Registrados
                </span>
              </div>
              <div className={`p-3.5 rounded-xl ${isAdmin ? 'bg-[#18140c] border border-[#ffd978]/40 shadow-[0_0_12px_rgba(255,217,120,0.12)]' : 'bg-[#0f131c] border border-neutral-800'}`}>
                <span className="text-[11px] text-[#8c8475] uppercase block">Cargo / Permissão</span>
                <span className={`text-sm font-serif font-bold flex items-center gap-1.5 mt-1 ${isAdmin ? 'text-[#ffd978]' : 'text-[#f5efe2]'}`}>
                  <Shield className={`w-3.5 h-3.5 ${isAdmin ? 'text-[#ffd978]' : 'text-neutral-400'}`} />
                  {isAdmin ? 'Administrador Geral' : 'Guerreiro Artemis'}
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
                  {userProfile?.createdAt || '25 de Outubro de 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Exclusive Admin Access Banner */}
          {isAdmin && (
            <div className="medieval-panel rounded-2xl p-6 border border-[#ffd978]/50 bg-gradient-to-r from-[#17140b] via-[#0f131d] to-[#17140b] shadow-[0_4px_24px_rgba(201,151,56,0.18)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-[#ffd978]/20 border border-[#ffd978]/40 text-[#ffd978]">
                      <Shield className="w-4 h-4" />
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[#ffd978]">
                      Painel de Acesso do Administrador
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                      Acesso Mestre
                    </span>
                  </div>
                  <p className="text-xs text-[#d6cebe] leading-relaxed">
                    Conta <strong className="text-[#ffd978]">MALACA</strong> reconhecida com autoridade de <strong>Administrador Geral do Servidor</strong> (<span className="text-[#ffd978]/90 font-mono">malaca7x@gmail.com</span>). Você possui controle total sobre banners, gerenciamento de contas e usuários, chaves de acesso e status do reino.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    to="/admin"
                    className="btn-gold-primary px-4 py-2.5 rounded-xl text-xs font-serif font-bold flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Painel Administrativo Completo</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      onClick={() => setSelectedCharacter(char)}
                      className="text-xs text-[#ffd978] hover:text-[#fff0ba] cursor-pointer font-serif flex items-center gap-1 transition-colors"
                    >
                      <span>Ver Atributos</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#ffd978]" />
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#ffd978] transition-colors cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {activeTab === 'register' && password.length > 0 && (
                  <div className="mt-2 p-2 rounded bg-[#0b0e14] border border-neutral-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Força da Senha:</span>
                      <span className={`font-bold ${
                        passwordStrength.label === 'Forte'
                          ? 'text-emerald-400'
                          : passwordStrength.label === 'Média'
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.color}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-neutral-800'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-neutral-800'}`} />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-400 pt-0.5">
                      <span className={passwordStrength.hasMinLength ? 'text-emerald-400' : 'text-neutral-500'}>
                        ✓ 6+ dígitos
                      </span>
                      <span className={passwordStrength.hasLetter ? 'text-emerald-400' : 'text-neutral-500'}>
                        ✓ Letras
                      </span>
                      <span className={passwordStrength.hasNumber ? 'text-emerald-400' : 'text-neutral-500'}>
                        ✓ Números
                      </span>
                    </div>
                  </div>
                )}
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#ffd978] transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                    {password === confirmPassword ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Senhas conferem
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Senhas não coincidem
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gold-primary py-3 rounded-lg text-xs font-serif font-bold tracking-wider mt-2 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#140e07]" />
                  <span>Processando com Segurança...</span>
                </>
              ) : activeTab === 'login' ? (
                'Acessar Conta de Jogador'
              ) : activeTab === 'register' ? (
                'Criar Conta no Artemis Realm'
              ) : (
                'Enviar Redefinição por E-mail'
              )}
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
            className="medieval-panel max-w-sm w-full rounded-2xl p-6 border border-[#c99738]/50 shadow-2xl relative max-h-[90vh] overflow-y-auto"
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

      {/* Character Details Modal */}
      <CharacterDetailModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  );
};
