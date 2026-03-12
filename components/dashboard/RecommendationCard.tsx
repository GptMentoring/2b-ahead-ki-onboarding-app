
import React from 'react';
import { Analysis } from '../../types';
import { COLORS, KI_MATURITY_LEVELS, ZUKUNFT_MATURITY_LEVELS } from '../../constants';
import { Card } from '../UIComponents';

interface RecommendationCardProps {
  analysis: Analysis;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ analysis }) => {
  const kiMaturity = KI_MATURITY_LEVELS.find(m => m.level === analysis.kiMaturityLevel);
  const zukunftMaturity = ZUKUNFT_MATURITY_LEVELS.find(m => m.level === analysis.zukunftMaturityLevel);

  if (!((kiMaturity?.vertrieb && kiMaturity.vertrieb !== '\u2014') || (zukunftMaturity?.vertrieb && zukunftMaturity.vertrieb !== '\u2014'))) {
    return null;
  }

  return (
    <Card className="p-6 md:p-8 mb-8 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
      <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">
        Dein nächster Schritt
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kiMaturity?.vertrieb && kiMaturity.vertrieb !== '\u2014' && (
          <div className="p-5 rounded-2xl border-2" style={{ borderColor: `${COLORS.PRIMARY}30`, backgroundColor: `${COLORS.PRIMARY}05` }}>
            <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: COLORS.PRIMARY }}>
              KI Readiness (Stufe {analysis.kiMaturityLevel})
            </div>
            <div className="text-base font-black text-gray-900 mb-1">{kiMaturity.vertrieb}</div>
            <p className="text-xs text-gray-600 font-bold leading-relaxed">
              {analysis.kiMaturityLevel <= 2
                ? 'Der ideale Einstieg in systematische KI-Nutzung. Lerne die Grundlagen und baue erste Workflows.'
                : analysis.kiMaturityLevel <= 4
                ? 'Individuelle Strategie und Begleitung, um KI in deinen Kernprozessen zu verankern.'
                : 'Fortgeschrittene Integration und Skalierung deiner KI-Systeme.'}
            </p>
          </div>
        )}
        {zukunftMaturity?.vertrieb && zukunftMaturity.vertrieb !== '\u2014' && (
          <div className="p-5 rounded-2xl border-2" style={{ borderColor: `${COLORS.ZUKUNFT}30`, backgroundColor: `${COLORS.ZUKUNFT}05` }}>
            <div className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: COLORS.ZUKUNFT }}>
              Zukunft Readiness (Stufe {analysis.zukunftMaturityLevel})
            </div>
            <div className="text-base font-black text-gray-900 mb-1">{zukunftMaturity.vertrieb}</div>
            <p className="text-xs text-gray-600 font-bold leading-relaxed">
              {analysis.zukunftMaturityLevel <= 2
                ? 'Starte mit systematischer Zukunftsbeobachtung und entwickle dein erstes Zukunftsbild.'
                : analysis.zukunftMaturityLevel <= 4
                ? 'Baue eine echte Zukunftsstrategie auf und verankere sie organisatorisch.'
                : 'Skaliere deine Zukunftsarbeit und setze sie systematisch in neue Geschäftsmodelle um.'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecommendationCard;
