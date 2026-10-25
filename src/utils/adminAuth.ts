/**
 * Utilitários e regras de autorização administrativa e auditoria de segurança
 * para o portal WYD Artemis.
 */

export const DEFAULT_ADMIN_EMAILS: readonly string[] = [
  'malaca7x@gmail.com',
  'admin@wydartemis.com.br',
  'malaca@artemis.realm',
];

export const AUTHORIZED_ADMIN_EMAILS = DEFAULT_ADMIN_EMAILS;

export const DEFAULT_ADMIN_USERNAMES: readonly string[] = [
  'malaca',
  'admin',
];

export const AUTHORIZED_ADMIN_USERNAMES = DEFAULT_ADMIN_USERNAMES;

export const DEFAULT_ADMIN_PASSKEY = 'artemis_admin_2026';

const CUSTOM_ADMIN_EMAILS_KEY = 'wyd_artemis_custom_admin_emails';
const CUSTOM_PASSKEY_KEY = 'wyd_artemis_custom_passkey';
const AUDIT_LOGS_KEY = 'wyd_artemis_security_audit_logs';

export interface SecurityAuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  actor: string;
  severity: 'info' | 'warning' | 'critical';
}

/**
 * Retorna todos os e-mails com permissão administrativa (padrão + configurados).
 */
export function getAuthorizedAdminEmails(): string[] {
  const result = new Set<string>(DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()));
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CUSTOM_ADMIN_EMAILS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((e: string) => {
            if (typeof e === 'string' && e.trim()) {
              result.add(e.trim().toLowerCase());
            }
          });
        }
      }
    } catch {
      // Falha silenciosa de leitura local
    }
  }
  return Array.from(result);
}

/**
 * Adiciona um novo e-mail à lista de administradores autorizados.
 */
export function addAuthorizedAdminEmail(email: string, actor = 'MALACA'): boolean {
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes('@') || !clean.includes('.')) return false;

  const current = getAuthorizedAdminEmails();
  if (current.includes(clean)) return true;

  current.push(clean);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_ADMIN_EMAILS_KEY, JSON.stringify(current));
    } catch {
      return false;
    }
  }

  addAuditLog(
    'Concessão de Acesso Admin',
    `E-mail ${clean} foi autorizado com privilégios de administrador.`,
    actor,
    'warning'
  );
  return true;
}

/**
 * Remove um e-mail da lista de administradores secundários (não permite remover MALACA).
 */
export function removeAuthorizedAdminEmail(email: string, actor = 'MALACA'): boolean {
  const clean = email.trim().toLowerCase();
  if (clean === 'malaca7x@gmail.com') {
    throw new Error('Não é permitido revogar os privilégios do Administrador Geral (malaca7x@gmail.com).');
  }

  const current = getAuthorizedAdminEmails().filter((e) => e !== clean);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_ADMIN_EMAILS_KEY, JSON.stringify(current));
    } catch {
      return false;
    }
  }

  addAuditLog(
    'Revogação de Acesso Admin',
    `Privilégios administrativos de ${clean} foram revogados.`,
    actor,
    'warning'
  );
  return true;
}

/**
 * Retorna a chave mestra de segurança ativa (passkey).
 */
export function getMasterPasskey(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CUSTOM_PASSKEY_KEY);
      if (stored && stored.trim().length >= 6) {
        return stored.trim();
      }
    } catch {
      // Ignora erro
    }
  }
  return DEFAULT_ADMIN_PASSKEY;
}

/**
 * Atualiza a chave mestra de segurança (passkey).
 */
export function setMasterPasskey(newPasskey: string, actor = 'MALACA'): boolean {
  const clean = newPasskey.trim();
  if (clean.length < 6) {
    throw new Error('A nova chave mestra deve conter ao menos 6 caracteres.');
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_PASSKEY_KEY, clean);
    } catch {
      return false;
    }
  }

  addAuditLog(
    'Alteração de Chave Mestra',
    'A chave de segurança administrativa (PIN / Passkey) foi atualizada.',
    actor,
    'critical'
  );
  return true;
}

/**
 * Valida se um usuário/perfil possui cargo ou acesso de Administrador Geral.
 */
export function isAccountAdmin(
  email?: string | null,
  username?: string | null,
  role?: string | null
): boolean {
  if (role === 'admin' || role === 'administrator') {
    return true;
  }

  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanUsername = (username || '').toLowerCase().trim();

  const allAdminEmails = getAuthorizedAdminEmails();
  if (cleanEmail && allAdminEmails.some((adm) => adm === cleanEmail)) {
    return true;
  }

  if (cleanUsername && DEFAULT_ADMIN_USERNAMES.some((adm) => adm === cleanUsername)) {
    return true;
  }

  return false;
}

/**
 * Registra um evento no log de auditoria do sistema.
 */
export function addAuditLog(
  action: string,
  detail: string,
  actor = 'MALACA',
  severity: 'info' | 'warning' | 'critical' = 'info'
): void {
  const entry: SecurityAuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    detail,
    actor,
    severity,
  };

  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    const logs: SecurityAuditLogEntry[] = raw ? JSON.parse(raw) : [];
    logs.unshift(entry);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch {
    // Falha silenciosa de gravação
  }
}

/**
 * Retorna os logs de auditoria mais recentes.
 */
export function getAuditLogs(): SecurityAuditLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!raw) {
      // Logs iniciais de demonstração para fornecer contexto rico
      const initialLogs: SecurityAuditLogEntry[] = [
        {
          id: 'log_init_01',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          action: 'Autenticação de Administrador',
          detail: 'Sessão administrativa iniciada com sucesso por MALACA (malaca7x@gmail.com).',
          actor: 'MALACA',
          severity: 'info',
        },
        {
          id: 'log_init_02',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          action: 'Inicialização de Segurança',
          detail: 'Políticas de controle de acesso ativadas com verificação de papéis e Firestore Rules.',
          actor: 'Sistema Artemis',
          severity: 'info',
        },
      ];
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Limpa os registros de auditoria locais.
 */
export function clearAuditLogs(actor = 'MALACA'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUDIT_LOGS_KEY);
    addAuditLog('Limpeza de Logs', 'O histórico de auditoria de segurança foi redefinido.', actor, 'warning');
  } catch {
    // Ignora
  }
}
