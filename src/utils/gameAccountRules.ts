/**
 * Regras de validação e restrições para Contas de Jogo e Personagens do WYD Artemis.
 */

export const MAX_GAME_ACCOUNTS_PER_USER = 5;
export const MAX_CHARACTERS_PER_GAME_ACCOUNT = 4;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida o nome de login de uma conta de jogo (sub-conta).
 * Padrão WYD: 4 a 16 caracteres alfanuméricos em minúsculas ou sublinhado.
 */
export function validateGameAccountUsername(username: string): ValidationResult {
  if (!username) {
    return { valid: false, error: 'O login da conta de jogo é obrigatório.' };
  }
  const clean = username.trim().toLowerCase();
  if (clean.length < 4 || clean.length > 16) {
    return { valid: false, error: 'O login da conta de jogo deve conter entre 4 e 16 caracteres.' };
  }
  if (!/^[a-z0-9_]+$/.test(clean)) {
    return { valid: false, error: 'O login da conta de jogo pode conter apenas letras minúsculas, números e sublinhados (_).' };
  }
  return { valid: true };
}

/**
 * Valida a sub-senha numérica (PIN) da conta de jogo.
 * Padrão WYD clássico: exatamente 6 dígitos numéricos.
 */
export function validateGameAccountPin(pin: string): ValidationResult {
  if (!pin) {
    return { valid: false, error: 'O PIN numérico de segurança é obrigatório.' };
  }
  const clean = pin.trim();
  if (!/^\d{6}$/.test(clean)) {
    return { valid: false, error: 'A sub-senha (PIN) de segurança deve conter exatamente 6 dígitos numéricos.' };
  }
  return { valid: true };
}

/**
 * Valida o nome de um personagem.
 * Padrão WYD: 3 a 14 caracteres alfanuméricos, sem espaços ou símbolos especiais.
 */
export function validateCharacterName(name: string): ValidationResult {
  if (!name) {
    return { valid: false, error: 'O nome do personagem é obrigatório.' };
  }
  const clean = name.trim();
  if (clean.length < 3 || clean.length > 14) {
    return { valid: false, error: 'O nome do personagem deve conter entre 3 e 14 caracteres.' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(clean)) {
    return { valid: false, error: 'O nome do personagem pode conter apenas letras, números, hífens e sublinhados.' };
  }
  return { valid: true };
}

/**
 * Verifica se o usuário pode adicionar mais uma conta de jogo.
 */
export function canAddGameAccount(currentCount: number): boolean {
  return currentCount < MAX_GAME_ACCOUNTS_PER_USER;
}

/**
 * Verifica se a conta de jogo pode receber mais um personagem (máx. 4 slots no WYD).
 */
export function canAddCharacterToAccount(currentCount: number): boolean {
  return currentCount < MAX_CHARACTERS_PER_GAME_ACCOUNT;
}

/**
 * Valida os dados para alteração da senha mestre da conta.
 */
export function validatePasswordChange(
  newPass: string,
  confirmPass?: string,
  oldPass?: string,
  storedPassHash?: string
): ValidationResult {
  if (oldPass !== undefined && storedPassHash !== undefined && storedPassHash) {
    if (oldPass.trim() !== storedPassHash.trim()) {
      return { valid: false, error: 'A senha atual digitada está incorreta.' };
    }
  }

  const cleanNew = newPass ? newPass.trim() : '';
  if (!cleanNew || cleanNew.length < 6) {
    return { valid: false, error: 'A nova senha deve possuir pelo menos 6 caracteres.' };
  }

  if (confirmPass !== undefined) {
    if (cleanNew !== confirmPass.trim()) {
      return { valid: false, error: 'A confirmação não coincide com a nova senha.' };
    }
  }

  return { valid: true };
}
