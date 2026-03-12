
import React, { useState } from 'react';
import { Analysis, QuestionDef, Assessment } from '../../types';
import { KI_MATURITY_LEVELS, KI_PILLAR_NAMES, ZUKUNFT_PILLAR_NAMES } from '../../constants';

// ─── Helpers ────────────────────────────────────────────────────

export function formatEur(val: number): string {
  return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export function formatNumber(val: number, decimals: number = 0): string {
  return val.toLocaleString('de-DE', { maximumFractionDigits: decimals });
}

export function formatPercent(val: number): string {
  return (val * 100).toLocaleString('de-DE', { maximumFractionDigits: 0 }) + '%';
}

// ─── Stufen-Fortschrittsbalken ──────────────────────────────────

export const LevelProgressBar: React.FC<{ level: number; color: string; levels: typeof KI_MATURITY_LEVELS }> = ({ level, color, levels }) => (
  <div className="flex gap-1 items-center mt-3">
    {levels.map((_, idx) => (
      <div
        key={idx}
        className="h-2.5 flex-1 rounded-full transition-all duration-700"
        style={{
          backgroundColor: idx < level ? color : '#E5E7EB',
          opacity: idx < level ? (0.4 + (idx / levels.length) * 0.6) : 0.3,
        }}
      />
    ))}
  </div>
);

// ─── Collapsible Section ─────────────────────────────────────────

export const CollapsibleSection: React.FC<{
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  color?: string;
}> = ({ title, icon, defaultOpen = false, children, color }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-2 border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-500">{icon}</span>}
          <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: color || '#374151' }}>
            {title}
          </h3>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Shared Types ────────────────────────────────────────────────

export interface PillarAnalysis {
  key: string;
  name: string;
  score: number;
  maxScore: number;
  percent: number;
  type: 'ki' | 'zukunft';
}

export interface TodoItem {
  text: string;
  impact: string;
  pillarName: string;
  type: 'ki' | 'zukunft';
  priority: 'high' | 'medium' | 'low';
  timeEstimate?: string;
}

export interface NextLevelInfo {
  nextLevel: typeof KI_MATURITY_LEVELS[0];
  pointsNeeded: number;
}

// ─── Analysis Functions ──────────────────────────────────────────

export function analyzePillars(analysis: Analysis): { strengths: PillarAnalysis[]; potentials: PillarAnalysis[] } {
  const kiScores = analysis.kiPillarScores || {} as any;
  const zukunftScores = analysis.zukunftPillarScores || {} as any;
  const allPillars: PillarAnalysis[] = [
    ...Object.entries(KI_PILLAR_NAMES).map(([key, name]) => ({
      key, name, score: kiScores[key] || 0, maxScore: 25,
      percent: (kiScores[key] || 0) / 25 * 100, type: 'ki' as const
    })),
    ...Object.entries(ZUKUNFT_PILLAR_NAMES).map(([key, name]) => ({
      key, name, score: zukunftScores[key] || 0, maxScore: 25,
      percent: (zukunftScores[key] || 0) / 25 * 100, type: 'zukunft' as const
    })),
  ];

  const sorted = [...allPillars].sort((a, b) => b.percent - a.percent);
  return {
    strengths: sorted.slice(0, 3),
    potentials: sorted.slice(-3).reverse(),
  };
}

export function generateTodos(analysis: Analysis, assessment: Assessment): TodoItem[] {
  const todos: TodoItem[] = [];
  const isSolo = assessment.m1_solo === 'solo';
  const ki = analysis.kiPillarScores || { kompetenz: 0, tools: 0, steuerung: 0, zukunft: 0 };
  const zk = analysis.zukunftPillarScores || { zukunftsbild: 0, zukunftsstrategie: 0, zukunftskompetenzen: 0, umsetzung: 0 };

  // ── KI Kompetenz ──
  if (ki.kompetenz < 15) {
    if ((assessment.k1_nutzungsgrad || 0) < 3) {
      todos.push({
        text: isSolo ? 'Baue KI in deinen Tagesablauf ein — starte jeden Morgen mit einem KI-Tool' : 'Definiere ein verbindliches Ziel: Mindestens 25% des Teams nutzt KI 1x/Tag',
        impact: 'Nutzungsgrad +2-3 Punkte', pillarName: 'Kompetenz', type: 'ki', priority: 'high'
      });
    }
    if ((assessment.k2_schulungsgrad || 0) < 3) {
      todos.push({
        text: isSolo ? 'Plane 2h/Woche feste KI-Lernzeit ein (Kurse, Tutorials, Experimente)' : 'Starte ein KI-Schulungsprogramm — Ziel: 50% der MA innerhalb von 3 Monaten',
        impact: 'Schulungsgrad +2-3 Punkte', pillarName: 'Kompetenz', type: 'ki', priority: 'high'
      });
    }
    if ((assessment.k3_tool_breite || 0) < 2) {
      todos.push({
        text: 'Teste 3 neue KI-Tools in verschiedenen Bereichen (Text, Bild, Automatisierung)',
        impact: 'Tool-Breite +1-2 Punkte', pillarName: 'Kompetenz', type: 'ki', priority: 'medium'
      });
    }
  }

  // ── KI Tools & Prozesse ──
  if (ki.tools < 15) {
    if ((assessment.t1_prozess_abdeckung || 0) < 2) {
      todos.push({
        text: 'Identifiziere die 3 zeitintensivsten Prozesse und prüfe KI-Unterstützung dafür',
        impact: 'Prozess-Abdeckung +2 Punkte', pillarName: 'Tools & Prozesse', type: 'ki', priority: 'high'
      });
    }
    if ((assessment.t5_prozess_doku || 0) < 2) {
      todos.push({
        text: 'Dokumentiere deine Top-5 KI-Prozesse schriftlich (Prompt, Tool, Ergebnis)',
        impact: 'Prozess-Doku +2 Punkte', pillarName: 'Tools & Prozesse', type: 'ki', priority: 'medium'
      });
    }
    if ((assessment.t6_agent_teams || 0) < 2) {
      todos.push({
        text: 'Baue deinen ersten KI-Agent-Workflow (z.B. mit Make, N8N oder Zapier + GPT)',
        impact: 'Agent-Teams +1-2 Punkte', pillarName: 'Tools & Prozesse', type: 'ki', priority: 'medium'
      });
    }
  }

  // ── KI Steuerung ──
  if (ki.steuerung < 15) {
    if ((assessment.s1_verantwortung || 0) < 3) {
      todos.push({
        text: isSolo ? 'Blocke einen festen KI-Tag pro Woche in deinem Kalender' : 'Ernenne einen KI-Verantwortlichen mit klarem Mandat und Zielen',
        impact: 'Verantwortung +2-3 Punkte', pillarName: 'Steuerung', type: 'ki', priority: 'high'
      });
    }
    if ((assessment.s3_budget || 0) < 2) {
      todos.push({
        text: isSolo ? 'Investiere mindestens 50-100 EUR/Monat in KI-Tools (ChatGPT Plus, Cursor, etc.)' : 'Allokiere ein festes monatliches KI-Budget (mindestens 500 EUR/Monat)',
        impact: 'Budget +1-2 Punkte', pillarName: 'Steuerung', type: 'ki', priority: 'medium'
      });
    }
    if ((assessment.s5_rituale || 0) < 2) {
      todos.push({
        text: isSolo ? 'Erstelle ein wöchentliches KI-Review: Was hat diese Woche funktioniert?' : 'Führe monatliche KI-Retrospektiven im Team ein (Was funktioniert? Was nicht?)',
        impact: 'Rituale +1-2 Punkte', pillarName: 'Steuerung', type: 'ki', priority: 'medium'
      });
    }
  }

  // ── KI Zukunftsfähigkeit ──
  if (ki.zukunft < 15) {
    if ((assessment.z1_beobachtung || 0) < 3) {
      todos.push({
        text: 'Folge 3-5 KI-News-Quellen und plane 1h/Woche für KI-Trend-Beobachtung',
        impact: 'Beobachtung +2 Punkte', pillarName: 'Zukunftsfähigkeit', type: 'ki', priority: 'medium'
      });
    }
    if ((assessment.z5_geschaeftsideen || 0) < 2) {
      todos.push({
        text: 'Brainstorme 3 konkrete Geschäftsideen, die durch neue KI-Modelle möglich werden',
        impact: 'Geschäftsideen +1-2 Punkte', pillarName: 'Zukunftsfähigkeit', type: 'ki', priority: 'low'
      });
    }
  }

  // ── Zukunft: Zukunftsbild ──
  if (zk.zukunftsbild < 15) {
    if ((assessment.f1_zukunftsbild || 0) < 2) {
      todos.push({
        text: 'Schreibe ein konkretes Zukunftsbild für dein Unternehmen (5-Jahres-Horizont)',
        impact: 'Zukunftsbild +2-3 Punkte', pillarName: 'Zukunftsbild', type: 'zukunft', priority: 'high'
      });
    }
    if ((assessment.f3_trends_wpa || 0) < 2) {
      todos.push({
        text: 'Kategorisiere 10 relevante Trends nach Watch-Prepare-Act',
        impact: 'Trend-Analyse +2 Punkte', pillarName: 'Zukunftsbild', type: 'zukunft', priority: 'medium'
      });
    }
    if ((assessment.f4_kontakte_top20 || 0) < 2) {
      todos.push({
        text: 'Identifiziere die Top-20 Zukunftsakteure deiner Branche und stelle Kontakt zu 5 her',
        impact: 'Netzwerk +2 Punkte', pillarName: 'Zukunftsbild', type: 'zukunft', priority: 'medium'
      });
    }
  }

  // ── Zukunft: Zukunftsstrategie ──
  if (zk.zukunftsstrategie < 15) {
    if ((assessment.f9_zukunftsstrategie || 0) < 2) {
      todos.push({
        text: 'Formuliere eine schriftliche Zukunftsstrategie, die allen Mitarbeitern bekannt ist',
        impact: 'Strategie +3-4 Punkte', pillarName: 'Zukunftsstrategie', type: 'zukunft', priority: 'high'
      });
    }
    if ((assessment.f11_ziele_kpis || 0) < 3) {
      todos.push({
        text: 'Breche deine Zukunftsstrategie auf konkrete Quartalsziele mit messbaren KPIs herunter',
        impact: 'Ziele & KPIs +3-4 Punkte', pillarName: 'Zukunftsstrategie', type: 'zukunft', priority: 'high'
      });
    }
  }

  // ── Zukunft: Zukunftskompetenzen ──
  if (zk.zukunftskompetenzen < 15) {
    if ((assessment.f16_workshops || 0) < 2) {
      todos.push({
        text: 'Plane mindestens 2 interne Innovations-Workshops in den nächsten 6 Monaten',
        impact: 'Workshops +1-2 Punkte', pillarName: 'Zukunftskompetenzen', type: 'zukunft', priority: 'medium'
      });
    }
    if ((assessment.f21_externe_netzwerke || 0) < 1) {
      todos.push({
        text: 'Tritt einem externen Zukunfts-Netzwerk bei oder starte eine Hochschul-Kooperation',
        impact: 'Netzwerk +2 Punkte', pillarName: 'Zukunftskompetenzen', type: 'zukunft', priority: 'low'
      });
    }
  }

  // ── Zukunft: Umsetzung ──
  if (zk.umsetzung < 15) {
    if ((assessment.f27_conversion_rate || 0) < 2) {
      todos.push({
        text: 'Definiere einen klaren Prozess von Idee zu Prototyp (max. 3 Monate Zyklus)',
        impact: 'Conversion Rate +2 Punkte', pillarName: 'Umsetzung', type: 'zukunft', priority: 'high'
      });
    }
    if ((assessment.f25_jahresbudget || 0) < 2) {
      todos.push({
        text: 'Reserviere mindestens 2-5% des Jahresbudgets für Zukunfts-Strategieprojekte',
        impact: 'Budget +1-2 Punkte', pillarName: 'Umsetzung', type: 'zukunft', priority: 'medium'
      });
    }
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const defaultTime = { high: '1 Stunde', medium: '2 Stunden', low: '30 Min' };
  todos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  todos.forEach(t => { if (!t.timeEstimate) t.timeEstimate = defaultTime[t.priority]; });

  return todos;
}

// ─── Celebration 1-Liner ─────────────────────────────────────────

export function generateCelebrationLine(analysis: Analysis, strengths: PillarAnalysis[]): string {
  const topStrength = strengths.length > 0 ? strengths[0].name : null;
  const percentile = Math.min(95, Math.round(analysis.kiScore / 100 * 80 + 10));

  if (analysis.kiMaturityLevel >= 6) {
    return `Du bist auf Stufe ${analysis.kiMaturityLevel} — weiter als ${percentile}% aller Teilnehmer.${topStrength ? ` Deine Stärke: ${topStrength}.` : ''}`;
  }
  if (analysis.kiMaturityLevel >= 4) {
    return `Solide Basis auf Stufe ${analysis.kiMaturityLevel}.${topStrength ? ` Dein größter Hebel: ${topStrength}.` : ''}`;
  }
  return `Guter Start auf Stufe ${analysis.kiMaturityLevel} — mit klarem Potenzial nach oben.`;
}

export function getNextLevelInfo(score: number, levels: typeof KI_MATURITY_LEVELS): NextLevelInfo | null {
  const currentLevel = levels.find(m => score >= m.min && score <= m.max);
  if (!currentLevel || currentLevel.level >= 10) return null;
  const nextLevel = levels.find(m => m.level === currentLevel.level + 1);
  if (!nextLevel) return null;
  return { nextLevel, pointsNeeded: nextLevel.min - score };
}

// ─── Weekly Plan ─────────────────────────────────────────────────

export interface WeeklyMilestone {
  weekLabel: string;
  focus: string;
  items: string[];
  type: 'ki' | 'zukunft';
}

export function buildWeeklyPlan(
  nextLevel: NextLevelInfo,
  aufstiegsDetails: Record<number, { zeitrahmen: string; wow: string; byPillar: Record<string, string[]> }>,
  type: 'ki' | 'zukunft',
): WeeklyMilestone[] {
  const details = aufstiegsDetails[nextLevel.nextLevel.level];
  if (!details?.byPillar) return [];

  const pillars = Object.entries(details.byPillar);
  const zeitMatch = details.zeitrahmen.match(/(\d+)/);
  const totalWeeks = zeitMatch ? parseInt(zeitMatch[1]) : 4;
  const weeksPerBlock = Math.max(1, Math.round(totalWeeks / pillars.length));

  return pillars.map(([pillarName, items], idx) => ({
    weekLabel: `Woche ${idx * weeksPerBlock + 1}–${(idx + 1) * weeksPerBlock}`,
    focus: pillarName,
    items: items as string[],
    type,
  }));
}

// ─── Session Bridge Helpers ──────────────────────────────────────

export function getNextSessionDate(dayName: string): Date {
  const dayMap: Record<string, number> = { 'Montag': 1, 'Dienstag': 2, 'Mittwoch': 3, 'Donnerstag': 4, 'Freitag': 5 };
  // Handle values like "Donnerstag (Strategie & Zukunft)" — extract first word
  const firstWord = dayName.split(/[\s(]/)[0];
  const targetDay = dayMap[firstWord] ?? dayMap[dayName] ?? 2;
  const now = new Date();
  const current = now.getDay();
  let daysUntil = targetDay - current;
  if (daysUntil <= 0) daysUntil += 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  return next;
}

const SESSION_PREP_MAP: Record<string, string> = {
  'Kompetenz': 'Teste vor der Session ein KI-Tool und notiere 3 Fragen dazu',
  'Tools & Prozesse': 'Identifiziere einen Prozess, den du in der Session automatisieren willst',
  'Steuerung': 'Schreibe auf, wie viel Zeit du diese Woche fuer KI genutzt hast',
  'Zukunftsfähigkeit': 'Lies einen Artikel ueber KI-Trends und bringe eine Frage mit',
  'Zukunftsbild': 'Notiere 3 Trends, die deine Branche in 5 Jahren veraendern koennten',
  'Zukunftsstrategie': 'Schreibe dein wichtigstes strategisches Ziel fuer die naechsten 6 Monate auf',
  'Zukunftskompetenzen': 'Ueberlege, welche Kompetenz dir fuer die Zukunft am meisten fehlt',
  'Umsetzung': 'Bringe eine konkrete Idee mit, die du in einen Prototyp verwandeln willst',
};

export function getSessionPrepTask(potentials: PillarAnalysis[]): string {
  if (potentials.length === 0) return 'Bereite eine Frage vor, die dich gerade am meisten beschaeftigt';
  const weakest = potentials[0];
  return SESSION_PREP_MAP[weakest.name] || 'Bereite eine Frage vor, die dich gerade am meisten beschaeftigt';
}
