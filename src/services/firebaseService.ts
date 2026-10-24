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

export interface UserAccountDoc {
  uid: string;
  email: string;
  displayName: string;
  accountCode: string;
  characters: DemoCharacter[];
  createdAt: string;
}

export async function registerWithFirebase(
  username: string,
  email: string,
  pass: string
): Promise<UserAccountDoc> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  // Set Auth display name
  await updateProfile(user, { displayName: username });

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const accountCode = `ART-${new Date().getFullYear()}-${randomDigits}`;

  const starterCharacters: DemoCharacter[] = [
    {
      id: `char-${user.uid}-1`,
      name: `${username}_TK`,
      characterClass: 'TransKnight',
      level: 1,
      stage: 'Mortal',
    },
    {
      id: `char-${user.uid}-2`,
      name: `${username}_Foema`,
      characterClass: 'Foema',
      level: 1,
      stage: 'Mortal',
    },
  ];

  const profileData: UserAccountDoc = {
    uid: user.uid,
    email: user.email || email,
    displayName: username,
    accountCode,
    characters: starterCharacters,
    createdAt: new Date().toLocaleDateString('pt-BR'),
  };

  // Save to Firestore
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
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

  // If user entered a username instead of an email, create domain alias
  if (!email.includes('@')) {
    email = `${email.toLowerCase().replace(/[^a-z0-9_]/g, '')}@artemis.realm`;
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return fetchUserProfile(userCredential.user.uid);
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
  if (!currentUser) return null;

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
    createdAt: new Date().toLocaleDateString('pt-BR'),
  };
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function updateAccountPassword(newPass: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Nenhum usuário autenticado.');
  }
  await updatePassword(auth.currentUser, newPass);
}

export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
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
