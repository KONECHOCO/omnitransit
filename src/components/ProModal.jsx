import React, { useState } from 'react';
import { X, Crown, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { useMonetization, buyPro, restorePro } from '../services/monetization';
import { fmt } from '../data/translations';

export default function ProModal({ isOpen, onClose, t }) {
  const { native, isPro, proPrice } = useMonetization();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const run = async (fn, okMsg, failMsg) => {
    setBusy(true);
    setMessage(null);
    try {
      const ok = await fn();
      setMessage(ok ? okMsg : failMsg);
    } catch (err) {
      console.warn('Pro purchase error', err);
      setMessage(t.pro.error);
    } finally {
      setBusy(false);
    }
  };

  const benefits = [t.pro.noAds, t.pro.unlimitedFav, t.pro.support];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex justify-center overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md my-auto bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-5 flex items-start justify-between bg-gradient-to-br from-amber-500/20 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{t.pro.title}</h2>
              <p className="text-xs text-amber-200/80">{t.pro.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label={t.common.close} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <ul className="space-y-2">
            {benefits.map(b => (
              <li key={b} className="flex items-center gap-2 text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {b}
              </li>
            ))}
          </ul>

          {isPro ? (
            <p className="p-3 rounded-xl bg-emerald-500/15 text-emerald-300 text-sm font-bold text-center">{t.pro.owned}</p>
          ) : !native ? (
            <p className="p-3 rounded-xl bg-slate-800 text-slate-300 text-xs text-center">{t.pro.webOnly}</p>
          ) : (
            <>
              <button
                disabled={busy}
                onClick={() => run(buyPro, t.pro.owned, t.pro.error)}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                {/* Il prezzo reale (localizzato) arriva dallo store; questo è solo il ripiego */}
                {fmt(t.pro.buy, { price: proPrice || t.pro.fallbackPrice })}
              </button>
              <button
                disabled={busy}
                onClick={() => run(restorePro, t.pro.restored, t.pro.notFound)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.pro.restore}
              </button>
            </>
          )}

          {message && <p className="text-xs text-center text-slate-300">{message}</p>}
        </div>
      </div>
    </div>
  );
}
