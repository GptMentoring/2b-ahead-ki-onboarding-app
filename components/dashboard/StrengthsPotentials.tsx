
import React from 'react';
import { COLORS } from '../../constants';
import { PillarAnalysis } from './shared';

interface StrengthsPotentialsProps {
  strengths: PillarAnalysis[];
  potentials: PillarAnalysis[];
}

const PillarBar: React.FC<{ items: PillarAnalysis[]; label: string; labelColor: string; icon: string; iconBg: string }> = ({
  items, label, labelColor, icon, iconBg,
}) => (
  <div className="flex flex-col gap-2">
    <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${labelColor}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${iconBg}`}>{icon}</span>
      {label}
    </span>
    {items.map((p) => (
      <div key={p.key} className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-gray-100">
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-gray-800">{p.name}</span>
            <span className="text-xs font-black" style={{ color: p.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT }}>
              {p.score}/{p.maxScore}
            </span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${p.percent}%`, backgroundColor: p.type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT }} />
          </div>
        </div>
        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${p.type === 'ki' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
          {p.type === 'ki' ? 'KI' : 'Zukunft'}
        </span>
      </div>
    ))}
  </div>
);

const StrengthsPotentials: React.FC<StrengthsPotentialsProps> = ({ strengths, potentials }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
    <PillarBar items={strengths} label="Top-3 Stärken" labelColor="text-emerald-700" icon="+" iconBg="bg-emerald-100" />
    <PillarBar items={potentials} label="Top-3 Potenziale" labelColor="text-amber-700" icon="!" iconBg="bg-amber-100" />
  </div>
);

export default StrengthsPotentials;
