
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { PillarScores } from '../types';
import { PILLAR_NAMES, COLORS } from '../constants';

interface Props {
  scores: PillarScores;
  benchmarkScores?: PillarScores | null;
}

const PentagonRadar: React.FC<Props> = ({ scores, benchmarkScores }) => {
  const data = [
    { 
      subject: PILLAR_NAMES.kompetenz, 
      User: scores.kompetenz, 
      Benchmark: benchmarkScores?.kompetenz || 0,
      fullMark: 5 
    },
    { 
      subject: PILLAR_NAMES.tools, 
      User: scores.tools, 
      Benchmark: benchmarkScores?.tools || 0,
      fullMark: 5 
    },
    { 
      subject: PILLAR_NAMES.steuerung, 
      User: scores.steuerung, 
      Benchmark: benchmarkScores?.steuerung || 0,
      fullMark: 5 
    },
    { 
      subject: PILLAR_NAMES.produkte, 
      User: scores.produkte, 
      Benchmark: benchmarkScores?.produkte || 0,
      fullMark: 5 
    },
    { 
      subject: PILLAR_NAMES.strategie, 
      User: scores.strategie, 
      Benchmark: benchmarkScores?.strategie || 0,
      fullMark: 5 
    },
  ];

  return (
    <div className="w-full h-[400px] min-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fill: COLORS.TEXT_DARK, fontSize: 10, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{fontSize: 10}} />
          
          {benchmarkScores && (
            <Radar
              name="Branchendurchschnitt"
              dataKey="Benchmark"
              stroke="#CBD5E0"
              fill="#CBD5E0"
              fillOpacity={0.3}
              strokeDasharray="4 4"
            />
          )}

          <Radar
            name="Ihr Score"
            dataKey="User"
            stroke={COLORS.PRIMARY}
            fill={COLORS.PRIMARY}
            fillOpacity={0.6}
          />
          
          {benchmarkScores && (
            <Legend 
              verticalAlign="bottom" 
              wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} 
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PentagonRadar;
