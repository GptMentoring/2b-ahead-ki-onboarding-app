
import React, { useState } from 'react';
import { Analysis } from '../../types';
import { Card } from '../UIComponents';
import { IconShieldAlert } from '../Icons';
import { formatEur, formatNumber } from './shared';
import { COLORS } from '../../constants';

interface ZukunftRisikoCardProps {
  analysis: Analysis;
}

const ZukunftRisikoCard: React.FC<ZukunftRisikoCardProps> = ({ analysis }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const risiko = analysis.zukunftRisikoData;
  if (!risiko || risiko.risiko3Jahre <= 0 || risiko.jahresumsatzCec <= 0) return null;

  const zukunftColor = COLORS.ZUKUNFT;
  const risikoAnteil = Math.round((1 - risiko.zukunftScore / 100) * 100);

  return (
    <div className="mb-8">
      <Card className="p-6 md:p-8 border-2 bg-gradient-to-r from-slate-50 to-blue-50" style={{ borderColor: `${zukunftColor}20` }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${zukunftColor}10`, border: `1px solid ${zukunftColor}25` }}>
            <IconShieldAlert size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: zukunftColor }}>
              Zukunfts-Risiko
            </span>
            <p className="text-sm font-bold text-gray-600 mt-1 leading-relaxed">
              Ohne aktive Zukunftsstrategie riskierst du bis zu
            </p>
            <div className="text-2xl md:text-3xl font-black tracking-tight mt-1" style={{ color: zukunftColor }}>
              {formatEur(risiko.risiko3Jahre)}
              <span className="text-base font-bold text-gray-500 ml-1">Umsatzverlust in 3 Jahren</span>
            </div>
          </div>
        </div>

        {/* ─── Breakdown Toggle ─── */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="mt-4 flex items-center gap-2 text-xs font-black hover:opacity-80 transition-colors uppercase tracking-widest"
          style={{ color: zukunftColor }}
        >
          <svg className={`w-3 h-3 transition-transform duration-200 ${showBreakdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          So berechnen wir das
        </button>

        {showBreakdown && (
          <div className="mt-3 pt-3 border-t animate-in fade-in slide-in-from-top-2 duration-200" style={{ borderColor: `${zukunftColor}15` }}>
            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
                <span className="font-bold text-gray-600">
                  Jahresumsatz (Mittelwert)
                </span>
                <span className="font-black text-gray-900">{formatEur(risiko.jahresumsatzCec)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
                <span className="font-bold text-gray-600">
                  Zukunfts-L&#252;cke: 100% &#8722; {formatNumber(risiko.zukunftScore)}/100 Score
                </span>
                <span className="font-black text-gray-900">{risikoAnteil}% nicht abgesichert</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
                <span className="font-bold text-gray-600">
                  Branchen-Risikofaktor
                </span>
                <span className="font-black text-gray-900">{formatNumber(risiko.branchenFaktor * 100)}%</span>
              </div>

              <div className="border-t my-1" style={{ borderColor: `${zukunftColor}15` }} />

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
                <span className="font-bold text-gray-600">
                  {formatEur(risiko.jahresumsatzCec)} &#215; {risikoAnteil}% &#215; {formatNumber(risiko.branchenFaktor * 100)}%
                </span>
                <span className="font-black" style={{ color: zukunftColor }}>{formatEur(risiko.risikoJahr)}/Jahr</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5">
                <span className="font-bold text-gray-600">
                  Kumuliert &#252;ber 3 Jahre
                </span>
                <span className="font-black text-lg" style={{ color: zukunftColor }}>{formatEur(risiko.risiko3Jahre)}</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ZukunftRisikoCard;
