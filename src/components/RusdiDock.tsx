import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bot, X, Send, Loader2, BookOpen, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { authorizedFetch } from '../lib/api';

export type RusdiAction = 'open_screening' | 'open_education' | 'open_consultation' | 'open_puskesmas' | 'open_onboarding' | 'open_dashboard';
type Message = { id: string; role: 'user' | 'assistant'; content: string; sources?: { id: string; title: string }[]; actions?: { id: RusdiAction; label: string }[]; requestId?: string; feedback?: string };
const suggested = ['Jumlah kuesionernya berapa?', 'Cara mulai skrining?', 'Bagaimana unduh PDF?', 'Cari puskesmas'];

export default function RusdiDock({ currentView, onAction }: { currentView: string; onAction: (action: RusdiAction) => void }) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [source, setSource] = useState<{ title: string; content: string } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const configController = useRef<AbortController | null>(null);

  useEffect(() => {
    const abort = new AbortController(); configController.current = abort;
    authorizedFetch('/api/rusdi/config', { signal: abort.signal }).then(response => response.ok ? response.json() : { enabled: false }).then(data => { if (!abort.signal.aborted) setEnabled(data.enabled); }).catch(() => {});
    return () => { abort.abort(); controller.current?.abort(); };
  }, []);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' }); }, [messages, waiting, source]);
  const close = () => { setOpen(false); controller.current?.abort(); setWaiting(false); triggerRef.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [open]);

  const send = async (prompt: string, retry = false) => {
    const message = prompt.trim(); if (!message || waiting) return;
    setError(''); setSource(null); setLastPrompt(message); setInput(''); setWaiting(true);
    controller.current?.abort(); const abort = new AbortController(); controller.current = abort;
    const outgoing = { id: crypto.randomUUID(), role: 'user' as const, content: message };
    const previous = retry && messages.at(-1)?.role === 'user' ? messages.slice(0, -1) : messages;
    const next = [...previous, outgoing]; setMessages(next);
    try {
      const response = await authorizedFetch('/api/rusdi/chat', { method: 'POST', signal: AbortSignal.any([abort.signal, AbortSignal.timeout(15000)]), headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, locale: 'id', currentView, history: previous.slice(-6).map(item => ({ role: item.role, content: item.content.slice(0, 2000) })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.answer || 'Rusdi belum bisa menjawab. Silakan coba lagi.');
      if (!abort.signal.aborted) setMessages([...next, { id: crypto.randomUUID(), role: 'assistant', content: data.answer, sources: data.sources, actions: data.actions, requestId: data.requestId }]);
    } catch (failure) { if (!abort.signal.aborted) setError(failure instanceof Error ? failure.message : 'Koneksi belum berhasil. Silakan coba lagi.'); }
    finally { if (controller.current === abort) setWaiting(false); }
  };

  const showSource = async (id: string) => {
    try { const response = await authorizedFetch(`/api/rusdi/sources/${encodeURIComponent(id)}`); if (!response.ok) throw new Error(); setSource(await response.json()); }
    catch { setError('Sumber belum dapat dibuka. Silakan coba kembali.'); }
  };
  const feedback = async (message: Message, helpful: boolean) => {
    try {
      const response = await authorizedFetch('/api/rusdi/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: message.requestId, helpful }) });
      if (!response.ok) throw new Error();
      setMessages(previous => previous.map(item => item.id === message.id ? { ...item, feedback: 'Terima kasih atas penilaianmu.' } : item));
    } catch { setMessages(previous => previous.map(item => item.id === message.id ? { ...item, feedback: 'Penilaian belum tersimpan. Coba lagi nanti.' } : item)); }
  };
  if (!enabled) return null;
  return createPortal(<>
    <button ref={triggerRef} onClick={() => setOpen(true)} aria-label="Tanya Rusdi" aria-expanded={open} className="fixed bottom-28 right-4 z-40 flex min-h-12 items-center gap-2 rounded-full bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-lg ring-1 ring-white/30 hover:bg-teal-800 lg:bottom-6 lg:right-6"><Bot className="h-5 w-5" />Tanya Rusdi</button>
    {open && <section role="dialog" aria-modal="false" aria-labelledby="rusdi-title" className="fixed inset-x-2 bottom-24 z-[110] flex h-[min(620px,75dvh)] flex-col overflow-hidden rounded-2xl border border-teal-800/20 bg-white text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:left-auto sm:right-6 sm:w-[400px] lg:bottom-6">
      <header className="flex items-center justify-between bg-teal-800 p-4 text-white"><div className="flex items-center gap-3"><div className="rounded-xl bg-white/15 p-2"><Bot className="h-6 w-6" /></div><div><h2 id="rusdi-title" className="font-bold">Rusdi</h2><p className="text-sm text-teal-100">Asisten AI khusus KINDO</p></div></div><div className="flex"><button aria-label="Bersihkan percakapan" disabled={waiting} onClick={() => { setMessages([]); setSource(null); setError(''); }} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10"><RotateCcw className="h-4 w-4" /></button><button aria-label="Tutup Rusdi" onClick={close} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10"><X className="h-5 w-5" /></button></div></header>
      <div ref={log} role="log" aria-live="polite" aria-label="Percakapan Rusdi" className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <p className="rounded-2xl rounded-tl-sm bg-slate-100 p-3 text-base leading-relaxed dark:bg-slate-800">Halo, aku Rusdi. Mau tanya tentang skrining, profil anak, hasil, atau cara memakai KINDO? Jangan kirim kata sandi atau data kesehatan pribadi di sini.</p>
        {!messages.length && <div className="flex flex-wrap gap-2">{suggested.map(prompt => <button key={prompt} onClick={() => void send(prompt)} className="min-h-11 rounded-xl border border-teal-200 px-3 py-2 text-left text-sm text-teal-800 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-200 dark:hover:bg-teal-950">{prompt}</button>)}</div>}
        {messages.map(message => <article key={message.id} className={message.role === 'user' ? 'ml-8 rounded-2xl rounded-tr-sm bg-teal-700 p-3 text-white' : 'mr-2 rounded-2xl rounded-tl-sm bg-slate-100 p-3 dark:bg-slate-800'}>
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{message.content}</p>
          {!!message.sources?.length && <div className="mt-3 space-y-1 border-t border-slate-200 pt-2 dark:border-slate-700">{message.sources.map(item => <button key={item.id} onClick={() => void showSource(item.id)} className="flex min-h-11 items-center gap-2 text-left text-xs text-teal-800 underline decoration-teal-300 dark:text-teal-200"><BookOpen className="h-3.5 w-3.5 shrink-0" />{item.title}</button>)}</div>}
          {!!message.actions?.length && <div className="mt-2 flex flex-wrap gap-2">{message.actions.map(action => <button key={action.id} onClick={() => { close(); onAction(action.id); }} className="min-h-11 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">{action.label}</button>)}</div>}
          {message.requestId && <div className="mt-2 flex flex-wrap items-center gap-1"><button aria-label="Jawaban membantu" onClick={() => void feedback(message, true)} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><ThumbsUp className="h-3.5 w-3.5" /></button><button aria-label="Jawaban kurang membantu" onClick={() => void feedback(message, false)} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><ThumbsDown className="h-3.5 w-3.5" /></button>{message.feedback && <span role="status" className="text-xs">{message.feedback}</span>}</div>}
        </article>)}
        {waiting && <p role="status" className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-300"><Loader2 className="h-4 w-4 animate-spin" />Rusdi sedang mencari panduan…</p>}
        {source && <aside className="rounded-xl border border-teal-300 p-3 text-sm dark:border-teal-800"><div className="flex items-start justify-between gap-2"><h3 className="font-bold">{source.title}</h3><button onClick={() => setSource(null)} aria-label="Tutup sumber" className="flex h-11 w-11 shrink-0 items-center justify-center"><X className="h-4 w-4" /></button></div><p className="whitespace-pre-wrap leading-relaxed">{source.content}</p></aside>}
        {error && <div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"><p>{error}</p>{lastPrompt && <button onClick={() => void send(lastPrompt, true)} disabled={waiting} className="min-h-11 font-semibold underline">Coba lagi</button>}</div>}
      </div>
      <form onSubmit={event => { event.preventDefault(); void send(input); }} className="border-t border-slate-200 p-3 dark:border-slate-700"><div className="flex items-end gap-2"><textarea ref={inputRef} value={input} onChange={event => setInput(event.target.value)} maxLength={2000} rows={2} aria-label="Pertanyaan untuk Rusdi" placeholder="Tanya seputar KINDO…" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(input); } }} className="min-h-12 max-h-28 flex-1 resize-none rounded-xl border border-slate-300 bg-transparent p-3 text-sm outline-none focus:border-teal-600 dark:border-slate-600" /><button aria-label="Kirim pertanyaan" disabled={waiting || !input.trim()} className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-white disabled:opacity-40"><Send className="h-5 w-5" /></button></div><p className="mt-2 text-xs text-slate-500">Panduan KINDO. Konsultasi kesehatan melalui nakes.</p></form>
    </section>}
  </>, document.body);
}
