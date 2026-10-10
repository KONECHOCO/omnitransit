import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpDown, Navigation, Zap, Clock, Repeat, Footprints, Accessibility, ChevronDown, ChevronUp,
  Map as MapIcon, Star, Home, Briefcase, ExternalLink, AlertCircle, Loader2, Radio
} from 'lucide-react';
import PlaceInput from './PlaceInput';
import { planTrip } from '../services/provider';
import { lineName, modeGroup, MODE_ICON, MODE_COLOR, formatTime, formatDuration, delayMinutes, walkSeconds } from '../services/transit';
import { usePrefs, updatePrefs, addRecent, isFavorite, toggleFavorite, slimPlace, FREE_FAVORITES_LIMIT } from '../services/storage';
import { isFeatureUnlocked, unlockWithRewardedVideo, useMonetization, trackAdAction } from '../services/monetization';
import { fmt } from '../data/translations';
import { Capacitor } from '@capacitor/core';

/** Percorso nei mezzi pubblici nell'app mappe del telefono: alternativa gratuita quando i dati non arrivano. */
function mapsUrl(from, to) {
  if (Capacitor.getPlatform() === 'ios') return `https://maps.apple.com/?saddr=${from.lat},${from.lon}&daddr=${to.lat},${to.lon}&dirflg=r`;
  return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lon}&destination=${to.lat},${to.lon}&travelmode=transit`;
}

const SORTS = {
  fastest: (a, b) => a.duration - b.duration || new Date(a.startTime) - new Date(b.startTime),
  transfers: (a, b) => a.transfers - b.transfers || a.duration - b.duration,
  walking: (a, b) => walkSeconds(a) - walkSeconds(b) || a.duration - b.duration
};

function toLocalInput(date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

export default function RoutePlanner({ city, t, lang, locale, getLocation, locating, onShowOnMap, onOpenPro }) {
  const prefs = usePrefs();
  const { rewardedReady } = useMonetization();
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [timeMode, setTimeMode] = useState('now');
  const [when, setWhen] = useState(() => toLocalInput(new Date()));
  const [wheelchair, setWheelchair] = useState(false);
  const [sort, setSort] = useState('fastest');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [favNotice, setFavNotice] = useState(false);

  // Cambiando città i campi si azzerano: i risultati di un'altra città non hanno senso
  useEffect(() => {
    setFrom(null);
    setTo(null);
    setResult(null);
  }, [city.id]);

  const near = useMemo(() => ({ lat: city.lat, lon: city.lon }), [city.lat, city.lon]);

  const search = async (overrideTime) => {
    if (!from || !to) {
      setError(t.planner.enterBoth);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const time = overrideTime || (timeMode === 'now' ? new Date() : new Date(when));
      const res = await planTrip(from, to, { time, arriveBy: timeMode === 'arrive' && !overrideTime, wheelchair, lang });
      setResult(res);
      setExpanded(null);
      addRecent(from);
      addRecent(to);
      trackAdAction();
    } catch {
      setError(t.errors.network);
    } finally {
      setLoading(false);
    }
  };

  const later = () => {
    const last = result?.itineraries.reduce((m, it) => (new Date(it.startTime) > m ? new Date(it.startTime) : m), new Date(0));
    if (last) search(new Date(last.getTime() + 60000));
  };

  const saveFavorite = async place => {
    if (isFavorite(place)) {
      toggleFavorite(place);
      return;
    }
    if (prefs.favorites.length >= FREE_FAVORITES_LIMIT && !isFeatureUnlocked('favorites')) {
      setFavNotice(true);
      return;
    }
    toggleFavorite(place);
  };

  const itineraries = useMemo(() => [...(result?.itineraries || [])].sort(SORTS[sort]), [result, sort]);

  return (
    <div className="space-y-5">
      <form
        onSubmit={e => { e.preventDefault(); search(); }}
        className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:items-end">
          <PlaceInput label={t.planner.from} value={from} onChange={setFrom} t={t} lang={lang} near={near} onUseLocation={getLocation} locating={locating} />
          <button
            type="button"
            onClick={() => { setFrom(to); setTo(from); }}
            title={t.planner.swap}
            aria-label={t.planner.swap}
            className="justify-self-center p-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-indigo-400 hover:border-indigo-500 transition-all md:mb-1"
          >
            <ArrowUpDown className="w-4 h-4 md:rotate-90" />
          </button>
          <PlaceInput label={t.planner.to} value={to} onChange={setTo} t={t} lang={lang} near={near} onUseLocation={getLocation} locating={locating} icon={<Navigation className="w-4 h-4 text-emerald-400" />} />
        </div>

        {/* Scorciatoie e salvataggio */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {prefs.home && (
            <button type="button" onClick={() => setTo(prefs.home)} className="chip"><Home className="w-3.5 h-3.5 text-amber-400" />{t.planner.home}</button>
          )}
          {prefs.work && (
            <button type="button" onClick={() => setTo(prefs.work)} className="chip"><Briefcase className="w-3.5 h-3.5 text-amber-400" />{t.planner.work}</button>
          )}
          {to && (
            <>
              <button type="button" onClick={() => saveFavorite(to)} className="chip">
                <Star className={`w-3.5 h-3.5 ${isFavorite(to) ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                {isFavorite(to) ? t.planner.remove : t.planner.save}
              </button>
              <button type="button" onClick={() => updatePrefs({ home: slimPlace(to) })} className="chip">{t.planner.setHome}</button>
              <button type="button" onClick={() => updatePrefs({ work: slimPlace(to) })} className="chip">{t.planner.setWork}</button>
            </>
          )}
        </div>

        {favNotice && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
            <p>{fmt(t.planner.favLimit, { n: FREE_FAVORITES_LIMIT })}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setFavNotice(false); onOpenPro(); }} className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold">Pro</button>
              {rewardedReady && (
                <button type="button" onClick={async () => { if (await unlockWithRewardedVideo('favorites')) { setFavNotice(false); toggleFavorite(to); } }} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-semibold">{t.planner.watchVideo}</button>
              )}
            </div>
          </div>
        )}

        {/* Orario e opzioni */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {['now', 'depart', 'arrive'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setTimeMode(m)}
              className={`px-3 py-1.5 rounded-lg font-semibold border ${timeMode === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              {m === 'now' ? t.planner.now : m === 'depart' ? t.planner.departAt : t.planner.arriveBy}
            </button>
          ))}
          {timeMode !== 'now' && (
            <input
              type="datetime-local"
              value={when}
              onChange={e => setWhen(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white [color-scheme:dark]"
            />
          )}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer">
            <input type="checkbox" checked={wheelchair} onChange={e => setWheelchair(e.target.checked)} className="accent-indigo-500" />
            <Accessibility className="w-3.5 h-3.5 text-indigo-400" />
            {t.planner.wheelchair}
          </label>
        </div>

        {error && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-rose-300">
            <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</span>
            {from && to && (
              <a href={mapsUrl(from, to)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 font-semibold">
                {t.planner.openInMaps}<ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto sm:float-right px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-4 h-4" />}
          {t.planner.search}
        </button>
        <div className="clear-both" />
      </form>

      {result && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              ['fastest', Clock, t.planner.sortFastest],
              ['transfers', Repeat, t.planner.sortTransfers],
              ['walking', Footprints, t.planner.sortWalking]
            ].map(([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap ${sort === key ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/80' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">{fmt(t.planner.results, { n: itineraries.length })}</span>
          </div>

          {itineraries.length === 0 ? (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 text-sm text-slate-300 text-center space-y-3">
              <p>{t.planner.noResults}</p>
              {from && to && (
                <a href={mapsUrl(from, to)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-100 text-xs font-semibold">
                  {t.planner.openInMaps}<ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {itineraries.map(it => (
                <ItineraryCard
                  key={it.id || it.startTime}
                  it={it}
                  t={t}
                  locale={locale}
                  open={expanded === (it.id || it.startTime)}
                  onToggle={() => setExpanded(expanded === (it.id || it.startTime) ? null : it.id || it.startTime)}
                  onShowOnMap={() => onShowOnMap(it)}
                  destName={to?.name}
                />
              ))}
              <button onClick={later} disabled={loading} className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white">
                {t.planner.later} →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LineBadge({ leg }) {
  const g = modeGroup(leg.mode);
  const bg = leg.routeColor ? `#${leg.routeColor}` : MODE_COLOR[g];
  const fg = leg.routeTextColor ? `#${leg.routeTextColor}` : '#fff';
  const name = lineName(leg);
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap" style={{ backgroundColor: bg, color: fg }}>
      <span>{MODE_ICON[g]}</span>
      {name && <span className="max-w-[90px] truncate">{name}</span>}
    </span>
  );
}

function TimeWithDelay({ actual, scheduled, tz, locale, realTime, t }) {
  const d = realTime ? delayMinutes(actual, scheduled) : 0;
  return (
    <span className="font-mono">
      {formatTime(actual, tz, locale)}
      {realTime && d > 0 && <span className="ml-1 text-amber-400">{fmt(t.common.delay, { n: d })}</span>}
    </span>
  );
}

function ItineraryCard({ it, t, locale, open, onToggle, onShowOnMap, destName }) {
  const first = it.legs[0];
  const last = it.legs[it.legs.length - 1];
  const tz = first.from.tz;
  const walkMin = Math.round(walkSeconds(it) / 60);
  const transit = it.legs.filter(l => l.mode !== 'WALK');
  const hasRealtime = transit.some(l => l.realTime);
  const cancelled = transit.some(l => l.cancelled);

  return (
    <div className={`glass-panel rounded-2xl border transition-colors ${open ? 'border-indigo-500/60' : 'border-slate-800'} ${cancelled ? 'opacity-60' : ''}`}>
      <button onClick={onToggle} className="w-full text-left p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-extrabold text-white font-heading">
              {formatTime(it.startTime, tz, locale)} – {formatTime(it.endTime, last.to.tz, locale)}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-0.5">
              <span className="text-slate-200 font-semibold">{formatDuration(it.duration, t)}</span>
              <span>·</span>
              <span>{it.transfers === 0 ? t.planner.direct : it.transfers === 1 ? t.planner.oneTransfer : fmt(t.planner.transfers, { n: it.transfers })}</span>
              {walkMin > 0 && (<><span>·</span><span>{fmt(t.planner.walk, { n: walkMin })}</span></>)}
              {hasRealtime && (<span className="inline-flex items-center gap-1 text-emerald-400"><Radio className="w-3 h-3" />{t.common.live}</span>)}
              {cancelled && <span className="text-rose-400 font-bold">{t.common.cancelled}</span>}
            </div>
          </div>
          {open ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {it.legs.map((leg, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-slate-600 text-xs">›</span>}
              {leg.mode === 'WALK' ? (
                <span className="text-xs text-slate-400">🚶{Math.round(leg.duration / 60)}′</span>
              ) : (
                <LineBadge leg={leg} />
              )}
            </React.Fragment>
          ))}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-slate-800/80 space-y-3">
          <ol className="relative pl-5 space-y-3 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-0.5 before:bg-slate-800">
            {it.legs.map((leg, i) => (
              <li key={i} className="relative text-xs">
                <span
                  className="absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950"
                  style={{ backgroundColor: leg.routeColor ? `#${leg.routeColor}` : MODE_COLOR[modeGroup(leg.mode)] }}
                />
                {leg.mode === 'WALK' ? (
                  <div className="text-slate-300">
                    🚶 {fmt(t.planner.walkTo, { x: leg.to.name === 'END' || !leg.to.name ? destName || '' : leg.to.name })}
                    <span className="text-slate-500"> · {Math.round(leg.duration / 60)} {t.common.min}{leg.distance ? ` · ${Math.round(leg.distance)} m` : ''}</span>
                  </div>
                ) : (
                  <div className="space-y-1 bg-slate-900/70 border border-slate-800 rounded-xl p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <LineBadge leg={leg} />
                      {leg.headsign && <span className="text-slate-200 font-semibold">{fmt(t.planner.toward, { x: leg.headsign.charAt(0).toUpperCase() + leg.headsign.slice(1) })}</span>}
                    </div>
                    <div className="text-slate-300">
                      <TimeWithDelay actual={leg.startTime} scheduled={leg.scheduledStartTime} tz={leg.from.tz} locale={locale} realTime={leg.realTime} t={t} />
                      {' '}{leg.from.name}{leg.from.track ? ` · ${fmt(t.common.track, { n: leg.from.track })}` : ''}
                    </div>
                    {leg.intermediateStops?.length > 0 && (
                      <div className="text-slate-500">{fmt(t.planner.stops, { n: leg.intermediateStops.length + 1 })}</div>
                    )}
                    <div className="text-slate-300">
                      <TimeWithDelay actual={leg.endTime} scheduled={leg.scheduledEndTime} tz={leg.to.tz} locale={locale} realTime={leg.realTime} t={t} />
                      {' '}<span className="font-semibold text-white">{fmt(t.planner.getOff, { x: leg.to.name })}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span>{leg.agencyName}</span>
                      <span className={leg.realTime ? 'text-emerald-400' : ''}>{leg.realTime ? t.common.live : t.common.scheduled}</span>
                      {leg.cancelled && <span className="text-rose-400 font-bold">{t.common.cancelled}</span>}
                      {(leg.agencyFareUrl || leg.routeUrl || leg.agencyUrl) && (
                        <a href={leg.agencyFareUrl || leg.routeUrl || leg.agencyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
                          {t.planner.operatorSite}<ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div className="flex items-end justify-between gap-3">
            <p className="text-[10px] text-slate-500 min-w-0">
              {t.common.dataBy} {it.source === 'here' ? '© HERE' : 'GTFS / MOTIS'}
              {(it.attributions || []).filter((a, i, all) => all.findIndex(b => b.text === a.text) === i).map(a => (
                <span key={a.text}> · {a.href ? <a href={a.href} target="_blank" rel="noreferrer" className="underline">{a.text}</a> : a.text}</span>
              ))}
            </p>
            <button onClick={onShowOnMap} className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              <MapIcon className="w-4 h-4" />{t.planner.showMap}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
