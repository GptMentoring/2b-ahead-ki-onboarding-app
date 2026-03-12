
import React from 'react';
import { COLORS } from '../../constants';
import { Card } from '../UIComponents';
import { PillarAnalysis, getNextSessionDate, getSessionPrepTask } from './shared';

interface SessionBridgeCardProps {
  sessionEmpfehlung: string;
  potentials: PillarAnalysis[];
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

  return (
    <Card className="p-6 md:p-8 mb-8 border-2" style={{ borderColor: `${COLORS.PRIMARY}15` }}>
      <div className="flex items-start gap-4">
        {/* Calendar icon */}
        <div className="w-12 h-12 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-white"
          style={{ backgroundColor: COLORS.PRIMARY }}>
          <span className="text-[8px] font-black uppercase leading-none">
            {nextDate.toLocaleDateString('de-DE', { weekday: 'short' })}
          </span>
          <span className="text-lg font-black leading-none">{nextDate.getDate()}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-black text-gray-900">Deine nächste Session</h3>
            <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight"
              style={{ backgroundColor: `${COLORS.PRIMARY}10`, color: COLORS.PRIMARY }}>
              In {daysUntil} {daysUntil === 1 ? 'Tag' : 'Tagen'}
            </span>
          </div>

          <p className="text-xs text-gray-500 font-bold mt-1">
            {dateStr} — <span style={{ color: COLORS.PRIMARY }}>{sessionType}</span>
          </p>

          {/* Prep task */}
          <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-1">
              Vorbereitung
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
        </div>
      </div>
    </Card>
  );
};

export default SessionBridgeCard;
