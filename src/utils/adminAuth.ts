/**
 * Utilitários e regras de autorização administrativa para o portal WYD Artemis.
 */

export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  'malaca7x@gmail.com',
  'admin@wydartemis.com.br',
  'malaca@artemis.realm',
];

export const AUTHORIZED_ADMIN_USERNAMES: readonly string[] = [
  'malaca',
  'admin',
];

/**
 * Valida se um usuário/perfil possui cargo ou acesso de Administrador Geral.
 * - Reconhece e-mail oficial (ex: malaca7x@gmail.com)
 * - Reconhece nome de usuário oficial (ex: MALACA)
 * - Reconhece role 'admin' ou 'administrator'
 * - Comparações são insensíveis a maiúsculas/minúsculas e espaços em branco.
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

  if (cleanEmail && AUTHORIZED_ADMIN_EMAILS.some((adm) => adm.toLowerCase() === cleanEmail)) {
    return true;
  }

  if (cleanUsername && AUTHORIZED_ADMIN_USERNAMES.some((adm) => adm.toLowerCase() === cleanUsername)) {
    return true;
  }

  return false;
}
