import React, { useEffect, useState } from 'react';
import { X, Search, LocateFixed, Loader2 } from 'lucide-react';
import { featuredCities, cityName, customCity } from '../data/cities';
import { geocode, reverseGeocode } from '../services/provider';

export default function CityModal({ isOpen, onClose, activeCity, onSelect, t, lang, getLocation, locating }) {
  const [text, setText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setResults((await geocode(text.trim(), { lang, type: 'PLACE', signal: ctrl.signal })).slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [text, lang]);

  if (!isOpen) return null;

  const choose = city => {
    onSelect(city);
    setText('');
    onClose();
  };

  const useMyLocation = async () => {
    const pos = await getLocation();
    if (!pos) return;
    const place = await reverseGeocode(pos, { lang }).catch(() => null);
    const label = place?.area?.split(',').map(s => s.trim()).find(Boolean) || place?.name || t.planner.myLocation;
    choose(customCity({ name: label, lat: pos.lat, lon: pos.lon, country: place?.country }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex justify-center overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-lg my-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-5 flex items-start justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-heading">{t.city.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.city.subtitle}</p>
          </div>
          <button onClick={onClose} aria-label={t.common.close} className="p-1.5 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t.city.search}
              className="w-full pl-9 pr-9 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
          </div>

          {results.length > 0 ? (
            <ul className="divide-y divide-slate-800 rounded-xl border border-slate-800 overflow-hidden">
              {results.map((r, i) => (
                <li key={`${r.lat}${r.lon}${i}`}>
                  <button onClick={() => choose(customCity(r))} className="w-full text-left px-3 py-2.5 hover:bg-slate-800">
                    <span className="block text-sm text-white">{r.name}</span>
                    <span className="block text-[11px] text-slate-400">{r.area}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <button onClick={useMyLocation} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 text-sm font-semibold">
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                {t.city.useLocation}
              </button>
              <div className="space-y-2">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">{t.city.featured}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {featuredCities.map(c => (
                    <button
                      key={c.id}
                      onClick={() => choose(c)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm ${activeCity.id === c.id ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600'}`}
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span className="truncate">{cityName(c, lang)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
