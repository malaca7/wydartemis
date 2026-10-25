import React, { useState, useEffect } from 'react';
import {
  X,
  Gamepad2,
  Lock,
  KeyRound,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { GameAccount } from '../../types';
import {
  validateGameAccountPin,
  validateGameAccountUsername,
} from '../../utils/gameAccountRules';

interface GameAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    username: string;
    password?: string;
    numericPin?: string;
    notes?: string;
  }) => Promise<void>;
  accountToEdit?: GameAccount | null;
}

export const GameAccountModal: React.FC<GameAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accountToEdit,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [numericPin, setNumericPin] = useState('1234');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isEditMode = Boolean(accountToEdit);

  useEffect(() => {
    if (accountToEdit) {
      setUsername(accountToEdit.username);
      setPassword(accountToEdit.password || '');
      setNumericPin(accountToEdit.numericPin ? String(accountToEdit.numericPin).slice(0, 4) : '1234');
      setNotes(accountToEdit.notes || '');
    } else {
      setUsername('');
      setPassword('');
      setNumericPin('1234');
      setNotes('');
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowPassword(false);
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validações de usuário caso seja criação
    if (!isEditMode) {
      const userVal = validateGameAccountUsername(username);
      if (!userVal.valid) {
        setErrorMsg(userVal.error || 'O login da conta de jogo deve conter entre 4 e 16 caracteres.');
        return;
      }
    }

    // Validação estrita de PIN com 4 dígitos numéricos
    const cleanPin = numericPin.trim();
    const pinVal = validateGameAccountPin(cleanPin);
    if (!pinVal.valid) {
      setErrorMsg(pinVal.error || 'A sub-senha (PIN) deve conter exatamente 4 dígitos numéricos (apenas números).');
      return;
    }

    if (password && password.trim().length > 0 && password.trim().length < 4) {
      setErrorMsg('A senha da conta de jogo deve possuir ao menos 4 dígitos.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        username: username.trim().toLowerCase(),
        password: password.trim() ? password.trim() : undefined,
        numericPin: cleanPin,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      setSuccessMsg(
        isEditMode
          ? 'Conta de jogo atualizada com sucesso!'
          : 'Conta de jogo criada com sucesso no reino Artemis!'
      );

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar conta de jogo.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="medieval-panel max-w-md w-full rounded-2xl p-6 border border-[#c99738]/50 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#ffd978]/10 border border-[#c99738]/40 text-[#ffd978]">
              <Gamepad2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#f5efe2]">
                {isEditMode ? 'Editar Conta de Jogo' : 'Criar Nova Conta de Jogo'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {isEditMode
                  ? `Configurações de ${accountToEdit?.username}`
                  : 'Acesso direto ao cliente de jogo Artemis'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
              Login do Jogo (Username) *
            </label>
            <div className="relative">
              <Gamepad2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                required
                disabled={isEditMode}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: guerreiro_01"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] ${
                  isEditMode ? 'opacity-60 cursor-not-allowed bg-neutral-900' : ''
                }`}
              />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              {isEditMode
                ? 'O login não pode ser alterado após a criação.'
                : 'Entre 4 e 16 caracteres alfanuméricos (letras minúsculas e números).'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
              {isEditMode ? 'Nova Senha do Jogo (Opcional)' : 'Senha do Jogo *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required={!isEditMode}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditMode ? 'Deixe em branco para manter a atual' : '••••••••'}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738]"
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
            <p className="text-[10px] text-neutral-400 mt-1">
              Senha utilizada para autenticar no cliente de jogo (mínimo 4 caracteres).
            </p>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Sub-senha Numérica (PIN de 4 Dígitos) *</span>
              <span className="text-[10px] text-[#ffd978] font-mono lowercase">apenas 4 números</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                maxLength={4}
                value={numericPin}
                onChange={(e) => setNumericPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-sm font-mono text-[#ffd978] tracking-widest focus:outline-none focus:border-[#c99738]"
              />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              Sub-senha de exatamente 4 dígitos numéricos para destrancar baús e operações no jogo.
            </p>
          </div>

          <div>
            <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
              Notas / Descrição (Opcional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="ex: Conta principal para Foema Buff e TransKnight"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold-primary px-5 py-2.5 rounded-lg text-xs font-serif font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#140e07]" />
                  <span>Salvando...</span>
                </>
              ) : isEditMode ? (
                'Salvar Alterações'
              ) : (
                'Criar Conta de Jogo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
