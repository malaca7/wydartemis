import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MedievalDivider } from '../components/common/MedievalDivider';
import {
  User,
  Lock,
  Mail,
  AlertCircle,
  ChevronRight,
  LogOut,
  Shield,
  KeyRound,
  Sparkles,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  Gamepad2,
  Plus,
  Trash2,
  Settings,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateAccountPassword, getActiveLocalSession } from '../services/firebaseService';
import { initialDemoProfile } from '../data/playerData';
import type { DemoPlayerProfile, DemoCharacter, GameAccount, CharacterClass } from '../types';
import { sanitizeText, evaluatePasswordStrength } from '../utils/security';
import { CharacterDetailModal } from '../components/player/CharacterDetailModal';
import { GameAccountModal } from '../components/player/GameAccountModal';
import { GameCharacterModal } from '../components/player/GameCharacterModal';
import {
  getUserGameAccounts,
  createGameAccount,
  updateGameAccount,
  deleteGameAccount,
  addCharacterToGameAccount,
} from '../services/gameAccountService';
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
    refreshProfile,
  } = useAuth();

  const [demoSession, setDemoSession] = useState<DemoPlayerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'error' | 'success'>('error');

  // Gerenciamento de Contas de Jogo e Personagens
  const [gameAccounts, setGameAccounts] = useState<GameAccount[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<DemoCharacter | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<GameAccount | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [targetAccountForChar, setTargetAccountForChar] = useState<GameAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    accountId: string;
    name: string;
  } | null>(null);

  // Alteração de Senha
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [changePassError, setChangePassError] = useState<string | null>(null);
  const [changePassSuccess, setChangePassSuccess] = useState<string | null>(null);
  const [isSubmittingChangePass, setIsSubmittingChangePass] = useState(false);

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const newPasswordStrength = useMemo(() => evaluatePasswordStrength(newPassword), [newPassword]);

  const isUserAuthenticated = Boolean(isAuthenticated || demoSession);
  const isAdmin = isUserAdmin(currentUser, userProfile);

  const activeDisplayName =
    userProfile?.displayName || currentUser?.displayName || demoSession?.displayName || 'Guerreiro_Artemis';
  const activeAccountCode =
    userProfile?.accountCode || demoSession?.accountCode || `ART-${(userProfile?.uid || currentUser?.uid || '2026').slice(0, 6).toUpperCase()}`;

  // Sincroniza contas de jogo a partir do perfil do usuário ou sessão de demonstração
  useEffect(() => {
    if (userProfile) {
      const accs = getUserGameAccounts(userProfile);
      setGameAccounts([...accs]);
    } else if (demoSession) {
      const demoAcc: GameAccount = {
        id: 'ga_demo_01',
        username: 'artemis_demo',
        numericPin: '1234',
        status: 'active',
        createdAt: '25 de Outubro de 2026',
        characters: demoSession.characters || initialDemoProfile.characters,
        notes: 'Conta de jogo demonstrativa com personagens do reino.',
      };
      setGameAccounts([demoAcc]);
    } else {
      setGameAccounts([]);
    }
  }, [userProfile, demoSession]);

  const totalCharactersCount = useMemo(() => {
    return gameAccounts.reduce((sum, ga) => sum + (ga.characters?.length || 0), 0);
  }, [gameAccounts]);

  // Autenticação (Login, Registro, Recuperação)
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
        setFormFeedback('Preencha todos os campos do formulário de cadastro.');
        return;
      }

      if (cleanUsername.length < 3) {
        setFeedbackType('error');
        setFormFeedback('O nome de usuário deve conter no mínimo 3 caracteres.');
        return;
      }

      if (password !== confirmPassword) {
        setFeedbackType('error');
        setFormFeedback('As senhas informadas não coincidem.');
        return;
      }

      if (password.length < 6) {
        setFeedbackType('error');
        setFormFeedback('A senha deve ter no mínimo 6 caracteres.');
        return;
      }

      setIsSubmitting(true);
      try {
        await register(cleanEmail, password, cleanUsername);
        setFeedbackType('success');
        setFormFeedback('Conta criada com sucesso no Artemis Realm!');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Falha ao criar conta';
        setFeedbackType('error');
        setFormFeedback(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (activeTab === 'recovery') {
      const cleanEmail = sanitizeText(email.trim());
      if (!cleanEmail) {
        setFeedbackType('error');
        setFormFeedback('Informe o e-mail cadastrado para recuperação.');
        return;
      }
      setIsSubmitting(true);
      try {
        await resetPassword(cleanEmail);
        setFeedbackType('success');
        setFormFeedback('Instruções de redefinição enviadas para o seu e-mail!');
        setEmail('');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Falha ao solicitar recuperação';
        setFeedbackType('error');
        setFormFeedback(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignora falha de rede ao deslogar
    }
    setDemoSession(null);
    setGameAccounts([]);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setFormFeedback(null);
  };

  // Alteração de Senha Mestre
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError(null);
    setChangePassSuccess(null);

    const cleanNew = newPassword.trim();
    const cleanOld = oldPassword.trim();

    if (!cleanOld) {
      setChangePassError('Por favor, informe sua senha atual.');
      return;
    }

    if (!cleanNew || cleanNew.length < 6) {
      setChangePassError('A nova senha deve possuir ao menos 6 caracteres.');
      return;
    }

    if (cleanNew !== confirmNewPassword.trim()) {
      setChangePassError('A confirmação não coincide com a nova senha.');
      return;
    }

    setIsSubmittingChangePass(true);
    try {
      await updateAccountPassword(cleanNew, cleanOld, userProfile);
      setChangePassSuccess('Senha alterada com sucesso!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
        setChangePassSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Não foi possível alterar a senha.';
      setChangePassError(errorMsg);
    } finally {
      setIsSubmittingChangePass(false);
    }
  };

  // Gerenciamento de Contas de Jogo
  const handleSaveGameAccount = async (data: {
    username: string;
    password?: string;
    numericPin?: string;
    notes?: string;
  }) => {
    // 1. Sessão demonstrativa
    if (demoSession) {
      if (accountToEdit) {
        const updated = gameAccounts.map((ga) =>
          ga.id === accountToEdit.id
            ? {
                ...ga,
                password: data.password !== undefined ? data.password : ga.password,
                numericPin: data.numericPin || ga.numericPin || '1234',
                notes: data.notes !== undefined ? data.notes : ga.notes,
              }
            : ga
        );
        setGameAccounts(updated);
        setDemoSession({
          ...demoSession,
          gameAccounts: updated,
        });
      } else {
        const newAcc: GameAccount = {
          id: `ga_demo_${Date.now()}`,
          username: data.username,
          password: data.password,
          numericPin: data.numericPin || '1234',
          status: 'active',
          createdAt: new Date().toLocaleDateString('pt-BR'),
          characters: [],
          notes: data.notes,
        };
        const updated = [...gameAccounts, newAcc];
        setGameAccounts(updated);
        setDemoSession({
          ...demoSession,
          gameAccounts: updated,
        });
      }
      return;
    }

    // 2. Usuário Autenticado
    const activeUser = userProfile || getActiveLocalSession();
    if (!activeUser) {
      throw new Error('Sessão de usuário não encontrada. Por favor, conecte-se novamente.');
    }

    if (accountToEdit) {
      const updatedUser = await updateGameAccount(activeUser, accountToEdit.id, {
        password: data.password,
        numericPin: data.numericPin,
        notes: data.notes,
      });
      setGameAccounts([...(updatedUser.gameAccounts || [])]);
      if (refreshProfile) {
        try {
          await refreshProfile();
        } catch {
          // ignora falha local de refresh
        }
      }
    } else {
      const res = await createGameAccount(activeUser, data);
      setGameAccounts([...(res.updatedUser.gameAccounts || [])]);
      if (refreshProfile) {
        try {
          await refreshProfile();
        } catch {
          // ignora falha local de refresh
        }
      }
    }
  };

  // Criação de Personagem inicial na Conta de Jogo
  const handleSaveCharacter = async (data: {
    name: string;
    characterClass: CharacterClass;
    level: number;
    stage: 'Mortal' | 'Arch' | 'Celestial' | 'Sub-Celestial';
  }) => {
    if (!targetAccountForChar) return;

    if (demoSession) {
      const newChar: DemoCharacter = {
        id: `char_${Date.now()}`,
        name: data.name,
        characterClass: data.characterClass,
        level: data.level,
        stage: data.stage,
      };
      const updatedAccounts = gameAccounts.map((ga) => {
        if (ga.id === targetAccountForChar.id) {
          return {
            ...ga,
            characters: [...ga.characters, newChar],
          };
        }
        return ga;
      });
      setGameAccounts(updatedAccounts);
      return;
    }

    const activeUser = userProfile || getActiveLocalSession();
    if (!activeUser) return;

    const res = await addCharacterToGameAccount(
      activeUser,
      targetAccountForChar.id,
      data
    );
    setGameAccounts([...(res.updatedUser.gameAccounts || [])]);
    if (refreshProfile) {
      try {
        await refreshProfile();
      } catch {
        // ignora erro de rede
      }
    }
  };

  // Exclusão de Conta de Jogo
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (demoSession) {
        setGameAccounts(gameAccounts.filter((ga) => ga.id !== deleteConfirm.accountId));
      } else {
        const activeUser = userProfile || getActiveLocalSession();
        if (activeUser) {
          const updatedUser = await deleteGameAccount(activeUser, deleteConfirm.accountId);
          setGameAccounts([...(updatedUser.gameAccounts || [])]);
          if (refreshProfile) {
            try {
              await refreshProfile();
            } catch {
              // ignora erro
            }
          }
        }
      }
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na exclusão da conta de jogo.';
      alert(msg);
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
            ? 'Gerencie suas contas de jogo do Artemis Realm, configure personagens vinculados a cada conta e mantenha sua segurança atualizada.'
            : 'Acesse sua conta ou cadastre-se para iniciar sua jornada com segurança no Artemis Realm.'}
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Status da Sessão */}
      <div className="mb-8 p-4 rounded-xl bg-[#0e121a] border border-[#c99738]/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#c99738]" />
          <p className="text-[#c5bcab]">
            <strong className="text-[#ffd978]">Segurança Artemis:</strong> Autenticação protegida via Firebase Auth e perfis com suporte a múltiplas contas de jogo.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono text-emerald-300">
            {currentUser?.email || userProfile?.email ? `Conectado: ${currentUser?.email || userProfile?.email}` : 'Pronto para Conexão'}
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

      {/* Visão Autenticada */}
      {isUserAuthenticated ? (
        <div className="space-y-8">
          {/* Barra de Visão Geral da Conta Mestre */}
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

              {/* Botões de Ação do Usuário - NOTA: Gerenciar Slides APENAS para Administradores */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                {isAdmin && (
                  <Link
                    to="/admin/slides"
                    className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md btn-gold-primary font-bold shadow-[0_0_14px_rgba(201,151,56,0.35)]"
                    title="Acessar painel administrativo do servidor"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Painel Admin</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setChangePassError(null);
                    setChangePassSuccess(null);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setIsChangePasswordModalOpen(true);
                  }}
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

            {/* Resumo Rápido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              <div className="p-3.5 rounded-xl bg-[#0f131c] border border-neutral-800">
                <span className="text-[11px] text-[#8c8475] uppercase block">Contas de Jogo</span>
                <span className="text-xl font-serif font-bold text-[#ffd978]">
                  {gameAccounts.length} / 5 Contas
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0f131c] border border-neutral-800">
                <span className="text-[11px] text-[#8c8475] uppercase block">Total de Personagens</span>
                <span className="text-xl font-serif font-bold text-[#f5efe2]">
                  {totalCharactersCount} Guerreiros
                </span>
              </div>
              <div className={`p-3.5 rounded-xl ${isAdmin ? 'bg-[#18140c] border border-[#ffd978]/40 shadow-[0_0_12px_rgba(255,217,120,0.12)]' : 'bg-[#0f131c] border border-neutral-800'}`}>
                <span className="text-[11px] text-[#8c8475] uppercase block">Cargo / Nível de Acesso</span>
                <span className={`text-sm font-serif font-bold flex items-center gap-1.5 mt-1 ${isAdmin ? 'text-[#ffd978]' : 'text-[#f5efe2]'}`}>
                  <Shield className={`w-3.5 h-3.5 ${isAdmin ? 'text-[#ffd978]' : 'text-neutral-400'}`} />
                  {isAdmin ? 'Administrador Geral' : 'Guerreiro Artemis'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0f131c] border border-neutral-800">
                <span className="text-[11px] text-[#8c8475] uppercase block">Data de Ingresso</span>
                <span className="text-sm font-mono text-[#f5efe2] block mt-1">
                  {userProfile?.createdAt || '25 de Outubro de 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Banner de Administrador (visível apenas para MALACA e administradores autorizados) */}
          {isAdmin && (
            <div className="medieval-panel rounded-2xl p-6 border border-[#ffd978]/50 bg-gradient-to-r from-[#17140b] via-[#0f131d] to-[#17140b] shadow-[0_4px_24px_rgba(201,151,56,0.18)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-[#ffd978]/20 border border-[#ffd978]/40 text-[#ffd978]">
                      <Shield className="w-4 h-4" />
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[#ffd978]">
                      Acesso Restrito: Painel de Administração
                    </h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                      Mestre Supremo
                    </span>
                  </div>
                  <p className="text-xs text-[#d6cebe] leading-relaxed">
                    Você está autenticado como Administrador. O gerenciamento de banners/slides, auditoria de acessos e configurações do servidor ficam centralizados no Painel Administrativo.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    to="/admin/slides"
                    className="btn-gold-primary px-4 py-2.5 rounded-xl text-xs font-serif font-bold flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Abrir Painel Admin</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GERENCIAMENTO DE CONTAS DE JOGO (SUB-CONTAS) E PERSONAGENS INTERNOS       */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-[#ffd978]" />
                  <h3 className="font-serif font-bold text-2xl text-[#f5efe2]">
                    Contas do Jogo (Artemis Realm)
                  </h3>
                </div>
                <p className="text-xs text-[#9c9484] mt-0.5">
                  Gerencie seus logins de acesso ao cliente de jogo. A evolução, troca de classe e exclusão de personagens ocorrem exclusivamente dentro do jogo.
                </p>
              </div>

              <button
                onClick={() => {
                  setAccountToEdit(null);
                  setIsAccountModalOpen(true);
                }}
                disabled={gameAccounts.length >= 5}
                className="btn-gold-primary px-4 py-2.5 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Conta de Jogo</span>
              </button>
            </div>

            {gameAccounts.length === 0 ? (
              <div className="medieval-panel rounded-2xl p-10 text-center border border-dashed border-neutral-800">
                <Gamepad2 className="w-10 h-10 text-neutral-500 mx-auto mb-3" />
                <h4 className="font-serif font-bold text-base text-[#f5efe2] mb-1">
                  Nenhuma conta de jogo cadastrada
                </h4>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mb-5">
                  Crie sua primeira conta de jogo para poder conectar-se ao servidor Artemis e criar seus guerreiros.
                </p>
                <button
                  onClick={() => {
                    setAccountToEdit(null);
                    setIsAccountModalOpen(true);
                  }}
                  className="btn-gold-primary px-4 py-2 rounded-lg text-xs font-serif font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Minha Primeira Conta</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {gameAccounts.map((account, accIdx) => {
                  const characters = account.characters || [];
                  const isAccountFull = characters.length >= 4;

                  return (
                    <div
                      key={account.id}
                      className="medieval-panel rounded-2xl p-6 sm:p-7 border border-[#c99738]/40 shadow-xl relative overflow-hidden"
                    >
                      {/* Topo do Card da Conta de Jogo */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#141924] border border-[#c99738]/40 flex items-center justify-center text-[#ffd978] shadow">
                            <Gamepad2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-mono text-[#8c8475] uppercase">
                                Conta #{accIdx + 1}:
                              </span>
                              <h4 className="font-serif font-bold text-xl text-[#ffd978] font-mono">
                                {account.username}
                              </h4>
                              <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                                {account.status === 'active' ? 'Ativa no Servidor' : account.status}
                              </span>
                              {/* PIN de 4 Dígitos */}
                              <span
                                className="text-[10px] font-mono text-neutral-300 bg-neutral-900 px-2.5 py-0.5 rounded border border-neutral-800 flex items-center gap-1"
                                title="Sub-senha numérica de 4 dígitos utilizada no jogo"
                              >
                                <KeyRound className="w-3 h-3 text-[#ffd978]" />
                                <span>PIN: <strong className="text-[#ffd978]">{account.numericPin ? String(account.numericPin).slice(0, 4) : '1234'}</strong></span>
                              </span>
                            </div>
                            <p className="text-[11px] text-[#9c9484] mt-0.5">
                              {account.notes || 'Conta de jogo padrão'} • Criada em {account.createdAt}
                            </p>
                          </div>
                        </div>

                        {/* Ações da Conta de Jogo */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setTargetAccountForChar(account);
                              setIsCharacterModalOpen(true);
                            }}
                            disabled={isAccountFull}
                            className="btn-gold-primary px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isAccountFull ? 'Limite de 4 personagens atingido nesta conta' : 'Criar personagem nesta conta'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Novo Personagem</span>
                          </button>

                          <button
                            onClick={() => {
                              setAccountToEdit(account);
                              setIsAccountModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Editar senha, PIN de 4 dígitos ou anotações da conta"
                          >
                            <Settings className="w-4 h-4 text-[#ffd978]" />
                            <span className="hidden sm:inline">Configurações</span>
                          </button>

                          <button
                            onClick={() => {
                              setDeleteConfirm({
                                accountId: account.id,
                                name: account.username,
                              });
                            }}
                            className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/40 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Apagar conta de jogo e seus personagens"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Excluir Conta</span>
                          </button>
                        </div>
                      </div>

                      {/* Grade de 4 Slots de Personagens no WYD */}
                      <div className="pt-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#ffd978]" />
                            <span>Slots de Personagens da Conta ({characters.length}/4)</span>
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            {4 - characters.length} {4 - characters.length === 1 ? 'slot livre' : 'slots livres'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                          {[0, 1, 2, 3].map((slotIdx) => {
                            const char = characters[slotIdx];

                            if (char) {
                              const isTk = char.characterClass === 'TransKnight';
                              const isFm = char.characterClass === 'Foema';
                              const isBm = char.characterClass === 'BeastMaster';

                              const badgeColor = isTk
                                ? 'text-amber-300 bg-amber-950/60 border-amber-800/40'
                                : isFm
                                ? 'text-blue-300 bg-blue-950/60 border-blue-800/40'
                                : isBm
                                ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800/40'
                                : 'text-purple-300 bg-purple-950/60 border-purple-800/40';

                              return (
                                <div
                                  key={char.id}
                                  className="p-4 rounded-xl bg-[#121620] border border-neutral-800 hover:border-[#c99738]/50 transition-all flex flex-col justify-between space-y-3 relative group"
                                >
                                  <div>
                                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeColor}`}>
                                        {char.stage || 'Mortal'}
                                      </span>
                                      <span className="font-mono text-[#ffd978] font-bold">
                                        Nv. {char.level}
                                      </span>
                                    </div>

                                    <h5 className="font-serif font-bold text-base text-[#f5efe2] truncate">
                                      {char.name}
                                    </h5>
                                    <p className="text-xs text-[#c99738] font-medium">
                                      {char.characterClass}
                                    </p>
                                  </div>

                                  {/* Rodapé do Personagem: apenas Ver Atributos, edição/exclusão exclusivamente in-game */}
                                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                                    <button
                                      onClick={() => setSelectedCharacter(char)}
                                      className="text-[11px] text-[#ffd978] hover:text-white cursor-pointer font-serif flex items-center gap-1 transition-colors"
                                      title="Ver atributos e estatísticas de combate"
                                    >
                                      <span>Ver Atributos</span>
                                      <ChevronRight className="w-3 h-3 text-[#ffd978]" />
                                    </button>

                                    <span
                                      className="text-[10px] text-neutral-500 font-sans italic"
                                      title="Evolução, reset e exclusão de personagem são realizados exclusivamente dentro do jogo"
                                    >
                                      No Jogo
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            // Slot Vazio
                            return (
                              <button
                                key={`empty_${account.id}_${slotIdx}`}
                                onClick={() => {
                                  setTargetAccountForChar(account);
                                  setIsCharacterModalOpen(true);
                                }}
                                className="p-4 rounded-xl border border-dashed border-neutral-800 hover:border-[#c99738]/60 bg-[#0f131c]/50 hover:bg-[#141924]/50 transition-all flex flex-col items-center justify-center text-center space-y-2 min-h-[130px] cursor-pointer group"
                              >
                                <div className="w-8 h-8 rounded-full bg-neutral-900 group-hover:bg-[#ffd978]/15 border border-neutral-800 group-hover:border-[#c99738]/40 flex items-center justify-center text-neutral-500 group-hover:text-[#ffd978] transition-colors">
                                  <Plus className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-xs font-serif font-bold text-neutral-400 group-hover:text-[#f5efe2] block">
                                    Slot #{slotIdx + 1} Vazio
                                  </span>
                                  <span className="text-[10px] text-neutral-500 block">
                                    Clique para criar
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Formulário de Acesso e Cadastro (Não Autenticado) */
        <div className="medieval-panel max-w-md mx-auto rounded-2xl p-6 sm:p-8 border border-[#c99738]/40 shadow-2xl">
          <div className="flex border-b border-neutral-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setFormFeedback(null);
              }}
              className={`flex-1 pb-3 text-xs font-serif font-bold tracking-wider cursor-pointer border-b-2 transition-colors ${
                activeTab === 'login'
                  ? 'border-[#ffd978] text-[#ffd978]'
                  : 'border-transparent text-[#9c9484] hover:text-[#d6cebe]'
              }`}
            >
              Conectar
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setFormFeedback(null);
              }}
              className={`flex-1 pb-3 text-xs font-serif font-bold tracking-wider cursor-pointer border-b-2 transition-colors ${
                activeTab === 'register'
                  ? 'border-[#ffd978] text-[#ffd978]'
                  : 'border-transparent text-[#9c9484] hover:text-[#d6cebe]'
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('recovery');
                setFormFeedback(null);
              }}
              className={`flex-1 pb-3 text-xs font-serif font-bold tracking-wider cursor-pointer border-b-2 transition-colors ${
                activeTab === 'recovery'
                  ? 'border-[#ffd978] text-[#ffd978]'
                  : 'border-transparent text-[#9c9484] hover:text-[#d6cebe]'
              }`}
            >
              Recuperar
            </button>
          </div>

          {formFeedback && (
            <div
              className={`p-3.5 rounded-lg mb-6 text-xs flex items-center gap-2 border ${
                feedbackType === 'error'
                  ? 'bg-red-950/40 text-red-200 border-red-800/50'
                  : 'bg-emerald-950/40 text-emerald-200 border-emerald-800/50'
              }`}
            >
              {feedbackType === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              )}
              <span>{formFeedback}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {activeTab !== 'recovery' && (
              <div>
                <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                  {activeTab === 'login' ? 'E-mail ou Usuário *' : 'Nome de Usuário *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={activeTab === 'login' ? 'seu_usuario ou email' : 'ex: guerreiro_artemis'}
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

      {/* ========================================================================= */}
      {/* MODAL DE ALTERAÇÃO DE SENHA MESTRE (CORRIGIDO E APRIMORADO)              */}
      {/* ========================================================================= */}
      {isChangePasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsChangePasswordModalOpen(false)}
        >
          <div
            className="medieval-panel max-w-md w-full rounded-2xl p-6 border border-[#c99738]/50 shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#ffd978]/10 border border-[#c99738]/40 text-[#ffd978]">
                  <KeyRound className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#f5efe2]">
                    Alterar Senha da Conta
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Atualize sua senha mestre de acesso ao Artemis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {changePassError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{changePassError}</span>
              </div>
            )}

            {changePassSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{changePassSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                  Senha Atual *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#ffd978] transition-colors cursor-pointer"
                    title={showOldPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                  Nova Senha (Mínimo 6 caracteres) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#ffd978] transition-colors cursor-pointer"
                    title={showNewPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword.length > 0 && (
                  <div className="mt-2 p-2 rounded bg-[#0b0e14] border border-neutral-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400">Força da Nova Senha:</span>
                      <span className={`font-bold ${
                        newPasswordStrength.label === 'Forte'
                          ? 'text-emerald-400'
                          : newPasswordStrength.label === 'Média'
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}>
                        {newPasswordStrength.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${newPasswordStrength.color}`} />
                      <div className={`h-full flex-1 rounded-full ${newPasswordStrength.score >= 1 ? newPasswordStrength.color : 'bg-neutral-800'}`} />
                      <div className={`h-full flex-1 rounded-full ${newPasswordStrength.score >= 2 ? newPasswordStrength.color : 'bg-neutral-800'}`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#ffd978] transition-colors cursor-pointer"
                    title={showConfirmNewPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmNewPassword.length > 0 && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                    {newPassword === confirmNewPassword ? (
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

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  disabled={isSubmittingChangePass}
                  className="px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingChangePass}
                  className="btn-gold-primary px-5 py-2.5 rounded-lg text-xs font-serif font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmittingChangePass ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#140e07]" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    'Confirmar Alteração'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criar/Editar Conta de Jogo */}
      <GameAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accountToEdit={accountToEdit}
        onSave={handleSaveGameAccount}
      />

      {/* Modal de Criar Personagem Inicial na Conta de Jogo */}
      <GameCharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => {
          setIsCharacterModalOpen(false);
          setTargetAccountForChar(null);
        }}
        targetAccount={targetAccountForChar}
        onSave={handleSaveCharacter}
      />

      {/* Modal de Confirmação de Exclusão de Conta de Jogo */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="medieval-panel max-w-sm w-full rounded-2xl p-6 border border-red-800/60 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <span className="p-2 rounded-xl bg-red-950/60 border border-red-800/40">
                <Trash2 className="w-5 h-5 text-red-400" />
              </span>
              <div>
                <h4 className="font-serif font-bold text-base text-[#f5efe2]">
                  Excluir Conta de Jogo
                </h4>
                <p className="text-[11px] text-neutral-400">Ação irreversível no servidor</p>
              </div>
            </div>
            <p className="text-xs text-[#d6cebe] mb-4 leading-relaxed">
              Tem certeza que deseja apagar a conta de jogo <strong className="text-red-300 font-mono">{deleteConfirm.name}</strong> e todos os personagens vinculados a ela?
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-900 hover:bg-red-800 text-white text-xs font-serif font-bold cursor-pointer transition-colors shadow-md"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes de Atributos do Personagem */}
      <CharacterDetailModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  );
};
