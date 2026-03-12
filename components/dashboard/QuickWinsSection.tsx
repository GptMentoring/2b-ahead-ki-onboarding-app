
import React, { useState, useEffect, useCallback } from 'react';
import { COLORS } from '../../constants';
import { Card } from '../UIComponents';
import { TodoItem } from './shared';

interface QuickWinsSectionProps {
  todos: TodoItem[];
}

const QuickWinsSection: React.FC<QuickWinsSectionProps> = ({ todos }) => {
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [showMore, setShowMore] = useState(false);

  if (todos.length === 0) return null;

  const currentTodo = todos[activeIndex];
  const isCurrentCompleted = completedSet.has(activeIndex);
  const allCompleted = completedSet.size >= todos.length;
  const completedCount = completedSet.size;

  const handleToggle = () => {
    if (isCurrentCompleted) {
      // Un-complete
      const next = new Set(completedSet);
      next.delete(activeIndex);
      setCompletedSet(next);
      return;
    }

    // Complete current
    const next = new Set(completedSet);
    next.add(activeIndex);
    setCompletedSet(next);

    // Auto-advance to next incomplete after delay
    if (activeIndex < todos.length - 1) {
      setTimeout(() => {
        setTransitioning(true);
        setTimeout(() => {
          // Find next incomplete
          let nextIdx = activeIndex + 1;
          while (nextIdx < todos.length && next.has(nextIdx)) nextIdx++;
          if (nextIdx < todos.length) {
            setActiveIndex(nextIdx);
          }
          setTransitioning(false);
        }, 300);
      }, 1200);
    }
  };

  // Remaining = all todos except the currently active one
  const remaining = todos.filter((_, idx) => idx !== activeIndex);

  return (
    <Card className="p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-700">
          Dein Quick-Win diese Woche
        </h3>
        {completedCount > 0 && (
          <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            {completedCount}/{todos.length} erledigt
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 font-bold mb-5">
        Eine Aktion. Maximaler Impact. Starte heute.
      </p>

      {/* All done celebration */}
      {allCompleted && (
        <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 text-center animate-in fade-in duration-500">
          <span className="text-2xl block mb-2">🎯</span>
          <p className="text-sm font-black text-emerald-800">Alle Quick-Wins erledigt!</p>
          <p className="text-xs font-bold text-emerald-600 mt-1">Unglaublich. Du bist auf dem besten Weg zum nächsten Level.</p>
        </div>
      )}

      {/* Active Quick-Win */}
      {!allCompleted && (
        <div className={`transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <button
            onClick={handleToggle}
            className="w-full flex gap-4 items-start p-5 rounded-2xl border-2 transition-all duration-300 text-left group"
            style={{
              borderColor: isCurrentCompleted ? '#10B981' : `${COLORS.PRIMARY}30`,
              backgroundColor: isCurrentCompleted ? '#F0FDF4' : '#FAFAFA',
            }}
          >
            {/* Checkbox */}
            <span className={`mt-0.5 w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
              isCurrentCompleted
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-2 border-gray-300 group-hover:border-gray-400'
            }`}>
              {isCurrentCompleted && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-black leading-relaxed transition-all duration-300 ${
                isCurrentCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}>
                {currentTodo.text}
              </p>

              {isCurrentCompleted && activeIndex < todos.length - 1 && (
                <p className="text-xs font-black text-emerald-600 mt-2 animate-in fade-in duration-500">
                  Stark! Weiter geht's — nächster Quick-Win kommt...
                </p>
              )}

              {isCurrentCompleted && activeIndex >= todos.length - 1 && (
                <p className="text-xs font-black text-emerald-600 mt-2 animate-in fade-in duration-500">
                  Stark! Weiter so.
                </p>
              )}

              {!isCurrentCompleted && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {activeIndex > 0 && (
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-tight border border-emerald-100">
                      Quick-Win #{activeIndex + 1}
                    </span>
                  )}
                  <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight"
                    style={{
                      backgroundColor: currentTodo.type === 'ki' ? `${COLORS.PRIMARY}10` : `${COLORS.ZUKUNFT}10`,
                      color: currentTodo.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT,
                    }}>
                    {currentTodo.pillarName}
                  </span>
                  <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-tight">
                    {currentTodo.impact}
                  </span>
                  {currentTodo.timeEstimate && (
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-tight">
                      ~{currentTodo.timeEstimate}
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        </div>
      )}

      {/* Show more toggle */}
      {remaining.length > 0 && !allCompleted && (
        <div className="mt-4">
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showMore ? 'Weniger anzeigen' : `${remaining.length} weitere Quick-Wins`}
            <svg className={`w-3 h-3 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMore && (
            <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {todos.map((todo, idx) => {
                if (idx === activeIndex) return null;
                const done = completedSet.has(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const next = new Set(completedSet);
                      if (done) {
                        next.delete(idx);
                      } else {
                        next.add(idx);
                      }
                      setCompletedSet(next);
                    }}
                    className={`w-full flex gap-2.5 items-start p-3 rounded-xl border transition-all duration-300 text-left group/item ${
                      done ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-100 hover:border-gray-200 hover:bg-gray-100/50'
                    }`}
                  >
                    <span className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                      done ? 'bg-emerald-500 text-white' :
                      'border-2 border-gray-300 group-hover/item:border-gray-400'
                    }`}>
                      {done && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold leading-relaxed ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{todo.text}</p>
                      {done && (
                        <p className="text-[10px] font-black text-emerald-600 mt-1">Erledigt!</p>
                      )}
                      {!done && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight"
                            style={{
                              backgroundColor: todo.type === 'ki' ? `${COLORS.PRIMARY}10` : `${COLORS.ZUKUNFT}10`,
                              color: todo.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT,
                            }}>
                            {todo.pillarName}
                          </span>
                          {todo.timeEstimate && (
                            <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 uppercase tracking-tight">
                              ~{todo.timeEstimate}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default QuickWinsSection;
