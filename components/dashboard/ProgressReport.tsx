
import React from 'react';
import { User, Analysis } from '../../types';
import { COLORS, KI_PILLAR_NAMES, ZUKUNFT_PILLAR_NAMES } from '../../constants';
import { PillarAnalysis, formatEur } from './shared';

interface ProgressReportProps {
  user: User;
  analysis: Analysis;
  strengths: PillarAnalysis[];
  potentials: PillarAnalysis[];
  onClose: () => void;
}

const ProgressReport: React.FC<ProgressReportProps> = ({ user, analysis, strengths, potentials, onClose }) => {
  const reportDate = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const assessmentDate = new Date(analysis.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const kiPillars = analysis.kiPillarScores || { kompetenz: 0, tools: 0, steuerung: 0, zukunft: 0 };
  const zukunftPillars = analysis.zukunftPillarScores || { zukunftsbild: 0, zukunftsstrategie: 0, zukunftskompetenzen: 0, umsetzung: 0 };

  return (
    <div
      className="fixed inset-0 z-50 bg-white overflow-y-auto"
      style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
    >
      {/* ─── Control Bar (no-print) ─── */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-500">Fortschrittsbericht Vorschau</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg text-white transition-all"
            style={{ backgroundColor: COLORS.PRIMARY }}
          >
            Drucken / Als PDF speichern
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all text-lg font-bold"
          >
            &times;
          </button>
        </div>
      </div>

      {/* ─── Report Content (A4 optimized) ─── */}
      <div className="max-w-[210mm] mx-auto px-8 py-10" style={{ color: '#111827' }}>

        {/* ═══ HEADER ═══ */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2" style={{ borderColor: COLORS.PRIMARY }}>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] mb-1" style={{ color: COLORS.PRIMARY }}>
              2b AHEAD
            </div>
            <h1 className="text-2xl font-black text-gray-900">KI-Fortschrittsbericht</h1>
          </div>
          <div className="text-right text-xs text-gray-500 font-bold">
            <div>{reportDate}</div>
          </div>
        </div>

        {/* ═══ PERSOENLICHE DATEN ═══ */}
        <div className="mb-8">
          <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Teilnehmer</div>
          <div className="text-lg font-black text-gray-900">{user.firstName} {user.lastName}</div>
          <div className="text-sm text-gray-500 font-bold">Assessment vom {assessmentDate}</div>
        </div>

        {/* ═══ SCORE-UEBERSICHT ═══ */}
        <div className="mb-8">
          <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Score-Uebersicht</div>
          <div className="grid grid-cols-2 gap-4">
            {/* KI Score */}
            <div className="p-5 rounded-xl border-2" style={{ borderColor: COLORS.PRIMARY }}>
              <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: COLORS.PRIMARY }}>
                KI Readiness
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black" style={{ color: COLORS.PRIMARY }}>{analysis.kiScore}</span>
                <span className="text-sm font-bold text-gray-400">/100</span>
              </div>
              <div className="text-sm font-bold text-gray-600 mt-1">
                Stufe {analysis.kiMaturityLevel}: {analysis.kiMaturityName}
              </div>
              {analysis.previousKiScore != null && (
                <div className="text-xs font-black mt-2" style={{ color: COLORS.SUCCESS }}>
                  {analysis.kiScore - analysis.previousKiScore >= 0 ? '+' : ''}{analysis.kiScore - analysis.previousKiScore} seit letztem Assessment
                </div>
              )}
            </div>
            {/* Zukunft Score */}
            <div className="p-5 rounded-xl border-2" style={{ borderColor: COLORS.ZUKUNFT }}>
              <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: COLORS.ZUKUNFT }}>
                Zukunft Readiness
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black" style={{ color: COLORS.ZUKUNFT }}>{analysis.zukunftScore}</span>
                <span className="text-sm font-bold text-gray-400">/100</span>
              </div>
              <div className="text-sm font-bold text-gray-600 mt-1">
                Stufe {analysis.zukunftMaturityLevel}: {analysis.zukunftMaturityName}
              </div>
              {analysis.previousZukunftScore != null && (
                <div className="text-xs font-black mt-2" style={{ color: COLORS.SUCCESS }}>
                  {analysis.zukunftScore - analysis.previousZukunftScore >= 0 ? '+' : ''}{analysis.zukunftScore - analysis.previousZukunftScore} seit letztem Assessment
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ ROI ZUSAMMENFASSUNG ═══ */}
        {analysis.cecData && analysis.cecData.gesamtErgebnis > 0 && (
          <div className="mb-8 p-5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="text-xs font-black uppercase tracking-widest text-amber-800 mb-2">Wirtschaftlicher KI-Effekt</div>
            <div className="text-2xl font-black text-amber-900">{formatEur(analysis.cecData.gesamtErgebnis)} / Jahr</div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center">
                <div className="text-[10px] font-black text-gray-500 uppercase">Zeiteinsparung</div>
                <div className="text-sm font-black text-amber-800">{formatEur(analysis.cecData.zeiteinsparungEurJahr)}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black text-gray-500 uppercase">Kosteneinsparung</div>
                <div className="text-sm font-black text-amber-800">{formatEur(analysis.cecData.kosteneinsparungEurJahr)}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-black text-gray-500 uppercase">Umsatzsteigerung</div>
                <div className="text-sm font-black text-amber-800">{formatEur(analysis.cecData.umsatzsteigerungEurJahr)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ SAEULEN-SCORES ═══ */}
        <div className="mb-8">
          <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Detailbewertung nach Saeulen</div>

          {/* KI Saeulen */}
          <div className="mb-5">
            <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.PRIMARY }}>
              KI Readiness — 4 Saeulen
            </div>
            <div className="space-y-2">
              {Object.entries(KI_PILLAR_NAMES).map(([key, name]) => {
                const score = (kiPillars as any)[key] || 0;
                const pct = (score / 25) * 100;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-36 text-xs font-bold text-gray-600 shrink-0">{name}</div>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: COLORS.PRIMARY }}
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-black" style={{ color: COLORS.PRIMARY }}>
                      {score}/25
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zukunft Saeulen */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.ZUKUNFT }}>
              Zukunft Readiness — 4 Dimensionen
            </div>
            <div className="space-y-2">
              {Object.entries(ZUKUNFT_PILLAR_NAMES).map(([key, name]) => {
                const score = (zukunftPillars as any)[key] || 0;
                const pct = (score / 25) * 100;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-36 text-xs font-bold text-gray-600 shrink-0">{name}</div>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: COLORS.ZUKUNFT }}
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-black" style={{ color: COLORS.ZUKUNFT }}>
                      {score}/25
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ TOP-3 STAERKEN ═══ */}
        <div className="mb-6">
          <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Top-3 Staerken</div>
          <div className="space-y-2">
            {strengths.slice(0, 3).map((s, i) => (
              <div key={s.key} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-black text-emerald-700 w-6">{i + 1}.</span>
                <span className="text-sm font-bold text-gray-700 flex-1">{s.name}</span>
                <span className="text-xs font-black" style={{ color: s.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT }}>
                  {s.score}/{s.maxScore} ({Math.round(s.percent)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ TOP-3 POTENZIALE ═══ */}
        <div className="mb-10">
          <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Top-3 Potenziale</div>
          <div className="space-y-2">
            {potentials.slice(0, 3).map((p, i) => (
              <div key={p.key} className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                <span className="text-xs font-black text-orange-700 w-6">{i + 1}.</span>
                <span className="text-sm font-bold text-gray-700 flex-1">{p.name}</span>
                <span className="text-xs font-black" style={{ color: p.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT }}>
                  {p.score}/{p.maxScore} ({Math.round(p.percent)}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <div className="pt-6 border-t border-gray-200 text-center">
          <div className="text-[10px] font-bold text-gray-400">
            Erstellt mit 2bAHEAD KI-Onboarding &middot; {reportDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressReport;
