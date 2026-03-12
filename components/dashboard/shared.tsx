
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
  const allTodos: TodoItem[] = [];
  const isSolo = assessment.m1_solo === 'solo';
  const ki = analysis.kiPillarScores || { kompetenz: 0, tools: 0, steuerung: 0, zukunft: 0 };
  const zk = analysis.zukunftPillarScores || { zukunftsbild: 0, zukunftsstrategie: 0, zukunftskompetenzen: 0, umsetzung: 0 };

  // ── KI Kompetenz ──
  if (ki.kompetenz < 15) {
    if ((assessment.k1_nutzungsgrad || 0) < 3) {
      allTodos.push({
        text: isSolo ? 'Baue KI in deinen Tagesablauf ein — starte jeden Morgen mit einem KI-Tool' : 'Definiere ein verbindliches Ziel: Mindestens 25% des Teams nutzt KI 1x/Tag',
        impact: 'Nutzungsgrad +2-3 Punkte', pillarName: 'Kompetenz', type: 'ki', priority: 'high'
      });
      allTodos.push({
        text: 'Erstelle eine "KI-Morgenroutine": 10 Minuten mit ChatGPT deinen Tag planen',
        impact: 'Nutzungsgrad +1-2 Punkte', pillarName: 'Kompetenz', type: 'ki', priority: 'medium'
      });
    }
    if ((assessment.k2_schulungsgrad || 0) < 3) {
      allTodos.push({
        text: isSolo ? 'Plane 2h/Woche feste KI-Lernzeit ein (Kurse, Tutorials, Experimente)' : 'Starte ein KI-Schulungsprogramm — Ziel: 50% der MA innerhalb von 3 Monaten',
        impact: 'Schulungsgrad +2-3 Punkte', pillarName: 'Kompetenz', type: 'ki', priority: 'high'
      });
      allTodos.push({
        text: 'Schaue 1 KI-Tutorial auf YouTube und setze das Gelernte sofort um',
        impact: 'Schulungsgrad +1 Punkt', pillarName: 'Kompetenz', type: 'ki', priority: 'low'
      });
    }
    if ((assessment.k3_tool_breite || 0) < 2) {
      allTodos.push({
        text: 'Teste 3 neue KI-Tools in verschiedenen Bereichen (Text, Bild, Automatisierung)',
        impact: 'Tool-Breite +1-2 Punkte', pillarName: 'Kompetenz', type: 'ki', priority: 'medium'
      });
      allTodos.push({
        text: 'Vergleiche ChatGPT und Claude für die gleiche Aufgabe — notiere Unterschiede',
        impact: 'Tool-Breite +1 Punkt', pillarName: 'Kompetenz', type: 'ki', priority: 'low'
      });
    }
    // Zusätzliche Kompetenz-Todos unabh. von Subscores
    allTodos.push({
      text: 'Schreibe 5 verschiedene Prompts für eine Aufgabe und vergleiche die Ergebnisse',
      impact: 'Prompt-Qualität +1 Punkt', pillarName: 'Kompetenz', type: 'ki', priority: 'medium'
    });
    allTodos.push({
      text: isSolo ? 'Erkläre einem Freund, wie du KI nutzt — das festigt dein Verständnis' : 'Organisiere einen 15-Min "KI-Hack der Woche"-Austausch im Team',
      impact: 'Kompetenz-Transfer +1 Punkt', pillarName: 'Kompetenz', type: 'ki', priority: 'low'
    });
  }

  // ── KI Tools & Prozesse ──
  if (ki.tools < 15) {
    if ((assessment.t1_prozess_abdeckung || 0) < 2) {
      allTodos.push({
        text: 'Identifiziere die 3 zeitintensivsten Prozesse und prüfe KI-Unterstützung dafür',
        impact: 'Prozess-Abdeckung +2 Punkte', pillarName: 'Tools & Prozesse', type: 'ki', priority: 'high'
      });
      allTodos.push({
        text: 'Erstelle eine Liste aller wiederkehrenden Aufgaben — markiere KI-Kandidaten',
        impact: 'Prozess-Abdeckung +1 Punkt', pillarName: 'Tools & Prozesse', type: 'ki', priority: 'medium'
      });
    }
    if ((assessment.t5_prozess_doku || 0) < 2) {
      allTodos.push({
        text: 'Dokumentiere deine Top-5 KI-Prozesse schriftlich (Prompt, Tool, Ergebnis)',
        impact: 'Prozess-Doku +2 Punkte', pillarName: 'Tools & Prozesse', type: 'ki', priority: 'medium'
      });
      allTodos.push({
        text: 'Erstelle eine Prompt-Bibliothek mit deinen besten 10 Prompts',
        impact: 'Prozess-Doku +1 Punkt', pillarName: 'Tools & Prozesse', type: 'ki', priority: 'low'
      });
    }
    if ((assessment.t6_agent_teams || 0) < 2) {
      allTodos.push({
        text: 'Baue deinen ersten KI-Agent-Workflow (z.B. mit Make, N8N oder Zapier + GPT)',
        impact: 'Agent-Teams +1-2 Punkte', pillarName: 'Tools & Prozesse', type: 'ki', priority: 'medium'
      });
    }
    // Zusätzliche Tool-Todos
    allTodos.push({
      text: 'Automatisiere eine E-Mail-Vorlage mit KI — teste sie mit 3 verschiedenen Anfragen',
      impact: 'Tool-Effizienz +1 Punkt', pillarName: 'Tools & Prozesse', type: 'ki', priority: 'medium'
    });
    allTodos.push({
      text: 'Miss die Zeit für eine Aufgabe mit und ohne KI — berechne die Ersparnis',
      impact: 'ROI-Bewusstsein +1 Punkt', pillarName: 'Tools & Prozesse', type: 'ki', priority: 'low'
    });
  }

  // ── KI Steuerung ──
  if (ki.steuerung < 15) {
    if ((assessment.s1_verantwortung || 0) < 3) {
      allTodos.push({
        text: isSolo ? 'Blocke einen festen KI-Tag pro Woche in deinem Kalender' : 'Ernenne einen KI-Verantwortlichen mit klarem Mandat und Zielen',
        impact: 'Verantwortung +2-3 Punkte', pillarName: 'Steuerung', type: 'ki', priority: 'high'
      });
      allTodos.push({
        text: isSolo ? 'Setze dir ein konkretes KI-Wochenziel und tracke es' : 'Erstelle eine KI-Roadmap für das nächste Quartal mit 3 Meilensteinen',
        impact: 'Verantwortung +1-2 Punkte', pillarName: 'Steuerung', type: 'ki', priority: 'medium'
      });
    }
    if ((assessment.s3_budget || 0) < 2) {
      allTodos.push({
        text: isSolo ? 'Investiere mindestens 50-100 EUR/Monat in KI-Tools (ChatGPT Plus, Cursor, etc.)' : 'Allokiere ein festes monatliches KI-Budget (mindestens 500 EUR/Monat)',
        impact: 'Budget +1-2 Punkte', pillarName: 'Steuerung', type: 'ki', priority: 'medium'
      });
    }
    if ((assessment.s5_rituale || 0) < 2) {
      allTodos.push({
        text: isSolo ? 'Erstelle ein wöchentliches KI-Review: Was hat diese Woche funktioniert?' : 'Führe monatliche KI-Retrospektiven im Team ein (Was funktioniert? Was nicht?)',
        impact: 'Rituale +1-2 Punkte', pillarName: 'Steuerung', type: 'ki', priority: 'medium'
      });
      allTodos.push({
        text: 'Führe ein "KI-Erfolgsjournal" — notiere täglich 1 KI-Erfolg',
        impact: 'Rituale +1 Punkt', pillarName: 'Steuerung', type: 'ki', priority: 'low'
      });
    }
    // Zusätzliche Steuerung-Todos
    allTodos.push({
      text: 'Berechne, wie viele Stunden du diese Woche durch KI gespart hast',
      impact: 'ROI-Tracking +1 Punkt', pillarName: 'Steuerung', type: 'ki', priority: 'low'
    });
  }

  // ── KI Zukunftsfähigkeit ──
  if (ki.zukunft < 15) {
    if ((assessment.z1_beobachtung || 0) < 3) {
      allTodos.push({
        text: 'Folge 3-5 KI-News-Quellen und plane 1h/Woche für KI-Trend-Beobachtung',
        impact: 'Beobachtung +2 Punkte', pillarName: 'Zukunftsfähigkeit', type: 'ki', priority: 'medium'
      });
      allTodos.push({
        text: 'Abonniere einen KI-Newsletter (z.B. The Neuron, AI Breakfast) und lies ihn wöchentlich',
        impact: 'Beobachtung +1 Punkt', pillarName: 'Zukunftsfähigkeit', type: 'ki', priority: 'low'
      });
    }
    if ((assessment.z5_geschaeftsideen || 0) < 2) {
      allTodos.push({
        text: 'Brainstorme 3 konkrete Geschäftsideen, die durch neue KI-Modelle möglich werden',
        impact: 'Geschäftsideen +1-2 Punkte', pillarName: 'Zukunftsfähigkeit', type: 'ki', priority: 'low'
      });
    }
    // Zusätzliche Zukunft-Todos
    allTodos.push({
      text: 'Recherchiere, wie dein Wettbewerb KI einsetzt — notiere 3 Erkenntnisse',
      impact: 'Marktbeobachtung +1 Punkt', pillarName: 'Zukunftsfähigkeit', type: 'ki', priority: 'medium'
    });
    allTodos.push({
      text: 'Teste ein brandneues KI-Feature (z.B. GPT-Vision, Claude Artifacts) für deinen Bereich',
      impact: 'Innovation +1 Punkt', pillarName: 'Zukunftsfähigkeit', type: 'ki', priority: 'low'
    });
  }

  // ── Zukunft: Zukunftsbild ──
  if (zk.zukunftsbild < 15) {
    if ((assessment.f1_zukunftsbild || 0) < 2) {
      allTodos.push({
        text: 'Schreibe ein konkretes Zukunftsbild für dein Unternehmen (5-Jahres-Horizont)',
        impact: 'Zukunftsbild +2-3 Punkte', pillarName: 'Zukunftsbild', type: 'zukunft', priority: 'high'
      });
      allTodos.push({
        text: 'Beschreibe in 3 Sätzen, wie dein idealer Arbeitstag in 5 Jahren aussieht',
        impact: 'Zukunftsbild +1 Punkt', pillarName: 'Zukunftsbild', type: 'zukunft', priority: 'medium'
      });
    }
    if ((assessment.f3_trends_wpa || 0) < 2) {
      allTodos.push({
        text: 'Kategorisiere 10 relevante Trends nach Watch-Prepare-Act',
        impact: 'Trend-Analyse +2 Punkte', pillarName: 'Zukunftsbild', type: 'zukunft', priority: 'medium'
      });
    }
    if ((assessment.f4_kontakte_top20 || 0) < 2) {
      allTodos.push({
        text: 'Identifiziere die Top-20 Zukunftsakteure deiner Branche und stelle Kontakt zu 5 her',
        impact: 'Netzwerk +2 Punkte', pillarName: 'Zukunftsbild', type: 'zukunft', priority: 'medium'
      });
    }
    // Zusätzliche Zukunftsbild-Todos
    allTodos.push({
      text: 'Frage 3 Kunden, wie sie sich dein Angebot in 3 Jahren wünschen',
      impact: 'Kundenperspektive +1 Punkt', pillarName: 'Zukunftsbild', type: 'zukunft', priority: 'medium'
    });
    allTodos.push({
      text: 'Lies einen Artikel über Megatrends und notiere 2 Auswirkungen auf dein Geschäft',
      impact: 'Trendverständnis +1 Punkt', pillarName: 'Zukunftsbild', type: 'zukunft', priority: 'low'
    });
  }

  // ── Zukunft: Zukunftsstrategie ──
  if (zk.zukunftsstrategie < 15) {
    if ((assessment.f9_zukunftsstrategie || 0) < 2) {
      allTodos.push({
        text: 'Formuliere eine schriftliche Zukunftsstrategie, die allen Mitarbeitern bekannt ist',
        impact: 'Strategie +3-4 Punkte', pillarName: 'Zukunftsstrategie', type: 'zukunft', priority: 'high'
      });
    }
    if ((assessment.f11_ziele_kpis || 0) < 3) {
      allTodos.push({
        text: 'Breche deine Zukunftsstrategie auf konkrete Quartalsziele mit messbaren KPIs herunter',
        impact: 'Ziele & KPIs +3-4 Punkte', pillarName: 'Zukunftsstrategie', type: 'zukunft', priority: 'high'
      });
    }
    // Zusätzliche Strategie-Todos
    allTodos.push({
      text: 'Erstelle eine einfache SWOT-Analyse für dein Geschäftsmodell in 3 Jahren',
      impact: 'Strategische Klarheit +1 Punkt', pillarName: 'Zukunftsstrategie', type: 'zukunft', priority: 'medium'
    });
    allTodos.push({
      text: 'Definiere 3 "Nicht mehr tun"-Entscheidungen, die Raum für Zukunftsprojekte schaffen',
      impact: 'Fokus +1 Punkt', pillarName: 'Zukunftsstrategie', type: 'zukunft', priority: 'medium'
    });
    allTodos.push({
      text: isSolo ? 'Plane einen halben Tag pro Monat nur für strategische Zukunftsarbeit' : 'Führe ein monatliches Strategie-Review mit dem Kernteam ein',
      impact: 'Strategie-Routine +1-2 Punkte', pillarName: 'Zukunftsstrategie', type: 'zukunft', priority: 'low'
    });
  }

  // ── Zukunft: Zukunftskompetenzen ──
  if (zk.zukunftskompetenzen < 15) {
    if ((assessment.f16_workshops || 0) < 2) {
      allTodos.push({
        text: 'Plane mindestens 2 interne Innovations-Workshops in den nächsten 6 Monaten',
        impact: 'Workshops +1-2 Punkte', pillarName: 'Zukunftskompetenzen', type: 'zukunft', priority: 'medium'
      });
    }
    if ((assessment.f21_externe_netzwerke || 0) < 1) {
      allTodos.push({
        text: 'Tritt einem externen Zukunfts-Netzwerk bei oder starte eine Hochschul-Kooperation',
        impact: 'Netzwerk +2 Punkte', pillarName: 'Zukunftskompetenzen', type: 'zukunft', priority: 'low'
      });
    }
    // Zusätzliche Kompetenz-Todos
    allTodos.push({
      text: 'Identifiziere 3 Kompetenzen, die du in 2 Jahren brauchst, aber heute noch nicht hast',
      impact: 'Kompetenz-Gap +1 Punkt', pillarName: 'Zukunftskompetenzen', type: 'zukunft', priority: 'medium'
    });
    allTodos.push({
      text: 'Buche eine Weiterbildung oder ein Webinar zu einem Zukunftsthema deiner Branche',
      impact: 'Weiterbildung +1 Punkt', pillarName: 'Zukunftskompetenzen', type: 'zukunft', priority: 'low'
    });
    allTodos.push({
      text: isSolo ? 'Finde einen Sparringspartner für monatlichen Zukunfts-Austausch' : 'Starte ein internes "Zukunfts-Tandem" — 2 MA tauschen sich wöchentlich aus',
      impact: 'Vernetzung +1 Punkt', pillarName: 'Zukunftskompetenzen', type: 'zukunft', priority: 'low'
    });
  }

  // ── Zukunft: Umsetzung ──
  if (zk.umsetzung < 15) {
    if ((assessment.f27_conversion_rate || 0) < 2) {
      allTodos.push({
        text: 'Definiere einen klaren Prozess von Idee zu Prototyp (max. 3 Monate Zyklus)',
        impact: 'Conversion Rate +2 Punkte', pillarName: 'Umsetzung', type: 'zukunft', priority: 'high'
      });
    }
    if ((assessment.f25_jahresbudget || 0) < 2) {
      allTodos.push({
        text: 'Reserviere mindestens 2-5% des Jahresbudgets für Zukunfts-Strategieprojekte',
        impact: 'Budget +1-2 Punkte', pillarName: 'Umsetzung', type: 'zukunft', priority: 'medium'
      });
    }
    // Zusätzliche Umsetzung-Todos
    allTodos.push({
      text: 'Starte ein kleines Pilotprojekt diese Woche — Ziel: in 5 Tagen ein erstes Ergebnis',
      impact: 'Umsetzungsgeschwindigkeit +1 Punkt', pillarName: 'Umsetzung', type: 'zukunft', priority: 'medium'
    });
    allTodos.push({
      text: 'Dokumentiere ein gescheitertes Projekt und extrahiere 3 Learnings daraus',
      impact: 'Lernkultur +1 Punkt', pillarName: 'Umsetzung', type: 'zukunft', priority: 'low'
    });
    allTodos.push({
      text: 'Definiere für dein wichtigstes Zukunftsprojekt die nächsten 3 konkreten Schritte',
      impact: 'Projekt-Klarheit +1 Punkt', pillarName: 'Umsetzung', type: 'zukunft', priority: 'medium'
    });
  }

  // ── Sortierung nach Priorität ──
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const defaultTime = { high: '1 Stunde', medium: '2 Stunden', low: '30 Min' };
  allTodos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  allTodos.forEach(t => { if (!t.timeEstimate) t.timeEstimate = defaultTime[t.priority]; });

  // ── Weekly Rotation: Kalenderwoche als Seed ──
  if (allTodos.length <= 6) return allTodos;

  const weekNumber = Math.ceil(
    (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const rotationSeed = weekNumber % allTodos.length;
  const rotatedTodos = [...allTodos.slice(rotationSeed), ...allTodos.slice(0, rotationSeed)];

  return rotatedTodos.slice(0, 6);
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
  if (daysUntil < 0) daysUntil += 7; // < 0 statt <= 0: heute = 0 Tage
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
