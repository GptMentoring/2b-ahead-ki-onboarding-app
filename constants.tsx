
export const COLORS = {
  PRIMARY: '#64162D',
  PRIMARY_LIGHT: '#8E2442',
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

export const PILLAR_NAMES = {
  kompetenz: 'Kompetenz aufbauen',
  tools: 'Tools gezielt einsetzen',
  steuerung: 'Struktur & Steuerung',
  produkte: 'Eigene KI-Produkte',
  strategie: 'Strategische Weitsicht'
};

export const INDUSTRIES = [
  { id: 'tech', label: 'Technologie & IT', icon: '💻' },
  { id: 'finance', label: 'Finanzen & Banken', icon: '🏦' },
  { id: 'health', label: 'Gesundheit & Medizin', icon: '🏥' },
  { id: 'retail', label: 'Handel & E-Commerce', icon: '🛒' },
  { id: 'manufacturing', label: 'Industrie & Produktion', icon: '🏭' },
  { id: 'service', label: 'Dienstleistungen', icon: '🤝' },
  { id: 'consulting', label: 'Beratung', icon: '📊' },
  { id: 'other', label: 'Sonstige', icon: '✨' }
];

export const MATURITY_LEVELS = [
  { 
    level: 1, 
    label: 'NO AI (Analog)', 
    short: 'No AI',
    desc: 'KI wird im Unternehmen kaum wahrgenommen oder aktiv abgelehnt. Prozesse sind weitgehend analog oder händisch digital.' 
  },
  { 
    level: 2, 
    label: 'KI-AWARE (Entdecker)', 
    short: 'Aware',
    desc: 'Erste "Schatten-KI" durch Mitarbeiter (privates ChatGPT). Management ist sich des Potenzials bewusst, es fehlen jedoch Guidelines.' 
  },
  { 
    level: 3, 
    label: 'KI-ENABLING (Befähigt)', 
    short: 'Enabling',
    desc: 'Kernteams haben Zugriff auf Enterprise-Tools (z.B. Copilot). Erste SOPs werden durch KI unterstützt. Klare Guidelines vorhanden.' 
  },
  { 
    level: 4, 
    label: 'KI-FIRST (Getrieben)', 
    short: 'First',
    desc: 'KI ist integraler Bestandteil der täglichen Arbeit in fast allen Abteilungen. Messbare Effizienzsteigerungen sind die Regel.' 
  },
  { 
    level: 5, 
    label: 'KI-NATIVE (Integriert)', 
    short: 'Native',
    desc: 'Ihr Geschäftsmodell basiert auf KI-First-Prinzipien. Custom Agents übernehmen komplexe Workflows. Das Unternehmen transformiert den Markt.' 
  }
];

export const FOCUS_AREAS_OPTIONS = [
  { id: 'marketing', label: 'Marketing', icon: '📱' },
  { id: 'vertrieb', label: 'Vertrieb', icon: '💼' },
  { id: 'support', label: 'Support', icon: '🎧' },
  { id: 'hr', label: 'HR', icon: '👥' },
  { id: 'produkt', label: 'Produkt', icon: '🚀' },
  { id: 'verwaltung', label: 'Verwaltung', icon: '📋' },
  { id: 'it', label: 'IT/Entwicklung', icon: '💻' },
  { id: 'logistik', label: 'Logistik', icon: '📦' },
  { id: 'finanzen', label: 'Finanzen', icon: '💰' },
  { id: 'operations', label: 'Operations', icon: '⚙️' },
  { id: 'prozesse', label: 'Prozesse', icon: '🔄' },
  { id: 'agenten', label: 'Agenten & Multi-Tool-Workflows', icon: '🤖' }
];

export const TOOLTIPS = {
  Q0_4_RESTRICTIONS: "Wichtig für unsere Empfehlungen: Wenn du nur bestimmte Tools nutzen darfst, zeigen wir dir im Dashboard nur Use-Cases, die damit funktionieren.",
  Q2_1_MATURITY: "Falls du solo arbeitest: Wie ist DEIN aktueller Status? Falls im Team: Wie ist der Status des Unternehmens?",
  Q2_3_DOCUMENTATION: "SOPs = Standard Operating Procedures = Schriftliche Arbeitsanweisungen. Wie gut sind eure Prozesse dokumentiert?",
  Q3_3_DATA: "Wichtig für Compliance: Je sensibler die Daten, desto wichtiger sind DSGVO-konforme Tools und sichere Workflows.",
  Q4_2_PROMPTING: "Prompting = Das Formulieren von Anfragen an KI. Wie gut kannst du/dein Team KI-Anfragen so formulieren, dass gute Ergebnisse rauskommen?",
  Q4_3_AUTOMATION: "Erfahrung mit Tools wie Make, n8n, Zapier, PowerAutomate oder Python für Automationen.",
  Q4_4_API: "API = Application Programming Interface = Schnittstellen zwischen verschiedenen Software-Systemen. Technisches Verständnis davon, wie man Tools miteinander verbindet.",
  Q6_2_BUDGET: "Monatliches Budget für KI-Tools, APIs und Infrastruktur (ohne Personal-/Beratungskosten)."
};

export const USECASE_EXAMPLES = [
  { category: 'Vertrieb', text: 'Ich möchte Leads auf LinkedIn finden, deren Webseite analysieren und automatisch personalisierte E-Mails schreiben' },
  { category: 'Marketing', text: 'Ich möchte aus Blog-Artikeln automatisch Social-Media-Posts für LinkedIn, Instagram und X generieren' },
  { category: 'Support', text: 'Ich möchte häufig gestellte Fragen aus Kundenanfragen automatisch beantworten lassen' },
  { category: 'HR', text: 'Ich möchte Stellenanzeigen automatisch generieren und Bewerbungen vorfiltern' },
  { category: 'Prozesse', text: 'Ich möchte Excel-Listen automatisch mit zusätzlichen Informationen anreichern (z.B. E-Mail-Adressen finden)' },
  { category: 'Agenten', text: 'Ich möchte einen kompletten Workflow bauen: Lead finden → Anreichern → Anschreiben - alles auf Knopfdruck' }
];

export const TOTAL_MODULES = 8;
