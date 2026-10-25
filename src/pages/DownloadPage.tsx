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
        <div className="medieval-panel rounded-xl p-5 sm:p-6 border border-neutral-800">
          <h3 className="font-serif font-bold text-lg text-[#ffd978] mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#c99738]" />
            <span>Requisitos Mínimos</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-[#c5bcab]">
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-neutral-800 gap-0.5">
              <span className="text-neutral-400">Sistema Operacional:</span>
              <span className="font-medium text-[#ede3cc]">Windows 10 / 11 (64-bit)</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-neutral-800 gap-0.5">
              <span className="text-neutral-400">Processador (CPU):</span>
              <span className="font-medium text-[#ede3cc]">Intel Core i3 ou AMD equivalente</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-neutral-800 gap-0.5">
              <span className="text-neutral-400">Memória RAM:</span>
              <span className="font-medium text-[#ede3cc]">4 GB RAM</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-neutral-800 gap-0.5">
              <span className="text-neutral-400">Placa de Vídeo:</span>
              <span className="font-medium text-[#ede3cc]">DirectX 9.0c compatível</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 gap-0.5">
              <span className="text-neutral-400">Armazenamento:</span>
              <span className="font-medium text-[#ede3cc]">5 GB de espaço livre</span>
            </li>
          </ul>
        </div>

        <div className="medieval-panel rounded-xl p-5 sm:p-6 border border-[#c99738]/30">
          <h3 className="font-serif font-bold text-lg text-[#ffd978] mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-[#ffd978]" />
            <span>Requisitos Recomendados</span>
          </h3>
          <ul className="space-y-2.5 text-xs text-[#c5bcab]">
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-neutral-800 gap-0.5">
              <span className="text-neutral-400">Sistema Operacional:</span>
              <span className="font-medium text-[#ede3cc]">Windows 11 (64-bit)</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-neutral-800 gap-0.5">
              <span className="text-neutral-400">Processador (CPU):</span>
              <span className="font-medium text-[#ede3cc]">Intel Core i5 / AMD Ryzen 5 ou superior</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-neutral-800 gap-0.5">
              <span className="text-neutral-400">Memória RAM:</span>
              <span className="font-medium text-[#ede3cc]">8 GB RAM</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 border-b border-neutral-800 gap-0.5">
              <span className="text-neutral-400">Placa de Vídeo:</span>
              <span className="font-medium text-[#ede3cc]">NVIDIA GTX 1050 / AMD RX 560 ou superior</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1.5 gap-0.5">
              <span className="text-neutral-400">Armazenamento:</span>
              <span className="font-medium text-[#ede3cc]">SSD com 10 GB de espaço livre</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Step-by-Step Installation Cards */}
      <div className="medieval-panel rounded-2xl p-5 sm:p-8 border border-[#c99738]/40 mb-10 shadow-xl">
        <h3 className="font-serif font-bold text-xl text-[#f5efe2] mb-6 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#ffd978]" />
          <span>Guia Passo a Passo de Instalação</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-[#c99738]/20 text-[#ffd978] border border-[#c99738]/50 inline-flex items-center justify-center text-xs font-serif font-bold">
              1
            </span>
            <h4 className="font-serif font-bold text-sm text-[#ffd978]">Download & Extração</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Baixe o instalador oficial. Recomendamos instalar em <code className="text-[#ffd978] bg-black/40 px-1 py-0.5 rounded">C:\WYD Artemis</code> para evitar bloqueios de permissão do Windows.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-[#c99738]/20 text-[#ffd978] border border-[#c99738]/50 inline-flex items-center justify-center text-xs font-serif font-bold">
              2
            </span>
            <h4 className="font-serif font-bold text-sm text-[#ffd978]">Modo Administrador</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Clique com o botão direito em <code className="text-[#ffd978] bg-black/40 px-1 py-0.5 rounded">Launcher.exe</code> e marque "Executar como Administrador" para garantir atualização correta.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-[#c99738]/20 text-[#ffd978] border border-[#c99738]/50 inline-flex items-center justify-center text-xs font-serif font-bold">
              3
            </span>
            <h4 className="font-serif font-bold text-sm text-[#ffd978]">Configuração de Vídeo</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Abra o <code className="text-[#ffd978] bg-black/40 px-1 py-0.5 rounded">Config.exe</code> para selecionar sua resolução nativa, modo janela ou tela cheia e profundidade de cor 32-bit.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0f131c] border border-neutral-800 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-[#c99738]/20 text-[#ffd978] border border-[#c99738]/50 inline-flex items-center justify-center text-xs font-serif font-bold">
              4
            </span>
            <h4 className="font-serif font-bold text-sm text-[#ffd978]">Exceção do Antivírus</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Adicione a pasta do jogo às exceções do Windows Defender caso o anti-cheat de proteção seja temporariamente sinalizado como falso positivo.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Support Banner */}
      <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <p className="text-amber-200/90 leading-relaxed">
            <strong>Segurança Oficial:</strong> Nunca baixe executáveis de terceiros ou patches não verificados. Em caso de dúvidas técnicas na instalação, procure o suporte da nossa comunidade no Discord.
          </p>
        </div>
        <a
          href="https://discord.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold-primary px-4 py-2 rounded-lg font-serif font-bold shrink-0 text-center cursor-pointer shadow"
        >
          Canal de Suporte
        </a>
      </div>
    </div>
  );
};
