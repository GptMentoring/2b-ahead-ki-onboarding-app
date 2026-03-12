
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Analysis, Assessment } from '../types';
import { COLORS } from '../constants';
import { Card, Button } from './UIComponents';
import { IconBolt, IconGlobe, IconBox, IconRocket, IconCheckCircle, IconStar, IconTarget, IconDocument } from './Icons';
import { generateTodos, TodoItem } from './dashboard/shared';
import { dbService } from '../services/dbService';

// ─── Types ───────────────────────────────────────────────────────

interface QuickWinViewProps {
  analysis: Analysis | null;
}

interface ToolRecommendation {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

interface ActionPlan {
  tool: ToolRecommendation;
  prompt: string;
  steps: string[];
}

// ─── Tool & Prompt Generation ────────────────────────────────────

function getToolForPillar(pillarName: string): ToolRecommendation {
  const lower = pillarName.toLowerCase();

  if (lower.includes('tool') || lower.includes('prozess')) {
    return {
      name: 'ChatGPT / Claude',
      url: 'https://chat.openai.com',
      icon: <IconBolt size={28} />,
      color: COLORS.PRIMARY,
    };
  }
  if (lower.includes('kompetenz') || lower.includes('lernen') || lower.includes('zukunftskompetenzen')) {
    return {
      name: 'YouTube / Online-Kurs',
      url: 'https://www.youtube.com/results?search_query=KI+f%C3%BCr+Einsteiger',
      icon: <IconGlobe size={28} />,
      color: '#DC2626',
    };
  }
  if (lower.includes('steuerung') || lower.includes('strategie') || lower.includes('zukunftsstrategie') || lower.includes('umsetzung')) {
    return {
      name: 'Notion / Google Docs',
      url: 'https://www.notion.so',
      icon: <IconDocument size={28} />,
      color: COLORS.ZUKUNFT,
    };
  }
  if (lower.includes('zukunftsbild') || lower.includes('zukunftsfähigkeit')) {
    return {
      name: 'ChatGPT / Claude',
      url: 'https://chat.openai.com',
      icon: <IconBolt size={28} />,
      color: COLORS.ZUKUNFT,
    };
  }

  // Fallback
  return {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    icon: <IconBolt size={28} />,
    color: COLORS.PRIMARY,
  };
}

function getPromptForTodo(todo: TodoItem): string {
  const lower = todo.pillarName.toLowerCase();

  if (lower.includes('tool') || lower.includes('prozess')) {
    return `Ich moechte meine zeitintensivsten Arbeitsprozesse mit KI optimieren. Bitte hilf mir:\n\n1. Analysiere diesen Prozess: [Beschreibe hier deinen Prozess]\n2. Identifiziere die 3 groessten Zeitfresser darin\n3. Schlage fuer jeden Zeitfresser ein konkretes KI-Tool vor (mit Link)\n4. Erstelle einen 5-Schritte-Umsetzungsplan fuer die wichtigste Optimierung\n\nAntworte auf Deutsch und sei so konkret wie moeglich.`;
  }
  if (lower.includes('kompetenz') || lower.includes('zukunftskompetenzen')) {
    return `Ich bin KI-Einsteiger und moechte systematisch KI-Kompetenzen aufbauen. Erstelle mir:\n\n1. Einen 4-Wochen-Lernplan (2h/Woche)\n2. Die 3 wichtigsten KI-Tools, die ich zuerst meistern sollte\n3. Fuer jedes Tool: Ein konkretes Uebungsprojekt aus meinem Alltag\n4. Eine Checkliste, woran ich merke, dass ich "bereit" fuer das naechste Level bin\n\nMein Kontext: [Beschreibe hier deine Branche/Rolle]\nAntworte auf Deutsch.`;
  }
  if (lower.includes('steuerung')) {
    return `Ich moechte KI systematisch in meinen Arbeitsalltag integrieren. Hilf mir bei der Planung:\n\n1. Erstelle einen realistischen Wochenplan mit festen KI-Zeitbloecken\n2. Definiere 3 messbare KI-Ziele fuer die naechsten 4 Wochen\n3. Schlage ein einfaches Tracking-System vor (was, wann, Ergebnis)\n4. Formuliere eine kurze KI-Strategie (max. 5 Saetze)\n\nMein aktueller Stand: [Beschreibe deinen KI-Einsatz]\nAntworte auf Deutsch.`;
  }
  if (lower.includes('zukunftsbild') || lower.includes('zukunftsfähigkeit')) {
    return `Hilf mir, ein konkretes Zukunftsbild fuer mein Unternehmen/meine Taetigkeit zu entwickeln:\n\n1. Stelle mir 5 Leitfragen zu meiner Branche und meinen Staerken\n2. Identifiziere die 3 wichtigsten Trends, die meine Branche in 5 Jahren veraendern\n3. Beschreibe ein konkretes "Best-Case-Szenario" fuer mich in 2029\n4. Leite 3 konkrete Massnahmen ab, die ich JETZT starten sollte\n\nMeine Branche: [Deine Branche]\nAntworte auf Deutsch.`;
  }
  if (lower.includes('zukunftsstrategie') || lower.includes('umsetzung')) {
    return `Ich moechte meine Zukunftsstrategie strukturiert aufbauen. Hilf mir dabei:\n\n1. Definiere mein strategisches Ziel fuer die naechsten 12 Monate\n2. Breche es in 4 Quartals-Meilensteine herunter\n3. Erstelle fuer Q1 konkrete KPIs und Massnahmen\n4. Schlage eine einfache Methode zum Strategie-Tracking vor (OKR, BSC, etc.)\n\nMein Kontext: [Beschreibe hier dein Unternehmen/deine Situation]\nAntworte auf Deutsch.`;
  }

  // Fallback
  return `Hilf mir bei folgendem Quick-Win:\n\n"${todo.text}"\n\n1. Erklaere, warum das wichtig ist\n2. Gib mir eine Schritt-fuer-Schritt-Anleitung (max. 5 Schritte)\n3. Nenne das beste Tool dafuer\n4. Formuliere ein konkretes Ergebnis, das ich in 1 Stunde erreichen kann\n\nAntworte auf Deutsch und sei so konkret wie moeglich.`;
}

function getStepsForTodo(todo: TodoItem): string[] {
  const lower = todo.pillarName.toLowerCase();

  if (lower.includes('tool') || lower.includes('prozess')) {
    return [
      'Oeffne ChatGPT oder Claude im Browser',
      'Kopiere den Prompt und passe den [Platzhalter] an deinen Prozess an',
      'Lies die Antwort durch und markiere die 1 beste Idee',
      'Setze diese eine Idee heute noch um (max. 30 Min)',
      'Notiere das Ergebnis: Was hat es gebracht?',
    ];
  }
  if (lower.includes('kompetenz') || lower.includes('zukunftskompetenzen')) {
    return [
      'Waehle ein KI-Tool aus (z.B. ChatGPT, Claude, Gemini)',
      'Erstelle einen Account und oeffne das Tool',
      'Starte mit dem Prompt — passe die Platzhalter an',
      'Plane 30 Min pro Tag diese Woche fuer KI-Uebungen ein',
    ];
  }
  if (lower.includes('steuerung')) {
    return [
      'Oeffne deinen Kalender und blocke 2 feste KI-Zeiten pro Woche',
      'Kopiere den Prompt und starte die Planung',
      'Schreibe deine 3 KI-Ziele auf (Papier oder digital)',
      'Richte ein einfaches Tracking ein (z.B. Notion, Tabelle)',
      'Review: Pruefe nach 1 Woche, was funktioniert hat',
    ];
  }
  if (lower.includes('zukunftsbild') || lower.includes('zukunftsfähigkeit')) {
    return [
      'Nimm dir 30 Min ungestoerte Zeit (Kaffee holen!)',
      'Oeffne ChatGPT/Claude und kopiere den Prompt',
      'Beantworte die Leitfragen ehrlich und ausfuehrlich',
      'Speichere das Ergebnis als "Mein Zukunftsbild 2029"',
    ];
  }
  if (lower.includes('zukunftsstrategie') || lower.includes('umsetzung')) {
    return [
      'Oeffne Notion, Google Docs oder ein leeres Dokument',
      'Kopiere den Prompt in ChatGPT/Claude',
      'Passe die Platzhalter an deine Situation an',
      'Uebertrage das Ergebnis in dein Strategiedokument',
      'Teile es mit deinem Team / Mentor',
    ];
  }

  return [
    'Lies den Quick-Win-Text oben aufmerksam durch',
    'Kopiere den Prompt und oeffne das empfohlene Tool',
    'Passe die Platzhalter an deine Situation an',
    'Setze das Ergebnis direkt um',
  ];
}

function getContextForTodo(todo: TodoItem, kiLevel: number): string {
  if (todo.type === 'ki') {
    if (kiLevel <= 3) {
      return `Auf deinem aktuellen Level (Stufe ${kiLevel}) ist "${todo.pillarName}" ein schneller Hebel. Schon kleine Schritte hier bringen messbare Ergebnisse.`;
    }
    if (kiLevel <= 6) {
      return `Als Stufe-${kiLevel}-Anwender kannst du "${todo.pillarName}" gezielt ausbauen. Dieser Quick-Win bringt dich naeher an die naechste Stufe.`;
    }
    return `Auf deinem fortgeschrittenen Level hilft dir dieser Quick-Win, "${todo.pillarName}" weiter zu professionalisieren.`;
  }
  // zukunft
  return `"${todo.pillarName}" ist ein Kernbereich deiner Zukunftsfaehigkeit. Dieser Quick-Win staerkt deine strategische Position.`;
}

// ─── Component ───────────────────────────────────────────────────

const QuickWinView: React.FC<QuickWinViewProps> = ({ analysis }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [copied, setCopied] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Load assessment for generateTodos
  useEffect(() => {
    if (!analysis) return;
    dbService.getAssessment(analysis.userId).then(setAssessment);
  }, [analysis]);

  const todos = useMemo(() =>
    (analysis && assessment) ? generateTodos(analysis, assessment) : [],
    [analysis, assessment]
  );

  const currentTodo = todos[activeIndex] || null;
  const completedCount = completedSet.size;
  const kiLevel = analysis?.kiMaturityLevel ?? 1;

  const actionPlan: ActionPlan | null = useMemo(() => {
    if (!currentTodo) return null;
    return {
      tool: getToolForPillar(currentTodo.pillarName),
      prompt: getPromptForTodo(currentTodo),
      steps: getStepsForTodo(currentTodo),
    };
  }, [currentTodo]);

  const handleCopyPrompt = useCallback(() => {
    if (!actionPlan) return;
    navigator.clipboard.writeText(actionPlan.prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [actionPlan]);

  const handleComplete = useCallback(() => {
    dbService.trackEvent(analysis!.userId, 'quickwin_completed', { todoIndex: activeIndex });
    const next = new Set(completedSet);
    next.add(activeIndex);
    setCompletedSet(next);
    setTransitioning(true);
    setTimeout(() => {
      setStep(3);
      setTransitioning(false);
    }, 300);
  }, [activeIndex, completedSet]);

  const handleNextQuickWin = useCallback(() => {
    // Find next incomplete
    let nextIdx = activeIndex + 1;
    while (nextIdx < todos.length && completedSet.has(nextIdx)) nextIdx++;
    if (nextIdx >= todos.length) {
      // Wrap: find first incomplete
      nextIdx = 0;
      while (nextIdx < todos.length && completedSet.has(nextIdx)) nextIdx++;
    }
    if (nextIdx < todos.length && !completedSet.has(nextIdx)) {
      setTransitioning(true);
      setTimeout(() => {
        setActiveIndex(nextIdx);
        setStep(1);
        setTransitioning(false);
      }, 300);
    }
  }, [activeIndex, todos.length, completedSet]);

  const handleBackToDashboard = useCallback(() => {
    window.location.hash = '/';
  }, []);

  // ─── Loading / Empty States ──────────────────────────────────

  if (!analysis) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-12 pb-32">
        <Card className="p-12 text-center">
          <IconTarget size={40} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-black text-gray-700 mb-2">Noch keine Analyse vorhanden</h2>
          <p className="text-sm text-gray-500 mb-6">Schliesse zuerst den Readiness-Check ab, um deine Quick-Wins zu sehen.</p>
          <Button onClick={handleBackToDashboard}>Zum Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (!assessment || todos.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-12 pb-32">
        <Card className="p-12 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded-lg mx-auto mb-4" />
            <div className="h-4 w-64 bg-gray-100 rounded mx-auto" />
          </div>
        </Card>
      </div>
    );
  }

  const allCompleted = completedSet.size >= todos.length;

  // ─── Step Indicator ──────────────────────────────────────────

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all duration-500"
            style={{
              backgroundColor: step >= s ? (currentTodo?.type === 'zukunft' ? COLORS.ZUKUNFT : COLORS.PRIMARY) : '#E5E7EB',
              color: step >= s ? '#FFFFFF' : '#9CA3AF',
              transform: step === s ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            {s < step ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : s}
          </div>
          {s < 3 && (
            <div
              className="w-12 h-1 rounded-full transition-all duration-500"
              style={{ backgroundColor: step > s ? (currentTodo?.type === 'zukunft' ? COLORS.ZUKUNFT : COLORS.PRIMARY) : '#E5E7EB' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // ─── All-Completed Celebration ───────────────────────────────

  if (allCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-12 pb-32 animate-in fade-in duration-700">
        <Card className="p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            background: `radial-gradient(circle at 50% 30%, ${COLORS.SUCCESS} 0%, transparent 70%)`,
          }} />
          <div className="relative">
            <div className="text-5xl mb-6">&#127881;</div>
            <h2 className="text-2xl md:text-3xl font-black mb-3" style={{ color: COLORS.SUCCESS }}>
              Alle Quick-Wins erledigt!
            </h2>
            <p className="text-sm font-bold text-gray-600 mb-2">
              Du hast {todos.length} von {todos.length} Quick-Wins abgeschlossen.
            </p>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              Unglaublich. Du bist auf dem besten Weg zum naechsten Level. Dein Fortschritt wird im Dashboard sichtbar.
            </p>
            <Button onClick={handleBackToDashboard} className="mx-auto">
              Zurueck zum Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ─── STEP 1: Uebersicht ────────────────────────────────────────

  const renderStep1 = () => (
    <div className={`transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <Card className="p-8 md:p-12 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] rounded-full -translate-y-1/3 translate-x-1/3"
          style={{ backgroundColor: currentTodo?.type === 'zukunft' ? COLORS.ZUKUNFT : COLORS.PRIMARY }}
        />

        <div className="relative">
          {/* Header badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest"
              style={{
                backgroundColor: currentTodo?.type === 'ki' ? `${COLORS.PRIMARY}10` : `${COLORS.ZUKUNFT}10`,
                color: currentTodo?.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT,
              }}>
              {currentTodo?.pillarName}
            </span>
            <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-widest border border-emerald-100">
              {currentTodo?.impact}
            </span>
            {currentTodo?.timeEstimate && (
              <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 uppercase tracking-widest">
                ~{currentTodo.timeEstimate}
              </span>
            )}
            <span className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest"
              style={{
                backgroundColor: currentTodo?.priority === 'high' ? '#FEF2F2' : currentTodo?.priority === 'medium' ? '#FFFBEB' : '#F9FAFB',
                color: currentTodo?.priority === 'high' ? '#991B1B' : currentTodo?.priority === 'medium' ? '#92400E' : '#6B7280',
                border: `1px solid ${currentTodo?.priority === 'high' ? '#FECACA' : currentTodo?.priority === 'medium' ? '#FDE68A' : '#E5E7EB'}`,
              }}>
              {currentTodo?.priority === 'high' ? 'Hohe Prioritaet' : currentTodo?.priority === 'medium' ? 'Mittlere Prioritaet' : 'Niedrige Prioritaet'}
            </span>
          </div>

          {/* Quick-Win counter */}
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
            Quick-Win {activeIndex + 1} von {todos.length}
          </p>

          {/* Main text */}
          <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-snug mb-5">
            {currentTodo?.text}
          </h2>

          {/* Context: Why this matters */}
          <div className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 mb-8">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Warum gerade dieser Quick-Win?</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {getContextForTodo(currentTodo!, kiLevel)}
            </p>
          </div>

          {/* Progress bar */}
          {completedCount > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Dein Fortschritt</span>
                <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {completedCount}/{todos.length} erledigt
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(completedCount / todos.length) * 100}%`,
                    backgroundColor: COLORS.SUCCESS,
                  }}
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                dbService.trackEvent(analysis!.userId, 'quickwin_started', { todoIndex: activeIndex });
                setTransitioning(true);
                setTimeout(() => {
                  setStep(2);
                  setTransitioning(false);
                }, 300);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white transition-all active:scale-95 shadow-md hover:shadow-xl"
              style={{ backgroundColor: currentTodo?.type === 'zukunft' ? COLORS.ZUKUNFT : COLORS.PRIMARY }}
            >
              Jetzt starten
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <Button onClick={handleBackToDashboard} variant="secondary" className="sm:w-auto">
              Dashboard
            </Button>
          </div>
        </div>
      </Card>

      {/* Other Quick-Wins (collapsed list) */}
      {todos.length > 1 && (
        <OtherQuickWins
          todos={todos}
          activeIndex={activeIndex}
          completedSet={completedSet}
          onSelect={(idx) => {
            setTransitioning(true);
            setTimeout(() => {
              setActiveIndex(idx);
              setStep(1);
              setTransitioning(false);
            }, 300);
          }}
        />
      )}
    </div>
  );

  // ─── STEP 2: Konkreter Aktionsplan ─────────────────────────────

  const renderStep2 = () => {
    if (!actionPlan || !currentTodo) return null;

    return (
      <div className={`transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <Card className="p-8 md:p-12 relative overflow-hidden">
          <div className="relative">
            {/* Back button */}
            <button
              onClick={() => {
                setTransitioning(true);
                setTimeout(() => {
                  setStep(1);
                  setTransitioning(false);
                }, 300);
              }}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors mb-6"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Zurueck zur Uebersicht
            </button>

            {/* Quick-Win reminder */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 mb-6">
              <p className="text-xs font-bold text-gray-500 leading-relaxed">{currentTodo.text}</p>
            </div>

            {/* Tool recommendation */}
            <div className="flex items-center gap-4 p-5 rounded-2xl border-2 mb-8"
              style={{
                borderColor: `${actionPlan.tool.color}25`,
                backgroundColor: `${actionPlan.tool.color}05`,
              }}
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${actionPlan.tool.color}12`, color: actionPlan.tool.color }}
              >
                {actionPlan.tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Empfohlenes Tool</p>
                <p className="text-base font-black text-gray-900">{actionPlan.tool.name}</p>
              </div>
              <a
                href={actionPlan.tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest transition-colors"
                style={{
                  backgroundColor: `${actionPlan.tool.color}12`,
                  color: actionPlan.tool.color,
                }}
              >
                Oeffnen
              </a>
            </div>

            {/* Copy-Paste Prompt */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Dein Copy-Paste Prompt
                </p>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest transition-all"
                  style={{
                    backgroundColor: copied ? '#F0FDF4' : '#F3F4F6',
                    color: copied ? '#065F46' : '#6B7280',
                    border: copied ? '1px solid #BBF7D0' : '1px solid #E5E7EB',
                  }}
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Kopiert!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      Kopieren
                    </>
                  )}
                </button>
              </div>
              <div
                className="p-5 rounded-2xl border-2 border-gray-200 bg-gray-50 font-mono text-xs text-gray-700 leading-relaxed whitespace-pre-wrap cursor-pointer hover:border-gray-300 transition-colors"
                onClick={handleCopyPrompt}
              >
                {actionPlan.prompt}
              </div>
            </div>

            {/* Step-by-Step */}
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">
                Schritt fuer Schritt
              </p>
              <div className="space-y-3">
                {actionPlan.steps.map((stepText, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                      style={{
                        backgroundColor: `${currentTodo.type === 'zukunft' ? COLORS.ZUKUNFT : COLORS.PRIMARY}10`,
                        color: currentTodo.type === 'zukunft' ? COLORS.ZUKUNFT : COLORS.PRIMARY,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{stepText}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA: Erledigt */}
            <button
              onClick={handleComplete}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white transition-all active:scale-95 shadow-md hover:shadow-xl"
              style={{ backgroundColor: COLORS.SUCCESS }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Erledigt
            </button>
          </div>
        </Card>
      </div>
    );
  };

  // ─── STEP 3: Celebration + Next ────────────────────────────────

  const renderStep3 = () => (
    <div className={`transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      <Card className="p-8 md:p-14 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          background: `radial-gradient(circle at 50% 30%, ${COLORS.SUCCESS} 0%, transparent 70%)`,
        }} />

        <div className="relative">
          {/* Celebration icon */}
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: `${COLORS.SUCCESS}12` }}
          >
            <IconCheckCircle size={40} className="text-emerald-600" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: COLORS.SUCCESS }}>
            Stark! Quick-Win erledigt
          </h2>
          <p className="text-sm text-gray-500 mb-6 font-bold">
            &#127881; Du hast gerade einen echten Schritt nach vorne gemacht.
          </p>

          {/* Impact card */}
          <div className="inline-block p-5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 mb-6 text-left max-w-sm mx-auto w-full">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2">Was du erreicht hast</p>
            <p className="text-sm font-bold text-emerald-800 leading-relaxed mb-2">{currentTodo?.text}</p>
            <p className="text-xs text-emerald-600">
              Erwarteter Impact: {currentTodo?.impact}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Fortschritt
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {completedCount}/{todos.length} erledigt
              </span>
            </div>
            <div className="w-full max-w-xs mx-auto h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${(completedCount / todos.length) * 100}%`,
                  backgroundColor: COLORS.SUCCESS,
                }}
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            {completedCount < todos.length && (
              <button
                onClick={handleNextQuickWin}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white transition-all active:scale-95 shadow-md hover:shadow-xl"
                style={{ backgroundColor: currentTodo?.type === 'zukunft' ? COLORS.ZUKUNFT : COLORS.PRIMARY }}
              >
                Naechster Quick-Win
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
            <Button onClick={handleBackToDashboard} variant="secondary" className="sm:w-auto flex-1">
              Zurueck zum Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // ─── Main Render ──────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-12 pb-32 animate-in fade-in duration-700">
      <StepIndicator />
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

// ─── Sub-Component: Other Quick-Wins List ────────────────────────

const OtherQuickWins: React.FC<{
  todos: TodoItem[];
  activeIndex: number;
  completedSet: Set<number>;
  onSelect: (idx: number) => void;
}> = ({ todos, activeIndex, completedSet, onSelect }) => {
  const [showMore, setShowMore] = useState(false);
  const remaining = todos.filter((_, idx) => idx !== activeIndex);

  if (remaining.length === 0) return null;

  return (
    <div className="mt-6">
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
                onClick={() => !done && onSelect(idx)}
                className={`w-full flex gap-2.5 items-start p-3 rounded-xl border transition-all duration-300 text-left ${
                  done ? 'bg-emerald-50/50 border-emerald-100 cursor-default' : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 flex items-center justify-center ${
                  done ? 'bg-emerald-100 text-emerald-600' :
                  todo.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                  todo.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {done ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[8px] font-black">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold leading-relaxed ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{todo.text}</p>
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
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuickWinView;
