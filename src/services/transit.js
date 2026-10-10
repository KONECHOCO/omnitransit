/**
 * Dati reali di trasporto pubblico tramite l'API del motore open source MOTIS, alimentato dai feed
 * GTFS / GTFS-Realtime ufficiali degli operatori: percorsi multimodali, partenze in tempo reale,
 * fermate e ricerca luoghi.
 *
 * - Sviluppo: istanza pubblica Transitous (https://transitous.org), gratuita ma NON per uso commerciale.
 * - Produzione (app con pubblicità / Pro): VITE_TRANSIT_API_URL deve puntare a un'istanza MOTIS
 *   propria (stessa API, stessi dati pubblici) oppure a Transitous solo con il loro permesso scritto.
 */
const API = import.meta.env.VITE_TRANSIT_API_URL || 'https://api.transitous.org/api';
export const USING_PUBLIC_TRANSITOUS = API.includes('transitous.org');

async function get(path, params, signal) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const res = await fetch(`${API}${path}?${qs}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Un luogo può essere un indirizzo/punto (lat, lon) o una fermata (stopId). */
export function placeParam(place) {
  if (place.stopId) return place.stopId;
  return `${place.lat},${place.lon}`;
}

/** Ricerca di luoghi, indirizzi e fermate. `near` (lat, lon) privilegia i risultati vicini. */
export async function geocode(text, { lang, near, type, signal } = {}) {
  const results = await get('/v1/geocode', {
    text,
    language: lang,
    type,
    place: near ? `${near.lat},${near.lon}` : undefined,
    placeBias: near ? 5 : undefined
  }, signal);
  return (results || []).map(r => ({
    name: r.name,
    stopId: r.type === 'STOP' ? r.id : undefined,
    type: r.type,
    lat: r.lat,
    lon: r.lon,
    country: r.country,
    tz: r.tz,
    modes: r.modes || [],
    area: describeArea(r)
  }));
}

/** "Piacenza, Emilia-Romagna" a partire dalle aree amministrative restituite. */
function describeArea(r) {
  const areas = r.areas || [];
  const city = areas.find(a => a.default) || areas.find(a => a.adminLevel === 8);
  const region = areas.find(a => a.adminLevel === 4);
  const street = r.street ? `${r.street}${r.houseNumber ? ' ' + r.houseNumber : ''}` : '';
  return [street !== r.name ? street : '', city?.name, region?.name]
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(', ');
}

export async function reverseGeocode({ lat, lon }, { lang, signal } = {}) {
  const results = await get('/v1/reverse-geocode', { place: `${lat},${lon}`, language: lang }, signal);
  const r = results?.[0];
  return r ? { name: r.name, lat, lon, area: describeArea(r), country: r.country } : null;
}

/**
 * Calcolo itinerari.
 * @param {object} opts.time  Date di partenza (o di arrivo se arriveBy)
 */
export async function planTrip(from, to, { time, arriveBy, wheelchair, signal } = {}) {
  const data = await get('/v5/plan', {
    fromPlace: placeParam(from),
    toPlace: placeParam(to),
    time: time ? time.toISOString() : undefined,
    arriveBy: arriveBy ? 'true' : undefined,
    pedestrianProfile: wheelchair ? 'WHEELCHAIR' : undefined,
    requireBikeTransport: undefined,
    numItineraries: 6
  }, signal);
  const seen = new Set();
  const itineraries = (data.itineraries || []).filter(it => {
    // MOTIS può restituire varianti identiche a orari diversi: teniamo la prima di ogni sequenza
    const key = it.startTime + it.legs.map(l => l.tripId || l.mode).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { itineraries, direct: data.direct || [], nextPageCursor: data.nextPageCursor };
}

/** Prossime partenze da una fermata (stopId) oppure da tutte le fermate entro `radius` metri. */
export async function departures({ stopId, center, radius = 400, n = 30, signal }) {
  const data = await get('/v5/stoptimes', {
    stopId,
    center: center ? `${center.lat},${center.lon}` : undefined,
    radius: center ? radius : undefined,
    n
  }, signal);
  return (data.stopTimes || []).map(st => ({
    key: `${st.tripId}-${st.place?.stopId}`,
    stopName: st.place?.name,
    stopId: st.place?.stopId,
    lat: st.place?.lat,
    lon: st.place?.lon,
    tz: st.place?.tz,
    time: st.place?.departure || st.place?.arrival,
    scheduledTime: st.place?.scheduledDeparture || st.place?.scheduledArrival,
    track: st.place?.track,
    realTime: st.realTime,
    cancelled: st.cancelled || st.tripCancelled,
    mode: st.mode,
    line: lineName(st),
    routeLongName: st.routeLongName,
    headsign: st.headsign || st.tripTo?.name,
    color: st.routeColor ? `#${st.routeColor}` : null,
    textColor: st.routeTextColor ? `#${st.routeTextColor}` : null,
    agencyName: st.agencyName,
    agencyUrl: st.agencyUrl,
    agencyFareUrl: st.agencyFareUrl,
    routeUrl: st.routeUrl,
    wheelchair: st.wheelchairAccessible
  }));
}

/** Fermate dentro un rettangolo della mappa. */
export async function stopsInBounds(bounds, signal) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return get('/v1/map/stops', { min: `${sw.lat},${sw.lng}`, max: `${ne.lat},${ne.lng}` }, signal);
}

/** Decodifica una polyline codificata (formato Google) con la precisione indicata da MOTIS. */
export function decodePolyline(str, precision = 6) {
  const factor = Math.pow(10, precision);
  const coords = [];
  let index = 0, lat = 0, lng = 0;
  while (index < str.length) {
    for (const axis of [0, 1]) {
      let result = 0, shift = 0, b;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 0) lat += delta; else lng += delta;
    }
    coords.push([lat / factor, lng / factor]);
  }
  return coords;
}

// ---------- Utilità di presentazione ----------

/**
 * Nome della linea da mostrare. Alcuni feed (es. un doppione per Tokyo) hanno solo numeri di corsa
 * al posto del nome: in quel caso si usa il primo nome vero disponibile, altrimenti nessuno (icona del mezzo).
 */
export function lineName(x) {
  const isTripNumber = v => !v || /^\d{5,}$/.test(v);
  return [x.displayName, x.routeShortName, x.routeLongName, x.tripShortName].find(v => !isTripNumber(v)) || '';
}

/**
 * Alcune città hanno due feed per gli stessi treni (es. Tokyo): uno con i nomi di linea e un doppione
 * con solo numeri di corsa. Togliamo il doppione quando la stessa partenza esiste con un nome vero.
 */
export function dedupeDepartures(list) {
  const norm = h => (h || '').replace(/\(.*?\)/g, '').trim().split(/\s+/)[0];
  const named = new Set(list.filter(d => d.line).map(d => `${d.time}|${norm(d.headsign)}`));
  return list.filter(d => d.line || !named.has(`${d.time}|${norm(d.headsign)}`));
}

export const TRANSIT_MODES = ['BUS', 'TRAM', 'SUBWAY', 'METRO', 'FERRY', 'RAIL', 'HIGHSPEED_RAIL', 'LONG_DISTANCE', 'NIGHT_RAIL', 'REGIONAL_FAST_RAIL', 'REGIONAL_RAIL', 'SUBURBAN', 'COACH', 'FUNICULAR', 'AERIAL_LIFT', 'CABLE_CAR', 'ODM', 'AIRPLANE', 'OTHER'];

/** Raggruppa i modi MOTIS nelle categorie mostrate all'utente. */
export function modeGroup(mode) {
  switch (mode) {
    case 'WALK': return 'walk';
    case 'BIKE': case 'RENTAL': return 'bike';
    case 'CAR': case 'CAR_PARKING': case 'ODM': return 'car';
    case 'BUS': case 'COACH': return 'bus';
    case 'TRAM': case 'CABLE_CAR': case 'FUNICULAR': case 'AERIAL_LIFT': return 'tram';
    case 'SUBWAY': case 'METRO': return 'metro';
    case 'FERRY': return 'ferry';
    case 'AIRPLANE': return 'plane';
    default: return 'train';
  }
}

export const MODE_ICON = { walk: '🚶', bike: '🚲', car: '🚗', bus: '🚌', tram: '🚋', metro: '🚇', ferry: '⛴️', plane: '✈️', train: '🚆' };
export const MODE_COLOR = { walk: '#64748b', bike: '#22c55e', car: '#eab308', bus: '#e11d48', tram: '#f97316', metro: '#2563eb', ferry: '#0891b2', plane: '#a855f7', train: '#7c3aed' };

export function formatTime(iso, tz, locale) {
  if (!iso) return '';
  // Senza fuso esplicito (dati HERE) l'ISO contiene già l'ora locale della città: la usiamo così com'è
  if (!tz && /T\d{2}:\d{2}.*[+-]\d{2}:\d{2}$/.test(iso)) return iso.slice(11, 16);
  try {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }
}

export function formatDuration(seconds, t) {
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} ${t.common.min}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} ${t.common.min}` : `${h} h`;
}

/** Ritardo in minuti (positivo = in ritardo) quando il dato è in tempo reale. */
export function delayMinutes(actual, scheduled) {
  if (!actual || !scheduled) return 0;
  return Math.round((new Date(actual) - new Date(scheduled)) / 60000);
}

export function minutesUntil(iso) {
  return Math.round((new Date(iso) - Date.now()) / 60000);
}

export function walkSeconds(it) {
  return it.legs.filter(l => l.mode === 'WALK').reduce((s, l) => s + l.duration, 0);
}
