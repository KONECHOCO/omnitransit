import React, { useEffect, useRef, useState } from 'react';
import { MapPin, LocateFixed, Loader2, X, Star, Home, Briefcase, Clock } from 'lucide-react';
import { geocode, MODE_ICON, modeGroup } from '../services/transit';
import { usePrefs } from '../services/storage';

/**
 * Campo luogo con suggerimenti (indirizzi, fermate, punti d'interesse) e scorciatoie:
 * posizione attuale, Casa, Lavoro, preferiti e recenti.
 */
export default function PlaceInput({ label, value, onChange, t, lang, near, onUseLocation, locating, icon, autoFocus }) {
  const prefs = usePrefs();
  const [text, setText] = useState(value?.name || '');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    setText(value?.name || '');
  }, [value]);

  // Ricerca con un piccolo ritardo per non chiamare l'API a ogni tasto
  useEffect(() => {
    if (!open || text.trim().length < 2 || text === value?.name) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setResults((await geocode(text.trim(), { lang, near, signal: ctrl.signal })).slice(0, 8));
      } catch (err) {
        if (err.name !== 'AbortError') setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [text, open, lang, near, value]);

  useEffect(() => {
    const close = e => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const pick = place => {
    onChange(place);
    setText(place.name);
    setOpen(false);
  };

  const shortcuts = [
    prefs.home && { ...prefs.home, label: t.planner.home, Icon: Home },
    prefs.work && { ...prefs.work, label: t.planner.work, Icon: Briefcase },
    ...prefs.favorites.map(f => ({ ...f, Icon: Star })),
    ...prefs.recents.map(r => ({ ...r, Icon: Clock }))
  ].filter(Boolean);

  const showShortcuts = open && text.trim().length < 2;

  return (
    <div ref={boxRef} className="relative">
      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400">{icon || <MapPin className="w-4 h-4" />}</div>
        <input
          type="text"
          value={text}
          autoFocus={autoFocus}
          onFocus={() => setOpen(true)}
          onChange={e => {
            setText(e.target.value);
            setOpen(true);
          }}
          placeholder={t.planner.placeholder}
          className="w-full pl-9 pr-16 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
          {text && (
            <button type="button" aria-label={t.common.close} onClick={() => { setText(''); onChange(null); setOpen(true); }} className="p-1 text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {open && (showShortcuts || results.length > 0) && (
        <div className="absolute z-30 mt-1 w-full max-h-80 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl divide-y divide-slate-800/70">
          {showShortcuts && onUseLocation && (
            <button type="button" onClick={async () => { const p = await onUseLocation(); if (p) pick(p); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-indigo-300 hover:bg-slate-800">
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
              {t.planner.myLocation}
            </button>
          )}
          {showShortcuts && shortcuts.map((s, i) => (
            <button key={`s${i}`} type="button" onClick={() => pick(s)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-800">
              <s.Icon className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm text-white truncate">{s.label ? `${s.label} · ${s.name}` : s.name}</span>
                {s.area && <span className="block text-[11px] text-slate-400 truncate">{s.area}</span>}
              </span>
            </button>
          ))}
          {!showShortcuts && results.map((r, i) => (
            <button key={`${r.stopId || ''}${r.lat}${r.lon}${i}`} type="button" onClick={() => pick(r)} className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-800">
              <span className="w-5 text-center shrink-0">{r.stopId ? MODE_ICON[modeGroup(r.modes[0])] || '🚏' : '📍'}</span>
              <span className="min-w-0">
                <span className="block text-sm text-white truncate">{r.name}</span>
                {r.area && <span className="block text-[11px] text-slate-400 truncate">{r.area}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
