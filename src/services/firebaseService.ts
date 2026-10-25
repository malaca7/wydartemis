import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import type {
  CharacterRecord,
  GuildRecord,
  ServerStatusSnapshot,
  DemoCharacter,
  CartLine,
} from '../types';
import { mockCharacters, mockGuilds } from '../data/rankingData';
import { initialServerStatus } from '../data/serverStatusData';

// ---------------------------------------------------------------------------
// Controle de Conectividade e Circuito Rápido (Circuit Breaker & Timeouts)
// ---------------------------------------------------------------------------

let isFirestoreAvailable = true;
let isAuthAvailable = true;

/**
 * Executa uma Promise com limite de tempo rigoroso.
 * Evita travamentos de interface quando APIs do Firebase estão offline,
 * com permissões restritas ou retentando em loop infinito gRPC.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 1500,
  fallbackValue?: T
): Promise<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error(`[Timeout ${timeoutMs}ms] Operação de banco cancelada preventivamente para manter alta fluidez.`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timerId) clearTimeout(timerId);
    return result;
  } catch (err) {
    if (timerId) clearTimeout(timerId);
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw err;
  }
}

/**
 * Inspeciona mensagens de erro do Firestore para desativar chamadas síncronas
 * se a API Cloud Firestore estiver desativada ou com acesso negado no projeto.
 */
function recordFirestoreError(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  if (
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('permission-denied') ||
    msg.includes('Cloud Firestore API has not been used') ||
    msg.includes('disabled') ||
    msg.includes('Failed to get document because the client is offline')
  ) {
    if (isFirestoreAvailable) {
      console.warn('[Firebase Firestore] API indisponível ou offline. Ativando modo local resiliente de alta velocidade.');
      isFirestoreAvailable = false;
    }
  }
}

// ---------------------------------------------------------------------------
// 1. Status do Servidor no Firestore
// ---------------------------------------------------------------------------

const SERVER_STATUS_COLLECTION = 'server_status';
const SERVER_STATUS_DOC_ID = 'current';

export async function fetchServerStatus(): Promise<ServerStatusSnapshot> {
  if (isFirestoreAvailable) {
    try {
      const docRef = doc(db, SERVER_STATUS_COLLECTION, SERVER_STATUS_DOC_ID);
      const snap = await withTimeout(getDoc(docRef), 1200);
      if (snap && snap.exists()) {
        return snap.data() as ServerStatusSnapshot;
      }
    } catch (error) {
      recordFirestoreError(error);
      console.warn('[Firebase] Usando status local como fallback:', error);
    }
  }
  return initialServerStatus;
}

export function subscribeServerStatus(
  onUpdate: (status: ServerStatusSnapshot) => void
): Unsubscribe {
  try {
    const docRef = doc(db, SERVER_STATUS_COLLECTION, SERVER_STATUS_DOC_ID);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as ServerStatusSnapshot);
        } else {
          onUpdate(initialServerStatus);
        }
      },
      (error) => {
        recordFirestoreError(error);
        console.warn('[Firebase] Erro no listener de status:', error);
        onUpdate(initialServerStatus);
      }
    );
  } catch (e) {
    recordFirestoreError(e);
    console.warn('[Firebase] Não foi possível subscrever ao status:', e);
    return () => {};
  }
}

export async function updateServerStatusInFirestore(
  updated: Partial<ServerStatusSnapshot>
): Promise<void> {
  const docRef = doc(db, SERVER_STATUS_COLLECTION, SERVER_STATUS_DOC_ID);
  if (isFirestoreAvailable) {
    withTimeout(
      updateDoc(docRef, {
        ...updated,
        lastUpdated: new Date().toISOString(),
      }),
      1500
    ).catch((err) => {
      recordFirestoreError(err);
      console.warn('[Firebase] Não foi possível atualizar status no Firestore:', err);
    });
  }
}

// ---------------------------------------------------------------------------
// 2. Ranking de Personagens e Guildas no Firestore
// ---------------------------------------------------------------------------

const CHARACTERS_COLLECTION = 'characters';
const GUILDS_COLLECTION = 'guilds';

export async function fetchCharactersFromFirestore(): Promise<CharacterRecord[]> {
  if (isFirestoreAvailable) {
    try {
      const colRef = collection(db, CHARACTERS_COLLECTION);
      const q = query(colRef, orderBy('score', 'desc'));
      const snap = await withTimeout(getDocs(q), 1200);
      if (snap && !snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CharacterRecord, 'id'>) }));
      }
    } catch (error) {
      recordFirestoreError(error);
      console.warn('[Firebase] Usando ranking local de personagens como fallback:', error);
    }
  }
  return mockCharacters;
}

export async function fetchGuildsFromFirestore(): Promise<GuildRecord[]> {
  if (isFirestoreAvailable) {
    try {
      const colRef = collection(db, GUILDS_COLLECTION);
      const q = query(colRef, orderBy('score', 'desc'));
      const snap = await withTimeout(getDocs(q), 1200);
      if (snap && !snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GuildRecord, 'id'>) }));
      }
    } catch (error) {
      recordFirestoreError(error);
      console.warn('[Firebase] Usando ranking local de guildas como fallback:', error);
    }
  }
  return mockGuilds;
}

export async function seedInitialRanking(): Promise<void> {
  if (!isFirestoreAvailable) return;
  try {
    const promises = [
      ...mockCharacters.map((char) =>
        withTimeout(setDoc(doc(db, CHARACTERS_COLLECTION, char.id), char, { merge: true }), 1500)
      ),
      ...mockGuilds.map((guild) =>
        withTimeout(setDoc(doc(db, GUILDS_COLLECTION, guild.id), guild, { merge: true }), 1500)
      ),
    ];
    await Promise.allSettled(promises);
  } catch (err) {
    recordFirestoreError(err);
    console.warn('[Firebase] Seed de ranking não concluído (permissões ou offline):', err);
  }
}

// ---------------------------------------------------------------------------
// 3. Autenticação e Perfis de Jogador (Firebase Auth + Firestore)
// ---------------------------------------------------------------------------

const USERS_COLLECTION = 'users';
const LOCAL_ACCOUNTS_KEY = 'wyd_artemis_registered_accounts';
const ACTIVE_SESSION_KEY = 'wyd_artemis_active_session';

export interface UserAccountDoc {
  uid: string;
  email: string;
  displayName: string;
  accountCode: string;
  characters: DemoCharacter[];
  createdAt: string;
  role?: 'admin' | 'player' | 'gamemaster';
}

interface StoredAccountDoc extends UserAccountDoc {
  passwordHash?: string;
}

export {
  AUTHORIZED_ADMIN_EMAILS,
  AUTHORIZED_ADMIN_USERNAMES,
  isAccountAdmin,
} from '../utils/adminAuth';
import { isAccountAdmin } from '../utils/adminAuth';

export function saveAccountToLocalCache(profile: UserAccountDoc, pass?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const isAdmin = isAccountAdmin(profile.email, profile.displayName, profile.role);
    if (isAdmin) {
      profile.role = 'admin';
    } else if (!profile.role) {
      profile.role = 'player';
    }

    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    const list: StoredAccountDoc[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(
      (u) =>
        u.email.toLowerCase() === profile.email.toLowerCase() ||
        u.displayName.toLowerCase() === profile.displayName.toLowerCase()
    );
    const item: StoredAccountDoc = { ...profile, passwordHash: pass };
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('[LocalCache] Erro ao salvar conta localmente:', e);
  }
}

export function getAccountFromLocalCache(queryStr: string): StoredAccountDoc | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    let list: StoredAccountDoc[] = raw ? JSON.parse(raw) : [];
    const q = queryStr.toLowerCase().trim();
    let found = list.find(
      (u) =>
        u.email.toLowerCase() === q ||
        u.displayName.toLowerCase() === q ||
        u.uid.toLowerCase() === q
    );

    // Se a busca for especificamente pelo admin MALACA e ainda não existir no cache local, inicializa
    if (!found && (q === 'malaca' || q === 'malaca7x@gmail.com' || q === 'malaca@artemis.realm')) {
      const defaultAdmin: StoredAccountDoc = {
        uid: 'user_malaca_master_01',
        email: 'malaca7x@gmail.com',
        displayName: 'MALACA',
        accountCode: 'ART-ADMIN-001',
        role: 'admin',
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
      };
      list.push(defaultAdmin);
      localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
      return defaultAdmin;
    }

    if (found) {
      if (isAccountAdmin(found.email, found.displayName, found.role)) {
        found.role = 'admin';
      }
      return found;
    }

    return null;
  } catch {
    return null;
  }
}

export function getActiveLocalSession(): UserAccountDoc | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const session: UserAccountDoc = JSON.parse(raw);
    if (isAccountAdmin(session.email, session.displayName, session.role)) {
      session.role = 'admin';
    }
    return session;
  } catch {
    return null;
  }
}

export function clearActiveLocalSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    // Ignore error
  }
}

export async function registerWithFirebase(
  username: string,
  email: string,
  pass: string
): Promise<UserAccountDoc> {
  const cleanUsername = username.trim();
  const cleanEmail = email.trim();
  const isAdmin = isAccountAdmin(cleanEmail, cleanUsername);
  let uid = isAdmin
    ? 'user_malaca_master_01'
    : `user_${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const accountCode = isAdmin ? 'ART-ADMIN-001' : `ART-2026-${randomDigits}`;

  const starterCharacters: DemoCharacter[] = isAdmin
    ? [
        {
          id: `char-${uid}-1`,
          name: `${cleanUsername}_TK`,
          characterClass: 'TransKnight',
          level: 400,
          stage: 'Celestial',
        },
        {
          id: `char-${uid}-2`,
          name: `${cleanUsername}_Foema`,
          characterClass: 'Foema',
          level: 400,
          stage: 'Celestial',
        },
      ]
    : [
        {
          id: `char-${uid}-1`,
          name: `${cleanUsername}_TK`,
          characterClass: 'TransKnight',
          level: 1,
          stage: 'Mortal',
        },
        {
          id: `char-${uid}-2`,
          name: `${cleanUsername}_Foema`,
          characterClass: 'Foema',
          level: 1,
          stage: 'Mortal',
        },
      ];

  const profileData: UserAccountDoc = {
    uid,
    email: cleanEmail,
    displayName: cleanUsername,
    accountCode,
    characters: starterCharacters,
    createdAt: '25 de Outubro de 2026',
    role: isAdmin ? 'admin' : 'player',
  };

  // 1. Salva imediatamente no cache local para resposta ultra-rápida (UX instantânea)
  saveAccountToLocalCache(profileData, pass);

  // 2. Se Auth estiver ativo, tenta registrar na nuvem com timeout rígido de 1.8s
  if (isAuthAvailable) {
    try {
      const userCredential = await withTimeout(
        createUserWithEmailAndPassword(auth, cleanEmail, pass),
        1800
      );
      const user = userCredential.user;
      profileData.uid = user.uid;
      profileData.characters[0].id = `char-${user.uid}-1`;
      profileData.characters[1].id = `char-${user.uid}-2`;
      saveAccountToLocalCache(profileData, pass);
      updateProfile(user, { displayName: cleanUsername }).catch(() => {});
    } catch (authErr: unknown) {
      const errMessage = authErr instanceof Error ? authErr.message : String(authErr);

      if (
        errMessage.includes('auth/configuration-not-found') ||
        errMessage.includes('configuration-not-found') ||
        errMessage.includes('auth/operation-not-allowed')
      ) {
        isAuthAvailable = false;
        console.warn(
          '[Firebase Auth] Provedor Email/Senha não habilitado no console (artemis-e4d33). Modo resiliente ativado com sucesso.'
        );
      } else if (errMessage.includes('auth/email-already-in-use')) {
        throw new Error('Este e-mail já está em uso por outra conta no Artemis.');
      } else if (errMessage.includes('auth/weak-password')) {
        throw new Error('A senha deve ter no mínimo 6 caracteres.');
      } else if (errMessage.includes('auth/invalid-email')) {
        throw new Error('O formato do e-mail é inválido.');
      } else {
        console.warn('[Firebase Auth] Erro de rede ou timeout, prosseguindo com criação local:', errMessage);
      }
    }
  }

  // 3. Persiste no Firestore em segundo plano (SEM travar o usuário)
  if (isFirestoreAvailable) {
    withTimeout(
      setDoc(doc(db, USERS_COLLECTION, profileData.uid), profileData),
      1500
    ).catch((err) => {
      recordFirestoreError(err);
      console.warn('[Firebase] Não foi possível persistir no Firestore em tempo hábil:', err);
    });
  }

  return profileData;
}

export async function loginWithFirebase(
  emailOrUsername: string,
  pass: string
): Promise<UserAccountDoc | null> {
  const queryStr = emailOrUsername.trim();
  let email = queryStr;

  if (!email.includes('@')) {
    if (queryStr.toLowerCase() === 'malaca') {
      email = 'malaca7x@gmail.com';
    } else {
      email = `${email.toLowerCase().replace(/[^a-z0-9_]/g, '')}@artemis.realm`;
    }
  }

  // 1. Consulta o cache local
  const cached = getAccountFromLocalCache(queryStr);
  if (cached && cached.passwordHash && cached.passwordHash !== pass) {
    throw new Error('Usuário ou senha incorretos.');
  }

  // Se for admin e ainda não possui senha fixada no cache local, grava a senha informada
  if (cached && !cached.passwordHash && isAccountAdmin(cached.email, cached.displayName, cached.role)) {
    cached.passwordHash = pass;
    saveAccountToLocalCache(cached, pass);
  }

  // 2. Tenta autenticação na nuvem se disponível
  if (isAuthAvailable) {
    try {
      const userCredential = await withTimeout(
        signInWithEmailAndPassword(auth, email, pass),
        1800
      );
      const profile = await withTimeout(
        fetchUserProfile(userCredential.user.uid),
        1200,
        cached
      );
      if (profile) {
        saveAccountToLocalCache(profile, pass);
        return profile;
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);

      if (
        errMessage.includes('auth/configuration-not-found') ||
        errMessage.includes('configuration-not-found') ||
        errMessage.includes('auth/operation-not-allowed')
      ) {
        isAuthAvailable = false;
        console.warn(
          '[Firebase Auth] Provedor Email/Senha não habilitado no console. Autenticando com base local instantânea.'
        );
      } else if (
        errMessage.includes('auth/user-not-found') ||
        errMessage.includes('auth/wrong-password') ||
        errMessage.includes('auth/invalid-credential')
      ) {
        if (cached && (!cached.passwordHash || cached.passwordHash === pass)) {
          saveAccountToLocalCache(cached, pass);
          return cached;
        }
        throw new Error('Usuário ou senha incorretos.');
      } else {
        console.warn('[Firebase Auth] Prosseguindo com fallback de sessão rápida:', errMessage);
      }
    }
  }

  // 3. Fallback imediato se usuário já existe em cache
  if (cached) {
    saveAccountToLocalCache(cached, pass);
    return cached;
  }

  // 4. Criação de sessão padrão caso seja o primeiro acesso local
  const isAdmin = isAccountAdmin(email, emailOrUsername);
  const newProfile: UserAccountDoc = {
    uid: isAdmin ? 'user_malaca_master_01' : `user_${Date.now()}`,
    email: email.includes('@') ? email : (isAdmin ? 'malaca7x@gmail.com' : `${emailOrUsername}@artemis.realm`),
    displayName: isAdmin && (emailOrUsername.toLowerCase() === 'malaca' || email.toLowerCase() === 'malaca7x@gmail.com') ? 'MALACA' : emailOrUsername.split('@')[0],
    accountCode: isAdmin ? 'ART-ADMIN-001' : `ART-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    role: isAdmin ? 'admin' : 'player',
    characters: isAdmin
      ? [
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
        ]
      : [
          {
            id: `char-1`,
            name: `${emailOrUsername.split('@')[0]}_TK`,
            characterClass: 'TransKnight',
            level: 1,
            stage: 'Mortal',
          },
        ],
    createdAt: '25 de Outubro de 2026',
  };
  saveAccountToLocalCache(newProfile, pass);
  return newProfile;
}

export async function fetchUserProfile(uid: string): Promise<UserAccountDoc | null> {
  const cached = getAccountFromLocalCache(uid) || getActiveLocalSession();

  if (isFirestoreAvailable) {
    try {
      const userDocRef = doc(db, USERS_COLLECTION, uid);
      const snap = await withTimeout(getDoc(userDocRef), 1200);
      if (snap && snap.exists()) {
        const data = snap.data() as UserAccountDoc;
        saveAccountToLocalCache(data);
        return data;
      }
    } catch (err) {
      recordFirestoreError(err);
      console.warn('[Firebase] Erro ao carregar perfil do Firestore:', err);
    }
  }

  if (cached) return cached;

  const currentUser = auth.currentUser;
  if (!currentUser) return getActiveLocalSession();

  const isAdmin = isAccountAdmin(currentUser.email, currentUser.displayName);
  return {
    uid: currentUser.uid,
    email: currentUser.email || '',
    displayName: currentUser.displayName || (isAdmin ? 'MALACA' : 'Guerreiro_Artemis'),
    accountCode: isAdmin ? 'ART-ADMIN-001' : `ART-${currentUser.uid.slice(0, 6).toUpperCase()}`,
    role: isAdmin ? 'admin' : 'player',
    characters: isAdmin
      ? [
          {
            id: 'char-malaca-1',
            name: `${currentUser.displayName || 'MALACA'}_TK`,
            characterClass: 'TransKnight',
            level: 400,
            stage: 'Celestial',
          },
          {
            id: 'char-malaca-2',
            name: `${currentUser.displayName || 'MALACA'}_Foema`,
            characterClass: 'Foema',
            level: 400,
            stage: 'Celestial',
          },
        ]
      : [
          {
            id: `c-default-1`,
            name: `${currentUser.displayName || 'Hero'}_TK`,
            characterClass: 'TransKnight',
            level: 1,
            stage: 'Mortal',
          },
        ],
    createdAt: '25 de Outubro de 2026',
  };
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (isAuthAvailable) {
    try {
      await withTimeout(sendPasswordResetEmail(auth, email), 1800);
      return;
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      if (
        errMessage.includes('auth/configuration-not-found') ||
        errMessage.includes('configuration-not-found')
      ) {
        isAuthAvailable = false;
        console.warn('[Firebase Auth] Recuperação simulada com sucesso:', email);
        return;
      }
      throw err;
    }
  }
}

export async function updateAccountPassword(newPass: string): Promise<void> {
  const session = getActiveLocalSession();
  if (session) {
    saveAccountToLocalCache(session, newPass);
  }
  if (auth.currentUser && isAuthAvailable) {
    withTimeout(updatePassword(auth.currentUser, newPass), 1500).catch((err) => {
      console.warn('[Firebase Auth] Erro ao atualizar senha no servidor:', err);
    });
  }
}

export async function logoutFirebase(): Promise<void> {
  clearActiveLocalSession();
  try {
    await withTimeout(signOut(auth), 1000);
  } catch {
    // Ignore error
  }
}

export function subscribeAuthState(
  onUserChange: (user: FirebaseUser | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, onUserChange);
}

// ---------------------------------------------------------------------------
// 4. Loja e Pedidos no Firestore
// ---------------------------------------------------------------------------

const ORDERS_COLLECTION = 'shop_orders';

export interface ShopOrderRecord {
  orderId: string;
  userId: string | null;
  userEmail: string | null;
  items: CartLine[];
  totalCredits: number;
  status: 'simulated_completed';
  createdAt?: unknown;
}

export async function recordShopOrder(
  cart: CartLine[],
  totalCredits: number,
  user?: FirebaseUser | null,
  profile?: UserAccountDoc | null
): Promise<string> {
  const orderId = `ART-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const userId = user?.uid || profile?.uid || 'guest_demo';
  const userEmail = user?.email || profile?.email || 'guest@artemis.demo';

  // Salva no histórico de pedidos do localStorage imediatamente (resposta imediata)
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('wyd_artemis_shop_orders');
      const orders = existing ? JSON.parse(existing) : [];
      orders.unshift({
        orderId,
        userId,
        userEmail,
        items: cart,
        totalCredits,
        status: 'simulated_completed',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('wyd_artemis_shop_orders', JSON.stringify(orders.slice(0, 50)));
    } catch {
      // Ignora erro de storage local
    }
  }

  // Tenta persistir no Firestore em segundo plano com timeout
  if (isFirestoreAvailable) {
    withTimeout(
      addDoc(collection(db, ORDERS_COLLECTION), {
        orderId,
        userId: user?.uid || 'guest_demo',
        userEmail: user?.email || 'guest@artemis.demo',
        items: cart,
        totalCredits,
        status: 'simulated_completed',
        createdAt: serverTimestamp(),
      }),
      1500
    ).catch((err) => {
      recordFirestoreError(err);
      console.warn('[Firebase] Pedido gravado localmente (Firestore offline ou restrito):', err);
    });
  }

  return orderId;
}
