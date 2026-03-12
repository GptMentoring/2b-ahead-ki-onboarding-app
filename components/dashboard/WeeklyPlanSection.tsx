
import React, { useState, useMemo } from 'react';
import { COLORS, KI_AUFSTIEGS_DETAILS, ZUKUNFT_AUFSTIEGS_DETAILS } from '../../constants';
import { NextLevelInfo, WeeklyMilestone, buildWeeklyPlan } from './shared';

interface WeeklyPlanSectionProps {
  kiNextLevel: NextLevelInfo | null;
  zukunftNextLevel: NextLevelInfo | null;
  checkedItems: Record<string, boolean>;
  onToggleChecked: (key: string) => void;
}

const CheckItem: React.FC<{ itemKey: string; text: string; done: boolean; onToggle: (key: string) => void }> = ({ itemKey, text, done, onToggle }) => (
  <button onClick={() => onToggle(itemKey)} className="flex gap-2.5 items-start w-full text-left group">
    <span className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
      done ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 group-hover:border-gray-400'
    }`}>
      {done && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
    </span>
    <span className={`text-xs font-bold leading-relaxed transition-colors ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{text}</span>
  </button>
);

const WeekColumn: React.FC<{
  milestones: WeeklyMilestone[];
  label: string;
  color: string;
  zeitrahmen?: string;
  checkPrefix: string;
  checkedItems: Record<string, boolean>;
  onToggleChecked: (key: string) => void;
}> = ({ milestones, label, color, zeitrahmen, checkPrefix, checkedItems, onToggleChecked }) => {
  // Auto-open first incomplete block
  const firstIncomplete = milestones.findIndex((m, mIdx) =>
    m.items.some((_, iIdx) => !checkedItems[`${checkPrefix}-${mIdx}-${iIdx}`])
  );
  const [activeWeek, setActiveWeek] = useState(firstIncomplete >= 0 ? firstIncomplete : 0);

  return (
    <div className="p-5 rounded-2xl border-2 border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>
          {label}
        </span>
        {zeitrahmen && (
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full border border-gray-200 text-gray-400 uppercase">
            {zeitrahmen}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {milestones.map((ms, mIdx) => {
          const checkedCount = ms.items.filter((_, iIdx) => checkedItems[`${checkPrefix}-${mIdx}-${iIdx}`]).length;
          const allDone = checkedCount === ms.items.length;
          const isActive = activeWeek === mIdx;

          return (
            <div key={mIdx} className="rounded-xl overflow-hidden border border-gray-100">
              <button
                onClick={() => setActiveWeek(isActive ? -1 : mIdx)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                {/* Status dot */}
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${
                  allDone ? 'bg-emerald-500' : isActive ? 'animate-pulse' : 'bg-gray-200'
                }`} style={!allDone && isActive ? { backgroundColor: color } : undefined} />

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                    {ms.weekLabel}
                  </span>
                  <span className="text-xs font-black text-gray-700 block">{ms.focus}</span>
                </div>

                <span className="text-[9px] font-black text-gray-400">{checkedCount}/{ms.items.length}</span>

                <svg className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isActive && (
                <div className="px-4 pb-4 pt-1 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {ms.items.map((item, iIdx) => {
                    const key = `${checkPrefix}-${mIdx}-${iIdx}`;
                    return <CheckItem key={iIdx} itemKey={key} text={item} done={!!checkedItems[key]} onToggle={onToggleChecked} />;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Progress Banner ─────────────────────────────────────────
const ProgressBanner: React.FC<{
  checkedItems: Record<string, boolean>;
  kiPlan: WeeklyMilestone[];
  zukunftPlan: WeeklyMilestone[];
}> = ({ checkedItems, kiPlan, zukunftPlan }) => {
  const allPlans = [
    ...kiPlan.map((m, mIdx) => ({ items: m.items, prefix: 'wp-ki', mIdx })),
    ...zukunftPlan.map((m, mIdx) => ({ items: m.items, prefix: 'wp-zk', mIdx })),
  ];

  let totalItems = 0;
  let totalChecked = 0;
  allPlans.forEach(({ items, prefix, mIdx }) => {
    items.forEach((_, iIdx) => {
      totalItems++;
      if (checkedItems[`${prefix}-${mIdx}-${iIdx}`]) totalChecked++;
    });
  });

  if (totalItems === 0) return null;

  const percent = Math.round((totalChecked / totalItems) * 100);
  const getMessage = (): string => {
    if (percent === 0) return 'Starte mit dem ersten Schritt — jeder Haken zählt.';
    if (percent < 25) return `${totalChecked} von ${totalItems} erledigt. Guter Anfang!`;
    if (percent < 50) return `${totalChecked} von ${totalItems} erledigt. Du bist auf dem richtigen Weg.`;
    if (percent < 75) return `${totalChecked} von ${totalItems} erledigt. Über die Hälfte geschafft!`;
    if (percent < 100) return `${totalChecked} von ${totalItems} erledigt. Fast am Ziel!`;
    return 'Alle Aufgaben erledigt! Du bist bereit fürs nächste Level.';
  };

  return (
    <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
          Gesamtfortschritt
        </span>
        <span className={`text-[10px] font-black ${percent === 100 ? 'text-emerald-700' : 'text-gray-600'}`}>
          {percent}%
        </span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percent}%`,
            backgroundColor: percent === 100 ? '#10B981' : COLORS.PRIMARY,
          }}
        />
      </div>
      <p className="text-[10px] font-bold text-gray-500 mt-2">{getMessage()}</p>
    </div>
  );
};

const WeeklyPlanSection: React.FC<WeeklyPlanSectionProps> = ({
  kiNextLevel, zukunftNextLevel, checkedItems, onToggleChecked,
}) => {
  const kiPlan = useMemo(() =>
    kiNextLevel ? buildWeeklyPlan(kiNextLevel, KI_AUFSTIEGS_DETAILS, 'ki') : [],
    [kiNextLevel]
  );
  const zukunftPlan = useMemo(() =>
    zukunftNextLevel ? buildWeeklyPlan(zukunftNextLevel, ZUKUNFT_AUFSTIEGS_DETAILS, 'zukunft') : [],
    [zukunftNextLevel]
  );

  const kiDetails = kiNextLevel ? (KI_AUFSTIEGS_DETAILS as any)[kiNextLevel.nextLevel.level] : null;
  const zkDetails = zukunftNextLevel ? (ZUKUNFT_AUFSTIEGS_DETAILS as any)[zukunftNextLevel.nextLevel.level] : null;

  return (
    <div>
      <ProgressBanner checkedItems={checkedItems} kiPlan={kiPlan} zukunftPlan={zukunftPlan} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {kiPlan.length > 0 && kiNextLevel && (
        <WeekColumn
          milestones={kiPlan}
          label={`KI → Stufe ${kiNextLevel.nextLevel.level}: ${kiNextLevel.nextLevel.name}`}
          color={COLORS.PRIMARY}
          zeitrahmen={kiDetails?.zeitrahmen}
          checkPrefix="wp-ki"
          checkedItems={checkedItems}
          onToggleChecked={onToggleChecked}
        />
      )}
      {zukunftPlan.length > 0 && zukunftNextLevel && (
        <WeekColumn
          milestones={zukunftPlan}
          label={`Zukunft → Stufe ${zukunftNextLevel.nextLevel.level}: ${zukunftNextLevel.nextLevel.name}`}
          color={COLORS.ZUKUNFT}
          zeitrahmen={zkDetails?.zeitrahmen}
          checkPrefix="wp-zk"
          checkedItems={checkedItems}
          onToggleChecked={onToggleChecked}
        />
      )}
      </div>
    </div>
  );
};

export default WeeklyPlanSection;
