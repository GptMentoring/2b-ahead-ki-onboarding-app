
import React from 'react';
import { Analysis, IstAnalyseProfile } from '../../types';
import { COLORS } from '../../constants';
import { Card } from '../UIComponents';
import { formatEur } from './shared';

interface RecommendationCardProps {
  analysis: Analysis;
  istAnalyseProfile?: IstAnalyseProfile;
}

// Kundenfreundliches Produktnamen-Mapping
const PRODUCT_DISPLAY: Record<string, { name: string; icon: string; beschreibung: string }> = {
  'Basis': {
    name: 'KI-Grundlagen Kurs',
    icon: '\uD83C\uDF31',
    beschreibung: 'Strukturierter Einstieg in die KI-Welt + Zugang zur Community + erste Tools und Vorlagen',
  },
  'Booster+': {
    name: 'Intensiv-Mentoring',
    icon: '\uD83D\uDE80',
    beschreibung: 'W\u00F6chentliche 1:1 Sessions + pers\u00F6nlicher KI-Fahrplan + Zugang zu allen Blueprints',
  },
  'Booster++': {
    name: 'Premium KI-Transformation',
    icon: '\u26A1',
    beschreibung: 'T\u00E4glicher Zugang zu KI-Experten + ma\u00DFgeschneiderte Automatisierungen + strategische Begleitung',
  },
};

// Fallback basierend auf KI-Score (wenn kein IstAnalyse-Profil vorhanden)
function getDefaultProduct(kiScore: number): string {
  if (kiScore <= 30) return 'Basis';
  if (kiScore <= 60) return 'Booster+';
  return 'Booster++';
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ analysis, istAnalyseProfile }) => {
  const produktKey = istAnalyseProfile?.produktEmpfehlung || getDefaultProduct(analysis.kiScore);
  const produkt = PRODUCT_DISPLAY[produktKey] || PRODUCT_DISPLAY['Booster+'];
  const cecGesamt = analysis.cecData?.gesamtErgebnis || 0;
  const quartalsErsparnis = Math.round(cecGesamt * 0.3);

  return (
    <Card className="p-6 md:p-8 mb-8 border-2 overflow-hidden" style={{ borderColor: `${COLORS.PRIMARY}25` }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: COLORS.PRIMARY }}>
          Dein n\u00E4chster Schritt
        </h3>
      </div>

      {/* Kontextzeile */}
      <p className="text-sm text-gray-500 font-bold mb-5">
        Basierend auf deinem Level ({analysis.kiMaturityLevel})
        {cecGesamt > 0 && (
          <> und deinem ROI-Potenzial von <span className="font-black text-gray-700">{formatEur(cecGesamt)}/Jahr</span></>
        )}
        {' '}empfehlen wir:
      </p>

      {/* Produkt-Empfehlungsbox */}
      <div
        className="rounded-2xl p-5 md:p-6 mb-5"
        style={{ backgroundColor: `${COLORS.PRIMARY}06`, border: `2px solid ${COLORS.PRIMARY}18` }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{produkt.icon}</span>
          <div className="flex-1">
            <h4 className="text-base md:text-lg font-black text-gray-900 mb-2 uppercase tracking-wide">
              {produkt.name}
            </h4>
            <p className="text-sm text-gray-600 font-bold leading-relaxed mb-4">
              {produkt.beschreibung}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{ backgroundColor: COLORS.PRIMARY }}
            >
              Mehr erfahren
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Vertrauens-Element: ROI-basiert */}
      {cecGesamt > 0 && quartalsErsparnis > 0 && (
        <p className="text-xs font-bold leading-relaxed" style={{ color: COLORS.SUCCESS }}>
          Du sparst damit bis zu <span className="font-black">{formatEur(quartalsErsparnis)}</span> im ersten Quartal.
        </p>
      )}

      {/* Vertrauens-Element: Assessment-basiert */}
      <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">
        Basierend auf deinem Assessment
      </p>
    </Card>
  );
};

export default RecommendationCard;
