import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { consentDone } from './monetization';

/** Posizione attuale dell'utente. Nell'app nativa usa il plugin (popup di sistema corretto su iOS). */
export async function getCurrentPosition() {
  if (Capacitor.isNativePlatform()) {
    // iOS mostra un popup alla volta: prima finiscono consenso GDPR e tracciamento, poi la posizione
    await Promise.race([consentDone, new Promise(r => setTimeout(r, 15000))]);
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted') {
      const req = await Geolocation.requestPermissions({ permissions: ['location'] });
      if (req.location !== 'granted') throw new Error('denied');
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 });
    return { lat: pos.coords.latitude, lon: pos.coords.longitude };
  }
  if (!navigator.geolocation) throw new Error('unavailable');
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

/** Distanza in metri tra due punti (formula dell'emisenoverso). */
export function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
