import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  withTimeout,
  recordFirestoreError,
  isFirestoreAvailable,
  type UserAccountDoc,
  saveAccountToLocalCache,
} from './firebaseService';
import type { DemoCharacter, CharacterClass } from '../types';
import { isAccountAdmin, addAuditLog } from '../utils/adminAuth';

const LOCAL_ACCOUNTS_KEY = 'wyd_artemis_registered_accounts';
const USERS_COLLECTION = 'users';

export interface StoredAdminAccountDoc extends UserAccountDoc {
  passwordHash?: string;
  status?: 'active' | 'suspended' | 'vip';
  notes?: string;
}

const DEFAULT_DEMO_ACCOUNTS: StoredAdminAccountDoc[] = [
  {
    uid: 'user_malaca_master_01',
    email: 'malaca7x@gmail.com',
    displayName: 'MALACA',
    accountCode: 'ART-ADMIN-001',
    role: 'admin',
    status: 'active',
    notes: 'Administrador Geral e Mestre Supremo do Servidor Artemis.',
    characters: [
      {
        id: 'char-malaca-1',
        name: 'MALACA_TK',
        characterClass: 'TransKnight',
        level: 400,
        stage: 'Celestial',
      },
      {
        id: 'char-malaca-2',
        name: 'MALACA_Foema',
        characterClass: 'Foema',
        level: 400,
        stage: 'Celestial',
      },
    ],
    createdAt: '25 de Outubro de 2026',
  },
  {
    uid: 'user_gm_galahad',
    email: 'galahad@wydartemis.com.br',
    displayName: 'Galahad_GM',
    accountCode: 'ART-GM-007',
    role: 'gamemaster',
    status: 'active',
    notes: 'Game Master de eventos e patrulha de Noatun.',
    characters: [
      {
        id: 'char-gm-1',
        name: 'Galahad_Artemis',
        characterClass: 'TransKnight',
        level: 380,
        stage: 'Arch',
      },
    ],
    createdAt: '22 de Outubro de 2026',
  },
  {
    uid: 'user_morgana_arch',
    email: 'morgana@artemis.realm',
    displayName: 'Morgana_Foema',
    accountCode: 'ART-2026-4482',
    role: 'player',
    status: 'active',
    notes: 'Jogadora ativa da guilda Valhalla.',
    characters: [
      {
        id: 'char-mor-1',
        name: 'Morgana_Healer',
        characterClass: 'Foema',
        level: 355,
        stage: 'Arch',
      },
    ],
    createdAt: '23 de Outubro de 2026',
  },
  {
    uid: 'user_arthur_bm',
    email: 'arthur@artemis.realm',
    displayName: 'Arthur_BM',
    accountCode: 'ART-2026-8912',
    role: 'player',
    status: 'vip',
    notes: 'Apoiador VIP do servidor com bônus de experiência ativo.',
    characters: [
      {
        id: 'char-art-1',
        name: 'Arthur_Beast',
        characterClass: 'BeastMaster',
        level: 210,
        stage: 'Mortal',
      },
    ],
    createdAt: '24 de Outubro de 2026',
  },
];

/**
 * Carrega a lista completa de contas do sistema (Firestore + Cache Local).
 */
export async function fetchAllAccounts(): Promise<StoredAdminAccountDoc[]> {
  const accountMap = new Map<string, StoredAdminAccountDoc>();

  // 1. Carrega do Cache Local
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
      let localList: StoredAdminAccountDoc[] = raw ? JSON.parse(raw) : [];

      if (localList.length === 0) {
        localList = [...DEFAULT_DEMO_ACCOUNTS];
        localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(localList));
      }

      localList.forEach((acc) => {
        accountMap.set(acc.uid, acc);
      });
    } catch (e) {
      console.warn('[AdminUser] Erro ao ler contas do storage local:', e);
    }
  }

  // 2. Consulta Firestore se disponível
  if (isFirestoreAvailable) {
    try {
      const colRef = collection(db, USERS_COLLECTION);
      const snapshot = await withTimeout(getDocs(colRef), 1500);
      if (snapshot && !snapshot.empty) {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as StoredAdminAccountDoc;
          if (data && data.uid) {
            accountMap.set(data.uid, {
              ...data,
              status: data.status || 'active',
              role: isAccountAdmin(data.email, data.displayName, data.role) ? 'admin' : (data.role || 'player'),
            });
          }
        });
      }
    } catch (err) {
      recordFirestoreError(err);
      console.warn('[AdminUser] Firestore indisponível para listagem, utilizando base local:', err);
    }
  }

  // 3. Garante que o Administrador Geral MALACA esteja presente e com papel 'admin'
  const malacaAccount = Array.from(accountMap.values()).find(
    (u) =>
      u.email.toLowerCase() === 'malaca7x@gmail.com' ||
      u.displayName.toLowerCase() === 'malaca'
  );

  if (!malacaAccount) {
    accountMap.set(DEFAULT_DEMO_ACCOUNTS[0].uid, DEFAULT_DEMO_ACCOUNTS[0]);
  } else {
    malacaAccount.role = 'admin';
    malacaAccount.status = 'active';
  }

  const list = Array.from(accountMap.values());
  // Salva lista consolidada no cache
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
    } catch {
      // Ignora erro de gravação
    }
  }

  return list;
}

/**
 * Cria ou atualiza uma conta no sistema.
 */
export async function saveOrUpdateAccount(
  account: Partial<StoredAdminAccountDoc> & { email: string; displayName: string },
  newPassword?: string,
  actor = 'MALACA'
): Promise<StoredAdminAccountDoc> {
  const cleanEmail = account.email.trim();
  const cleanUsername = account.displayName.trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('E-mail informado é inválido.');
  }
  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('Nome de usuário deve ter ao menos 3 caracteres.');
  }

  const all = await fetchAllAccounts();
  const existingIdx = all.findIndex(
    (u) =>
      (account.uid && u.uid === account.uid) ||
      u.email.toLowerCase() === cleanEmail.toLowerCase() ||
      u.displayName.toLowerCase() === cleanUsername.toLowerCase()
  );

  const isAdmin = isAccountAdmin(cleanEmail, cleanUsername, account.role);
  const role = isAdmin ? 'admin' : (account.role || 'player');

  let targetAccount: StoredAdminAccountDoc;

  if (existingIdx >= 0) {
    const existing = all[existingIdx];
    targetAccount = {
      ...existing,
      ...account,
      email: cleanEmail,
      displayName: cleanUsername,
      role,
      status: account.status || existing.status || 'active',
      characters: account.characters || existing.characters || [],
    };
    if (newPassword && newPassword.trim()) {
      targetAccount.passwordHash = newPassword.trim();
    }
    all[existingIdx] = targetAccount;
    addAuditLog(
      'Edição de Conta',
      `Conta ${cleanUsername} (${cleanEmail}) teve seus dados/cargo alterados para [${role}].`,
      actor,
      'info'
    );
  } else {
    // Nova conta
    const uid = account.uid || `user_${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;
    const accountCode = account.accountCode || (isAdmin ? 'ART-ADMIN-001' : `ART-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    const defaultCharacters: DemoCharacter[] = [
      {
        id: `char-${uid}-1`,
        name: `${cleanUsername}_TK`,
        characterClass: 'TransKnight' as CharacterClass,
        level: isAdmin ? 400 : 1,
        stage: isAdmin ? 'Celestial' : 'Mortal',
      },
    ];

    targetAccount = {
      uid,
      email: cleanEmail,
      displayName: cleanUsername,
      accountCode,
      role,
      status: account.status || 'active',
      notes: account.notes || 'Conta criada via Painel Administrativo.',
      characters: account.characters && account.characters.length > 0 ? account.characters : defaultCharacters,
      createdAt: '25 de Outubro de 2026',
      passwordHash: newPassword?.trim() || 'artemis123',
    };
    all.push(targetAccount);
    addAuditLog(
      'Criação de Conta',
      `Nova conta criada via Admin: ${cleanUsername} (${cleanEmail}) com cargo [${role}].`,
      actor,
      'info'
    );
  }

  // 1. Atualiza cache local
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(all));
  }
  saveAccountToLocalCache(targetAccount, targetAccount.passwordHash);

  // 2. Persiste no Firestore em segundo plano
  if (isFirestoreAvailable) {
    withTimeout(
      setDoc(doc(db, USERS_COLLECTION, targetAccount.uid), targetAccount),
      1500
    ).catch((err) => {
      recordFirestoreError(err);
      console.warn('[AdminUser] Erro ao sincronizar conta no Firestore:', err);
    });
  }

  return targetAccount;
}

/**
 * Remove uma conta de usuário do sistema (com proteção para o admin MALACA).
 */
export async function deleteAccount(uid: string, actor = 'MALACA'): Promise<void> {
  const all = await fetchAllAccounts();
  const target = all.find((u) => u.uid === uid);

  if (!target) {
    throw new Error('Conta não encontrada para exclusão.');
  }

  if (
    target.email.toLowerCase() === 'malaca7x@gmail.com' ||
    target.displayName.toLowerCase() === 'malaca'
  ) {
    throw new Error('Ação bloqueada: Não é permitido excluir a conta do Administrador Geral (MALACA).');
  }

  const updatedList = all.filter((u) => u.uid !== uid);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(updatedList));
  }

  if (isFirestoreAvailable) {
    withTimeout(deleteDoc(doc(db, USERS_COLLECTION, uid)), 1500).catch((err) => {
      recordFirestoreError(err);
      console.warn('[AdminUser] Erro ao remover do Firestore:', err);
    });
  }

  addAuditLog(
    'Exclusão de Conta',
    `Conta de ${target.displayName} (${target.email}) foi excluída permanentemente.`,
    actor,
    'warning'
  );
}

/**
 * Redefine diretamente a senha de uma conta.
 */
export async function resetAccountPassword(
  uid: string,
  newPass: string,
  actor = 'MALACA'
): Promise<void> {
  if (!newPass || newPass.trim().length < 6) {
    throw new Error('A senha deve conter no mínimo 6 caracteres.');
  }

  const all = await fetchAllAccounts();
  const account = all.find((u) => u.uid === uid);
  if (!account) {
    throw new Error('Conta não encontrada.');
  }

  account.passwordHash = newPass.trim();
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(all));
  }

  addAuditLog(
    'Redefinição de Senha',
    `Senha da conta ${account.displayName} foi redefinida pelo administrador.`,
    actor,
    'warning'
  );
}
