import React, { useState } from 'react';
import { MedievalDivider } from '../components/common/MedievalDivider';
import { useModal } from '../context/ModalContext';
import {
  User,
  Lock,
  Mail,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export const PlayerAreaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const { openPendingModal } = useModal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || (activeTab !== 'recovery' && !password.trim())) {
      setFormFeedback('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Explicit demonstrative feedback without saving passwords or tokens
    openPendingModal({
      title: 'Simulação da Área do Jogador',
      featureName: activeTab === 'login' ? 'Autenticação' : activeTab === 'register' ? 'Cadastro de Conta' : 'Recuperação',
      description: 'Por conformidade com as diretrizes do projeto, este formulário é um protótipo estritamente demonstrativo de interface. Nenhuma credencial é armazenada e o banco de dados do servidor ainda não está conectado.',
      type: 'auth',
    });

    setFormFeedback('Aviso demonstrativo: Nenhuma credencial foi transmitida ou armazenada.');
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#9e9585] mb-8 font-medium">
        <span>Início</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
        <span className="text-[#ffd978]">Área do Jogador</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#c99738] mb-2 block">
          Portal de Acesso
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold gold-gradient-text tracking-wide mb-4">
          Área do Jogador
        </h1>
        <p className="text-[#b5ac9c] text-sm md:text-base leading-relaxed">
          Gerencie sua conta de guerreiro, visualize seus personagens e acompanhe seus dados no reino.
        </p>
        <MedievalDivider variant="gold" className="my-6" />
      </div>

      {/* Form Container */}
      <div className="max-w-md mx-auto medieval-panel rounded-2xl p-6 sm:p-8 border border-[#c99738]/40 shadow-2xl relative">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd978]/60 to-transparent" />

        {/* Tab selection */}
        <div className="flex border-b border-neutral-800 mb-6 text-xs font-serif font-bold">
          <button
            onClick={() => {
              setActiveTab('login');
              setFormFeedback(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'border-[#ffd978] text-[#ffd978]'
                : 'border-transparent text-[#9e9585] hover:text-[#d6cebe]'
            }`}
          >
            Acessar Conta
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setFormFeedback(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'border-[#ffd978] text-[#ffd978]'
                : 'border-transparent text-[#9e9585] hover:text-[#d6cebe]'
            }`}
          >
            Criar Conta
          </button>
          <button
            onClick={() => {
              setActiveTab('recovery');
              setFormFeedback(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'recovery'
                ? 'border-[#ffd978] text-[#ffd978]'
                : 'border-transparent text-[#9e9585] hover:text-[#d6cebe]'
            }`}
          >
            Recuperar
          </button>
        </div>

        {/* Demonstrative Alert */}
        <div className="mb-6 p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-200/90 text-[11px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <p>
            Protótipo visual: As operações abaixo são simulações. Nenhuma senha ou dado confidencial é registrado no navegador ou servidor.
          </p>
        </div>

        {formFeedback && (
          <div className="mb-4 p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-200 text-xs">
            {formFeedback}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
              Usuário / Login
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Seu login no jogo"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500"
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                E-mail para Validação
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500"
                />
              </div>
            </div>
          )}

          {activeTab !== 'recovery' && (
            <div>
              <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738] placeholder-neutral-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full btn-gold-primary py-3 rounded-lg text-xs font-serif font-bold tracking-wider mt-2 cursor-pointer shadow-lg"
          >
            {activeTab === 'login' && 'Entrar no Painel (Simulação)'}
            {activeTab === 'register' && 'Criar Conta (Simulação)'}
            {activeTab === 'recovery' && 'Solicitar Recuperação (Simulação)'}
          </button>
        </form>
      </div>
    </div>
  );
};
