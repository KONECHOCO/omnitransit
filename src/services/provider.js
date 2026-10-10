/**
 * Sceglie la fonte dati in base alla posizione:
 *  1. dentro le zone del nostro server MOTIS → MOTIS (gratis, orari ufficiali aperti);
 *  2. altrove (o se MOTIS non trova soluzioni) → HERE Public Transit (190+ paesi, a consumo);
 * Ogni risultato viene da una sola fonte e porta `source`, così l'app mostra l'attribuzione giusta.
 *
 * VITE_MOTIS_COVERAGE: zone coperte da MOTIS, "minLon,minLat,maxLon,maxLat;..." (vuoto = ovunque,
 * come in sviluppo con l'istanza pubblica Transitous).
 */
import * as motis from './transit';
import { HERE_ENABLED as HERE_FLAG, herePlanTrip, hereDepartures, hereStations, hereGeocode, hereReverseGeocode } from './here';

const COVERAGE = (import.meta.env.VITE_MOTIS_COVERAGE || '')
  .split(';')
  .map(s => s.split(',').map(Number))
  .filter(b => b.length === 4 && b.every(n => !Number.isNaN(n)));

// HERE si usa solo quando le zone MOTIS sono definite (produzione); in sviluppo tutto passa da MOTIS
const HERE_ENABLED = HERE_FLAG && COVERAGE.length > 0;

export function inMotisCoverage(p) {
  if (!p || p.lat == null) return false;
  if (!COVERAGE.length) return true;
  return COVERAGE.some(([minLon, minLat, maxLon, maxLat]) => p.lon >= minLon && p.lon <= maxLon && p.lat >= minLat && p.lat <= maxLat);
}

const viaHere = p => HERE_ENABLED && !inMotisCoverage(p);
const isHereId = id => typeof id === 'string' && id.startsWith('here:');

export async function geocode(text, { lang, near, type, signal } = {}) {
  if (type === 'PLACE' && HERE_ENABLED) return hereGeocode(text, { lang, cityOnly: true, signal });
  if (viaHere(near)) return hereGeocode(text, { lang, near, signal });
  return motis.geocode(text, { lang, near, type, signal });
}

export async function reverseGeocode(pos, opts = {}) {
  if (viaHere(pos)) return hereReverseGeocode(pos, opts);
  return motis.reverseGeocode(pos, opts);
}

export async function planTrip(from, to, opts = {}) {
  const motisOk = inMotisCoverage(from) && inMotisCoverage(to) && !isHereId(from.stopId) && !isHereId(to.stopId);
  if (motisOk || !HERE_ENABLED) {
    const res = await motis.planTrip(from, to, opts);
    if (res.itineraries.length || !HERE_ENABLED) return { ...res, source: 'motis' };
  }
  // Fuori zona (o nessuna soluzione MOTIS): le fermate MOTIS non esistono per HERE, usiamo le coordinate
  return herePlanTrip({ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon }, opts);
}

export async function departures({ stopId, center, radius, n, signal, lang }) {
  if (isHereId(stopId)) return hereDepartures({ stopId, signal, lang });
  if (!stopId && viaHere(center)) return hereDepartures({ center, radius, signal, lang });
  return (await motis.departures({ stopId, center, radius, n, signal })).map(d => ({ ...d, source: 'motis' }));
}

/** Le partenze HERE costano a richiesta: aggiornamento automatico meno frequente. */
export function refreshIntervalFor(list) {
  return list.some(d => d.source === 'here') ? 90000 : 30000;
}

export async function stopsInBounds(bounds, signal) {
  const c = bounds.getCenter();
  if (!inMotisCoverage({ lat: c.lat, lon: c.lng })) return null; // fuori zona: fermate solo su richiesta
  return motis.stopsInBounds(bounds, signal);
}

export const stationsAround = (center, opts) => hereStations({ lat: center.lat, lon: center.lon, ...opts });
