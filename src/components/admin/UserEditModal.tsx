import React, { useState } from 'react';
import {
  X,
  User,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { StoredAdminAccountDoc } from '../../services/adminUserService';
import type { DemoCharacter, CharacterClass } from '../../types';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Partial<StoredAdminAccountDoc> & { email: string; displayName: string }, password?: string) => Promise<void>;
  initialAccount?: StoredAdminAccountDoc | null;
}

const CLASS_OPTIONS: { value: CharacterClass; label: string }[] = [
  { value: 'TransKnight', label: 'TransKnight (Guerreiro Sagrado)' },
  { value: 'Foema', label: 'Foema (Maga Arcana)' },
  { value: 'BeastMaster', label: 'BeastMaster (Evocador da Natureza)' },
  { value: 'Huntress', label: 'Huntress (Arqueira Sentinela)' },
];

const STAGE_OPTIONS = ['Mortal', 'Arch', 'Celestial', 'Sub-Celestial'];

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAccount,
}) => {
  const isEditing = Boolean(initialAccount);

  const [displayName, setDisplayName] = useState(initialAccount?.displayName || '');
  const [email, setEmail] = useState(initialAccount?.email || '');
  const [accountCode, setAccountCode] = useState(initialAccount?.accountCode || '');
  const [role, setRole] = useState<'admin' | 'player' | 'gamemaster'>(initialAccount?.role || 'player');
  const [status, setStatus] = useState<'active' | 'suspended' | 'vip'>(initialAccount?.status || 'active');
  const [notes, setNotes] = useState(initialAccount?.notes || '');
  const [password, setPassword] = useState('');
  const [characters, setCharacters] = useState<DemoCharacter[]>(
    initialAccount?.characters && initialAccount.characters.length > 0
      ? initialAccount.characters
      : [
          {
            id: `char-new-${Date.now()}-1`,
            name: `${initialAccount?.displayName || 'Hero'}_TK`,
            characterClass: 'TransKnight',
            level: 1,
            stage: 'Mortal',
          },
        ]
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Se for o admin mestre MALACA, desativa a alteração de papel para evitar auto-bloqueio
  const isProtectedAdmin =
    initialAccount?.email.toLowerCase() === 'malaca7x@gmail.com' ||
    initialAccount?.displayName.toLowerCase() === 'malaca';

  const handleAddCharacter = () => {
    if (characters.length >= 4) {
      setErrorMessage('Limite máximo de 4 personagens por conta atingido.');
      return;
    }
    const newChar: DemoCharacter = {
      id: `char-${Date.now()}-${characters.length + 1}`,
      name: `${displayName || 'Hero'}_${characters.length + 1}`,
      characterClass: 'TransKnight',
      level: 1,
      stage: 'Mortal',
    };
    setCharacters([...characters, newChar]);
  };

  const handleRemoveCharacter = (id: string) => {
    if (characters.length <= 1) {
      setErrorMessage('A conta deve possuir ao menos 1 personagem vinculado.');
      return;
    }
    setCharacters(characters.filter((c) => c.id !== id));
  };

  const handleCharacterChange = (id: string, field: keyof DemoCharacter, value: unknown) => {
    setCharacters(
      characters.map((char) => {
        if (char.id === id) {
          return { ...char, [field]: value };
        }
        return char;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = displayName.trim();
    const cleanMail = email.trim();

    if (!cleanName || cleanName.length < 3) {
      setErrorMessage('O nome de usuário deve conter no mínimo 3 caracteres.');
      return;
    }
    if (!cleanMail || !cleanMail.includes('@') || !cleanMail.includes('.')) {
      setErrorMessage('Insira um formato de e-mail válido.');
      return;
    }
    if (!isEditing && (!password.trim() || password.trim().length < 6)) {
      setErrorMessage('Para novas contas, a senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(
        {
          uid: initialAccount?.uid,
          displayName: cleanName,
          email: cleanMail,
          accountCode: accountCode.trim() || `ART-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          role: isProtectedAdmin ? 'admin' : role,
          status,
          notes: notes.trim(),
          characters,
          createdAt: initialAccount?.createdAt || '25 de Outubro de 2026',
        },
        password.trim() || undefined
      );
      onClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha ao salvar conta.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="medieval-panel rounded-2xl w-full max-w-2xl border-2 border-[#c99738]/50 shadow-2xl p-6 sm:p-8 my-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#141924] border border-[#c99738]/40 flex items-center justify-center text-[#ffd978]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-[#f5ebd6]">
                {isEditing ? `Gerenciar Conta: ${initialAccount?.displayName}` : 'Criar Nova Conta no Artemis'}
              </h2>
              <p className="text-xs text-[#9d9484]">
                Configure cargos, permissões, dados cadastrais e personagens vinculados.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 mb-5 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Dados Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#b8b09f] block mb-1">
                Nome de Usuário (Login)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: MALACA, SirGalahad..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121622] border border-neutral-700 text-sm text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#b8b09f] block mb-1">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@artemis.realm"
                  disabled={isProtectedAdmin}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#121622] border border-neutral-700 text-sm text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none ${
                    isProtectedAdmin ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Cargo, Status e Código */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#ffd978] block mb-1">
                Cargo / Permissão
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'player' | 'gamemaster')}
                disabled={isProtectedAdmin}
                className="w-full px-3 py-2.5 rounded-xl bg-[#121622] border border-[#c99738]/50 text-xs text-[#ffd978] font-semibold focus:border-[#ffd978] focus:outline-none"
              >
                <option value="player">🛡️ Jogador (Comum)</option>
                <option value="gamemaster">⚔️ Game Master (GM)</option>
                <option value="admin">👑 Administrador (Acesso Total)</option>
              </select>
              {isProtectedAdmin && (
                <span className="text-[10px] text-amber-400 block mt-1">
                  Conta mestre protegida.
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#b8b09f] block mb-1">
                Status da Conta
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'suspended' | 'vip')}
                className="w-full px-3 py-2.5 rounded-xl bg-[#121622] border border-neutral-700 text-xs text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none"
              >
                <option value="active">✅ Ativo (Acesso Liberado)</option>
                <option value="vip">⭐ VIP (Apoiador do Reino)</option>
                <option value="suspended">⛔ Suspenso / Bloqueado</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#b8b09f] block mb-1">
                Código de Registro
              </label>
              <input
                type="text"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                placeholder="Ex: ART-2026-1234"
                className="w-full px-3 py-2.5 rounded-xl bg-[#121622] border border-neutral-700 text-xs text-[#f5ebd6] font-mono focus:border-[#ffd978] focus:outline-none"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="text-xs font-semibold text-[#b8b09f] block mb-1">
              {isEditing ? 'Redefinir Senha (deixe em branco para manter a atual)' : 'Definir Senha Inicial'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? 'Nova senha (opcional)...' : 'Mínimo 6 caracteres...'}
                className="w-full px-3.5 py-2 rounded-xl bg-[#121622] border border-neutral-700 text-sm text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none"
              />
            </div>
          </div>

          {/* Personagens Vinculados */}
          <div className="pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#ffd978]" />
                <h4 className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider">
                  Personagens Vinculados ({characters.length}/4)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddCharacter}
                className="btn-medieval-secondary px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#ffd978]" />
                <span>Adicionar Personagem</span>
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {characters.map((char, index) => (
                <div
                  key={char.id}
                  className="p-3 rounded-xl bg-[#0f131c] border border-neutral-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <div className="sm:col-span-4">
                    <span className="text-[10px] text-neutral-500 block">Nome do Char #{index + 1}</span>
                    <input
                      type="text"
                      value={char.name}
                      onChange={(e) => handleCharacterChange(char.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 rounded bg-[#161b26] border border-neutral-700 text-xs text-[#f5ebd6]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <span className="text-[10px] text-neutral-500 block">Classe</span>
                    <select
                      value={char.characterClass}
                      onChange={(e) => handleCharacterChange(char.id, 'characterClass', e.target.value as CharacterClass)}
                      className="w-full px-2 py-1 rounded bg-[#161b26] border border-neutral-700 text-xs text-[#f5ebd6]"
                    >
                      {CLASS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label.split(' ')[0]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-neutral-500 block">Nível</span>
                    <input
                      type="number"
                      min={1}
                      max={400}
                      value={char.level}
                      onChange={(e) => handleCharacterChange(char.id, 'level', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-[#161b26] border border-neutral-700 text-xs text-[#ffd978] font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between gap-1 pt-3 sm:pt-0">
                    <div className="flex-1">
                      <span className="text-[10px] text-neutral-500 block">Evolução</span>
                      <select
                        value={char.stage}
                        onChange={(e) => handleCharacterChange(char.id, 'stage', e.target.value)}
                        className="w-full px-1.5 py-1 rounded bg-[#161b26] border border-neutral-700 text-[11px] text-[#f5ebd6]"
                      >
                        {STAGE_OPTIONS.map((stg) => (
                          <option key={stg} value={stg}>
                            {stg}
                          </option>
                        ))}
                      </select>
                    </div>
                    {characters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCharacter(char.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-950/40 mt-3 sm:mt-0 transition-colors"
                        title="Remover personagem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observações Administrativas */}
          <div>
            <label className="text-xs font-semibold text-[#b8b09f] block mb-1">
              Notas do Administrador (Interno)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Apoiador de testes, moderador de guilda..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#121622] border border-neutral-700 text-xs text-[#d6cebe] focus:border-[#ffd978] focus:outline-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 text-xs font-serif text-[#d6cebe] hover:bg-neutral-800 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-gold-primary px-6 py-2.5 rounded-xl text-xs font-serif font-bold flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSaving ? 'Gravando...' : isEditing ? 'Salvar Alterações' : 'Criar Conta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
