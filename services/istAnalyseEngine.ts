// ═══════════════════════════════════════════════════════════════════
// IST-ANALYSE ENGINE: Profilberechnung
// Berechnet Quadrant, Tool-Empfehlung, Blueprint-Empfehlung,
// Persona, Session-Empfehlung, Produkt-Empfehlung aus Antworten
// ═══════════════════════════════════════════════════════════════════

import { IstAnalyse, IstAnalyseProfile } from '../types';
import {
  BLUEPRINT_CATALOG,
  TOOL_CATALOG,
  QUADRANT_DEFINITIONS,
  PERSONA_DEFINITIONS,
} from '../istAnalyseConstants';

// ─── Quadrant-Zuordnung ──────────────────────────────────────

function computeQuadrant(data: IstAnalyse): string {
  const arbeitsform = data.i1_1_arbeitsform;
  const einschraenkungen = data.i2_3_einschraenkungen;
  const toolEntscheider = data.i5_3_tool_entscheider;
  const erfahrung = data.i2_1_erfahrung;

  // Solo vs. Corporate
  const isSolo = arbeitsform === 'solo_freelancer' || arbeitsform === 'angestellter';
  const isCorporate = arbeitsform === 'mittelstand' || arbeitsform === 'konzern';
  const isKlein = arbeitsform === 'kleinunternehmer';

  // Corporate-Flags: Tool-Einschränkungen oder komplexer Genehmigungsprozess
  const hasCorporateFlags =
    einschraenkungen !== 'keine' ||
    toolEntscheider === 'it' ||
    toolEntscheider === 'komplex' ||
    toolEntscheider === 'gf';

  // Erfahrungslevel: Aufbauer vs. Profi
  const erfahrungLevels = ['nie', 'gelegentlich', 'regelmaessig', 'workflows', 'produkte'];
  const erfahrungIndex = erfahrungLevels.indexOf(erfahrung);
  const isProfi = erfahrungIndex >= 2; // regelmaessig oder höher

  if (isCorporate || (isKlein && hasCorporateFlags)) {
    return isProfi ? 'corporate_skalierung' : 'corporate_explorer';
  } else {
    return isProfi ? 'solo_profi' : 'solo_aufbauer';
  }
}

// ─── Tool-Empfehlungen ────────────────────────────────────────

function computeToolRecommendation(data: IstAnalyse): string[] {
  const currentTools = data.i2_2_tools || [];
  const einschraenkungen = data.i2_3_einschraenkungen;
  const budget = data.i4_4_budget;

  const hasBudget = budget !== 'kostenlos';
  const isMicrosoftOnly = einschraenkungen === 'microsoft';
  const isGoogleOnly = einschraenkungen === 'google';

  // Basis: Immer empfehlen wenn noch nicht genutzt
  const recommendations: string[] = [];

  for (const tool of TOOL_CATALOG) {
    // Skip wenn schon genutzt
    const toolValue = tool.tool.toLowerCase().replace(/\s/g, '_');
    if (currentTools.some(t => t === toolValue || tool.tool.toLowerCase().includes(t))) {
      continue;
    }

    // Filter nach Einschränkungen
    if (isMicrosoftOnly && tool.google_only) continue;
    if (isGoogleOnly && tool.microsoft_only) continue;

    // Filter nach Budget
    if (!hasBudget && !tool.kostenlos) continue;

    // Chat-Tools: Mindestens einen empfehlen
    if (tool.kategorie === 'chat') {
      if (recommendations.filter(r => TOOL_CATALOG.find(t => t.tool === r)?.kategorie === 'chat').length < 1) {
        recommendations.push(tool.tool);
      }
    }

    // Automation: Wenn nicht schon eins da
    if (tool.kategorie === 'automation') {
      const hasAutomation = currentTools.some(t =>
        ['n8n', 'make_zapier', 'power_automate'].includes(t)
      );
      if (!hasAutomation && recommendations.filter(r => TOOL_CATALOG.find(t => t.tool === r)?.kategorie === 'automation').length < 1) {
        recommendations.push(tool.tool);
      }
    }
  }

  // Fallback: Immer mindestens ChatGPT + Claude empfehlen
  if (recommendations.length === 0) {
    if (!currentTools.includes('chatgpt')) recommendations.push('ChatGPT');
    if (!currentTools.includes('claude')) recommendations.push('Claude');
  }

  // Bestehende Tools auch auflisten
  const existingToolNames = currentTools
    .filter(t => t !== 'keine')
    .map(t => {
      const found = TOOL_CATALOG.find(tc => tc.tool.toLowerCase().replace(/\s/g, '_') === t);
      return found ? found.tool : t;
    });

  // Kombiniert: Bestehende + Neue, max 5
  const combined = [...new Set([...existingToolNames, ...recommendations])].slice(0, 5);
  return combined.length > 0 ? combined : ['ChatGPT', 'Claude'];
}

// ─── Blueprint-Empfehlung ─────────────────────────────────────

function computeBlueprintRecommendation(data: IstAnalyse): string[] {
  const bereiche = data.i3_1_einsatzbereiche || [];
  const branche = data.i1_2_branche;
  const erfahrung = data.i2_1_erfahrung;

  const erfahrungLevels = ['nie', 'gelegentlich', 'regelmaessig', 'workflows', 'produkte'];
  const userLevel = erfahrungLevels.indexOf(erfahrung);

  // Score jedes Blueprint
  const scored = BLUEPRINT_CATALOG.map(bp => {
    let score = 0;

    // Bereich-Match: +3 pro Übereinstimmung
    for (const bereich of bereiche) {
      if (bp.bereiche.includes(bereich)) score += 3;
    }

    // Branchen-Match: +2
    if (bp.branchen && bp.branchen.includes(branche)) score += 2;

    // Level-Check: Blueprint muss zum Erfahrungslevel passen
    const bpMinLevel = erfahrungLevels.indexOf(bp.minLevel);
    if (userLevel < bpMinLevel) score -= 5; // Zu schwer

    return { ...bp, score };
  });

  // Top 3 nach Score
  return scored
    .filter(bp => bp.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(bp => bp.name);
}

// ─── Persona-Zuordnung (intern) ──────────────────────────────

function computePersona(data: IstAnalyse): string {
  const motivationen = data.i1_5_motivation || [];
  const huerden = data.i3_4_huerden;
  const erfahrung = data.i2_1_erfahrung;

  // Kombiniere relevante Merkmale
  const merkmale = [...motivationen];
  if (huerden) merkmale.push(huerden);

  // Score jede Persona
  let bestPersona = PERSONA_DEFINITIONS[0];
  let bestScore = 0;

  for (const persona of PERSONA_DEFINITIONS) {
    let score = 0;
    for (const merkmal of persona.merkmale) {
      if (merkmale.includes(merkmal)) score++;
    }
    // Entdecker-Bonus bei hohem Erfahrungslevel
    if (persona.id === 'entdecker' && (erfahrung === 'workflows' || erfahrung === 'produkte')) {
      score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestPersona = persona;
    }
  }

  return bestPersona.name;
}

// ─── Session-Empfehlung ──────────────────────────────────────

function computeSessionRecommendation(data: IstAnalyse): string {
  const erfahrung = data.i2_1_erfahrung;
  const erfahrungLevels = ['nie', 'gelegentlich', 'regelmaessig', 'workflows', 'produkte'];
  const level = erfahrungLevels.indexOf(erfahrung);

  // Dienstag = Show&Build (für Anfänger und Fortgeschrittene)
  // Donnerstag = Strategie (für erfahrene Nutzer)
  if (level >= 3) {
    return 'Donnerstag (Strategie & Zukunft)';
  }
  return 'Dienstag (Show & Build)';
}

// ─── Einstiegspunkt-Empfehlung ──────────────────────────────

function computeEinstiegspunkt(data: IstAnalyse): string {
  if (data.einstiegspunkt === 'beides') return 'Beides';
  if (data.einstiegspunkt === 'zukunft') return 'Zukunftsstrategie';
  return 'KI-Mentoring';
}

// ─── Produkt-Empfehlung ─────────────────────────────────────

function computeProduktEmpfehlung(data: IstAnalyse): string {
  const umsetzer = data.i4_3_umsetzer;
  const arbeitsform = data.i1_1_arbeitsform;
  const erfahrung = data.i2_1_erfahrung;
  const teamGroesse = data.i1_4_team_groesse;

  // Booster++: Braucht intensive 1:1 Begleitung
  if (
    umsetzer === 'extern' ||
    umsetzer === 'unklar' ||
    (arbeitsform === 'konzern' && erfahrung === 'nie') ||
    teamGroesse === '20_plus'
  ) {
    return 'Booster++';
  }

  // Booster+: Hat Eigeninitiative, will regelmäßige 1:1s
  if (
    umsetzer === 'selbst' ||
    umsetzer === 'team' ||
    erfahrung === 'regelmaessig' ||
    erfahrung === 'workflows'
  ) {
    return 'Booster+';
  }

  // Basis: Standard
  return 'Basis';
}

// ═══════════════════════════════════════════════════════════════
// HAUPT-FUNKTION: Profil aus Ist-Analyse berechnen
// ═══════════════════════════════════════════════════════════════

export function buildIstAnalyseProfile(
  istAnalyse: IstAnalyse,
  userId: string
): IstAnalyseProfile {
  const quadrantId = computeQuadrant(istAnalyse);
  const quadrantDef = QUADRANT_DEFINITIONS.find(q => q.id === quadrantId);

  return {
    id: `profile_${userId}_${Date.now()}`,
    userId,
    createdAt: Date.now(),

    quadrant: quadrantDef?.name || 'Solo-Aufbauer',
    toolEmpfehlungen: computeToolRecommendation(istAnalyse),
    blueprintEmpfehlungen: computeBlueprintRecommendation(istAnalyse),
    sessionEmpfehlung: computeSessionRecommendation(istAnalyse),
    persona: computePersona(istAnalyse),
    einstiegspunkt: computeEinstiegspunkt(istAnalyse),
    produktEmpfehlung: computeProduktEmpfehlung(istAnalyse),
  };
}
