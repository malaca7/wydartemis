import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Mail,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  Clock,
  RefreshCw,
  Lock,
} from 'lucide-react';
import {
  getAuthorizedAdminEmails,
  addAuthorizedAdminEmail,
  removeAuthorizedAdminEmail,
  getMasterPasskey,
  setMasterPasskey,
  getAuditLogs,
  clearAuditLogs,
  type SecurityAuditLogEntry,
} from '../../utils/adminAuth';

interface AccessManagementTabProps {
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export const AccessManagementTab: React.FC<AccessManagementTabProps> = ({ onNotify }) => {
  const [adminEmails, setAdminEmails] = useState<string[]>(() => getAuthorizedAdminEmails());
  const [newEmailInput, setNewEmailInput] = useState('');

  const [currentPasskey, setCurrentPasskey] = useState(() => getMasterPasskey());
  const [newPasskeyInput, setNewPasskeyInput] = useState('');
  const [isChangingPasskey, setIsChangingPasskey] = useState(false);

  const [auditLogs, setAuditLogs] = useState<SecurityAuditLogEntry[]>(() => getAuditLogs());

  const handleAddAdminEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmailInput.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      onNotify('Informe um endereço de e-mail válido.', 'error');
      return;
    }

    if (adminEmails.includes(clean)) {
      onNotify('Este e-mail já possui autorização administrativa.', 'error');
      return;
    }

    try {
      addAuthorizedAdminEmail(clean);
      setAdminEmails(getAuthorizedAdminEmails());
      setAuditLogs(getAuditLogs());
      setNewEmailInput('');
      onNotify(`E-mail ${clean} adicionado à lista oficial de administradores!`, 'success');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Falha ao autorizar e-mail.', 'error');
    }
  };

  const handleRemoveAdminEmail = (emailToRemove: string) => {
    try {
      removeAuthorizedAdminEmail(emailToRemove);
      setAdminEmails(getAuthorizedAdminEmails());
      setAuditLogs(getAuditLogs());
      onNotify(`Privilégios de ${emailToRemove} foram revogados com sucesso.`, 'success');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Erro ao remover administrador.', 'error');
    }
  };

  const handleUpdatePasskey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPasskeyInput.trim();
    if (clean.length < 6) {
      onNotify('A nova chave mestra deve conter ao menos 6 caracteres.', 'error');
      return;
    }

    try {
      setMasterPasskey(clean);
      setCurrentPasskey(clean);
      setNewPasskeyInput('');
      setIsChangingPasskey(false);
      setAuditLogs(getAuditLogs());
      onNotify('Chave mestra de administração atualizada com sucesso!', 'success');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Falha ao atualizar passkey.', 'error');
    }
  };

  const handleClearLogs = () => {
    clearAuditLogs();
    setAuditLogs(getAuditLogs());
    onNotify('Histórico de auditoria de segurança redefinido.', 'success');
  };

  return (
    <div className="space-y-8">
      {/* 1. Controle de Chave Mestra & Passkey */}
      <div className="medieval-panel rounded-2xl p-6 border border-[#c99738]/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#141924] border border-[#c99738]/40 flex items-center justify-center text-[#ffd978]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#f5ebd6]">
                Chave de Segurança Administrativa (Master Passkey / PIN)
              </h3>
              <p className="text-xs text-[#9d9484]">
                Permite o desbloqueio local do painel administrativo em qualquer dispositivo autorizado.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsChangingPasskey(!isChangingPasskey)}
            className="btn-medieval-secondary px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Lock className="w-3.5 h-3.5 text-[#ffd978]" />
            <span>{isChangingPasskey ? 'Cancelar' : 'Alterar Chave Mestra'}</span>
          </button>
        </div>

        <div className="pt-5">
          {isChangingPasskey ? (
            <form onSubmit={handleUpdatePasskey} className="max-w-md space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#ffd978] block mb-1">
                  Nova Chave Mestra de Administração:
                </label>
                <input
                  type="text"
                  value={newPasskeyInput}
                  onChange={(e) => setNewPasskeyInput(e.target.value)}
                  placeholder="Informe a nova chave de acesso (mínimo 6 caracteres)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121622] border border-[#c99738]/50 text-xs text-[#f5ebd6] font-mono focus:border-[#ffd978] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="btn-gold-primary px-4 py-2 rounded-xl text-xs font-serif font-bold"
                >
                  Salvar Nova Chave
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPasskey(false)}
                  className="px-3 py-2 rounded-xl border border-neutral-700 text-xs text-neutral-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-[#9d9484]">Chave Ativa:</span>
              <code className="px-3 py-1 rounded-lg bg-[#141924] border border-[#c99738]/40 text-[#ffd978] font-mono font-bold tracking-wider">
                {currentPasskey}
              </code>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Chave sincronizada e válida
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Lista de E-mails com Permissão de Administrador */}
      <div className="medieval-panel rounded-2xl p-6 border border-[#c99738]/40 shadow-xl">
        <div className="flex items-center gap-3 pb-5 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-[#141924] border border-[#c99738]/40 flex items-center justify-center text-[#ffd978]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#f5ebd6]">
              E-mails Autorizados com Permissão de Administrador
            </h3>
            <p className="text-xs text-[#9d9484]">
              Usuários cadastrados com estes e-mails possuem autoridade total em todas as seções do portal.
            </p>
          </div>
        </div>

        {/* Formulário de Inclusão de Novo Admin */}
        <form onSubmit={handleAddAdminEmail} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-lg">
          <input
            type="email"
            value={newEmailInput}
            onChange={(e) => setNewEmailInput(e.target.value)}
            placeholder="autorizar.admin@email.com..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#121622] border border-neutral-700 text-xs text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none"
            required
          />
          <button
            type="submit"
            className="btn-gold-primary px-4 py-2.5 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Autorizar Admin</span>
          </button>
        </form>

        {/* Lista de E-mails Cadastrados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
          {adminEmails.map((email) => {
            const isMasterAdmin = email === 'malaca7x@gmail.com';
            return (
              <div
                key={email}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isMasterAdmin
                    ? 'bg-[#18140b] border-[#ffd978]/60 shadow-[0_0_12px_rgba(255,217,120,0.12)]'
                    : 'bg-[#121622] border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className={`w-4 h-4 shrink-0 ${isMasterAdmin ? 'text-[#ffd978]' : 'text-neutral-400'}`} />
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-[#f5ebd6] truncate block">
                      {email}
                    </span>
                    <span className="text-[10px] text-[#ffd978] font-bold block">
                      {isMasterAdmin ? '👑 Administrador Geral' : '🛡️ Administrador Autorizado'}
                    </span>
                  </div>
                </div>

                {!isMasterAdmin && (
                  <button
                    onClick={() => handleRemoveAdminEmail(email)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Revogar privilégios administrativos"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Log de Auditoria e Segurança */}
      <div className="medieval-panel rounded-2xl p-6 border border-[#c99738]/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#141924] border border-[#c99738]/40 flex items-center justify-center text-[#ffd978]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#f5ebd6]">
                Registro de Auditoria & Trilha de Segurança
              </h3>
              <p className="text-xs text-[#9d9484]">
                Histórico em tempo real de modificações cadastrais, permissões e ações críticas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuditLogs(getAuditLogs())}
              className="p-2 rounded-xl bg-[#121622] border border-neutral-700 text-neutral-300 hover:text-[#ffd978] transition-colors cursor-pointer"
              title="Atualizar logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearLogs}
              className="px-3 py-1.5 rounded-xl border border-neutral-800 text-xs text-neutral-400 hover:text-red-400 hover:border-red-900 transition-colors cursor-pointer"
            >
              Limpar Logs
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-neutral-500 italic text-center py-6">
              Nenhum evento registrado no log de auditoria até o momento.
            </p>
          ) : (
            auditLogs.map((log) => {
              const isWarning = log.severity === 'warning';
              const isCritical = log.severity === 'critical';

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                    isCritical
                      ? 'bg-red-950/40 border-red-800/50 text-red-200'
                      : isWarning
                      ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                      : 'bg-[#121622] border-neutral-800 text-[#d6cebe]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="font-serif font-bold text-[#f5ebd6]">
                        {log.action}
                      </strong>
                      <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#a8a090] mt-0.5">{log.detail}</p>
                    <span className="text-[10px] text-[#ffd978] font-mono mt-1 block">
                      Responsável: {log.actor}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
