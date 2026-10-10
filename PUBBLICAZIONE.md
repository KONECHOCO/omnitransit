# OmniTransit — cosa manca per pubblicare

Stato al 10/10/2026. Il codice dell'app è pronto: dati reali, 6 lingue, AdMob + Pro 2,99 €, progetti iOS/Android,
icone, `codemagic.yaml`, schede store, screenshot. Restano due **blocchi** e alcuni passaggi manuali.

## ✅ Blocco 1 — Server dati di produzione (installato il 10/10/2026)

MOTIS v2.11.3 gira su **ivoiro-server** (178.105.153.192), in `/opt/motis`, accanto al negozio ivoiroafrikstore.com.

- **Servizio**: `motis.service` ascolta su 127.0.0.1:8080, con limite di memoria (MemoryHigh 1,5 GB, MemoryMax 2,5 GB). Usa circa 230 MB di RAM.
- **Pubblicazione**: nginx `transit.ikonetsolutions.com` espone solo `/api/`, con un limite di 10 richieste al secondo per IP.
- **Aggiornamento**: ogni notte alle 3:30 (`/opt/motis/update.sh`, cron di root) riscarica gli orari, rifà l'importazione in una cartella nuova e poi la scambia con quella attiva. OSM viene riscaricato una volta a settimana.
- **Memoria**: swapfile da 8 GB (`/swapfile-motis`, swappiness 10) che serve solo durante l'importazione.
- **Copertura attuale**: Milano / Lombardia e Piacenza, con **ATM Milano** (CC-BY 4.0) e **Trenord** (CC-BY 4.0) e le strade OSM nel riquadro 8.6,44.85 – 10.3,45.95.
- **Copia della configurazione**: `deploy/motis/`.

**Da fare:**
1. Su Namecheap aggiungere il record **A `transit` → 178.105.153.192**.
2. Poi lanciare `certbot --nginx -d transit.ikonetsolutions.com` sul server (lo faccio io quando il DNS risponde).

**Per aggiungere città** si aggiungono feed con licenza commerciale in `update.sh` e `config.yml`, e si allarga l'area OSM.
- Parigi (IDFM, ODbL), New York (MTA) e Londra (BODS / TfL) sono fattibili, ma con 4 GB di RAM l'importazione va fatta una zona alla volta; per tutte insieme serve un upgrade a 8–16 GB.
- **Trenitalia**: il feed GTFS disponibile (BusOne) richiede un permesso scritto per l'uso commerciale.
- Finché il server non copre altre città, `VITE_FEATURED_CITIES=milan,piacenza` in `.env.production`, e le schede store vanno corrette di conseguenza (oggi citano Londra, Parigi, NY e Tokyo).

## ⛔ Blocco 2 — Bus urbani SETA (Piacenza)

SETA non pubblica i suoi orari in formato aperto (GTFS), quindi **a Piacenza l'app mostra treni e FlixBus, ma non i bus urbani**.
L'app lo dice chiaramente all'utente e rimanda all'app ufficiale.

Per risolvere:
- chiedere il feed GTFS a SETA (setaweb.it);
- oppure chiederlo alla Regione Emilia-Romagna / Lepida, che lo stanno raccogliendo per il travel planner regionale.

Con il server proprio (opzione A) il feed si aggiunge in un minuto.

## Passaggi manuali (le API non li permettono)

1. **AdMob**: creare le app "OmniTransit iOS" e "OmniTransit Android" (account pub-1151868778464777). Per ognuna creare 4 unità annuncio: banner, app open, interstitial, rewarded.
   - Mettere gli ID delle unità in `.env.production`.
   - Mettere l'App ID iOS in `ios/App/App/Info.plist` (`GADApplicationIdentifier`, oggi c'è l'ID di test Google).
   - Mettere l'App ID Android nella variabile `ADMOB_ANDROID_APP_ID` su Codemagic.
2. **App Store Connect**:
   - creare l'app con bundle id `com.ikonet.omnitransit`, SKU `omnitransit`, lingua principale Italiano;
   - creare l'acquisto in-app **non consumabile** `omnitransit_pro` a 2,99 €.
3. **Codemagic**:
   - collegare il repository e aggiungere l'app;
   - in Code signing identities → iOS provisioning profiles → **Fetch profiles**: importare il profilo App Store di `com.ikonet.omnitransit` con il nome `omnitransit_appstore`, e controllare che abbia la spunta verde sul certificato;
   - caricare un keystore Android con il nome `omnitransit_android`.
4. **Google Play Console**:
   - creare l'app;
   - creare il prodotto in-app `omnitransit_pro` a 2,99 €;
   - fare il primo caricamento dell'AAB a mano (traccia interna).
5. **Privacy policy online**: pubblicare `public/privacy.html` su un indirizzo pubblico (es. `transit.ikonetsolutions.com/privacy.html`) e mettere lo stesso dominio come marketing URL. Lì va anche `app-ads.txt` per AdMob.
6. **Paid Applications Agreement** attivo su App Store Connect → Business.

## Già pronto nel repository

- `store-assets/listing.json`: nome, sottotitolo, parole chiave, testo promozionale, descrizione e descrizione breve Play in **it, en-US, fr-FR, es-ES, de-DE, ja**. I limiti di caratteri si controllano con `node scripts/check-listing.mjs`.
- `store-assets/screenshots/<lingua>/`: iPhone 6,9" (1320×2868), iPad 13" (2064×2752) e Android (1080×1920), con dati reali. Si rigenerano con `node scripts/capture-store-screenshots.mjs <iphone|ipad|android> <lingua>` (serve il server di sviluppo sulla porta 5174).
- `store-assets/play/`: icona 512 e feature graphic 1024×500.
- **App Privacy / Data Safety**, cosa dichiarare:
  - Posizione approssimativa e precisa: usata per le funzionalità dell'app, non collegata all'identità.
  - Identificatore pubblicitario e dati d'uso: pubblicità di terze parti (AdMob), tracking: sì.
  - Acquisti gestiti dallo store.
- **Note per App Review**: «Nessun account richiesto. Gli orari arrivano dai feed GTFS ufficiali degli operatori. Per provare Pro usare un account sandbox. L'app non vende biglietti: rimanda ai siti ufficiali.»

## Ordine consigliato

Blocco 1 → AdMob → App Store Connect / Play Console → Codemagic → build verificata → metadati e screenshot via API → invio in revisione (solo dopo conferma).
