import { useEffect, useRef } from 'react';

export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>() => {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.classList.add('is-visible');
      el.querySelectorAll('.scroll-reveal').forEach((child) => {
        child.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (el.classList.contains('scroll-reveal')) {
      observer.observe(el);
    }

    const targets = el.querySelectorAll('.scroll-reveal');
    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, []);

  return containerRef;
};
