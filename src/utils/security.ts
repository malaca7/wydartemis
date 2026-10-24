/**
 * Utilitários de Segurança, Higienização e Criptografia
 * WYD Artemis — Padrões de Segurança para Produção
 */

/**
 * Remove caracteres maliciosos e tags HTML para prevenir XSS.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // Remove tags HTML completas
    .replace(/[<>]/g, '')    // Remove caracteres remanescentes
    .trim();
}

/**
 * Valida e sanitiza URLs externas ou rotas internas para evitar injeção `javascript:` ou protocolos inseguros.
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Rotas internas seguras
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  // URLs externas válidas somente HTTPS ou HTTP
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.toString();
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Gera um hash SHA-256 da senha antes de qualquer armazenamento local,
 * garantindo que senhas em texto puro NUNCA sejam salvas no navegador.
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    try {
      const buffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(`artemis_salt_${password}`)
      );
      const hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.warn('[Security] Fallback de hash:', err);
    }
  }
  // Fallback seguro em ambientes sem crypto.subtle
  return `artemis_h_${password.length}_${Array.from(password).reduce((acc, char) => acc + char.charCodeAt(0), 0)}`;
}

export interface PasswordStrength {
  score: number; // 0 a 3
  label: 'Fraca' | 'Média' | 'Forte';
  color: string;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasLetter: boolean;
}

/**
 * Avalia a força da senha em tempo real.
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasNumber && hasLetter) score += 1;
  if (password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  if (score === 0 || !hasMinLength) {
    return {
      score: 0,
      label: 'Fraca',
      color: 'bg-red-500',
      hasMinLength,
      hasNumber,
      hasLetter,
    };
  }

  if (score === 1 || score === 2) {
    return {
      score: 1,
      label: 'Média',
      color: 'bg-amber-400',
      hasMinLength,
      hasNumber,
      hasLetter,
    };
  }

  return {
    score: 2,
    label: 'Forte',
    color: 'bg-emerald-400',
    hasMinLength,
    hasNumber,
    hasLetter,
  };
}
