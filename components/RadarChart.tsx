
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { COLORS } from '../constants';

interface ScoreRadarProps {
  scores: Record<string, number>;
  pillarNames: Record<string, string>;
  maxScore?: number;
  color?: string;
  height?: number;
}

const ScoreRadar: React.FC<ScoreRadarProps> = ({
  scores,
  pillarNames,
  maxScore = 25,
  color = COLORS.PRIMARY,
  height = 350,
}) => {
  const data = Object.keys(pillarNames).map(key => ({
    subject: pillarNames[key],
    score: scores[key] || 0,
    fullMark: maxScore,
  }));

  return (
    <div className="w-full" style={{ height: `${height}px`, minHeight: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: COLORS.TEXT_DARK, fontSize: 10, fontWeight: 'bold' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, maxScore]}
            tick={{ fontSize: 9 }}
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={color}
            fill={color}
            fillOpacity={0.5}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreRadar;
