// ═══════════════════════════════════════════════════════════════════
// IST-ANALYSE PROFIL: Dashboard-Sektion
// Zeigt Quadrant, Tool-Empfehlungen, Blueprint-Empfehlungen,
// Session-Empfehlung nach Abschluss der Ist-Analyse
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { IstAnalyseProfile } from '../types';
import { COLORS } from '../constants';
import { QUADRANT_DEFINITIONS } from '../istAnalyseConstants';
import { Card } from './UIComponents';
import { IconTarget, IconClipboard, IconWrench, IconCalendar, Icon } from './Icons';

interface IstAnalyseProfileSectionProps {
  profile: IstAnalyseProfile;
}

const IstAnalyseProfileSection: React.FC<IstAnalyseProfileSectionProps> = ({ profile }) => {
  const quadrantDef = QUADRANT_DEFINITIONS.find(q => q.name === profile.quadrant);

  return (
    <div className="space-y-6">
      {/* ── Section Header ────────────────────────────────── */}
      <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <span className="text-gray-400"><IconTarget size={24} /></span> Dein persönliches Profil
      </h3>

      {/* ── Quadrant ──────────────────────────────────────── */}
      <Card className="p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS.PRIMARY}10`, color: COLORS.PRIMARY }}>
            {quadrantDef?.icon ? <Icon name={quadrantDef.icon} size={24} /> : <IconTarget size={24} />}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Dein Profil-Typ
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">
              {profile.quadrant}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {quadrantDef?.beschreibung || ''}
            </p>
          </div>
        </div>

        {/* Einstiegspunkt Badge */}
        <div className="mt-4 flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: COLORS.PRIMARY }}>
            {profile.einstiegspunkt}
          </span>
        </div>
      </Card>

      {/* ── Blueprint-Empfehlungen ────────────────────────── */}
      {profile.blueprintEmpfehlungen.length > 0 && (
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-500"><IconClipboard size={20} /></span>
            <h4 className="text-lg font-black text-gray-900">Empfohlene Blueprints</h4>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Basierend auf deinen Zielen und deiner Erfahrung empfehlen wir dir diese Use Cases:
          </p>
          <div className="grid gap-3">
            {profile.blueprintEmpfehlungen.map((bp, idx) => (
              <div
                key={bp}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm"
                  style={{ backgroundColor: COLORS.SUCCESS }}
                >
                  {idx + 1}
                </span>
                <span className="font-semibold text-gray-800">{bp}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Tool-Empfehlungen + Session ──────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tools */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-500"><IconWrench size={18} /></span>
            <h4 className="text-base font-black text-gray-900">Empfohlene Tools</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.toolEmpfehlungen.map((tool) => (
              <span
                key={tool}
                className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200"
              >
                {tool}
              </span>
            ))}
          </div>
        </Card>

        {/* Session-Empfehlung */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-500"><IconCalendar size={18} /></span>
            <h4 className="text-base font-black text-gray-900">Session-Empfehlung</h4>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Wir empfehlen dir den <strong>{profile.sessionEmpfehlung}</strong>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Basierend auf deinem aktuellen KI-Erfahrungslevel
          </p>
        </Card>
      </div>
    </div>
  );
};

export default IstAnalyseProfileSection;
