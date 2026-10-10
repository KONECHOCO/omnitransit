/**
 * Monetizzazione: AdMob (video all'apertura, banner, interstitial video, video premio) + OmniTransit Pro.
 *
 * - OmniTransit Pro = acquisto una tantum (non consumabile, 2,99 €) che rimuove TUTTA la pubblicità
 *   e sblocca i preferiti illimitati. Prodotto da creare su App Store Connect e Play Console
 *   con ID PRO_PRODUCT_ID.
 * - Gli ID AdMob reali arrivano dalle variabili VITE_ADMOB_* (Codemagic). Senza di esse si usano
 *   gli ID di test ufficiali Google: non pubblicare mai l'app con gli annunci di test.
 * - Nel browser non ci sono annunci: resta solo la barra di anteprima (AdBanner.jsx).
 */
import { useSyncExternalStore } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import {
  AdMob,
  AdmobConsentStatus,
  AppOpenAdPluginEvents,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  RewardAdPluginEvents
} from '@capacitor-community/admob';
import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';

export const PRO_PRODUCT_ID = 'omnitransit_pro';

const native = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform();
const env = import.meta.env;

// ID di test ufficiali Google (https://developers.google.com/admob/android/test-ads)
const TEST_IDS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/9214589741',
    appOpen: 'ca-app-pub-3940256099942544/9257395921',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917'
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2435281174',
    appOpen: 'ca-app-pub-3940256099942544/5575463023',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313'
  }
};

const P = platform === 'ios' ? 'IOS' : 'ANDROID';
const REAL_IDS = {
  banner: env[`VITE_ADMOB_${P}_BANNER`],
  appOpen: env[`VITE_ADMOB_${P}_APP_OPEN`],
  interstitial: env[`VITE_ADMOB_${P}_INTERSTITIAL`],
  rewarded: env[`VITE_ADMOB_${P}_REWARDED`]
};
// In sviluppo sempre annunci di test: cliccare i propri annunci reali viola le norme AdMob
const USE_TEST_ADS = env.DEV || !REAL_IDS.banner;
const AD_IDS = USE_TEST_ADS ? TEST_IDS[platform] || TEST_IDS.android : REAL_IDS;

// Frequenze: aggressive ma dentro le regole AdMob (niente annunci a raffica o durante l'uso attivo)
const INTERSTITIAL_EVERY_N_ACTIONS = 3;
const MIN_GAP_BETWEEN_FULLSCREEN_MS = 60 * 1000;
const APP_OPEN_MIN_BACKGROUND_MS = 30 * 1000;
const APP_OPEN_LOAD_TIMEOUT_MS = 8000;
const REWARD_UNLOCK_MS = 24 * 60 * 60 * 1000;

const PRO_KEY = 'omnitransit.pro';
const UNLOCKS_KEY = 'omnitransit.rewardUnlocks';

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage non disponibile
  }
}

// ---------- Stato osservabile da React ----------
// Solo in sviluppo: ?storeshot mostra l'interfaccia d'acquisto nativa per gli screenshot degli store
const previewNative = import.meta.env.DEV && typeof location !== 'undefined' && location.search.includes('storeshot');

let state = {
  native: native || previewNative,
  isPro: readStorage(PRO_KEY, false),
  proPrice: null,
  adsReady: false,
  rewardedReady: false,
  bannerHeight: 0,
  unlocks: readStorage(UNLOCKS_KEY, {})
};
const listeners = new Set();
function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
}
export function useMonetization() {
  return useSyncExternalStore(cb => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, () => state);
}

// ---------- Annunci ----------
let lastFullscreenAt = 0;
let actionCount = 0;
let backgroundedAt = 0;
let interstitialLoaded = false;
let appOpenLoaded = false;
let fullscreenShowing = false;
let rewardEarned = false;

function adsAllowed() {
  return native && state.adsReady && !state.isPro;
}

async function prepareInterstitial() {
  try {
    await AdMob.prepareInterstitial({ adId: AD_IDS.interstitial, isTesting: USE_TEST_ADS });
    interstitialLoaded = true;
  } catch {
    interstitialLoaded = false;
  }
}

async function prepareRewarded() {
  try {
    await AdMob.prepareRewardVideoAd({ adId: AD_IDS.rewarded, isTesting: USE_TEST_ADS });
    setState({ rewardedReady: true });
  } catch {
    setState({ rewardedReady: false });
  }
}

async function loadAppOpen() {
  try {
    await AdMob.loadAppOpen({ adId: AD_IDS.appOpen });
    appOpenLoaded = true;
  } catch {
    appOpenLoaded = false;
  }
}

async function showAppOpen() {
  if (!adsAllowed() || fullscreenShowing) return;
  if (!appOpenLoaded) {
    // All'avvio aspettiamo al massimo pochi secondi: meglio perdere l'annuncio che bloccare l'utente
    await Promise.race([loadAppOpen(), new Promise(r => setTimeout(r, APP_OPEN_LOAD_TIMEOUT_MS))]);
  }
  if (!appOpenLoaded) return;
  try {
    fullscreenShowing = true;
    appOpenLoaded = false;
    await AdMob.showAppOpen();
    lastFullscreenAt = Date.now();
  } catch {
    fullscreenShowing = false;
  }
}

async function showBanner() {
  if (!adsAllowed()) return;
  try {
    await AdMob.showBanner({
      adId: AD_IDS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: USE_TEST_ADS
    });
  } catch (err) {
    console.info('Banner non disponibile', err);
  }
}

async function removeAllAds() {
  if (!native) return;
  try {
    await AdMob.removeBanner();
  } catch {
    // nessun banner attivo
  }
  setState({ bannerHeight: 0 });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Si risolve quando le richieste di sistema (ATT, consenso GDPR) sono concluse: l'app aspetta questo
// momento prima di chiedere la posizione, perché iOS mostra un solo popup alla volta e scarta gli altri.
let resolveConsentDone;
export const consentDone = new Promise(r => { resolveConsentDone = r; });

async function waitUntilActive() {
  const { isActive } = await CapApp.getState();
  if (isActive) return;
  await new Promise(resolve => {
    const handle = CapApp.addListener('appStateChange', ({ isActive: active }) => {
      if (active) {
        handle.then(h => h.remove());
        resolve();
      }
    });
  });
}

// App Tracking Transparency (iOS): il popup viene mostrato dal codice nativo (SceneDelegate.swift)
// appena l'app è attiva. Qui aspettiamo la risposta dell'utente prima di inizializzare AdMob, così
// nessun dato di tracciamento viene raccolto prima del consenso. Dopo 6 s senza popup lo chiediamo
// anche dal plugin come riserva.
async function requestTrackingPermission() {
  if (platform !== 'ios') return;
  try {
    await waitUntilActive();
    for (let waited = 0; waited < 60000; waited += 1000) {
      const { status } = await AdMob.trackingAuthorizationStatus();
      if (status !== 'notDetermined') return;
      if (waited === 6000) AdMob.requestTrackingAuthorization().catch(() => {});
      await sleep(1000);
    }
  } catch (err) {
    console.info('ATT non disponibile', err);
  }
}

// Consenso GDPR (UMP, obbligatorio in UE/UK per AdMob). Un errore qui non deve bloccare ATT né gli annunci.
async function gatherConsent() {
  await requestTrackingPermission();
  try {
    let info = await Promise.race([
      AdMob.requestConsentInfo(),
      sleep(10000).then(() => { throw new Error('UMP timeout'); })
    ]);
    if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
      info = await AdMob.showConsentForm();
    }
    return info.canRequestAds !== false;
  } catch (err) {
    console.info('Consenso UMP non disponibile', err);
    return true;
  }
}

/** Da chiamare una volta all'avvio dell'app. */
export async function initMonetization() {
  if (!native) {
    resolveConsentDone();
    return;
  }
  // StoreKit può non rispondere mai (es. TestFlight con prodotto non ancora approvato):
  // la verifica Pro non deve bloccare la richiesta ATT, quindi ha un tempo massimo
  await Promise.race([refreshProStatus(), sleep(4000)]);
  if (state.isPro) {
    resolveConsentDone();
    return;
  }

  let canRequestAds = true;
  try {
    canRequestAds = await gatherConsent();
  } finally {
    resolveConsentDone();
  }
  if (!canRequestAds) return;

  await AdMob.initialize({ initializeForTesting: USE_TEST_ADS });
  setState({ adsReady: true });

  AdMob.addListener(BannerAdPluginEvents.SizeChanged, size => setState({ bannerHeight: size.height || 0 }));
  AdMob.addListener(AppOpenAdPluginEvents.Closed, () => {
    fullscreenShowing = false;
    lastFullscreenAt = Date.now();
    loadAppOpen();
  });
  // Il premio conta solo se AdMob conferma che il video è stato guardato fino alla fine
  AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
    rewardEarned = true;
  });
  AdMob.addListener(AppOpenAdPluginEvents.FailedToShow, () => {
    fullscreenShowing = false;
    loadAppOpen();
  });

  // 1) Video appena si apre l'app, 2) banner fisso, 3) precarico interstitial e video premio
  await showAppOpen();
  showBanner();
  prepareInterstitial();
  prepareRewarded();

  // Video anche quando l'utente torna nell'app dopo averla lasciata in background
  CapApp.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      backgroundedAt = Date.now();
      return;
    }
    const away = backgroundedAt ? Date.now() - backgroundedAt : 0;
    if (away >= APP_OPEN_MIN_BACKGROUND_MS && Date.now() - lastFullscreenAt >= MIN_GAP_BETWEEN_FULLSCREEN_MS) {
      showAppOpen();
    }
  });
}

/**
 * Da chiamare nei "punti di passaggio" naturali (apertura dettaglio distributore, cambio città,
 * apertura calcolatore...). Mostra un interstitial video ogni N azioni, con distanza minima.
 */
export async function trackAdAction() {
  if (!adsAllowed() || fullscreenShowing) return;
  actionCount += 1;
  if (actionCount % INTERSTITIAL_EVERY_N_ACTIONS !== 0) return;
  if (Date.now() - lastFullscreenAt < MIN_GAP_BETWEEN_FULLSCREEN_MS) return;
  if (!interstitialLoaded) {
    prepareInterstitial();
    return;
  }
  try {
    fullscreenShowing = true;
    interstitialLoaded = false;
    await AdMob.showInterstitial();
    lastFullscreenAt = Date.now();
  } catch {
    // annuncio non disponibile
  } finally {
    fullscreenShowing = false;
    prepareInterstitial();
  }
}

// ---------- Video premio: sblocca una funzione per 24 ore ----------
export function isFeatureUnlocked(feature) {
  if (state.isPro || !native) return true;
  return (state.unlocks[feature] || 0) > Date.now();
}

/** Mostra un video premio; se l'utente lo guarda fino alla fine sblocca la funzione. */
export async function unlockWithRewardedVideo(feature) {
  if (!adsAllowed()) return false;
  try {
    fullscreenShowing = true;
    rewardEarned = false;
    await AdMob.showRewardVideoAd();
    lastFullscreenAt = Date.now();
    if (!rewardEarned) return false;
    const unlocks = { ...state.unlocks, [feature]: Date.now() + REWARD_UNLOCK_MS };
    writeStorage(UNLOCKS_KEY, unlocks);
    setState({ unlocks });
    return true;
  } catch {
    return false;
  } finally {
    fullscreenShowing = false;
    setState({ rewardedReady: false });
    prepareRewarded();
  }
}

// ---------- OmniTransit Pro (acquisto una tantum) ----------
function setPro(isPro) {
  writeStorage(PRO_KEY, isPro);
  setState({ isPro });
  if (isPro) removeAllAds();
}

function ownsPro(purchases) {
  return (purchases || []).some(p =>
    p.productIdentifier === PRO_PRODUCT_ID && (platform !== 'android' || p.purchaseState === '1' || p.purchaseState == null)
  );
}

export async function refreshProStatus() {
  if (!native) return;
  try {
    const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.INAPP });
    setPro(ownsPro(purchases));
  } catch (err) {
    // offline: teniamo l'ultimo stato noto
    console.info('Verifica Pro non riuscita', err);
  }
  // Il prezzo localizzato serve solo alla schermata Pro: lo carichiamo senza attenderlo
  NativePurchases.getProduct({ productIdentifier: PRO_PRODUCT_ID, productType: PURCHASE_TYPE.INAPP })
    .then(({ product }) => setState({ proPrice: product?.priceString || null }))
    .catch(() => {
      // prodotto non ancora configurato negli store
    });
}

export async function buyPro() {
  if (!native) throw new Error('Acquisto disponibile solo nell\'app');
  const tx = await NativePurchases.purchaseProduct({
    productIdentifier: PRO_PRODUCT_ID,
    productType: PURCHASE_TYPE.INAPP,
    quantity: 1
  });
  if (tx?.productIdentifier === PRO_PRODUCT_ID) setPro(true);
  return state.isPro;
}

export async function restorePro() {
  if (!native) return false;
  try {
    await NativePurchases.restorePurchases();
  } catch {
    // proseguiamo comunque con la lettura degli acquisti
  }
  await refreshProStatus();
  return state.isPro;
}
