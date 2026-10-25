import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { GameAccount, DemoCharacter, CharacterClass } from '../types';
import {
  type UserAccountDoc,
  saveAccountToLocalCache,
  isFirestoreAvailable,
} from './firebaseService';
import {
  validateGameAccountPin,
  validateGameAccountUsername,
  validateCharacterName,
} from '../utils/gameAccountRules';

const USERS_COLLECTION = 'users';

/**
 * Salva as alterações de contas e personagens do usuário no cache local e no Firestore.
 */
export async function persistUserAccounts(user: UserAccountDoc): Promise<void> {
  saveAccountToLocalCache(user);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('wyd_artemis_active_session', JSON.stringify(user));
    } catch {
      // Ignora erro de escrita local
    }
  }

  if (isFirestoreAvailable && user.uid && !user.uid.startsWith('demo_')) {
    try {
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      await updateDoc(userRef, {
        gameAccounts: user.gameAccounts || [],
        characters: user.characters || [],
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[GameAccountService] Falha ao sincronizar contas com o Firestore:', err);
    }
  }
}

/**
 * Retorna as contas de jogo do usuário. Se o usuário ainda não tiver contas de jogo
 * cadastradas, migra os personagens existentes para uma conta inicial padrão (ex: login_main).
 */
export function getUserGameAccounts(user: UserAccountDoc | null): GameAccount[] {
  if (!user) return [];

  if (user.gameAccounts && user.gameAccounts.length > 0) {
    return user.gameAccounts;
  }

  // Migração transparente de personagens para a conta de jogo primária
  const sanitizedName = (user.displayName || 'guerreiro')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 12) || 'artemis_acc';

  const defaultAccount: GameAccount = {
    id: `ga_${user.uid || 'session'}_01`,
    username: `${sanitizedName}`,
    numericPin: '1234',
    status: 'active',
    createdAt: user.createdAt || '25 de Outubro de 2026',
    characters: user.characters && user.characters.length > 0
      ? [...user.characters]
      : [
          {
            id: `char_${Date.now()}_1`,
            name: `${user.displayName || 'Hero'}_TK`,
            characterClass: 'TransKnight',
            level: 1,
            stage: 'Mortal',
          },
        ],
    notes: 'Conta de jogo primária criada automaticamente.',
  };

  user.gameAccounts = [defaultAccount];
  // Atualiza também os personagens globais
  user.characters = defaultAccount.characters;
  persistUserAccounts(user);

  return user.gameAccounts;
}

export interface CreateGameAccountInput {
  username: string;
  password?: string;
  numericPin?: string;
  notes?: string;
}

/**
 * Cria uma nova conta de jogo vinculada à conta mestre do jogador.
 * Limite de até 5 contas de jogo por usuário no Artemis Realm.
 */
export async function createGameAccount(
  user: UserAccountDoc,
  input: CreateGameAccountInput
): Promise<{ updatedUser: UserAccountDoc; newAccount: GameAccount }> {
  const currentAccounts = getUserGameAccounts(user);

  if (currentAccounts.length >= 5) {
    throw new Error('Limite máximo de 5 contas de jogo atingido para esta conta mestre.');
  }

  const userValidation = validateGameAccountUsername(input.username);
  if (!userValidation.valid) {
    throw new Error(userValidation.error || 'Nome de usuário inválido.');
  }

  const cleanUsername = input.username.trim().toLowerCase();
  const alreadyExists = currentAccounts.some(
    (acc) => acc.username.toLowerCase() === cleanUsername
  );
  if (alreadyExists) {
    throw new Error(`A conta de jogo "${cleanUsername}" já existe neste perfil.`);
  }

  const cleanPin = input.numericPin ? input.numericPin.trim() : '1234';
  const pinValidation = validateGameAccountPin(cleanPin);
  if (!pinValidation.valid) {
    throw new Error(pinValidation.error || 'A sub-senha (PIN) de segurança deve conter exatamente 4 dígitos numéricos.');
  }

  const newAccount: GameAccount = {
    id: `ga_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    password: input.password?.trim() || undefined,
    numericPin: cleanPin,
    status: 'active',
    createdAt: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    characters: [],
    notes: input.notes?.trim() || undefined,
  };

  user.gameAccounts = [...currentAccounts, newAccount];
  await persistUserAccounts(user);

  return { updatedUser: user, newAccount };
}

export interface UpdateGameAccountInput {
  password?: string;
  numericPin?: string;
  status?: 'active' | 'blocked' | 'suspended';
  notes?: string;
}

/**
 * Atualiza dados de segurança (senha, PIN numérico, status, notas) de uma conta de jogo.
 */
export async function updateGameAccount(
  user: UserAccountDoc,
  accountId: string,
  updates: UpdateGameAccountInput
): Promise<UserAccountDoc> {
  const accounts = getUserGameAccounts(user);
  const targetIndex = accounts.findIndex((a) => a.id === accountId);

  if (targetIndex === -1) {
    throw new Error('Conta de jogo não encontrada.');
  }

  const target = { ...accounts[targetIndex] };

  if (updates.numericPin !== undefined) {
    const cleanPin = updates.numericPin.trim();
    const pinValidation = validateGameAccountPin(cleanPin);
    if (!pinValidation.valid) {
      throw new Error(pinValidation.error || 'A sub-senha (PIN) deve conter exatamente 4 dígitos numéricos.');
    }
    target.numericPin = cleanPin;
  }

  if (updates.password !== undefined && updates.password.trim()) {
    if (updates.password.trim().length < 4) {
      throw new Error('A senha da conta de jogo deve conter ao menos 4 caracteres.');
    }
    target.password = updates.password.trim();
  }

  if (updates.status) {
    target.status = updates.status;
  }

  if (updates.notes !== undefined) {
    target.notes = updates.notes.trim();
  }

  accounts[targetIndex] = target;
  user.gameAccounts = accounts;
  await persistUserAccounts(user);

  return user;
}

/**
 * Apaga uma conta de jogo e todos os personagens vinculados a ela.
 */
export async function deleteGameAccount(
  user: UserAccountDoc,
  accountId: string
): Promise<UserAccountDoc> {
  const accounts = getUserGameAccounts(user);
  const filtered = accounts.filter((a) => a.id !== accountId);

  if (filtered.length === accounts.length) {
    throw new Error('Conta de jogo não encontrada para exclusão.');
  }

  user.gameAccounts = filtered;
  user.characters = filtered.flatMap((a) => a.characters || []);
  await persistUserAccounts(user);

  return user;
}

export interface CharacterInput {
  name: string;
  characterClass: CharacterClass;
  level?: number;
  stage?: 'Mortal' | 'Arch' | 'Celestial' | 'Sub-Celestial';
}

/**
 * Cria um novo personagem em uma conta de jogo específica.
 * Cada conta de jogo no WYD suporta rigorosamente até 4 personagens.
 */
export async function addCharacterToGameAccount(
  user: UserAccountDoc,
  accountId: string,
  charData: CharacterInput
): Promise<{ updatedUser: UserAccountDoc; newCharacter: DemoCharacter }> {
  const accounts = getUserGameAccounts(user);
  const target = accounts.find((a) => a.id === accountId);

  if (!target) {
    throw new Error('Conta de jogo não encontrada.');
  }

  if (!target.characters) {
    target.characters = [];
  }

  if (target.characters.length >= 4) {
    throw new Error('Esta conta de jogo já atingiu o limite máximo de 4 personagens.');
  }

  const charValidation = validateCharacterName(charData.name);
  if (!charValidation.valid) {
    throw new Error(charValidation.error || 'Nome de personagem inválido.');
  }

  const cleanName = charData.name.trim();

  // Verifica se o nome já existe na mesma conta
  const nameExists = target.characters.some(
    (c) => c.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (nameExists) {
    throw new Error(`Já existe um personagem com o nome "${cleanName}" nesta conta de jogo.`);
  }

  const newCharacter: DemoCharacter = {
    id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    characterClass: charData.characterClass,
    level: Math.max(1, Math.min(400, Number(charData.level) || 1)),
    stage: charData.stage || 'Mortal',
  };

  target.characters.push(newCharacter);
  user.gameAccounts = accounts;
  user.characters = accounts.flatMap((a) => a.characters || []);
  await persistUserAccounts(user);

  return { updatedUser: user, newCharacter };
}

/**
 * Atualiza os dados de um personagem dentro de sua respectiva conta de jogo.
 */
export async function updateCharacterInGameAccount(
  user: UserAccountDoc,
  accountId: string,
  characterId: string,
  updates: Partial<CharacterInput>
): Promise<UserAccountDoc> {
  const accounts = getUserGameAccounts(user);
  const targetAcc = accounts.find((a) => a.id === accountId);

  if (!targetAcc) {
    throw new Error('Conta de jogo não encontrada.');
  }

  const charIndex = targetAcc.characters.findIndex((c) => c.id === characterId);
  if (charIndex === -1) {
    throw new Error('Personagem não encontrado nesta conta de jogo.');
  }

  const char = { ...targetAcc.characters[charIndex] };

  if (updates.name !== undefined) {
    const cleanName = updates.name.trim();
    if (!cleanName || cleanName.length < 3 || cleanName.length > 14) {
      throw new Error('O nome do personagem deve conter entre 3 e 14 caracteres.');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanName)) {
      throw new Error('O nome do personagem pode conter apenas letras, números e hífens.');
    }
    const duplicate = targetAcc.characters.some(
      (c) => c.id !== characterId && c.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`O nome "${cleanName}" já está em uso por outro personagem nesta conta.`);
    }
    char.name = cleanName;
  }

  if (updates.characterClass) {
    char.characterClass = updates.characterClass;
  }

  if (updates.level !== undefined) {
    char.level = Math.max(1, Math.min(400, Number(updates.level) || 1));
  }

  if (updates.stage) {
    char.stage = updates.stage;
  }

  targetAcc.characters[charIndex] = char;
  user.gameAccounts = accounts;
  user.characters = accounts.flatMap((a) => a.characters || []);
  await persistUserAccounts(user);

  return user;
}

/**
 * Exclui um personagem de uma conta de jogo específica.
 */
export async function deleteCharacterFromGameAccount(
  user: UserAccountDoc,
  accountId: string,
  characterId: string
): Promise<UserAccountDoc> {
  const accounts = getUserGameAccounts(user);
  const targetAcc = accounts.find((a) => a.id === accountId);

  if (!targetAcc) {
    throw new Error('Conta de jogo não encontrada.');
  }

  const initialCount = targetAcc.characters.length;
  targetAcc.characters = targetAcc.characters.filter((c) => c.id !== characterId);

  if (targetAcc.characters.length === initialCount) {
    throw new Error('Personagem não encontrado para exclusão.');
  }

  user.gameAccounts = accounts;
  user.characters = accounts.flatMap((a) => a.characters || []);
  await persistUserAccounts(user);

  return user;
}
