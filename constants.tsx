// ═══════════════════════════════════════════════════════════════════
// 2b AHEAD KI & Zukunft Readiness Assessment — Constants v5.1
// ═══════════════════════════════════════════════════════════════════

import { QuestionDef } from './types';

// ─── Design Tokens ──────────────────────────────────────────────

export const COLORS = {
  PRIMARY: '#64162D',       // burgundy (KI)
  PRIMARY_LIGHT: '#8E2442',
  ZUKUNFT: '#1E3A5F',      // blau (Zukunft)
  ZUKUNFT_LIGHT: '#2B5B8A',
  ACCENT: '#4A5568',
  GOLD: '#8E6D2F',
  SURFACE: '#FDFCFD',
  TEXT_DARK: '#111827',
  TEXT_MUTED: '#374151',
  WHITE: '#FFFFFF',
  SUCCESS: '#065F46',
  BG_GRADIENT: 'linear-gradient(135deg, #FDFCFD 0%, #F7F2F4 100%)'
};

export const LOGO_URL = 'https://2bahead.com/svg/header/logo-dark.svg';

// ─── Pillar Names ───────────────────────────────────────────────

export const KI_PILLAR_NAMES: Record<string, string> = {
  kompetenz: 'Kompetenz',
  tools: 'Tools & Prozesse',
  steuerung: 'Steuerung',
  zukunft: 'Zukunftsfähigkeit'
};

export const ZUKUNFT_PILLAR_NAMES: Record<string, string> = {
  zukunftsbild: 'Zukunftsbild',
  zukunftsstrategie: 'Zukunftsstrategie',
  zukunftskompetenzen: 'Zukunftskompetenzen',
  umsetzung: 'Umsetzung'
};

// ─── Maturity Levels ────────────────────────────────────────────

export const KI_MATURITY_LEVELS = [
  { level: 1, min: 0, max: 10, name: 'Neugierig', desc: 'Kein KI-Einsatz. Interesse vorhanden, aber keine Umsetzung.', vertrieb: 'KI Community (Selbstlernen)',
    checklist: [
      'Erstes KI-Tool ausprobieren (ChatGPT, Claude, Gemini)',
      'Einen einfachen Prompt schreiben und Ergebnis bewerten',
      'Verstehen, was LLM, Agent und Assistent bedeuten',
      'Ersten Anwendungsfall f\u00FCr den eigenen Alltag identifizieren',
      '1 Stunde pro Woche KI-Weiterbildung starten',
    ]},
  { level: 2, min: 11, max: 20, name: 'Entdecker', desc: 'Erste KI-Tools getestet. Gelegentliche Nutzung. Kein System.', vertrieb: 'Show & Build Sessions (Di)',
    checklist: [
      'Mindestens 1 KI-Tool t\u00E4glich nutzen (\u22651h/Tag)',
      'KI-Weiterbildung regelm\u00E4\u00DFig durchf\u00FChren (\u22652h/Woche)',
      '1\u20132 KI-Tools produktiv im Einsatz (nicht nur getestet)',
      'Erste Prompt-Templates oder Custom GPTs erstellt',
      'Mindestens 1\u20133 KI-Anwendungsf\u00E4lle dokumentiert',
      'KI bei ersten neuen Aufgaben als Werkzeug einsetzen',
    ]},
  { level: 3, min: 21, max: 30, name: 'Anwender', desc: 'Regelm\u00E4\u00DFige KI-Nutzung in Einzelbereichen. Erste Ergebnisse sichtbar.', vertrieb: 'Show & Build + 1:1 Coaching',
    checklist: [
      'T\u00E4gliche KI-Nutzung (\u22652h/Tag) oder \u226525% des Teams nutzt KI t\u00E4glich',
      '3\u20135 verschiedene KI-Tools produktiv im Einsatz',
      'Erste mehrstufige Workflows gebaut (Make, N8N, Zapier)',
      '4\u201310 Use Cases dokumentiert',
      'Erste Kernprozesse mit KI-Unterst\u00FCtzung (\u226410%)',
      'Erste messbare Zeiteinsparung (1\u20135h/Woche)',
      'Monatliches KI-Budget festgelegt (\u2265100\u20AC Solo / \u22651.000\u20AC Team)',
    ]},
  { level: 4, min: 31, max: 40, name: 'Optimierer', desc: 'KI in mehreren Prozessen. Erste Automationen. Messbare Einsparungen.', vertrieb: 'Intensive 1:1 KI-Begleitung',
    checklist: [
      'KI-Nutzung bei 26\u201350% des Teams (oder 2\u20134h/Tag Solo)',
      '6+ KI-Tools produktiv im Einsatz',
      'Integrierte Agenten mit API-Anbindungen gebaut',
      '11+ Use Cases dokumentiert',
      '11\u201325% Kernprozesse mit KI-Unterst\u00FCtzung',
      'Erste KI-Agent-Teams im produktiven Einsatz',
      'Erste Prozesse schriftlich dokumentiert (4\u201310)',
      'KI-Ziele/KPIs f\u00FCr das Quartal definiert',
      'Regelm\u00E4\u00DFige KI-Community-Teilnahme (1\u00D7/Monat)',
    ]},
  { level: 5, min: 41, max: 50, name: 'Stratege', desc: 'KI-Strategie vorhanden. Budget allokiert. Team geschult. ROI messbar.', vertrieb: 'Wöchentliche KI-Strategie (1:1)',
    checklist: [
      'Schriftlicher KI-Umsetzungsplan mit 4\u20138 Meilensteinen',
      'KI-Budget \u2265300\u20AC/Mo (Solo) oder \u22653.000\u20AC/Mo (Team)',
      'ROI durch KI berechenbar und positiv (ROI \u22651)',
      'Regelm\u00E4\u00DFige KI-Termine (2\u20133/Monat)',
      '5\u201310% Arbeitszeit fest f\u00FCr KI allokiert',
      '26\u201350% Kernprozesse mit KI abgedeckt',
      '11+ Prozesse schriftlich dokumentiert',
      '2\u20133 Agent-Teams im produktiven Einsatz',
      'KI-Tools teilweise mit Systemen integriert (<25%)',
    ]},
  { level: 6, min: 51, max: 60, name: 'Integrator', desc: 'KI systematisch in Kernprozesse integriert. Agent-Teams im Einsatz.', vertrieb: 'KI-Skalierung & Strategie (1:1)',
    checklist: [
      '50%+ KI-Nutzung im Team (oder 4+h/Tag Solo)',
      '50%+ Mitarbeiter im KI-Schulungsprogramm',
      '50%+ Kernprozesse mit KI-Unterst\u00FCtzung',
      '4\u20136 Agent-Teams produktiv im Einsatz',
      '25\u201350% KI-Tools mit bestehenden Systemen integriert',
      'ROI 3\u201310x durch KI nachweisbar',
      'KI als erster Reflex bei 7\u201310 von 10 neuen Aufgaben',
      '3\u20135h/Woche langfristige KI-Beobachtung',
      'KI-Zukunftsvision f\u00FCr 4\u20138 Gesch\u00E4ftsprozesse',
    ]},
  { level: 7, min: 61, max: 70, name: 'Transformer', desc: 'KI ver\u00E4ndert Gesch\u00E4ftsmodell. Hoher Automatisierungsgrad. KI-Kultur etabliert.', vertrieb: '\u2014',
    checklist: [
      '76\u2013100% KI-Nutzung im Team (oder 6+h/Tag Solo)',
      '20+ Prozesse schriftlich dokumentiert',
      '7+ Agent-Teams im produktiven Einsatz',
      '50%+ KI-Tool-Integration mit Systemen',
      '20%+ Arbeitszeit fest f\u00FCr KI allokiert',
      'ROI 10\u201350x durch KI',
      '9+ Meilensteine im KI-12-Monats-Plan',
      '6\u20138h/Woche KI-Zukunftsbeobachtung',
      'Erste KI-basierte Gesch\u00E4ftsfeld-Ideen dokumentiert',
    ]},
  { level: 8, min: 71, max: 80, name: 'Innovator', desc: 'Eigene KI-L\u00F6sungen. Wettbewerbsvorteil durch KI. Vordenker in der Branche.', vertrieb: '\u2014',
    checklist: [
      'Custom-Code KI-L\u00F6sungen (eigene Scripts, Apps) produktiv',
      '20+ Use Cases dokumentiert und umgesetzt',
      '50%+ Prozess-Abdeckung mit KI',
      'KI-Budget \u2265600\u20AC/Mo (Solo) oder \u22657.000\u20AC/Mo (Team)',
      '5\u20136 Next-Gen-KI-Bereiche aktiv exploriert',
      '6\u201310 KI-Zukunfts-Gesch\u00E4ftsideen dokumentiert',
      'Regelm\u00E4\u00DFiges KI-Zukunfts-Netzwerk (4\u201310 Personen)',
      'KI-Produktumsatz gestartet (<5% Gesamtumsatz)',
    ]},
  { level: 9, min: 81, max: 90, name: 'Leader', desc: 'KI als Kernkompetenz. Komplexe Agent-Systeme. Signifikanter KI-Umsatz.', vertrieb: '\u2014',
    checklist: [
      'Komplexe Multi-Agent-Systeme im Einsatz',
      'KI in allen Kernprozessen integriert',
      'ROI 50+',
      'Alle 7 Next-Gen-KI-Bereiche aktiv exploriert',
      '10+ KI-basierte Gesch\u00E4ftsideen dokumentiert',
      'KI-Produktumsatz 5\u201320% des Gesamtumsatzes',
      'KI-Zukunfts-Netzwerk mit 10+ Experten',
      '9h+/Woche langfristige KI-Beobachtung',
    ]},
  { level: 10, min: 91, max: 100, name: 'AI-Native', desc: 'Vollst\u00E4ndig KI-durchdrungen. Agent-Teams f\u00FChren Workflows autonom.', vertrieb: '\u2014',
    checklist: [
      'Agent-Teams f\u00FChren 100% der Workflows autonom',
      '100% der Mitarbeiter nutzen KI t\u00E4glich und sind geschult',
      'Alle KI-Tools vollst\u00E4ndig mit Systemen integriert',
      'KI-Produktumsatz >30% des Gesamtumsatzes',
      'Branchenf\u00FChrer in KI-Anwendung',
      'Eigene Foundation Models oder spezialisierte KI-L\u00F6sungen',
    ]},
];

export const ZUKUNFT_MATURITY_LEVELS = [
  { level: 1, min: 0, max: 10, name: 'Gegenwartsmanager', desc: 'Arbeitet ausschlie\u00DFlich operativ im Hier und Jetzt.', vertrieb: 'Zukunfts-Community (Selbstlernen)',
    checklist: [
      'Erste Zukunftstrends der eigenen Branche beobachten (3\u20135 Trends)',
      'Erste Diskussion \u00FCber die Zukunft der Branche f\u00FChren',
      'Regelm\u00E4\u00DFig Podcasts, Studien oder Fachmedien zu Zukunftsthemen konsumieren',
      'Mindestens 1% Arbeitszeit f\u00FCr Zukunftsanalyse einplanen',
      'Ersten Kontakt zu einem externen Zukunftsexperten herstellen',
    ]},
  { level: 2, min: 11, max: 20, name: 'Zukunftsbeobachter', desc: 'Beginnt, Zukunftsthemen wahrzunehmen.', vertrieb: 'Zukunftsstrategie Sessions (Do)',
    checklist: [
      '5\u201310 Zukunftstrends systematisch beobachten',
      'Erste schriftliche Beschreibung der Branchenentwicklung erstellen',
      '1% Arbeitszeit f\u00FCr strukturierte Zukunftsanalyse',
      'Erste Kontakte zu externen Zukunftsexperten aufbauen',
      'Erste Innovationsinitiativen starten',
      'An Weiterbildung zu Zukunftsthemen teilnehmen',
    ]},
  { level: 3, min: 21, max: 30, name: 'Zukunftsanalyst', desc: 'Erstes strukturiertes Verst\u00E4ndnis des Marktumfeldes.', vertrieb: 'Zukunftsstrategie + 1:1 Coaching',
    checklist: [
      '10\u201320 Zukunftstrends dokumentiert',
      'Trends klar nach Watch-Prepare-Act einordnen',
      '1\u20132% Arbeitszeit f\u00FCr Zukunftsanalyse',
      'Regelm\u00E4\u00DFiger Austausch mit externen Experten',
      'Erste Pilotprojekte aus Zukunftsideen umsetzen',
      'Interne Zukunfts- oder Innovationsworkshops durchf\u00FChren',
      '1\u20132% Budget f\u00FCr Zukunfts- oder Innovationsarbeit',
    ]},
  { level: 4, min: 31, max: 40, name: 'Zukunftsarchitekt', desc: 'Zukunftsarbeit wird organisatorisch verankert.', vertrieb: 'Intensive 1:1 Zukunftsberatung',
    checklist: [
      'Dokumentiertes 5-Jahres-Zukunftsbild der Branche',
      'Zukunftsstrategie mittels Backcasting aus dem Zukunftsbild ableiten',
      'Ziele mit KPIs und Quartalszielen definieren',
      '2\u20133% Arbeitszeit f\u00FCr Strategiearbeit',
      '2\u20133% Umsatzinvestitionen in zuk\u00FCnftige Gesch\u00E4ftsfelder',
      'Erste Geschäftsideen pro Mitarbeiter einreichen',
      'Methodenkenntnisse aufbauen (BSC, OKR, Roadmapping)',
    ]},
  { level: 5, min: 41, max: 50, name: 'Zukunftsstratege', desc: 'Explizite Zukunftsstrategie auf Basis des Zukunftsbildes.', vertrieb: 'Wöchentliche Zukunftsstrategie (1:1)',
    checklist: [
      'Regelm\u00E4\u00DFige Strategie-Reviews etablieren',
      '3\u20134% Arbeitszeit f\u00FCr Zukunft und Strategiearbeit',
      'Organisatorische Struktur f\u00FCr Strategie-Monitoring aufbauen',
      '3\u20135% Budget f\u00FCr Zukunftsprojekte',
      'Erste systematische Innovationsportfolios anlegen',
      'Strukturierte Tiefeninterviews mit Zukunftsakteuren f\u00FChren (5+)',
      'Ideen innerhalb von 6\u201312 Monaten in Prototypen \u00FCberf\u00FChren',
    ]},
  { level: 6, min: 51, max: 60, name: 'Zukunftslenker', desc: 'Zukunftsstrategie wird aktiv gesteuert und \u00FCberpr\u00FCft.', vertrieb: 'Zukunfts-Skalierung & Strategie (1:1)',
    checklist: [
      '20+ Zukunftstrends systematisch beobachtet',
      'Dedizierte Teams oder Verantwortlichkeiten f\u00FCr Zukunftsarbeit',
      '4\u20136% Arbeitszeit f\u00FCr Zukunft, Strategie und Innovation',
      '5% Umsatzinvestitionen in zuk\u00FCnftige Gesch\u00E4ftsfelder',
      '5\u201310% Umsatzanteil aus Produkten <12 Monate',
      'Klare Zielvorgaben f\u00FCr Erkundung neuer Zukunftstrends',
      'Zusammenarbeit mit externen Netzwerken und Think Tanks',
    ]},
  { level: 7, min: 61, max: 70, name: 'Zukunftsorganisator', desc: 'Zukunftsarbeit ist Teil der Organisationsstruktur.', vertrieb: '\u2014',
    checklist: [
      'Zukunftsbilder beeinflussen strategische Entscheidungen',
      '6\u20138% Arbeitszeit f\u00FCr Zukunft und Innovation',
      '5\u20138% Umsatzinvestitionen in neue Gesch\u00E4ftsfelder',
      '10\u201315% Umsatzanteil aus neuen Produkten',
      'Aktive Zusammenarbeit mit Wissenschaft und Think Tanks',
      'Idee\u2192Prototyp in unter 3\u20136 Monaten',
      'Conversion Rate Idee\u2192Prototyp \u226520%',
    ]},
  { level: 8, min: 71, max: 80, name: 'Zukunftsintegrator', desc: 'Zukunftsorientierung pr\u00E4gt Investitionsentscheidungen.', vertrieb: '\u2014',
    checklist: [
      'Strategische Suchfelder f\u00FCr neue Gesch\u00E4ftsmodelle definiert',
      '8\u201310% Arbeitszeit f\u00FCr Zukunft und Innovation',
      '8\u201310% Umsatzinvestitionen in zuk\u00FCnftige M\u00E4rkte',
      '15\u201320% Umsatzanteil aus neuen Produkten',
      'Portfolio radikaler Innovationsprojekte aufgebaut',
      'Mehrj\u00E4hrige Investitions-Pipeline (1J + 2J + 3J Horizont)',
    ]},
  { level: 9, min: 81, max: 90, name: 'Zukunftsinnovator', desc: 'Systematisch neue Gesch\u00E4ftsmodelle aus Zukunftsbildern.', vertrieb: '\u2014',
    checklist: [
      'Zukunftsbilder als Referenz f\u00FCr ALLE strategischen Entscheidungen',
      '>10% Arbeitszeit f\u00FCr Zukunft, Strategie und Innovation',
      '>10% Umsatzinvestitionen in zuk\u00FCnftige Gesch\u00E4ftsfelder',
      '>20% Umsatzanteil aus neuen Produkten',
      'Aktive Rolle als Innovationsf\u00FChrer im \u00D6kosystem',
      'Idee\u2192Prototyp in unter 3 Monaten',
    ]},
  { level: 10, min: 91, max: 100, name: 'Zukunftsgestalter', desc: 'Gestaltet aktiv die Entwicklung seiner Branche.', vertrieb: '\u2014',
    checklist: [
      'Die Branche orientiert sich an Ihren Zukunftsbildern',
      'Setzt neue Marktstandards durch Innovation',
      'Anerkannter Zukunftsgestalter und Innovationsf\u00FChrer',
      'Kontinuierlicher Strom neuer Gesch\u00E4ftsmodelle und Produkte',
      'Ökosystem aus Partnern, Wissenschaft und Zukunftsakteuren',
    ]},
];

// ─── Aufstiegs-Checklisten (v4.0 Konzept, pro Säule) ─────────
// Schlüssel = Ziel-Level (was der User erreichen will)
// Quelle: Konzept v4.0 Sektion 8 + KI_READINESS_V5 + HARALD_FRAGEBOGEN_V2

export interface AufstiegsDetail {
  zeitrahmen: string;
  wow: string;
  byPillar: Record<string, string[]>;
}

export const KI_AUFSTIEGS_DETAILS: Record<number, AufstiegsDetail> = {
  2: {
    zeitrahmen: '4–8 Wochen',
    wow: 'Mein erster Custom GPT funktioniert und spart mir 30 Min/Woche!',
    byPillar: {
      'Kompetenz': [
        'Verstehe, was generative KI für dein Geschäft bedeuten kann',
        'Teste mindestens 1 KI-Tool (ChatGPT, Claude, Gemini)',
        'Nutze es mindestens 1×/Woche für eine echte Aufgabe',
      ],
      'Tools & Prozesse': [
        'Einfachen Prompt für eine wiederkehrende Aufgabe erstellen',
        'Ersten Custom GPT oder gespeicherten Prompt anlegen',
      ],
      'Steuerung': [
        '1 Stunde/Woche fest für KI einplanen',
        'Konkretes erstes KI-Ziel definieren',
      ],
      'Zukunftsfähigkeit': [
        '3 wichtigste Prozesse aufschreiben (auch grob)',
        '1×/Woche KI-Neuigkeiten lesen',
      ],
    },
  },
  3: {
    zeitrahmen: '6–10 Wochen',
    wow: 'Mein erster automatisierter Prozess läuft — ich spare 2–3 Stunden/Woche!',
    byPillar: {
      'Kompetenz': [
        'KI-Tools mindestens 3×/Woche für echte Aufgaben nutzen',
        'Prompting-Grundlagen beherrschen: Kontext, Rolle, Schritt-für-Schritt',
        'Mind. 2 Mentoring-Sessions/Monat besuchen',
      ],
      'Tools & Prozesse': [
        'Ersten echten Geschäftsprozess mit KI abbilden',
        'Zeitersparnis grob messen',
        'Mindestens 2 verschiedene KI-Tools vergleichen',
      ],
      'Steuerung': [
        '2–3 Stunden/Woche für KI einplanen',
        'Konkretes KI-Ziel für die nächsten 8 Wochen setzen',
      ],
      'Zukunftsfähigkeit': [
        '5 wichtigste Arbeitsprozesse dokumentieren',
        'Groben KI-Fahrplan für 3 Monate erstellen',
      ],
    },
  },
  4: {
    zeitrahmen: '8–12 Wochen',
    wow: 'Ich habe ein System — nicht nur einzelne Tools. Und ich kann den ROI beziffern!',
    byPillar: {
      'Kompetenz': [
        'Mind. 2 Personen nutzen KI regelmäßig (oder du schulst andere)',
        'Beherrsche 2+ verschiedene KI-Tools sicher',
        'Ergebnisse in Peer-Session präsentieren',
      ],
      'Tools & Prozesse': [
        '10–30% der Kernprozesse mit KI abdecken',
        'Mind. 20% Produktivitätssteigerung messbar nachweisen',
        'Erste Automatisierung einrichten (Make, N8N, Zapier)',
      ],
      'Steuerung': [
        'Klare KI-Verantwortlichkeit definieren',
        '5–15% Arbeitszeit für KI einplanen',
        'Monatliches KI-Budget festlegen (auch klein)',
      ],
      'Zukunftsfähigkeit': [
        'Eigene KI-Lösung auf Basis deiner Daten planen',
        'Ersten Prototyp erstellen (Custom GPT mit Daten)',
      ],
    },
  },
  5: {
    zeitrahmen: '8–16 Wochen',
    wow: 'KI ist kein Experiment mehr — es ist Teil meines normalen Geschäfts.',
    byPillar: {
      'Kompetenz': [
        '2–5 Personen nutzen KI regelmäßig',
        'Mind. 1 Person hat KI-Mentoring absolviert',
      ],
      'Tools & Prozesse': [
        '30–60% der Kernprozesse mit KI abdecken',
        '500–2.000 EUR/Monat Kosteneinsparung erreichen',
      ],
      'Steuerung': [
        'Dedizierte KI-Verantwortung etablieren (nicht nebenbei)',
        'KI-Budget 500–2.000 EUR/Monat aufbauen',
        'KPIs systematisch messen',
      ],
      'Zukunftsfähigkeit': [
        'Eigene KI auf eigenen Daten trainieren',
        'Ersten KI-basierten Service in Entwicklung bringen',
      ],
    },
  },
  6: {
    zeitrahmen: '8–16 Wochen',
    wow: 'Mein Business läuft deutlich effizienter — und ich baue eigene KI-Produkte!',
    byPillar: {
      'Kompetenz': [
        '6–20 Personen nutzen KI (Solo: KI in allen Kernbereichen)',
        'KI-Multiplikatoren schulen andere',
      ],
      'Tools & Prozesse': [
        'Über 60% der Kernprozesse mit KI abdecken',
        'Über 2.000 EUR/Monat Kosteneinsparung erzielen',
      ],
      'Steuerung': [
        'KI-Budget planbar und ROI-positiv',
        'Regelmäßige KI-Retrospektiven im Team',
      ],
      'Zukunftsfähigkeit': [
        'KI-Produkt wird Kunden angeboten',
        'Erster Umsatz aus KI-Produkten erzielen',
        'AI Agents aktiv testen und systematisches Tool-Monitoring aufbauen',
      ],
    },
  },
  7: {
    zeitrahmen: '12–20 Wochen',
    wow: 'Mein Team denkt KI-First — wir bauen, was die Konkurrenz nicht kann!',
    byPillar: {
      'Kompetenz': [
        '76–100% KI-Nutzung im Team (oder 6+h/Tag Solo)',
        'KI als erster Reflex bei 9+ von 10 neuen Aufgaben',
      ],
      'Tools & Prozesse': [
        '20+ Prozesse schriftlich dokumentiert',
        '7+ Agent-Teams im produktiven Einsatz',
        '50%+ KI-Tool-Integration mit bestehenden Systemen',
      ],
      'Steuerung': [
        '20%+ Arbeitszeit fest für KI allokiert',
        'ROI 10–50× durch KI',
        '9+ Meilensteine im KI-12-Monats-Plan',
      ],
      'Zukunftsfähigkeit': [
        '6–8h/Woche KI-Zukunftsbeobachtung',
        'Erste KI-basierte Geschäftsfeld-Ideen dokumentiert',
      ],
    },
  },
  8: {
    zeitrahmen: '16–24 Wochen',
    wow: 'Wir sind Innovationsführer — eigene KI-Produkte am Markt!',
    byPillar: {
      'Kompetenz': [
        'Custom-Code KI-Lösungen (eigene Scripts, Apps) produktiv',
        '20+ Use Cases dokumentiert und umgesetzt',
      ],
      'Tools & Prozesse': [
        '50%+ Prozess-Abdeckung mit KI',
        'KI-Budget ≥600 EUR/Mo (Solo) oder ≥7.000 EUR/Mo (Team)',
      ],
      'Steuerung': [
        'ROI systematisch gemessen und optimiert',
        'KI-Strategie als Teil der Unternehmensstrategie',
      ],
      'Zukunftsfähigkeit': [
        '5–6 Next-Gen-KI-Bereiche aktiv exploriert',
        '6–10 KI-Zukunfts-Geschäftsideen dokumentiert',
        'Regelmäßiges KI-Zukunfts-Netzwerk (4–10 Personen)',
        'KI-Produktumsatz gestartet (<5% Gesamtumsatz)',
      ],
    },
  },
  9: {
    zeitrahmen: '24+ Wochen',
    wow: 'KI ist unsere Kernkompetenz — signifikanter Umsatz durch KI-Produkte!',
    byPillar: {
      'Kompetenz': [
        'Komplexe Multi-Agent-Systeme im Einsatz',
        'KI in allen Kernprozessen integriert',
      ],
      'Tools & Prozesse': [
        'Vollständige Automatisierung aller Kernprozesse',
        'Eigene Foundation Models oder spezialisierte KI-Lösungen',
      ],
      'Steuerung': [
        'ROI 50+',
        'KI-Budget als strategische Investition (nicht Kostenstelle)',
      ],
      'Zukunftsfähigkeit': [
        'Alle 7 Next-Gen-KI-Bereiche aktiv exploriert',
        '10+ KI-basierte Geschäftsideen dokumentiert',
        'KI-Produktumsatz 5–20% des Gesamtumsatzes',
        'KI-Zukunfts-Netzwerk mit 10+ Experten',
      ],
    },
  },
  10: {
    zeitrahmen: 'Fortlaufend',
    wow: 'Wir gestalten die KI-Zukunft unserer Branche aktiv mit!',
    byPillar: {
      'Kompetenz': [
        'Agent-Teams führen 100% der Workflows autonom',
        '100% der Mitarbeiter nutzen KI täglich und sind geschult',
      ],
      'Tools & Prozesse': [
        'Alle KI-Tools vollständig mit Systemen integriert',
        'Eigene KI-Infrastruktur aufgebaut',
      ],
      'Steuerung': [
        'KI-Governance als Branchenstandard setzen',
        'Vordenker-Rolle in KI-Anwendung',
      ],
      'Zukunftsfähigkeit': [
        'KI-Produktumsatz >30% des Gesamtumsatzes',
        'Branchenführer in KI-Anwendung',
        'Eigene Foundation Models oder spezialisierte KI-Lösungen',
      ],
    },
  },
};

export const ZUKUNFT_AUFSTIEGS_DETAILS: Record<number, AufstiegsDetail> = {
  2: {
    zeitrahmen: '6–10 Wochen',
    wow: 'Ich beobachte Zukunftstrends strukturiert — nicht mehr nur zufällig!',
    byPillar: {
      'Zukunftsbild': [
        '5–10 Zukunftstrends systematisch beobachten',
        'Erste schriftliche Beschreibung der Branchenentwicklung erstellen',
      ],
      'Zukunftsstrategie': [
        'Erste Überlegungen zur langfristigen Positionierung anstellen',
      ],
      'Zukunftskompetenzen': [
        'An Weiterbildung zu Zukunftsthemen teilnehmen',
        '1% Arbeitszeit für strukturierte Zukunftsanalyse einplanen',
      ],
      'Umsetzung': [
        'Erste Kontakte zu externen Zukunftsexperten aufbauen',
        'Erste Innovationsinitiativen starten',
      ],
    },
  },
  3: {
    zeitrahmen: '8–12 Wochen',
    wow: 'Ich ordne Trends nach Watch-Prepare-Act ein — und handle danach!',
    byPillar: {
      'Zukunftsbild': [
        '10–20 Zukunftstrends dokumentiert',
        'Trends klar nach Watch-Prepare-Act einordnen',
      ],
      'Zukunftsstrategie': [
        'Erstes Zukunftsbild für die Branche formulieren',
      ],
      'Zukunftskompetenzen': [
        '1–2% Arbeitszeit für Zukunftsanalyse einplanen',
        'Regelmäßiger Austausch mit externen Experten',
        'Interne Zukunfts- oder Innovationsworkshops durchführen',
      ],
      'Umsetzung': [
        'Erste Pilotprojekte aus Zukunftsideen umsetzen',
        '1–2% Budget für Zukunfts- oder Innovationsarbeit',
      ],
    },
  },
  4: {
    zeitrahmen: '10–16 Wochen',
    wow: 'Wir haben ein dokumentiertes 5-Jahres-Zukunftsbild und handeln danach!',
    byPillar: {
      'Zukunftsbild': [
        'Dokumentiertes 5-Jahres-Zukunftsbild der Branche erstellen',
      ],
      'Zukunftsstrategie': [
        'Zukunftsstrategie mittels Backcasting aus dem Zukunftsbild ableiten',
        'Ziele mit KPIs und Quartalszielen definieren',
      ],
      'Zukunftskompetenzen': [
        '2–3% Arbeitszeit für Strategiearbeit aufwenden',
        'Methodenkenntnisse aufbauen (BSC, OKR, Roadmapping)',
      ],
      'Umsetzung': [
        '2–3% Umsatzinvestitionen in zukünftige Geschäftsfelder',
        'Erste Geschäftsideen pro Mitarbeiter einreichen',
      ],
    },
  },
  5: {
    zeitrahmen: '12–20 Wochen',
    wow: 'Unsere Zukunftsstrategie wird regelmäßig gemessen und angepasst!',
    byPillar: {
      'Zukunftsbild': [
        'Strukturierte Tiefeninterviews mit Zukunftsakteuren führen (5+)',
      ],
      'Zukunftsstrategie': [
        'Regelmäßige Strategie-Reviews etablieren',
        'Organisatorische Struktur für Strategie-Monitoring aufbauen',
      ],
      'Zukunftskompetenzen': [
        '3–4% Arbeitszeit für Zukunft und Strategiearbeit',
        '3–5% Budget für Zukunftsprojekte',
      ],
      'Umsetzung': [
        'Erste systematische Innovationsportfolios anlegen',
        'Ideen innerhalb von 6–12 Monaten in Prototypen überführen',
      ],
    },
  },
  6: {
    zeitrahmen: '12–20 Wochen',
    wow: 'Wir haben dedizierte Zukunftsteams und erste neue Produkte am Markt!',
    byPillar: {
      'Zukunftsbild': [
        '20+ Zukunftstrends systematisch beobachtet',
      ],
      'Zukunftsstrategie': [
        'Klare Zielvorgaben für Erkundung neuer Zukunftstrends',
      ],
      'Zukunftskompetenzen': [
        'Dedizierte Teams oder Verantwortlichkeiten für Zukunftsarbeit',
        '4–6% Arbeitszeit für Zukunft, Strategie und Innovation',
        'Zusammenarbeit mit externen Netzwerken und Think Tanks',
      ],
      'Umsetzung': [
        '5% Umsatzinvestitionen in zukünftige Geschäftsfelder',
        '5–10% Umsatzanteil aus Produkten <12 Monate',
      ],
    },
  },
  7: {
    zeitrahmen: '16–24 Wochen',
    wow: 'Zukunftsarbeit ist fester Teil unserer Organisationsstruktur!',
    byPillar: {
      'Zukunftsbild': [
        'Zukunftsbilder beeinflussen strategische Entscheidungen',
      ],
      'Zukunftsstrategie': [
        'Conversion Rate Idee→Prototyp ≥20%',
      ],
      'Zukunftskompetenzen': [
        '6–8% Arbeitszeit für Zukunft und Innovation',
        'Aktive Zusammenarbeit mit Wissenschaft und Think Tanks',
      ],
      'Umsetzung': [
        '5–8% Umsatzinvestitionen in neue Geschäftsfelder',
        '10–15% Umsatzanteil aus neuen Produkten',
        'Idee→Prototyp in unter 3–6 Monaten',
      ],
    },
  },
  8: {
    zeitrahmen: '20–30 Wochen',
    wow: 'Unsere Zukunftsorientierung prägt alle Investitionsentscheidungen!',
    byPillar: {
      'Zukunftsbild': [
        'Strategische Suchfelder für neue Geschäftsmodelle definiert',
      ],
      'Zukunftsstrategie': [
        'Mehrjährige Investitions-Pipeline (1J + 2J + 3J Horizont)',
      ],
      'Zukunftskompetenzen': [
        '8–10% Arbeitszeit für Zukunft und Innovation',
      ],
      'Umsetzung': [
        '8–10% Umsatzinvestitionen in zukünftige Märkte',
        '15–20% Umsatzanteil aus neuen Produkten',
        'Portfolio radikaler Innovationsprojekte aufgebaut',
      ],
    },
  },
  9: {
    zeitrahmen: '24+ Wochen',
    wow: 'Wir bauen systematisch neue Geschäftsmodelle aus Zukunftsbildern!',
    byPillar: {
      'Zukunftsbild': [
        'Zukunftsbilder als Referenz für ALLE strategischen Entscheidungen',
      ],
      'Zukunftsstrategie': [
        '>10% Umsatzinvestitionen in zukünftige Geschäftsfelder',
      ],
      'Zukunftskompetenzen': [
        '>10% Arbeitszeit für Zukunft, Strategie und Innovation',
        'Aktive Rolle als Innovationsführer im Ökosystem',
      ],
      'Umsetzung': [
        '>20% Umsatzanteil aus neuen Produkten',
        'Idee→Prototyp in unter 3 Monaten',
      ],
    },
  },
  10: {
    zeitrahmen: 'Fortlaufend',
    wow: 'Wir gestalten aktiv die Zukunft unserer gesamten Branche!',
    byPillar: {
      'Zukunftsbild': [
        'Die Branche orientiert sich an Ihren Zukunftsbildern',
      ],
      'Zukunftsstrategie': [
        'Setzt neue Marktstandards durch Innovation',
      ],
      'Zukunftskompetenzen': [
        'Anerkannter Zukunftsgestalter und Innovationsführer',
        'Ökosystem aus Partnern, Wissenschaft und Zukunftsakteuren',
      ],
      'Umsetzung': [
        'Kontinuierlicher Strom neuer Geschäftsmodelle und Produkte',
      ],
    },
  },
};

// ─── Jahresumsatz Ranges (für M3 und CEC) ─────────────────────

export const JAHRESUMSATZ_RANGES = [
  { label: '0 \u20AC (Pre-Revenue / Startup)', value: '0', cec: 0 },
  { label: 'unter 50.000 \u20AC', value: '<50k', cec: 25000 },
  { label: '50.000 \u2013 100.000 \u20AC', value: '50-100k', cec: 75000 },
  { label: '100.000 \u2013 250.000 \u20AC', value: '100-250k', cec: 175000 },
  { label: '250.000 \u2013 500.000 \u20AC', value: '250-500k', cec: 375000 },
  { label: '500.000 \u2013 1 Mio. \u20AC', value: '500k-1m', cec: 750000 },
  { label: '1 \u2013 5 Mio. \u20AC', value: '1-5m', cec: 3000000 },
  { label: '5 \u2013 20 Mio. \u20AC', value: '5-20m', cec: 12500000 },
  { label: '\u00FCber 20 Mio. \u20AC', value: '>20m', cec: 30000000 },
];

// ═══════════════════════════════════════════════════════════════════
// KI READINESS FRAGEN (26 scored + 4 Meta = 30)
// ═══════════════════════════════════════════════════════════════════

export const KI_QUESTIONS: QuestionDef[] = [
  // ── Säule 1: Kompetenz (K1-K6, 25 Pkt) ──
  {
    id: 'K1', field: 'k1_nutzungsgrad', pillar: 'kompetenz', maxPoints: 5,
    questionTeam: 'Wie viel Prozent deiner Mitarbeiter nutzen KI-Tools mindestens 1\u00D7 pro Tag?',
    questionSolo: 'Wie viele Stunden pro Tag arbeitest du aktiv mit KI-Tools?',
    options: [
      { label: '0%', points: 0 }, { label: '\u226410%', points: 1 }, { label: '11\u201325%', points: 2 },
      { label: '26\u201350%', points: 3 }, { label: '51\u201375%', points: 4 }, { label: '76\u2013100%', points: 5 },
    ],
    optionsSolo: [
      { label: '0h', points: 0 }, { label: '<1h', points: 1 }, { label: '1\u20132h', points: 2 },
      { label: '2\u20134h', points: 3 }, { label: '4\u20136h', points: 4 }, { label: '6h+', points: 5 },
    ],
  },
  {
    id: 'K2', field: 'k2_schulungsgrad', pillar: 'kompetenz', maxPoints: 5,
    questionTeam: 'Wie viel Prozent deiner Mitarbeiter haben ein KI-Schulungsprogramm absolviert oder sind aktuell in einem?',
    questionSolo: 'Wie viele Stunden pro Woche investierst du gezielt in KI-Weiterbildung?',
    options: [
      { label: '0%', points: 0 }, { label: '\u226410%', points: 1 }, { label: '11\u201325%', points: 2 },
      { label: '26\u201350%', points: 3 }, { label: '51\u201375%', points: 4 }, { label: '76\u2013100%', points: 5 },
    ],
    optionsSolo: [
      { label: '0h', points: 0 }, { label: '1h', points: 1 }, { label: '2h', points: 2 },
      { label: '4h', points: 3 }, { label: '6h', points: 4 }, { label: '8h+', points: 5 },
    ],
  },
  {
    id: 'K3', field: 'k3_tool_breite', pillar: 'kompetenz', maxPoints: 4,
    questionTeam: 'Wie viele verschiedene KI-Tools setzt du/dein Team produktiv ein (nicht nur getestet)?',
    options: [
      { label: '0', points: 0 }, { label: '1\u20132', points: 1 }, { label: '3\u20135', points: 2 },
      { label: '6\u201310', points: 3 }, { label: '11+', points: 4 },
    ],
  },
  {
    id: 'K4', field: 'k4_automations_komplexitaet', pillar: 'kompetenz', maxPoints: 4,
    questionTeam: 'Was ist die komplexeste KI-Automation, die du/dein Team eigenst\u00E4ndig gebaut hat?',
    options: [
      { label: 'Keine eigenen Automationen', points: 0 },
      { label: 'Einfache Prompt-Templates / Custom GPTs', points: 1 },
      { label: 'Mehrstufige Workflows (Make, N8N, Zapier)', points: 2 },
      { label: 'Integrierte Agenten mit API-Anbindungen', points: 3 },
      { label: 'Custom-Code KI-L\u00F6sungen (eigene Scripts, Apps)', points: 4 },
    ],
  },
  {
    id: 'K5', field: 'k5_usecase_identifikation', pillar: 'kompetenz', maxPoints: 4,
    questionTeam: 'Wie viele konkrete KI-Anwendungsf\u00E4lle hast du f\u00FCr dein Unternehmen identifiziert und dokumentiert?',
    options: [
      { label: '0', points: 0 }, { label: '1\u20133', points: 1 }, { label: '4\u201310', points: 2 },
      { label: '11\u201320', points: 3 }, { label: '20+', points: 4 },
    ],
  },
  {
    id: 'K6', field: 'k6_ki_reflex', pillar: 'kompetenz', maxPoints: 3,
    questionTeam: 'Bei wie vielen deiner letzten 10 neuen Aufgaben/Projekte hast du KI als erstes Werkzeug eingesetzt?',
    options: [
      { label: '0 von 10', points: 0 }, { label: '1\u20133 von 10', points: 1 },
      { label: '4\u20136 von 10', points: 2 }, { label: '7\u201310 von 10', points: 3 },
    ],
  },

  // ── Säule 2: Tools & Prozesse (T1-T7, 25 Pkt) ──
  {
    id: 'T1', field: 't1_prozess_abdeckung', pillar: 'tools', maxPoints: 4,
    questionTeam: 'Wie viel Prozent deiner Kernprozesse (Sales, Marketing, Service, Produktion, Admin) laufen mit KI-Unterst\u00FCtzung?',
    options: [
      { label: '0%', points: 0 }, { label: '\u226410%', points: 1 }, { label: '11\u201325%', points: 2 },
      { label: '26\u201350%', points: 3 }, { label: '50%+', points: 4 },
    ],
  },
  {
    id: 'T2', field: 't2_zeiteinsparung', pillar: 'tools', maxPoints: 4, showCecPreview: true,
    questionTeam: 'Wie viele Stunden pro Woche spart dein Unternehmen insgesamt durch KI-Einsatz?',
    questionSolo: 'Wie viele Stunden pro Woche sparst du pers\u00F6nlich durch KI?',
    options: [
      { label: '0h', points: 0, cecMittelwert: 0 }, { label: '1\u20135h', points: 1, cecMittelwert: 3 },
      { label: '6\u201315h', points: 2, cecMittelwert: 10 }, { label: '16\u201340h', points: 3, cecMittelwert: 28 },
      { label: '40h+', points: 4, cecMittelwert: 50 },
    ],
    optionsSolo: [
      { label: '0h', points: 0, cecMittelwert: 0 }, { label: '1\u20132h', points: 1, cecMittelwert: 1.5 },
      { label: '3\u20135h', points: 2, cecMittelwert: 4 }, { label: '6\u201310h', points: 3, cecMittelwert: 8 },
      { label: '10h+', points: 4, cecMittelwert: 12 },
    ],
  },
  {
    id: 'T3', field: 't3_kosteneinsparung', pillar: 'tools', maxPoints: 3, showCecPreview: true,
    questionTeam: 'Gesch\u00E4tzte Kosteneinsparung durch KI-Tools (EUR/Jahr)?',
    questionSolo: 'Gesch\u00E4tzte Kosteneinsparung durch KI-Tools (EUR/Jahr)?',
    options: [
      { label: '0\u20AC', points: 0, cecMittelwert: 0 }, { label: '<5.000\u20AC', points: 1, cecMittelwert: 2500 },
      { label: '5.000\u201325.000\u20AC', points: 2, cecMittelwert: 15000 }, { label: '25.000\u20AC+', points: 3, cecMittelwert: 35000 },
    ],
    optionsSolo: [
      { label: '0\u20AC', points: 0, cecMittelwert: 0 }, { label: '<1.000\u20AC', points: 1, cecMittelwert: 500 },
      { label: '1.000\u20135.000\u20AC', points: 2, cecMittelwert: 3000 }, { label: '5.000\u20AC+', points: 3, cecMittelwert: 7000 },
    ],
  },
  {
    id: 'T4', field: 't4_umsatzsteigerung', pillar: 'tools', maxPoints: 3, showCecPreview: true,
    questionTeam: 'Gesch\u00E4tzte Umsatzsteigerung durch KI (% des Jahresumsatzes)?',
    options: [
      { label: '0%', points: 0, cecMittelwert: 0 }, { label: '<5%', points: 1, cecMittelwert: 0.025 },
      { label: '5\u201315%', points: 2, cecMittelwert: 0.10 }, { label: '15%+', points: 3, cecMittelwert: 0.20 },
    ],
  },
  {
    id: 'T5', field: 't5_prozess_doku', pillar: 'tools', maxPoints: 4,
    questionTeam: 'F\u00FCr wie viele deiner Kernprozesse existiert eine schriftliche Prozessbeschreibung?',
    options: [
      { label: '0', points: 0 }, { label: '1\u20133', points: 1 }, { label: '4\u201310', points: 2 },
      { label: '11\u201320', points: 3 }, { label: '20+', points: 4 },
    ],
  },
  {
    id: 'T6', field: 't6_agent_teams', pillar: 'tools', maxPoints: 4,
    questionTeam: 'Wie viele KI-Agent-Teams oder automatisierte Multi-Step-Workflows sind im produktiven Einsatz?',
    options: [
      { label: '0', points: 0 }, { label: '1', points: 1 }, { label: '2\u20133', points: 2 },
      { label: '4\u20136', points: 3 }, { label: '7+', points: 4 },
    ],
  },
  {
    id: 'T7', field: 't7_tool_integration', pillar: 'tools', maxPoints: 3,
    questionTeam: 'Wie viel Prozent deiner KI-Tools sind mit bestehenden Systemen integriert (APIs, Zapier/Make, N8N, Cloud-Code)?',
    options: [
      { label: '0%', points: 0 }, { label: '<25%', points: 1 },
      { label: '25\u201350%', points: 2 }, { label: '50%+', points: 3 },
    ],
  },

  // ── Säule 3: Steuerung (S1-S6, 25 Pkt) ──
  {
    id: 'S1', field: 's1_verantwortung', pillar: 'steuerung', maxPoints: 5,
    questionTeam: 'Wie viele Personen in deinem Unternehmen haben direkte KI-Verantwortung und werden am KI-Output gemessen?',
    questionSolo: 'Wie viele messbare KI-Ziele (KPIs) hast du dir f\u00FCr dieses Quartal gesetzt?',
    options: [
      { label: '0', points: 0 }, { label: '1', points: 1 }, { label: '2\u20133', points: 2 },
      { label: '4\u20135', points: 3 }, { label: '6\u201310', points: 4 }, { label: '10+', points: 5 },
    ],
    optionsSolo: [
      { label: '0', points: 0 }, { label: '1', points: 1 }, { label: '2\u20133', points: 2 },
      { label: '4\u20135', points: 3 }, { label: '6\u20138', points: 4 }, { label: '9+', points: 5 },
    ],
  },
  {
    id: 'S2', field: 's2_zeitallokation', pillar: 'steuerung', maxPoints: 4,
    questionTeam: 'Wie viel Prozent der w\u00F6chentlichen Arbeitszeit ist fest f\u00FCr KI-Themen allokiert (nicht nur ad hoc)?',
    options: [
      { label: '0%', points: 0 }, { label: '<5%', points: 1 }, { label: '5\u201310%', points: 2 },
      { label: '11\u201320%', points: 3 }, { label: '20%+', points: 4 },
    ],
  },
  {
    id: 'S3', field: 's3_budget', pillar: 'steuerung', maxPoints: 4,
    questionTeam: 'Wie hoch ist dein monatliches KI-Budget (Tools + Schulungen + externe Unterst\u00FCtzung)?',
    questionSolo: 'Wie hoch ist dein monatliches KI-Budget?',
    options: [
      { label: '0\u20AC', points: 0 }, { label: '<1.000\u20AC', points: 1 }, { label: '1.000\u20133.000\u20AC', points: 2 },
      { label: '3.000\u20137.000\u20AC', points: 3 }, { label: '7.000\u20AC+', points: 4 },
    ],
    optionsSolo: [
      { label: '0\u20AC', points: 0 }, { label: '<100\u20AC', points: 1 }, { label: '100\u2013300\u20AC', points: 2 },
      { label: '300\u2013600\u20AC', points: 3 }, { label: '600\u20AC+', points: 4 },
    ],
  },
  {
    id: 'S4', field: 's4_roi', pillar: 'steuerung', maxPoints: 5,
    questionTeam: 'Wie hoch ist dein ROI durch KI?',
    hint: 'ROI = (Kosteneinsparung + Zeiteinsparung + Umsatzsteigerung) \u00F7 KI-Ausgaben',
    options: [
      { label: 'Kann ich nicht berechnen', points: 0 }, { label: 'ROI < 1 (Verlust)', points: 1 },
      { label: 'ROI 1\u20133', points: 2 }, { label: 'ROI 3\u201310', points: 3 },
      { label: 'ROI 10\u201350', points: 4 }, { label: 'ROI 50+', points: 5 },
    ],
  },
  {
    id: 'S5', field: 's5_rituale', pillar: 'steuerung', maxPoints: 4,
    questionTeam: 'Wie viele regelm\u00E4\u00DFige KI-fokussierte Termine (Stand-ups, Sharing-Sessions) finden pro Monat statt?',
    questionSolo: 'An wie vielen KI-Community-Terminen, Mastermind-Runden oder Peer-Austausch nimmst du pro Monat teil?',
    options: [
      { label: '0', points: 0 }, { label: '1', points: 1 }, { label: '2\u20133', points: 2 },
      { label: '4\u20138', points: 3 }, { label: '8+', points: 4 },
    ],
    optionsSolo: [
      { label: '0', points: 0 }, { label: '1', points: 1 }, { label: '2\u20133', points: 2 },
      { label: '4\u20136', points: 3 }, { label: '6+', points: 4 },
    ],
  },
  {
    id: 'S6', field: 's6_umsetzungsplan', pillar: 'steuerung', maxPoints: 3,
    questionTeam: 'Wie viele konkrete Meilensteine enth\u00E4lt dein schriftlicher KI-Umsetzungsplan f\u00FCr die n\u00E4chsten 12 Monate?',
    options: [
      { label: 'Kein Plan vorhanden', points: 0 }, { label: '1\u20133 Meilensteine', points: 1 },
      { label: '4\u20138 Meilensteine', points: 2 }, { label: '9+ Meilensteine', points: 3 },
    ],
  },

  // ── Säule 4: Zukunftsfähigkeit (Z1-Z6, 25 Pkt) ──
  {
    id: 'Z1', field: 'z1_beobachtung', pillar: 'zukunft', maxPoints: 5,
    questionTeam: 'Wie viele Stunden pro Woche informierst du dich \u00FCber langfristige KI-Entwicklungen (Humanoide Roboter, Industry Models, Physical AI)?',
    options: [
      { label: '0h', points: 0 }, { label: '<1h', points: 1 }, { label: '1\u20132h', points: 2 },
      { label: '3\u20135h', points: 3 }, { label: '6\u20138h', points: 4 }, { label: '9h+', points: 5 },
    ],
  },
  {
    id: 'Z2', field: 'z2_zukunftsvision', pillar: 'zukunft', maxPoints: 5,
    questionTeam: 'F\u00FCr wie viele deiner Gesch\u00E4ftsprozesse hast du eine klare Vorstellung, wie KI sie in 2\u20133 Jahren grundlegend ver\u00E4ndern wird?',
    options: [
      { label: '0', points: 0 }, { label: '1\u20133', points: 1 }, { label: '4\u20138', points: 2 },
      { label: '9\u201315', points: 3 }, { label: '16\u201324', points: 4 }, { label: '24+', points: 5 },
    ],
  },
  {
    id: 'Z3', field: 'z3_adoptionsgeschwindigkeit', pillar: 'zukunft', maxPoints: 4,
    questionTeam: 'Wenn ein relevantes neues KI-Tool erscheint \u2014 wie schnell testest du es typischerweise?',
    options: [
      { label: 'Gar nicht / erst wenn Standard', points: 0 }, { label: 'Innerhalb von Monaten', points: 1 },
      { label: 'Innerhalb von Wochen', points: 2 }, { label: 'Innerhalb von Tagen', points: 3 },
      { label: 'Am Release-Tag / Beta-Programme', points: 4 },
    ],
  },
  {
    id: 'Z4', field: 'z4_nextgen', pillar: 'zukunft', maxPoints: 4,
    questionTeam: 'Wie viele Next-Gen-KI-Bereiche hast du aktiv exploriert (nicht nur gelesen)?',
    hint: 'Multimodale KI, On-Device AI, KI-Hardware/Robotik, Branchenspezifische Foundation Models, Physical AI, Autonome Systeme, Synthetic Data',
    options: [
      { label: '0', points: 0 }, { label: '1\u20132', points: 1 }, { label: '3\u20134', points: 2 },
      { label: '5\u20136', points: 3 }, { label: '7', points: 4 },
    ],
  },
  {
    id: 'Z5', field: 'z5_geschaeftsideen', pillar: 'zukunft', maxPoints: 4,
    questionTeam: 'Wie viele neue Gesch\u00E4ftsfeld-Ideen hast du dokumentiert, die erst durch zuk\u00FCnftige KI-Entwicklungen m\u00F6glich werden?',
    options: [
      { label: '0', points: 0 }, { label: '1\u20132', points: 1 }, { label: '3\u20135', points: 2 },
      { label: '6\u201310', points: 3 }, { label: '10+', points: 4 },
    ],
  },
  {
    id: 'Z6', field: 'z6_netzwerk', pillar: 'zukunft', maxPoints: 3,
    questionTeam: 'Mit wie vielen Personen tauschst du dich regelm\u00E4\u00DFig (mind. 1\u00D7/Monat) \u00FCber langfristige KI-Zukunftsthemen aus?',
    options: [
      { label: '0', points: 0 }, { label: '1\u20133', points: 1 },
      { label: '4\u201310', points: 2 }, { label: '10+', points: 3 },
    ],
  },
];

// Bonus-Frage (nicht in den 100 Punkten)
export const KI_BONUS_QUESTION: QuestionDef = {
  id: 'B1', field: 'b1_produktumsatz', pillar: 'bonus', maxPoints: 10,
  questionTeam: 'Wie viel Prozent deines Gesamtumsatzes erwirtschaftest du durch selbsttrainierte KI-Produkte oder KI-basierte Services?',
  options: [
    { label: '0% (nicht relevant)', points: 0 }, { label: '<5%', points: 2 }, { label: '5\u201310%', points: 4 },
    { label: '11\u201320%', points: 6 }, { label: '21\u201330%', points: 8 }, { label: '30%+', points: 10 },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// ZUKUNFT READINESS FRAGEN (32 Fragen, 4 Dimensionen)
// ═══════════════════════════════════════════════════════════════════

export const ZUKUNFT_QUESTIONS: QuestionDef[] = [
  // ── Dimension 1: Zukunftsbild (F1-F8, 25 Pkt) ──
  {
    id: 'F1', field: 'f1_zukunftsbild', pillar: 'zukunftsbild', maxPoints: 3,
    questionTeam: 'Ich habe eine schriftliche Beschreibung, wie meine Branche in 5 Jahren aussehen wird (Technologien, Gesch\u00E4ftsmodelle, Wertsch\u00F6pfungskette, Kundensegmente).',
    options: [{ label: 'Trifft nicht zu', points: 0 }, { label: 'Trifft zu', points: 3 }],
  },
  {
    id: 'F2', field: 'f2_ma_verstaendnis', pillar: 'zukunftsbild', maxPoints: 4,
    questionTeam: 'Folgender Anteil meiner Mitarbeiter hat dieses Zukunftsbild verstanden und handelt danach:',
    questionSolo: 'Ich habe mein Zukunftsbild so klar formuliert, dass ich Entscheidungen danach ausrichte:',
    options: [
      { label: '0%', points: 0 }, { label: '10%', points: 1 }, { label: '20\u201330%', points: 1 },
      { label: '40\u201350%', points: 2 }, { label: '60\u201370%', points: 3 }, { label: '80\u201390%', points: 4 },
    ],
    optionsSolo: [
      { label: 'Trifft nicht zu', points: 0 }, { label: 'Teilweise', points: 2 }, { label: 'Trifft zu', points: 4 },
    ],
  },
  {
    id: 'F3', field: 'f3_trends_wpa', pillar: 'zukunftsbild', maxPoints: 4,
    questionTeam: 'Ich habe eine Liste der wichtigsten Zukunftstrends, gegliedert nach Watch-Prepare-Act. Anzahl:',
    options: [
      { label: '0', points: 0 }, { label: '3', points: 1 }, { label: '5', points: 2 },
      { label: '10', points: 2 }, { label: '20', points: 3 }, { label: '50', points: 4 },
    ],
  },
  {
    id: 'F4', field: 'f4_kontakte_top20', pillar: 'zukunftsbild', maxPoints: 4,
    questionTeam: 'Zu wie vielen der 20 wichtigsten Personen f\u00FCr die Zukunftsentwicklung meiner Branche habe ich pers\u00F6nlichen Kontakt?',
    options: [
      { label: '0%', points: 0 }, { label: '10%', points: 1 }, { label: '25%', points: 2 },
      { label: '50%', points: 3 }, { label: '75%', points: 3 }, { label: '100%', points: 4 },
    ],
  },
  {
    id: 'F5', field: 'f5_tiefeninterviews', pillar: 'zukunftsbild', maxPoints: 3,
    questionTeam: 'Wie viele strukturierte Tiefeninterviews mit externen Zukunftsakteuren haben Sie in den letzten 12 Monaten gef\u00FChrt?',
    options: [
      { label: '0', points: 0 }, { label: '1', points: 1 }, { label: '2\u20133', points: 1 },
      { label: '5', points: 2 }, { label: '10', points: 3 }, { label: 'mehr als 10', points: 3 },
    ],
  },
  {
    id: 'F6', field: 'f6_arbeitszeit_analyse', pillar: 'zukunftsbild', maxPoints: 2,
    questionTeam: 'Welchen Anteil der Arbeitszeit investieren wir in die Analyse von Zukunftsakteuren (Podcasts, B\u00FCcher, Studien, Interviews)?',
    options: [
      { label: '0%', points: 0 }, { label: '1%', points: 1 }, { label: '2%', points: 1 },
      { label: '3%', points: 2 }, { label: '4%', points: 2 }, { label: '5%', points: 2 },
    ],
  },
  {
    id: 'F7', field: 'f7_kosten_struktur', pillar: 'zukunftsbild', maxPoints: 3,
    questionTeam: 'Wie viel Prozent der monatlichen Kosten investiere ich in eine Struktur, die Zukunftsarbeit kontinuierlich managt?',
    options: [
      { label: '0%', points: 0 }, { label: '1%', points: 1 }, { label: '2\u20133%', points: 1 },
      { label: '4\u20135%', points: 2 }, { label: '6\u20137%', points: 2 },
      { label: '8\u20139%', points: 3 }, { label: '10%+', points: 3 },
    ],
  },
  {
    id: 'F8', field: 'f8_externe_experten', pillar: 'zukunftsbild', maxPoints: 2,
    questionTeam: 'Wir arbeiten regelm\u00E4\u00DFig mit externen Zukunftsexperten und wissenschaftlichen Partnern zusammen.',
    options: [{ label: 'Nein', points: 0 }, { label: 'Ja', points: 2 }],
  },

  // ── Dimension 2: Zukunftsstrategie (F9-F14, 25 Pkt) ──
  {
    id: 'F9', field: 'f9_zukunftsstrategie', pillar: 'zukunftsstrategie', maxPoints: 4,
    questionTeam: 'Wir haben eine Zukunftsstrategie f\u00FCr die n\u00E4chsten 5 Jahre erarbeitet. Diese ist schriftlich dokumentiert und den Mitarbeitern bekannt.',
    options: [{ label: 'Trifft nicht zu', points: 0 }, { label: 'Trifft zu', points: 4 }],
  },
  {
    id: 'F10', field: 'f10_backcasting', pillar: 'zukunftsstrategie', maxPoints: 4,
    questionTeam: 'Unsere Zukunftsstrategie wurde mittels Backcasting aus dem Zukunftsbild abgeleitet.',
    options: [{ label: 'Trifft nicht zu', points: 0 }, { label: 'Trifft zu', points: 4 }],
  },
  {
    id: 'F11', field: 'f11_ziele_kpis', pillar: 'zukunftsstrategie', maxPoints: 5,
    questionTeam: 'Wir haben die Strategie auf konkrete Ziele mit Zahlen und KPIs heruntergebrochen (Jahresziele, Quartalsziele, Bereichsziele).',
    options: [{ label: 'Trifft nicht zu', points: 0 }, { label: 'Trifft zu', points: 5 }],
  },
  {
    id: 'F12', field: 'f12_strategie_gemessen', pillar: 'zukunftsstrategie', maxPoints: 4,
    questionTeam: 'Die Strategie und die Ziele werden regelm\u00E4\u00DFig angewendet und gemessen (z.B. in w\u00F6chentlichen Team-Meetings).',
    options: [{ label: 'Trifft nicht zu', points: 0 }, { label: 'Trifft zu', points: 4 }],
  },
  {
    id: 'F13', field: 'f13_arbeitszeit_pruefung', pillar: 'zukunftsstrategie', maxPoints: 4,
    questionTeam: 'Anteil der Arbeitszeit f\u00FCr Pr\u00FCfung und \u00DCberarbeitung der Strategie:',
    options: [
      { label: '0%', points: 0 }, { label: '1%', points: 1 }, { label: '2%', points: 2 },
      { label: '3%', points: 3 }, { label: '4%', points: 3 }, { label: '5%+', points: 4 },
    ],
  },
  {
    id: 'F14', field: 'f14_kosten_monitoring', pillar: 'zukunftsstrategie', maxPoints: 4,
    questionTeam: 'Anteil monatlicher Kosten f\u00FCr die Struktur zur \u00DCberwachung und Steuerung der Strategie:',
    options: [
      { label: '0%', points: 0 }, { label: '1%', points: 1 }, { label: '2\u20133%', points: 2 },
      { label: '4\u20135%', points: 2 }, { label: '6\u20137%', points: 3 },
      { label: '8\u20139%', points: 3 }, { label: '10%+', points: 4 },
    ],
  },

  // ── Dimension 3: Zukunftskompetenzen (F15-F23, 25 Pkt) ──
  {
    id: 'F15', field: 'f15_weiterbildung', pillar: 'zukunftskompetenzen', maxPoints: 3,
    questionTeam: 'Wie viele Mitarbeiter haben im letzten Jahr an Weiterbildung zu Zukunftsthemen teilgenommen?',
    questionSolo: 'Hast du im letzten Jahr an Weiterbildung zu Zukunftsthemen, Strategie oder Innovation teilgenommen?',
    options: [
      { label: '0%', points: 0 }, { label: '5%', points: 1 }, { label: '10\u201320%', points: 1 },
      { label: '30\u201350%', points: 2 }, { label: '50%+', points: 3 },
    ],
    optionsSolo: [
      { label: 'Nein', points: 0 }, { label: 'Etwas (1\u20132 Kurse)', points: 1 },
      { label: 'Ja, aktiv', points: 2 }, { label: 'Intensiv (5+ Kurse)', points: 3 },
    ],
  },
  {
    id: 'F16', field: 'f16_workshops', pillar: 'zukunftskompetenzen', maxPoints: 3,
    questionTeam: 'Wie viele interne Zukunfts- oder Innovationsworkshops in den letzten 12 Monaten?',
    options: [
      { label: '0', points: 0 }, { label: '1', points: 1 }, { label: '2\u20133', points: 1 },
      { label: '5', points: 2 }, { label: '10', points: 3 }, { label: 'mehr als 10', points: 3 },
    ],
  },
  {
    id: 'F17', field: 'f17_management_meetings', pillar: 'zukunftskompetenzen', maxPoints: 3,
    questionTeam: 'Welcher Anteil Ihrer Top-Management-Meetings besch\u00E4ftigt sich mit Zukunft, Strategie oder neuen Gesch\u00E4ftsmodellen?',
    questionSolo: 'Welcher Anteil deiner strategischen Planung besch\u00E4ftigt sich mit Zukunftsthemen?',
    options: [
      { label: '0%', points: 0 }, { label: '5%', points: 1 }, { label: '10\u201320%', points: 1 },
      { label: '30\u201340%', points: 2 }, { label: '50%+', points: 3 },
    ],
    optionsSolo: [
      { label: '0%', points: 0 }, { label: '<10%', points: 1 },
      { label: '10\u201330%', points: 2 }, { label: '30%+', points: 3 },
    ],
  },
  {
    id: 'F18', field: 'f18_trend_beobachtung', pillar: 'zukunftskompetenzen', maxPoints: 3,
    questionTeam: 'Wir haben eine Struktur, die Zukunftstrends beobachtet und nach Watch-Prepare-Act einordnet. Arbeitszeit-Anteil:',
    options: [
      { label: '0%', points: 0 }, { label: '1%', points: 1 }, { label: '2%', points: 2 },
      { label: '3%', points: 2 }, { label: '4%', points: 3 }, { label: '5%+', points: 3 },
    ],
  },
  {
    id: 'F19', field: 'f19_neue_trends', pillar: 'zukunftskompetenzen', maxPoints: 3,
    questionTeam: 'Wie viele neue relevante Zukunftstrends haben wir in den letzten 6 Monaten identifiziert?',
    options: [
      { label: '0', points: 0 }, { label: '2', points: 1 }, { label: '4\u20136', points: 1 },
      { label: '8', points: 2 }, { label: '10\u201312', points: 3 }, { label: 'mehr als 12', points: 3 },
    ],
  },
  {
    id: 'F20', field: 'f20_zielvorgaben', pillar: 'zukunftskompetenzen', maxPoints: 2,
    questionTeam: 'Es gibt klare Zielvorgaben f\u00FCr die Erkundung neuer Zukunftstrends sowie definierte Kontrollpunkte.',
    options: [{ label: 'Trifft nicht zu', points: 0 }, { label: 'Trifft zu', points: 2 }],
  },
  {
    id: 'F21', field: 'f21_externe_netzwerke', pillar: 'zukunftskompetenzen', maxPoints: 2,
    questionTeam: 'Wir haben im letzten Jahr mit externen Netzwerken, wissenschaftlichen Einrichtungen oder Think Tanks gearbeitet.',
    options: [{ label: 'Nein', points: 0 }, { label: 'Ja', points: 2 }],
  },
  {
    id: 'F22', field: 'f22_kosten_kompetenzen', pillar: 'zukunftskompetenzen', maxPoints: 3,
    questionTeam: 'Anteil monatlicher Kosten f\u00FCr den Aufbau von Zukunftskompetenzen:',
    options: [
      { label: '0%', points: 0 }, { label: '1%', points: 1 }, { label: '2%', points: 2 },
      { label: '3%', points: 2 }, { label: '4%', points: 3 }, { label: '5%+', points: 3 },
    ],
  },
  {
    id: 'F23', field: 'f23_gesamtarbeitszeit', pillar: 'zukunftskompetenzen', maxPoints: 3,
    questionTeam: 'Im letzten Jahr hat unser Unternehmen folgenden Anteil seiner Gesamtarbeitszeit f\u00FCr Zukunft, Strategie und Innovation verwendet:',
    options: [
      { label: '0%', points: 0 }, { label: '1%', points: 1 }, { label: '2%', points: 1 },
      { label: '5%', points: 2 }, { label: '10%', points: 3 }, { label: 'mehr als 10%', points: 3 },
    ],
  },

  // ── Dimension 4: Umsetzung (F24-F32, 25 Pkt) ──
  {
    id: 'F24', field: 'f24_methodenkenntnisse', pillar: 'umsetzung', maxPoints: 2,
    questionTeam: 'Wir verf\u00FCgen \u00FCber Methodenkenntnisse im Bereich der Strategieumsetzung (z.B. Balanced Scorecard, OKR, Roadmapping).',
    options: [{ label: 'Trifft nicht zu', points: 0 }, { label: 'Trifft zu', points: 2 }],
  },
  {
    id: 'F25', field: 'f25_jahresbudget', pillar: 'umsetzung', maxPoints: 3,
    questionTeam: 'Wie viel Prozent des Jahresbudgets f\u00FCr Projekte aus der Zukunftsstrategie?',
    options: [
      { label: '0%', points: 0 }, { label: '1\u20132%', points: 1 }, { label: '3\u20135%', points: 2 },
      { label: '6\u20138%', points: 2 }, { label: '9%', points: 3 }, { label: '10%+', points: 3 },
    ],
  },
  {
    id: 'F26', field: 'f26_geschaeftsideen_ma', pillar: 'umsetzung', maxPoints: 3,
    questionTeam: 'Wie viele neue Gesch\u00E4ftsideen pro Mitarbeiter in den letzten 3 Monaten?',
    questionSolo: 'Wie viele neue Gesch\u00E4ftsideen hast du in den letzten 3 Monaten entwickelt?',
    options: [
      { label: 'N/A', points: 0 }, { label: '0', points: 0 }, { label: '0,25', points: 1 },
      { label: '0,5\u20130,75', points: 1 }, { label: '1', points: 2 }, { label: '2\u20133', points: 3 },
    ],
    optionsSolo: [
      { label: '0', points: 0 }, { label: '1', points: 1 }, { label: '2\u20133', points: 2 },
      { label: '4+', points: 3 },
    ],
  },
  {
    id: 'F27', field: 'f27_conversion_rate', pillar: 'umsetzung', maxPoints: 3,
    questionTeam: 'Anteil der Ideen, die innerhalb von 12 Monaten in einen Prototyp oder Pilotprojekt \u00FCberf\u00FChrt werden?',
    options: [
      { label: 'wei\u00DF nicht', points: 0 }, { label: '5%', points: 1 }, { label: '10\u201315%', points: 1 },
      { label: '20\u201325%', points: 2 }, { label: '30\u201340%', points: 2 }, { label: '50%+', points: 3 },
    ],
  },
  {
    id: 'F28', field: 'f28_time_to_prototype', pillar: 'umsetzung', maxPoints: 3,
    questionTeam: 'Wie lange dauert es typischerweise, bis aus einer neuen Idee ein erster Prototyp entsteht?',
    options: [
      { label: 'Kein Umsetzungsprozess', points: 0 }, { label: 'mehr als 24 Monate', points: 0 },
      { label: '12\u201324 Monate', points: 1 }, { label: '6\u201312 Monate', points: 2 },
      { label: '3\u20136 Monate', points: 2 }, { label: 'unter 3 Monate', points: 3 },
    ],
  },
  {
    id: 'F29', field: 'f29_investment_1j', pillar: 'umsetzung', maxPoints: 3,
    questionTeam: 'Wie viel Prozent des Jahresumsatzes investieren wir in Gesch\u00E4ftsfelder, die in einem Jahr relevant werden?',
    options: [
      { label: '0%', points: 0 }, { label: '0,5\u20131%', points: 1 }, { label: '1,5\u20132%', points: 1 },
      { label: '2,5\u20133%', points: 2 }, { label: '3,5\u20134%', points: 2 },
      { label: '4,5%', points: 3 }, { label: '5%+', points: 3 },
    ],
  },
  {
    id: 'F30', field: 'f30_investment_2j', pillar: 'umsetzung', maxPoints: 2,
    questionTeam: 'Wie viel Prozent des Jahresumsatzes investieren wir in Gesch\u00E4ftsfelder, die in zwei Jahren relevant werden?',
    options: [
      { label: '0%', points: 0 }, { label: '0,5\u20131%', points: 1 }, { label: '1,5\u20132%', points: 1 },
      { label: '2,5\u20133%', points: 1 }, { label: '3,5%+', points: 2 },
    ],
  },
  {
    id: 'F31', field: 'f31_investment_3j', pillar: 'umsetzung', maxPoints: 2,
    questionTeam: 'Wie viel Prozent des Jahresumsatzes investieren wir in Gesch\u00E4ftsfelder, die in drei Jahren relevant werden?',
    options: [
      { label: '0%', points: 0 }, { label: '0,5\u20131%', points: 1 }, { label: '1,5\u20132%', points: 1 },
      { label: '2,5\u20133%', points: 1 }, { label: '3,5%+', points: 2 },
    ],
  },
  {
    id: 'F32', field: 'f32_umsatzanteil_neu', pillar: 'umsetzung', maxPoints: 4,
    questionTeam: 'Umsatzanteil aus Gesch\u00E4ftsmodellen und Produkten, die seit weniger als 12 Monaten angeboten werden:',
    options: [
      { label: 'unter 5%', points: 0 }, { label: '5%', points: 1 }, { label: '7,5\u201310%', points: 2 },
      { label: '12,5\u201315%', points: 3 }, { label: '17,5\u201320%', points: 3 }, { label: 'mehr als 20%', points: 4 },
    ],
  },
];

// ─── Step Config (für AssessmentView) ───────────────────────────

export const ASSESSMENT_STEPS = [
  { id: 'meta', title: '\u00DCber Dich', bereich: 'meta', color: COLORS.ACCENT },
  { id: 'ki-kompetenz', title: 'Kompetenz', bereich: 'ki', color: COLORS.PRIMARY },
  { id: 'ki-tools', title: 'Tools & Prozesse', bereich: 'ki', color: COLORS.PRIMARY },
  { id: 'ki-steuerung', title: 'Steuerung', bereich: 'ki', color: COLORS.PRIMARY },
  { id: 'ki-zukunft', title: 'Zukunftsf\u00E4higkeit + Bonus', bereich: 'ki', color: COLORS.PRIMARY },
  { id: 'z-zukunftsbild', title: 'Zukunftsbild', bereich: 'zukunft', color: COLORS.ZUKUNFT },
  { id: 'z-strategie', title: 'Zukunftsstrategie', bereich: 'zukunft', color: COLORS.ZUKUNFT },
  { id: 'z-kompetenzen', title: 'Zukunftskompetenzen', bereich: 'zukunft', color: COLORS.ZUKUNFT },
  { id: 'z-umsetzung', title: 'Umsetzung', bereich: 'zukunft', color: COLORS.ZUKUNFT },
  { id: 'submit', title: 'Zusammenfassung', bereich: 'submit', color: COLORS.SUCCESS },
];

export const TOTAL_STEPS = ASSESSMENT_STEPS.length;
