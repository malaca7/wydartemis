import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Swords,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { DemoCharacter, CharacterClass, GameAccount } from '../../types';

interface GameCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAccount: GameAccount | null;
  characterToEdit?: DemoCharacter | null;
  onSave: (data: {
    name: string;
    characterClass: CharacterClass;
    level: number;
    stage: 'Mortal' | 'Arch' | 'Celestial' | 'Sub-Celestial';
  }) => Promise<void>;
}

const CLASS_CONFIGS: {
  id: CharacterClass;
  name: string;
  badge: string;
  role: string;
  colorBorder: string;
  colorBg: string;
  colorText: string;
}[] = [
  {
    id: 'TransKnight',
    name: 'TransKnight (TK)',
    badge: 'Guerreiro & Defensor',
    role: 'Combate corpo a corpo, maestria em montarias e defesa sagrada.',
    colorBorder: 'border-amber-500/50',
    colorBg: 'bg-amber-950/20',
    colorText: 'text-amber-300',
  },
  {
    id: 'Foema',
    name: 'Foema (FM)',
    badge: 'Maga & Curandeira',
    role: 'Magias elementais de gelo, fogo e feitiços de cura divina.',
    colorBorder: 'border-blue-500/50',
    colorBg: 'bg-blue-950/20',
    colorText: 'text-blue-300',
  },
  {
    id: 'BeastMaster',
    name: 'BeastMaster (BM)',
    badge: 'Evocador & Metamorfo',
    role: 'Domínio sobre criaturas selvagens, venenos e formas elementais.',
    colorBorder: 'border-emerald-500/50',
    colorBg: 'bg-emerald-950/20',
    colorText: 'text-emerald-300',
  },
  {
    id: 'Huntress',
    name: 'Huntress (HT)',
    badge: 'Arqueira & Assassina',
    role: 'Ataques à distância com arcos mortais, armadilhas e agilidade.',
    colorBorder: 'border-purple-500/50',
    colorBg: 'bg-purple-950/20',
    colorText: 'text-purple-300',
  },
];

export const GameCharacterModal: React.FC<GameCharacterModalProps> = ({
  isOpen,
  onClose,
  targetAccount,
  characterToEdit,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState<CharacterClass>('TransKnight');
  const [level, setLevel] = useState<number>(1);
  const [stage, setStage] = useState<'Mortal' | 'Arch' | 'Celestial' | 'Sub-Celestial'>('Mortal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isEditMode = Boolean(characterToEdit);

  useEffect(() => {
    if (characterToEdit) {
      setName(characterToEdit.name);
      setCharacterClass(characterToEdit.characterClass);
      setLevel(characterToEdit.level || 1);
      setStage(
        (characterToEdit.stage as 'Mortal' | 'Arch' | 'Celestial' | 'Sub-Celestial') || 'Mortal'
      );
    } else {
      setName('');
      setCharacterClass('TransKnight');
      setLevel(1);
      setStage('Mortal');
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [characterToEdit, isOpen]);

  if (!isOpen || !targetAccount) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 3 || cleanName.length > 14) {
      setErrorMsg('O nome do personagem deve conter entre 3 e 14 caracteres.');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(cleanName)) {
      setErrorMsg('O nome do personagem pode conter apenas letras, números e hífens.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: cleanName,
        characterClass,
        level: Math.max(1, Math.min(400, Number(level) || 1)),
        stage,
      });

      setSuccessMsg(
        isEditMode
          ? 'Personagem atualizado com sucesso!'
          : 'Personagem criado com sucesso na conta de jogo!'
      );

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar personagem.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="medieval-panel max-w-lg w-full rounded-2xl p-6 border border-[#c99738]/50 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#ffd978]/10 border border-[#c99738]/40 text-[#ffd978]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#f5efe2]">
                {isEditMode ? 'Editar Personagem' : 'Criar Novo Personagem'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                Conta de Jogo: <span className="font-mono text-[#ffd978]">{targetAccount.username}</span> ({targetAccount.characters?.length || 0}/4 Slots preenchidos)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Personagem */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
              Nome do Personagem (Nick) *
            </label>
            <div className="relative">
              <Swords className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Artemis_Blade"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738]"
              />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              De 3 a 14 caracteres alfanuméricos. Visível para todos os jogadores do reino.
            </p>
          </div>

          {/* Seleção de Classe */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-2">
              Classe do Personagem *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CLASS_CONFIGS.map((cfg) => {
                const isSelected = characterClass === cfg.id;
                return (
                  <button
                    type="button"
                    key={cfg.id}
                    onClick={() => setCharacterClass(cfg.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? `${cfg.colorBorder} ${cfg.colorBg} shadow-[0_0_12px_rgba(201,151,56,0.25)]`
                        : 'border-neutral-800 bg-[#121620]/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-serif font-bold ${isSelected ? cfg.colorText : 'text-[#f5efe2]'}`}>
                        {cfg.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#ffd978] shadow-[0_0_6px_#ffd978]" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#c99738] block font-medium">
                      {cfg.badge}
                    </span>
                    <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2">
                      {cfg.role}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evolução e Nível */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                Evolução (Stage) *
              </label>
              <select
                value={stage}
                onChange={(e) =>
                  setStage(e.target.value as 'Mortal' | 'Arch' | 'Celestial' | 'Sub-Celestial')
                }
                className="w-full px-3 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] focus:outline-none focus:border-[#c99738]"
              >
                <option value="Mortal">Mortal (Nv. 1 - 400)</option>
                <option value="Arch">Arch (Nv. 1 - 400)</option>
                <option value="Celestial">Celestial (Nv. 1 - 400)</option>
                <option value="Sub-Celestial">Sub-Celestial (Nv. 1 - 400)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#d6cebe] uppercase tracking-wider mb-1.5">
                Nível do Personagem (1 a 400) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={400}
                  required
                  value={level}
                  onChange={(e) => setLevel(Math.max(1, Math.min(400, Number(e.target.value))))}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#11141c] border border-neutral-800 text-xs text-[#ede3cc] font-mono focus:outline-none focus:border-[#c99738]"
                />
                <button
                  type="button"
                  onClick={() => setLevel(1)}
                  className="px-2 py-2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 hover:text-white"
                  title="Nível 1 Inicial"
                >
                  Nv. 1
                </button>
                <button
                  type="button"
                  onClick={() => setLevel(355)}
                  className="px-2 py-2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 hover:text-white"
                  title="Nível 355 Quest"
                >
                  355
                </button>
                <button
                  type="button"
                  onClick={() => setLevel(400)}
                  className="px-2 py-2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-[#ffd978] hover:text-[#fff0ba]"
                  title="Nível 400 Máximo"
                >
                  400
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold-primary px-5 py-2.5 rounded-lg text-xs font-serif font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#140e07]" />
                  <span>Processando...</span>
                </>
              ) : isEditMode ? (
                'Salvar Alterações'
              ) : (
                'Criar Personagem'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
