// ═══════════════════════════════════════════════════════════════════
// 2b AHEAD — Dual Scoring Engine v5.1
// KI Readiness (0-100 + 10 Bonus) + Zukunft Readiness (0-100)
// ═══════════════════════════════════════════════════════════════════

import {
  User, Assessment, Analysis,
  KiPillarScores, ZukunftPillarScores, CECData, ZukunftRisikoData,
  ScoreHistoryEntry
} from '../types';
import {
  KI_MATURITY_LEVELS, ZUKUNFT_MATURITY_LEVELS, JAHRESUMSATZ_RANGES
} from '../constants';

// ─── LocalStorage Keys ─────────────────────────────────────────

const STORAGE_KEY_USER = '2bahead_user';
const STORAGE_KEY_ASSESSMENT = '2bahead_assessment';
const STORAGE_KEY_ANALYSIS = '2bahead_analysis';

// ─── LocalStorage Store ────────────────────────────────────────

export const mockStore = {
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    return data ? JSON.parse(data) : null;
  },

  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  },

  getAssessment: (userId: string): Assessment | null => {
    const data = localStorage.getItem(`${STORAGE_KEY_ASSESSMENT}_${userId}`);
    return data ? JSON.parse(data) : null;
  },

  saveAssessment: (assessment: Assessment) => {
    localStorage.setItem(`${STORAGE_KEY_ASSESSMENT}_${assessment.userId}`, JSON.stringify(assessment));
  },

  getAnalysis: (userId: string): Analysis | null => {
    const data = localStorage.getItem(`${STORAGE_KEY_ANALYSIS}_${userId}`);
    return data ? JSON.parse(data) : null;
  },

  saveAnalysis: (analysis: Analysis) => {
    localStorage.setItem(`${STORAGE_KEY_ANALYSIS}_${analysis.userId}`, JSON.stringify(analysis));
  },

  clear: () => {
    localStorage.clear();
  }
};

// ═══════════════════════════════════════════════════════════════════
// KI SCORING (4 Säulen × 25 = 100 + 10 Bonus)
// ═══════════════════════════════════════════════════════════════════

export function calculateKiPillarScores(a: Partial<Assessment>): KiPillarScores {
  // Säule 1: Kompetenz (K1-K6, max 25)
  const kompetenz =
    (a.k1_nutzungsgrad || 0) +
    (a.k2_schulungsgrad || 0) +
    (a.k3_tool_breite || 0) +
    (a.k4_automations_komplexitaet || 0) +
    (a.k5_usecase_identifikation || 0) +
    (a.k6_ki_reflex || 0);

  // Säule 2: Tools & Prozesse (T1-T7, max 25)
  const tools =
    (a.t1_prozess_abdeckung || 0) +
    (a.t2_zeiteinsparung || 0) +
    (a.t3_kosteneinsparung || 0) +
    (a.t4_umsatzsteigerung || 0) +
    (a.t5_prozess_doku || 0) +
    (a.t6_agent_teams || 0) +
    (a.t7_tool_integration || 0);

  // Säule 3: Steuerung (S1-S6, max 25)
  const steuerung =
    (a.s1_verantwortung || 0) +
    (a.s2_zeitallokation || 0) +
    (a.s3_budget || 0) +
    (a.s4_roi || 0) +
    (a.s5_rituale || 0) +
    (a.s6_umsetzungsplan || 0);

  // Säule 4: Zukunftsfähigkeit (Z1-Z6, max 25)
  const zukunft =
    (a.z1_beobachtung || 0) +
    (a.z2_zukunftsvision || 0) +
    (a.z3_adoptionsgeschwindigkeit || 0) +
    (a.z4_nextgen || 0) +
    (a.z5_geschaeftsideen || 0) +
    (a.z6_netzwerk || 0);

  // Halbe Punkte werden auf Säulen-Ebene gerundet (für Kunden nicht sichtbar)
  return {
    kompetenz: Math.round(kompetenz),
    tools: Math.round(tools),
    steuerung: Math.round(steuerung),
    zukunft: Math.round(zukunft)
  };
}

export function calculateKiOverallScore(pillarScores: KiPillarScores): number {
  return pillarScores.kompetenz + pillarScores.tools + pillarScores.steuerung + pillarScores.zukunft;
}

export function calculateKiBonus(a: Partial<Assessment>): number {
  return a.b1_produktumsatz || 0;
}

export function getKiMaturityLevel(score: number): { level: number; name: string } {
  const found = KI_MATURITY_LEVELS.find(m => score >= m.min && score <= m.max);
  return found
    ? { level: found.level, name: found.name }
    : { level: 1, name: KI_MATURITY_LEVELS[0].name };
}

// ═══════════════════════════════════════════════════════════════════
// CEC (Corporate Economic Calculator)
// ═══════════════════════════════════════════════════════════════════

export function calculateCEC(a: Partial<Assessment>): CECData {
  const stundensatz = a.m2_stundensatz || 0;

  // Jahresumsatz-Mittelwert aus Range
  const jahresumsatzRange = JAHRESUMSATZ_RANGES.find(r => r.value === a.m3_jahresumsatz);
  const jahresumsatzCec = jahresumsatzRange?.cec || 0;

  // Zeiteinsparung = CEC-Mittelwert (Stunden/Woche) × Stundensatz × 52 Wochen
  const cecStundenProWoche = a.t2_cec_mittelwert || 0;
  const zeiteinsparungEurJahr = cecStundenProWoche * stundensatz * 52;

  // Kosteneinsparung = Direkt aus T3-Auswahl
  const kosteneinsparungEurJahr = a.t3_cec_wert || 0;

  // Umsatzsteigerung = T4-Prozent × Jahresumsatz
  const umsatzProzent = a.t4_cec_prozent || 0;
  const umsatzsteigerungEurJahr = umsatzProzent * jahresumsatzCec;

  // Gesamt
  const gesamtErgebnis = zeiteinsparungEurJahr + kosteneinsparungEurJahr + umsatzsteigerungEurJahr;

  // KI-Ausgaben/Jahr = Monatsbudget × 12
  const kiMonatlichVal = a.s3_cec_monatlich || 0;
  const kiAusgabenJahr = kiMonatlichVal * 12;

  // ROI
  const roi = kiAusgabenJahr > 0 ? gesamtErgebnis / kiAusgabenJahr : 0;

  return {
    zeiteinsparungEurJahr,
    kosteneinsparungEurJahr,
    umsatzsteigerungEurJahr,
    gesamtErgebnis,
    kiAusgabenJahr,
    roi,
    // Raw inputs for transparent breakdown
    stundenProWoche: cecStundenProWoche,
    stundensatz,
    kosteneinsparungDirekt: a.t3_cec_wert || 0,
    umsatzProzent,
    jahresumsatzCec,
    kiMonatlich: kiMonatlichVal,
  };
}

export function calculateZukunftRisiko(
  zukunftScore: number,
  jahresumsatzCec: number,
  branchenFaktor: number = 0.15
): ZukunftRisikoData {
  const risikoJahr = jahresumsatzCec * (1 - zukunftScore / 100) * branchenFaktor;
  return {
    zukunftScore,
    jahresumsatzCec,
    branchenFaktor,
    risikoJahr,
    risiko3Jahre: risikoJahr * 3,
  };
}

// ═══════════════════════════════════════════════════════════════════
// ZUKUNFT SCORING (4 Dimensionen × 25 = 100)
// ═══════════════════════════════════════════════════════════════════

export function calculateZukunftPillarScores(a: Partial<Assessment>): ZukunftPillarScores {
  // Dimension 1: Zukunftsbild (F1-F8, max 25)
  const zukunftsbild =
    (a.f1_zukunftsbild || 0) +
    (a.f2_ma_verstaendnis || 0) +
    (a.f3_trends_wpa || 0) +
    (a.f4_kontakte_top20 || 0) +
    (a.f5_tiefeninterviews || 0) +
    (a.f6_arbeitszeit_analyse || 0) +
    (a.f7_kosten_struktur || 0) +
    (a.f8_externe_experten || 0);

  // Dimension 2: Zukunftsstrategie (F9-F14, max 25)
  const zukunftsstrategie =
    (a.f9_zukunftsstrategie || 0) +
    (a.f10_backcasting || 0) +
    (a.f11_ziele_kpis || 0) +
    (a.f12_strategie_gemessen || 0) +
    (a.f13_arbeitszeit_pruefung || 0) +
    (a.f14_kosten_monitoring || 0);

  // Dimension 3: Zukunftskompetenzen (F15-F23, max 25)
  const zukunftskompetenzen =
    (a.f15_weiterbildung || 0) +
    (a.f16_workshops || 0) +
    (a.f17_management_meetings || 0) +
    (a.f18_trend_beobachtung || 0) +
    (a.f19_neue_trends || 0) +
    (a.f20_zielvorgaben || 0) +
    (a.f21_externe_netzwerke || 0) +
    (a.f22_kosten_kompetenzen || 0) +
    (a.f23_gesamtarbeitszeit || 0);

  // Dimension 4: Umsetzung (F24-F32, max 25)
  const umsetzung =
    (a.f24_methodenkenntnisse || 0) +
    (a.f25_jahresbudget || 0) +
    (a.f26_geschaeftsideen_ma || 0) +
    (a.f27_conversion_rate || 0) +
    (a.f28_time_to_prototype || 0) +
    (a.f29_investment_1j || 0) +
    (a.f30_investment_2j || 0) +
    (a.f31_investment_3j || 0) +
    (a.f32_umsatzanteil_neu || 0);

  // Halbe Punkte werden auf Dimensions-Ebene gerundet (für Kunden nicht sichtbar)
  return {
    zukunftsbild: Math.round(zukunftsbild),
    zukunftsstrategie: Math.round(zukunftsstrategie),
    zukunftskompetenzen: Math.round(zukunftskompetenzen),
    umsetzung: Math.round(umsetzung)
  };
}

export function calculateZukunftOverallScore(pillarScores: ZukunftPillarScores): number {
  return pillarScores.zukunftsbild + pillarScores.zukunftsstrategie +
         pillarScores.zukunftskompetenzen + pillarScores.umsetzung;
}

export function getZukunftMaturityLevel(score: number): { level: number; name: string } {
  const found = ZUKUNFT_MATURITY_LEVELS.find(m => score >= m.min && score <= m.max);
  return found
    ? { level: found.level, name: found.name }
    : { level: 1, name: ZUKUNFT_MATURITY_LEVELS[0].name };
}

// ═══════════════════════════════════════════════════════════════════
// FULL ANALYSIS BUILDER
// ═══════════════════════════════════════════════════════════════════

export function buildFullAnalysis(assessment: Partial<Assessment>, userId: string, previousAnalysis?: Analysis | null): Analysis {
  // KI Scoring
  const kiPillarScores = calculateKiPillarScores(assessment);
  const kiScore = calculateKiOverallScore(kiPillarScores);
  const kiBonusScore = calculateKiBonus(assessment);
  const kiTotalScore = kiScore + kiBonusScore;
  const kiMaturity = getKiMaturityLevel(kiScore);

  // CEC
  const cecData = calculateCEC(assessment);

  // Zukunft Scoring
  const zukunftPillarScores = calculateZukunftPillarScores(assessment);
  const zukunftScore = calculateZukunftOverallScore(zukunftPillarScores);
  const zukunftMaturity = getZukunftMaturityLevel(zukunftScore);

  // Zukunft-Risiko
  const zukunftRisikoData = calculateZukunftRisiko(zukunftScore, cecData.jahresumsatzCec);

  return {
    id: 'ana-' + Date.now(),
    assessmentId: assessment.id || '',
    userId,
    createdAt: Date.now(),

    // KI
    kiScore,
    kiPillarScores,
    kiBonusScore,
    kiTotalScore,
    kiMaturityLevel: kiMaturity.level,
    kiMaturityName: kiMaturity.name,
    cecData,

    // Zukunft
    zukunftScore,
    zukunftPillarScores,
    zukunftMaturityLevel: zukunftMaturity.level,
    zukunftMaturityName: zukunftMaturity.name,
    zukunftRisikoData,

    // Progress-Delta
    ...(previousAnalysis ? {
      previousKiScore: previousAnalysis.kiScore,
      previousZukunftScore: previousAnalysis.zukunftScore,
      previousAssessmentDate: previousAnalysis.createdAt,
    } : {}),

    // Score history (accumulate from previous — avoid duplicates)
    scoreHistory: (() => {
      const history: ScoreHistoryEntry[] = [];
      // Carry over existing history entries from previous analysis
      if (previousAnalysis?.scoreHistory && previousAnalysis.scoreHistory.length > 0) {
        history.push(...previousAnalysis.scoreHistory);
      } else if (previousAnalysis) {
        // Fallback: no scoreHistory yet but previous exists — reconstruct
        if (previousAnalysis.previousKiScore != null) {
          history.push({
            kiScore: previousAnalysis.previousKiScore,
            zukunftScore: previousAnalysis.previousZukunftScore || 0,
            date: previousAnalysis.previousAssessmentDate || (Date.now() - 14 * 24 * 60 * 60 * 1000),
          });
        }
        history.push({
          kiScore: previousAnalysis.kiScore,
          zukunftScore: previousAnalysis.zukunftScore,
          date: previousAnalysis.createdAt,
        });
      }
      // Append current scores
      history.push({ kiScore, zukunftScore, date: Date.now() });
      return history;
    })(),

    // Legacy / Admin compat
    overallScore: kiScore,
    maturityLevel: kiMaturity.name,
  };
}
