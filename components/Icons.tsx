// ═══════════════════════════════════════════════════════════════════
// SVG Icon Library — ersetzt alle Emojis in der App
// Heroicons-Style (24x24 viewBox), stroke-based
// ═══════════════════════════════════════════════════════════════════

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const defaults = (props: IconProps) => ({
  width: props.size || 20,
  height: props.size || 20,
  className: props.className || '',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

// 🚀 Rakete — Einstiegspunkt, Solo-Aufbauer, Level-Up
export const IconRocket: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

// 🎯 Zielscheibe — Ziele, Profil
export const IconTarget: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// 🤖 Robot — KI-Stand, KI Score
export const IconRobot: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <path d="M12 2v6" />
    <circle cx="12" cy="2" r="1" />
    <circle cx="8" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="16" cy="14" r="1.5" fill="currentColor" stroke="none" />
    <path d="M9 18h6" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
  </svg>
);

// 👤 Person — Über dich
export const IconUser: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// 👥 Personen — Team, Teilnehmer
export const IconUsers: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

// ⚙️ Zahnrad — Ressourcen, Einstellungen
export const IconGear: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// 🔮 Kristallkugel → Kompass — Zukunft & Strategie
export const IconCompass: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
  </svg>
);

// 📊 Balkendiagramm — Assessments, Radar
export const IconChart: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
  </svg>
);

// 📈 Trend hoch — Corporate-Skalierung
export const IconTrendUp: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

// 💰 Geld — CEC, Wirtschaftlicher Effekt
export const IconCurrency: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

// 🔍 Lupe — Corporate-Explorer
export const IconSearch: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

// ⭐ Stern — Solo-Profi
export const IconStar: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// 📋 Clipboard — Blueprints, Ist-Analyse
export const IconClipboard: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

// 🛠️ Werkzeug — Empfohlene Tools
export const IconWrench: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

// 📅 Kalender — Session-Empfehlung
export const IconCalendar: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ✅ Häkchen im Kreis — Abgeschlossen
export const IconCheckCircle: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ✓ Häkchen — Checkbox
export const IconCheck: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// 📄 Dokument — Assessment-Daten
export const IconDocument: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// ⚡ Blitz — ChatGPT Plus
export const IconBolt: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// 🌐 Globus — Google Gemini
export const IconGlobe: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

// Ⓜ️ M-Logo → Box — Microsoft Copilot
export const IconBox: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

// ⏰ Uhr — Zeitgewinn
export const IconClock: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

// 🛡️ Schild mit Warnung — Zukunfts-Risiko
export const IconShieldAlert: React.FC<IconProps> = (props) => (
  <svg {...defaults(props)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

// ─── Icon Mapping (für string-basierte Referenzen in Constants) ──

const ICON_MAP: Record<string, React.FC<IconProps>> = {
  rocket: IconRocket,
  target: IconTarget,
  robot: IconRobot,
  user: IconUser,
  users: IconUsers,
  gear: IconGear,
  compass: IconCompass,
  chart: IconChart,
  trendUp: IconTrendUp,
  currency: IconCurrency,
  search: IconSearch,
  star: IconStar,
  clipboard: IconClipboard,
  wrench: IconWrench,
  calendar: IconCalendar,
  checkCircle: IconCheckCircle,
  check: IconCheck,
  document: IconDocument,
  bolt: IconBolt,
  globe: IconGlobe,
  box: IconBox,
  clock: IconClock,
  shieldAlert: IconShieldAlert,
};

export const Icon: React.FC<IconProps & { name: string }> = ({ name, ...props }) => {
  const Component = ICON_MAP[name];
  if (!Component) return null;
  return <Component {...props} />;
};
