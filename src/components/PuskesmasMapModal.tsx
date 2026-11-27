import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { APIProvider, Map, AdvancedMarker, useMap, type MapMouseEvent } from '@vis.gl/react-google-maps';
import { X, MapPin, Navigation, Search, Loader2, ExternalLink, LocateFixed } from 'lucide-react';
import { authorizedFetch } from '../lib/api';

type Point = { lat: number; lng: number };
type Origin = Point & { source: 'device' | 'manual' | 'area'; accuracy?: number; label?: string };
type Facility = Point & { id: string; name: string; address: string | null; distanceMeters: number; dataSource: 'google_places' };
const browserKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_KEY || '';
const inputClass = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50';

function MapCenter({ point }: { point: Point }) {
  const map = useMap();
  useEffect(() => { if (map) { map.panTo(point); map.setZoom(14); } }, [map, point]);
  return null;
}

export default function PuskesmasMapModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [coarse, setCoarse] = useState<Origin | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [radius, setRadius] = useState(5000);
  const [results, setResults] = useState<Facility[]>([]);
  const [selected, setSelected] = useState<Facility | null>(null);
  const [status, setStatus] = useState('idle');
  const [searchError, setSearchError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [areaQuery, setAreaQuery] = useState('');
  const [areas, setAreas] = useState<(Point & { id: string; label: string })[]>([]);
  const [areaError, setAreaError] = useState('');
  const [areaLoading, setAreaLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const closeHandler = useRef(onClose);
  closeHandler.current = onClose;
  const locationRequest = useRef(0);
  const searchRequest = useRef(0);
  const geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const areaController = useRef<AbortController | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const locate = useCallback((highAccuracy = false) => {
    const requestId = ++locationRequest.current;
    if (geoTimer.current) clearTimeout(geoTimer.current);
    setOrigin(null); setCoarse(null); setLocationError(''); setLocationLoading(true);
    const fail = (message: string) => {
      if (requestId !== locationRequest.current) return;
      locationRequest.current++; if (geoTimer.current) clearTimeout(geoTimer.current);
      setLocationLoading(false); setLocationError(message);
    };
    if (!navigator.geolocation) { fail('Perangkat belum menyediakan lokasi. Cari wilayah atau pilih titik pada peta.'); return; }
    geoTimer.current = setTimeout(() => fail('Lokasi belum ditemukan. Coba deteksi ulang atau pilih wilayah.'), 7500);
    navigator.geolocation.getCurrentPosition(position => {
      if (requestId !== locationRequest.current) return;
      locationRequest.current++; if (geoTimer.current) clearTimeout(geoTimer.current);
      setLocationLoading(false);
      const point: Origin = { lat: position.coords.latitude, lng: position.coords.longitude, source: 'device', accuracy: position.coords.accuracy };
      if (point.accuracy! > 1000) { setCoarse(point); setLocationError('Lokasi perangkat masih terlalu luas. Pilih titik di peta atau konfirmasikan lokasi perkiraan.'); }
      else setOrigin(point);
    }, error => fail(error.code === 1 ? 'Izin lokasi belum diberikan. Kamu tetap bisa mencari wilayah atau memilih titik pada peta.' : 'Lokasi perangkat belum tersedia. Coba lagi atau pilih wilayah.'), { enableHighAccuracy: highAccuracy, timeout: 7000, maximumAge: 30000 });
  }, []);

  const chooseOrigin = (point: Origin) => {
    locationRequest.current++; if (geoTimer.current) clearTimeout(geoTimer.current);
    setLocationLoading(false); setLocationError(''); setCoarse(null); setOrigin(point); setRadius(5000); setSelected(null);
  };

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    setAreaLoading(false); setAreaError(''); setAreas([]);
    document.body.style.overflow = 'hidden'; closeButton.current?.focus(); locate();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeHandler.current();
      if (event.key === 'Tab') {
        const panel = closeButton.current?.closest('[role="dialog"]');
        const focusable = panel?.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,a[href]');
        if (!focusable?.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      locationRequest.current++; if (geoTimer.current) clearTimeout(geoTimer.current);
      areaController.current?.abort(); document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keydown); previousFocus?.focus();
    };
  }, [isOpen, locate]);

  useEffect(() => {
    const requestId = ++searchRequest.current;
    setResults([]); setSelected(null); setSearchError('');
    if (!isOpen || !origin) { setStatus('idle'); return; }
    const controller = new AbortController(); setStatus('loading');
    authorizedFetch('/api/nearby-puskesmas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
      body: JSON.stringify({ lat: origin.lat, lng: origin.lng, originSource: origin.source, accuracyMeters: origin.accuracy, radiusMeters: radius }),
    }).then(async response => {
      const data = await response.json();
      if (requestId !== searchRequest.current || controller.signal.aborted) return;
      if (!response.ok) { setStatus(data.status || 'provider_unavailable'); setSearchError(data.error || 'Pencarian belum berhasil. Coba lagi atau buka Google Maps.'); return; }
      setResults(data.result?.puskesmas || []); setStatus(data.status);
    }).catch(() => {
      if (controller.signal.aborted || requestId !== searchRequest.current) return;
      setStatus('provider_unavailable'); setSearchError('Pencarian belum berhasil. Coba lagi atau buka Google Maps.');
    });
    return () => { searchRequest.current++; controller.abort(); };
  }, [isOpen, origin, radius, refresh]);

  const searchArea = async (event: React.FormEvent) => {
    event.preventDefault(); areaController.current?.abort();
    const controller = new AbortController(); areaController.current = controller;
    setAreaError(''); setAreas([]); setAreaLoading(true);
    try {
      const response = await authorizedFetch(`/api/puskesmas/areas?query=${encodeURIComponent(areaQuery.trim())}`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) });
      const data = await response.json(); if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(data.error);
      setAreas(data.areas); if (!data.areas.length) setAreaError('Wilayah belum ditemukan. Coba nama kecamatan beserta kotanya.');
    } catch (error) { if (!controller.signal.aborted) setAreaError(error instanceof Error ? error.message : 'Wilayah belum ditemukan.'); }
    finally { if (!controller.signal.aborted) setAreaLoading(false); }
  };

  const mapsQuery = origin ? `puskesmas near ${origin.lat},${origin.lng}` : `puskesmas ${areaQuery || 'terdekat'} Indonesia`;
  const mapsUrl = `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: mapsQuery })}`;
  const mapClick = (event: MapMouseEvent) => { if (event.detail.latLng) chooseOrigin({ ...event.detail.latLng, source: 'manual' }); };

  return createPortal(<AnimatePresence>{isOpen && (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 p-2 sm:p-5" onClick={onClose}>
      <motion.section role="dialog" aria-modal="true" aria-labelledby="puskesmas-title" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} onClick={event => event.stopPropagation()} className="flex h-[92dvh] max-h-[850px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white">
        <header className="flex items-start justify-between border-b border-slate-200 p-4 sm:p-6 dark:border-slate-700">
          <div><h2 id="puskesmas-title" className="flex items-center gap-2 text-xl font-bold"><MapPin className="h-5 w-5 text-teal-600" />Puskesmas Terdekat</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pilih lokasi, lalu temukan fasilitas dari sumber peta.</p></div>
          <button ref={closeButton} aria-label="Tutup peta" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:max-w-md">
            <button onClick={() => locate(true)} className={buttonClass}><LocateFixed className="h-4 w-4" />{locationLoading ? 'Mencari lokasi…' : 'Deteksi ulang lokasi'}</button>
            {locationError && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">{locationError}</p>}
            {coarse && <button onClick={() => chooseOrigin(coarse)} className="mt-2 min-h-11 text-sm font-semibold text-teal-700 dark:text-teal-300">Gunakan lokasi perkiraan ini (±{Math.round(coarse.accuracy!)} m)</button>}
            {origin && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{origin.source === 'area' ? `Dari pusat area: ${origin.label}` : origin.source === 'manual' ? 'Dari titik yang kamu pilih di peta' : `Lokasi perangkat, akurasi ±${Math.round(origin.accuracy || 0)} m`}</p>}
            {browserKey && <button onClick={() => setShowMap(value => !value)} className="mt-2 min-h-11 text-sm font-semibold text-teal-700 dark:text-teal-300 md:hidden">{showMap ? 'Sembunyikan peta' : 'Pilih titik pada peta'}</button>}
            <form onSubmit={searchArea} className="mt-4 space-y-2">
              <label htmlFor="puskesmas-area" className="text-sm font-semibold">Cari kelurahan atau kecamatan</label>
              <div className="flex gap-2"><input id="puskesmas-area" value={areaQuery} onChange={event => setAreaQuery(event.target.value)} minLength={3} maxLength={150} placeholder="Contoh: Sidorejo, Salatiga" className={inputClass} required /><button aria-label="Cari wilayah" disabled={areaLoading} className={buttonClass}>{areaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</button></div>
            </form>
            {areaError && <p role="status" className="mt-2 text-sm text-amber-700 dark:text-amber-300">{areaError}</p>}
            {areas.map(area => <button key={area.id} onClick={() => { chooseOrigin({ lat: area.lat, lng: area.lng, label: area.label, source: 'area' }); setAreas([]); }} className="mt-2 min-h-11 w-full rounded-xl border border-teal-200 p-3 text-left text-sm hover:bg-teal-50 dark:hover:bg-teal-950">Gunakan area {area.label}</button>)}
            <label className="mt-4 flex items-center justify-between gap-3 text-sm font-semibold">Radius pencarian<select value={radius} onChange={event => setRadius(Number(event.target.value))} className="min-h-11 rounded-xl border border-slate-300 bg-transparent px-3 dark:border-slate-600"><option value={5000}>5 km</option><option value={10000}>10 km</option><option value={25000}>25 km</option></select></label>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-700 px-4 text-sm font-semibold text-teal-700 dark:border-teal-300 dark:text-teal-300"><ExternalLink className="h-4 w-4" />Buka Google Maps</a>
            <div aria-live="polite" className="mt-4 space-y-3">
              {status === 'idle' && <p className="text-sm text-slate-500">Tentukan lokasi perangkat, wilayah, atau titik pada peta untuk memulai pencarian.</p>}
              {status === 'loading' && <p role="status" className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-300"><Loader2 className="h-5 w-5 animate-spin" />Mencari puskesmas…</p>}
              {searchError && <div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"><p>{searchError}</p><button onClick={() => setRefresh(value => value + 1)} className="mt-2 min-h-11 font-semibold underline">Coba lagi</button></div>}
              {status === 'empty' && <p className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">Belum ada hasil puskesmas yang sesuai dalam radius {radius / 1000} km. Perluas radius atau koreksi titik pencarian.</p>}
              {results.length > 0 && <p className="text-sm text-slate-500">Hasil yang ditemukan, diurutkan menurut jarak garis lurus.</p>}
              {results.map(facility => <article key={facility.id} className={`rounded-xl border p-4 ${selected?.id === facility.id ? 'border-teal-600 bg-teal-50 dark:bg-teal-950' : 'border-slate-200 dark:border-slate-700'}`}>
                <button onClick={() => setSelected(facility)} className="min-h-11 w-full text-left"><span className="block font-bold">{facility.name}</span><span className="mt-1 block text-sm text-slate-500">{(facility.distanceMeters / 1000).toFixed(1)} km garis lurus</span></button>
                {facility.address && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{facility.address}</p>}
                <a href={`https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', destination: `${facility.lat},${facility.lng}`, destination_place_id: facility.id, ...(origin ? { origin: `${origin.lat},${origin.lng}` } : {}) })}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300"><Navigation className="h-4 w-4" />Lihat rute di Google Maps</a>
              </article>)}
              {results.length > 0 && <div className="flex items-center gap-2 text-xs text-slate-500"><span>Data dari</span><img src="https://maps.gstatic.com/mapfiles/api-3/images/google_gray.svg" alt="Google" className="h-5 w-auto" /></div>}
            </div>
          </div>
          <div className={`${showMap ? 'block' : 'hidden'} min-h-64 flex-1 border-l border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 md:block`}>
            {browserKey ? <APIProvider apiKey={browserKey} version="weekly"><Map defaultCenter={{ lat: -2.5, lng: 118 }} defaultZoom={4} mapId={import.meta.env.VITE_GOOGLE_MAP_ID || 'DEMO_MAP_ID'} style={{ width: '100%', height: '100%' }} gestureHandling="greedy" onClick={mapClick}>
              {origin && <><MapCenter point={selected || origin} /><AdvancedMarker position={origin} title="Titik pencarian"><div className="h-5 w-5 rounded-full border-4 border-white bg-blue-600 shadow" /></AdvancedMarker></>}
              {results.map(facility => <AdvancedMarker key={facility.id} position={facility} title={facility.name} onClick={() => setSelected(facility)}><MapPin className="h-8 w-8 fill-teal-600 text-white" /></AdvancedMarker>)}
            </Map></APIProvider> : <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">Peta dalam aplikasi belum tersedia. Kamu tetap dapat memilih wilayah atau membuka Google Maps.</div>}
          </div>
        </div>
      </motion.section>
    </div>
  )}</AnimatePresence>, document.body);
}
