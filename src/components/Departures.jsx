import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LocateFixed, Building2, RefreshCw, Radio, Accessibility, AlertCircle, Loader2 } from 'lucide-react';
import PlaceInput from './PlaceInput';
import { departures as fetchDepartures, refreshIntervalFor } from '../services/provider';
import { dedupeDepartures, modeGroup, MODE_ICON, MODE_COLOR, formatTime, delayMinutes, minutesUntil } from '../services/transit';
import { trackAdAction } from '../services/monetization';
import { fmt } from '../data/translations';

const RADIUS = 400;
// Alcuni feed scrivono le destinazioni tutte in minuscolo ("bisceglie")
const capitalize = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const REFRESH_MS = 30000;

export default function Departures({ city, cityLabel, t, lang, locale, getLocation, locating, stop, onStopChange }) {
  const [source, setSource] = useState(() => (stop ? { type: 'stop', place: stop } : { type: 'center' }));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [filter, setFilter] = useState('all');
  const [refreshMs, setRefreshMs] = useState(REFRESH_MS);

  useEffect(() => {
    if (stop) setSource({ type: 'stop', place: stop });
  }, [stop]);

  useEffect(() => {
    if (!stop) setSource({ type: 'center' });
  }, [city.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = useMemo(() => {
    if (source.type === 'stop' && source.place.stopId) return { stopId: source.place.stopId };
    if (source.type === 'stop' || source.type === 'near') return { center: source.place, radius: RADIUS };
    return { center: { lat: city.lat, lon: city.lon }, radius: RADIUS * 2 };
  }, [source, city.lat, city.lon]);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchDepartures({ ...query, n: 40, signal, lang });
      setRefreshMs(refreshIntervalFor(list));
      setItems(dedupeDepartures(list.filter(d => minutesUntil(d.time) >= -1)).sort((a, b) => new Date(a.time) - new Date(b.time)));
      setUpdatedAt(new Date());
    } catch (err) {
      if (err.name !== 'AbortError') setError(t.errors.network);
    } finally {
      setLoading(false);
    }
  }, [query, t, lang]);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  // Intervallo separato: 30 s con i nostri dati, 90 s con HERE (ogni richiesta HERE ha un costo)
  useEffect(() => {
    const timer = setInterval(() => load(), refreshMs);
    return () => clearInterval(timer);
  }, [load, refreshMs]);

  const attributions = useMemo(() => {
    const seen = new Map();
    items.filter(d => d.source === 'here').forEach(d => (d.attributions || []).forEach(a => seen.set(a.text, a)));
    return [...seen.values()];
  }, [items]);

  const groups = useMemo(() => [...new Set(items.map(d => modeGroup(d.mode)))], [items]);
  const shown = filter === 'all' ? items : items.filter(d => modeGroup(d.mode) === filter);

  const sourceLabel = source.type === 'stop'
    ? fmt(source.place.stopId ? t.departures.stop : t.departures.nearbyArea, { x: source.place.name, m: RADIUS })
    : source.type === 'near'
      ? fmt(t.departures.nearbyArea, { x: t.planner.myLocation, m: RADIUS })
      : fmt(t.departures.nearbyArea, { x: cityLabel, m: RADIUS * 2 });

  return (
    <div className="space-y-5">
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-lg font-bold text-white font-heading">{t.departures.title}</h3>
        <PlaceInput
          label={t.departures.searchStop}
          value={source.type === 'stop' ? source.place : null}
          onChange={p => {
            if (!p) return;
            setSource({ type: 'stop', place: p });
            onStopChange?.(p);
            trackAdAction();
          }}
          t={t}
          lang={lang}
          near={{ lat: city.lat, lon: city.lon }}
        />
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={async () => {
              const p = await getLocation();
              if (p) { setSource({ type: 'near', place: p }); onStopChange?.(null); }
            }}
            className={`chip ${source.type === 'near' ? 'chip-active' : ''}`}
          >
            {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
            {t.departures.nearMe}
          </button>
          <button onClick={() => { setSource({ type: 'center' }); onStopChange?.(null); }} className={`chip ${source.type === 'center' ? 'chip-active' : ''}`}>
            <Building2 className="w-3.5 h-3.5" />{t.departures.center}
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white truncate">{sourceLabel}</p>
            <button onClick={() => load()} aria-label={t.common.retry} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            {updatedAt && fmt(t.departures.updated, { t: updatedAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) })} · {fmt(t.departures.autoRefresh, { s: Math.round(refreshMs / 1000) })}
          </p>
          {groups.length > 1 && (
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button onClick={() => setFilter('all')} className={`chip ${filter === 'all' ? 'chip-active' : ''}`}>{t.departures.all}</button>
              {groups.map(g => (
                <button key={g} onClick={() => setFilter(g)} className={`chip ${filter === g ? 'chip-active' : ''}`}>{MODE_ICON[g]} {t.modes[g]}</button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="p-4 flex items-center gap-2 text-sm text-rose-300"><AlertCircle className="w-4 h-4" />{error}</p>}
        {!error && !loading && shown.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">{t.departures.none}</p>
        )}

        <ul className="divide-y divide-slate-800/80">
          {shown.map(d => {
            const g = modeGroup(d.mode);
            const mins = minutesUntil(d.time);
            const delay = d.realTime ? delayMinutes(d.time, d.scheduledTime) : 0;
            return (
              <li key={d.key + d.time} className={`p-3 sm:p-4 flex items-center gap-3 ${d.cancelled ? 'opacity-50' : ''}`}>
                <span
                  className="min-w-12 max-w-24 h-10 px-1.5 rounded-lg flex items-center justify-center font-extrabold text-xs text-center leading-tight overflow-hidden"
                  style={{ backgroundColor: d.color || MODE_COLOR[g], color: d.textColor || '#fff' }}
                >
                  {d.line || MODE_ICON[g]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-bold text-white truncate ${d.cancelled ? 'line-through' : ''}`}>{MODE_ICON[g]} {capitalize(d.headsign)}</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {d.stopName}{d.track ? ` · ${fmt(t.common.track, { n: d.track })}` : ''}{d.agencyName ? ` · ${d.agencyName}` : ''}
                    {d.wheelchair === 'ACCESSIBLE' && <Accessibility className="inline w-3 h-3 ml-1 text-indigo-400" />}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-extrabold text-indigo-300 font-mono">
                    {mins <= 0 ? t.common.now : fmt(t.departures.inMin, { n: mins })}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {formatTime(d.time, d.tz, locale)}
                    {d.cancelled ? (
                      <span className="ml-1 text-rose-400 font-bold">{t.common.cancelled}</span>
                    ) : d.realTime ? (
                      <span className={`ml-1 inline-flex items-center gap-0.5 ${delay > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        <Radio className="w-3 h-3" />{delay > 0 ? fmt(t.common.delay, { n: delay }) : t.common.onTime}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {items.some(d => d.source === 'here') && (
          <p className="px-4 py-2.5 border-t border-slate-800 text-[11px] text-slate-500">
            {t.common.dataBy} © HERE
            {attributions.map(a => (
              <span key={a.text}> · {a.href ? <a href={a.href} target="_blank" rel="noreferrer" className="underline">{a.text}</a> : a.text}</span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
