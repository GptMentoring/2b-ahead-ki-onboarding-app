
import React, { useState, useEffect, useMemo } from 'react';
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
import { CollapsibleSection, analyzePillars, generateTodos, getNextLevelInfo, formatEur, generateCelebrationLine } from './dashboard/shared';
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

interface DashboardViewProps {
  user: User;
  analysis: Analysis | null;
  istAnalyseProfile?: IstAnalyseProfile | null;
  onRepeat: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD VIEW — 3-Screen Layout
// ═══════════════════════════════════════════════════════════════════

const DashboardView: React.FC<DashboardViewProps> = ({ user, analysis, istAnalyseProfile, onRepeat }) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [showKiDetail, setShowKiDetail] = useState(false);
  const [showZukunftDetail, setShowZukunftDetail] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleChecked = (key: string) => setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const loadData = async () => {
      const ass = await dbService.getAssessment(user.uid);
      setAssessment(ass);
    };
    loadData();
  }, [user]);

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

  if (!analysis || !assessment) return null;

  const isSolo = assessment.m1_solo === 'solo';

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 pb-32 animate-in fade-in duration-1000">

      {/* ═══════════════════════════════════════════════════════════
          SCREEN 1: SCORE HERO (above the fold)
          ═══════════════════════════════════════════════════════════ */}

      {/* ─── Header ─── */}
      <header className="mb-10 no-print">
        <span className="text-[11px] font-black uppercase tracking-[0.4em] mb-2 block" style={{ color: COLORS.PRIMARY }}>
          Persönliche Auswertung
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
          Hallo {user.firstName}, hier ist dein Status Quo.
        </h1>
        {celebrationLine && (
          <p className="text-sm font-black mt-2" style={{ color: COLORS.SUCCESS }}>
            {celebrationLine}
          </p>
        )}
        <p className="text-gray-500 mt-3 font-bold text-sm">
          {isSolo ? 'Solo-Selbstständig' : 'Team/Unternehmen'} — Assessment vom {new Date(analysis.createdAt).toLocaleDateString('de-DE')}
        </p>
      </header>

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

      {/* ─── ROI Highlight ─── */}
      <ROICard analysis={analysis} />

      {/* ─── Zukunft-Risiko ─── */}
      <ZukunftRisikoCard analysis={analysis} />

      {/* ─── KI Ist-Analyse: CTA oder Profil (above the fold) ─── */}
      {!user.istAnalyseCompleted ? (
        <Card className="p-6 md:p-8 mb-8 border-2 no-print" style={{ borderColor: COLORS.SUCCESS }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-gray-400"><IconClipboard size={28} /></span>
              <div>
                <h3 className="text-base font-black text-gray-900 mb-1">
                  Vervollständige dein Profil
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Die KI Ist-Analyse personalisiert dein Erlebnis: passende Tools, Blueprints und Sessions. <strong>~10 Min.</strong>
                </p>
              </div>
            </div>
            <Button
              onClick={() => { window.location.hash = '/ist-analyse'; }}
              className="whitespace-nowrap"
            >
              KI Ist-Analyse starten
            </Button>
          </div>
        </Card>
      ) : istAnalyseProfile ? (
        <div className="mb-8">
          <IstAnalyseProfileSection profile={istAnalyseProfile} />
        </div>
      ) : null}

      {/* ─── Session-Brücke ─── */}
      {istAnalyseProfile?.sessionEmpfehlung && (
        <SessionBridgeCard
          sessionEmpfehlung={istAnalyseProfile.sessionEmpfehlung}
          potentials={potentials}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          SCREEN 2: DEIN PLAN (Empfehlung + Quick-Wins)
          ═══════════════════════════════════════════════════════════ */}

      {/* ─── Produkt-Empfehlung ─── */}
      <RecommendationCard analysis={analysis} />

      {/* ─── Top-3 Quick-Wins ─── */}
      <QuickWinsSection todos={todos} />

      {/* ─── Stärken & Potenziale ─── */}
      <StrengthsPotentials strengths={strengths} potentials={potentials} />

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

      {/* ─── Detail Panels (expandable) ─── */}
      <DetailPanels
        analysis={analysis}
        assessment={assessment}
        isSolo={isSolo}
        showKiDetail={showKiDetail}
        showZukunftDetail={showZukunftDetail}
      />


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
          <CollapsibleSection title="Wirtschaftlicher KI-Effekt (CEC)" icon={<IconCurrency size={20} />} color="#92400E">
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
