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
// 1. Status do Servidor no Firestore
// ---------------------------------------------------------------------------

const SERVER_STATUS_COLLECTION = 'server_status';
const SERVER_STATUS_DOC_ID = 'current';

export async function fetchServerStatus(): Promise<ServerStatusSnapshot> {
  try {
    const docRef = doc(db, SERVER_STATUS_COLLECTION, SERVER_STATUS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ServerStatusSnapshot;
    }
    // If not seeded yet, seed initial
    await setDoc(docRef, initialServerStatus);
    return initialServerStatus;
  } catch (error) {
    console.warn('[Firebase] Usando status local como fallback:', error);
    return initialServerStatus;
  }
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
        console.warn('[Firebase] Erro no listener de status:', error);
        onUpdate(initialServerStatus);
      }
    );
  } catch (e) {
    console.warn('[Firebase] Não foi possível subscrever ao status:', e);
    return () => {};
  }
}

export async function updateServerStatusInFirestore(
  updated: Partial<ServerStatusSnapshot>
): Promise<void> {
  const docRef = doc(db, SERVER_STATUS_COLLECTION, SERVER_STATUS_DOC_ID);
  await updateDoc(docRef, {
    ...updated,
    lastUpdated: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// 2. Ranking de Personagens e Guildas no Firestore
// ---------------------------------------------------------------------------

const CHARACTERS_COLLECTION = 'characters';
const GUILDS_COLLECTION = 'guilds';

export async function fetchCharactersFromFirestore(): Promise<CharacterRecord[]> {
  try {
    const colRef = collection(db, CHARACTERS_COLLECTION);
    const q = query(colRef, orderBy('score', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CharacterRecord, 'id'>) }));
    }

    // Auto-seed if collection is completely empty
    seedInitialRanking().catch(() => {});
    return mockCharacters;
  } catch (error) {
    console.warn('[Firebase] Usando ranking local de personagens como fallback:', error);
    return mockCharacters;
  }
}

export async function fetchGuildsFromFirestore(): Promise<GuildRecord[]> {
  try {
    const colRef = collection(db, GUILDS_COLLECTION);
    const q = query(colRef, orderBy('score', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GuildRecord, 'id'>) }));
    }

    return mockGuilds;
  } catch (error) {
    console.warn('[Firebase] Usando ranking local de guildas como fallback:', error);
    return mockGuilds;
  }
}

export async function seedInitialRanking(): Promise<void> {
  try {
    for (const char of mockCharacters) {
      const charRef = doc(db, CHARACTERS_COLLECTION, char.id);
      await setDoc(charRef, char, { merge: true });
    }
    for (const guild of mockGuilds) {
      const guildRef = doc(db, GUILDS_COLLECTION, guild.id);
      await setDoc(guildRef, guild, { merge: true });
    }
  } catch (err) {
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
}

interface StoredAccountDoc extends UserAccountDoc {
  passwordHash?: string;
}

export function saveAccountToLocalCache(profile: UserAccountDoc, pass?: string): void {
  if (typeof window === 'undefined') return;
  try {
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

export function getAccountFromLocalCache(query: string): UserAccountDoc | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (!raw) return null;
    const list: StoredAccountDoc[] = JSON.parse(raw);
    const q = query.toLowerCase().trim();
    const found = list.find(
      (u) => u.email.toLowerCase() === q || u.displayName.toLowerCase() === q
    );
    return found || null;
  } catch {
    return null;
  }
}

export function getActiveLocalSession(): UserAccountDoc | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
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
  let uid = `user_${username.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    uid = user.uid;
    await updateProfile(user, { displayName: username }).catch(() => {});
  } catch (authErr: unknown) {
    const errMessage = authErr instanceof Error ? authErr.message : String(authErr);

    // Se o provedor Email/Password não estiver ativado no console do Firebase,
    // interceptamos e criamos a conta resiliente sem bloquear o jogador
    if (
      errMessage.includes('auth/configuration-not-found') ||
      errMessage.includes('configuration-not-found') ||
      errMessage.includes('auth/operation-not-allowed')
    ) {
      console.warn(
        '[Firebase Auth] Provedor Email/Senha não habilitado no console (artemis-e4d33). Criando conta em modo resiliente:',
        errMessage
      );
    } else if (errMessage.includes('auth/email-already-in-use')) {
      throw new Error('Este e-mail já está em uso por outra conta no Firebase.');
    } else if (errMessage.includes('auth/weak-password')) {
      throw new Error('A senha deve ter no mínimo 6 caracteres.');
    } else if (errMessage.includes('auth/invalid-email')) {
      throw new Error('O formato do e-mail é inválido.');
    } else {
      console.warn('[Firebase Auth] Erro inesperado, procedendo com criação resiliente:', errMessage);
    }
  }

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const accountCode = `ART-2026-${randomDigits}`;

  const starterCharacters: DemoCharacter[] = [
    {
      id: `char-${uid}-1`,
      name: `${username}_TK`,
      characterClass: 'TransKnight',
      level: 1,
      stage: 'Mortal',
    },
    {
      id: `char-${uid}-2`,
      name: `${username}_Foema`,
      characterClass: 'Foema',
      level: 1,
      stage: 'Mortal',
    },
  ];

  const profileData: UserAccountDoc = {
    uid,
    email,
    displayName: username,
    accountCode,
    characters: starterCharacters,
    createdAt: '23 de Outubro de 2026',
  };

  // Salva no cache local de contas e sessão
  saveAccountToLocalCache(profileData, pass);

  // Tenta persistir no Firestore
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userDocRef, profileData);
  } catch (err) {
    console.warn('[Firebase] Não foi possível salvar perfil completo no Firestore:', err);
  }

  return profileData;
}

export async function loginWithFirebase(
  emailOrUsername: string,
  pass: string
): Promise<UserAccountDoc | null> {
  let email = emailOrUsername.trim();

  if (!email.includes('@')) {
    email = `${email.toLowerCase().replace(/[^a-z0-9_]/g, '')}@artemis.realm`;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await fetchUserProfile(userCredential.user.uid);
    if (profile) {
      saveAccountToLocalCache(profile, pass);
    }
    return profile;
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);

    // Se o provedor não estiver ativo no console (configuration-not-found)
    // ou offline, autentica via base de contas registrada
    if (
      errMessage.includes('auth/configuration-not-found') ||
      errMessage.includes('configuration-not-found') ||
      errMessage.includes('auth/operation-not-allowed')
    ) {
      console.warn(
        '[Firebase Auth] Provedor de Email/Senha não habilitado no console. Autenticando via base local/Firestore:',
        errMessage
      );

      const cached = getAccountFromLocalCache(emailOrUsername);
      if (cached) {
        saveAccountToLocalCache(cached, pass);
        return cached;
      }

      // Se é a primeira vez autenticando esse usuário, cria a conta resiliente
      const newProfile: UserAccountDoc = {
        uid: `user_${Date.now()}`,
        email: email.includes('@') ? email : `${emailOrUsername}@artemis.realm`,
        displayName: emailOrUsername.split('@')[0],
        accountCode: `ART-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        characters: [
          {
            id: `char-1`,
            name: `${emailOrUsername.split('@')[0]}_TK`,
            characterClass: 'TransKnight',
            level: 1,
            stage: 'Mortal',
          },
        ],
        createdAt: '23 de Outubro de 2026',
      };
      saveAccountToLocalCache(newProfile, pass);
      return newProfile;
    }

    if (
      errMessage.includes('auth/user-not-found') ||
      errMessage.includes('auth/wrong-password') ||
      errMessage.includes('auth/invalid-credential')
    ) {
      throw new Error('Usuário ou senha incorretos.');
    }

    throw err;
  }
}

export async function fetchUserProfile(uid: string): Promise<UserAccountDoc | null> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserAccountDoc;
    }
  } catch (err) {
    console.warn('[Firebase] Erro ao carregar perfil do Firestore:', err);
  }

  const currentUser = auth.currentUser;
  if (!currentUser) return getActiveLocalSession();

  return {
    uid: currentUser.uid,
    email: currentUser.email || '',
    displayName: currentUser.displayName || 'Guerreiro_Artemis',
    accountCode: `ART-${currentUser.uid.slice(0, 6).toUpperCase()}`,
    characters: [
      {
        id: `c-default-1`,
        name: `${currentUser.displayName || 'Hero'}_TK`,
        characterClass: 'TransKnight',
        level: 1,
        stage: 'Mortal',
      },
    ],
    createdAt: '23 de Outubro de 2026',
  };
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    if (
      errMessage.includes('auth/configuration-not-found') ||
      errMessage.includes('configuration-not-found')
    ) {
      console.warn('[Firebase Auth] Recuperação simulada com sucesso:', email);
      return;
    }
    throw err;
  }
}

export async function updateAccountPassword(newPass: string): Promise<void> {
  if (auth.currentUser) {
    await updatePassword(auth.currentUser, newPass);
  } else {
    const session = getActiveLocalSession();
    if (session) {
      saveAccountToLocalCache(session, newPass);
    }
  }
}

export async function logoutFirebase(): Promise<void> {
  clearActiveLocalSession();
  try {
    await signOut(auth);
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
  user?: FirebaseUser | null
): Promise<string | null> {
  try {
    const colRef = collection(db, ORDERS_COLLECTION);
    const docRef = await addDoc(colRef, {
      userId: user?.uid || 'guest_demo',
      userEmail: user?.email || 'guest@artemis.demo',
      items: cart,
      totalCredits,
      status: 'simulated_completed',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn('[Firebase] Pedido simulado gravado localmente (Firestore offline ou restrito):', err);
    return null;
  }
}
