# OmniTransit — Audit del progetto (10/10/2026)

## 1. Verdetto in breve

Il progetto è un **prototipo grafico (mockup)**, non un'app funzionante.
Tutti i dati arrivano da `src/data/transitData.js`, scritti a mano. **Non c'è nessuna chiamata a un'API reale.**
Hai ragione a dubitare dei dati: sono **inventati e in parte sbagliati**.

Inoltre è una **web app** (Vite + React). Non è un'app iOS/Android, quindi oggi **non si può pubblicare sugli store**.

## 2. Cosa è finto (anche se l'interfaccia dice "Live")

| Funzione | Cosa fa davvero | File |
|---|---|---|
| Ricerca percorso | Il pulsante aspetta 400 ms e mostra sempre gli stessi 1–2 percorsi fissi, qualunque cosa scrivi | `RoutePlanner.jsx:50` |
| Badge "GTFS Live Verified" | Testo fisso, nessuna verifica | `RoutePlanner.jsx:243` |
| Mappa "radar live" | 1–4 veicoli finti che si muovono a caso (`Math.random`) ogni 3 s | `LiveMap.jsx:30` |
| Tabellone partenze | 5 partenze fisse, uguali per ogni fermata | `DepartureBoard.jsx:15` |
| Biglietti / NFC / QR | Genera un codice casuale, nessun pagamento, nessun QR reale | `TicketWallet.jsx:31`, `App.jsx:29` |
| Prenotazione taxi | Aspetta 1,5 s e dice "confermato" con codice fisso `TX-9912` | `TaxiHub.jsx:45` |
| Mappe offline, Eco, Segnalazioni | Solo animazioni, nessun dato | vari |

⚠️ **Rischio grave**: il wallet "vende" biglietti e mostra QR "da mostrare ai controllori". Pubblicato così, un utente potrebbe pensare di avere un biglietto valido e prendere una multa. Apple (Guideline 2.3 / 5.x) e Google (policy "Misleading claims") rifiuterebbero l'app.

## 3. Errori nei dati (verificati)

| Città | Dato nell'app | Realtà |
|---|---|---|
| **Tutte tranne Piacenza** | Tabellone partenze mostra "Linea 2 RATP → Ospedale Saliceto", "Barriera Torino"… anche a Londra, New York, Tokyo | Bug: le partenze di Piacenza sono copiate su tutte le città (`DepartureBoard.jsx:16-20`) |
| **Parigi** | Taxi: "Official City Taxi" invece di G7 | Bug: confronta `'Parigi'` ma il nome è `'Parigi (Paris)'` (`TaxiHub.jsx:15`) |
| **Parigi** | "Ticket t+" a € 2,15 | Il Ticket t+ non esiste più dal 2025. Oggi: ticket Métro‑Train‑RER **€ 2,55** (2026), Bus‑Tram separato |
| **Parigi** | Gare de Lyon → Tour Eiffel: "cambio a Châtelet verso RER C" | **La RER C non passa da Châtelet** (passa da Saint‑Michel Notre‑Dame) |
| **Londra** | Paddington → London Bridge con Elizabeth Line | **La Elizabeth Line non ferma a London Bridge** (va a Liverpool Street/Whitechapel) |
| **New York** | Tariffa $ 2,90 | Dal 4 gennaio 2026 è **$ 3,00** |
| **New York** | Penn → Grand Central: il passo "Shuttle" manca | Servono 2 tratte (1/2/3 fino a Times Sq + Shuttle S), non "0 cambi" |
| **Piacenza** | Regionale per Milano Centrale in 38 min; operatore "Frecciarossa / RV" | Un regionale ci mette ~45–60 min; 38 min è un tempo da Frecciarossa. Le due cose sono mescolate |
| **Londra / NY / Tokyo** | Biglietti a "€ 1,50", "€ 4,50"; taxi "€ 8,50" | Valuta sbagliata: i prezzi sono in euro per tutte le città (`TicketWallet.jsx:52`, `TaxiHub.jsx:18`) |
| **Piacenza** | Biglietto urbano € 1,50 / 75 min | Non sono riuscito a confermare la tariffa 2026: va controllata su seta.it |
| Milano (M3, € 2,20) e Tokyo (¥ 210) | — | Corretti |

## 4. Altri bug tecnici

- **Ordinamento "più economico" rotto**: `"€ 1,50"` diventa `150`, perché la virgola viene tolta (`RoutePlanner.jsx:72`).
- I filtri **"Accessibile"** e **"per mezzo"** non fanno niente.
- La lingua cambia solo in parte: molti testi sono in italiano fisso ("Partenza", "Destinazione", "Tutti i Mezzi", "Cambia Paese / Città", il footer…).
- Tailwind è caricato dal **CDN `cdn.tailwindcss.com`**: non va usato in produzione (lento, avvisi in console, non funziona offline).
- README ancora quello del template Vite; nessun test; nessun PWA/manifest.
- Il taxi "FreeNow / Uber" è proposto anche a Piacenza, dove questi servizi non ci sono.

## 5. Confronto con app simili

| App | Punti di forza che OmniTransit non ha |
|---|---|
| **Moovit** | Dati reali in 3.500+ città, avviso "scendi alla prossima", segnalazioni utenti, live arrivals |
| **Citymapper** | Calcolo percorsi multimodale reale, "Go mode" passo-passo, uscite metro consigliate |
| **Google Maps** | Copertura globale, ricerca indirizzi, orari in tempo reale |
| **myCicero** (Italia) | **Vende già i biglietti SETA Piacenza** e di molti operatori italiani, parcheggi |
| **Trainline / Omio** | Treni e bus nazionali/internazionali (Trenitalia, Italo, SNCF, FlixBus) in un'unica ricerca |
| **Bonjour RATP / IDFM** | Biglietti Navigo sul telefono a Parigi |
| **FreeNow / Uber / Bolt** | Taxi reale, prezzo e tracciamento |

**Cosa manca e conviene aggiungere (in ordine di importanza):**
1. **Percorsi e orari reali** (vedi sezione 6) — senza questo l'app non ha valore.
2. **Ricerca indirizzi** con autocompletamento (geocoding) e "Posizione attuale" GPS.
3. **Fermate vicino a me** con prossimi passaggi reali.
4. **Preferiti**: Casa/Lavoro, linee e fermate salvate.
5. **Avvisi reali** (scioperi, deviazioni) dai feed GTFS‑RT *Service Alerts*.
6. **Notifiche**: "il tuo bus arriva tra 5 min", "scendi alla prossima".
7. **Biglietti**: **non** venderli in proprio. Aprire l'app ufficiale con un link diretto (myCicero, Trenitalia, Bonjour RATP, TfL contactless, OMNY…). Più avanti si possono fare accordi di affiliazione.
8. **Taxi**: pulsante "Chiama" (`tel:`) con il numero reale del radiotaxi locale + link diretto a FreeNow/Uber/Bolt solo dove esistono.
9. **Bici e monopattini** in sharing (feed **GBFS** pubblici: Dott, Lime, Tier, BikeMi, Vélib').
10. **Orari offline** (cache dei dati della città).
11. **Accessibilità reale** (fermate con ascensore, dati `wheelchair_boarding` nel GTFS).
12. **Treni nazionali**: Trenitalia/Italo/SNCF tramite link o affiliazione Trainline.

## 6. Da dove prendere i dati reali (gratis o quasi)

| Fonte | Copertura | Note |
|---|---|---|
| **Transitous** (motore MOTIS) | 60+ paesi, open source, API gratuita | **Consigliato come base**: percorsi, partenze, fermate in un'unica API. Usato da GNOME Maps e KDE Itinerary. Uso "fair use": per un'app commerciale con tanti utenti meglio installare MOTIS sul proprio server |
| **Mobility Database / Transitland** | Catalogo mondiale di feed GTFS | Per trovare i feed di ogni città |
| **SETA** (open data Emilia‑Romagna) | Piacenza, Modena, Reggio | GTFS statico |
| **TfL Unified API** | Londra | Gratuita, ottima |
| **MTA GTFS‑RT** | New York | Gratuita |
| **PRIM Île‑de‑France Mobilités** | Parigi | Gratuita con registrazione |
| **ODPT** | Tokyo | Gratuita con registrazione |
| **Photon / Nominatim** (OpenStreetMap) | Mondo | Ricerca indirizzi |
| **GBFS** | Sharing bici/monopattini | Feed pubblici degli operatori |

## 7. Pubblicazione sugli store, pubblicità e versione Pro € 2,99

**Oggi non è pubblicabile.** Mancano:
1. **Pacchetto mobile**: avvolgere la web app con **Capacitor** (iOS + Android). Il codice React resta quasi tutto uguale.
2. **Dati reali** (sezione 6), e togliere vendita biglietti/NFC/taxi finti. Altrimenti è un rifiuto quasi certo.
3. **Pubblicità**: AdMob (banner in basso + interstitial raro). Serve il consenso GDPR (UMP/CMP) in UE e ATT su iOS.
4. **Pro € 2,99**: acquisto in-app *non-consumable* "Rimuovi pubblicità". Va implementato con **RevenueCat** o con `@capacitor-community/in-app-purchase`, più il pulsante "Ripristina acquisti" (obbligatorio per Apple).
5. **Privacy policy** pubblica (posizione GPS + pubblicità) e la sezione Data Safety / App Privacy.
6. **Schede store multilingua** (IT, EN, FR, ES, DE, JA): titolo, sottotitolo, descrizione, parole chiave, screenshot per ogni lingua.
7. Attribuzioni obbligatorie delle licenze dati (OpenStreetMap, Transitous, TfL…).

## 8. Piano consigliato

| Fase | Contenuto | Stima |
|---|---|---|
| 1 | Correggere bug e i18n, Tailwind installato in locale, togliere funzioni finte | 1 giorno |
| 2 | Integrare Transitous (percorsi, partenze, fermate vicine) + geocoding + GPS | 3–5 giorni |
| 3 | Preferiti, avvisi, link ad app ufficiali biglietti/taxi, GBFS | 2–3 giorni |
| 4 | Capacitor + AdMob + IAP Pro € 2,99 + privacy policy | 2–3 giorni |
| 5 | Schede store in 6 lingue, screenshot, invio a Apple/Google | 1–2 giorni |
