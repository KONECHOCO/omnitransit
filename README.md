# OmniTransit

App multilingua (it, en, fr, es, de, ja) che riunisce i trasporti pubblici di ogni città: percorsi multimodali,
partenze in tempo reale, mappa delle fermate, canali ufficiali per biglietti e taxi.
Vite + React + Tailwind, Capacitor per iOS/Android, AdMob + acquisto Pro una tantum.

## Dati

Tutti gli orari arrivano dall'API del motore open source **MOTIS** (`src/services/transit.js`), alimentato dai feed
GTFS / GTFS-Realtime ufficiali degli operatori. In sviluppo si usa l'istanza pubblica Transitous, che non permette
l'uso commerciale; in produzione `VITE_TRANSIT_API_URL` deve puntare a un server MOTIS proprio (vedi `PUBBLICAZIONE.md`).
`src/data/cities.js` contiene solo contatti verificati (biglietti, taxi), non orari.

## Comandi

```bash
npm install
npm run dev                     # sviluppo
npm run build                   # build web in dist/
npx -y node@22 node_modules/@capacitor/cli/bin/capacitor sync   # copia la build nei progetti nativi
node scripts/check-listing.mjs  # limiti caratteri schede store
node scripts/capture-store-screenshots.mjs iphone it            # screenshot store (dev server su 5174)
```

Le build per gli store girano su Codemagic (`codemagic.yaml`). Prima pubblicazione: `PUBBLICAZIONE.md`.
Analisi del prototipo originale: `AUDIT.md`.
