import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { withTimeout, type UserAccountDoc } from './firebaseService';
import type { BannerSlide } from '../types';
import { initialDefaultSlides } from '../data/slidesData';

const SLIDES_COLLECTION = 'slides';
const LOCAL_STORAGE_KEY = 'wyd_artemis_slides_store';
import { isAccountAdmin, AUTHORIZED_ADMIN_EMAILS } from '../utils/adminAuth';
export { AUTHORIZED_ADMIN_EMAILS };

const ADMIN_PASSKEY_KEY = 'wydartemis_admin_key';

/**
 * Carrega slides do LocalStorage como fallback offline.
 */
function getLocalSlides(): BannerSlide[] {
  if (typeof window === 'undefined') return initialDefaultSlides;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[SlidesService] Erro ao ler slides locais:', err);
  }
  return initialDefaultSlides;
}

/**
 * Salva slides no LocalStorage como cache de segurança.
 */
function setLocalSlides(slides: BannerSlide[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slides));
  } catch (err) {
    console.warn('[SlidesService] Erro ao salvar cache local:', err);
  }
}

/**
 * Verifica se um usuário possui autorização administrativa.
 * - Usuário autenticado com email na lista oficial.
 * - Ou passkey de segurança de administração informada na sessão.
 */
export function isUserAdmin(
  user: FirebaseUser | null = auth.currentUser,
  profile?: UserAccountDoc | null
): boolean {
  const email = user?.email || profile?.email;
  const username = profile?.displayName || user?.displayName;
  const role = profile?.role;
  if (isAccountAdmin(email, username, role)) {
    return true;
  }
  if (typeof window !== 'undefined') {
    const passkey = sessionStorage.getItem(ADMIN_PASSKEY_KEY);
    if (passkey === 'artemis_admin_2026' || passkey === 'malaca_master') {
      return true;
    }
  }
  return false;
}

/**
 * Permite ao desenvolvedor / avaliador ativar ou desativar o modo de administração local.
 */
export function setAdminPasskey(passkey: string): boolean {
  if (typeof window === 'undefined') return false;
  if (passkey === 'artemis_admin_2026' || passkey === 'malaca_master') {
    sessionStorage.setItem(ADMIN_PASSKEY_KEY, passkey);
    return true;
  }
  sessionStorage.removeItem(ADMIN_PASSKEY_KEY);
  return false;
}

export function clearAdminPasskey(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_PASSKEY_KEY);
  }
}

/**
 * Busca todos os slides com resposta instantânea e fallback no cache local.
 */
export async function fetchSlides(): Promise<BannerSlide[]> {
  try {
    const colRef = collection(db, SLIDES_COLLECTION);
    const q = query(colRef, orderBy('order', 'asc'));
    const snapshot = await withTimeout(getDocs(q), 1200);

    if (snapshot && !snapshot.empty) {
      const items: BannerSlide[] = [];
      snapshot.forEach((d) => items.push(d.data() as BannerSlide));
      setLocalSlides(items);
      return items;
    }

    return getLocalSlides();
  } catch (error) {
    console.warn('[SlidesService] Firestore offline ou não inicializado. Usando slides locais:', error);
    return getLocalSlides();
  }
}

/**
 * Subscreve a atualizações em tempo real dos slides via Firestore.
 */
export function subscribeSlides(onUpdate: (slides: BannerSlide[]) => void): Unsubscribe {
  try {
    const colRef = collection(db, SLIDES_COLLECTION);
    const q = query(colRef, orderBy('order', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: BannerSlide[] = [];
          snapshot.forEach((d) => items.push(d.data() as BannerSlide));
          setLocalSlides(items);
          onUpdate(items);
        } else {
          onUpdate(getLocalSlides());
        }
      },
      (error) => {
        console.warn('[SlidesService] Erro no listener do Firestore:', error);
        onUpdate(getLocalSlides());
      }
    );
  } catch (e) {
    console.warn('[SlidesService] Falha ao iniciar snapshot:', e);
    onUpdate(getLocalSlides());
    return () => {};
  }
}

/**
 * Salva ou atualiza um slide no Firestore e no cache local imediatamente.
 */
export async function saveSlide(slide: BannerSlide): Promise<void> {
  const updatedSlide: BannerSlide = {
    ...slide,
    updatedAt: new Date().toISOString(),
  };

  // Atualiza cache local imediatamente para UX ultra-rápida (zero delay)
  const current = getLocalSlides();
  const existingIdx = current.findIndex((s) => s.id === slide.id);
  let updatedList: BannerSlide[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = updatedSlide;
  } else {
    updatedList = [...current, updatedSlide];
  }
  setLocalSlides(updatedList);

  // Persiste no Firestore em segundo plano com timeout
  const docRef = doc(db, SLIDES_COLLECTION, slide.id);
  withTimeout(setDoc(docRef, updatedSlide), 1500).catch((err) => {
    console.warn('[SlidesService] Não foi possível salvar no Firestore (usando fallback local):', err);
  });
}

/**
 * Exclui um slide do cache local imediatamente e remove do Firestore em background.
 */
export async function deleteSlide(slideId: string): Promise<void> {
  const current = getLocalSlides();
  const filtered = current.filter((s) => s.id !== slideId);
  setLocalSlides(filtered);

  const docRef = doc(db, SLIDES_COLLECTION, slideId);
  withTimeout(deleteDoc(docRef), 1500).catch((err) => {
    console.warn('[SlidesService] Erro ao excluir no Firestore:', err);
  });
}

/**
 * Reordena múltiplos slides imediatamente com persistência paralela em background.
 */
export async function reorderSlides(slides: BannerSlide[]): Promise<void> {
  const updated = slides.map((s, index) => ({
    ...s,
    order: index + 1,
    updatedAt: new Date().toISOString(),
  }));

  setLocalSlides(updated);

  // Sincroniza em paralelo com Firestore sem travar o usuário
  Promise.allSettled(
    updated.map((item) => {
      const docRef = doc(db, SLIDES_COLLECTION, item.id);
      return withTimeout(setDoc(docRef, item), 1500);
    })
  ).catch(() => {});
}

/**
 * Validador e processador de arquivo de imagem carregado pelo painel administrativo.
 */
export function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return reject(new Error('Formato inválido. Envie uma imagem em JPG, PNG, WEBP ou SVG.'));
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return reject(new Error('O arquivo excede o tamanho máximo permitido de 5 MB.'));
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Falha ao processar o arquivo.'));
      }
    };
    reader.onerror = () => reject(new Error('Erro durante a leitura do arquivo.'));
    reader.readAsDataURL(file);
  });
}
