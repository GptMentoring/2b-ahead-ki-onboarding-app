// ═══════════════════════════════════════════════════════════════════
// 2b AHEAD KI & Zukunft Readiness Assessment — Types v5.1
// Dual-Fragebogen: KI (0-100) + Zukunft (0-100)
// ═══════════════════════════════════════════════════════════════════

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  companyWebsite?: string;
  createdAt: number;
  lastLogin: number;
  assessmentCompleted: boolean;
  istAnalyseCompleted?: boolean;
  isAdmin: boolean;
}

// ─── Assessment (62 Fragen: 4 Meta + 26 KI + 32 Zukunft) ────────

export interface Assessment {
  id: string;
  userId: string;
  createdAt: number;
  status: 'in_progress' | 'completed';

  // ── Meta (nicht bepunktet) ──
  m1_solo: 'solo' | 'team';
  m2_stundensatz: number;
  m3_jahresumsatz: string;
  m4_einschraenkungen: string;

  // ── KI Säule 1: Kompetenz (K1-K6, max 25 Pkt) ──
  k1_nutzungsgrad: number;
  k2_schulungsgrad: number;
  k3_tool_breite: number;
  k4_automations_komplexitaet: number;
  k5_usecase_identifikation: number;
  k6_ki_reflex: number;

  // ── KI Säule 2: Tools & Prozesse (T1-T7, max 25 Pkt) ──
  t1_prozess_abdeckung: number;
  t2_zeiteinsparung: number;
  t3_kosteneinsparung: number;
  t4_umsatzsteigerung: number;
  t5_prozess_doku: number;
  t6_agent_teams: number;
  t7_tool_integration: number;

  // CEC-Hilfswerte (für Berechnung, nicht bepunktet)
  t2_cec_mittelwert?: number;
  t3_cec_wert?: number;
  t4_cec_prozent?: number;

  // ── KI Säule 3: Steuerung (S1-S6, max 25 Pkt) ──
  s1_verantwortung: number;
  s2_zeitallokation: number;
  s3_budget: number;
  s4_roi: number;
  s5_rituale: number;
  s6_umsetzungsplan: number;

  // CEC-Hilfswert
  s3_cec_monatlich?: number;

  // ── KI Säule 4: Zukunftsfähigkeit (Z1-Z6, max 25 Pkt) ──
  z1_beobachtung: number;
  z2_zukunftsvision: number;
  z3_adoptionsgeschwindigkeit: number;
  z4_nextgen: number;
  z5_geschaeftsideen: number;
  z6_netzwerk: number;

  // ── KI Bonus (0-10 Extra) ──
  b1_produktumsatz: number;

  // ── Zukunft Dimension 1: Zukunftsbild (F1-F8, max 25 Pkt) ──
  f1_zukunftsbild: number;
  f2_ma_verstaendnis: number;
  f3_trends_wpa: number;
  f4_kontakte_top20: number;
  f5_tiefeninterviews: number;
  f6_arbeitszeit_analyse: number;
  f7_kosten_struktur: number;
  f8_externe_experten: number;

  // ── Zukunft Dimension 2: Zukunftsstrategie (F9-F14, max 25 Pkt) ──
  f9_zukunftsstrategie: number;
  f10_backcasting: number;
  f11_ziele_kpis: number;
  f12_strategie_gemessen: number;
  f13_arbeitszeit_pruefung: number;
  f14_kosten_monitoring: number;

  // ── Zukunft Dimension 3: Zukunftskompetenzen (F15-F23, max 25 Pkt) ──
  f15_weiterbildung: number;
  f16_workshops: number;
  f17_management_meetings: number;
  f18_trend_beobachtung: number;
  f19_neue_trends: number;
  f20_zielvorgaben: number;
  f21_externe_netzwerke: number;
  f22_kosten_kompetenzen: number;
  f23_gesamtarbeitszeit: number;

  // ── Zukunft Dimension 4: Umsetzung (F24-F32, max 25 Pkt) ──
  f24_methodenkenntnisse: number;
  f25_jahresbudget: number;
  f26_geschaeftsideen_ma: number;
  f27_conversion_rate: number;
  f28_time_to_prototype: number;
  f29_investment_1j: number;
  f30_investment_2j: number;
  f31_investment_3j: number;
  f32_umsatzanteil_neu: number;
}

// ─── Pillar Scores ──────────────────────────────────────────────

export interface KiPillarScores {
  kompetenz: number;    // 0-25
  tools: number;        // 0-25
  steuerung: number;    // 0-25
  zukunft: number;      // 0-25
}

export interface ZukunftPillarScores {
  zukunftsbild: number;         // 0-25
  zukunftsstrategie: number;    // 0-25
  zukunftskompetenzen: number;  // 0-25
  umsetzung: number;            // 0-25
}

// ─── CEC (Corporate Economic Calculator) ─────────────────────────

export interface CECData {
  zeiteinsparungEurJahr: number;
  kosteneinsparungEurJahr: number;
  umsatzsteigerungEurJahr: number;
  gesamtErgebnis: number;
  kiAusgabenJahr: number;
  roi: number;
  // Raw inputs for transparent breakdown
  stundenProWoche: number;
  stundensatz: number;
  kosteneinsparungDirekt: number;
  umsatzProzent: number;
  jahresumsatzCec: number;
  kiMonatlich: number;
}

export interface ZukunftRisikoData {
  zukunftScore: number;
  jahresumsatzCec: number;
  branchenFaktor: number;
  risikoJahr: number;
  risiko3Jahre: number;
}

// ─── Score History ──────────────────────────────────────────────

export interface ScoreHistoryEntry {
  kiScore: number;
  zukunftScore: number;
  date: number; // timestamp
}

// ─── Analysis (Dual Scoring) ─────────────────────────────────────

export interface Analysis {
  id: string;
  assessmentId: string;
  userId: string;
  createdAt: number;

  // KI Readiness Score
  kiScore: number;
  kiPillarScores: KiPillarScores;
  kiBonusScore: number;
  kiTotalScore: number;
  kiMaturityLevel: number;
  kiMaturityName: string;
  cecData: CECData;

  // Zukunft Readiness Score
  zukunftScore: number;
  zukunftPillarScores: ZukunftPillarScores;
  zukunftMaturityLevel: number;
  zukunftMaturityName: string;
  zukunftRisikoData?: ZukunftRisikoData;

  // Progress-Delta (optional, set on re-assessment)
  previousKiScore?: number;
  previousZukunftScore?: number;
  previousAssessmentDate?: number;

  // Score history for sparkline (accumulated across re-assessments)
  scoreHistory?: ScoreHistoryEntry[];

  // Legacy / Admin compatibility
  overallScore: number;
  maturityLevel: string;
}

// ─── Ist-Analyse (Qualitatives Onboarding-Profil) ─────────────────

export interface IstAnalyse {
  id: string;
  userId: string;
  createdAt: number;

  // Einstiegspunkt
  einstiegspunkt: 'ki' | 'zukunft' | 'beides';

  // Modul 1: Über dich & dein Unternehmen
  i1_1_arbeitsform: string;
  i1_2_branche: string;
  i1_2_freitext?: string;
  i1_3_rolle: string;
  i1_4_team_groesse: string;
  i1_5_motivation: string[];       // Multi-Select max 3

  // Modul 2: Aktueller KI-Stand
  i2_1_erfahrung: string;
  i2_2_tools: string[];            // Multi-Select
  i2_2_freitext?: string | null;   // Freitext bei "Andere"
  i2_3_einschraenkungen: string;
  i2_3_freitext?: string;
  i2_4_zeitaufwand: string;
  i2_5_automationen: string;

  // Modul 3: Ziele & Use Cases
  i3_1_einsatzbereiche: string[];  // Multi-Select max 3
  i3_2_dreimonatsziel: string;     // Freitext max 200
  i3_3_usecase?: string;           // Freitext optional
  i3_4_huerden: string;
  i3_4_freitext?: string;

  // Modul 4: Ressourcen & Rahmenbedingungen
  i4_1_zeit_investition: string;
  i4_2_lernstil: string[];         // Multi-Select
  i4_3_umsetzer: string;
  i4_4_budget: string;

  // Modul 5: Team & Organisation (nur bei Team > 1)
  i5_1_team_stimmung?: string;
  i5_2_ki_strategie?: string;
  i5_3_tool_entscheider?: string;

  // Modul 6: Zukunft & Strategie
  i6_1_zukunftsbild?: string;
  i6_2_trendbeobachtung?: string;
  i6_3_strategie_3_5?: string;
  i6_4_investition_zukunft?: string;
  i6_5_zukunftshoffnung?: string[];  // Multi-Select max 2
}

export interface IstAnalyseProfile {
  id: string;
  userId: string;
  createdAt: number;

  quadrant: string;                // "Solo-Aufbauer" | "Solo-Profi" | "Corporate-Explorer" | "Corporate-Skalierung"
  toolEmpfehlungen: string[];     // z.B. ["ChatGPT", "Claude", "n8n"]
  blueprintEmpfehlungen: string[];// Top 3 Use Cases
  sessionEmpfehlung: string;     // "Dienstag" | "Donnerstag"
  persona: string;                // Intern: "Der Pragmatiker" etc.
  einstiegspunkt: string;        // "KI-Mentoring" | "Zukunftsstrategie" | "Beides"
  produktEmpfehlung: string;     // "Basis" | "Booster+" | "Booster++"
}

// ─── Question Definition (für datengetriebenes Rendering) ─────────

export interface QuestionOption {
  label: string;
  points: number;
  cecMittelwert?: number;
}

export interface QuestionDef {
  id: string;
  field: keyof Assessment;
  pillar: string;
  maxPoints: number;
  questionTeam: string;
  questionSolo?: string;
  options: QuestionOption[];
  optionsSolo?: QuestionOption[];
  hint?: string;
  showCecPreview?: boolean;
}
