import React, { useState } from 'react';
import {
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  Eye,
  Layers,
  Loader2,
} from 'lucide-react';
import type { BannerSlide, SlideAlignment, SlideStatus, SlideValidationErrors } from '../../types';
import { presetBannerImages, validateSlide } from '../../data/slidesData';
import { processImageFile } from '../../services/slidesService';

interface SlideEditModalProps {
  isOpen: boolean;
  slide: BannerSlide | null;
  currentTotalSlides: number;
  onClose: () => void;
  onSave: (slide: BannerSlide) => Promise<void>;
}

export const SlideEditModal: React.FC<SlideEditModalProps> = ({
  isOpen,
  slide,
  currentTotalSlides,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(slide);

  // Form states directly initialized from props
  const [title, setTitle] = useState(slide?.title || '');
  const [subtitle, setSubtitle] = useState(slide?.subtitle || '');
  const [description, setDescription] = useState(slide?.description || '');
  const [imageUrl, setImageUrl] = useState(slide?.imageUrl || presetBannerImages[0]?.url || '');
  const [mobileImageUrl, setMobileImageUrl] = useState(slide?.mobileImageUrl || '');
  const [buttonText, setButtonText] = useState(slide?.buttonText || '');
  const [buttonUrl, setButtonUrl] = useState(slide?.buttonUrl || '');
  const [alignment, setAlignment] = useState<SlideAlignment>(slide?.alignment || 'left');
  const [status, setStatus] = useState<SlideStatus>(slide?.status || 'published');
  const [order, setOrder] = useState(slide?.order || currentTotalSlides + 1);
  const [startDate, setStartDate] = useState(slide?.startDate || '');
  const [endDate, setEndDate] = useState(slide?.endDate || '');
  const [overlayIntensity, setOverlayIntensity] = useState<'none' | 'light' | 'medium' | 'dark'>(slide?.overlayIntensity || 'none');

  const [errors, setErrors] = useState<SlideValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const handleFieldChange = () => {
    if (!isDirty) setIsDirty(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processImageFile(file);
      setImageUrl(dataUrl);
      setIsDirty(true);
      setErrors((prev) => ({ ...prev, imageUrl: undefined }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar arquivo.';
      setErrors((prev) => ({ ...prev, imageUrl: msg }));
    }
  };

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: BannerSlide = {
      id: slide?.id || `slide-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim(),
      mobileImageUrl: mobileImageUrl.trim() || undefined,
      buttonText: buttonText.trim() || undefined,
      buttonUrl: buttonUrl.trim() || undefined,
      alignment,
      status,
      order: Number(order) || 1,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      overlayIntensity,
      createdAt: slide?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validationErrors = validateSlide(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(payload);
      setIsDirty(false);
      onClose();
    } catch (err) {
      console.error('Falha ao salvar slide:', err);
      setErrors({ title: 'Erro ao persistir dados do slide.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto rounded-2xl bg-[#0c0f16] border border-[#c99738]/50 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#121622] border-b border-[#c99738]/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#c99738]/20 border border-[#c99738]/40 text-[#ffd978]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#f5ebd6]">
                {isEditing ? 'Editar Slide & Banner' : 'Novo Slide do Carrossel'}
              </h2>
              <p className="text-xs text-[#9d9484]">
                Configure imagem panorâmica, chamada, links e agendamento
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseAttempt}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation prompt for discarding unsaved changes */}
        {showDiscardConfirm && (
          <div className="p-4 bg-amber-950/80 border-b border-amber-600/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Você possui alterações não salvas. Deseja realmente descartar e fechar?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3 py-1 rounded text-xs bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
              >
                Continuar Editando
              </button>
              <button
                onClick={() => {
                  setIsDirty(false);
                  setShowDiscardConfirm(false);
                  onClose();
                }}
                className="px-3 py-1 rounded text-xs bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer"
              >
                Descartar Alterações
              </button>
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Imagem e Presets */}
          <div className="space-y-3">
            <label className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider block">
              1. Imagem Panorâmica do Banner *
            </label>

            {/* Quick preset selector */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-[#8c8577] self-center mr-1">Banners Oficiais:</span>
              {presetBannerImages.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => {
                    setImageUrl(preset.url);
                    handleFieldChange();
                    setErrors((prev) => ({ ...prev, imageUrl: undefined }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    imageUrl === preset.url
                      ? 'bg-[#c99738]/30 border-[#ffd978] text-[#ffd978]'
                      : 'bg-[#141824] border-neutral-800 text-[#b5ac9b] hover:border-[#c99738]/50'
                  }`}
                >
                  {preset.id.replace('banner-', '').toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    handleFieldChange();
                  }}
                  placeholder="URL da imagem (ex: /assets/slides/slide-cadastro.png ou https://...)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#131722] border border-neutral-700 focus:border-[#ffd978] text-sm text-[#f5ebd6] placeholder-neutral-500 focus:outline-none"
                />
                {errors.imageUrl && (
                  <p className="text-xs text-red-400 mt-1">{errors.imageUrl}</p>
                )}
              </div>

              <div>
                <label className="w-full h-full min-h-[42px] px-4 py-2.5 rounded-xl bg-[#182030] hover:bg-[#202a40] border border-[#3b82f6]/40 hover:border-[#60a5fa] text-xs text-[#93c5fd] font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Enviar Arquivo Local</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Mobile Image Option */}
            <div className="pt-1">
              <label className="text-[11px] text-[#9d9484] block mb-1">
                Imagem Específica para Mobile (Opcional — se não informada, a imagem panorâmica principal será ajustada responsivamente):
              </label>
              <input
                type="text"
                value={mobileImageUrl}
                onChange={(e) => {
                  setMobileImageUrl(e.target.value);
                  handleFieldChange();
                }}
                placeholder="URL da imagem otimizada para smartphones (opcional)"
                className="w-full px-4 py-2 rounded-xl bg-[#131722] border border-neutral-800 focus:border-[#ffd978] text-xs text-[#f5ebd6] placeholder-neutral-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Textos e Chamadas */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <label className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider block">
              2. Textos e Conteúdo do Slide
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#b8b09f] block mb-1">Título do Slide *</label>
                <input
                  type="text"
                  value={title}
                  maxLength={100}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    handleFieldChange();
                  }}
                  placeholder="Ex: Cadastre-se e Faça Parte"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#131722] border border-neutral-700 focus:border-[#ffd978] text-sm text-[#f5ebd6] placeholder-neutral-500 focus:outline-none"
                />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="text-xs text-[#b8b09f] block mb-1">Subtítulo (Opcional)</label>
                <input
                  type="text"
                  value={subtitle}
                  maxLength={120}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    handleFieldChange();
                  }}
                  placeholder="Ex: O Renascimento das Batalhas Épicas"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#131722] border border-neutral-700 focus:border-[#ffd978] text-sm text-[#f5ebd6] placeholder-neutral-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#b8b09f] block mb-1">Texto de Apoio / Descrição (Opcional)</label>
              <textarea
                value={description}
                rows={2}
                maxLength={300}
                onChange={(e) => {
                  setDescription(e.target.value);
                  handleFieldChange();
                }}
                placeholder="Breve texto descritivo que acompanha o banner..."
                className="w-full px-4 py-2 rounded-xl bg-[#131722] border border-neutral-700 focus:border-[#ffd978] text-sm text-[#f5ebd6] placeholder-neutral-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Section 3: Botão de Ação & Alinhamento */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <label className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider block">
              3. Botão de Chamada para Ação (CTA) & Alinhamento
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#b8b09f] block mb-1">Texto do Botão (Opcional)</label>
                <input
                  type="text"
                  value={buttonText}
                  maxLength={40}
                  onChange={(e) => {
                    setButtonText(e.target.value);
                    handleFieldChange();
                  }}
                  placeholder="Ex: Cadastrar Agora"
                  className="w-full px-4 py-2 rounded-xl bg-[#131722] border border-neutral-700 focus:border-[#ffd978] text-sm text-[#f5ebd6] placeholder-neutral-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#b8b09f] block mb-1">Destino do Botão (URL ou Rota)</label>
                <input
                  type="text"
                  value={buttonUrl}
                  onChange={(e) => {
                    setButtonUrl(e.target.value);
                    handleFieldChange();
                  }}
                  placeholder="Ex: /area-jogador ou https://..."
                  className="w-full px-4 py-2 rounded-xl bg-[#131722] border border-neutral-700 focus:border-[#ffd978] text-sm text-[#f5ebd6] placeholder-neutral-500 focus:outline-none"
                />
                {errors.buttonUrl && <p className="text-xs text-red-400 mt-1">{errors.buttonUrl}</p>}
              </div>

              <div>
                <label className="text-xs text-[#b8b09f] block mb-1">Alinhamento do Conteúdo</label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#131722] border border-neutral-800">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      type="button"
                      key={align}
                      onClick={() => {
                        setAlignment(align);
                        handleFieldChange();
                      }}
                      className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                        alignment === align
                          ? 'bg-[#c99738] text-black font-bold'
                          : 'text-[#9c9484] hover:text-white'
                      }`}
                    >
                      {align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Publicação, Agendamento e Ordem */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <label className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider block">
              4. Status, Ordem e Janela de Publicação
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-[#b8b09f] block mb-1">Status de Publicação</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as SlideStatus);
                    handleFieldChange();
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#131722] border border-neutral-700 text-sm text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none cursor-pointer"
                >
                  <option value="published">Publicado (Ativo)</option>
                  <option value="draft">Rascunho (Não visível)</option>
                  <option value="inactive">Inativo (Desativado)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#b8b09f] block mb-1">Ordem de Exibição</label>
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => {
                    setOrder(parseInt(e.target.value, 10) || 1);
                    handleFieldChange();
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#131722] border border-neutral-700 text-sm text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none font-mono"
                />
                {errors.order && <p className="text-xs text-red-400 mt-1">{errors.order}</p>}
              </div>

              <div>
                <label className="text-xs text-[#b8b09f] block mb-1">Início da Publicação (Opcional)</label>
                <input
                  type="datetime-local"
                  value={startDate ? startDate.slice(0, 16) : ''}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    handleFieldChange();
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#131722] border border-neutral-700 text-xs text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#b8b09f] block mb-1">Fim da Publicação (Opcional)</label>
                <input
                  type="datetime-local"
                  value={endDate ? endDate.slice(0, 16) : ''}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    handleFieldChange();
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#131722] border border-neutral-700 text-xs text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none"
                />
                {errors.endDate && <p className="text-xs text-red-400 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs text-[#b8b09f] block mb-1">Contraste de Vinheta / Escurecimento:</label>
              <select
                value={overlayIntensity}
                onChange={(e) => {
                  setOverlayIntensity(e.target.value as 'none' | 'light' | 'medium' | 'dark');
                  handleFieldChange();
                }}
                className="w-full sm:w-64 px-3 py-2 rounded-xl bg-[#131722] border border-neutral-700 text-xs text-[#f5ebd6] focus:border-[#ffd978] focus:outline-none cursor-pointer"
              >
                <option value="none">Puro (Arte 100% natural sem vinheta extra)</option>
                <option value="light">Suave (Gradiente leve no rodapé)</option>
                <option value="medium">Médio (Equilibrado para arte e textos)</option>
                <option value="dark">Intenso (Foco máximo na legibilidade dos textos)</option>
              </select>
            </div>
          </div>

          {/* Section 5: Pré-Visualização em Tempo Real */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-[#ffd978] uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#ffd978]" />
                <span>Pré-Visualização do Banner em Tempo Real</span>
              </span>

              <div className="flex items-center gap-1 bg-[#131722] p-0.5 rounded-lg border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab('desktop')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    previewTab === 'desktop' ? 'bg-[#c99738] text-black font-semibold' : 'text-[#8c8475]'
                  }`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('mobile')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    previewTab === 'mobile' ? 'bg-[#c99738] text-black font-semibold' : 'text-[#8c8475]'
                  }`}
                >
                  Mobile
                </button>
              </div>
            </div>

            {/* Live Banner Mock */}
            <div
              className={`relative rounded-xl overflow-hidden border border-[#c99738]/50 bg-black mx-auto transition-all ${
                previewTab === 'mobile' ? 'max-w-sm h-48' : 'w-full h-56'
              }`}
            >
              {imageUrl ? (
                <img
                  src={previewTab === 'mobile' && mobileImageUrl ? mobileImageUrl : imageUrl}
                  alt="Pré-visualização do Slide"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 bg-[#10141f]">
                  Selecione ou envie uma imagem para visualizar
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Text and Button Overlay */}
              <div
                className={`absolute bottom-3 left-4 right-4 flex items-end justify-between gap-4 pointer-events-none ${
                  alignment === 'center' ? 'text-center justify-center' : alignment === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#ffd978] drop-shadow-md">
                    {title || 'Título de Exemplo'}
                  </h4>
                  {subtitle && (
                    <p className="text-xs text-[#ede3cc] drop-shadow-md">{subtitle}</p>
                  )}
                </div>

                {buttonText && (
                  <span className="btn-gold-primary px-3 py-1 rounded text-[11px] font-serif font-bold shrink-0">
                    {buttonText}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#c99738]/30 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs text-[#8c8577]">
              * Os slides publicados e ativos são exibidos automaticamente na página inicial.
            </span>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="flex-1 sm:flex-initial text-center px-4 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-xs text-[#c5bcab] font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial text-center justify-center btn-gold-primary px-6 py-2.5 rounded-xl text-xs font-serif font-bold flex items-center gap-2 shadow-[0_4px_15px_rgba(201,151,56,0.3)] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#140e07]" />
                    <span>Salvando Slide...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>{isEditing ? 'Atualizar Slide' : 'Publicar Slide'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
