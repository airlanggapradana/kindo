import { lazy, Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingState from './LoadingState';

const PuskesmasMapModal = lazy(() => import('./PuskesmasMapModal'));

function MapLoading({ onClose }: { onClose: () => void }) {
  const { language } = useLanguage();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={language === 'en' ? 'Loading map' : 'Memuat peta'}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-slate-900">
        <LoadingState />
        <button type="button" autoFocus onClick={onClose} className="min-h-11 w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white">
          {language === 'en' ? 'Close' : 'Tutup'}
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default function DeferredPuskesmasMapModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [hasOpened, setHasOpened] = useState(isOpen);
  useEffect(() => {
    if (isOpen) setHasOpened(true);
  }, [isOpen]);

  // Keep the loaded modal mounted so its exit animation and selections survive closing.
  if (!isOpen && !hasOpened) return null;

  return (
    <Suspense fallback={isOpen ? <MapLoading onClose={onClose} /> : null}>
      <PuskesmasMapModal isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
}
