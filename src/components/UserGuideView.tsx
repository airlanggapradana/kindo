import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Baby, BookOpen, Check, ClipboardCheck, Copy, HeartHandshake, HelpCircle, Info, Languages, List, MapPin, Moon, Search, ShieldCheck, Stethoscope, Sun, Users, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import type { UserRole } from '../types';
import { filterGuideChapters, GUIDE_AUDIENCES, GUIDE_CHAPTERS, GUIDE_REVIEWED_AT } from '../data/guideData';
import type { GuideAction, GuideAudience, GuideLanguage, GuideSection } from '../data/guideData';
import { KINDO_LOGO_URL } from './PageTransition';
import './UserGuideView.css';

interface UserGuideViewProps {
  userRole?: UserRole;
  isSignedIn: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onAction: (action: GuideAction) => void;
}

const chapterIcons: Record<string, typeof BookOpen> = {
  'mengenal-kindo': BookOpen,
  'akun-dan-pengaturan': Users,
  'profil-dan-pertumbuhan': Baby,
  'skrining-kpsp': ClipboardCheck,
  'edukasi-dan-stimulasi': HeartHandshake,
  'konsultasi-dan-puskesmas': MapPin,
  'panduan-nakes': Stethoscope,
  'panduan-admin': ShieldCheck,
  'privasi-dan-faq': HelpCircle,
};
const focusStyle = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600 dark:focus-visible:outline-teal-300';

function GuideSectionContent({ section, chapterNumber, sectionIndex, lang }: {
  section: GuideSection;
  chapterNumber: number;
  sectionIndex: number;
  lang: GuideLanguage;
}) {
  return (
    <section aria-labelledby={`guide-section-${sectionIndex}`}>
      <h3 id={`guide-section-${sectionIndex}`} className="guide-section-heading">
        <span aria-hidden="true">{chapterNumber}.{sectionIndex + 1}</span>
        {section.title[lang]}
      </h3>
      {section.paragraphs?.map((paragraph, i) => (
        <p key={i} className="guide-paragraph">{paragraph[lang]}</p>
      ))}
      {section.steps && (
        <ol className="guide-steps">
          {section.steps.map((step, i) => <li key={i}>{step[lang]}</li>)}
        </ol>
      )}
      {section.bullets && (
        <ul className="guide-bullets">
          {section.bullets.map((bullet, i) => <li key={i}>{bullet[lang]}</li>)}
        </ul>
      )}
      {section.note && (
        <aside className="guide-note">
          <span className="guide-note-icon"><Info size={18} aria-hidden="true" /></span>
          <div>
            <p className="guide-note-title">{lang === 'en' ? 'A helpful note' : 'Catatan'}</p>
            <p>{section.note[lang]}</p>
          </div>
        </aside>
      )}
      {section.questions && (
        <div className="guide-questions">
          {section.questions.map((faq, i) => (
            <details key={i}>
              <summary className={focusStyle}>{faq.question[lang]}</summary>
              <p>{faq.answer[lang]}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

export default function UserGuideView({ userRole, isSignedIn, theme, onToggleTheme, onAction }: UserGuideViewProps) {
  const { language, setLanguage } = useLanguage();
  const lang = language === 'en' ? 'en' : 'id';
  const en = lang === 'en';
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const query = (params.get('q') || '').slice(0, 160);
  const audience: GuideAudience = GUIDE_AUDIENCES.find(item => item.id === params.get('peran'))?.id || 'all';
  const chapters = useMemo(() => filterGuideChapters(query, audience), [query, audience]);
  const active = chapters.find(chapter => chapter.id === location.hash.slice(1)) || chapters[0];
  const activeIndex = active ? chapters.indexOf(active) : -1;
  const chapterNumber = active ? GUIDE_CHAPTERS.indexOf(active) + 1 : 0;
  const [tocOpen, setTocOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setCopyStatus('idle');
    if (!active || location.hash !== `#${active.id}`) return;
    const frame = window.requestAnimationFrame(() => {
      // Keep typing uninterrupted when a search updates the selected chapter.
      if (document.activeElement instanceof HTMLInputElement) return;
      articleRef.current?.focus({ preventScroll: true });
      articleRef.current?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active?.id, location.hash]);

  useEffect(() => {
    if (copyStatus === 'idle') return;
    const timer = window.setTimeout(() => setCopyStatus('idle'), 3000);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const updateFilters = (nextQuery: string, nextAudience: GuideAudience) => {
    const nextParams = new URLSearchParams();
    if (nextQuery) nextParams.set('q', nextQuery);
    if (nextAudience !== 'all') nextParams.set('peran', nextAudience);
    const matches = filterGuideChapters(nextQuery, nextAudience);
    const nextChapter = matches.find(chapter => chapter.id === active?.id) || matches[0];
    navigate({ pathname: '/panduan', search: nextParams.toString(), hash: nextChapter ? `#${nextChapter.id}` : '' }, { replace: true });
  };

  const openChapter = (id: string, resetFilters = false) => {
    setTocOpen(false);
    navigate({ pathname: '/panduan', search: resetFilters ? '' : location.search, hash: `#${id}` });
  };

  const copyChapterLink = async () => {
    if (!active) return;
    try {
      const url = new URL('/panduan', window.location.origin);
      url.hash = active.id;
      await navigator.clipboard.writeText(url.href);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  };

  const renderContents = () => (
    <nav aria-label={en ? 'Guide chapters' : 'Bab buku panduan'} className="guide-contents space-y-1">
      {chapters.map(chapter => {
        const Icon = chapterIcons[chapter.id] || BookOpen;
        const selected = chapter.id === active?.id;
        return (
          <Link
            key={chapter.id}
            to={{ pathname: '/panduan', search: location.search, hash: `#${chapter.id}` }}
            onClick={() => setTocOpen(false)}
            aria-current={selected ? 'page' : undefined}
            className={cn('flex min-h-12 items-start gap-3 transition-colors', focusStyle)}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="guide-contents-title">{chapter.title[lang]}</span>
            <span className="guide-contents-number" aria-hidden="true">{String(GUIDE_CHAPTERS.indexOf(chapter) + 1).padStart(2, '0')}</span>
          </Link>
        );
      })}
    </nav>
  );

  const quickStarts = userRole === 'nakes'
    ? ['panduan-nakes', 'konsultasi-dan-puskesmas', 'skrining-kpsp']
    : userRole === 'admin'
      ? ['panduan-admin', 'akun-dan-pengaturan', 'privasi-dan-faq']
      : ['akun-dan-pengaturan', 'profil-dan-pertumbuhan', 'skrining-kpsp'];
  const action = active?.action;
  const canShowAction = action && (!isSignedIn || (userRole && action.roles.includes(userRole)));

  return (
    <div lang={lang} className="guide-page min-h-screen text-slate-900 dark:text-slate-100">
      <a href={active ? `#${active.id}` : '#guide-content'} className="sr-only rounded-lg bg-teal-700 p-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">
        {en ? 'Skip to guide' : 'Langsung ke isi panduan'}
      </a>
      <header className="guide-header border-b">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label={en ? 'KINDO home' : 'Beranda KINDO'} className={cn('flex items-center gap-3 rounded-lg', focusStyle)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1"><img src={KINDO_LOGO_URL} alt="" width={36} height={36} referrerPolicy="no-referrer" className="h-9 w-9 object-contain" /></span>
            <span className="font-extrabold tracking-widest">KINDO<span className="mt-0.5 block text-xs font-medium tracking-normal text-slate-500 dark:text-slate-400">{en ? 'Help center' : 'Pusat bantuan'}</span></span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => setLanguage(en ? 'id' : 'en')} aria-label={en ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'} className={cn('inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800', focusStyle)}>
              <Languages className="h-4 w-4" aria-hidden="true" />{en ? 'EN' : 'ID'}
            </button>
            <button type="button" onClick={onToggleTheme} aria-label={theme === 'dark' ? (en ? 'Use light mode' : 'Gunakan mode terang') : (en ? 'Use dark mode' : 'Gunakan mode gelap')} className={cn('flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800', focusStyle)}>
              {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            </button>
            <Link to="/" className={cn('inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 sm:px-4', focusStyle)}>
              {isSignedIn ? (en ? 'Back to app' : 'Kembali ke aplikasi') : (en ? 'Home' : 'Beranda')}
            </Link>
          </div>
        </div>
      </header>

      <main id="guide-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 pb-16 pt-6 outline-none sm:px-6 sm:pt-8 lg:px-8">
        <section aria-labelledby="guide-title" className="guide-hero">
          <div className="guide-hero-copy">
            <p className="guide-eyebrow"><span />{en ? 'THE KINDO HANDBOOK' : 'PANDUAN PENGGUNA KINDO'}</p>
            <h1 id="guide-title" aria-label={en ? 'KINDO User Guide' : 'Buku Panduan KINDO'}>{en ? <>KINDO<br /><span className="guide-title-accent">User Guide</span></> : <>Buku Panduan<br /><span className="guide-title-accent">KINDO</span></>}</h1>
            <img src="/illustrations/guide-family-v1.webp" alt="" aria-hidden="true" className="guide-mobile-family" width={1312} height={1199} />
            <p className="guide-hero-description">{en ? 'A little guidance for every step. Get to know KINDO, keep your child’s records, and find the help you need.' : 'Sedikit panduan untuk setiap langkah. Kenali KINDO, catat tumbuh kembang si kecil, dan temukan bantuan yang Anda perlukan.'}</p>
            <div className="guide-hero-meta"><BookOpen size={16} aria-hidden="true" /><span>{en ? `${GUIDE_CHAPTERS.length} chapters, at your own pace` : `${GUIDE_CHAPTERS.length} bab, pelajari sesuai kebutuhan`}</span><span className="guide-meta-divider" /><span>{en ? 'For families & professionals' : 'Untuk keluarga & tenaga kesehatan'}</span></div>
          </div>
          <div className="guide-cover-scene" aria-hidden="true">
            <div className="guide-cover-backdrop" />
            <div className="guide-book">
              <div className="guide-book-spine" />
              <div className="guide-book-face">
                <div className="guide-book-brand"><span className="guide-book-logo"><img src={KINDO_LOGO_URL} alt="" width={28} height={28} referrerPolicy="no-referrer" /></span>KINDO</div>
                <p className="guide-book-kicker">{en ? 'A GUIDE TO' : 'BUKU PANDUAN'}</p>
                <p className="guide-book-title">{en ? <>Growing<br />together<span>.</span></> : <>Tumbuh<br />bersama<span>.</span></>}</p>
                <img src="/illustrations/guide-family-v1.webp" alt="" className="guide-book-art" width={1312} height={1199} />
                <div className="guide-book-footer"><span>{en ? 'GROWTH & DEVELOPMENT' : 'TUMBUH KEMBANG ANAK'}</span><BookOpen size={18} /></div>
              </div>
            </div>
            <span className="guide-cover-caption">{en ? 'Made to make every step clearer.' : 'Teman di setiap langkah pengasuhan.'}</span>
          </div>
        </section>

        <section aria-label={en ? 'Start here' : 'Mulai dari sini'} className="guide-start-section">
          <p className="guide-small-heading">{en ? 'A GOOD PLACE TO START' : 'MULAI DARI SINI'}</p>
          <div className="guide-start-grid">
            {quickStarts.map(id => {
              const chapter = GUIDE_CHAPTERS.find(item => item.id === id)!;
              const Icon = chapterIcons[id] || BookOpen;
              return (
                <Link key={id} to={`/panduan#${id}`} onClick={event => { event.preventDefault(); openChapter(id, true); }} className={cn('guide-start-link', focusStyle)}>
                  <span className="guide-start-icon"><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span>
                  <span><span className="guide-start-title">{chapter.title[lang]}</span><span className="guide-start-description">{chapter.description[lang]}</span></span>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-label={en ? 'Find a guide' : 'Temukan panduan'} className="guide-search-section my-7 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-400" aria-hidden="true" />
            <input type="search" aria-label={en ? 'Search guide contents' : 'Cari isi buku panduan'} placeholder={en ? 'Search, e.g. save results or download PDF…' : 'Cari panduan, misalnya simpan hasil atau unduh PDF…'} value={query} maxLength={160} onChange={event => updateFilters(event.target.value, audience)} className="min-h-13 w-full rounded-2xl border border-slate-400 bg-white py-3.5 pl-12 pr-12 text-base shadow-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 dark:border-slate-600 dark:bg-slate-900 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 [&::-webkit-search-cancel-button]:appearance-none" />
            {query && <button type="button" onClick={() => updateFilters('', audience)} aria-label={en ? 'Clear search' : 'Hapus pencarian'} className={cn('absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800', focusStyle)}><X className="h-4 w-4" aria-hidden="true" /></button>}
          </div>
          <div className="guide-role-filters flex flex-wrap items-center gap-2" role="group" aria-label={en ? 'Filter guides by role' : 'Filter panduan berdasarkan peran'}>
            {GUIDE_AUDIENCES.map(item => (
              <button type="button" key={item.id} aria-pressed={audience === item.id} onClick={() => updateFilters(query, item.id)} className={cn('min-h-11 text-sm transition-colors', focusStyle)}>
                {item.label[lang]}
              </button>
            ))}
          </div>
          <p role="status" className="text-sm text-slate-500 dark:text-slate-400">{query ? (en ? `${chapters.length} chapters match “${query}”` : `${chapters.length} bab cocok dengan “${query}”`) : (en ? `${chapters.length} chapters available` : `${chapters.length} bab tersedia`)}</p>
        </section>

        {active ? (
          <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
            <aside className="guide-sidebar hidden lg:sticky lg:top-28 lg:block">
              <div className="guide-sidebar-inner">
                <p className="mb-3 flex items-center gap-2 px-3 text-sm font-bold"><List className="h-4 w-4" aria-hidden="true" />{en ? 'Contents' : 'Daftar isi'}</p>
                {renderContents()}
              </div>
              <p className="mt-4 px-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{en ? 'Prefer a conversation? After signing in, ask Rusdi about KINDO’s features.' : 'Lebih nyaman bertanya? Setelah login, tanyakan cara menggunakan fitur KINDO melalui Rusdi.'}</p>
            </aside>

            <div className="min-w-0 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden">
                <button type="button" aria-expanded={tocOpen} aria-controls="guide-mobile-contents" onClick={() => setTocOpen(!tocOpen)} className={cn('flex min-h-13 w-full items-center justify-between gap-3 rounded-2xl px-5 py-3 text-sm font-bold', focusStyle)}><span className="flex items-center gap-2"><List className="h-4 w-4" aria-hidden="true" />{en ? 'Contents' : 'Daftar isi'}</span><span className="text-teal-700 dark:text-teal-300">{tocOpen ? (en ? 'Close' : 'Tutup') : (en ? 'Open' : 'Buka')}</span></button>
                {tocOpen && <div id="guide-mobile-contents" className="border-t border-slate-100 p-3 dark:border-slate-800">{renderContents()}</div>}
              </div>

              <article id={active.id} ref={articleRef} tabIndex={-1} aria-labelledby="guide-chapter-title" className="guide-article scroll-mt-28 border p-6 outline-none sm:p-9">
                <div className="mb-6 border-b border-slate-100 pb-6 dark:border-slate-800">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="guide-article-kicker">KINDO / {en ? 'USER GUIDE' : 'BUKU PANDUAN'}</span>
                    <button type="button" onClick={copyChapterLink} className={cn('inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800', focusStyle)}>{copyStatus === 'copied' ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copyStatus === 'copied' ? (en ? 'Link copied' : 'Tautan disalin') : (en ? 'Copy chapter link' : 'Salin tautan bab')}</button>
                  </div>
                  {copyStatus === 'error' && <p role="status" className="mb-3 break-all text-sm text-slate-600 dark:text-slate-300">{en ? 'Copy this link manually:' : 'Salin tautan ini secara manual:'} {`${window.location.origin}/panduan#${active.id}`}</p>}
                  <span aria-live="polite" className="sr-only">{copyStatus === 'copied' ? (en ? 'Chapter link copied' : 'Tautan bab berhasil disalin') : ''}</span>
                  <div className="guide-chapter-heading">
                    <span className="guide-chapter-number" aria-label={en ? `Chapter ${chapterNumber}` : `Bab ${chapterNumber}`}>{chapterNumber}</span>
                    <h2 id="guide-chapter-title" className="font-extrabold">{active.title[lang]}</h2>
                  </div>
                  <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{active.description[lang]}</p>
                </div>

                <div className="guide-sections">
                  {active.sections.map((section, index) => (
                    <GuideSectionContent key={`${active.id}-${index}`} section={section} chapterNumber={chapterNumber} sectionIndex={index} lang={lang} />
                  ))}
                </div>

                {canShowAction && <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800"><button type="button" onClick={() => onAction(action.id)} className={cn('guide-primary-button inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm font-bold transition-colors', focusStyle)}><Activity className="h-4 w-4" aria-hidden="true" />{isSignedIn ? action.label[lang] : (en ? 'Sign in to use this feature' : 'Masuk untuk menggunakan fitur')}</button></div>}

                <div className="guide-pagination mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                  {activeIndex > 0 ? <button type="button" onClick={() => openChapter(chapters[activeIndex - 1].id)} className={cn('max-w-full rounded-xl p-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800', focusStyle)}><span className="block text-sm text-slate-500 dark:text-slate-400">{en ? 'Previous chapter' : 'Bab sebelumnya'}</span><span className="mt-1 block text-sm font-semibold text-teal-800 dark:text-teal-200">{chapters[activeIndex - 1].title[lang]}</span></button> : <span />}
                  {activeIndex < chapters.length - 1 && <button type="button" onClick={() => openChapter(chapters[activeIndex + 1].id)} className={cn('ml-auto max-w-full rounded-xl p-2 text-right hover:bg-slate-50 dark:hover:bg-slate-800', focusStyle)}><span className="block text-sm text-slate-500 dark:text-slate-400">{en ? 'Next chapter' : 'Bab selanjutnya'}</span><span className="mt-1 block text-sm font-semibold text-teal-800 dark:text-teal-200">{chapters[activeIndex + 1].title[lang]}</span></button>}
                </div>
              </article>
            </div>
          </div>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <Search className="mx-auto mb-4 h-9 w-9 text-slate-400" aria-hidden="true" />
            <h2 className="text-xl font-bold">{en ? 'No guides found' : 'Panduan belum ditemukan'}</h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">{en ? 'Try another keyword or show all roles. Search includes instructions and frequently asked questions.' : 'Coba kata kunci lain atau tampilkan semua peran. Pencarian mencakup langkah penggunaan dan pertanyaan umum.'}</p>
            <button type="button" onClick={() => updateFilters('', 'all')} className={cn('mt-6 min-h-11 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800', focusStyle)}>{en ? 'Show all guides' : 'Tampilkan semua panduan'}</button>
          </section>
        )}

        <footer className="mt-10 flex flex-col justify-between gap-4 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
          <p>{en ? 'Reviewed' : 'Ditinjau'} {new Intl.DateTimeFormat(en ? 'en-GB' : 'id-ID', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${GUIDE_REVIEWED_AT}T00:00:00Z`))}<span className="block">{en ? 'Step-by-step help for using KINDO.' : 'Petunjuk penggunaan KINDO, selangkah demi selangkah.'}</span></p>
          <nav aria-label={en ? 'Guide footer' : 'Tautan pelengkap panduan'} className="flex flex-wrap gap-x-5 gap-y-2"><Link to="/privacy-policy" className={cn('rounded hover:text-teal-700 dark:hover:text-teal-300', focusStyle)}>{en ? 'Privacy Policy' : 'Kebijakan Privasi'}</Link><Link to="/terms-of-service" className={cn('rounded hover:text-teal-700 dark:hover:text-teal-300', focusStyle)}>{en ? 'Terms of Service' : 'Syarat & Ketentuan'}</Link></nav>
        </footer>
      </main>
    </div>
  );
}
