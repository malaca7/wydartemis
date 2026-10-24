import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { BannerSlide } from '../../types';
import { filterActiveSlides } from '../../data/slidesData';
import { subscribeSlides } from '../../services/slidesService';

interface HomeCarouselProps {
  autoPlayIntervalMs?: number;
  initialSlides?: BannerSlide[];
}

export const HomeCarousel: React.FC<HomeCarouselProps> = ({
  autoPlayIntervalMs = 6000,
  initialSlides,
}) => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<BannerSlide[]>(initialSlides || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Subscribe to real-time slides
  useEffect(() => {
    const unsub = subscribeSlides((updated) => {
      setSlides(updated);
    });
    return () => unsub();
  }, []);

  // Listen for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Filter only active and published slides
  const activeSlides = useMemo(() => {
    return filterActiveSlides(slides);
  }, [slides]);

  const total = activeSlides.length;
  const safeCurrentIndex = total > 0 && currentIndex >= total ? 0 : currentIndex;

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex((prev) => {
      const next = (index + total) % (total || 1);
      return next === prev ? prev : next;
    });
    setProgress(0);
    lastTickTimeRef.current = Date.now();
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    goToSlide(currentIndex + 1);
  }, [goToSlide, currentIndex, total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    goToSlide(currentIndex - 1);
  }, [goToSlide, currentIndex, total]);

  // Autoplay loop with smooth progress tracking
  useEffect(() => {
    if (total <= 1 || prefersReducedMotion || isPaused || isHovered) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    lastTickTimeRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const elapsed = now - lastTickTimeRef.current;
      const currentPct = Math.min((elapsed / autoPlayIntervalMs) * 100, 100);
      setProgress(currentPct);

      if (elapsed >= autoPlayIntervalMs) {
        handleNext();
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [total, prefersReducedMotion, isPaused, isHovered, autoPlayIntervalMs, handleNext, currentIndex]);

  // Pause when browser tab is inactive / hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
        lastTickTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (total <= 1) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(total - 1);
    }
  };

  // Touch Swipe for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || total <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const swipeThreshold = 50;

    if (diff > swipeThreshold) {
      handleNext();
    } else if (diff < -swipeThreshold) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const handleSlideClick = (slide: BannerSlide) => {
    if (!slide.buttonUrl) return;
    const url = slide.buttonUrl.trim();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(url);
    }
  };

  // Fallback se não existirem slides ativos
  if (total === 0) {
    return (
      <section
        id="explore-section"
        className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        aria-label="Carrossel de Banners do WYD Artemis"
      >
        <div className="relative rounded-2xl overflow-hidden border border-[#c99738]/30 bg-gradient-to-r from-[#0c0f17] via-[#141a27] to-[#0c0f17] p-8 sm:p-12 text-center shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1b2232] border border-[#c99738]/40 text-xs text-[#ffd978] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#ffd978]" />
            <span>Crônicas de Artemis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5ebd6] mb-2">
            Novos Comunicados e Banners em Preparação
          </h2>
          <p className="text-sm text-[#a8a090] max-w-xl mx-auto leading-relaxed">
            Nossos escribas e mestres do reino estão forjando novas novidades. Acompanhe os anúncios oficiais no portal.
          </p>
        </div>
      </section>
    );
  }

  const currentSlide = activeSlides[safeCurrentIndex];

  return (
    <section
      id="explore-section"
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Banners e Anúncios em Destaque do WYD Artemis"
      className="relative py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto focus:outline-none focus:ring-1 focus:ring-[#ffd978]/60 rounded-3xl"
    >
      {/* Decorative Section Eyebrow */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#ffd978] shadow-[0_0_8px_#ffd978]" />
          <span className="text-xs font-serif uppercase tracking-widest text-[#ffd978] font-semibold">
            Destaques & Comunicados Oficiais
          </span>
        </div>

        {total > 1 && (
          <div className="flex items-center gap-3 text-xs text-[#8f887b]">
            <span className="font-mono text-[#d6cebe]">
              <strong className="text-[#ffd978]">0{safeCurrentIndex + 1}</strong> / 0{total}
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1 rounded bg-[#131722] hover:bg-[#1f273a] text-[#ffd978] border border-[#c99738]/30 transition-colors focus:outline-none focus:ring-1 focus:ring-[#ffd978]"
              aria-label={isPaused ? 'Retomar reprodução automática' : 'Pausar reprodução automática'}
              title={isPaused ? 'Retomar (Play)' : 'Pausar (Pause)'}
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>

      {/* Main Panoramic Slide Frame */}
      <div className="relative rounded-2xl overflow-hidden border border-[#c99738]/50 bg-[#090b10] shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(201,151,56,0.18)] group">
        
        {/* Subtle Medieval Gilded Corner Ornaments */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#ffd978]/70 z-20 pointer-events-none rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#ffd978]/70 z-20 pointer-events-none rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#ffd978]/70 z-20 pointer-events-none rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#ffd978]/70 z-20 pointer-events-none rounded-br-sm" />

        {/* Panoramic Banner Container (Responsive Heights preserving art proportion) */}
        <div className="relative w-full h-[220px] sm:h-[300px] md:h-[380px] lg:h-[430px] xl:h-[460px] overflow-hidden">
          {activeSlides.map((slide, idx) => {
            const isCurrent = idx === safeCurrentIndex;
            const isEager = idx === 0;

            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${idx + 1} de ${total}: ${slide.title}`}
                aria-hidden={!isCurrent}
                onClick={() => handleSlideClick(slide)}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${
                  isCurrent ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
                style={{
                  transitionProperty: prefersReducedMotion ? 'none' : 'opacity',
                }}
              >
                {/* Background Image: Desktop & Mobile fallback */}
                <picture>
                  {slide.mobileImageUrl && (
                    <source media="(max-width: 767px)" srcSet={slide.mobileImageUrl} />
                  )}
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    loading={isEager ? 'eager' : 'lazy'}
                    fetchPriority={isEager ? 'high' : 'auto'}
                    className={`w-full h-full object-cover object-center transition-transform duration-1000 ${
                      isCurrent && !prefersReducedMotion ? 'scale-100' : 'scale-[1.02]'
                    }`}
                  />
                </picture>

                {/* Subtle Cinematic Vignette for Depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 pointer-events-none" />

                {/* Optional Interactive CTA Button & Badges Overlay */}
                {slide.buttonText && slide.buttonUrl && (
                  <div
                    className={`absolute bottom-4 sm:bottom-6 z-20 px-6 sm:px-10 flex ${
                      slide.alignment === 'left'
                        ? 'justify-start left-0'
                        : slide.alignment === 'center'
                        ? 'justify-center left-0 right-0'
                        : 'justify-end right-0'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlideClick(slide);
                      }}
                      className="btn-gold-primary px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm font-serif font-bold tracking-wide flex items-center gap-2 shadow-[0_8px_25px_rgba(201,151,56,0.45)] group/btn cursor-pointer"
                    >
                      <span>{slide.buttonText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows (Visible only if total > 1) */}
        {total > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-[#07090e]/80 hover:bg-[#c99738]/20 border border-[#c99738]/50 hover:border-[#ffd978] text-[#f5ebd6] hover:text-[#ffd978] shadow-[0_4px_15px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#ffd978] cursor-pointer"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-[#07090e]/80 hover:bg-[#c99738]/20 border border-[#c99738]/50 hover:border-[#ffd978] text-[#f5ebd6] hover:text-[#ffd978] shadow-[0_4px_15px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#ffd978] cursor-pointer"
              aria-label="Próximo slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators (Gems) */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#c99738]/30">
            {activeSlides.map((_, idx) => {
              const isActive = idx === safeCurrentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#ffd978] ${
                    isActive
                      ? 'w-7 h-2 bg-gradient-to-r from-[#c99738] to-[#ffd978] shadow-[0_0_10px_#ffd978]'
                      : 'w-2 h-2 bg-neutral-600 hover:bg-[#c99738]/80'
                  }`}
                  aria-label={`Ir para o slide ${idx + 1}`}
                  aria-current={isActive ? 'true' : 'false'}
                />
              );
            })}
          </div>
        )}

        {/* Autoplay Progress Line at bottom */}
        {total > 1 && !isPaused && !prefersReducedMotion && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 z-30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3b82f6] via-[#ffd978] to-[#c99738] shadow-[0_0_8px_#ffd978]"
              style={{ width: `${progress}%`, transition: 'width 80ms linear' }}
            />
          </div>
        )}
      </div>

      {/* Active Slide Caption Details */}
      {currentSlide && (
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#a8a090] gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#ffd978] text-sm">
              {currentSlide.title}
            </span>
            {currentSlide.subtitle && (
              <>
                <span className="text-neutral-600 hidden sm:inline">•</span>
                <span className="text-[#d8d0c2] hidden sm:inline">{currentSlide.subtitle}</span>
              </>
            )}
          </div>
          {currentSlide.description && (
            <p className="text-[11px] text-[#8c8577] max-w-xl truncate">
              {currentSlide.description}
            </p>
          )}
        </div>
      )}
    </section>
  );
};
