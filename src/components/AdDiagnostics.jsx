import React, { useState } from 'react';
import { useMonetization } from '../services/monetization';

// Pannello diagnostico pubblicità: compare solo con gli annunci di test attivi (7 tocchi sul logo)
export default function AdDiagnostics() {
  const { testAds, diag, native, adsReady, isPro } = useMonetization();
  const [open, setOpen] = useState(true);
  if (!testAds || !native) return null;
  return (
    <div className="fixed left-2 right-2 bottom-24 z-50 rounded-xl bg-black/85 border border-amber-500/60 text-[10px] text-amber-100 font-mono shadow-2xl">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-2 py-1 font-bold text-amber-300">
        ADS DEBUG · ready={String(adsReady)} pro={String(isPro)} {open ? '▼' : '▲'}
      </button>
      {open && (
        <div className="max-h-48 overflow-y-auto px-2 pb-2 space-y-0.5">
          {(diag || []).map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}
