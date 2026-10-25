import React, { useState, useEffect } from 'react';
import {
  Server,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  FileJson,
} from 'lucide-react';
import type { ServerState, ServerStatusSnapshot } from '../../types';
import { fetchServerStatus, updateServerStatusInFirestore } from '../../services/firebaseService';
import { exportSystemBackup, restoreSystemBackup } from '../../services/backupService';
import { addAuditLog } from '../../utils/adminAuth';

interface ServerSettingsTabProps {
  onNotify: (message: string, type: 'success' | 'error') => void;
  onResetBanners: () => void;
}

export const ServerSettingsTab: React.FC<ServerSettingsTabProps> = ({
  onNotify,
  onResetBanners,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ServerStatusSnapshot>({
    state: 'online',
    onlinePlayers: 48,
    lastUpdated: new Date().toISOString(),
    message: 'Servidor oficial WYD Artemis operando em alta estabilidade.',
    source: 'live',
  });
  const [targetState, setTargetState] = useState<ServerState>('online');
  const [statusMessage, setStatusMessage] = useState('');
  const [playerCount, setPlayerCount] = useState<number>(48);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  useEffect(() => {
    fetchServerStatus()
      .then((data) => {
        if (data) {
          setCurrentStatus(data);
          setTargetState(data.state || 'online');
          setStatusMessage(data.message || '');
          setPlayerCount(data.onlinePlayers || 48);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveServerStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStatus(true);
    try {
      const updated: ServerStatusSnapshot = {
        state: targetState,
        onlinePlayers: playerCount,
        message: statusMessage.trim() || null,
        lastUpdated: new Date().toISOString(),
        source: 'live',
      };
      await updateServerStatusInFirestore(updated);
      setCurrentStatus(updated);
      addAuditLog(
        'Alteração de Status do Servidor',
        `Estado alterado para [${targetState}], jogadores: ${playerCount}, msg: "${statusMessage}".`,
        'MALACA',
        targetState === 'maintenance' || targetState === 'offline' ? 'warning' : 'info'
      );
      onNotify('Status do servidor atualizado com sucesso no Firestore e portal!', 'success');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Falha ao sincronizar status do servidor.', 'error');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      await exportSystemBackup();
      addAuditLog('Backup Exportado', 'Backup completo do sistema gerado em formato JSON.', 'MALACA', 'info');
      onNotify('Arquivo de backup baixado com sucesso!', 'success');
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Falha ao exportar backup.', 'error');
    }
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoringBackup(true);
    try {
      const result = await restoreSystemBackup(file);
      if (result.success) {
        addAuditLog('Restauração de Backup', `Backup restaurado do arquivo ${file.name}.`, 'MALACA', 'critical');
        onNotify(result.message, 'success');
      } else {
        onNotify(result.message, 'error');
      }
    } catch (err) {
      onNotify(err instanceof Error ? err.message : 'Erro ao processar arquivo de backup.', 'error');
    } finally {
      setIsRestoringBackup(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Controle do Status do Servidor */}
      <div className="medieval-panel rounded-2xl p-6 border border-[#c99738]/40 shadow-xl">
        <div className="flex items-center gap-3 pb-5 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-[#141924] border border-[#c99738]/40 flex items-center justify-center text-[#ffd978]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#f5ebd6]">
              Estado Operacional & Comunicação do Reino
            </h3>
            <p className="text-xs text-[#9d9484]">
              Defina se o servidor está liberado para conexão, em manutenção ou indisponível.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveServerStatus} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#ffd978] block mb-2">
                Estado do Servidor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'online', label: 'Online', color: 'border-emerald-700 bg-emerald-950/40 text-emerald-300' },
                  { value: 'maintenance', label: 'Manutenção', color: 'border-amber-700 bg-amber-950/40 text-amber-300' },
                  { value: 'offline', label: 'Offline', color: 'border-red-700 bg-red-950/40 text-red-300' },
                ].map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setTargetState(st.value as ServerState)}
                    className={`py-2 px-1 text-xs font-serif font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      targetState === st.value
                        ? `${st.color} shadow-[0_0_12px_rgba(255,217,120,0.2)] ring-1 ring-[#ffd978]`
                        : 'border-neutral-800 bg-[#121622] text-neutral-400 opacity-60'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#b8b09f] block mb-2">
                Jogadores Conectados (Simulação / Telemetria)
              </label>
              <input
                type="number"
                min={0}
                max={5000}
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-[#121622] border border-neutral-700 text-xs text-[#ffd978] font-bold font-mono focus:border-[#ffd978] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#b8b09f] block mb-2">
                Última Atualização
              </label>
              <div className="px-4 py-2 rounded-xl bg-[#121622] border border-neutral-800 text-xs text-neutral-400 font-mono">
                {currentStatus.lastUpdated
                  ? new Date(currentStatus.lastUpdated).toLocaleString()
                  : 'Sincronizado'}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#b8b09f] block mb-1">
              Aviso Oficial do Servidor (Exibido no Cabeçalho e Página de Status)
            </label>
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="Ex: Servidor online com Guerra de Cidades programada para 20:00h..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#121622] border border-neutral-700 text-xs text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-neutral-800">
            <button
              type="submit"
              disabled={isSavingStatus}
              className="btn-gold-primary px-5 py-2.5 rounded-xl text-xs font-serif font-bold flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSavingStatus ? 'Gravando...' : 'Aplicar Status do Servidor'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Operações de Backup & Banco de Dados */}
      <div className="medieval-panel rounded-2xl p-6 border border-[#c99738]/40 shadow-xl">
        <div className="flex items-center gap-3 pb-5 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-[#141924] border border-[#c99738]/40 flex items-center justify-center text-[#ffd978]">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#f5ebd6]">
              Backup, Restauração & Preservação do Sistema
            </h3>
            <p className="text-xs text-[#9d9484]">
              Gere backups completos dos banners, status e configurações para segurança contra perdas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Exportar */}
          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-serif font-bold text-sm text-[#ffd978] flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>Exportar Backup JSON</span>
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Baixa um arquivo completo contendo todos os dados e banners atuais do portal.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="btn-medieval-secondary w-full py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#ffd978]" />
              <span>Baixar Arquivo JSON</span>
            </button>
          </div>

          {/* Restaurar */}
          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-serif font-bold text-sm text-blue-300 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Restaurar de Arquivo JSON</span>
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Carregue um arquivo JSON gerado anteriormente para restaurar o estado dos banners e servidor.
              </p>
            </div>
            <label className="btn-medieval-secondary w-full py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>{isRestoringBackup ? 'Processando...' : 'Selecionar Arquivo'}</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileRestore}
                disabled={isRestoringBackup}
              />
            </label>
          </div>

          {/* Reset dos 5 Banners */}
          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800 flex flex-col justify-between space-y-4">
            <div>
              <h4 className="font-serif font-bold text-sm text-amber-300 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Redefinir Banners Padrão</span>
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Recarrega os 5 banners medievais cinematográficos oficiais pré-definidos do WYD Artemis.
              </p>
            </div>
            <button
              onClick={onResetBanners}
              className="btn-medieval-secondary w-full py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restaurar 5 Banners</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
