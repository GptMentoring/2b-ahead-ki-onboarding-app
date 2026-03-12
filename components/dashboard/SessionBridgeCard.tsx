
import React from 'react';
import { COLORS } from '../../constants';
import { Card } from '../UIComponents';
import { PillarAnalysis, getNextSessionDate, getSessionPrepTask } from './shared';

interface SessionBridgeCardProps {
  sessionEmpfehlung: string;
  potentials: PillarAnalysis[];
}

// ─── Zeitabhängige Urgency-Stufen ───────────────────────────────
type UrgencyLevel = 'today' | 'soon' | 'normal' | 'past';

function getUrgencyLevel(daysUntil: number): UrgencyLevel {
  if (daysUntil === 0) return 'today';
  if (daysUntil >= 1 && daysUntil <= 3) return 'soon';
  if (daysUntil > 3) return 'normal';
  return 'past'; // negative daysUntil (shouldn't happen with current logic, but safe)
}

function getUrgencyStyles(urgency: UrgencyLevel) {
  switch (urgency) {
    case 'today':
      return {
        borderColor: '#059669',         // green-600
        calBg: '#059669',
        badgeBg: '#D1FAE5',             // green-100
        badgeColor: '#065F46',           // green-800
        badgeText: 'HEUTE!',
        cardBg: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
        titleColor: '#065F46',
      };
    case 'soon':
      return {
        borderColor: '#D97706',          // amber-600
        calBg: '#D97706',
        badgeBg: '#FEF3C7',             // amber-100
        badgeColor: '#92400E',           // amber-800
        badgeText: '',                   // wird dynamisch gesetzt
        cardBg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF9C3 100%)',
        titleColor: '#92400E',
      };
    case 'normal':
      return {
        borderColor: `${COLORS.PRIMARY}15`,
        calBg: COLORS.PRIMARY,
        badgeBg: `${COLORS.PRIMARY}10`,
        badgeColor: COLORS.PRIMARY,
        badgeText: '',
        cardBg: undefined,
        titleColor: '#111827',
      };
    case 'past':
      return {
        borderColor: '#D1D5DB',          // gray-300
        calBg: '#9CA3AF',               // gray-400
        badgeBg: '#F3F4F6',             // gray-100
        badgeColor: '#6B7280',           // gray-500
        badgeText: 'Vergangen',
        cardBg: undefined,
        titleColor: '#6B7280',
      };
  }
}

const SessionBridgeCard: React.FC<SessionBridgeCardProps> = ({ sessionEmpfehlung, potentials }) => {
  const nextDate = getNextSessionDate(sessionEmpfehlung);
  const prepTask = getSessionPrepTask(potentials);

  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const dayWord = sessionEmpfehlung.split(/[\s(]/)[0];
  const sessionType = dayWord === 'Dienstag' ? 'Show & Build' : 'Strategie & Zukunft';
  const dateStr = nextDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  const urgency = getUrgencyLevel(daysUntil);
  const styles = getUrgencyStyles(urgency);

  // Badge text
  const badgeText = styles.badgeText || (
    daysUntil === 1
      ? 'In 1 Tag — bist du vorbereitet?'
      : `In ${daysUntil} Tagen — bist du vorbereitet?`
  );

  // Title text
  const titleText = urgency === 'today'
    ? 'Deine Session startet heute!'
    : urgency === 'past'
      ? 'Session verpasst?'
      : 'Deine nächste Session';

  return (
    <Card
      className="p-6 md:p-8 mb-8 border-2 transition-all duration-300"
      style={{
        borderColor: styles.borderColor,
        background: styles.cardBg,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Calendar icon */}
        <div className="relative">
          <div
            className="w-12 h-12 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-white"
            style={{ backgroundColor: styles.calBg, opacity: urgency === 'past' ? 0.6 : 1 }}
          >
            <span className="text-[8px] font-black uppercase leading-none">
              {nextDate.toLocaleDateString('de-DE', { weekday: 'short' })}
            </span>
            <span className="text-lg font-black leading-none">{nextDate.getDate()}</span>
          </div>
          {/* Pulsierendes Element bei "Heute" */}
          {urgency === 'today' && (
            <span className="absolute -top-1 -right-1 inline-flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0" style={{ opacity: urgency === 'past' ? 0.6 : 1 }}>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-black" style={{ color: styles.titleColor }}>
              {titleText}
            </h3>
            <span
              className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight"
              style={{ backgroundColor: styles.badgeBg, color: styles.badgeColor }}
            >
              {badgeText}
            </span>
          </div>

          <p className="text-xs text-gray-500 font-bold mt-1">
            {dateStr} — <span style={{ color: urgency === 'past' ? '#6B7280' : COLORS.PRIMARY }}>{sessionType}</span>
          </p>

          {/* Prep task — nicht zeigen wenn vergangen */}
          {urgency !== 'past' && (
            <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                {urgency === 'today' ? 'Letzte Vorbereitung' : 'Vorbereitung'}
              </span>
              <p className="text-xs font-bold text-gray-700 leading-relaxed">{prepTask}</p>
              {potentials.length > 0 && (
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tight mt-2 inline-block"
                  style={{
                    backgroundColor: potentials[0].type === 'ki' ? `${COLORS.PRIMARY}10` : `${COLORS.ZUKUNFT}10`,
                    color: potentials[0].type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT,
                  }}>
                  Fokus: {potentials[0].name}
                </span>
              )}
            </div>
          )}

          {/* Hinweis bei vergangener Session */}
          {urgency === 'past' && (
            <p className="text-xs text-gray-400 font-bold mt-2">
              Nächste Session am nächsten {dayWord}.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SessionBridgeCard;
