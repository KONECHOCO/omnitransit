import React from 'react';
import { Crown } from 'lucide-react';
import { useMonetization } from '../services/monetization';

// Nell'app nativa il banner è quello vero di AdMob (disegnato sopra la WebView): qui riserviamo
// solo lo spazio. Nel browser non ci sono annunci: mostriamo l'invito a passare a Pro.
export default function AdBanner({ t, onUpgrade }) {
  const { native, isPro, bannerHeight } = useMonetization();

  if (isPro) return null;
  if (native) return <div style={{ height: bannerHeight }} aria-hidden="true" />;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-5xl mx-auto flex items-center justify-end">
        <button
          onClick={onUpgrade}
          className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1.5"
        >
          <Crown className="w-3.5 h-3.5" />
          <span>{t.pro.removeAds} · Pro</span>
        </button>
      </div>
    </div>
  );
}
