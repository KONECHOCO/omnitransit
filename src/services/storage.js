/**
 * Preferenze e preferiti salvati sul dispositivo (nessun account, nessun dato inviato a server).
 */
import { useSyncExternalStore } from 'react';

const KEY = 'omnitransit.prefs';
export const FREE_FAVORITES_LIMIT = 3;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

let state = {
  lang: null,
  cityId: null,
  customCity: null,
  home: null,
  work: null,
  favorites: [],
  recents: [],
  ...load()
};
const listeners = new Set();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage non disponibile (navigazione privata): le preferenze restano solo in memoria
  }
}

export function updatePrefs(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  save();
  listeners.forEach(l => l());
}

export function usePrefs() {
  return useSyncExternalStore(cb => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, () => state);
}

const samePlace = (a, b) => a && b && (a.stopId ? a.stopId === b.stopId : Math.abs(a.lat - b.lat) < 1e-5 && Math.abs(a.lon - b.lon) < 1e-5);

/** Solo i campi utili di un luogo: niente dati superflui in memoria. */
export function slimPlace(p) {
  return { name: p.name, area: p.area || '', lat: p.lat, lon: p.lon, ...(p.stopId ? { stopId: p.stopId } : {}) };
}

export function addRecent(place) {
  updatePrefs(s => ({ recents: [slimPlace(place), ...s.recents.filter(r => !samePlace(r, place))].slice(0, 6) }));
}

export function isFavorite(place) {
  return state.favorites.some(f => samePlace(f, place));
}

export function toggleFavorite(place) {
  updatePrefs(s => ({
    favorites: s.favorites.some(f => samePlace(f, place))
      ? s.favorites.filter(f => !samePlace(f, place))
      : [...s.favorites, slimPlace(place)]
  }));
}
