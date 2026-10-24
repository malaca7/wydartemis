import React from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import { useModal } from '../hooks/useModal';
import {
  Download,
  HardDrive,
  Cpu,
  Monitor,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export const DownloadPage: React.FC = () => {
  const { openPendingModal } = useModal();

  const handleDownloadClick = () => {
    openPendingModal({
      title: 'Instalador do WYD Artemis',
      featureName: 'Download do Cliente Oficial',
      description: 'O link oficial de download do cliente de jogo está em fase de configuração pela equipe de infraestrutura. Não foram criados links fictícios para garantir sua segurança.',
      type: 'download',
    });
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9e9585] mb-8 font-medium">
        <span>Início</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
        <span className="text-[#ffd978]">Download do Cliente</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#c99738] mb-2 block">
          Acesso ao Reino
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-wide mb-4">
          Baixar o Cliente WYD Artemis
        </h1>
        <p className="text-[#b5ac9c] text-sm md:text-base leading-relaxed">
          Prepare sua máquina para a jornada medieval. Instalação rápida, compatibilidade com Windows e inicializador com proteção integrada.
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Download Main Card */}
      <div className="medieval-panel rounded-2xl p-6 sm:p-10 border border-[#c99738]/40 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978]/50 to-transparent" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-950/40 border border-amber-700/50 text-xs text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Versão do Cliente: v1.0.0 Alpha (Em Preparação)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5efe2]">
              Instalador Completo do Jogo
            </h2>

            <p className="text-[#c5bcab] text-sm leading-relaxed">
              Inclui todos os mapas, arquivos de áudio sinfônico originais, texturas otimizadas e lançador com verificação automática de integridade de arquivos.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[#a8a090] pt-2">
              <div className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#c99738]" />
                <span>Tamanho aproximado: ~1.8 GB</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Assinatura Digital & Anti-Cheat</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadClick}
              className="w-full sm:w-auto btn-gold-primary px-10 py-4 rounded-xl text-base font-serif font-bold flex items-center justify-center gap-3 cursor-pointer shadow-2xl"
            >
              <Download className="w-5 h-5" />
              <span>Download em Breve</span>
            </button>
            <span className="text-[11px] text-amber-300 font-medium bg-amber-950/60 px-3 py-1 rounded border border-amber-800/50">
              Link oficial em configuração
            </span>
          </div>
        </div>
      </div>

      {/* System Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="medieval-panel rounded-xl p-6 border border-neutral-800">
          <h3 className="font-serif font-bold text-lg text-[#ffd978] mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#c99738]" />
            <span>Requisitos Mínimos</span>
          </h3>
          <ul className="space-y-3 text-xs text-[#c5bcab]">
            <li className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Sistema Operacional:</span>
              <span>Windows 10 / 11 (64-bit)</span>
            </li>
            <li className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Processador (CPU):</span>
              <span>Intel Core i3 ou AMD equivalente</span>
            </li>
            <li className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Memória RAM:</span>
              <span>4 GB RAM</span>
            </li>
            <li className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Placa de Vídeo:</span>
              <span>DirectX 9.0c compatível</span>
            </li>
            <li className="flex justify-between py-1.5">
              <span className="text-neutral-400">Armazenamento:</span>
              <span>5 GB de espaço livre</span>
            </li>
          </ul>
        </div>

        <div className="medieval-panel rounded-xl p-6 border border-[#c99738]/30">
          <h3 className="font-serif font-bold text-lg text-[#ffd978] mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-[#ffd978]" />
            <span>Requisitos Recomendados</span>
          </h3>
          <ul className="space-y-3 text-xs text-[#c5bcab]">
            <li className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Sistema Operacional:</span>
              <span>Windows 11 (64-bit)</span>
            </li>
            <li className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Processador (CPU):</span>
              <span>Intel Core i5 / AMD Ryzen 5 ou superior</span>
            </li>
            <li className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Memória RAM:</span>
              <span>8 GB RAM</span>
            </li>
            <li className="flex justify-between py-1.5 border-b border-neutral-800">
              <span className="text-neutral-400">Placa de Vídeo:</span>
              <span>NVIDIA GTX 1050 / AMD RX 560 ou superior</span>
            </li>
            <li className="flex justify-between py-1.5">
              <span className="text-neutral-400">Armazenamento:</span>
              <span>SSD com 10 GB de espaço livre</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="medieval-panel rounded-xl p-6 border border-neutral-800 mb-8">
        <h3 className="font-serif font-bold text-base text-[#f5efe2] mb-4">
          Instruções de Instalação do Cliente
        </h3>
        <ol className="space-y-2.5 text-xs text-[#a8a090] list-decimal list-inside leading-relaxed">
          <li>Baixe o instalador oficial quando o link for divulgado pela administração.</li>
          <li>Execute o instalador e escolha a pasta de destino de sua preferência.</li>
          <li>Abra o lançador <code className="text-[#ffd978] bg-black/40 px-1 py-0.5 rounded">WYDArtemisLauncher.exe</code> como administrador.</li>
          <li>Aguarde a verificação de arquivos e atualizações automáticas antes de iniciar.</li>
        </ol>
      </div>

      {/* Demonstrative Alert */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-xs flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
        <p>
          Aviso de segurança: Não baixe instaladores de fontes terceiras não oficiais. O link oficial será adicionado nesta página assim que for confirmado pela administração.
        </p>
      </div>
    </div>
  );
};
