import type { BannerSlide, ServerStatusSnapshot } from '../types';
import { fetchSlides, reorderSlides } from './slidesService';
import { fetchServerStatus, updateServerStatusInFirestore } from './firebaseService';

export interface ArtemisSystemBackup {
  formatVersion: '1.0.0';
  exportedAt: string;
  project: 'WYD Artemis';
  cluster: string;
  slides: BannerSlide[];
  serverStatus: ServerStatusSnapshot;
}

/**
 * Exporta todos os dados do portal em um arquivo JSON de backup para o administrador.
 */
export async function exportSystemBackup(): Promise<void> {
  const [slides, serverStatus] = await Promise.all([
    fetchSlides(),
    fetchServerStatus(),
  ]);

  const backupData: ArtemisSystemBackup = {
    formatVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    project: 'WYD Artemis',
    cluster: 'artemis-e4d33',
    slides,
    serverStatus,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `wyd_artemis_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Valida e restaura dados a partir de um arquivo JSON de backup.
 */
export async function restoreSystemBackup(file: File): Promise<{
  success: boolean;
  message: string;
  restoredSlidesCount: number;
}> {
  return new Promise((resolve) => {
    if (!file.name.endsWith('.json')) {
      return resolve({
        success: false,
        message: 'Formato de arquivo inválido. Selecione um arquivo de backup com extensão .json.',
        restoredSlidesCount: 0,
      });
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const content = typeof reader.result === 'string' ? reader.result : '';
        const parsed = JSON.parse(content) as ArtemisSystemBackup;

        if (parsed.project !== 'WYD Artemis' || !Array.isArray(parsed.slides)) {
          return resolve({
            success: false,
            message: 'O arquivo não é um backup compatível do WYD Artemis.',
            restoredSlidesCount: 0,
          });
        }

        // Restaura slides
        if (parsed.slides.length > 0) {
          await reorderSlides(parsed.slides);
        }

        // Restaura status do servidor se presente
        if (parsed.serverStatus) {
          await updateServerStatusInFirestore(parsed.serverStatus).catch(() => {});
        }

        resolve({
          success: true,
          message: `Backup restaurado com sucesso! ${parsed.slides.length} slides sincronizados.`,
          restoredSlidesCount: parsed.slides.length,
        });
      } catch (err) {
        resolve({
          success: false,
          message: `Erro ao processar o arquivo de backup: ${err instanceof Error ? err.message : 'JSON corrompido'}.`,
          restoredSlidesCount: 0,
        });
      }
    };
    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Erro durante a leitura do arquivo no navegador.',
        restoredSlidesCount: 0,
      });
    };
    reader.readAsText(file);
  });
}
