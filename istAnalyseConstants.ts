// ═══════════════════════════════════════════════════════════════════
// IST-ANALYSE: Qualitatives Onboarding-Profil — Konstanten
// 6 Module, 27+ Fragen, Kataloge, Personas, Quadranten
// Spec: FRAGEBOGEN_IST_ANALYSE.md (25.02.2026)
// ═══════════════════════════════════════════════════════════════════

// ─── Frage-Typen ────────────────────────────────────────────────

export type IstAnalyseQuestionType =
  | 'single-select'
  | 'multi-select'
  | 'freitext'
  | 'single-select-freitext';

export interface IstAnalyseQuestionOption {
  label: string;
  value: string;
}

export interface IstAnalyseQuestionDef {
  id: string;
  module: number;              // 0-6
  field: string;               // Maps to IstAnalyse field
  freitextField?: string;      // Optional Freitext-Feld
  questionText: string;
  type: IstAnalyseQuestionType;
  options?: IstAnalyseQuestionOption[];
  maxSelect?: number;          // For multi-select
  placeholder?: string;        // For freitext
  maxLength?: number;          // For freitext
  optional?: boolean;
  condition?: string;          // z.B. 'team_gt_1' → nur wenn i1_4 != "Nur ich"
}

// ─── Module ────────────────────────────────────────────────────

export interface IstAnalyseModuleDef {
  module: number;
  name: string;
  description: string;
  icon: string;
  condition?: string;
}

export const IST_ANALYSE_MODULES: IstAnalyseModuleDef[] = [
  {
    module: 0,
    name: 'Einstiegspunkt',
    description: 'Über welches Produkt bist du zu uns gekommen?',
    icon: 'rocket',
  },
  {
    module: 1,
    name: 'Über dich & dein Unternehmen',
    description: 'Wir möchten dich und deine Situation kennenlernen.',
    icon: 'user',
  },
  {
    module: 2,
    name: 'Aktueller KI-Stand',
    description: 'Wo stehst du heute mit KI?',
    icon: 'robot',
  },
  {
    module: 3,
    name: 'Ziele & Use Cases',
    description: 'Was willst du mit KI erreichen?',
    icon: 'target',
  },
  {
    module: 4,
    name: 'Ressourcen & Rahmenbedingungen',
    description: 'Was steht dir zur Verfügung?',
    icon: 'gear',
  },
  {
    module: 5,
    name: 'Team & Organisation',
    description: 'Wie steht dein Team zu KI?',
    icon: 'users',
    condition: 'team_gt_1',
  },
  {
    module: 6,
    name: 'Zukunft & Strategie',
    description: 'Wie bereit bist du für die Zukunft?',
    icon: 'compass',
  },
];

// ─── Alle Fragen ──────────────────────────────────────────────

export const IST_ANALYSE_QUESTIONS: IstAnalyseQuestionDef[] = [

  // ── Modul 0: Einstiegspunkt ──────────────────────────────────
  {
    id: 'einstieg_0',
    module: 0,
    field: 'einstiegspunkt',
    questionText: 'Über welches Produkt bist du eingestiegen?',
    type: 'single-select',
    options: [
      { label: 'KI-Mentoring (Andreas)', value: 'ki' },
      { label: 'Zukunftsstrategie (Harald)', value: 'zukunft' },
      { label: 'Beides', value: 'beides' },
    ],
  },

  // ── Modul 1: Über dich & dein Unternehmen ─────────────────────
  {
    id: 'i1_1',
    module: 1,
    field: 'i1_1_arbeitsform',
    questionText: 'Wie arbeitest du?',
    type: 'single-select',
    options: [
      { label: 'Solo-Freelancer', value: 'solo_freelancer' },
      { label: 'Kleinunternehmer (2-10 MA)', value: 'kleinunternehmer' },
      { label: 'Mittelstand (11-250 MA)', value: 'mittelstand' },
      { label: 'Konzern (250+ MA)', value: 'konzern' },
      { label: 'Angestellter in Unternehmen', value: 'angestellter' },
    ],
  },
  {
    id: 'i1_2',
    module: 1,
    field: 'i1_2_branche',
    freitextField: 'i1_2_freitext',
    questionText: 'In welcher Branche bist du tätig?',
    type: 'single-select-freitext',
    options: [
      { label: 'Beratung / Coaching', value: 'beratung' },
      { label: 'Marketing / Agentur', value: 'marketing' },
      { label: 'IT / Software', value: 'it' },
      { label: 'E-Commerce', value: 'ecommerce' },
      { label: 'Handwerk', value: 'handwerk' },
      { label: 'Gesundheit', value: 'gesundheit' },
      { label: 'Bildung', value: 'bildung' },
      { label: 'Industrie', value: 'industrie' },
      { label: 'Finanzen', value: 'finanzen' },
      { label: 'Sonstiges', value: 'sonstiges' },
    ],
  },
  {
    id: 'i1_3',
    module: 1,
    field: 'i1_3_rolle',
    questionText: 'Was ist deine Rolle?',
    type: 'single-select',
    options: [
      { label: 'Geschäftsführer / Inhaber', value: 'gf' },
      { label: 'Abteilungsleiter', value: 'abteilungsleiter' },
      { label: 'Mitarbeiter', value: 'mitarbeiter' },
      { label: 'Freelancer', value: 'freelancer' },
      { label: 'Berater', value: 'berater' },
    ],
  },
  {
    id: 'i1_4',
    module: 1,
    field: 'i1_4_team_groesse',
    questionText: 'Wie viele Personen in deinem Team/Unternehmen nutzen oder sollen KI nutzen?',
    type: 'single-select',
    options: [
      { label: 'Nur ich', value: 'nur_ich' },
      { label: '2-5', value: '2_5' },
      { label: '6-20', value: '6_20' },
      { label: '20+', value: '20_plus' },
    ],
  },
  {
    id: 'i1_5',
    module: 1,
    field: 'i1_5_motivation',
    questionText: 'Was ist deine größte Motivation für die Teilnahme? (max. 3)',
    type: 'multi-select',
    maxSelect: 3,
    options: [
      { label: 'Zeit sparen', value: 'zeit' },
      { label: 'Umsatz steigern', value: 'umsatz' },
      { label: 'Wettbewerbsvorteil', value: 'wettbewerb' },
      { label: 'Nicht abgehängt werden', value: 'fomo' },
      { label: 'Team befähigen', value: 'team' },
      { label: 'Neue Geschäftsmodelle', value: 'geschaeftsmodelle' },
      { label: 'Prozesse optimieren', value: 'prozesse' },
      { label: 'Neugier', value: 'neugier' },
    ],
  },

  // ── Modul 2: Aktueller KI-Stand ──────────────────────────────
  {
    id: 'i2_1',
    module: 2,
    field: 'i2_1_erfahrung',
    questionText: 'Wie würdest du deine KI-Erfahrung beschreiben?',
    type: 'single-select',
    options: [
      { label: 'Noch nie aktiv genutzt', value: 'nie' },
      { label: 'Gelegentlich ausprobiert (ChatGPT etc.)', value: 'gelegentlich' },
      { label: 'Nutze KI regelmäßig im Alltag', value: 'regelmaessig' },
      { label: 'Habe eigene Workflows/Automationen gebaut', value: 'workflows' },
      { label: 'Entwickle KI-basierte Produkte/Services', value: 'produkte' },
    ],
  },
  {
    id: 'i2_2',
    module: 2,
    field: 'i2_2_tools',
    freitextField: 'i2_2_freitext',
    questionText: 'Welche KI-Tools nutzt du aktuell?',
    type: 'multi-select',
    options: [
      { label: 'ChatGPT', value: 'chatgpt' },
      { label: 'Claude', value: 'claude' },
      { label: 'Gemini', value: 'gemini' },
      { label: 'Copilot (Microsoft)', value: 'copilot' },
      { label: 'Midjourney / DALL-E', value: 'bildgen' },
      { label: 'n8n', value: 'n8n' },
      { label: 'Make / Zapier', value: 'make_zapier' },
      { label: 'Power Automate', value: 'power_automate' },
      { label: 'Claude Code', value: 'claude_code' },
      { label: 'Cursor', value: 'cursor' },
      { label: 'Andere', value: 'andere' },
      { label: 'Keine', value: 'keine' },
    ],
  },
  {
    id: 'i2_3',
    module: 2,
    field: 'i2_3_einschraenkungen',
    freitextField: 'i2_3_freitext',
    questionText: 'Gibt es Tool-Einschränkungen in deinem Unternehmen?',
    type: 'single-select-freitext',
    options: [
      { label: 'Nein, freie Wahl', value: 'keine' },
      { label: 'Ja, nur Microsoft-Tools', value: 'microsoft' },
      { label: 'Ja, nur Google-Tools', value: 'google' },
      { label: 'Ja, andere Einschränkungen', value: 'andere' },
    ],
  },
  {
    id: 'i2_4',
    module: 2,
    field: 'i2_4_zeitaufwand',
    questionText: 'Wie viel Zeit verbringst du aktuell pro Woche mit KI-Themen?',
    type: 'single-select',
    options: [
      { label: '< 1 Stunde', value: 'unter_1h' },
      { label: '1-3 Stunden', value: '1_3h' },
      { label: '3-5 Stunden', value: '3_5h' },
      { label: '5-10 Stunden', value: '5_10h' },
      { label: '10+ Stunden', value: '10_plus' },
    ],
  },
  {
    id: 'i2_5',
    module: 2,
    field: 'i2_5_automationen',
    questionText: 'Hast du schon mal eine Automation oder einen Workflow mit KI gebaut?',
    type: 'single-select',
    options: [
      { label: 'Nein, noch nie', value: 'nein' },
      { label: 'Ja, mit Hilfe (Tutorial/Workshop)', value: 'mit_hilfe' },
      { label: 'Ja, eigenständig (1-2 Stück)', value: 'eigenstaendig_wenig' },
      { label: 'Ja, mehrere (3+)', value: 'eigenstaendig_viel' },
    ],
  },

  // ── Modul 3: Ziele & Use Cases ───────────────────────────────
  {
    id: 'i3_1',
    module: 3,
    field: 'i3_1_einsatzbereiche',
    questionText: 'In welchen Bereichen willst du KI einsetzen? (max. 3)',
    type: 'multi-select',
    maxSelect: 3,
    options: [
      { label: 'Lead-Generierung', value: 'leads' },
      { label: 'Content-Erstellung', value: 'content' },
      { label: 'Social Media', value: 'social' },
      { label: 'Kundenservice / Chatbot', value: 'kundenservice' },
      { label: 'Interne Prozesse', value: 'prozesse' },
      { label: 'Coding / Entwicklung', value: 'coding' },
      { label: 'Recherche / Analyse', value: 'recherche' },
      { label: 'Reporting / Dashboards', value: 'reporting' },
      { label: 'Produktentwicklung', value: 'produkt' },
      { label: 'Vertrieb', value: 'vertrieb' },
      { label: 'HR', value: 'hr' },
    ],
  },
  {
    id: 'i3_2',
    module: 3,
    field: 'i3_2_dreimonatsziel',
    questionText: 'Was ist dein wichtigstes Ziel in den nächsten 3 Monaten?',
    type: 'freitext',
    placeholder: 'Ich möchte in 3 Monaten ...',
    maxLength: 200,
  },
  {
    id: 'i3_3',
    module: 3,
    field: 'i3_3_usecase',
    questionText: 'Hast du einen konkreten Use Case, den du umsetzen willst?',
    type: 'freitext',
    placeholder: 'Beschreibe deinen Use Case ...',
    maxLength: 300,
    optional: true,
  },
  {
    id: 'i3_4',
    module: 3,
    field: 'i3_4_huerden',
    freitextField: 'i3_4_freitext',
    questionText: 'Was ist deine größte Hürde beim KI-Einsatz?',
    type: 'single-select-freitext',
    options: [
      { label: 'Weiß nicht wo anfangen', value: 'orientierung' },
      { label: 'Keine Zeit', value: 'zeit' },
      { label: 'Technisch unsicher', value: 'technik' },
      { label: 'Kein Budget', value: 'budget' },
      { label: 'IT/Compliance-Vorgaben', value: 'compliance' },
      { label: 'Angst vor Fehlern', value: 'angst' },
      { label: 'Team zieht nicht mit', value: 'team' },
      { label: 'Andere', value: 'andere' },
    ],
  },

  // ── Modul 4: Ressourcen & Rahmenbedingungen ──────────────────
  {
    id: 'i4_1',
    module: 4,
    field: 'i4_1_zeit_investition',
    questionText: 'Wie viel Zeit kannst du realistisch pro Woche für KI-Umsetzung investieren?',
    type: 'single-select',
    options: [
      { label: '< 1 Stunde', value: 'unter_1h' },
      { label: '1-3 Stunden', value: '1_3h' },
      { label: '3-5 Stunden', value: '3_5h' },
      { label: '5+ Stunden', value: '5_plus' },
    ],
  },
  {
    id: 'i4_2',
    module: 4,
    field: 'i4_2_lernstil',
    questionText: 'Wie lernst du am liebsten?',
    type: 'multi-select',
    options: [
      { label: 'Live-Sessions', value: 'live' },
      { label: 'Videos / Aufzeichnungen', value: 'videos' },
      { label: 'Schritt-für-Schritt-Anleitungen', value: 'anleitungen' },
      { label: 'Selber ausprobieren (Learning by Doing)', value: 'learning_by_doing' },
      { label: '1:1 Begleitung', value: 'eins_zu_eins' },
    ],
  },
  {
    id: 'i4_3',
    module: 4,
    field: 'i4_3_umsetzer',
    questionText: 'Wer setzt KI-Projekte bei dir um?',
    type: 'single-select',
    options: [
      { label: 'Ich selbst', value: 'selbst' },
      { label: 'Jemand aus meinem Team', value: 'team' },
      { label: 'Externer Dienstleister', value: 'extern' },
      { label: 'Mix aus mehreren', value: 'mix' },
      { label: 'Weiß noch nicht', value: 'unklar' },
    ],
  },
  {
    id: 'i4_4',
    module: 4,
    field: 'i4_4_budget',
    questionText: 'Hast du Budget für KI-Tools? (monatlich)',
    type: 'single-select',
    options: [
      { label: 'Nur kostenlose Tools', value: 'kostenlos' },
      { label: 'Bis 50 EUR/Monat', value: 'bis_50' },
      { label: '50-200 EUR/Monat', value: '50_200' },
      { label: '200+ EUR/Monat', value: '200_plus' },
      { label: 'Weiß nicht', value: 'unklar' },
    ],
  },

  // ── Modul 5: Team & Organisation (nur bei Team > 1) ──────────
  {
    id: 'i5_1',
    module: 5,
    field: 'i5_1_team_stimmung',
    questionText: 'Wie steht dein Team/deine Kollegen zu KI?',
    type: 'single-select',
    condition: 'team_gt_1',
    options: [
      { label: 'Begeistert — wollen sofort loslegen', value: 'begeistert' },
      { label: 'Offen, aber unsicher', value: 'offen' },
      { label: 'Skeptisch — "Brauchen wir das?"', value: 'skeptisch' },
      { label: 'Ablehnend — "Macht uns überflüssig"', value: 'ablehnend' },
      { label: 'Gemischt', value: 'gemischt' },
    ],
  },
  {
    id: 'i5_2',
    module: 5,
    field: 'i5_2_ki_strategie',
    questionText: 'Gibt es in deinem Unternehmen eine KI-Strategie?',
    type: 'single-select',
    condition: 'team_gt_1',
    options: [
      { label: 'Nein, keine', value: 'keine' },
      { label: 'Ansätze, aber nichts Formelles', value: 'ansaetze' },
      { label: 'Ja, aber wird nicht umgesetzt', value: 'vorhanden_inaktiv' },
      { label: 'Ja, aktiv in Umsetzung', value: 'aktiv' },
    ],
  },
  {
    id: 'i5_3',
    module: 5,
    field: 'i5_3_tool_entscheider',
    questionText: 'Wer entscheidet über den Einsatz neuer Tools?',
    type: 'single-select',
    condition: 'team_gt_1',
    options: [
      { label: 'Ich selbst', value: 'selbst' },
      { label: 'Mein Vorgesetzter', value: 'vorgesetzter' },
      { label: 'IT-Abteilung', value: 'it' },
      { label: 'Geschäftsführung', value: 'gf' },
      { label: 'Komplizierter Genehmigungsprozess', value: 'komplex' },
    ],
  },

  // ── Modul 6: Zukunft & Strategie ─────────────────────────────
  {
    id: 'i6_1',
    module: 6,
    field: 'i6_1_zukunftsbild',
    questionText: 'Hast du ein klares Bild davon, wie dein Business/deine Branche in 5-10 Jahren aussieht?',
    type: 'single-select',
    options: [
      { label: 'Nein, keine Vorstellung', value: 'keine' },
      { label: 'Grobe Idee, aber nicht ausgearbeitet', value: 'grob' },
      { label: 'Ja, aber nicht dokumentiert', value: 'undokumentiert' },
      { label: 'Ja, dokumentierte Zukunftsvision', value: 'dokumentiert' },
    ],
  },
  {
    id: 'i6_2',
    module: 6,
    field: 'i6_2_trendbeobachtung',
    questionText: 'Beschäftigst du dich regelmäßig mit Zukunftstrends (Studien, Podcasts, Konferenzen)?',
    type: 'single-select',
    options: [
      { label: 'Nie', value: 'nie' },
      { label: 'Gelegentlich (1x/Monat)', value: 'gelegentlich' },
      { label: 'Regelmäßig (1x/Woche)', value: 'regelmaessig' },
      { label: 'Intensiv (täglicher Bestandteil)', value: 'intensiv' },
    ],
  },
  {
    id: 'i6_3',
    module: 6,
    field: 'i6_3_strategie_3_5',
    questionText: 'Hast du eine Strategie für die nächsten 3-5 Jahre?',
    type: 'single-select',
    options: [
      { label: 'Nein', value: 'nein' },
      { label: 'Ansätze, nicht formalisiert', value: 'ansaetze' },
      { label: 'Ja, dokumentiert', value: 'dokumentiert' },
      { label: 'Ja, wird aktiv umgesetzt und regelmäßig aktualisiert', value: 'aktiv' },
    ],
  },
  {
    id: 'i6_4',
    module: 6,
    field: 'i6_4_investition_zukunft',
    questionText: 'Investierst du bewusst in neue Geschäftsfelder oder Angebote für die Zukunft?',
    type: 'single-select',
    options: [
      { label: 'Nein', value: 'nein' },
      { label: 'Denke darüber nach', value: 'gedanken' },
      { label: 'Ja, erste Schritte', value: 'erste_schritte' },
      { label: 'Ja, aktiv und budgetiert', value: 'aktiv' },
    ],
  },
  {
    id: 'i6_5',
    module: 6,
    field: 'i6_5_zukunftshoffnung',
    questionText: 'Was erhoffst du dir von der Zukunftsarbeit? (max. 2)',
    type: 'multi-select',
    maxSelect: 2,
    options: [
      { label: 'Klarheit über die Zukunft meiner Branche', value: 'klarheit' },
      { label: 'Neue Geschäftsmodelle entwickeln', value: 'geschaeftsmodelle' },
      { label: 'Mein bestehendes Modell zukunftsfest machen', value: 'zukunftsfest' },
      { label: 'Wettbewerbsvorteile erkennen', value: 'wettbewerb' },
      { label: 'Strategische Richtung finden', value: 'richtung' },
    ],
  },
];

// ─── Blueprint-Katalog ────────────────────────────────────────

export interface BlueprintDef {
  id: string;
  name: string;
  beschreibung: string;
  bereiche: string[];      // Matching: i3_1 values
  branchen?: string[];     // Optional Matching: i1_2 values
  minLevel: string;        // Minimum KI-Erfahrung: 'nie' | 'gelegentlich' | ...
}

export const BLUEPRINT_CATALOG: BlueprintDef[] = [
  {
    id: 'lead_scraper',
    name: 'Lead-Scraper',
    beschreibung: 'Automatisierte Lead-Recherche und Qualifizierung',
    bereiche: ['leads', 'vertrieb'],
    minLevel: 'gelegentlich',
  },
  {
    id: 'content_pipeline',
    name: 'Content-Pipeline',
    beschreibung: 'KI-gestützter Content-Erstellungs-Workflow',
    bereiche: ['content', 'social'],
    minLevel: 'gelegentlich',
  },
  {
    id: 'chatbot_kundenservice',
    name: 'Kundenservice-Chatbot',
    beschreibung: 'Automatisierter Kundensupport mit KI',
    bereiche: ['kundenservice'],
    minLevel: 'regelmaessig',
  },
  {
    id: 'research_agent',
    name: 'Research-Agent',
    beschreibung: 'KI-Agent für automatisierte Recherche und Analyse',
    bereiche: ['recherche', 'reporting'],
    minLevel: 'gelegentlich',
  },
  {
    id: 'social_media_autopilot',
    name: 'Social-Media-Autopilot',
    beschreibung: 'Automatisierte Social-Media-Planung und -Erstellung',
    bereiche: ['social', 'content'],
    minLevel: 'gelegentlich',
  },
  {
    id: 'prozess_automatisierung',
    name: 'Prozess-Automatisierung',
    beschreibung: 'Interne Prozesse mit KI automatisieren',
    bereiche: ['prozesse'],
    minLevel: 'gelegentlich',
  },
  {
    id: 'code_assistent',
    name: 'KI-Code-Assistent',
    beschreibung: 'Entwicklungsworkflow mit KI-Unterstützung',
    bereiche: ['coding'],
    minLevel: 'regelmaessig',
  },
  {
    id: 'reporting_dashboard',
    name: 'KI-Reporting',
    beschreibung: 'Automatische Reports und Dashboards generieren',
    bereiche: ['reporting', 'recherche'],
    minLevel: 'regelmaessig',
  },
  {
    id: 'vertrieb_assistent',
    name: 'Vertriebs-Assistent',
    beschreibung: 'KI-gestützte Vertriebsunterstützung',
    bereiche: ['vertrieb', 'leads'],
    minLevel: 'gelegentlich',
  },
  {
    id: 'produkt_innovation',
    name: 'Produkt-Innovation',
    beschreibung: 'KI für Produktentwicklung und Innovation',
    bereiche: ['produkt'],
    minLevel: 'workflows',
  },
  {
    id: 'hr_automatisierung',
    name: 'HR-Automatisierung',
    beschreibung: 'KI im Personalwesen einsetzen',
    bereiche: ['hr', 'prozesse'],
    minLevel: 'gelegentlich',
  },
  {
    id: 'email_marketing',
    name: 'E-Mail-Marketing-Agent',
    beschreibung: 'Personalisierte E-Mail-Kampagnen mit KI',
    bereiche: ['content', 'vertrieb', 'leads'],
    branchen: ['marketing', 'ecommerce'],
    minLevel: 'gelegentlich',
  },
];

// ─── Tool-Empfehlungen ───────────────────────────────────────

export interface ToolRecommendation {
  tool: string;
  kategorie: 'chat' | 'automation' | 'code' | 'bild' | 'office';
  kostenlos: boolean;
  microsoft_only?: boolean;
  google_only?: boolean;
}

export const TOOL_CATALOG: ToolRecommendation[] = [
  { tool: 'ChatGPT', kategorie: 'chat', kostenlos: true },
  { tool: 'Claude', kategorie: 'chat', kostenlos: true },
  { tool: 'Gemini', kategorie: 'chat', kostenlos: true, google_only: true },
  { tool: 'Copilot (Microsoft 365)', kategorie: 'office', kostenlos: false, microsoft_only: true },
  { tool: 'n8n', kategorie: 'automation', kostenlos: true },
  { tool: 'Make', kategorie: 'automation', kostenlos: true },
  { tool: 'Power Automate', kategorie: 'automation', kostenlos: false, microsoft_only: true },
  { tool: 'Claude Code', kategorie: 'code', kostenlos: false },
  { tool: 'Cursor', kategorie: 'code', kostenlos: true },
  { tool: 'Midjourney', kategorie: 'bild', kostenlos: false },
  { tool: 'DALL-E', kategorie: 'bild', kostenlos: false },
];

// ─── Quadrant-Definitionen ───────────────────────────────────

export interface QuadrantDef {
  id: string;
  name: string;
  beschreibung: string;
  icon: string;
}

export const QUADRANT_DEFINITIONS: QuadrantDef[] = [
  {
    id: 'solo_aufbauer',
    name: 'Solo-Aufbauer',
    beschreibung: 'Du bist allein unterwegs und baust gerade deine KI-Kompetenz auf. Perfekt für schnelle Umsetzung mit direktem Impact.',
    icon: 'rocket',
  },
  {
    id: 'solo_profi',
    name: 'Solo-Profi',
    beschreibung: 'Du arbeitest eigenständig und nutzt KI bereits fortgeschritten. Fokus auf Skalierung und neue Geschäftsmodelle.',
    icon: 'star',
  },
  {
    id: 'corporate_explorer',
    name: 'Corporate-Explorer',
    beschreibung: 'Du arbeitest in einem Unternehmen und explorierst KI-Möglichkeiten. Brückenbauer zwischen Innovation und Organisation.',
    icon: 'search',
  },
  {
    id: 'corporate_skalierung',
    name: 'Corporate-Skalierung',
    beschreibung: 'Du skalierst KI im Unternehmen. Fokus auf Team-Enablement, Prozesse und strategische Integration.',
    icon: 'trendUp',
  },
];

// ─── Persona-Definitionen (intern, nur Admin sichtbar) ───────

export interface PersonaDef {
  id: string;
  name: string;
  beschreibung: string;
  merkmale: string[];
}

export const PERSONA_DEFINITIONS: PersonaDef[] = [
  {
    id: 'pragmatiker',
    name: 'Der Pragmatiker',
    beschreibung: 'Will schnelle, greifbare Ergebnisse. Kein Interesse an Theorie.',
    merkmale: ['zeit', 'prozesse', 'orientierung'],
  },
  {
    id: 'visionaer',
    name: 'Der Visionär',
    beschreibung: 'Denkt groß, will neue Geschäftsmodelle und Zukunft gestalten.',
    merkmale: ['geschaeftsmodelle', 'wettbewerb', 'umsatz'],
  },
  {
    id: 'skeptiker',
    name: 'Der Vorsichtige',
    beschreibung: 'Will sicher gehen, hat Bedenken. Braucht Vertrauen und Beweise.',
    merkmale: ['fomo', 'angst', 'technik'],
  },
  {
    id: 'teamplayer',
    name: 'Der Teamplayer',
    beschreibung: 'Will das Team mitnehmen. Change-Management ist zentral.',
    merkmale: ['team', 'prozesse'],
  },
  {
    id: 'entdecker',
    name: 'Der Entdecker',
    beschreibung: 'Neugierig und experimentierfreudig. Probiert gerne Neues aus.',
    merkmale: ['neugier'],
  },
];

// ─── Modul-Reihenfolge nach Einstiegspunkt ──────────────────

export function getModuleOrder(einstiegspunkt: string, hasTeam: boolean): number[] {
  const kiModules = [1, 2, 3, 4];
  const teamModule = hasTeam ? [5] : [];
  const zukunftModule = [6];

  switch (einstiegspunkt) {
    case 'zukunft':
      return [0, ...zukunftModule, ...kiModules, ...teamModule];
    case 'beides':
      return [0, ...kiModules, ...teamModule, ...zukunftModule];
    case 'ki':
    default:
      return [0, ...kiModules, ...teamModule, ...zukunftModule];
  }
}

// ─── Hilfsfunktionen ───────────────────────────────────────────

export function getQuestionsForModule(moduleNumber: number): IstAnalyseQuestionDef[] {
  return IST_ANALYSE_QUESTIONS.filter(q => q.module === moduleNumber);
}

export function getModuleDef(moduleNumber: number): IstAnalyseModuleDef | undefined {
  return IST_ANALYSE_MODULES.find(m => m.module === moduleNumber);
}
