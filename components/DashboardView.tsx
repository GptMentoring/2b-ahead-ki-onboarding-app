
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { User, Assessment, Analysis, IstAnalyseProfile } from '../types';
import { dbService } from '../services/dbService';
import {
  COLORS, KI_MATURITY_LEVELS, ZUKUNFT_MATURITY_LEVELS,
  KI_PILLAR_NAMES, ZUKUNFT_PILLAR_NAMES,
} from '../constants';
import { Card, Button } from './UIComponents';
import IstAnalyseProfileSection from './IstAnalyseProfileSection';
import { IconClipboard, IconChart, IconCurrency, IconRocket, IconDocument } from './Icons';
import ScoreRadar from './RadarChart';

// Dashboard sub-components
import { CollapsibleSection, analyzePillars, generateTodos, getNextLevelInfo, formatEur, generateCelebrationLine, PillarAnalysis } from './dashboard/shared';
import ProgressReport from './dashboard/ProgressReport';
import ScoreCards from './dashboard/ScoreCards';
import ROICard from './dashboard/ROICard';
import ZukunftRisikoCard from './dashboard/ZukunftRisikoCard';
import DetailPanels from './dashboard/DetailPanels';
import StrengthsPotentials from './dashboard/StrengthsPotentials';
import RecommendationCard from './dashboard/RecommendationCard';
import QuickWinsSection from './dashboard/QuickWinsSection';
import WeeklyPlanSection from './dashboard/WeeklyPlanSection';
import SessionBridgeCard from './dashboard/SessionBridgeCard';
import AssessmentDataSection from './dashboard/AssessmentDataSection';
import LevelUpCelebration from './dashboard/LevelUpCelebration';

interface DashboardViewProps {
  user: User;
  analysis: Analysis | null;
  istAnalyseProfile?: IstAnalyseProfile | null;
  onRepeat: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD VIEW — 3-Screen Layout
// ═══════════════════════════════════════════════════════════════════

// Helper: Kalenderwoche für Checklisten-Key
const getWeekKey = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
};

const DashboardView: React.FC<DashboardViewProps> = ({ user, analysis: analysisProp, istAnalyseProfile, onRepeat }) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(analysisProp);
  const [showKiDetail, setShowKiDetail] = useState(false);
  const [showZukunftDetail, setShowZukunftDetail] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // ─── R3: Level-Up Celebration State ──────────────────────────
  const [levelUp, setLevelUp] = useState<{
    prev: number; new: number; name: string; type: 'ki' | 'zukunft';
  } | null>(null);

  // ─── R4: Checklisten-Persistenz (Firestore + localStorage Fallback) ──
  const weekKey = getWeekKey();
  const storageKey = `checklist_${user?.uid}_${weekKey}`;
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [checklistLoaded, setChecklistLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Laden: Firestore zuerst, localStorage als Fallback
  useEffect(() => {
    let cancelled = false;
    const loadChecklist = async () => {
      try {
        const firestoreData = await dbService.getChecklist(user.uid, weekKey);
        if (!cancelled) {
          if (Object.keys(firestoreData).length > 0) {
            setCheckedItems(firestoreData);
          } else {
            // Fallback: localStorage (Offline oder erste Migration)
            try {
              const saved = localStorage.getItem(storageKey);
              if (saved && !cancelled) {
                const parsed = JSON.parse(saved) as Record<string, boolean>;
                setCheckedItems(parsed);
                // Migriere localStorage-Daten nach Firestore
                if (Object.keys(parsed).length > 0) {
                  dbService.saveChecklist(user.uid, weekKey, parsed);
                }
              }
            } catch { /* localStorage nicht verfuegbar */ }
          }
          setChecklistLoaded(true);
        }
      } catch {
        // Firestore fehlgeschlagen — localStorage Fallback
        if (!cancelled) {
          try {
            const saved = localStorage.getItem(storageKey);
            if (saved) setCheckedItems(JSON.parse(saved));
          } catch { /* noop */ }
          setChecklistLoaded(true);
        }
      }
    };
    loadChecklist();
    return () => { cancelled = true; };
  }, [user.uid, weekKey, storageKey]);

  // Speichern: Debounced in BEIDE (localStorage + Firestore)
  useEffect(() => {
    if (!checklistLoaded) return; // Nicht speichern bevor geladen
    if (Object.keys(checkedItems).length === 0) return;

    // localStorage sofort (Offline-Support)
    localStorage.setItem(storageKey, JSON.stringify(checkedItems));

    // Firestore debounced (500ms)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      dbService.saveChecklist(user.uid, weekKey, checkedItems);
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [checkedItems, checklistLoaded, user.uid, weekKey, storageKey]);

  const toggleChecked = useCallback(
    (key: string) => setCheckedItems(prev => ({ ...prev, [key]: !prev[key] })),
    []
  );

  // Sync local analysis when prop changes
  useEffect(() => {
    setAnalysis(analysisProp);
  }, [analysisProp]);

  useEffect(() => {
    const loadData = async () => {
      const ass = await dbService.getAssessment(user.uid);
      setAssessment(ass);

      // Load score history from subcollection and inject into analysis
      if (analysisProp) {
        const history = await dbService.getScoreHistory(user.uid);
        if (history.length > 0) {
          setAnalysis(prev => prev ? { ...prev, scoreHistory: history } : prev);
        }
      }
    };
    loadData();
  }, [user, analysisProp]);

  const { strengths, potentials } = useMemo(() =>
    analysis ? analyzePillars(analysis) : { strengths: [], potentials: [] },
    [analysis]
  );

  const todos = useMemo(() =>
    (analysis && assessment) ? generateTodos(analysis, assessment) : [],
    [analysis, assessment]
  );

  const kiNextLevel = useMemo(() =>
    analysis ? getNextLevelInfo(analysis.kiScore, KI_MATURITY_LEVELS) : null,
    [analysis]
  );

  const zukunftNextLevel = useMemo(() =>
    analysis ? getNextLevelInfo(analysis.zukunftScore, ZUKUNFT_MATURITY_LEVELS) : null,
    [analysis]
  );

  const celebrationLine = useMemo(() =>
    analysis ? generateCelebrationLine(analysis, strengths) : '',
    [analysis, strengths]
  );

  // ─── R3: Level-Up Detection ──────────────────────────────────
  useEffect(() => {
    if (!analysis) return;

    // KI Level-Up pruefen
    if (analysis.previousKiScore != null) {
      const prevKiLevel = KI_MATURITY_LEVELS.find(
        m => analysis.previousKiScore! >= m.min && analysis.previousKiScore! <= m.max
      );
      if (prevKiLevel && analysis.kiMaturityLevel > prevKiLevel.level) {
        setLevelUp({
          prev: prevKiLevel.level,
          new: analysis.kiMaturityLevel,
          name: analysis.kiMaturityName,
          type: 'ki',
        });
        return; // Zeige nur einen Level-Up auf einmal
      }
    }

    // Zukunft Level-Up pruefen
    if (analysis.previousZukunftScore != null) {
      const prevZukunftLevel = ZUKUNFT_MATURITY_LEVELS.find(
        m => analysis.previousZukunftScore! >= m.min && analysis.previousZukunftScore! <= m.max
      );
      if (prevZukunftLevel && analysis.zukunftMaturityLevel > prevZukunftLevel.level) {
        setLevelUp({
          prev: prevZukunftLevel.level,
          new: analysis.zukunftMaturityLevel,
          name: analysis.zukunftMaturityName,
          type: 'zukunft',
        });
      }
    }
  }, [analysis]); // Nur einmal bei analysis-Load

  if (!analysis || !assessment) return null;

  const isSolo = assessment.m1_solo === 'solo';

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 pb-32 animate-in fade-in duration-1000">

      {/* ─── R3: Level-Up Celebration Overlay ─── */}
      {levelUp && (
        <LevelUpCelebration
          previousLevel={levelUp.prev}
          newLevel={levelUp.new}
          newLevelName={levelUp.name}
          type={levelUp.type}
          onClose={() => setLevelUp(null)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          SCREEN 1: SCORE HERO (above the fold)
          ═══════════════════════════════════════════════════════════ */}

      {/* ─── Header ─── */}
      <header className="mb-10 no-print">
        <span className="text-[11px] font-black uppercase tracking-[0.4em] mb-2 block" style={{ color: COLORS.PRIMARY }}>
          Persönliche Auswertung
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
          {analysis.previousKiScore != null
            ? `Hallo ${user.firstName}, du bist ${analysis.kiScore - analysis.previousKiScore} Punkte gewachsen!`
            : analysis.cecData?.gesamtErgebnis > 0
              ? `Hallo ${user.firstName}, dein KI-Potenzial: ${formatEur(analysis.cecData.gesamtErgebnis)} EUR/Jahr`
              : `Hallo ${user.firstName}, hier ist dein KI-Fahrplan.`
          }
        </h1>
        {celebrationLine && (
          <p className="text-sm font-black mt-2" style={{ color: COLORS.SUCCESS }}>
            {celebrationLine}
          </p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <p className="text-gray-500 font-bold text-sm">
            {isSolo ? 'Solo-Selbstständig' : 'Team/Unternehmen'} — Assessment vom {new Date(analysis.createdAt).toLocaleDateString('de-DE')}
          </p>
          <button
            onClick={() => { dbService.trackEvent(user.uid, 'report_exported'); setShowReport(true); }}
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all no-print"
          >
            Report exportieren
          </button>
        </div>
      </header>

      {/* ─── R5: Progress Report Overlay ─── */}
      {showReport && (
        <ProgressReport
          user={user}
          analysis={analysis}
          strengths={strengths}
          potentials={potentials}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* ─── ROI Highlight (stärkstes Verkaufsargument — above the fold) ─── */}
      <ROICard analysis={analysis} />

      {/* ─── Dual Score Cards ─── */}
      <ScoreCards
        analysis={analysis}
        kiNextLevel={kiNextLevel}
        zukunftNextLevel={zukunftNextLevel}
        showKiDetail={showKiDetail}
        showZukunftDetail={showZukunftDetail}
        onToggleKiDetail={() => setShowKiDetail(!showKiDetail)}
        onToggleZukunftDetail={() => setShowZukunftDetail(!showZukunftDetail)}
      />

      {/* ─── Detail Panels (direkt unter ScoreCards, inline expandiert) ─── */}
      <DetailPanels
        analysis={analysis}
        assessment={assessment}
        isSolo={isSolo}
        showKiDetail={showKiDetail}
        showZukunftDetail={showZukunftDetail}
      />

      {/* ─── Session-Brücke (Upsell-Chance — above the fold) ─── */}
      <SessionBridgeCard
        sessionEmpfehlung={istAnalyseProfile?.sessionEmpfehlung || (analysis.kiScore < 40 ? 'Dienstag' : 'Donnerstag')}
        potentials={potentials}
      />

      {/* ─── Top-3 Quick-Wins ─── */}
      <QuickWinsSection todos={todos} />

      {/* ═══════════════════════════════════════════════════════════
          SCREEN 2: STÄRKEN, PROFIL & HANDLUNGSPLAN
          ═══════════════════════════════════════════════════════════ */}

      {/* ─── Stärken & Potenziale (direkt nach Quick-Wins für Kontext) ─── */}
      <StrengthsPotentials strengths={strengths} potentials={potentials} />

      {/* ─── KI Ist-Analyse: CTA oder Profil ─── */}
      {!user.istAnalyseCompleted ? (() => {
        // S3: Dynamic, outcome-focused CTA based on user's score
        let ctaHeadline: string;
        let ctaDescription: string;

        if (analysis.kiScore < 30) {
          ctaHeadline = 'Entdecke deinen persönlichen KI-Einstiegsplan';
          ctaDescription = 'Die KI Ist-Analyse zeigt dir genau, wo du am schnellsten Ergebnisse erzielst. ~10 Min.';
        } else if (analysis.kiScore < 60) {
          // Find weakest pillar
          const pillarEntries = Object.entries(analysis.kiPillarScores) as [string, number][];
          const weakest = pillarEntries.reduce((min, curr) => curr[1] < min[1] ? curr : min, pillarEntries[0]);
          const weakestName = KI_PILLAR_NAMES[weakest[0]] || weakest[0];
          ctaHeadline = `Optimiere dein schwächstes Feld: ${weakestName}`;
          ctaDescription = `Dein Bereich '${weakestName}' hat Potenzial. Die Ist-Analyse gibt dir konkrete nächste Schritte. ~10 Min.`;
        } else {
          ctaHeadline = 'Hole das Maximum aus deinem KI-Potenzial';
          ctaDescription = 'Auf deinem Level lohnt sich die Feinabstimmung — erhalte passgenaue Tool- und Session-Empfehlungen. ~10 Min.';
        }

        return (
          <Card className="p-6 md:p-8 mb-8 border-2 no-print" style={{ borderColor: COLORS.SUCCESS }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-gray-400"><IconClipboard size={28} /></span>
                <div>
                  <h3 className="text-base font-black text-gray-900 mb-1">
                    {ctaHeadline}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {ctaDescription}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => { dbService.trackEvent(user.uid, 'istanalyse_cta_clicked'); window.location.hash = '/ist-analyse'; }}
                className="whitespace-nowrap"
              >
                KI Ist-Analyse starten
              </Button>
            </div>
          </Card>
        );
      })() : istAnalyseProfile ? (
        <div className="mb-8">
          <IstAnalyseProfileSection profile={istAnalyseProfile} />
        </div>
      ) : null}

      {/* ─── Zukunft-Risiko (nach Profil — Motivation für Handlung) ─── */}
      <ZukunftRisikoCard analysis={analysis} />

      {/* ─── Wochenplan (Timeline) ─── */}
      <Card className="p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-gray-400"><IconRocket size={22} /></span>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-700">
            Dein Wochenplan zum nächsten Level
          </h3>
        </div>
        <WeeklyPlanSection
          kiNextLevel={kiNextLevel}
          zukunftNextLevel={zukunftNextLevel}
          checkedItems={checkedItems}
          onToggleChecked={toggleChecked}
        />
      </Card>

      {/* ─── Produkt-Empfehlung ─── */}
      <RecommendationCard analysis={analysis} istAnalyseProfile={istAnalyseProfile || undefined} />

      {/* ═══════════════════════════════════════════════════════════
          SCREEN 3: DETAILS (alle aufklappbar)
          ═══════════════════════════════════════════════════════════ */}

      <div className="space-y-4">
        <h2 className="text-lg font-black text-gray-400 uppercase tracking-widest mb-2">
          Detailanalyse
        </h2>

        {/* ─── Radar Charts ─── */}
        <CollapsibleSection title="Radar-Übersicht (8 Säulen)" icon={<IconChart size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.PRIMARY }}>
                KI Readiness — 4 Säulen
              </h4>
              <ScoreRadar scores={analysis.kiPillarScores || { kompetenz: 0, tools: 0, steuerung: 0, zukunft: 0 }} pillarNames={KI_PILLAR_NAMES} maxScore={25} color={COLORS.PRIMARY} height={280} />
              <div className="grid grid-cols-2 gap-2 mt-3">
                {Object.entries(KI_PILLAR_NAMES).map(([key, name]) => (
                  <div key={key} className="flex justify-between items-center px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                    <span className="font-bold text-gray-500">{name}</span>
                    <span className="font-black" style={{ color: COLORS.PRIMARY }}>{(analysis.kiPillarScores as any)?.[key] ?? 0}/25</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.ZUKUNFT }}>
                Zukunft Readiness — 4 Dimensionen
              </h4>
              <ScoreRadar scores={analysis.zukunftPillarScores || { zukunftsbild: 0, zukunftsstrategie: 0, zukunftskompetenzen: 0, umsetzung: 0 }} pillarNames={ZUKUNFT_PILLAR_NAMES} maxScore={25} color={COLORS.ZUKUNFT} height={280} />
              <div className="grid grid-cols-2 gap-2 mt-3">
                {Object.entries(ZUKUNFT_PILLAR_NAMES).map(([key, name]) => (
                  <div key={key} className="flex justify-between items-center px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                    <span className="font-bold text-gray-500">{name}</span>
                    <span className="font-black" style={{ color: COLORS.ZUKUNFT }}>{(analysis.zukunftPillarScores as any)?.[key] ?? 0}/25</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* ─── CEC ─── */}
        {analysis.cecData && analysis.cecData.gesamtErgebnis > 0 && (
          <CollapsibleSection title="Wirtschaftlicher KI-Effekt (CEC)" icon={<IconCurrency size={20} />} color="#92400E" defaultOpen={true}>
            <p className="text-xs text-gray-500 font-bold mb-6">
              Basierend auf deinem Stundensatz ({assessment.m2_stundensatz} EUR) und deinen Angaben.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Zeiteinsparung</div>
                <div className="text-lg font-black text-amber-800">{formatEur(analysis.cecData.zeiteinsparungEurJahr)}</div>
                <div className="text-[10px] text-gray-400 font-bold">pro Jahr</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Kosteneinsparung</div>
                <div className="text-lg font-black text-amber-800">{formatEur(analysis.cecData.kosteneinsparungEurJahr)}</div>
                <div className="text-[10px] text-gray-400 font-bold">pro Jahr</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Umsatzsteigerung</div>
                <div className="text-lg font-black text-amber-800">{formatEur(analysis.cecData.umsatzsteigerungEurJahr)}</div>
                <div className="text-[10px] text-gray-400 font-bold">pro Jahr</div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Gesamteffekt durch KI</div>
                <div className="text-2xl font-black text-amber-900">{formatEur(analysis.cecData.gesamtErgebnis)}/Jahr</div>
              </div>
              {analysis.cecData.kiAusgabenJahr > 0 && (
                <div className="text-center px-5 py-2 rounded-xl bg-white border border-amber-200">
                  <div className="text-[10px] font-black text-gray-500 uppercase mb-1">ROI</div>
                  <div className={`text-2xl font-black ${analysis.cecData.roi >= 1 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {analysis.cecData.roi.toFixed(1)}x
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* ─── Alle Assessment-Daten ─── */}
        <CollapsibleSection title="Alle Assessment-Daten" icon={<IconDocument size={20} />}>
          <AssessmentDataSection analysis={analysis} assessment={assessment} isSolo={isSolo} />
        </CollapsibleSection>

        {/* ─── Assessment wiederholen (ganz unten) ─── */}
        <CollapsibleSection title="Assessment wiederholen" icon={<IconClipboard size={20} />}>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 font-bold mb-4">
              Starte ein neues Assessment, um deinen Fortschritt zu messen und aktualisierte Empfehlungen zu erhalten.
            </p>
            <Button onClick={onRepeat} variant="secondary" className="text-[11px] py-3 px-6">
              NEUES ASSESSMENT STARTEN
            </Button>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default DashboardView;
