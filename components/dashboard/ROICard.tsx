
import React, { useState } from 'react';
import { Analysis } from '../../types';
import { Card } from '../UIComponents';
import { IconCurrency, IconClock } from '../Icons';
import { formatEur, formatNumber, formatPercent } from './shared';

interface ROICardProps {
  analysis: Analysis;
}

const ROICard: React.FC<ROICardProps> = ({ analysis }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!analysis.cecData || analysis.cecData.gesamtErgebnis <= 0) return null;

  const cec = analysis.cecData;
  const hasRawInputs = cec.stundenProWoche !== undefined;

  // Zeitgewinn-Berechnungen
  const arbeitsTageJahr = hasRawInputs ? Math.round(cec.stundenProWoche * 52 / 8) : 0;
  const arbeitswochenJahr = Math.round(arbeitsTageJahr / 5);

  // Payback
  const paybackDays = cec.kiAusgabenJahr > 0 && cec.gesamtErgebnis > 0
    ? Math.round((cec.kiAusgabenJahr / cec.gesamtErgebnis) * 365)
    : null;

  return (
    <div className="mb-8 -mt-2">
      <Card className="p-0 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden">

        {/* ─── Zeitgewinn Hero ─── */}
        {hasRawInputs && cec.stundenProWoche > 0 && (
          <div className="px-6 md:px-8 pt-6 pb-4 border-b border-amber-200/50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                <IconClock size={22} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">
                  Zeitgewinn durch KI
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-black text-amber-900">
                    {formatNumber(cec.stundenProWoche)} Stunden
                  </span>
                  <span className="text-sm font-bold text-amber-700">/Woche</span>
                </div>
              </div>
            </div>
            <div className="mt-2 ml-14 flex flex-wrap gap-x-4 gap-y-1">
              <span className="text-xs font-bold text-amber-700">
                = {formatNumber(arbeitsTageJahr)} Arbeitstage/Jahr
              </span>
              <span className="text-xs font-bold text-amber-700">
                = {formatNumber(arbeitswochenJahr)} Wochen f&#252;r Strategie
              </span>
            </div>
          </div>
        )}

        {/* ─── Gesamteffekt + Details ─── */}
        <div className="px-6 md:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center">
                <IconCurrency size={28} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                  Dein wirtschaftlicher KI-Effekt
                </span>
                <div className="text-3xl md:text-4xl font-black text-amber-900 tracking-tight">
                  {formatEur(cec.gesamtErgebnis)}
                  <span className="text-lg text-amber-700">/Jahr</span>
                </div>
              </div>
            </div>

            {/* Summary Boxes */}
            <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-4">
              {cec.zeiteinsparungEurJahr > 0 && (
                <div className="text-center px-4 py-2 bg-white/80 rounded-xl border border-amber-200">
                  <div className="text-[9px] font-black text-gray-500 uppercase">Zeiteinsparung</div>
                  <div className="text-sm font-black text-amber-800">{formatEur(cec.zeiteinsparungEurJahr)}</div>
                </div>
              )}
              {cec.kosteneinsparungEurJahr > 0 && (
                <div className="text-center px-4 py-2 bg-white/80 rounded-xl border border-amber-200">
                  <div className="text-[9px] font-black text-gray-500 uppercase">Kosteneinsparung</div>
                  <div className="text-sm font-black text-amber-800">{formatEur(cec.kosteneinsparungEurJahr)}</div>
                </div>
              )}
              {cec.umsatzsteigerungEurJahr > 0 && (
                <div className="text-center px-4 py-2 bg-white/80 rounded-xl border border-amber-200">
                  <div className="text-[9px] font-black text-gray-500 uppercase">Umsatzsteigerung</div>
                  <div className="text-sm font-black text-amber-800">{formatEur(cec.umsatzsteigerungEurJahr)}</div>
                </div>
              )}
              {cec.kiAusgabenJahr > 0 && (
                <div className="text-center px-5 py-2 bg-white rounded-xl border-2 border-amber-300">
                  <div className="text-[9px] font-black text-gray-500 uppercase">ROI</div>
                  <div className={`text-2xl font-black ${cec.roi >= 1 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {cec.roi.toFixed(1)}x
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Breakdown Toggle ─── */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="mt-4 flex items-center gap-2 text-xs font-black text-amber-700 hover:text-amber-900 transition-colors uppercase tracking-widest"
          >
            <svg className={`w-3 h-3 transition-transform duration-200 ${showBreakdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            So berechnen wir das
          </button>

          {/* ─── Breakdown Content ─── */}
          {showBreakdown && (
            <div className="mt-3 pt-3 border-t border-amber-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
              {hasRawInputs ? (
                <div className="space-y-2.5">
                  {cec.zeiteinsparungEurJahr > 0 && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 text-xs">
                      <span className="text-amber-800 font-bold">
                        Zeiteinsparung: {formatNumber(cec.stundenProWoche)}h/Woche &#215; {formatNumber(cec.stundensatz)} &#8364;/h &#215; 52
                      </span>
                      <span className="font-black text-amber-900">{formatEur(cec.zeiteinsparungEurJahr)}/Jahr</span>
                    </div>
                  )}

                  {cec.kosteneinsparungEurJahr > 0 && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 text-xs">
                      <span className="text-amber-800 font-bold">Kosteneinsparung (deine Angabe)</span>
                      <span className="font-black text-amber-900">{formatEur(cec.kosteneinsparungDirekt)}/Jahr</span>
                    </div>
                  )}

                  {cec.umsatzsteigerungEurJahr > 0 && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 text-xs">
                      <span className="text-amber-800 font-bold">
                        Umsatzsteigerung: {formatPercent(cec.umsatzProzent)} &#215; {formatEur(cec.jahresumsatzCec)}
                      </span>
                      <span className="font-black text-amber-900">{formatEur(cec.umsatzsteigerungEurJahr)}/Jahr</span>
                    </div>
                  )}

                  <div className="border-t border-amber-200/50 my-1" />

                  {cec.kiMonatlich > 0 ? (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 text-xs">
                      <span className="text-amber-800 font-bold">
                        KI-Budget: {formatEur(cec.kiMonatlich)}/Monat &#215; 12
                      </span>
                      <span className="font-black text-amber-900">{formatEur(cec.kiAusgabenJahr)}/Jahr</span>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-700 font-bold italic">
                      Du hast kein KI-Budget angegeben &#8212; ROI kann nicht berechnet werden.
                    </div>
                  )}

                  {cec.kiAusgabenJahr > 0 && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 text-xs">
                      <span className="text-amber-800 font-bold">
                        ROI: {formatEur(cec.gesamtErgebnis)} / {formatEur(cec.kiAusgabenJahr)}
                      </span>
                      <span className={`font-black text-lg ${cec.roi >= 1 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        = {cec.roi.toFixed(1)}x
                      </span>
                    </div>
                  )}

                  {paybackDays !== null && (
                    <div className="mt-1 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-xs font-black text-emerald-800">
                        Amortisation nach {paybackDays < 31
                          ? `${paybackDays} Tagen`
                          : `${Math.round(paybackDays / 30)} Monaten`
                        }
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-amber-800 font-bold leading-relaxed">
                  Basierend auf deinem KI-Nutzungsgrad, deiner Branche und deinem Stundensatz.
                  Berechnet nach dem Corporate Economic Calculator (CEC) Modell.
                  <span className="block mt-1 italic text-amber-600">
                    Wiederhole dein Assessment f&#252;r die vollst&#228;ndige Berechnung.
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ROICard;
