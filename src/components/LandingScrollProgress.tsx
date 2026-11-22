import React, { useState } from 'react';
import {
  motion,
  MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  AnimatePresence,
} from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';

export interface LandingSectionItem {
  id: string;
  label: string;
}

interface LandingScrollProgressProps {
  progress: MotionValue<number>;
  rawProgress: MotionValue<number>;
  sections: LandingSectionItem[];
  activeSection: string;
  onNavigateSection: (id: string) => void;
}

export default function LandingScrollProgress({
  progress,
  rawProgress,
  sections,
  activeSection,
  onNavigateSection,
}: LandingScrollProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const activeProgress = prefersReducedMotion ? rawProgress : progress;

  const [percent, setPercent] = useState(0);
  const [showFloatingRing, setShowFloatingRing] = useState(false);

  useMotionValueEvent(activeProgress, 'change', (latest) => {
    const clamped = Math.max(0, Math.min(1, latest));
    const nextPercent = Math.round(clamped * 100);
    setPercent((prev) => (prev !== nextPercent ? nextPercent : prev));
    const shouldShow = clamped > 0.08;
    setShowFloatingRing((prev) => (prev !== shouldShow ? shouldShow : prev));
  });

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <>
      {/* 1. Top Edge-to-Edge Luminous Progress Rail (Mobile & Desktop) */}
      <div
        role="progressbar"
        aria-label="Progres gulir halaman"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="fixed top-0 inset-x-0 z-[60] h-[3px] bg-white/[0.06] pointer-events-none"
        style={{ contain: 'strict' }}
      >
        <motion.div
          className="h-full w-full origin-left bg-gradient-to-r from-[#0F766E] via-[#14B8A6] to-[#d9f99d] shadow-[0_0_12px_rgba(217,249,157,0.6)] will-change-transform"
          style={{ scaleX: activeProgress }}
        />
      </div>

      {/* 2. Interactive Vertical Milestone Rail (Desktop Wide) */}
      <aside
        aria-label="Navigasi progres seksi"
        className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-4 select-none"
      >
        <div className="relative flex flex-col items-end gap-5 py-1">
          {/* Vertical Track Line */}
          <div
            aria-hidden="true"
            className="absolute right-[5px] top-2 bottom-2 w-[2px] rounded-full bg-white/10 overflow-hidden"
          >
            <motion.div
              className="w-full h-full origin-top bg-gradient-to-b from-[#14B8A6] via-[#8cc63f] to-[#d9f99d] will-change-transform"
              style={{ scaleY: activeProgress }}
            />
          </div>

          {sections.map((section, idx) => {
            const isActive = activeSection === section.id;
            const activeIdx = sections.findIndex((s) => s.id === activeSection);
            const isPassed = activeIdx > idx;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onNavigateSection(section.id)}
                aria-label={`Ke bagian ${section.label}`}
                aria-current={isActive ? 'location' : undefined}
                className="group relative flex items-center gap-3 py-1 pl-3 pr-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9f99d]/70 rounded-md"
              >
                <span
                  className={cn(
                    'text-[11px] font-medium tracking-wide whitespace-nowrap transition-all duration-200',
                    isActive
                      ? 'text-[#d9f99d] opacity-100 translate-x-0'
                      : 'text-white/55 opacity-0 translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0'
                  )}
                >
                  {section.label}
                </span>

                <span
                  className={cn(
                    'relative z-10 w-3 h-3 rounded-full border transition-all duration-200 flex items-center justify-center shrink-0',
                    isActive
                      ? 'border-[#d9f99d] bg-[#050A07] scale-110 shadow-[0_0_12px_rgba(217,249,157,0.65)]'
                      : isPassed
                      ? 'border-[#14B8A6] bg-[#14B8A6]/30 group-hover:border-[#d9f99d]'
                      : 'border-white/25 bg-[#050A07] group-hover:border-white/60'
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-transform duration-200',
                      isActive
                        ? 'bg-[#d9f99d] scale-100'
                        : isPassed
                        ? 'bg-[#14B8A6] scale-75'
                        : 'bg-white/30 scale-0 group-hover:scale-75'
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>

        {/* Clean Unboxed Tabular Percentage */}
        <div
          aria-hidden="true"
          className="pr-0.5 text-[11px] font-mono tabular-nums font-medium text-white/45 tracking-tight"
        >
          {String(percent).padStart(2, '0')}%
        </div>
      </aside>

      {/* 3. Floating Circular Progress Ring & Back-to-Top Action */}
      <AnimatePresence>
        {showFloatingRing && (
          <motion.button
            key="landing-scroll-top-ring"
            type="button"
            onClick={handleScrollToTop}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            aria-label={`Kembali ke atas (${percent}% halaman digulir)`}
            title="Kembali ke atas"
            className="fixed bottom-6 right-5 sm:right-6 z-40 group w-12 h-12 rounded-full bg-[#0B1410]/90 hover:bg-[#102019] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.55)] flex items-center justify-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9f99d] transform-gpu"
          >
            {/* Circular SVG Progress Ring */}
            <svg
              aria-hidden="true"
              viewBox="0 0 48 48"
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            >
              <defs>
                <linearGradient id="kindoScrollRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#d9f99d" />
                </linearGradient>
              </defs>
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2.5"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="url(#kindoScrollRingGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ pathLength: activeProgress }}
              />
            </svg>

            {/* Center Label: Tabular % while scrolling, ArrowUp on hover or near bottom */}
            <span
              className={cn(
                'relative z-10 text-[11px] font-mono tabular-nums font-semibold text-[#d9f99d] transition-all duration-200',
                percent >= 98
                  ? 'opacity-0 scale-75'
                  : 'opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75'
              )}
            >
              {percent}%
            </span>
            <ArrowUp
              aria-hidden="true"
              className={cn(
                'w-4 h-4 text-[#d9f99d] absolute transition-all duration-200',
                percent >= 98
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-75 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
              )}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
