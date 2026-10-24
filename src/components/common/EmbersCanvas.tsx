import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  type: 'gold' | 'arcane';
  sizePulse: number;
  pulseSpeed: number;
}

export const EmbersCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    let animationFrameId: number;
    let isVisible = true;
    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 18 : 36;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const createParticle = (initialY?: number): Particle => {
      const isArcane = Math.random() > 0.65; // ~35% arcane sapphire motes, ~65% golden embers
      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.65 + 0.25,
        speedX: (Math.random() - 0.5) * 0.45,
        opacity: Math.random() * 0.75 + 0.2,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        type: isArcane ? 'arcane' : 'gold',
        sizePulse: Math.random() * Math.PI,
        pulseSpeed: Math.random() * 0.03 + 0.015,
      };
    };

    const particles: Particle[] = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle());
    }

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Pause rendering when canvas is scrolled completely out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting && !document.hidden;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += p.speedX;
        p.opacity -= p.fadeSpeed;
        p.sizePulse += p.pulseSpeed;

        if (p.opacity <= 0 || p.y < -15) {
          particles[i] = createParticle(height + 10);
          continue;
        }

        const currentRadius = p.radius + Math.sin(p.sizePulse) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(currentRadius, 0.5), 0, Math.PI * 2);

        if (p.type === 'arcane') {
          // Sapphire blue celestial crystal motes
          ctx.fillStyle = `rgba(96, 165, 250, ${p.opacity})`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(59, 130, 246, ${p.opacity * 0.9})`;
        } else {
          // Gilded medieval ember sparks
          ctx.fillStyle = `rgba(255, 217, 120, ${p.opacity})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(201, 151, 56, ${p.opacity * 0.85})`;
        }

        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-70"
      aria-hidden="true"
    />
  );
};
