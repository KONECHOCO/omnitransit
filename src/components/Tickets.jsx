import React, { useEffect, useState } from 'react';
import { Ticket, ExternalLink, ShieldCheck, Loader2, Info } from 'lucide-react';
import { modeGroup, MODE_ICON } from '../services/transit';
import { departures } from '../services/provider';
import { fmt } from '../data/translations';

/** Toglie i parametri di tracciamento (utm_*) dai link degli operatori. */
function cleanUrl(url) {
  try {
    const u = new URL(url);
    [...u.searchParams.keys()].filter(k => k.startsWith('utm_')).forEach(k => u.searchParams.delete(k));
    return u.toString();
  } catch {
    return url;
  }
}

export default function Tickets({ city, cityLabel, t, lang }) {
  const [agencies, setAgencies] = useState(null);

  // Operatori realmente attivi intorno al centro, ricavati dagli orari ufficiali
  useEffect(() => {
    const ctrl = new AbortController();
    setAgencies(null);
    departures({ center: { lat: city.lat, lon: city.lon }, radius: 1500, n: 120, signal: ctrl.signal, lang })
      .then(list => {
        const map = new Map();
        list.forEach(d => {
          if (!d.agencyName) return;
          const a = map.get(d.agencyName) || { name: d.agencyName, url: d.agencyFareUrl || d.agencyUrl, modes: new Set() };
          a.modes.add(modeGroup(d.mode));
          if (!a.url) a.url = d.agencyFareUrl || d.agencyUrl;
          map.set(d.agencyName, a);
        });
        setAgencies([...map.values()]);
      })
      .catch(() => setAgencies([]));
    return () => ctrl.abort();
  }, [city.lat, city.lon, lang]);

  return (
    <div className="space-y-5">
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Ticket className="w-6 h-6" /></div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">{t.tickets.title} · {cityLabel}</h3>
            <p className="text-xs text-slate-300">{t.tickets.subtitle}</p>
          </div>
        </div>
      </div>

      {city.localBusMissing && (
        <p className="flex gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
          <Info className="w-4 h-4 shrink-0" />{fmt(t.city.localBusMissing, { operator: city.localBusMissing })}
        </p>
      )}

      <section className="space-y-2">
        <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" />{t.tickets.official}</h4>
        {city.tickets.length === 0 ? (
          <p className="text-xs text-slate-400">{t.tickets.noCurated}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {city.tickets.map(tk => (
              <a key={tk.name} href={tk.url} target="_blank" rel="noreferrer" className="glass-panel rounded-xl p-4 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-bold text-white">{tk.name}</span>
                  {tk.note && <span className="block text-xs text-slate-400">{t.tickets.notes[tk.note]}</span>}
                </span>
                <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-bold text-slate-300">{t.tickets.detected}</h4>
        <p className="text-[11px] text-slate-500">{fmt(t.tickets.detectedHint, { city: cityLabel })}</p>
        {agencies === null ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {agencies.map(a => (
              <a
                key={a.name}
                href={a.url ? cleanUrl(a.url) : undefined}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-3 py-2.5 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate text-slate-200">{[...a.modes].map(m => MODE_ICON[m]).join(' ')} {a.name}</span>
                {a.url && <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
