import React, { useState } from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import {
  Server,
  Activity,
  Radio,
  Clock,
  ShieldCheck,
  ChevronRight,
  Info,
  Layers,
  Cpu,
} from 'lucide-react';
import {
  initialServerStatus,
  serverStateMetas,
  serverSpecifications,
} from '../data/serverStatusData';
import {
  subscribeServerStatus,
  updateServerStatusInFirestore,
} from '../services/firebaseService';
import type { ServerState, ServerStatusSnapshot } from '../types';

export const ServerStatusPage: React.FC = () => {
  const [currentSnapshot, setCurrentSnapshot] = useState<ServerStatusSnapshot>(initialServerStatus);
  const [selectedState, setSelectedState] = useState<ServerState>(initialServerStatus.state);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  React.useEffect(() => {
    const unsub = subscribeServerStatus((snapshot) => {
      setCurrentSnapshot(snapshot);
      setSelectedState(snapshot.state);
      setIsFirebaseConnected(true);
    });
    return () => unsub();
  }, []);

  const handleStateChange = async (st: ServerState) => {
    setSelectedState(st);
    try {
      await updateServerStatusInFirestore({
        state: st,
        onlinePlayers: st === 'online' ? 248 : st === 'maintenance' ? 0 : null,
      });
    } catch (e) {
      console.warn('Erro ao atualizar status no Firestore:', e);
    }
  };

  const activeMeta = serverStateMetas[selectedState];

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9e9585] mb-8 font-medium">
        <span>Início</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
        <span className="text-[#ffd978]">Status da Infraestrutura</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#c99738] mb-2 block">
          Monitoramento do Reino
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-wide mb-4">
          Status do Servidor
        </h1>
        <p className="text-[#b5ac9c] text-sm md:text-base leading-relaxed">
          Acompanhe a disponibilidade dos nós de conexão, serviços de login e canais de batalha do WYD Artemis.
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Status Hero Card */}
      <div className="medieval-panel rounded-2xl p-6 sm:p-10 border border-[#c99738]/40 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978]/60 to-transparent" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-neutral-800">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${activeMeta.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${activeMeta.dotClass}`} />
                {activeMeta.label}
              </span>
              <span className="text-[11px] text-[#8c8475] uppercase tracking-wider font-mono">
                Cluster: Artemis-BR01
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe2]">
              Reino Artemis • Servidor Principal
            </h2>

            <p className="text-xs sm:text-sm text-[#a8a090] max-w-2xl leading-relaxed">
              {currentSnapshot.message}
            </p>
          </div>

          {/* Firestore Telemetry Status Box */}
          <div className="w-full lg:w-auto p-4 rounded-xl bg-[#0b0e14] border border-[#c99738]/30 flex flex-col gap-1 text-xs shadow-inner">
            <span className="text-[10px] text-neutral-400 uppercase font-semibold">Base de Dados</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-emerald-300 font-medium">
                {isFirebaseConnected ? 'Firebase Firestore Conectado' : 'Conectando ao Firestore...'}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 pt-1 font-mono">
              Doc: server_status/current
            </span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#9c9484]">Guerreiros Online</span>
              <Activity className="w-4 h-4 text-[#c99738]" />
            </div>
            <div className="text-2xl font-mono font-bold text-[#f5efe2]">
              {currentSnapshot.onlinePlayers !== null ? currentSnapshot.onlinePlayers : '—'}
            </div>
            <span className="text-[10px] text-neutral-500">
              Disponível após abertura oficial
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#9c9484]">Serviço de Login</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg font-serif font-bold text-[#ffd978]">
              {selectedState === 'unconnected' ? 'Não Conectado' : selectedState === 'online' ? 'Ativo' : 'Pendente'}
            </div>
            <span className="text-[10px] text-neutral-500">
              Porta 8281 (Configuração)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#9c9484]">Serviço de Jogo (World)</span>
              <Radio className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-lg font-serif font-bold text-[#ffd978]">
              {selectedState === 'unconnected' ? 'Não Conectado' : selectedState === 'online' ? 'Ativo' : 'Pendente'}
            </div>
            <span className="text-[10px] text-neutral-500">
              Portas 7514-7518
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#9c9484]">Última Leitura</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-mono font-bold text-[#ffd978]">
              {currentSnapshot.lastUpdated || 'Aguardando Início'}
            </div>
            <span className="text-[10px] text-neutral-500">
              Frequência oficial: 30s
            </span>
          </div>
        </div>
      </div>

      {/* State Switcher for UX Prototype Review */}
      <div className="medieval-panel rounded-xl p-5 mb-10 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider block">
            Simulador de Estados de Interface (Validação Técnica)
          </span>
          <p className="text-xs text-[#9c9484]">
            Alterne entre os estados visuais para inspecionar os estilos previstos para a infraestrutura:
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(serverStateMetas) as ServerState[]).map((st) => (
            <button
              key={st}
              onClick={() => handleStateChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                selectedState === st
                  ? 'bg-[#c99738] text-black font-bold shadow'
                  : 'bg-[#141822] text-[#9c9484] border border-neutral-800 hover:text-[#ede3cc]'
              }`}
            >
              {serverStateMetas[st].label}
            </button>
          ))}
        </div>
      </div>

      {/* Server Technical Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 medieval-panel rounded-xl p-6 border border-[#c99738]/30">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
            <Cpu className="w-5 h-5 text-[#ffd978]" />
            <h3 className="font-serif font-bold text-lg text-[#f5efe2]">
              Parâmetros Operacionais Previstos
            </h3>
          </div>

          <div className="divide-y divide-neutral-800/80">
            {serverSpecifications.map((spec, index) => (
              <div key={index} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div>
                  <span className="font-medium text-[#ffd978] block">{spec.label}</span>
                  <span className="text-[#8c8475]">{spec.detail}</span>
                </div>
                <span className="font-mono text-[#f5efe2] font-semibold sm:text-right shrink-0">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Infrastructure Pillars */}
        <div className="medieval-panel rounded-xl p-6 border border-[#c99738]/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
              <Layers className="w-5 h-5 text-[#ffd978]" />
              <h3 className="font-serif font-bold text-lg text-[#f5efe2]">
                Infraestrutura & Segurança
              </h3>
            </div>

            <div className="space-y-3 text-xs text-[#a8a090] leading-relaxed">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Mitigação DDoS em Camadas:</strong> Proteção de borda com filtragem de pacotes maliciosos UDP/TCP em tempo real.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Backups Georredundantes:</strong> Cópias de segurança periódicas da base de dados e inventários.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Auditoria Contínua:</strong> Detecção preventiva de anomalias em transações e pacotes do jogo.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 mt-6 flex items-center gap-2 text-xs text-[#8c8475]">
            <Info className="w-4 h-4 text-[#c99738] shrink-0" />
            <span>Dados de arquitetura demonstrativos.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
