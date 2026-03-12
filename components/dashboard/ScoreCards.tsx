
import React from 'react';
import { Analysis } from '../../types';
import { COLORS, KI_MATURITY_LEVELS, ZUKUNFT_MATURITY_LEVELS } from '../../constants';
import { Card } from '../UIComponents';
import { LevelProgressBar, NextLevelInfo } from './shared';

// ─── Mini Sparkline ──────────────────────────────────────────
const MiniSparkline: React.FC<{
  points: number[];
  color: string;
  width?: number;
  height?: number;
}> = ({ points, color, width = 120, height = 32 }) => {
  if (points.length < 2) return null;

  const max = Math.max(...points, 100);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const padX = 4;
  const padY = 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const coords = points.map((val, i) => ({
    x: padX + (i / (points.length - 1)) * innerW,
    y: padY + innerH - ((val - min) / range) * innerH,
  }));

  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const last = coords[coords.length - 1];
  const prev = coords[coords.length - 2];
  const trending = points[points.length - 1] >= points[points.length - 2];

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <svg width={width} height={height} className="flex-shrink-0">
        {/* Area fill */}
        <path
          d={`${pathD} L${last.x.toFixed(1)},${height - padY} L${coords[0].x.toFixed(1)},${height - padY} Z`}
          fill={`${color}08`}
        />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 3 : 2}
            fill={i === coords.length - 1 ? color : 'white'} stroke={color} strokeWidth={1.5} />
        ))}
      </svg>
      {/* Trend arrow */}
      <span className="text-[9px] font-black" style={{ color }}>
        {trending ? '↑' : '↓'}
      </span>
      {/* Score labels */}
      <span className="text-[8px] font-bold text-gray-400">
        {points.map(String).join(' → ')}
      </span>
    </div>
  );
};

function getScoreColor(score: number): string {
  if (score < 30) return '#DC2626'; // red
  if (score < 50) return '#EA580C'; // orange
  if (score < 70) return '#CA8A04'; // yellow/amber
  return '#16A34A'; // green
}

function getScoreLabel(score: number): string {
  if (score < 20) return 'Einstieg — viel Potenzial nach oben';
  if (score < 40) return 'Aufbauend — solide Grundlage gelegt';
  if (score < 60) return 'Fortgeschritten — besser als der Durchschnitt';
  if (score < 80) return 'Stark — Top 20% deiner Branche';
  return 'Exzellent — Vorreiter';
}

interface ScoreCardsProps {
  analysis: Analysis;
  kiNextLevel: NextLevelInfo | null;
  zukunftNextLevel: NextLevelInfo | null;
  showKiDetail: boolean;
  showZukunftDetail: boolean;
  onToggleKiDetail: () => void;
  onToggleZukunftDetail: () => void;
}

const ScoreCards: React.FC<ScoreCardsProps> = ({
  analysis, kiNextLevel, zukunftNextLevel,
  showKiDetail, showZukunftDetail, onToggleKiDetail, onToggleZukunftDetail,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    {/* KI Score */}
    <Card className="p-6 md:p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full transition-transform group-hover:scale-110 duration-700 no-print"
        style={{ backgroundColor: `${COLORS.PRIMARY}08` }} />
      <div className="relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.PRIMARY }}>
          KI Readiness
        </span>
        <div className="flex items-end gap-3 mt-1">
          <span className="text-6xl font-black leading-none tracking-tighter" style={{ color: COLORS.PRIMARY }}>
            {analysis.kiScore}
          </span>
          <span className="text-base font-black text-gray-300 mb-1">/100</span>
          {analysis.previousKiScore !== undefined && analysis.kiScore !== analysis.previousKiScore && (
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mb-1.5 ${
              analysis.kiScore > analysis.previousKiScore
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              {analysis.kiScore > analysis.previousKiScore ? '+' : ''}{analysis.kiScore - analysis.previousKiScore} seit letztem Assessment
            </span>
          )}
          {analysis.kiBonusScore > 0 && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 mb-1.5">
              +{analysis.kiBonusScore} Bonus
            </span>
          )}
        </div>
        <div className="inline-block px-3 py-1 rounded-full font-black text-[9px] tracking-widest uppercase text-white mt-2"
          style={{ backgroundColor: COLORS.PRIMARY }}>
          Stufe {analysis.kiMaturityLevel}: {analysis.kiMaturityName}
        </div>
        <p className="text-xs font-bold mt-2" style={{ color: getScoreColor(analysis.kiScore) }}>
          {getScoreLabel(analysis.kiScore)}
        </p>
        {analysis.scoreHistory && analysis.scoreHistory.length >= 2 && (
          <MiniSparkline
            points={analysis.scoreHistory.map(h => h.kiScore)}
            color={COLORS.PRIMARY}
          />
        )}
        <LevelProgressBar level={analysis.kiMaturityLevel} color={COLORS.PRIMARY} levels={KI_MATURITY_LEVELS} />
        {kiNextLevel && (
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-wide mt-2">
            Noch {kiNextLevel.pointsNeeded} Punkte bis Stufe {kiNextLevel.nextLevel.level}
          </p>
        )}
        <button
          onClick={onToggleKiDetail}
          className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors hover:opacity-80"
          style={{ color: COLORS.PRIMARY }}
        >
          {showKiDetail ? 'Weniger Details' : 'Alle Details anzeigen'}
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showKiDetail ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </Card>

    {/* Zukunft Score */}
    <Card className="p-6 md:p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full transition-transform group-hover:scale-110 duration-700 no-print"
        style={{ backgroundColor: `${COLORS.ZUKUNFT}08` }} />
      <div className="relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: COLORS.ZUKUNFT }}>
          Zukunft Readiness
        </span>
        <div className="flex items-end gap-3 mt-1">
          <span className="text-6xl font-black leading-none tracking-tighter" style={{ color: COLORS.ZUKUNFT }}>
            {analysis.zukunftScore}
          </span>
          <span className="text-base font-black text-gray-300 mb-1">/100</span>
          {analysis.previousZukunftScore !== undefined && analysis.zukunftScore !== analysis.previousZukunftScore && (
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mb-1.5 ${
              analysis.zukunftScore > analysis.previousZukunftScore
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              {analysis.zukunftScore > analysis.previousZukunftScore ? '+' : ''}{analysis.zukunftScore - analysis.previousZukunftScore} seit letztem Assessment
            </span>
          )}
        </div>
        <div className="inline-block px-3 py-1 rounded-full font-black text-[9px] tracking-widest uppercase text-white mt-2"
          style={{ backgroundColor: COLORS.ZUKUNFT }}>
          Stufe {analysis.zukunftMaturityLevel}: {analysis.zukunftMaturityName}
        </div>
        <p className="text-xs font-bold mt-2" style={{ color: getScoreColor(analysis.zukunftScore) }}>
          {getScoreLabel(analysis.zukunftScore)}
        </p>
        {analysis.scoreHistory && analysis.scoreHistory.length >= 2 && (
          <MiniSparkline
            points={analysis.scoreHistory.map(h => h.zukunftScore)}
            color={COLORS.ZUKUNFT}
          />
        )}
        <LevelProgressBar level={analysis.zukunftMaturityLevel} color={COLORS.ZUKUNFT} levels={ZUKUNFT_MATURITY_LEVELS} />
        {zukunftNextLevel && (
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-wide mt-2">
            Noch {zukunftNextLevel.pointsNeeded} Punkte bis Stufe {zukunftNextLevel.nextLevel.level}
          </p>
        )}
        <button
          onClick={onToggleZukunftDetail}
          className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors hover:opacity-80"
          style={{ color: COLORS.ZUKUNFT }}
        >
          {showZukunftDetail ? 'Weniger Details' : 'Alle Details anzeigen'}
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showZukunftDetail ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </Card>
  </div>
);

export default ScoreCards;
