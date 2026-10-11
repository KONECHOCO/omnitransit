import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import Header from './components/Header';
import CityModal from './components/CityModal';
import RoutePlanner from './components/RoutePlanner';
import Departures from './components/Departures';
import MapView from './components/MapView';
import Tickets from './components/Tickets';
import Taxi from './components/Taxi';
import ProModal from './components/ProModal';
import AdBanner from './components/AdBanner';
import AdDiagnostics from './components/AdDiagnostics';

import { featuredCities, cityName } from './data/cities';
import { translations, detectLanguage, fmt } from './data/translations';
import { usePrefs, updatePrefs } from './services/storage';
import { getCurrentPosition } from './services/location';
import { initMonetization, trackAdAction, toggleTestAds } from './services/monetization';
import { USING_PUBLIC_TRANSITOUS } from './services/transit';

const LOCALES = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', ja: 'ja-JP' };

export default function App() {
  const prefs = usePrefs();
  const lang = prefs.lang || detectLanguage();
  const t = translations[lang] || translations.en;
  const locale = LOCALES[lang] || 'en-GB';

  const city = useMemo(
    () => (prefs.customCity && prefs.cityId === prefs.customCity.id ? prefs.customCity : featuredCities.find(c => c.id === prefs.cityId)) || featuredCities[0],
    [prefs.cityId, prefs.customCity]
  );
  const cityLabel = city.custom ? city.name : cityName(city, lang);

  const [activeTab, setActiveTab] = useState('planner');
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [mapItinerary, setMapItinerary] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [notice, setNotice] = useState(null);

  // Ogni cambio di scheda è un punto di passaggio naturale per un annuncio a schermo intero
  const changeTab = tab => {
    if (tab !== activeTab) trackAdAction();
    setActiveTab(tab);
  };

  // 7 tocchi sul logo: annunci di test on/off (per controllare le pubblicità nelle build di prova)
  const onSecretTap = () => {
    const on = toggleTestAds();
    setNotice(on ? "Test ads ON — riavvia l'app" : "Test ads OFF — riavvia l'app");
    setTimeout(() => setNotice(null), 4000);
  };

  useEffect(() => {
    initMonetization();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const getLocation = useCallback(async () => {
    setLocating(true);
    setLocationError(false);
    try {
      const pos = await getCurrentPosition();
      return { ...pos, name: t.planner.myLocation };
    } catch {
      setLocationError(true);
      return null;
    } finally {
      setLocating(false);
    }
  }, [t]);

  const selectCity = c => {
    updatePrefs(c.custom ? { cityId: c.id, customCity: c } : { cityId: c.id });
    setMapItinerary(null);
    setSelectedStop(null);
    trackAdAction();
  };

  const common = { city, cityLabel, t, lang, locale, getLocation, locating };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        t={t}
        lang={lang}
        setLang={code => updatePrefs({ lang: code })}
        cityLabel={cityLabel}
        cityFlag={city.flag}
        openCityModal={() => setCityModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={changeTab}
        onOpenPro={() => setProOpen(true)}
        onSecretTap={onSecretTap}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 space-y-4">
        {city.localBusMissing && activeTab !== 'tickets' && (
          <p className="flex gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            <Info className="w-4 h-4 shrink-0" />{fmt(t.city.localBusMissing, { operator: city.localBusMissing })}
          </p>
        )}
        {locationError && (
          <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200">{t.errors.location}</p>
        )}

        {/* Il planner resta montato per non perdere la ricerca quando si apre la mappa */}
        <div hidden={activeTab !== 'planner'}>
          <RoutePlanner
            {...common}
            onShowOnMap={it => { setMapItinerary(it); setActiveTab('map'); }}
            onOpenPro={() => setProOpen(true)}
          />
        </div>
        {activeTab === 'departures' && (
          <Departures {...common} stop={selectedStop} onStopChange={setSelectedStop} />
        )}
        {activeTab === 'map' && (
          <MapView
            {...common}
            itinerary={mapItinerary}
            onClearItinerary={() => setMapItinerary(null)}
            onOpenDepartures={stop => { setSelectedStop(stop); setActiveTab('departures'); trackAdAction(); }}
          />
        )}
        {activeTab === 'tickets' && <Tickets {...common} />}
        {activeTab === 'taxi' && <Taxi {...common} />}
      </main>

      <footer className="border-t border-slate-800/80 py-5 pb-16 text-center text-[11px] text-slate-500 space-y-1 px-4">
        <p>{t.footer.data} {t.footer.disclaimer}</p>
        <p className="space-x-3">
          <a href={USING_PUBLIC_TRANSITOUS ? 'https://transitous.org/sources/' : 'sources.html'} target="_blank" rel="noreferrer" className="underline hover:text-slate-300">{t.footer.sources}</a>
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-slate-300">© OpenStreetMap</a>
          <a href="privacy.html" target="_blank" rel="noreferrer" className="underline hover:text-slate-300">{t.footer.privacy}</a>
        </p>
      </footer>

      {notice && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-800 border border-slate-600 text-xs text-white shadow-xl">{notice}</div>
      )}

      <AdBanner t={t} onUpgrade={() => setProOpen(true)} />
      <AdDiagnostics />

      <CityModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        activeCity={city}
        onSelect={selectCity}
        t={t}
        lang={lang}
        getLocation={getLocation}
        locating={locating}
      />
      <ProModal isOpen={proOpen} onClose={() => setProOpen(false)} t={t} />
    </div>
  );
}
