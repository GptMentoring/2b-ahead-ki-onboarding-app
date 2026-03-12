
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Analysis, Assessment, ScoreHistoryEntry, IstAnalyse, IstAnalyseProfile } from '../types';
import { dbService } from '../services/dbService';
import { COLORS, KI_MATURITY_LEVELS, ZUKUNFT_MATURITY_LEVELS, KI_PILLAR_NAMES, ZUKUNFT_PILLAR_NAMES } from '../constants';
import { Card } from './UIComponents';
import { IconUsers, IconRobot, IconCompass, IconCalendar, IconSearch, IconCheckCircle } from './Icons';
import { analyzePillars, generateTodos, getSessionPrepTask, getNextLevelInfo, CollapsibleSection, PillarAnalysis, TodoItem } from './dashboard/shared';
import { IST_ANALYSE_QUESTIONS, IST_ANALYSE_MODULES, QUADRANT_DEFINITIONS, PERSONA_DEFINITIONS } from '../istAnalyseConstants';

// ═══════════════════════════════════════════════════════════════════
// MENTOR VIEW — Kundenübersicht für Andreas
// ═══════════════════════════════════════════════════════════════════

// ─── Helpers ─────────────────────────────────────────────────────

function getKiMaturityInfo(score: number) {
  const level = KI_MATURITY_LEVELS.find(l => score >= l.min && score <= l.max)
    || KI_MATURITY_LEVELS[0];
  return level;
}

function getZukunftMaturityInfo(score: number) {
  const level = ZUKUNFT_MATURITY_LEVELS.find(l => score >= l.min && score <= l.max)
    || ZUKUNFT_MATURITY_LEVELS[0];
  return level;
}

function getScoreBadgeColor(score: number): string {
  if (score >= 50) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (score >= 30) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (score >= 15) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-rose-100 text-rose-800 border-rose-200';
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── Ist-Analyse Resolver ────────────────────────────────────────

function resolveIstLabel(field: string, value: string | string[] | undefined | null): string {
  if (!value) return '—';
  const question = IST_ANALYSE_QUESTIONS.find(q => q.field === field);
  if (!question?.options) return Array.isArray(value) ? value.join(', ') : String(value);
  if (Array.isArray(value)) {
    return value.map(v => question.options!.find(o => o.value === v)?.label || v).join(', ');
  }
  return question.options.find(o => o.value === value)?.label || String(value);
}

type DetailTab = 'overview' | 'istanalyse' | 'session' | 'csmcall';

// ─── Sortierung ──────────────────────────────────────────────────

type SortField = 'name' | 'ki' | 'zukunft' | 'date';

// ─── Hauptkomponente ─────────────────────────────────────────────

const MentorView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<{
    assessment: Assessment | null;
    scoreHistory: ScoreHistoryEntry[];
    istAnalyse: IstAnalyse | null;
    istAnalyseProfile: IstAnalyseProfile | null;
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [checklist, setChecklist] = useState<Record<string, boolean> | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [u, a] = await Promise.all([
        dbService.getAllUsers(),
        dbService.getAllAnalyses(),
      ]);
      setUsers(u);
      setAnalyses(a);
    } catch (error) {
      console.error('Error fetching mentor data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Detail-Daten laden ────────────────────────────────────────
  useEffect(() => {
    if (!selectedUserId) { setDetailData(null); setChecklist(null); return; }
    setDetailLoading(true);
    setDetailTab('overview');
    const weekNumber = Math.ceil(
      (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    const weekKey = `${new Date().getFullYear()}-W${weekNumber}`;
    Promise.all([
      dbService.getAssessment(selectedUserId),
      dbService.getScoreHistory(selectedUserId),
      dbService.getIstAnalyse(selectedUserId),
      dbService.getIstAnalyseProfile(selectedUserId),
      dbService.getChecklist(selectedUserId, weekKey),
    ]).then(([assessment, scoreHistory, istAnalyse, istAnalyseProfile, cl]) => {
      setDetailData({ assessment, scoreHistory, istAnalyse, istAnalyseProfile });
      setChecklist(cl);
    }).catch(console.error).finally(() => setDetailLoading(false));
  }, [selectedUserId]);

  // ─── Analyse-Lookup ──────────────────────────────────────────
  const analysisMap = useMemo(() => {
    const map = new Map<string, Analysis>();
    analyses.forEach(a => map.set(a.userId, a));
    return map;
  }, [analyses]);

  // ─── KPIs ────────────────────────────────────────────────────
  const totalUsers = users.length;
  const usersWithAnalysis = users.filter(u => analysisMap.has(u.uid));

  const avgKiScore = useMemo(() => {
    if (analyses.length === 0) return 0;
    return Math.round(analyses.reduce((sum, a) => sum + (a.kiScore || 0), 0) / analyses.length);
  }, [analyses]);

  const avgZukunftScore = useMemo(() => {
    if (analyses.length === 0) return 0;
    return Math.round(analyses.reduce((sum, a) => sum + (a.zukunftScore || 0), 0) / analyses.length);
  }, [analyses]);

  const usersWithIstAnalyse = users.filter(u => u.istAnalyseCompleted).length;

  // ─── Filtern & Sortieren ────────────────────────────────────
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

    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'name':
          cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'ki': {
          const kiA = analysisMap.get(a.uid)?.kiScore || 0;
          const kiB = analysisMap.get(b.uid)?.kiScore || 0;
          cmp = kiB - kiA;
          break;
        }
        case 'zukunft': {
          const zA = analysisMap.get(a.uid)?.zukunftScore || 0;
          const zB = analysisMap.get(b.uid)?.zukunftScore || 0;
          cmp = zB - zA;
          break;
        }
        case 'date':
          cmp = b.createdAt - a.createdAt;
          break;
      }
      return sortOrder === 'asc' ? -cmp : cmp;
    });

    return sorted;
  }, [users, searchTerm, sortBy, sortOrder, analysisMap]);

  // ─── Sort Handler ───────────────────────────────────────────
  const handleSort = (col: SortField) => {
    if (sortBy === col) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const SortHeader: React.FC<{ col: SortField; children: React.ReactNode; className?: string }> = ({ col, children, className = '' }) => (
    <button
      onClick={() => handleSort(col)}
      className={`text-[10px] font-black text-gray-500 hover:text-gray-800 uppercase tracking-widest transition-colors flex items-center gap-1 ${className}`}
    >
      {children}
      {sortBy === col && (
        <span className="text-gray-400">{sortOrder === 'asc' ? ' \u2191' : ' \u2193'}</span>
      )}
    </button>
  );

  // ─── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#64162D] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Lade Kundendaten...</p>
        </div>
      </div>
    );
  }

  // ─── Desktop Table Row ──────────────────────────────────────
  const renderTableRow = (user: User) => {
    const analysis = analysisMap.get(user.uid);
    const kiLevel = analysis ? getKiMaturityInfo(analysis.kiScore) : null;
    const zukunftLevel = analysis ? getZukunftMaturityInfo(analysis.zukunftScore) : null;

    return (
      <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
        <td className="py-4 px-4">
          <div>
            <p className="text-sm font-black text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{user.email}</p>
          </div>
        </td>
        <td className="py-4 px-3 text-center">
          {analysis ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-black" style={{ color: COLORS.PRIMARY }}>{Math.round(analysis.kiScore)}</span>
              <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight border ${getScoreBadgeColor(analysis.kiScore)}`}>
                {kiLevel?.name}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">--</span>
          )}
        </td>
        <td className="py-4 px-3 text-center">
          {analysis ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-black" style={{ color: COLORS.ZUKUNFT }}>{Math.round(analysis.zukunftScore)}</span>
              <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight border ${getScoreBadgeColor(analysis.zukunftScore)}`}>
                {zukunftLevel?.name}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">--</span>
          )}
        </td>
        <td className="py-4 px-3 text-center">
          <span className="text-xs font-bold text-gray-600">
            {analysis ? formatDate(analysis.createdAt) : formatDate(user.createdAt)}
          </span>
        </td>
        <td className="py-4 px-3 text-center">
          {user.istAnalyseCompleted ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
              <IconCheckCircle size={14} className="text-emerald-600" />
              <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Ja</span>
            </span>
          ) : (
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Nein</span>
          )}
        </td>
        <td className="py-4 px-3 text-center">
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all hover:shadow-md active:scale-95"
            style={{
              color: selectedUserId === user.uid ? COLORS.WHITE : COLORS.PRIMARY,
              borderColor: COLORS.PRIMARY,
              backgroundColor: selectedUserId === user.uid ? COLORS.PRIMARY : 'rgba(100, 22, 45, 0.04)',
            }}
            onClick={() => setSelectedUserId(selectedUserId === user.uid ? null : user.uid)}
          >
            {selectedUserId === user.uid ? 'Schließen' : 'Details'}
          </button>
        </td>
      </tr>
    );
  };

  // ─── Mobile Card ────────────────────────────────────────────
  const renderMobileCard = (user: User) => {
    const analysis = analysisMap.get(user.uid);
    const kiLevel = analysis ? getKiMaturityInfo(analysis.kiScore) : null;
    const zukunftLevel = analysis ? getZukunftMaturityInfo(analysis.zukunftScore) : null;

    return (
      <Card key={user.uid} className="p-5 mb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-black text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{user.email}</p>
          </div>
          {user.istAnalyseCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
              <IconCheckCircle size={12} className="text-emerald-600" />
              <span className="text-[8px] font-black text-emerald-700 uppercase tracking-wider">Ist-Analyse</span>
            </span>
          )}
        </div>

        {/* Scores */}
        {analysis ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">KI Score</p>
              <p className="text-xl font-black" style={{ color: COLORS.PRIMARY }}>{Math.round(analysis.kiScore)}</p>
              <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight border mt-1 ${getScoreBadgeColor(analysis.kiScore)}`}>
                {kiLevel?.name}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Zukunft</p>
              <p className="text-xl font-black" style={{ color: COLORS.ZUKUNFT }}>{Math.round(analysis.zukunftScore)}</p>
              <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight border mt-1 ${getScoreBadgeColor(analysis.zukunftScore)}`}>
                {zukunftLevel?.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 text-center mb-4">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Kein Assessment abgeschlossen</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400">
            {analysis ? formatDate(analysis.createdAt) : formatDate(user.createdAt)}
          </span>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all hover:shadow-md active:scale-95"
            style={{
              color: selectedUserId === user.uid ? COLORS.WHITE : COLORS.PRIMARY,
              borderColor: COLORS.PRIMARY,
              backgroundColor: selectedUserId === user.uid ? COLORS.PRIMARY : 'rgba(100, 22, 45, 0.04)',
            }}
            onClick={() => setSelectedUserId(selectedUserId === user.uid ? null : user.uid)}
          >
            {selectedUserId === user.uid ? 'Schließen' : 'Details'}
          </button>
        </div>
      </Card>
    );
  };

  // ─── Detail Panel ──────────────────────────────────────────
  const renderDetailPanel = () => {
    if (!selectedUserId) return null;

    const selectedUser = users.find(u => u.uid === selectedUserId);
    if (!selectedUser) return null;

    const analysis = analysisMap.get(selectedUserId);
    const kiLevel = analysis ? getKiMaturityInfo(analysis.kiScore) : null;
    const zukunftLevel = analysis ? getZukunftMaturityInfo(analysis.zukunftScore) : null;
    const pillars = analysis ? analyzePillars(analysis) : null;
    const todos = (analysis && detailData?.assessment) ? generateTodos(analysis, detailData.assessment) : [];
    const sessionPrep = pillars ? getSessionPrepTask(pillars.potentials) : null;
    const istA = detailData?.istAnalyse;
    const profile = detailData?.istAnalyseProfile;
    const personaDef = profile ? PERSONA_DEFINITIONS.find(p => p.name === profile.persona) : null;
    const quadrantDef = profile ? QUADRANT_DEFINITIONS.find(q => q.name === profile.quadrant) : null;

    // Checklist progress
    const checklistTotal = checklist ? Object.keys(checklist).length : 0;
    const checklistDone = checklist ? Object.values(checklist).filter(Boolean).length : 0;

    if (detailLoading) {
      return (
        <Card className="p-8 mb-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-center gap-3 py-8">
            <div className="w-6 h-6 border-3 border-gray-200 border-t-[#64162D] rounded-full animate-spin" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Lade Kundendaten...</p>
          </div>
        </Card>
      );
    }

    // ── Tab Buttons ─────────────────────────────────────────
    // ── CSM Gesprächsanker generieren ─────────────────────────
    const talkingPoints: string[] = [];
    if (istA) {
      if (istA.i3_2_dreimonatsziel) talkingPoints.push(`3-Monats-Ziel: "${istA.i3_2_dreimonatsziel}" — Wie läuft es damit?`);
      if (istA.i3_3_usecase) talkingPoints.push(`Konkreter Use Case: "${istA.i3_3_usecase}" — Schon angefangen?`);
      if (istA.i3_4_huerden) {
        const huerdeLabel = resolveIstLabel('i3_4_huerden', istA.i3_4_huerden);
        talkingPoints.push(`Größte Hürde war "${huerdeLabel}" — Hat sich was verändert?`);
      }
      if (istA.i2_5_automationen === 'nein') talkingPoints.push('Hat noch keine Automation gebaut — guter Ansatzpunkt für Quick-Win');
      if (istA.i4_4_budget === 'kostenlos') talkingPoints.push('Nutzt nur kostenlose Tools — über Mehrwert von Pro-Versionen sprechen');
      if (istA.i2_4_zeitaufwand === 'unter_1h') talkingPoints.push('Verbringt < 1h/Woche mit KI — mehr Routine aufbauen');
      if (istA.i5_1_team_stimmung === 'skeptisch' || istA.i5_1_team_stimmung === 'ablehnend')
        talkingPoints.push('Team ist skeptisch/ablehnend — Change-Management ansprechen');
      if (istA.i6_1_zukunftsbild === 'keine') talkingPoints.push('Hat kein Zukunftsbild — Zukunfts-Workshop vorschlagen');
    }
    if (analysis) {
      if (pillars) {
        const weakest = pillars.potentials[0];
        if (weakest) talkingPoints.push(`Schwächste Säule: ${weakest.name} (${Math.round(weakest.score)}/${weakest.maxScore}) — Fortschritt erfragen`);
      }
      if (analysis.cecData?.roi < 1) talkingPoints.push('ROI unter 1x — KI-Investition besprechen');
    }
    if (checklistTotal > 0 && checklistDone < checklistTotal / 2)
      talkingPoints.push(`Checkliste nur ${checklistDone}/${checklistTotal} erledigt — Blockers erfragen`);

    // ── Motivationsschritte ──────────────────────────────────
    const motivationSteps: { step: string; why: string; type: 'ki' | 'zukunft' | 'general' }[] = [];
    if (analysis && pillars) {
      const weakest = pillars.potentials[0];
      if (weakest) {
        const relevantTodo = todos.find(t => t.pillarName === weakest.name);
        if (relevantTodo) motivationSteps.push({ step: relevantTodo.text, why: `Stärkt ${weakest.name} (aktuell ${Math.round(weakest.percent)}%)`, type: relevantTodo.type });
      }
    }
    if (istA?.i2_5_automationen === 'nein' || istA?.i2_5_automationen === 'mit_hilfe') {
      motivationSteps.push({ step: 'Erste Automation gemeinsam bauen (z.B. E-Mail → ChatGPT → Antwort)', why: 'Durchbruchserlebnis schaffen', type: 'ki' });
    }
    if (todos.length > 0) {
      const highPrio = todos.filter(t => t.priority === 'high').slice(0, 2);
      highPrio.forEach(t => {
        if (!motivationSteps.find(m => m.step === t.text)) {
          motivationSteps.push({ step: t.text, why: t.impact, type: t.type });
        }
      });
    }
    if (istA?.i6_3_strategie_3_5 === 'nein' || istA?.i6_3_strategie_3_5 === 'ansaetze') {
      motivationSteps.push({ step: 'Mini-Zukunftsstrategie in 30 Min erstellen (3 Fragen-Framework)', why: 'Gibt Richtung und Klarheit', type: 'zukunft' });
    }
    // Deduplizieren und auf max 5 begrenzen
    const uniqueMotivation = motivationSteps.slice(0, 5);

    const tabs: { key: DetailTab; label: string; badge?: string }[] = [
      { key: 'overview', label: 'Übersicht' },
      { key: 'istanalyse', label: 'Ist-Analyse', badge: istA ? 'Vollständig' : undefined },
      { key: 'session', label: 'Session-Prep' },
      { key: 'csmcall', label: 'Kundengespräch' },
    ];

    return (
      <Card className="p-6 md:p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-500 border-2" style={{ borderColor: 'rgba(100, 22, 45, 0.15)' }}>
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Kundendetail</p>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">
              {selectedUser.firstName} {selectedUser.lastName}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs font-bold text-gray-400">{selectedUser.email}</p>
              {profile && (
                <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight border bg-indigo-50 text-indigo-700 border-indigo-200">
                  {profile.persona}
                </span>
              )}
              {profile && (
                <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight border bg-blue-50 text-blue-700 border-blue-200">
                  {profile.quadrant}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedUserId(null)}
            className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-all active:scale-95"
            title="Schließen"
          >
            <span className="text-lg font-black">&times;</span>
          </button>
        </div>

        {/* ── Quick Status Row ───────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-5">
          {analysis && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-[9px] font-black text-gray-400 uppercase">KI:</span>
                <span className="text-sm font-black" style={{ color: COLORS.PRIMARY }}>{Math.round(analysis.kiScore)}</span>
                <span className="text-[9px] font-bold text-gray-400">({kiLevel?.name})</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-[9px] font-black text-gray-400 uppercase">Zukunft:</span>
                <span className="text-sm font-black" style={{ color: COLORS.ZUKUNFT }}>{Math.round(analysis.zukunftScore)}</span>
                <span className="text-[9px] font-bold text-gray-400">({zukunftLevel?.name})</span>
              </div>
            </>
          )}
          {istA && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <IconCheckCircle size={12} className="text-emerald-600" />
              <span className="text-[9px] font-black text-emerald-700 uppercase">Ist-Analyse</span>
            </div>
          )}
          {checklistTotal > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[9px] font-black text-gray-400 uppercase">Checkliste:</span>
              <span className="text-xs font-black text-gray-700">{checklistDone}/{checklistTotal}</span>
            </div>
          )}
          {detailData?.assessment && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[9px] font-black text-gray-400 uppercase">Typ:</span>
              <span className="text-xs font-black text-gray-700">{detailData.assessment.m1_solo === 'solo' ? 'Solo' : 'Team'}</span>
            </div>
          )}
          {profile && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[9px] font-black text-gray-400 uppercase">Produkt:</span>
              <span className="text-xs font-black text-gray-700">{profile.produktEmpfehlung}</span>
            </div>
          )}
        </div>

        {/* ── Tab Navigation ─────────────────────────────────── */}
        <div className="flex gap-2 mb-6 border-b-2 border-gray-100 pb-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setDetailTab(t.key)}
              className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 -mb-[2px] ${
                detailTab === t.key
                  ? 'border-[#64162D] text-[#64162D]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
              {t.badge && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[8px] bg-emerald-100 text-emerald-700 font-black normal-case">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            TAB: ÜBERSICHT
           ══════════════════════════════════════════════════════ */}
        {detailTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* ── Kundenprofil (aus Ist-Analyse) ──────────────── */}
            {istA && (
              <div className="rounded-xl border-2 border-gray-100 p-5 bg-gray-50/30">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Kundenprofil</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">Arbeitsform</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i1_1_arbeitsform', istA.i1_1_arbeitsform)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">Branche</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i1_2_branche', istA.i1_2_branche)}{istA.i1_2_freitext ? ` (${istA.i1_2_freitext})` : ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">Rolle</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i1_3_rolle', istA.i1_3_rolle)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">Team-Größe (KI)</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i1_4_team_groesse', istA.i1_4_team_groesse)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">KI-Erfahrung</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i2_1_erfahrung', istA.i2_1_erfahrung)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">Tools</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i2_2_tools', istA.i2_2_tools)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">Budget</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i4_4_budget', istA.i4_4_budget)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">Motivation</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i1_5_motivation', istA.i1_5_motivation)}</p>
                  </div>
                </div>
                {istA.i3_2_dreimonatsziel && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 mb-1">3-Monats-Ziel</p>
                    <p className="text-sm font-bold text-gray-800 italic">"{istA.i3_2_dreimonatsziel}"</p>
                  </div>
                )}
                {istA.i3_3_usecase && (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold text-gray-400 mb-1">Konkreter Use Case</p>
                    <p className="text-sm font-bold text-gray-800 italic">"{istA.i3_3_usecase}"</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Stärken & Potenziale ────────────────────────── */}
            {pillars && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border-2 border-emerald-100 p-5 bg-emerald-50/30">
                  <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-3">Top 3 Stärken</p>
                  <div className="space-y-2.5">
                    {pillars.strengths.map((p, i) => (
                      <div key={p.key} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-emerald-100 text-emerald-700">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-800">{p.name}</span>
                            <span className="text-xs font-black" style={{ color: p.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT }}>
                              {Math.round(p.score)}/{p.maxScore} ({Math.round(p.percent)}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden mt-1">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.percent}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border-2 border-amber-100 p-5 bg-amber-50/30">
                  <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-3">Top 3 Potenziale</p>
                  <div className="space-y-2.5">
                    {pillars.potentials.map((p, i) => (
                      <div key={p.key} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-amber-100 text-amber-700">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-800">{p.name}</span>
                            <span className="text-xs font-black" style={{ color: p.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT }}>
                              {Math.round(p.score)}/{p.maxScore} ({Math.round(p.percent)}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden mt-1">
                            <div className="h-full rounded-full bg-amber-500" style={{ width: `${p.percent}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Pillar Breakdown ────────────────────────────── */}
            {analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.PRIMARY }}>KI Säulen</p>
                  <div className="space-y-3">
                    {analysis.kiPillarScores && (Object.entries(analysis.kiPillarScores) as [string, number][]).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-600">{KI_PILLAR_NAMES[key] || key}</span>
                          <span className="text-xs font-black text-gray-800">{Math.round(value)}/25</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / 25) * 100}%`, backgroundColor: COLORS.PRIMARY }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.ZUKUNFT }}>Zukunft Dimensionen</p>
                  <div className="space-y-3">
                    {analysis.zukunftPillarScores && (Object.entries(analysis.zukunftPillarScores) as [string, number][]).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-600">{ZUKUNFT_PILLAR_NAMES[key] || key}</span>
                          <span className="text-xs font-black text-gray-800">{Math.round(value)}/25</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / 25) * 100}%`, backgroundColor: COLORS.ZUKUNFT }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Score History ────────────────────────────────── */}
            {detailData?.scoreHistory && detailData.scoreHistory.length > 1 && (
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Score-Verlauf</p>
                <div className="rounded-xl border-2 border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="text-left py-2.5 px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Datum</th>
                        <th className="text-center py-2.5 px-4 text-[9px] font-black uppercase tracking-widest" style={{ color: COLORS.PRIMARY }}>KI</th>
                        <th className="text-center py-2.5 px-4 text-[9px] font-black uppercase tracking-widest" style={{ color: COLORS.ZUKUNFT }}>Zukunft</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.scoreHistory.map((entry, idx) => (
                        <tr key={idx} className="border-b border-gray-50 last:border-b-0">
                          <td className="py-2 px-4 text-xs font-bold text-gray-500">{formatDate(entry.date)}</td>
                          <td className="py-2 px-4 text-center text-sm font-black" style={{ color: COLORS.PRIMARY }}>{Math.round(entry.kiScore)}</td>
                          <td className="py-2 px-4 text-center text-sm font-black" style={{ color: COLORS.ZUKUNFT }}>{Math.round(entry.zukunftScore)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Wirtschaftlicher Impact ──────────────────────── */}
            {analysis?.cecData && (
              <div className="rounded-xl border-2 border-gray-100 p-5">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Wirtschaftlicher Impact (CEC)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Gesamt/Jahr</p>
                    <p className="text-lg font-black" style={{ color: COLORS.SUCCESS }}>
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(analysis.cecData.gesamtErgebnis)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">ROI</p>
                    <p className="text-lg font-black" style={{ color: analysis.cecData.roi >= 1 ? COLORS.SUCCESS : '#DC2626' }}>
                      {analysis.cecData.roi.toFixed(1)}x
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Zeitersparnis</p>
                    <p className="text-lg font-black text-gray-800">{analysis.cecData.stundenProWoche}h/Woche</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">KI-Budget</p>
                    <p className="text-lg font-black text-gray-800">
                      {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(analysis.cecData.kiMonatlich)}/Mo
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: IST-ANALYSE
           ══════════════════════════════════════════════════════ */}
        {detailTab === 'istanalyse' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {!istA ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Ist-Analyse noch nicht durchgeführt</p>
                <p className="text-xs text-gray-400 mt-2">Der Kunde hat die qualitative Analyse noch nicht abgeschlossen.</p>
              </div>
            ) : (
              <>
                {/* Profile Summary */}
                {profile && (
                  <div className="rounded-xl border-2 border-indigo-100 p-5 bg-indigo-50/30 mb-2">
                    <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-3">Profil-Auswertung</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400">Persona</p>
                        <p className="text-sm font-black text-gray-800">{profile.persona}</p>
                        {personaDef && <p className="text-[10px] text-gray-500 mt-0.5">{personaDef.beschreibung}</p>}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400">Quadrant</p>
                        <p className="text-sm font-black text-gray-800">{profile.quadrant}</p>
                        {quadrantDef && <p className="text-[10px] text-gray-500 mt-0.5">{quadrantDef.beschreibung}</p>}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400">Session-Empfehlung</p>
                        <p className="text-sm font-black text-gray-800">{profile.sessionEmpfehlung}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400">Einstiegspunkt</p>
                        <p className="text-sm font-black text-gray-800">{profile.einstiegspunkt}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400">Produktempfehlung</p>
                        <p className="text-sm font-black text-gray-800">{profile.produktEmpfehlung}</p>
                      </div>
                      {profile.toolEmpfehlungen?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400">Tool-Empfehlungen</p>
                          <p className="text-sm font-black text-gray-800">{profile.toolEmpfehlungen.join(', ')}</p>
                        </div>
                      )}
                    </div>
                    {profile.blueprintEmpfehlungen?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-indigo-200">
                        <p className="text-[10px] font-bold text-gray-400 mb-1">Blueprint-Empfehlungen</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.blueprintEmpfehlungen.map(bp => (
                            <span key={bp} className="px-2 py-1 rounded-lg text-[10px] font-black bg-indigo-100 text-indigo-700 border border-indigo-200">{bp}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Module-by-Module Deep-Dive */}
                {IST_ANALYSE_MODULES.filter(m => m.module > 0).map(mod => {
                  const questions = IST_ANALYSE_QUESTIONS.filter(q => q.module === mod.module);
                  const hasTeam = istA.i1_4_team_groesse !== 'nur_ich';
                  if (mod.condition === 'team_gt_1' && !hasTeam) return null;

                  const answers = questions.map(q => {
                    const val = (istA as any)[q.field];
                    if (val === undefined || val === null || val === '') return null;
                    const freitext = q.freitextField ? (istA as any)[q.freitextField] : null;
                    return { question: q, value: val, freitext, label: resolveIstLabel(q.field, val) };
                  }).filter(Boolean) as { question: typeof questions[0]; value: any; freitext: string | null; label: string }[];

                  if (answers.length === 0) return null;

                  return (
                    <CollapsibleSection
                      key={mod.module}
                      title={`${mod.name}`}
                      defaultOpen={mod.module <= 3}
                      color={mod.module <= 4 ? COLORS.PRIMARY : mod.module === 5 ? '#4F46E5' : COLORS.ZUKUNFT}
                    >
                      <div className="space-y-3">
                        {answers.map(a => (
                          <div key={a.question.id} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                            <p className="text-[10px] font-bold text-gray-400 shrink-0 sm:w-[45%] sm:text-right pt-0.5">{a.question.questionText}</p>
                            <div className="flex-1">
                              <p className="text-xs font-black text-gray-800">{a.label}</p>
                              {a.freitext && <p className="text-[10px] text-gray-500 mt-0.5">"{a.freitext}"</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: SESSION-PREP
           ══════════════════════════════════════════════════════ */}
        {detailTab === 'session' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Session Prep Task */}
            {sessionPrep && (
              <div className="rounded-xl border-2 border-[#64162D]/20 p-5 bg-[#64162D]/5">
                <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: COLORS.PRIMARY }}>Session-Vorbereitung (Kunde)</p>
                <p className="text-sm font-bold text-gray-800">{sessionPrep}</p>
              </div>
            )}

            {/* Größte Hürde */}
            {istA?.i3_4_huerden && (
              <div className="rounded-xl border-2 border-orange-100 p-5 bg-orange-50/30">
                <p className="text-[9px] font-black text-orange-700 uppercase tracking-widest mb-2">Größte Hürde</p>
                <p className="text-sm font-black text-gray-800">{resolveIstLabel('i3_4_huerden', istA.i3_4_huerden)}</p>
                {istA.i3_4_freitext && <p className="text-xs text-gray-600 mt-1">"{istA.i3_4_freitext}"</p>}
              </div>
            )}

            {/* Lernstil + Umsetzer */}
            {istA && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border-2 border-gray-100 p-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Lernstil</p>
                  <p className="text-xs font-black text-gray-800">{resolveIstLabel('i4_2_lernstil', istA.i4_2_lernstil)}</p>
                </div>
                <div className="rounded-xl border-2 border-gray-100 p-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Umsetzer</p>
                  <p className="text-xs font-black text-gray-800">{resolveIstLabel('i4_3_umsetzer', istA.i4_3_umsetzer)}</p>
                </div>
                <div className="rounded-xl border-2 border-gray-100 p-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Zeit für Umsetzung</p>
                  <p className="text-xs font-black text-gray-800">{resolveIstLabel('i4_1_zeit_investition', istA.i4_1_zeit_investition)}</p>
                </div>
              </div>
            )}

            {/* Einsatzbereiche */}
            {istA?.i3_1_einsatzbereiche?.length > 0 && (
              <div className="rounded-xl border-2 border-gray-100 p-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Gewünschte Einsatzbereiche</p>
                <div className="flex flex-wrap gap-2">
                  {istA.i3_1_einsatzbereiche.map(b => (
                    <span key={b} className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                      {resolveIstLabel('i3_1_einsatzbereiche', [b])}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Wins / Todos */}
            {todos.length > 0 && (
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Aktuelle Quick-Wins (KW-Rotation)</p>
                <div className="space-y-2">
                  {todos.map((todo, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border-2 border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
                        todo.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                        todo.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800">{todo.text}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: todo.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT }}>
                            {todo.pillarName}
                          </span>
                          <span className="text-[9px] text-gray-400">{todo.impact}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team-Info (falls vorhanden) */}
            {istA?.i5_1_team_stimmung && (
              <div className="rounded-xl border-2 border-indigo-100 p-5 bg-indigo-50/30">
                <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-3">Team-Kontext</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Team-Stimmung zu KI</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i5_1_team_stimmung', istA.i5_1_team_stimmung)}</p>
                  </div>
                  {istA.i5_2_ki_strategie && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">KI-Strategie vorhanden?</p>
                      <p className="text-xs font-black text-gray-800">{resolveIstLabel('i5_2_ki_strategie', istA.i5_2_ki_strategie)}</p>
                    </div>
                  )}
                  {istA.i5_3_tool_entscheider && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Tool-Entscheider</p>
                      <p className="text-xs font-black text-gray-800">{resolveIstLabel('i5_3_tool_entscheider', istA.i5_3_tool_entscheider)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Zukunft-Kontext */}
            {istA?.i6_1_zukunftsbild && (
              <div className="rounded-xl border-2 border-gray-100 p-5">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3" style={{ color: COLORS.ZUKUNFT }}>Zukunfts-Kontext</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Zukunftsbild</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i6_1_zukunftsbild', istA.i6_1_zukunftsbild)}</p>
                  </div>
                  {istA.i6_2_trendbeobachtung && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Trendbeobachtung</p>
                      <p className="text-xs font-black text-gray-800">{resolveIstLabel('i6_2_trendbeobachtung', istA.i6_2_trendbeobachtung)}</p>
                    </div>
                  )}
                  {istA.i6_3_strategie_3_5 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">3-5 Jahres-Strategie</p>
                      <p className="text-xs font-black text-gray-800">{resolveIstLabel('i6_3_strategie_3_5', istA.i6_3_strategie_3_5)}</p>
                    </div>
                  )}
                  {istA.i6_5_zukunftshoffnung && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Zukunftshoffnung</p>
                      <p className="text-xs font-black text-gray-800">{resolveIstLabel('i6_5_zukunftshoffnung', istA.i6_5_zukunftshoffnung)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB: KUNDENGESPRÄCH (CSM-Call)
           ══════════════════════════════════════════════════════ */}
        {detailTab === 'csmcall' && (
          <div className="space-y-6 animate-in fade-in duration-300">

            {/* ── Schnell-Überblick für Anruf ──────────────────── */}
            <div className="rounded-xl border-2 border-gray-200 p-5 bg-gradient-to-br from-gray-50 to-white">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">Kunden-Steckbrief</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">Name</p>
                  <p className="text-sm font-black text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                {istA && (
                  <>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold">Arbeitsform</p>
                      <p className="text-sm font-black text-gray-900">{resolveIstLabel('i1_1_arbeitsform', istA.i1_1_arbeitsform)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold">Branche</p>
                      <p className="text-sm font-black text-gray-900">{resolveIstLabel('i1_2_branche', istA.i1_2_branche)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold">KI-Erfahrung</p>
                      <p className="text-sm font-black text-gray-900">{resolveIstLabel('i2_1_erfahrung', istA.i2_1_erfahrung)}</p>
                    </div>
                  </>
                )}
                {profile && (
                  <>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold">Persona</p>
                      <p className="text-sm font-black text-gray-900">{profile.persona}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold">Produkt</p>
                      <p className="text-sm font-black text-gray-900">{profile.produktEmpfehlung}</p>
                    </div>
                  </>
                )}
                {analysis && (
                  <>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold">KI-Score</p>
                      <p className="text-sm font-black" style={{ color: COLORS.PRIMARY }}>{Math.round(analysis.kiScore)} ({kiLevel?.name})</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold">Zukunft-Score</p>
                      <p className="text-sm font-black" style={{ color: COLORS.ZUKUNFT }}>{Math.round(analysis.zukunftScore)} ({zukunftLevel?.name})</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Gesprächsanker ───────────────────────────────── */}
            {talkingPoints.length > 0 && (
              <div className="rounded-xl border-2 border-[#64162D]/20 p-5 bg-[#64162D]/[0.03]">
                <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.PRIMARY }}>Gesprächsanker — Darauf ansprechen</p>
                <div className="space-y-2">
                  {talkingPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black bg-[#64162D]/10 text-[#64162D]">{idx + 1}</span>
                      <p className="text-xs font-bold text-gray-800 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Motivationsschritte ──────────────────────────── */}
            {uniqueMotivation.length > 0 && (
              <div className="rounded-xl border-2 border-emerald-100 p-5 bg-emerald-50/30">
                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-3">Nächste Schritte — Motivation geben</p>
                <div className="space-y-3">
                  {uniqueMotivation.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-emerald-100">
                      <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-emerald-100 text-emerald-700">{idx + 1}</span>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-800">{m.step}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{m.why}</p>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded text-[8px] font-black uppercase" style={{
                        color: m.type === 'ki' ? COLORS.PRIMARY : m.type === 'zukunft' ? COLORS.ZUKUNFT : '#6B7280',
                        backgroundColor: m.type === 'ki' ? 'rgba(100,22,45,0.08)' : m.type === 'zukunft' ? 'rgba(30,58,95,0.08)' : '#F3F4F6',
                      }}>
                        {m.type === 'ki' ? 'KI' : m.type === 'zukunft' ? 'Zukunft' : 'Allg.'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Ziele & Wünsche ──────────────────────────────── */}
            {istA && (
              <div className="rounded-xl border-2 border-blue-100 p-5 bg-blue-50/20">
                <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-3">Ziele & Wünsche des Kunden</p>
                <div className="space-y-3">
                  {istA.i3_2_dreimonatsziel && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-0.5">3-Monats-Ziel</p>
                      <p className="text-sm font-black text-gray-800">"{istA.i3_2_dreimonatsziel}"</p>
                    </div>
                  )}
                  {istA.i3_3_usecase && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-0.5">Konkreter Use Case</p>
                      <p className="text-sm font-black text-gray-800">"{istA.i3_3_usecase}"</p>
                    </div>
                  )}
                  {istA.i3_1_einsatzbereiche?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-1">Gewünschte Einsatzbereiche</p>
                      <div className="flex flex-wrap gap-1.5">
                        {istA.i3_1_einsatzbereiche.map(b => (
                          <span key={b} className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-700">{resolveIstLabel('i3_1_einsatzbereiche', [b])}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {istA.i1_5_motivation?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-1">Motivation</p>
                      <div className="flex flex-wrap gap-1.5">
                        {istA.i1_5_motivation.map(m => (
                          <span key={m} className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-700">{resolveIstLabel('i1_5_motivation', [m])}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {istA.i6_5_zukunftshoffnung && istA.i6_5_zukunftshoffnung.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-1">Zukunftshoffnung</p>
                      <div className="flex flex-wrap gap-1.5">
                        {istA.i6_5_zukunftshoffnung.map(z => (
                          <span key={z} className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-700">{resolveIstLabel('i6_5_zukunftshoffnung', [z])}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Blocker & Einschränkungen ─────────────────────── */}
            {istA && (
              <div className="rounded-xl border-2 border-orange-100 p-5 bg-orange-50/20">
                <p className="text-[9px] font-black text-orange-700 uppercase tracking-widest mb-3">Blocker & Rahmenbedingungen</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {istA.i3_4_huerden && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Größte Hürde</p>
                      <p className="text-xs font-black text-gray-800">{resolveIstLabel('i3_4_huerden', istA.i3_4_huerden)}</p>
                      {istA.i3_4_freitext && <p className="text-[10px] text-gray-500 mt-0.5">"{istA.i3_4_freitext}"</p>}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Budget</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i4_4_budget', istA.i4_4_budget)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Verfügbare Zeit/Woche</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i4_1_zeit_investition', istA.i4_1_zeit_investition)}</p>
                  </div>
                  {istA.i2_3_einschraenkungen && istA.i2_3_einschraenkungen !== 'keine' && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Tool-Einschränkungen</p>
                      <p className="text-xs font-black text-gray-800">{resolveIstLabel('i2_3_einschraenkungen', istA.i2_3_einschraenkungen)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Lernstil</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i4_2_lernstil', istA.i4_2_lernstil)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Umsetzer</p>
                    <p className="text-xs font-black text-gray-800">{resolveIstLabel('i4_3_umsetzer', istA.i4_3_umsetzer)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Fortschritt & Status ──────────────────────────── */}
            <div className="rounded-xl border-2 border-gray-100 p-5">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Fortschritt & Engagement</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400">Assessment</p>
                  <p className="text-xs font-black text-gray-800">{detailData?.assessment ? `Abgeschlossen (${formatDate(detailData.assessment.createdAt)})` : 'Nicht gemacht'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400">Ist-Analyse</p>
                  <p className="text-xs font-black text-gray-800">{selectedUser.istAnalyseCompleted ? 'Abgeschlossen' : 'Nicht gemacht'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400">Checkliste (KW)</p>
                  <p className="text-xs font-black text-gray-800">{checklistTotal > 0 ? `${checklistDone}/${checklistTotal} erledigt` : 'Keine Daten'}</p>
                </div>
                {detailData?.scoreHistory && detailData.scoreHistory.length > 1 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Re-Assessments</p>
                    <p className="text-xs font-black text-gray-800">{detailData.scoreHistory.length}x durchgeführt</p>
                  </div>
                )}
                {analysis?.cecData && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">ROI-Potenzial</p>
                    <p className="text-xs font-black" style={{ color: analysis.cecData.roi >= 1 ? COLORS.SUCCESS : '#DC2626' }}>
                      {analysis.cecData.roi.toFixed(1)}x ({new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(analysis.cecData.gesamtErgebnis)}/Jahr)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Empfehlungen für Upsell ──────────────────────── */}
            {profile && (
              <div className="rounded-xl border-2 border-indigo-100 p-5 bg-indigo-50/20">
                <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-3">Empfehlungen & Upsell-Potenzial</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Session-Empfehlung</p>
                    <p className="text-xs font-black text-gray-800">{profile.sessionEmpfehlung}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400">Produktempfehlung</p>
                    <p className="text-xs font-black text-gray-800">{profile.produktEmpfehlung}</p>
                  </div>
                  {profile.toolEmpfehlungen?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Tool-Empfehlungen</p>
                      <p className="text-xs font-black text-gray-800">{profile.toolEmpfehlungen.join(', ')}</p>
                    </div>
                  )}
                  {profile.blueprintEmpfehlungen?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Blueprint-Empfehlungen</p>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {profile.blueprintEmpfehlungen.map(bp => (
                          <span key={bp} className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-700">{bp}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fallback wenn keine Daten */}
            {!istA && !analysis && (
              <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Noch keine Daten verfügbar</p>
                <p className="text-xs text-gray-400 mt-2">Der Kunde hat weder Assessment noch Ist-Analyse abgeschlossen.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Schließen Button ────────────────────────────────── */}
        <div className="mt-6 pt-4 border-t-2 border-gray-100 flex justify-end">
          <button
            onClick={() => setSelectedUserId(null)}
            className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all hover:shadow-md active:scale-95"
            style={{
              color: COLORS.PRIMARY,
              borderColor: COLORS.PRIMARY,
              backgroundColor: 'rgba(100, 22, 45, 0.04)',
            }}
          >
            Schließen
          </button>
        </div>
      </Card>
    );
  };

  // ─── Render ─────────────────────────────────────────────────
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 pb-32 animate-in fade-in duration-1000">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">{today}</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: COLORS.PRIMARY }}>
          Mentor Dashboard
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-2">
          {totalUsers} Kunden | {usersWithAnalysis.length} mit Assessment | {usersWithIstAnalyse} mit Ist-Analyse
        </p>
      </div>

      {/* ─── KPI Summary Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 22, 45, 0.08)' }}>
              <IconUsers size={20} className="text-[#64162D]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Kunden</p>
          <p className="text-2xl md:text-3xl font-black text-gray-900">{totalUsers}</p>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 22, 45, 0.08)' }}>
              <IconRobot size={20} className="text-[#64162D]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Durchschn. KI-Score</p>
          <p className="text-2xl md:text-3xl font-black" style={{ color: COLORS.PRIMARY }}>{avgKiScore}</p>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(30, 58, 95, 0.08)' }}>
              <IconCompass size={20} className="text-[#1E3A5F]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Durchschn. Zukunft</p>
          <p className="text-2xl md:text-3xl font-black" style={{ color: COLORS.ZUKUNFT }}>{avgZukunftScore}</p>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(6, 95, 70, 0.08)' }}>
              <IconCalendar size={20} className="text-[#065F46]" />
            </div>
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Ist-Analyse</p>
          <p className="text-2xl md:text-3xl font-black" style={{ color: COLORS.SUCCESS }}>{usersWithIstAnalyse}/{totalUsers}</p>
        </Card>
      </div>

      {/* ─── Search & Filter ────────────────────────────────── */}
      <Card className="p-5 md:p-6 mb-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kunde suchen (Name oder E-Mail)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#64162D] focus:ring-2 focus:ring-[#64162D]/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>{filteredUsers.length} Ergebnisse</span>
          </div>
        </div>
      </Card>

      {/* ─── Detail Panel ──────────────────────────────────── */}
      {renderDetailPanel()}

      {/* ─── Desktop Table ──────────────────────────────────── */}
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-100 bg-gray-50/50">
                <th className="text-left py-4 px-4">
                  <SortHeader col="name">Name</SortHeader>
                </th>
                <th className="text-center py-4 px-3">
                  <SortHeader col="ki" className="justify-center">KI Score</SortHeader>
                </th>
                <th className="text-center py-4 px-3">
                  <SortHeader col="zukunft" className="justify-center">Zukunft</SortHeader>
                </th>
                <th className="text-center py-4 px-3">
                  <SortHeader col="date" className="justify-center">Datum</SortHeader>
                </th>
                <th className="text-center py-4 px-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ist-Analyse</span>
                </th>
                <th className="text-center py-4 px-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Aktion</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(renderTableRow)}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Keine Kunden gefunden</p>
            </div>
          )}
        </Card>
      </div>

      {/* ─── Mobile Cards ───────────────────────────────────── */}
      <div className="md:hidden">
        {filteredUsers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Keine Kunden gefunden</p>
          </Card>
        ) : (
          <>
            {/* Mobile Sort Buttons */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {[
                { col: 'name' as SortField, label: 'Name' },
                { col: 'ki' as SortField, label: 'KI' },
                { col: 'zukunft' as SortField, label: 'Zukunft' },
                { col: 'date' as SortField, label: 'Datum' },
              ].map(({ col, label }) => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                    sortBy === col
                      ? 'border-[#64162D] text-[#64162D] bg-[#64162D]/5'
                      : 'border-gray-200 text-gray-400 bg-white'
                  }`}
                >
                  {label} {sortBy === col && (sortOrder === 'asc' ? '\u2191' : '\u2193')}
                </button>
              ))}
            </div>
            {filteredUsers.map(renderMobileCard)}
          </>
        )}
      </div>
    </div>
  );
};

export default MentorView;
