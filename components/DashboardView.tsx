
import React, { useState, useEffect, useMemo } from 'react';
import { User, Assessment, Analysis, TechEcosystem, ImplementationStyle, PillarScores } from '../types';
import { dbService } from '../services/dbService';
import { exportService } from '../services/exportService';
import { INDUSTRIES, MATURITY_LEVELS } from '../constants';
import PentagonRadar from './RadarChart';
import { Card, Button } from './UIComponents';

interface DashboardViewProps {
  user: User;
  analysis: Analysis | null;
  onRepeat: () => void;
}

const DataRow: React.FC<{ label: string, value: any }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 py-3 gap-2">
    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</span>
    <span className="text-xs font-black text-gray-900 text-left sm:text-right">{value || '—'}</span>
  </div>
);

const Pill: React.FC<{ children: React.ReactNode, color?: string }> = ({ children, color = "bg-gray-100 text-gray-600" }) => (
  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${color}`}>
    {children}
  </span>
);

const SkillBar: React.FC<{ label: string, score: number }> = ({ label, score }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[9px] font-black uppercase text-gray-500">
      <span>{label}</span>
      <span>{score}/10</span>
    </div>
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-primary" style={{ width: `${(score/10)*100}%` }}></div>
    </div>
  </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ user, analysis, onRepeat }) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [benchmark, setBenchmark] = useState<PillarScores | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const ass = await dbService.getAssessment(user.uid);
      setAssessment(ass);
      if (ass?.industry) {
        const bench = await dbService.getIndustryAverages(ass.industry);
        setBenchmark(bench);
      }
    };
    loadData();
  }, [user]);

  const benchmarkDiff = useMemo(() => {
    if (!analysis || !benchmark) return null;
    const userAvg = analysis.overallScore;
    // Fix: Cast Object.values to number[] to resolve 'unknown' arithmetic operation errors (Line 60)
    const benchValues = Object.values(benchmark) as number[];
    const benchAvg = benchValues.reduce((a, b) => a + b, 0) / 5;
    const diff = ((userAvg - benchAvg) / benchAvg) * 100;
    return diff;
  }, [analysis, benchmark]);

  if (!analysis || !assessment) return null;

  const handleDownloadPdf = () => {
    exportService.downloadAsPdf(`KI-Status-Bericht-${user.lastName}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 pb-32 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 no-print">
        <div>
          <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mb-2 block">Auswertung</span>
          <h1 className="text-5xl font-black tracking-tight text-gray-900">Ihr KI-Status Quo</h1>
          <p className="text-gray-800 mt-3 font-bold">Exklusive Auswertung für {user.firstName} {user.lastName}.</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={onRepeat} variant="secondary" className="text-[11px] py-3 px-6">NEUES ASSESSMENT</Button>
          <Button onClick={handleDownloadPdf} className="text-[11px] py-3 px-8 shadow-lg">PDF DOWNLOAD</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
        <Card className="lg:col-span-4 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-burgundy-50/30 rounded-bl-full transition-transform group-hover:scale-110 duration-700 no-print"></div>
          <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest mb-6">GESAMTSCORE</span>
          <div className="text-[120px] font-black mb-4 leading-none tracking-tighter text-primary">{analysis.overallScore.toFixed(1)}</div>
          
          <div className="flex flex-col gap-3 w-full mb-8">
            <div className="px-8 py-3 rounded-full font-black text-[11px] tracking-[0.2em] uppercase bg-burgundy-100 text-primary border-2 border-burgundy-200">
              LEVEL: {analysis.maturityLevel}
            </div>
            
            {benchmarkDiff !== null && (
              <div className={`px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 ${benchmarkDiff >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                {benchmarkDiff >= 0 ? '↑' : '↓'} {Math.abs(benchmarkDiff).toFixed(0)}% {benchmarkDiff >= 0 ? 'über' : 'unter'} Branchenschnitt
              </div>
            )}
          </div>

          <p className="text-sm text-gray-800 max-w-[220px] leading-relaxed font-black">Basierend auf Ihrer Reife in allen 5 Säulen des Programms.</p>
        </Card>

        <Card className="lg:col-span-8 p-12 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Methodik-Fokus & Benchmarking</h3>
            {benchmark && (
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-sm"></div>
                  <span className="text-[9px] font-black text-gray-500 uppercase">Sie</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-sm border border-dashed border-gray-400"></div>
                  <span className="text-[9px] font-black text-gray-500 uppercase">Markt</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
             <PentagonRadar scores={analysis.pillarScores} benchmarkScores={benchmark} />
          </div>
        </Card>
      </div>

      <div className="space-y-20">
        <div className="border-b-4 border-primary pb-4">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Vollständige Assessment-Daten</h2>
          <p className="text-gray-500 font-bold text-sm mt-1">Hier finden Sie alle Angaben, die Sie während des Onboardings gemacht haben.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card className="p-8 space-y-6">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">1. Profil & Branche</h4>
            <div className="space-y-1">
              <DataRow label="Website" value={assessment.companyWebsite} />
              <DataRow label="Branche" value={INDUSTRIES.find(i => i.id === assessment.industry)?.label || assessment.industryOther} />
              <DataRow label="Mitarbeiter" value={assessment.employeeCount} />
              <DataRow label="KI-Nutzer" value={`${assessment.activeAiUsers} Personen`} />
              <div className="pt-4">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2">Bisherige Maßnahmen</span>
                <p className="text-xs font-bold text-gray-700 italic leading-relaxed">"{assessment.existingEfforts || 'Keine Angaben'}"</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">2. Strategischer Status Quo</h4>
            <div className="space-y-1">
              <DataRow label="Reifegrad" value={MATURITY_LEVELS.find(m => m.level === assessment.aiMaturityLevel)?.label} />
              <DataRow label="Digitalisierung" value={assessment.digitizationLevel} />
              <DataRow label="Dokumentation (SOPs)" value={assessment.documentationLevel} />
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">3. Technik & Sicherheit</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">Technisches Ökosystem</span>
                <div className="flex flex-wrap gap-2">
                  {assessment.techEcosystems.map(te => <Pill key={te} color="bg-blue-50 text-blue-700 border border-blue-100">{te.toUpperCase()}</Pill>)}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">Top Software</span>
                <p className="text-xs font-bold text-gray-800">{assessment.topSoftware || 'Nicht spezifiziert'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">Verarbeitete Daten</span>
                <div className="flex flex-wrap gap-2">
                  {assessment.dataTypes.map(dt => <Pill key={dt}>{dt}</Pill>)}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">4. Kompetenz & Kultur</h4>
            <div className="space-y-6">
              <DataRow label="Team-Stimmung" value={assessment.teamMood} />
              <div className="space-y-4 pt-2">
                <SkillBar label="LLM / Prompting" score={assessment.skillLLM} />
                <SkillBar label="Automatisierung" score={assessment.skillAutomation} />
                <SkillBar label="Technik / API" score={assessment.skillTechnical} />
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">5. Ziele & Fokus</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">Fokus</span>
                <div className="flex flex-wrap gap-2">
                  {assessment.goals.map(g => <Pill key={g} color="bg-primary text-white">{g.toUpperCase()}</Pill>)}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block">Potenzial-Bereiche</span>
                <div className="flex flex-wrap gap-2">
                  {assessment.focusAreas.map(fa => <Pill key={fa}>{fa}</Pill>)}
                  {assessment.otherFocusArea && <Pill color="bg-amber-50 text-amber-700 border border-amber-100">{assessment.otherFocusArea}</Pill>}
                </div>
              </div>
              <div className="pt-2">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Größte Hürde</span>
                <p className="text-xs font-bold text-rose-800 italic">"{assessment.biggestHurdle}"</p>
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">6. Ressourcen & Umsetzung</h4>
            <div className="space-y-1">
              <DataRow label="Zeitinvest / Woche" value={assessment.weeklyTimeInvest} />
              <DataRow label="Tool-Budget / Monat" value={`${assessment.monthlyBudget} €`} />
              <DataRow label="Stil" value={assessment.implementationStyle === ImplementationStyle.DIY ? 'DIY' : assessment.implementationStyle === ImplementationStyle.SUPPORT ? 'Unterstützung' : 'Full Service'} />
              {assessment.implementationStyle === ImplementationStyle.FULL_SERVICE && (
                <DataRow label="Service-Budget" value={`${assessment.freelancerBudget?.toLocaleString('de-DE')} €`} />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
