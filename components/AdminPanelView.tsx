
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Assessment, Analysis, ImplementationStyle } from '../types';
import { dbService } from '../services/dbService';
import { geminiService } from '../services/geminiService';
import { COLORS, INDUSTRIES, MATURITY_LEVELS, FOCUS_AREAS_OPTIONS } from '../constants';
import PentagonRadar from './RadarChart';
import { Card, Button } from './UIComponents';

const DataField: React.FC<{ label: string, value: any, fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
  <div className={`py-3 border-b border-gray-100 flex flex-col gap-1 ${fullWidth ? 'col-span-full' : ''}`}>
    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-bold text-gray-900 leading-relaxed">{value || '—'}</span>
  </div>
);

const SkillLevel: React.FC<{ label: string, score: number }> = ({ label, score }) => (
  <div className="py-2">
    <div className="flex justify-between items-center mb-1">
      <span className="text-[9px] font-black text-gray-500 uppercase tracking-tight">{label}</span>
      <span className="text-[10px] font-black text-primary">{score}/10</span>
    </div>
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-primary" style={{ width: `${(score / 10) * 100}%` }}></div>
    </div>
  </div>
);

const Pill: React.FC<{ children: React.ReactNode, color?: string }> = ({ children, color = "bg-gray-100 text-gray-600" }) => (
  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ${color}`}>
    {children}
  </span>
);

const AdminPanelView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFocus, setFilterFocus] = useState<string>('all');
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [restrictionFilter, setRestrictionFilter] = useState<string>('all');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<{ user: User, analysis?: Analysis, assessment?: Assessment } | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'budget' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const u = await dbService.getAllUsers();
      const a = await dbService.getAllAnalyses();
      const allAssessments = await Promise.all(u.map(usr => dbService.getAssessment(usr.uid)));
      setUsers(u);
      setAnalyses(a);
      setAssessments(allAssessments.filter((ass): ass is Assessment => ass !== null));
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runPortfolioAnalysis = async () => {
    setIsAnalyzing(true);
    const hurdles = assessments.map(a => a.biggestHurdle).filter(h => h && h.length > 5);
    const summary = await geminiService.getPortfolioSummary(hurdles);
    setAiSummary(summary);
    setIsAnalyzing(false);
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    const term = searchTerm.toLowerCase().trim();

    if (term) {
      result = result.filter(u => {
        const ass = assessments.find(as => as.userId === u.uid);
        const industryLabel = INDUSTRIES.find(i => i.id === ass?.industry)?.label || '';
        return (
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          industryLabel.toLowerCase().includes(term) ||
          ass?.companyWebsite?.toLowerCase().includes(term)
        );
      });
    }

    if (filterFocus !== 'all') {
      result = result.filter(u => {
        const ass = assessments.find(as => as.userId === u.uid);
        const focusArea = FOCUS_AREAS_OPTIONS.find(f => f.id === filterFocus);
        return focusArea && ass?.focusAreas.includes(focusArea.id);
      });
    }

    if (filterGoal !== 'all') {
      result = result.filter(u => {
        const ass = assessments.find(as => as.userId === u.uid);
        return ass?.goals.includes(filterGoal as any);
      });
    }

    if (restrictionFilter !== 'all') {
      result = result.filter(u => {
        const ass = assessments.find(as => as.userId === u.uid);
        return ass?.q0_4_restrictions === restrictionFilter;
      });
    }

    // Sortierung
    const sorted = [...result].sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'score':
          const scoreA = analyses.find(an => an.userId === a.uid)?.overallScore || 0;
          const scoreB = analyses.find(an => an.userId === b.uid)?.overallScore || 0;
          compareValue = scoreB - scoreA;
          break;
        case 'budget':
          const budgetA = assessments.find(as => as.userId === a.uid)?.monthlyBudget || 0;
          const budgetB = assessments.find(as => as.userId === b.uid)?.monthlyBudget || 0;
          compareValue = budgetB - budgetA;
          break;
        case 'date':
          compareValue = b.createdAt - a.createdAt;
          break;
      }

      return sortOrder === 'asc' ? -compareValue : compareValue;
    });

    return sorted;
  }, [users, searchTerm, assessments, filterFocus, filterGoal, restrictionFilter, sortBy, sortOrder, analyses]);

  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      alert('Keine Daten zum Exportieren vorhanden.');
      return;
    }

    // CSV Header
    const headers = [
      'Name',
      'E-Mail',
      'Rolle',
      'Solo/Team',
      'KI-Kenntnisse',
      'Tools',
      'Einschränkungen',
      'Branche',
      'Reifegrad',
      'Overall Score',
      'Kompetenz',
      'Tools Score',
      'Steuerung',
      'Produkte',
      'Strategie',
      'Fokus-Bereiche',
      'Budget',
      'Use-Case',
      'Registriert am',
      'Assessment abgeschlossen'
    ];

    // CSV Rows
    const rows = filteredUsers.map(user => {
      const ass = assessments.find(a => a.userId === user.uid);
      const ana = analyses.find(a => a.userId === user.uid);

      return [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role === 'OWNER' ? 'Unternehmer' : user.role === 'EXECUTIVE' ? 'Führungskraft' : 'Projektmanager',
        ass?.q0_1_solo === 'solo' ? 'Solo' : ass?.q0_1_solo === 'team' ? 'Team' : '',
        ass?.q0_2_experience !== undefined ? `Level ${ass.q0_2_experience}` : '',
        ass?.q0_3_tools?.join(', ') || '',
        ass?.q0_4_restrictions || '',
        ass?.industry ? (INDUSTRIES.find(i => i.id === ass.industry)?.label || ass.industryOther || '') : '',
        ana?.maturityLevel || '',
        ana?.overallScore?.toFixed(1) || '',
        ana?.pillarScores?.kompetenz?.toFixed(1) || '',
        ana?.pillarScores?.tools?.toFixed(1) || '',
        ana?.pillarScores?.steuerung?.toFixed(1) || '',
        ana?.pillarScores?.produkte?.toFixed(1) || '',
        ana?.pillarScores?.strategie?.toFixed(1) || '',
        ass?.focusAreas?.map(id => {
          const area = FOCUS_AREAS_OPTIONS.find(a => a.id === id);
          return area?.label || id;
        }).join(', ') || '',
        ass?.monthlyBudget ? `${ass.monthlyBudget}€` : '0€',
        ass?.q7_1_usecase?.replace(/\n/g, ' ') || '',
        new Date(user.createdAt).toLocaleDateString('de-DE'),
        user.assessmentCompleted ? 'Ja' : 'Nein'
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    // Create download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `ki-onboarding-teilnehmer-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triageData = useMemo(() => {
    return filteredUsers.map(u => {
      const ass = assessments.find(a => a.userId === u.uid);
      const isHighPotential = (ass?.monthlyBudget || 0) >= 1000 && (ass?.aiMaturityLevel || 0) <= 2;
      const isAtRisk = ass?.teamMood === 'Ablehnung';
      return { uid: u.uid, isHighPotential, isAtRisk };
    });
  }, [filteredUsers, assessments]);

  const avgScore = useMemo(() => analyses.length ? (analyses.reduce((acc, curr) => acc + curr.overallScore, 0) / analyses.length).toFixed(1) : "0.0", [analyses]);

  return (
    <div className="max-w-7xl mx-auto p-12 pb-32 animate-in fade-in duration-1000 relative">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-[11px] font-black text-amber-800 uppercase tracking-[0.4em] mb-2 block">Management Cockpit</span>
          <h1 className="text-5xl font-black tracking-tight text-gray-900">Portfolio Intelligence</h1>
        </div>
        <div className="flex gap-4 no-print">
          <Button onClick={fetchData} variant="secondary" className="text-xs">AKTUALISIEREN</Button>
          <Button onClick={runPortfolioAnalysis} variant="admin" className="text-xs" disabled={isAnalyzing}>
            {isAnalyzing ? 'ANALYSIERE...' : 'PORTFOLIO ANALYSE STARTEN'}
          </Button>
        </div>
      </header>

      {/* Global AI Insights Section */}
      {aiSummary && (
        <Card className="mb-12 p-10 border-2 border-amber-200 bg-amber-50/30 relative overflow-hidden group animate-in slide-in-from-top-10 duration-700">
          <div className="absolute top-0 right-0 p-8 text-7xl opacity-5 select-none group-hover:scale-110 transition-transform">🧠</div>
          <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            KI-Gesamtportfolio Analyse
          </h3>
          <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:text-[10px] prose-headings:tracking-widest prose-headings:text-amber-800">
            <div className="text-sm font-bold text-gray-800 leading-relaxed whitespace-pre-wrap">
              {aiSummary}
            </div>
          </div>
          <button onClick={() => setAiSummary(null)} className="absolute top-6 right-6 text-amber-900/40 hover:text-amber-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </Card>
      )}

      {/* Search Input */}
      <div className="mb-12">
        <input
          type="text"
          placeholder="Suche nach Name oder E-Mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-4 text-sm font-bold bg-white border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'High Potential', val: triageData.filter(d => d.isHighPotential).length.toString(), color: 'text-amber-600', icon: '🔥', desc: 'Budget + Start-Level' },
          { label: 'At Risk', val: triageData.filter(d => d.isAtRisk).length.toString(), color: 'text-rose-600', icon: '⚠️', desc: 'Kritische Stimmung' },
          { label: 'Ø Gesamtscore', val: avgScore, color: 'text-indigo-800', icon: '🏆', desc: 'Portfolio-Schnitt' },
          { label: 'Analysen', val: analyses.length.toString(), color: 'text-emerald-800', icon: '📊', desc: 'Ready for Coaching' }
        ].map(kpi => (
          <Card key={kpi.label} className="p-8 border-2 border-gray-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-[-10px] right-[-10px] text-4xl opacity-10 group-hover:scale-125 transition-transform">{kpi.icon}</div>
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className={`text-4xl font-black py-1 ${kpi.color}`}>{kpi.val}</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{kpi.desc}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-primary pb-5 gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-gray-900">Teilnehmer-Management</h2>
            <span className="px-4 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {filteredUsers.length} Profile
            </span>
          </div>

          <div className="flex flex-wrap gap-4 no-print">
            <select
              className="px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none"
              value={filterFocus}
              onChange={(e) => setFilterFocus(e.target.value)}
            >
              <option value="all">Fokus: Alle Bereiche</option>
              {FOCUS_AREAS_OPTIONS.map(area => <option key={area.id} value={area.id}>{area.icon} {area.label}</option>)}
            </select>
            <select
              className="px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none"
              value={filterGoal}
              onChange={(e) => setFilterGoal(e.target.value)}
            >
              <option value="all">Ziel: Alle</option>
              <option value="efficiency">EFFIZIENZ</option>
              <option value="innovation">INNOVATION</option>
            </select>
            <select
              className="px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none"
              value={restrictionFilter}
              onChange={(e) => setRestrictionFilter(e.target.value)}
            >
              <option value="all">Einschränkungen: Alle</option>
              <option value="none">Keine Einschränkungen</option>
              <option value="microsoft">Nur Microsoft Copilot</option>
              <option value="google">Nur Google Gemini</option>
              <option value="free">Nur kostenlose Tools</option>
              <option value="blocked">KI komplett blockiert</option>
            </select>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="whitespace-nowrap"
            >
              📥 CSV Export
            </Button>
          </div>
        </div>

        {/* Participant Table */}
        <Card className="overflow-hidden border-2 border-gray-100 shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-8 py-6">
                  <button
                    onClick={() => {
                      if (sortBy === 'name') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('name');
                        setSortOrder('asc');
                      }
                    }}
                    className="text-[11px] font-black text-gray-500 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1"
                  >
                    Teilnehmer & Triage
                    {sortBy === 'name' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                </th>
                <th className="px-8 py-6">
                  <button
                    onClick={() => {
                      if (sortBy === 'budget') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('budget');
                        setSortOrder('desc');
                      }
                    }}
                    className="text-[11px] font-black text-gray-500 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1"
                  >
                    Reife / Status
                    {sortBy === 'budget' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                </th>
                <th className="px-8 py-6">
                  <button
                    onClick={() => {
                      if (sortBy === 'score') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('score');
                        setSortOrder('desc');
                      }
                    }}
                    className="text-[11px] font-black text-gray-500 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1 mx-auto"
                  >
                    Score
                    {sortBy === 'score' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                </th>
                <th className="px-8 py-6">
                  <button
                    onClick={() => {
                      if (sortBy === 'date') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('date');
                        setSortOrder('desc');
                      }
                    }}
                    className="text-[11px] font-black text-gray-500 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1 ml-auto"
                  >
                    Fokus
                    {sortBy === 'date' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-5xl">🔍</span>
                      <p className="text-gray-400 font-black uppercase tracking-widest">Keine Übereinstimmungen.</p>
                      <Button onClick={() => { setSearchTerm(''); setFilterFocus('all'); setFilterGoal('all'); setRestrictionFilter('all'); }} variant="secondary" className="text-xs">FILTER LÖSCHEN</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const userAnalysis = analyses.find(a => a.userId === u.uid);
                  const userAssessment = assessments.find(a => a.userId === u.uid);
                  const triage = triageData.find(d => d.uid === u.uid);

                  return (
                    <tr key={u.uid} className="hover:bg-amber-50/20 transition-all cursor-pointer group" onClick={() => setSelectedEntry({ user: u, analysis: userAnalysis, assessment: userAssessment })}>
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-3">
                          <div className="font-black text-gray-900 group-hover:text-primary transition-colors">{u.firstName} {u.lastName}</div>
                          {triage?.isHighPotential && <span title="High Potential - Budget & Start Level" className="text-lg">🔥</span>}
                          {triage?.isAtRisk && <span title="At Risk - Kritische Stimmung" className="text-lg">⚠️</span>}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{u.email}</div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col gap-1">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-200 bg-white w-fit shadow-sm`}>
                            {userAnalysis?.maturityLevel || 'Ausstehend'}
                          </span>
                          {userAssessment && (
                            <span className="text-[9px] font-bold text-gray-400 ml-1">Budget: {userAssessment.monthlyBudget}€/Monat</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-7 text-center">
                        <div className="text-2xl font-black text-primary">{userAnalysis?.overallScore.toFixed(1) || '—'}</div>
                      </td>
                      <td className="px-8 py-7 text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {userAssessment?.focusAreas.slice(0, 2).map(fa => <Pill key={fa}>{fa}</Pill>)}
                          {userAssessment?.focusAreas.length! > 2 && <Pill color="bg-gray-200">+{userAssessment?.focusAreas.length! - 2}</Pill>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* User Detail Modal - Expanded Audit Trail */}
      {selectedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-burgundy-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-6xl max-h-[95vh] overflow-y-auto p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl">
            <button onClick={() => setSelectedEntry(null)} className="fixed sm:absolute top-4 sm:top-8 right-4 sm:right-8 p-3 rounded-2xl bg-white border border-gray-200 shadow-md hover:bg-rose-100 hover:text-rose-600 transition-colors z-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-12">
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Audit Trail / Kunden-Audit</span>
              <h2 className="text-4xl font-black text-gray-900 mt-2">{selectedEntry.user.firstName} {selectedEntry.user.lastName}</h2>
              <p className="text-gray-500 font-bold">{selectedEntry.user.email} • Registriert {new Date(selectedEntry.user.createdAt).toLocaleString('de-DE')}</p>
            </div>

            {!selectedEntry.assessment ? (
              <div className="p-20 text-center text-gray-400 font-black uppercase tracking-widest border-4 border-dashed rounded-[32px]">Nutzer hat das Assessment noch nicht gestartet.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-10">
                  <div className="bg-gray-50 rounded-[40px] p-8 border border-gray-100">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest text-center mb-6">Pentagon Score</h4>
                    {selectedEntry.analysis ? (
                      <div className="scale-75 -mx-8"><PentagonRadar scores={selectedEntry.analysis.pillarScores} /></div>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-gray-300 font-black uppercase">Ausstehend</div>
                    )}
                    <div className="mt-6 flex flex-col gap-2">
                       <div className="flex justify-between items-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Maturity Level</span>
                          <span className="text-xs font-black text-primary">{selectedEntry.analysis?.maturityLevel || 'N/A'}</span>
                       </div>
                       <div className="flex justify-between items-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                          <span className="text-[10px] font-black text-gray-400 uppercase">Gesamtscore</span>
                          <span className="text-xs font-black text-primary">{selectedEntry.analysis?.overallScore.toFixed(1) || '0.0'} / 5.0</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Modul 4: Kompetenz-Check</h5>
                    <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm space-y-4">
                      <SkillLevel label="LLM / Prompting" score={selectedEntry.assessment.skillLLM} />
                      <SkillLevel label="Automatisierung" score={selectedEntry.assessment.skillAutomation} />
                      <SkillLevel label="Technik / API" score={selectedEntry.assessment.skillTechnical} />
                      <DataField label="Team-Stimmung" value={selectedEntry.assessment.teamMood} />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Modul 0: Vorkenntnisse</h5>
                      <div className="space-y-4">
                        {/* Solo/Team */}
                        {selectedEntry.assessment.q0_1_solo && (
                          <div>
                            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Arbeitsweise</div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-black ${selectedEntry.assessment.q0_1_solo === 'solo' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                {selectedEntry.assessment.q0_1_solo === 'solo' ? '👤 Solo-Selbstständig' : '👥 Im Team/Unternehmen'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Experience Level */}
                        {selectedEntry.assessment.q0_2_experience !== undefined && (
                          <div>
                            <div className="text-xs text-gray-500 font-bold uppercase mb-1">KI-Kenntnisse</div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {[0, 1, 2, 3, 4].map(level => (
                                  <div
                                    key={level}
                                    className={`w-3 h-8 rounded ${level <= selectedEntry.assessment.q0_2_experience! ? 'bg-primary' : 'bg-gray-200'}`}
                                    style={{ backgroundColor: level <= selectedEntry.assessment.q0_2_experience! ? '#64162D' : undefined }}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-bold">
                                Level {selectedEntry.assessment.q0_2_experience}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Tools Used */}
                        {selectedEntry.assessment.q0_3_tools && selectedEntry.assessment.q0_3_tools.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 font-bold uppercase mb-2">Genutzte Tools</div>
                            <div className="flex flex-wrap gap-2">
                              {selectedEntry.assessment.q0_3_tools.map(tool => {
                                const toolLabels: Record<string, string> = {
                                  'chatgpt': '🤖 ChatGPT',
                                  'claude': '🧠 Claude',
                                  'gemini': '✨ Gemini',
                                  'copilot': '💼 Copilot',
                                  'midjourney': '🎨 Midjourney/DALL-E',
                                  'other': '🔧 Andere',
                                  'none': '❌ Noch keine'
                                };
                                return (
                                  <span key={tool} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold">
                                    {toolLabels[tool] || tool}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Restrictions */}
                        {selectedEntry.assessment.q0_4_restrictions && (
                          <div>
                            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Tool-Einschränkungen</div>
                            <div>
                              {(() => {
                                const restrictionLabels: Record<string, { label: string; color: string }> = {
                                  'none': { label: '✅ Keine Einschränkungen', color: 'bg-green-100 text-green-800' },
                                  'microsoft': { label: '🔒 Nur Microsoft Copilot', color: 'bg-blue-100 text-blue-800' },
                                  'google': { label: '🔒 Nur Google Gemini', color: 'bg-purple-100 text-purple-800' },
                                  'free': { label: '💰 Nur kostenlose Tools', color: 'bg-amber-100 text-amber-800' },
                                  'blocked': { label: '🚫 KI komplett blockiert', color: 'bg-red-100 text-red-800' }
                                };
                                const restriction = restrictionLabels[selectedEntry.assessment.q0_4_restrictions!] || { label: selectedEntry.assessment.q0_4_restrictions!, color: 'bg-gray-100' };
                                return (
                                  <span className={`px-3 py-1 rounded-full text-xs font-black ${restriction.color}`}>
                                    {restriction.label}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Modul 1 & 2: Profil & Strategie</h5>
                      <div className="space-y-2">
                        <DataField label="Website" value={selectedEntry.assessment.companyWebsite} />
                        <DataField label="Branche" value={INDUSTRIES.find(i => i.id === selectedEntry.assessment?.industry)?.label || selectedEntry.assessment.industryOther} />
                        <DataField label="Mitarbeiter" value={selectedEntry.assessment.employeeCount} />
                        <DataField label="Aktive KI-Nutzer" value={selectedEntry.assessment.activeAiUsers} />
                        <DataField label="Bisherige Maßnahmen" value={selectedEntry.assessment.existingEfforts} fullWidth />
                        <DataField label="Digitalisierungsgrad" value={selectedEntry.assessment.digitizationLevel} />
                        <DataField label="Dokumentationsgrad" value={selectedEntry.assessment.documentationLevel} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Modul 3: Technik-Stack</h5>
                      <div className="space-y-2">
                        <div className="py-2 border-b border-gray-100 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ökosysteme</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedEntry.assessment.techEcosystems.map(te => <Pill key={te} color="bg-blue-50 text-blue-700">{te.toUpperCase()}</Pill>)}
                          </div>
                        </div>
                        <DataField label="Top Software" value={selectedEntry.assessment.topSoftware} fullWidth />
                        <div className="py-2 border-b border-gray-100 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Verarbeitete Daten</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedEntry.assessment.dataTypes.map(dt => <Pill key={dt}>{dt}</Pill>)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modul 7: Konkreter Use-Case */}
                    {selectedEntry.assessment.q7_1_usecase && (
                      <div className="md:col-span-2 space-y-6">
                        <h5 className="text-[10px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Modul 7: Konkreter Use-Case</h5>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-100">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">💡</div>
                            <div className="flex-1">
                              <div className="text-xs font-black uppercase tracking-wider text-green-700 mb-2">
                                Gewünschter Workflow
                              </div>
                              <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {selectedEntry.assessment.q7_1_usecase}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 italic">
                          💭 Dieser Use-Case kann für personalisierte Empfehlungen genutzt werden
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Modul 5: Ziele & Fokus</h5>
                      <div className="space-y-2">
                        <div className="py-2 border-b border-gray-100 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Primäre Ziele</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedEntry.assessment.goals.map(g => <Pill key={g} color="bg-primary text-white">{g.toUpperCase()}</Pill>)}
                          </div>
                        </div>
                        <div className="py-2 border-b border-gray-100 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fokus-Bereiche</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedEntry.assessment.focusAreas.map(fa => <Pill key={fa}>{fa}</Pill>)}
                            {selectedEntry.assessment.otherFocusArea && <Pill color="bg-amber-100 text-amber-800">{selectedEntry.assessment.otherFocusArea}</Pill>}
                          </div>
                        </div>
                        <DataField label="Größte Hürde" value={selectedEntry.assessment.biggestHurdle} fullWidth />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h5 className="text-[10px] font-black text-primary uppercase tracking-widest border-l-4 border-primary pl-3">Modul 6: Ressourcen</h5>
                      <div className="space-y-2">
                        <DataField label="Zeitinvest / Woche" value={selectedEntry.assessment.weeklyTimeInvest} />
                        <DataField label="Tool-Budget / Monat" value={`${selectedEntry.assessment.monthlyBudget} €`} />
                        <DataField label="Umsetzungs-Stil" value={selectedEntry.assessment.implementationStyle} />
                        {selectedEntry.assessment.implementationStyle === ImplementationStyle.FULL_SERVICE && (
                          <DataField label="Service-Budget" value={`${selectedEntry.assessment.freelancerBudget?.toLocaleString('de-DE')} €`} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPanelView;
