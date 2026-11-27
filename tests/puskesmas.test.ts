import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
import { puskesmasRouter, normalizePlaces, distanceMeters, validCoordinates } from '../server/puskesmas.ts';

const origin = { lat: -7.33, lng: 110.5 };
const place = (id: string, distanceOffset = 0.005, extra: any = {}) => ({ id, displayName: { text: `Puskesmas ${id}` }, formattedAddress: 'Alamat dari provider', location: { latitude: origin.lat + distanceOffset, longitude: origin.lng }, ...extra });
async function request(body: any, provider: typeof fetch, key = 'test-key') {
  const old = process.env.GOOGLE_PLACES_SERVER_KEY, legacy = process.env.GOOGLE_MAPS_PLATFORM_KEY;
  if (key) process.env.GOOGLE_PLACES_SERVER_KEY = key; else delete process.env.GOOGLE_PLACES_SERVER_KEY;
  delete process.env.GOOGLE_MAPS_PLATFORM_KEY;
  const app = express(); app.use(express.json()); app.use('/api', puskesmasRouter(provider));
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  try { const response = await fetch(`http://127.0.0.1:${(server.address() as any).port}/api/nearby-puskesmas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: response.status, data: await response.json() }; }
  finally { await new Promise<void>(resolve => server.close(() => resolve())); if (old == null) delete process.env.GOOGLE_PLACES_SERVER_KEY; else process.env.GOOGLE_PLACES_SERVER_KEY = old; if (legacy != null) process.env.GOOGLE_MAPS_PLATFORM_KEY = legacy; }
}
const valid = { ...origin, radiusMeters: 5000, originSource: 'device', accuracyMeters: 20 };
const provider = (places: any[]) => (async () => Response.json({ places })) as typeof fetch;

for (const [label, change] of [ ['missing location', { lat: null }], ['latitude string', { lat: '-7' }], ['longitude string', { lng: '110' }], ['latitude outside range', { lat: 91 }], ['longitude outside range', { lng: -181 }], ['invalid radius', { radiusMeters: 999999 }], ['default Jakarta source', { originSource: 'default' }], ['negative accuracy', { accuracyMeters: -1 }] ] as [string, any][]) test(`invalid: ${label}`, async () => {
  let calls = 0; const result = await request({ ...valid, ...change }, (async () => { calls++; return Response.json({}); }) as typeof fetch); assert.equal(result.status, 400); assert.equal(calls, 0);
});
test('valid source coordinates and source metadata retained', async () => { const result = await request(valid, provider([place('nyata')])); assert.equal(result.data.status, 'ok'); assert.equal(result.data.result.puskesmas[0].dataSource, 'google_places'); });
test('empty provider result remains empty', async () => { const result = await request(valid, provider([])); assert.equal(result.data.status, 'empty'); assert.deepEqual(result.data.result.puskesmas, []); });
test('missing key returns configuration error, never synthetic places', async () => { const result = await request(valid, provider([place('not-used')]), ''); assert.equal(result.status, 503); assert.equal(result.data.status, 'configuration_error'); assert.deepEqual(result.data.result.puskesmas, []); });
for (const code of [403, 429]) test(`provider ${code} stays distinguishable from empty results`, async () => { const result = await request(valid, (async () => Response.json({}, { status: code })) as typeof fetch); assert.equal(result.status, 503); assert.equal(result.data.status, code === 403 ? 'configuration_error' : 'provider_unavailable'); });
test('provider network timeout returns unavailable without generated fallback', async () => { const result = await request(valid, (async () => { throw new DOMException('timeout', 'TimeoutError'); }) as typeof fetch); assert.equal(result.data.status, 'provider_unavailable'); assert.deepEqual(result.data.result.puskesmas, []); });
test('missing candidate coordinates are discarded rather than replaced with origin', () => assert.deepEqual(normalizePlaces([place('bad', 0, { location: null })], origin, 5000), []));
test('wrong facility and pustu are not labelled puskesmas', () => assert.deepEqual(normalizePlaces([place('clinic', 0, { displayName: { text: 'Klinik Sehat' } }), place('pustu', 0, { displayName: { text: 'Puskesmas Pembantu Desa' } }), place('near', 0, { displayName: { text: 'Apotek Dekat Puskesmas' } })], origin, 5000), []));
test('duplicates and permanently closed facilities removed', () => assert.equal(normalizePlaces([place('one'), place('one'), place('closed', .01, { businessStatus: 'CLOSED_PERMANENTLY' })], origin, 5000).length, 1));
test('radius filters locations numerically and results sort before rounding', () => { const result = normalizePlaces([place('far', .009), place('near', .001), place('outside', .1)], origin, 5000); assert.deepEqual(result.map(row => row.id), ['near','far']); });
test('distance recomputed for each origin rather than copied from a rounded cache key', () => { const a = normalizePlaces([place('one')], origin, 5000)[0].distanceMeters; const b = normalizePlaces([place('one')], { ...origin, lat: origin.lat + .004 }, 5000)[0].distanceMeters; assert(a > b * 4); });
test('request uses area restriction and required field mask', async () => { let captured: any; await request(valid, (async (_url, options) => { captured = options; return Response.json({ places: [] }); }) as typeof fetch); const body = JSON.parse(captured.body); assert(body.locationRestriction.rectangle); assert(!body.locationBias); assert.equal(body.rankPreference, 'DISTANCE'); assert(captured.headers['X-Goog-FieldMask'].includes('places.location')); });
test('distance and coordinate helpers reject non-finite input and preserve zero distance', () => { assert.equal(distanceMeters(origin, origin), 0); assert.equal(validCoordinates(NaN, 3), false); assert.equal(validCoordinates(0, 0), true); });
