
import React from 'react';
import { COLORS, KI_AUFSTIEGS_DETAILS, ZUKUNFT_AUFSTIEGS_DETAILS } from '../../constants';
import { NextLevelInfo, TodoItem } from './shared';

interface LevelUpSectionProps {
  kiNextLevel: NextLevelInfo | null;
  zukunftNextLevel: NextLevelInfo | null;
  todos: TodoItem[];
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

const LevelUpCard: React.FC<{
  nextLevel: NextLevelInfo;
  color: string;
  label: string;
  aufstiegsDetails: Record<number, any>;
  checkPrefix: string;
  checkedItems: Record<string, boolean>;
  onToggleChecked: (key: string) => void;
}> = ({ nextLevel, color, label, aufstiegsDetails, checkPrefix, checkedItems, onToggleChecked }) => {
  const details = aufstiegsDetails[nextLevel.nextLevel.level];
  return (
    <div className="p-6 rounded-2xl border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
          style={{ backgroundColor: color }}>
          {nextLevel.nextLevel.level}
        </div>
        <div className="flex-1">
          <span className="text-[9px] font-black uppercase tracking-widest block" style={{ color }}>
            Dein Ziel: {label} Stufe {nextLevel.nextLevel.level}
          </span>
          <span className="text-sm font-black text-gray-900">{nextLevel.nextLevel.name}</span>
        </div>
        {details?.zeitrahmen && (
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full border border-gray-200 text-gray-400 uppercase whitespace-nowrap">
            {details.zeitrahmen}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 font-bold mb-4">{nextLevel.nextLevel.desc}</p>

      {details?.byPillar ? (
        <div className="space-y-4">
          {Object.entries(details.byPillar).map(([pillarName, items]) => (
            <div key={pillarName}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
                <h5 className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>
                  {pillarName}
                </h5>
              </div>
              <div className="space-y-1.5 pl-3">
                {(items as string[]).map((item, idx) => {
                  const key = `${checkPrefix}-${pillarName}-${idx}`;
                  return <CheckItem key={idx} itemKey={key} text={item} done={!!checkedItems[key]} onToggle={onToggleChecked} />;
                })}
              </div>
            </div>
          ))}
        </div>
      ) : nextLevel.nextLevel.checklist ? (
        <div className="space-y-2">
          {nextLevel.nextLevel.checklist.map((item, idx) => {
            const key = `${checkPrefix}-cl-${idx}`;
            return <CheckItem key={idx} itemKey={key} text={item} done={!!checkedItems[key]} onToggle={onToggleChecked} />;
          })}
        </div>
      ) : null}

      {details?.wow && (
        <div className="mt-4 p-3 rounded-lg border border-dashed" style={{ borderColor: `${color}30`, backgroundColor: `${color}05` }}>
          <div className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color }}>
            WoW-Moment
          </div>
          <p className="text-xs font-bold text-gray-800 italic">&bdquo;{details.wow}&ldquo;</p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
          Noch {nextLevel.pointsNeeded} Punkte bis Stufe {nextLevel.nextLevel.level}
        </span>
      </div>
    </div>
  );
};

const LevelUpSection: React.FC<LevelUpSectionProps> = ({ kiNextLevel, zukunftNextLevel, todos, checkedItems, onToggleChecked }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {kiNextLevel && (
        <LevelUpCard
          nextLevel={kiNextLevel}
          color={COLORS.PRIMARY}
          label="KI"
          aufstiegsDetails={KI_AUFSTIEGS_DETAILS}
          checkPrefix="ki"
          checkedItems={checkedItems}
          onToggleChecked={onToggleChecked}
        />
      )}
      {zukunftNextLevel && (
        <LevelUpCard
          nextLevel={zukunftNextLevel}
          color={COLORS.ZUKUNFT}
          label="Zukunft"
          aufstiegsDetails={ZUKUNFT_AUFSTIEGS_DETAILS}
          checkPrefix="zk"
          checkedItems={checkedItems}
          onToggleChecked={onToggleChecked}
        />
      )}
    </div>

    {/* Weitere Quick-Wins */}
    {todos.length > 3 && (
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
          Weitere Quick-Wins
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {todos.slice(3).map((todo, idx) => (
            <div key={idx} className="flex gap-2 items-start p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center ${
                todo.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                todo.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                'bg-gray-100 text-gray-500'
              }`}>
                <span className="text-[8px] font-black">{idx + 4}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 leading-relaxed">{todo.text}</p>
                <span className="text-[7px] font-black px-1 py-0.5 rounded uppercase tracking-tight mt-1 inline-block"
                  style={{
                    backgroundColor: todo.type === 'ki' ? `${COLORS.PRIMARY}10` : `${COLORS.ZUKUNFT}10`,
                    color: todo.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT,
                  }}>
                  {todo.pillarName}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
);

export default LevelUpSection;
