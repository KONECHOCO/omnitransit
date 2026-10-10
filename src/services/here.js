/**
 * HERE Public Transit API v8 + Geocoding & Search API v7: copertura in 190+ paesi per le zone che il
 * nostro server MOTIS non copre. Le chiamate passano dal proxy su transit.ikonetsolutions.com (vedi
 * deploy/motis/nginx-transit.conf), che aggiunge la chiave API lato server e tiene una cache breve:
 * la chiave non è mai nell'app e ogni richiesta ripetuta non costa.
 *
 * I risultati vengono convertiti nella stessa forma usata per MOTIS, così l'interfaccia è unica.
 * Termini HERE (6.4): i dati HERE non vanno mescolati con quelli di altre fonti nello stesso risultato,
 * le attribuzioni degli operatori vanno mostrate con il percorso, cache massima 30 giorni.
 */
const BASE = import.meta.env.VITE_HERE_PROXY_URL || 'https://transit.ikonetsolutions.com/here';
export const HERE_ENABLED = import.meta.env.VITE_HERE_ENABLED !== 'false';

async function get(service, path, params, signal) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const res = await fetch(`${BASE}/${service}${path}?${qs}`, { signal });
  if (!res.ok) throw new Error(`HERE HTTP ${res.status}`);
  return res.json();
}

// ---------- Modi di trasporto: HERE → nomi MOTIS (usati da modeGroup) ----------
const MODE_MAP = {
  pedestrian: 'WALK',
  highSpeedTrain: 'HIGHSPEED_RAIL',
  intercityTrain: 'LONG_DISTANCE',
  interRegionalTrain: 'REGIONAL_FAST_RAIL',
  regionalTrain: 'REGIONAL_RAIL',
  cityTrain: 'SUBURBAN',
  bus: 'BUS',
  privateBus: 'BUS',
  busRapid: 'BUS',
  ferry: 'FERRY',
  subway: 'SUBWAY',
  monorail: 'SUBWAY',
  lightRail: 'TRAM',
  inclined: 'FUNICULAR',
  aerial: 'AERIAL_LIFT',
  flight: 'AIRPLANE'
};
const mapMode = m => MODE_MAP[m] || 'OTHER';

const noHash = c => (c ? c.replace('#', '') : undefined);

/** Orario programmato = orario previsto meno il ritardo comunicato dall'operatore. */
function scheduled(time, delay) {
  if (!time || !delay) return time;
  return new Date(new Date(time).getTime() - delay * 1000).toISOString();
}

// ---------- Flexible Polyline (https://github.com/heremaps/flexible-polyline) ----------
const ENC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const DEC = Object.fromEntries([...ENC].map((c, i) => [c, i]));

export function decodeFlexiblePolyline(str) {
  // Valori senza segno a blocchi di 5 bit (aritmetica Number: niente overflow a 32 bit)
  const values = [];
  let result = 0;
  let mult = 1;
  for (const ch of str) {
    const v = DEC[ch];
    if (v === undefined) throw new Error('flexible polyline: invalid char');
    result += (v & 0x1f) * mult;
    if (v & 0x20) {
      mult *= 32;
    } else {
      values.push(result);
      result = 0;
      mult = 1;
    }
  }
  if (values[0] !== 1) throw new Error('flexible polyline: unsupported version');
  const header = values[1];
  const precision = header & 15;
  const thirdDim = Math.floor(header / 16) & 7;
  const factor = Math.pow(10, precision);
  const signed = u => (u % 2 ? -(u + 1) / 2 : u / 2);
  const step = thirdDim ? 3 : 2;
  const coords = [];
  let lat = 0, lng = 0;
  for (let i = 2; i + 1 < values.length; i += step) {
    lat += signed(values[i]);
    lng += signed(values[i + 1]);
    coords.push([lat / factor, lng / factor]);
  }
  return coords;
}

// ---------- Percorsi ----------
function placeOf(endpoint, fallbackName) {
  const p = endpoint?.place || {};
  return {
    name: p.name || fallbackName,
    stopId: p.id ? `here:${p.id}` : undefined,
    lat: p.location?.lat,
    lon: p.location?.lng,
    track: endpoint?.platform || p.platform
  };
}

function toLeg(section, isFirst, isLast) {
  const t = section.transport || {};
  const dep = section.departure || {};
  const arr = section.arrival || {};
  const realTime = dep.delay != null || arr.delay != null;
  let coords = null;
  try {
    coords = section.polyline ? decodeFlexiblePolyline(section.polyline) : null;
  } catch {
    coords = null;
  }
  const start = dep.time;
  const end = arr.time;
  return {
    mode: section.type === 'pedestrian' ? 'WALK' : mapMode(t.mode),
    from: placeOf(dep, isFirst ? 'START' : ''),
    to: placeOf(arr, isLast ? 'END' : ''),
    startTime: start,
    endTime: end,
    scheduledStartTime: scheduled(start, dep.delay),
    scheduledEndTime: scheduled(end, arr.delay),
    duration: section.travelSummary?.duration ?? Math.round((new Date(end) - new Date(start)) / 1000),
    distance: section.travelSummary?.length,
    realTime,
    cancelled: dep.status === 'cancelled' || arr.status === 'cancelled',
    displayName: t.shortName || t.name,
    routeShortName: t.shortName,
    routeLongName: t.longName,
    headsign: t.headsign,
    routeColor: noHash(t.color),
    routeTextColor: noHash(t.textColor),
    agencyName: section.agency?.name,
    agencyUrl: section.agency?.website,
    intermediateStops: section.intermediateStops || [],
    legGeometry: coords ? { coords } : null,
    attributions: section.attributions || []
  };
}

export async function herePlanTrip(from, to, { time, arriveBy, wheelchair, lang, signal } = {}) {
  const iso = time ? time.toISOString() : undefined;
  const data = await get('router', '/v8/routes', {
    origin: `${from.lat},${from.lon}`,
    destination: `${to.lat},${to.lon}`,
    departureTime: arriveBy ? undefined : iso,
    arrivalTime: arriveBy ? iso : undefined,
    alternatives: 5,
    return: 'polyline,travelSummary,intermediate',
    lang,
    // HERE non ha un profilo carrozzina per il calcolo: limitiamo almeno i tratti a piedi
    'pedestrian[maxDistance]': wheelchair ? 500 : undefined
  }, signal);
  const itineraries = (data.routes || [])
    .map(route => {
      const sections = route.sections || [];
      const legs = sections.map((s, i) => toLeg(s, i === 0, i === sections.length - 1));
      if (!legs.length) return null;
      const transitLegs = legs.filter(l => l.mode !== 'WALK');
      const startTime = legs[0].startTime;
      const endTime = legs[legs.length - 1].endTime;
      return {
        id: `here-${route.id}`,
        source: 'here',
        startTime,
        endTime,
        duration: Math.round((new Date(endTime) - new Date(startTime)) / 1000),
        transfers: Math.max(0, transitLegs.length - 1),
        legs,
        attributions: legs.flatMap(l => l.attributions)
      };
    })
    .filter(Boolean)
    // Il percorso solo a piedi che HERE aggiunge è utile solo se è l'unico
    .filter((it, _, all) => it.transfers > 0 || it.legs.some(l => l.mode !== 'WALK') || all.length === 1);
  return { itineraries, direct: [], source: 'here' };
}

// ---------- Partenze ----------
export async function hereDepartures({ stopId, center, radius = 400, signal, lang }) {
  const params = { maxPerBoard: 12, lang };
  if (stopId) params.ids = stopId.replace(/^here:/, '');
  else params.in = `${center.lat},${center.lon};r=${radius}`;
  const data = await get('transit', '/v8/departures', params, signal);
  const out = [];
  for (const board of data.boards || []) {
    const p = board.place || {};
    for (const d of board.departures || []) {
      const t = d.transport || {};
      out.push({
        key: `here-${p.id}-${t.name}-${t.headsign}`,
        stopName: p.name,
        stopId: p.id ? `here:${p.id}` : undefined,
        lat: p.location?.lat,
        lon: p.location?.lng,
        tz: null,
        time: d.time,
        scheduledTime: scheduled(d.time, d.delay),
        track: d.platform,
        realTime: d.delay != null,
        cancelled: d.status === 'cancelled',
        mode: mapMode(t.mode),
        line: t.shortName || t.name || '',
        routeLongName: t.longName,
        headsign: t.headsign,
        color: t.color || null,
        textColor: t.textColor || null,
        agencyName: d.agency?.name,
        agencyUrl: d.agency?.website,
        agencyFareUrl: undefined,
        routeUrl: undefined,
        wheelchair: undefined,
        source: 'here',
        attributions: board.attributions || []
      });
    }
  }
  return out;
}

/** Fermate intorno a un punto (usato dalla mappa fuori dalla zona MOTIS, solo su richiesta). */
export async function hereStations({ lat, lon, radius = 800, signal, lang }) {
  const data = await get('transit', '/v8/stations', { in: `${lat},${lon};r=${radius}`, maxPlaces: 50, return: 'transport', lang }, signal);
  return (data.stations || []).map(s => ({
    name: s.place?.name,
    stopId: `here:${s.place?.id}`,
    lat: s.place?.location?.lat,
    lon: s.place?.location?.lng,
    modes: [...new Set((s.transports || []).map(t => mapMode(t.mode)))]
  }));
}

// ---------- Ricerca luoghi (Geocoding & Search v7) ----------
const ISO3_TO_2 = {
  ITA: 'IT', FRA: 'FR', GBR: 'GB', USA: 'US', JPN: 'JP', DEU: 'DE', ESP: 'ES', PRT: 'PT', CHE: 'CH', AUT: 'AT', BEL: 'BE',
  NLD: 'NL', LUX: 'LU', IRL: 'IE', DNK: 'DK', SWE: 'SE', NOR: 'NO', FIN: 'FI', POL: 'PL', CZE: 'CZ', SVK: 'SK', HUN: 'HU',
  ROU: 'RO', BGR: 'BG', GRC: 'GR', HRV: 'HR', SVN: 'SI', SRB: 'RS', TUR: 'TR', UKR: 'UA', EST: 'EE', LVA: 'LV', LTU: 'LT',
  CAN: 'CA', MEX: 'MX', BRA: 'BR', ARG: 'AR', CHL: 'CL', COL: 'CO', PER: 'PE', AUS: 'AU', NZL: 'NZ', CHN: 'CN', KOR: 'KR',
  TWN: 'TW', HKG: 'HK', SGP: 'SG', IND: 'IN', THA: 'TH', MYS: 'MY', IDN: 'ID', PHL: 'PH', VNM: 'VN', ARE: 'AE', SAU: 'SA',
  ISR: 'IL', EGY: 'EG', MAR: 'MA', TUN: 'TN', ZAF: 'ZA', NGA: 'NG', KEN: 'KE', CIV: 'CI', SEN: 'SN', GHA: 'GH', CMR: 'CM',
  MLT: 'MT', CYP: 'CY', ISL: 'IS', MCO: 'MC', SMR: 'SM', VAT: 'VA', AND: 'AD', ALB: 'AL', MKD: 'MK', MNE: 'ME', BIH: 'BA', MDA: 'MD'
};

function toPlace(item) {
  const a = item.address || {};
  return {
    name: item.title?.split(',')[0] || a.label,
    type: item.resultType === 'locality' ? 'PLACE' : item.resultType === 'place' ? 'POI' : 'ADDRESS',
    lat: item.position?.lat,
    lon: item.position?.lng,
    country: ISO3_TO_2[a.countryCode] || undefined,
    area: [a.street && item.resultType !== 'street' ? `${a.street}${a.houseNumber ? ' ' + a.houseNumber : ''}` : '', a.city, a.countryName]
      .filter((v, i, arr) => v && v !== item.title?.split(',')[0] && arr.indexOf(v) === i)
      .join(', '),
    modes: [],
    source: 'here'
  };
}

export async function hereGeocode(text, { lang, near, cityOnly, signal } = {}) {
  if (cityOnly) {
    const data = await get('geocode', '/v1/geocode', { q: text, types: 'city', lang, limit: 8 }, signal);
    return (data.items || []).filter(i => i.position).map(toPlace);
  }
  const data = await get('discover', '/v1/discover', {
    q: text,
    at: near ? `${near.lat},${near.lon}` : '0,0',
    lang,
    limit: 8
  }, signal);
  return (data.items || []).filter(i => i.position).map(toPlace);
}

export async function hereReverseGeocode({ lat, lon }, { lang, signal } = {}) {
  const data = await get('revgeocode', '/v1/revgeocode', { at: `${lat},${lon}`, lang, types: 'city' }, signal);
  const item = data.items?.[0];
  if (!item) return null;
  const p = toPlace(item);
  return { ...p, name: item.address?.city || p.name, area: item.address?.city || p.area, lat, lon };
}
