/**
 * Città in evidenza. Orari, percorsi e partenze NON sono qui: arrivano sempre in tempo reale dall'API
 * (services/transit.js) e funzionano in qualsiasi città coperta dai dati. Qui ci sono solo le
 * informazioni che le API non forniscono: dove si comprano i biglietti e come chiamare un taxi.
 * Ogni contatto è stato verificato su fonti ufficiali (ottobre 2026): aggiornare con cautela.
 *
 * `localBusMissing`: la rete bus urbana non pubblica orari aperti (GTFS), quindi l'app mostra solo
 * treni e linee a lunga percorrenza e rimanda all'app ufficiale per i bus.
 */
export const cities = [
  {
    id: 'piacenza',
    names: { it: 'Piacenza', en: 'Piacenza', fr: 'Plaisance', es: 'Plasencia', de: 'Piacenza', ja: 'ピアチェンツァ' },
    country: 'IT',
    flag: '🇮🇹',
    lat: 45.0526,
    lon: 9.693,
    localBusMissing: 'SETA',
    tickets: [
      { name: 'SETA', note: 'busUrban', url: 'https://www.setaweb.it/' },
      { name: 'myCicero', note: 'ticketApp', url: 'https://www.mycicero.it/' },
      { name: 'Trenitalia', note: 'trains', url: 'https://www.trenitalia.com/' },
      { name: 'Trenord', note: 'trains', url: 'https://www.trenord.it/' },
      { name: 'Italo', note: 'trains', url: 'https://www.italotreno.com/' }
    ],
    taxis: [
      { name: 'Radio Taxi Piacenza', phone: '+390523591919', display: '0523 591919', note: 'taxiDay' },
      { name: 'Radio Taxi Piacenza', phone: '+393484485155', display: '348 448 5155', note: 'taxiNight' }
    ]
  },
  {
    id: 'milan',
    names: { it: 'Milano', en: 'Milan', fr: 'Milan', es: 'Milán', de: 'Mailand', ja: 'ミラノ' },
    country: 'IT',
    flag: '🇮🇹',
    lat: 45.4642,
    lon: 9.19,
    tickets: [
      { name: 'ATM Milano', note: 'metroBusTram', url: 'https://www.atm.it/' },
      { name: 'Trenord', note: 'trains', url: 'https://www.trenord.it/' },
      { name: 'Trenitalia', note: 'trains', url: 'https://www.trenitalia.com/' },
      { name: 'Italo', note: 'trains', url: 'https://www.italotreno.com/' }
    ],
    taxis: [
      { name: 'Comune di Milano', phone: '+39027777', display: '02 7777', note: 'cityTaxiNumber' },
      { name: 'Taxiblu', phone: '+39024040', display: '02 4040' },
      { name: 'Radiotaxi Milano', phone: '+39028585', display: '02 8585' },
      { name: 'Yellow Taxi', phone: '+39026969', display: '02 6969' },
      { name: 'FREENOW', url: 'https://www.free-now.com/' },
      { name: 'Uber', url: 'https://www.uber.com/' }
    ]
  },
  {
    id: 'paris',
    names: { it: 'Parigi', en: 'Paris', fr: 'Paris', es: 'París', de: 'Paris', ja: 'パリ' },
    country: 'FR',
    flag: '🇫🇷',
    lat: 48.8566,
    lon: 2.3522,
    tickets: [
      { name: 'Île-de-France Mobilités', note: 'officialApp', url: 'https://www.iledefrance-mobilites.fr/' },
      { name: 'Bonjour RATP', note: 'metroBusTram', url: 'https://www.ratp.fr/' },
      { name: 'SNCF Connect', note: 'trains', url: 'https://www.sncf-connect.com/' }
    ],
    taxis: [
      { name: 'Taxis G7', phone: '3607', display: '36 07', url: 'https://www.g7.fr/' },
      { name: 'FREENOW', url: 'https://www.free-now.com/' },
      { name: 'Uber', url: 'https://www.uber.com/' },
      { name: 'Bolt', url: 'https://bolt.eu/' }
    ]
  },
  {
    id: 'london',
    names: { it: 'Londra', en: 'London', fr: 'Londres', es: 'Londres', de: 'London', ja: 'ロンドン' },
    country: 'GB',
    flag: '🇬🇧',
    lat: 51.5074,
    lon: -0.1278,
    tickets: [
      { name: 'TfL (contactless / Oyster)', note: 'contactless', url: 'https://tfl.gov.uk/fares/' },
      { name: 'National Rail', note: 'trains', url: 'https://www.nationalrail.co.uk/' }
    ],
    taxis: [
      { name: 'TfL — taxis & minicabs', note: 'licensedOnly', url: 'https://tfl.gov.uk/modes/taxis-and-minicabs/' },
      { name: 'FREENOW', url: 'https://www.free-now.com/' },
      { name: 'Uber', url: 'https://www.uber.com/' },
      { name: 'Bolt', url: 'https://bolt.eu/' }
    ]
  },
  {
    id: 'newyork',
    names: { it: 'New York', en: 'New York', fr: 'New York', es: 'Nueva York', de: 'New York', ja: 'ニューヨーク' },
    country: 'US',
    flag: '🇺🇸',
    lat: 40.7128,
    lon: -74.006,
    tickets: [
      { name: 'OMNY', note: 'contactless', url: 'https://omny.info/' },
      { name: 'MTA (LIRR, Metro-North: TrainTime)', note: 'trains', url: 'https://new.mta.info/' },
      { name: 'NJ Transit', note: 'trains', url: 'https://www.njtransit.com/' }
    ],
    taxis: [
      { name: 'Curb (NYC Yellow Cab)', url: 'https://gocurb.com/' },
      { name: 'Uber', url: 'https://www.uber.com/' }
    ]
  },
  {
    id: 'tokyo',
    names: { it: 'Tokyo', en: 'Tokyo', fr: 'Tokyo', es: 'Tokio', de: 'Tokio', ja: '東京' },
    country: 'JP',
    flag: '🇯🇵',
    lat: 35.6812,
    lon: 139.7671,
    tickets: [
      { name: 'Suica (JR East)', note: 'icCard', url: 'https://www.jreast.co.jp/multi/en/pass/suica.html' },
      { name: 'Tokyo Metro', note: 'metroBusTram', url: 'https://www.tokyometro.jp/en/' },
      { name: 'JR East', note: 'trains', url: 'https://www.jreast.co.jp/multi/en/' }
    ],
    taxis: [
      { name: 'GO', note: 'taxiApp', url: 'https://go.goinc.jp/' },
      { name: 'Uber', url: 'https://www.uber.com/' }
    ]
  }
];

/**
 * Città mostrate in evidenza: devono essere coperte dal server orari in uso.
 * VITE_FEATURED_CITIES (es. "milan,piacenza") restringe l'elenco quando il server copre solo alcune zone.
 */
const featuredIds = (import.meta.env.VITE_FEATURED_CITIES || '').split(',').map(s => s.trim()).filter(Boolean);
export const featuredCities = featuredIds.length ? cities.filter(c => featuredIds.includes(c.id)) : cities;

export function cityName(city, lang) {
  return city.names?.[lang] || city.names?.en || city.name;
}

/** Città scelta dall'utente tramite ricerca (qualsiasi luogo coperto dai dati). */
export function customCity(place) {
  return {
    id: `custom-${place.lat.toFixed(3)},${place.lon.toFixed(3)}`,
    name: place.name,
    country: place.country,
    flag: countryFlag(place.country),
    lat: place.lat,
    lon: place.lon,
    tickets: [],
    taxis: [],
    custom: true
  };
}

export function countryFlag(code) {
  if (!code || code.length !== 2) return '🌍';
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}
