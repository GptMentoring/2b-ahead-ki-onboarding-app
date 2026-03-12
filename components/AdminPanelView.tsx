
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Assessment, Analysis, IstAnalyseProfile } from '../types';
import { dbService } from '../services/dbService';
import {
  COLORS, KI_PILLAR_NAMES, ZUKUNFT_PILLAR_NAMES,
  KI_MATURITY_LEVELS, ZUKUNFT_MATURITY_LEVELS,
  KI_QUESTIONS, ZUKUNFT_QUESTIONS
} from '../constants';
import ScoreRadar from './RadarChart';
import { Card, Button } from './UIComponents';
import { IconUsers, IconChart, IconRobot, IconCompass, IconCheckCircle } from './Icons';

// ─── Hilfskomponenten ───────────────────────────────────────────

const DataField: React.FC<{ label: string; value: any; fullWidth?: boolean }> = ({ label, value, fullWidth }) => (
  <div className={`py-3 border-b border-gray-100 flex flex-col gap-1 ${fullWidth ? 'col-span-full' : ''}`}>
    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-bold text-gray-900 leading-relaxed">{value || '—'}</span>
  </div>
);

const Pill: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "bg-gray-100 text-gray-600" }) => (
  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ${color}`}>
    {children}
  </span>
);

function formatEur(val: number): string {
  return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN PANEL VIEW
// ═══════════════════════════════════════════════════════════════════

const AdminPanelView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [profiles, setProfiles] = useState<IstAnalyseProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSolo, setFilterSolo] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<{ user: User; analysis?: Analysis; assessment?: Assessment; profile?: IstAnalyseProfile } | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'ki' | 'zukunft' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const u = await dbService.getAllUsers();
      const a = await dbService.getAllAnalyses();
      const allAssessments = await Promise.all(u.map(usr => dbService.getAssessment(usr.uid)));
      const allProfiles = await Promise.all(u.map(usr => dbService.getIstAnalyseProfile(usr.uid)));
      setUsers(u);
      setAnalyses(a);
      setAssessments(allAssessments.filter((ass): ass is Assessment => ass !== null));
      setProfiles(allProfiles.filter((p): p is IstAnalyseProfile => p !== null));
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = useMemo(() => {
    let result = users;
    const term = searchTerm.toLowerCase().trim();

    if (term) {
      result = result.filter(u =>
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }

    if (filterSolo !== 'all') {
      result = result.filter(u => {
        const ass = assessments.find(a => a.userId === u.uid);
        return ass?.m1_solo === filterSolo;
      });
    }

    const sorted = [...result].sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'name':
          compareValue = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'ki':
          const kiA = analyses.find(an => an.userId === a.uid)?.kiScore || 0;
          const kiB = analyses.find(an => an.userId === b.uid)?.kiScore || 0;
          compareValue = kiB - kiA;
          break;
        case 'zukunft':
          const zA = analyses.find(an => an.userId === a.uid)?.zukunftScore || 0;
          const zB = analyses.find(an => an.userId === b.uid)?.zukunftScore || 0;
          compareValue = zB - zA;
          break;
        case 'date':
          compareValue = b.createdAt - a.createdAt;
          break;
      }
      return sortOrder === 'asc' ? -compareValue : compareValue;
    });

    return sorted;
  }, [users, searchTerm, assessments, filterSolo, sortBy, sortOrder, analyses]);

  // CSV Export
  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      alert('Keine Daten zum Exportieren vorhanden.');
      return;
    }

    const headers = [
      'Name', 'E-Mail', 'Solo/Team', 'Stundensatz', 'Jahresumsatz', 'Einschränkungen',
      'KI Score', 'KI Stufe', 'KI Kompetenz', 'KI Tools', 'KI Steuerung', 'KI Zukunftsfähigkeit', 'KI Bonus',
      'Zukunft Score', 'Zukunft Stufe', 'Zukunftsbild', 'Zukunftsstrategie', 'Zukunftskompetenzen', 'Umsetzung',
      'CEC Zeiteinsparung', 'CEC Kosteneinsparung', 'CEC Umsatzsteigerung', 'CEC Gesamt', 'CEC ROI',
      'Profil Quadrant', 'Profil Persona', 'Profil Produkt', 'Profil Blueprint Top3',
      'Registriert am', 'Assessment abgeschlossen', 'KI Ist-Analyse abgeschlossen'
    ];

    const rows = filteredUsers.map(user => {
      const ass = assessments.find(a => a.userId === user.uid);
      const ana = analyses.find(a => a.userId === user.uid);
      const prof = profiles.find(p => p.userId === user.uid);

      return [
        `${user.firstName} ${user.lastName}`,
        user.email,
        ass?.m1_solo === 'solo' ? 'Solo' : ass?.m1_solo === 'team' ? 'Team' : '',
        ass?.m2_stundensatz?.toString() || '',
        ass?.m3_jahresumsatz || '',
        ass?.m4_einschraenkungen || '',
        ana?.kiScore?.toString() || '',
        ana?.kiMaturityName || '',
        ana?.kiPillarScores?.kompetenz?.toString() || '',
        ana?.kiPillarScores?.tools?.toString() || '',
        ana?.kiPillarScores?.steuerung?.toString() || '',
        ana?.kiPillarScores?.zukunft?.toString() || '',
        ana?.kiBonusScore?.toString() || '',
        ana?.zukunftScore?.toString() || '',
        ana?.zukunftMaturityName || '',
        ana?.zukunftPillarScores?.zukunftsbild?.toString() || '',
        ana?.zukunftPillarScores?.zukunftsstrategie?.toString() || '',
        ana?.zukunftPillarScores?.zukunftskompetenzen?.toString() || '',
        ana?.zukunftPillarScores?.umsetzung?.toString() || '',
        ana?.cecData?.zeiteinsparungEurJahr?.toString() || '',
        ana?.cecData?.kosteneinsparungEurJahr?.toString() || '',
        ana?.cecData?.umsatzsteigerungEurJahr?.toString() || '',
        ana?.cecData?.gesamtErgebnis?.toString() || '',
        ana?.cecData?.roi?.toFixed(1) || '',
        prof?.quadrant || '',
        prof?.persona || '',
        prof?.produktEmpfehlung || '',
        prof?.blueprintEmpfehlungen?.join(', ') || '',
        new Date(user.createdAt).toLocaleDateString('de-DE'),
        user.assessmentCompleted ? 'Ja' : 'Nein',
        user.istAnalyseCompleted ? 'Ja' : 'Nein'
      ];
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `ki-zukunft-assessment-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI Averages
  const avgKiScore = useMemo(() =>
    analyses.length ? (analyses.reduce((acc, curr) => acc + (curr.kiScore || 0), 0) / analyses.length).toFixed(0) : "0",
    [analyses]);
  const avgZukunftScore = useMemo(() =>
    analyses.length ? (analyses.reduce((acc, curr) => acc + (curr.zukunftScore || 0), 0) / analyses.length).toFixed(0) : "0",
    [analyses]);

  // Sort Handler
  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const SortHeader: React.FC<{ col: typeof sortBy; children: React.ReactNode }> = ({ col, children }) => (
    <button
      onClick={() => handleSort(col)}
      className="text-[11px] font-black text-gray-500 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1"
    >
      {children}
      {sortBy === col && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto p-12 pb-32 animate-in fade-in duration-1000 relative">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-[11px] font-black text-amber-800 uppercase tracking-[0.4em] mb-2 block">Management Cockpit</span>
          <h1 className="text-5xl font-black tracking-tight text-gray-900">Portfolio Intelligence</h1>
        </div>
        <div className="flex gap-4 no-print">
          <Button onClick={fetchData} variant="secondary" className="text-xs">AKTUALISIEREN</Button>
        </div>
      </header>

      {/* Search */}
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
          { label: 'Teilnehmer', val: users.length.toString(), color: 'text-gray-800', icon: <IconUsers size={32} />, desc: 'Registriert' },
          { label: 'Assessments', val: analyses.length.toString(), color: 'text-emerald-800', icon: <IconChart size={32} />, desc: 'Abgeschlossen' },
          { label: 'Ø KI Score', val: avgKiScore, color: COLORS.PRIMARY, icon: <IconRobot size={32} />, desc: 'von 100' },
          { label: 'Ø Zukunft Score', val: avgZukunftScore, color: COLORS.ZUKUNFT, icon: <IconCompass size={32} />, desc: 'von 100' },
        ].map(kpi => (
          <Card key={kpi.label} className="p-8 border-2 border-gray-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-[-10px] right-[-10px] opacity-10 group-hover:scale-125 transition-transform text-gray-400">{kpi.icon}</div>
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p
              className={`text-4xl font-black py-1 ${typeof kpi.color === 'string' && !kpi.color.startsWith('#') ? kpi.color : ''}`}
              style={{ color: typeof kpi.color === 'string' && kpi.color.startsWith('#') ? kpi.color : undefined }}>
              {kpi.val}
            </p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{kpi.desc}</p>
          </Card>
        ))}
      </div>

      {/* Table Header + Filters */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-primary pb-5 gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-gray-900">Teilnehmer</h2>
            <span className="px-4 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {filteredUsers.length} Profile
            </span>
          </div>

          <div className="flex flex-wrap gap-4 no-print">
            <select
              className="px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none"
              value={filterSolo}
              onChange={(e) => setFilterSolo(e.target.value)}
            >
              <option value="all">Alle (Solo+Team)</option>
              <option value="solo">Solo-Selbstständig</option>
              <option value="team">Team/Unternehmen</option>
            </select>
            <Button onClick={exportToCSV} variant="outline" className="whitespace-nowrap">
              CSV Export
            </Button>
          </div>
        </div>

        {/* Participant Table */}
        <Card className="overflow-hidden border-2 border-gray-100 shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b-2 border-gray-100">
              <tr>
                <th className="px-6 py-5"><SortHeader col="name">Teilnehmer</SortHeader></th>
                <th className="px-6 py-5"><SortHeader col="ki">KI Score</SortHeader></th>
                <th className="px-6 py-5"><SortHeader col="zukunft">Zukunft Score</SortHeader></th>
                <th className="px-6 py-5 hidden md:table-cell text-center">Profil</th>
                <th className="px-6 py-5 hidden md:table-cell"><SortHeader col="date">Status</SortHeader></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-5xl">🔍</span>
                      <p className="text-gray-400 font-black uppercase tracking-widest">Keine Ergebnisse.</p>
                      <Button onClick={() => { setSearchTerm(''); setFilterSolo('all'); }} variant="secondary" className="text-xs">FILTER LÖSCHEN</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const userAnalysis = analyses.find(a => a.userId === u.uid);
                  const userAssessment = assessments.find(a => a.userId === u.uid);
                  const userProfile = profiles.find(p => p.userId === u.uid);

                  return (
                    <tr key={u.uid}
                      className="hover:bg-amber-50/20 transition-all cursor-pointer group"
                      onClick={() => setSelectedEntry({ user: u, analysis: userAnalysis, assessment: userAssessment, profile: userProfile })}
                    >
                      <td className="px-6 py-5">
                        <div className="font-black text-gray-900 group-hover:text-primary transition-colors">{u.firstName} {u.lastName}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{u.email}</div>
                        {userAssessment && (
                          <div className="mt-1">
                            <Pill color={userAssessment.m1_solo === 'solo' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}>
                              {userAssessment.m1_solo === 'solo' ? 'Solo' : 'Team'}
                            </Pill>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {userAnalysis ? (
                          <div>
                            <div className="text-2xl font-black" style={{ color: COLORS.PRIMARY }}>{userAnalysis.kiScore}</div>
                            <div className="text-[9px] font-black text-gray-400 uppercase">{userAnalysis.kiMaturityName}</div>
                          </div>
                        ) : (
                          <span className="text-gray-300 font-black">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {userAnalysis ? (
                          <div>
                            <div className="text-2xl font-black" style={{ color: COLORS.ZUKUNFT }}>{userAnalysis.zukunftScore}</div>
                            <div className="text-[9px] font-black text-gray-400 uppercase">{userAnalysis.zukunftMaturityName}</div>
                          </div>
                        ) : (
                          <span className="text-gray-300 font-black">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center hidden md:table-cell">
                        <span className="text-sm">{u.istAnalyseCompleted ? <span className="text-emerald-600 inline-flex"><IconCheckCircle size={18} /></span> : '—'}</span>
                      </td>
                      <td className="px-6 py-5 text-right hidden md:table-cell">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          userAnalysis ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {userAnalysis ? 'Abgeschlossen' : 'Ausstehend'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* ═══ DETAIL MODAL ═══ */}
      {selectedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-burgundy-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-6xl max-h-[95vh] overflow-y-auto p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl">
            <button onClick={() => setSelectedEntry(null)} className="fixed sm:absolute top-4 sm:top-8 right-4 sm:right-8 p-3 rounded-2xl bg-white border border-gray-200 shadow-md hover:bg-rose-100 hover:text-rose-600 transition-colors z-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-12">
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Kunden-Detail</span>
              <h2 className="text-4xl font-black text-gray-900 mt-2">{selectedEntry.user.firstName} {selectedEntry.user.lastName}</h2>
              <p className="text-gray-500 font-bold">{selectedEntry.user.email} — Registriert {new Date(selectedEntry.user.createdAt).toLocaleString('de-DE')}</p>
            </div>

            {!selectedEntry.assessment ? (
              <div className="p-20 text-center text-gray-400 font-black uppercase tracking-widest border-4 border-dashed rounded-[32px]">
                Nutzer hat das Assessment noch nicht gestartet.
              </div>
            ) : (
              <div className="space-y-10">
                {/* Dual Score Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: `${COLORS.PRIMARY}08`, border: `2px solid ${COLORS.PRIMARY}20` }}>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: COLORS.PRIMARY }}>KI Readiness</div>
                    <div className="text-5xl font-black" style={{ color: COLORS.PRIMARY }}>{selectedEntry.analysis?.kiScore || 0}</div>
                    <div className="text-xs font-black text-gray-500 mt-1">Stufe {selectedEntry.analysis?.kiMaturityLevel}: {selectedEntry.analysis?.kiMaturityName}</div>
                  </div>
                  <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: `${COLORS.ZUKUNFT}08`, border: `2px solid ${COLORS.ZUKUNFT}20` }}>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: COLORS.ZUKUNFT }}>Zukunft Readiness</div>
                    <div className="text-5xl font-black" style={{ color: COLORS.ZUKUNFT }}>{selectedEntry.analysis?.zukunftScore || 0}</div>
                    <div className="text-xs font-black text-gray-500 mt-1">Stufe {selectedEntry.analysis?.zukunftMaturityLevel}: {selectedEntry.analysis?.zukunftMaturityName}</div>
                  </div>
                </div>

                {/* Dual Radar Charts */}
                {selectedEntry.analysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-center mb-4" style={{ color: COLORS.PRIMARY }}>KI Säulen</h4>
                      <div className="scale-90 -mx-4">
                        <ScoreRadar scores={selectedEntry.analysis.kiPillarScores} pillarNames={KI_PILLAR_NAMES} maxScore={25} color={COLORS.PRIMARY} height={280} />
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-center mb-4" style={{ color: COLORS.ZUKUNFT }}>Zukunft Dimensionen</h4>
                      <div className="scale-90 -mx-4">
                        <ScoreRadar scores={selectedEntry.analysis.zukunftPillarScores} pillarNames={ZUKUNFT_PILLAR_NAMES} maxScore={25} color={COLORS.ZUKUNFT} height={280} />
                      </div>
                    </div>
                  </div>
                )}

                {/* CEC Data */}
                {selectedEntry.analysis?.cecData && selectedEntry.analysis.cecData.gesamtErgebnis > 0 && (
                  <div className="p-6 rounded-2xl border-2 border-amber-200 bg-amber-50/30">
                    <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-4">CEC Ergebnis</h4>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Zeiteinsparung</div>
                        <div className="font-black text-amber-800">{formatEur(selectedEntry.analysis.cecData.zeiteinsparungEurJahr)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Kosteneinsparung</div>
                        <div className="font-black text-amber-800">{formatEur(selectedEntry.analysis.cecData.kosteneinsparungEurJahr)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Umsatzsteigerung</div>
                        <div className="font-black text-amber-800">{formatEur(selectedEntry.analysis.cecData.umsatzsteigerungEurJahr)}</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-200 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-black text-gray-500 uppercase">Gesamt: </span>
                        <span className="text-lg font-black text-amber-900">{formatEur(selectedEntry.analysis.cecData.gesamtErgebnis)}/Jahr</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-gray-500 uppercase">ROI: </span>
                        <span className={`text-lg font-black ${selectedEntry.analysis.cecData.roi >= 1 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {selectedEntry.analysis.cecData.roi.toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* KI Ist-Analyse Profil */}
                {selectedEntry.profile && (
                  <div className="p-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30">
                    <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-4">KI Ist-Analyse Profil</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Quadrant</div>
                        <div className="font-black text-emerald-800">{selectedEntry.profile.quadrant}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Persona (intern)</div>
                        <div className="font-black text-emerald-800">{selectedEntry.profile.persona}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Produkt-Empfehlung</div>
                        <div className="font-black text-emerald-800">{selectedEntry.profile.produktEmpfehlung}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Einstiegspunkt</div>
                        <div className="font-black text-emerald-800">{selectedEntry.profile.einstiegspunkt}</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-emerald-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Tool-Empfehlungen</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedEntry.profile.toolEmpfehlungen.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Blueprint-Empfehlungen</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedEntry.profile.blueprintEmpfehlungen.map(bp => (
                            <span key={bp} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">{bp}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-[9px] font-black text-gray-500 uppercase mb-1">Session-Empfehlung</div>
                      <div className="text-sm font-bold text-emerald-800">{selectedEntry.profile.sessionEmpfehlung}</div>
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest border-l-4 pl-3" style={{ color: COLORS.ACCENT, borderColor: COLORS.ACCENT }}>Profil</h5>
                    <DataField label="Modus" value={selectedEntry.assessment.m1_solo === 'solo' ? 'Solo-Selbstständig' : 'Team/Unternehmen'} />
                    <DataField label="Stundensatz" value={`${selectedEntry.assessment.m2_stundensatz} EUR`} />
                    <DataField label="Jahresumsatz" value={selectedEntry.assessment.m3_jahresumsatz} />
                    <DataField label="Einschränkungen" value={selectedEntry.assessment.m4_einschraenkungen} />
                  </div>

                  {/* Pillar breakdown */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest border-l-4 pl-3" style={{ color: COLORS.PRIMARY, borderColor: COLORS.PRIMARY }}>KI Säulen-Scores</h5>
                    {selectedEntry.analysis && Object.entries(KI_PILLAR_NAMES).map(([key, name]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-600">{name}</span>
                        <span className="text-sm font-black" style={{ color: COLORS.PRIMARY }}>
                          {(selectedEntry.analysis!.kiPillarScores as any)[key]}/25
                        </span>
                      </div>
                    ))}
                    <h5 className="text-[10px] font-black uppercase tracking-widest border-l-4 pl-3 mt-6" style={{ color: COLORS.ZUKUNFT, borderColor: COLORS.ZUKUNFT }}>Zukunft Dimensions-Scores</h5>
                    {selectedEntry.analysis && Object.entries(ZUKUNFT_PILLAR_NAMES).map(([key, name]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-600">{name}</span>
                        <span className="text-sm font-black" style={{ color: COLORS.ZUKUNFT }}>
                          {(selectedEntry.analysis!.zukunftPillarScores as any)[key]}/25
                        </span>
                      </div>
                    ))}
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
