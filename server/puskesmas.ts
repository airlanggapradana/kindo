import { Router } from 'express';
import { randomUUID } from 'node:crypto';

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const h = Math.sin((b.lat - a.lat) * rad / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lng - a.lng) * rad / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}

export function validCoordinates(lat: unknown, lng: unknown): boolean {
  return typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export function normalizePlaces(places: any[], origin: { lat: number; lng: number }, radius: number) {
  const seen = new Set<string>();
  return places.flatMap(place => {
    const name: string = place.displayName?.text || '';
    // Broader health categories also contain clinics and pharmacies. Require an
    // identifiable puskesmas name; uncertain candidates never become recommendations.
    if (!/^(?:(?:uptd?|blud|uobf)\b[\s.:-]*)?(?:puskesmas\b|pusat kesehatan masyarakat\b)/i.test(name.trim())) return [];
    if (/\b(pembantu|pustu)\b/i.test(name) || place.businessStatus === 'CLOSED_PERMANENTLY') return [];
    const lat = place.location?.latitude; const lng = place.location?.longitude;
    if (!place.id || !validCoordinates(lat, lng) || seen.has(place.id)) return [];
    const distance = distanceMeters(origin, { lat, lng });
    if (distance > radius) return [];
    seen.add(place.id);
    return [{ id: place.id as string, name, address: place.formattedAddress || null, lat, lng,
      distanceMeters: distance, distanceKind: 'straight_line' as const, dataSource: 'google_places' as const,
      distance: `${(distance / 1000).toFixed(1)} km`, phone: null,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${encodeURIComponent(place.id)}` }];
  }).sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, 5);
}

function serverKey() { return process.env.GOOGLE_PLACES_SERVER_KEY?.trim() || process.env.GOOGLE_MAPS_PLATFORM_KEY?.trim(); }
export function puskesmasRouter(fetchProvider: typeof fetch = fetch) {
  const router = Router();
  router.post('/nearby-puskesmas', async (req, res) => {
    const { lat, lng, radiusMeters = 5000, originSource = 'manual', accuracyMeters } = req.body ?? {};
    const requestId = randomUUID();
    if (!validCoordinates(lat, lng) || ![5000, 10000, 25000].includes(radiusMeters)
      || !['device', 'manual', 'area'].includes(originSource)
      || accuracyMeters != null && (typeof accuracyMeters !== 'number' || !Number.isFinite(accuracyMeters) || accuracyMeters < 0)) {
      res.status(400).json({ requestId, error: 'Lokasi atau radius pencarian tidak valid.' }); return;
    }
    const base = { requestId, origin: { lat, lng }, originSource, accuracyMeters: accuracyMeters ?? null, radiusMeters };
    const key = serverKey();
    if (!key) { res.status(503).json({ ...base, status: 'configuration_error', error: 'Pencarian di dalam aplikasi belum tersedia. Gunakan Buka Google Maps.', result: { puskesmas: [] } }); return; }
    const controller = new AbortController();
    res.on('close', () => { if (!res.writableEnded) controller.abort(); });
    try {
      // Use a slightly larger bounding box; exact radius filtering happens below.
      const dLat = radiusMeters / 110000; const dLng = radiusMeters / (110000 * Math.max(0.01, Math.cos(lat * Math.PI / 180)));
      const response = await fetchProvider('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus' },
        body: JSON.stringify({ textQuery: 'puskesmas', languageCode: 'id', regionCode: 'ID', pageSize: 20, rankPreference: 'DISTANCE',
          locationRestriction: { rectangle: { low: { latitude: Math.max(-90, lat - dLat), longitude: Math.max(-180, lng - dLng) }, high: { latitude: Math.min(90, lat + dLat), longitude: Math.min(180, lng + dLng) } } } }),
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]),
      });
      if (!response.ok) {
        const configuration = [400, 401, 403].includes(response.status);
        console.warn('[PUSKESMAS] Places returned HTTP', response.status);
        res.status(503).json({ ...base, status: configuration ? 'configuration_error' : 'provider_unavailable', error: 'Layanan pencarian sedang tidak tersedia. Coba lagi atau buka Google Maps.', result: { puskesmas: [] } }); return;
      }
      const data = await response.json();
      if (data.places != null && !Array.isArray(data.places)) throw new Error('Invalid provider response');
      const puskesmas = normalizePlaces(data.places || [], { lat, lng }, radiusMeters);
      // Places payloads are intentionally not persisted or used as model knowledge.
      res.json({ ...base, status: puskesmas.length ? 'ok' : 'empty', result: { puskesmas }, isFallback: false });
    } catch {
      if (!res.destroyed) res.status(503).json({ ...base, status: 'provider_unavailable', error: 'Pencarian belum berhasil. Coba lagi atau buka Google Maps.', result: { puskesmas: [] } });
    }
  });
  router.get('/puskesmas/areas', async (req, res) => {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (query.length < 3 || query.length > 150) { res.status(400).json({ error: 'Masukkan nama wilayah antara 3 dan 150 karakter.' }); return; }
    const key = serverKey();
    if (!key) { res.status(503).json({ error: 'Pencarian wilayah belum tersedia. Pilih titik pada peta atau gunakan Google Maps.' }); return; }
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
      url.search = new URLSearchParams({ address: query, components: 'country:ID', language: 'id', key }).toString();
      const response = await fetchProvider(url, { signal: AbortSignal.timeout(6000) }); const data = await response.json();
      if (!response.ok || !['OK', 'ZERO_RESULTS'].includes(data.status)) throw new Error('Geocoding unavailable');
      res.json({ areas: (data.results || []).slice(0, 5).flatMap((area: any) => {
        const point = area.geometry?.location;
        return validCoordinates(point?.lat, point?.lng) ? [{ id: area.place_id, label: area.formatted_address, lat: point.lat, lng: point.lng }] : [];
      }) });
    } catch { res.status(503).json({ error: 'Pencarian wilayah belum berhasil. Coba pilih titik di peta atau buka Google Maps.' }); }
  });
  return router;
}
