import { Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoadingState() {
  const { language } = useLanguage();

  return (
    <div role="status" aria-live="polite" className="flex min-h-48 items-center justify-center gap-3 p-6 text-teal-700 dark:text-teal-300">
      <Loader2 aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none" />
      <span>{language === 'en' ? 'Loading…' : 'Memuat…'}</span>
    </div>
  );
}
