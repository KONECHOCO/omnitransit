import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed, Loader2, X } from 'lucide-react';
import { stopsInBounds, departures, decodePolyline, modeGroup, MODE_COLOR, MODE_ICON, formatTime, minutesUntil } from '../services/transit';

const STOPS_MIN_ZOOM = 15;

function FitTo({ center, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [30, 30] });
    else if (center) map.setView(center, 14);
  }, [map, center, bounds]);
  return null;
}

/** Carica le fermate visibili quando la mappa è abbastanza ingrandita. */
function StopsLayer({ t, locale, onOpenDepartures, onZoomInfo }) {
  const [stops, setStops] = useState([]);
  const ctrlRef = useRef(null);
  const timerRef = useRef(null);
  const map = useMapEvents({
    moveend: () => refresh(),
    zoomend: () => refresh()
  });

  const refresh = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const zoomOk = map.getZoom() >= STOPS_MIN_ZOOM;
      onZoomInfo(!zoomOk);
      if (!zoomOk) {
        setStops([]);
        return;
      }
      ctrlRef.current?.abort();
      ctrlRef.current = new AbortController();
      try {
        setStops((await stopsInBounds(map.getBounds(), ctrlRef.current.signal)) || []);
      } catch {
        // errore di rete: la mappa resta utilizzabile
      }
    }, 350);
  };

  useEffect(() => {
    refresh();
    return () => {
      clearTimeout(timerRef.current);
      ctrlRef.current?.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return stops.slice(0, 300).map(s => {
    const g = modeGroup(s.modes?.[0]);
    return (
      <CircleMarker
        key={s.stopId}
        center={[s.lat, s.lon]}
        radius={6}
        pathOptions={{ color: '#fff', weight: 2, fillColor: MODE_COLOR[g], fillOpacity: 1 }}
      >
        <Popup>
          <StopPopup stop={s} t={t} locale={locale} onOpenDepartures={onOpenDepartures} />
        </Popup>
      </CircleMarker>
    );
  });
}

function StopPopup({ stop, t, locale, onOpenDepartures }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    const ctrl = new AbortController();
    departures({ stopId: stop.stopId, n: 5, signal: ctrl.signal })
      .then(setItems)
      .catch(() => setItems([]));
    return () => ctrl.abort();
  }, [stop.stopId]);

  return (
    <div className="min-w-[200px] space-y-2 text-xs">
      <div className="font-bold text-sm text-white">{stop.name}</div>
      <div className="text-slate-400">{t.map.nextDepartures}</div>
      {items === null ? (
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 5).map(d => (
            <li key={d.key + d.time} className="flex items-center gap-2">
              <span className="px-1 rounded font-bold" style={{ backgroundColor: d.color || MODE_COLOR[modeGroup(d.mode)], color: d.textColor || '#fff' }}>
                {d.line || MODE_ICON[modeGroup(d.mode)]}
              </span>
              <span className="flex-1 truncate text-slate-200">{d.headsign}</span>
              <span className="font-mono text-indigo-300">{minutesUntil(d.time) <= 0 ? t.common.now : formatTime(d.time, d.tz, locale)}</span>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => onOpenDepartures({ name: stop.name, stopId: stop.stopId, lat: stop.lat, lon: stop.lon })} className="text-indigo-400 font-semibold">
        {t.map.allDepartures} →
      </button>
    </div>
  );
}

export default function MapView({ city, t, locale, itinerary, onClearItinerary, getLocation, locating, onOpenDepartures }) {
  const [userPos, setUserPos] = useState(null);
  const [needZoom, setNeedZoom] = useState(true);

  const lines = useMemo(() => (itinerary?.legs || []).map(leg => ({
    points: leg.legGeometry?.points ? decodePolyline(leg.legGeometry.points, leg.legGeometry.precision || 6) : [[leg.from.lat, leg.from.lon], [leg.to.lat, leg.to.lon]],
    color: leg.mode === 'WALK' ? '#94a3b8' : leg.routeColor ? `#${leg.routeColor}` : MODE_COLOR[modeGroup(leg.mode)],
    walk: leg.mode === 'WALK'
  })), [itinerary]);

  const bounds = useMemo(() => {
    const all = lines.flatMap(l => l.points);
    return all.length ? L.latLngBounds(all) : null;
  }, [lines]);

  const [focus, setFocus] = useState(null);
  const center = useMemo(() => focus || [city.lat, city.lon], [focus, city.lat, city.lon]);

  return (
    <div className="space-y-3">
      <div className="relative h-[65vh] min-h-[380px] rounded-2xl overflow-hidden border border-slate-800">
        <MapContainer center={[city.lat, city.lon]} zoom={14} className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles-dark"
          />
          <FitTo center={bounds ? null : center} bounds={bounds} />
          <StopsLayer t={t} locale={locale} onOpenDepartures={onOpenDepartures} onZoomInfo={setNeedZoom} />
          {lines.map((l, i) => (
            <Polyline key={i} positions={l.points} pathOptions={{ color: l.color, weight: l.walk ? 4 : 6, dashArray: l.walk ? '4 8' : null, opacity: 0.95 }} />
          ))}
          {userPos && <CircleMarker center={[userPos.lat, userPos.lon]} radius={8} pathOptions={{ color: '#fff', weight: 3, fillColor: '#3b82f6', fillOpacity: 1 }} />}
        </MapContainer>

        <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
          <button
            onClick={async () => {
              const p = await getLocation();
              if (p) { setUserPos(p); setFocus([p.lat, p.lon]); onClearItinerary(); }
            }}
            aria-label={t.map.locate}
            className="p-2.5 rounded-xl bg-slate-900/95 border border-slate-700 text-slate-200 hover:text-indigo-400 shadow-lg"
          >
            {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
          </button>
        </div>

        {needZoom && !itinerary && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[500] px-3 py-1.5 rounded-full bg-slate-900/95 border border-slate-700 text-xs text-slate-300 whitespace-nowrap">
            {t.map.zoomIn}
          </div>
        )}
      </div>

      {itinerary && (
        <div className="flex items-center justify-between gap-3 glass-panel rounded-xl px-4 py-2.5 border border-slate-800 text-xs">
          <span className="text-slate-300 truncate">
            {t.map.route}: {formatTime(itinerary.startTime, itinerary.legs[0].from.tz, locale)} → {formatTime(itinerary.endTime, itinerary.legs.at(-1).to.tz, locale)}
            {' · '}{Math.round(itinerary.duration / 60)} {t.common.min}
          </span>
          <button onClick={onClearItinerary} className="inline-flex items-center gap-1 text-slate-400 hover:text-white shrink-0">
            <X className="w-4 h-4" />{t.map.clearRoute}
          </button>
        </div>
      )}
    </div>
  );
}
