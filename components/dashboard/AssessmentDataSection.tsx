
import React from 'react';
import { Analysis, Assessment } from '../../types';
import {
  COLORS, KI_PILLAR_NAMES, ZUKUNFT_PILLAR_NAMES,
  KI_QUESTIONS, ZUKUNFT_QUESTIONS,
} from '../../constants';

interface AssessmentDataSectionProps {
  analysis: Analysis;
  assessment: Assessment;
  isSolo: boolean;
}

const QuestionsGrid: React.FC<{
  pillars: string[];
  pillarNames: Record<string, string>;
  questions: any[];
  color: string;
  assessment: Assessment;
  isSolo: boolean;
  label: string;
}> = ({ pillars, pillarNames, questions, color, assessment, isSolo, label }) => (
  <div>
    <h4 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color }}>{label}</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pillars.map(pillar => {
        const qs = questions.filter((q: any) => q.pillar === pillar);
        return (
          <div key={pillar} className="p-4 bg-gray-50 rounded-xl space-y-2">
            <h5 className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color }}>
              {pillarNames[pillar]}
            </h5>
            {qs.map((q: any) => {
              const val = (assessment as any)[q.field];
              const options = (isSolo && q.optionsSolo) ? q.optionsSolo : q.options;
              const selectedOpt = options.find((o: any) => o.points === val);
              const questionText = (isSolo && q.questionSolo) ? q.questionSolo : q.questionTeam;
              return (
                <div key={q.id} className="py-1 border-b border-gray-100">
                  <div className="flex justify-between items-start gap-2 text-xs">
                    <span className="text-gray-500 font-bold leading-relaxed">{q.id}: {questionText}</span>
                    <span className="font-black whitespace-nowrap" style={{ color }}>{val ?? 0}/{q.maxPoints}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-800 mt-0.5">{selectedOpt ? selectedOpt.label : '\u2014'}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  </div>
);

const AssessmentDataSection: React.FC<AssessmentDataSectionProps> = ({ analysis, assessment, isSolo }) => (
  <div className="space-y-6">
    {/* Meta-Daten */}
    <div className="p-4 bg-gray-50 rounded-xl">
      <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3">Profil</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div><span className="font-bold text-gray-400 block text-[9px] uppercase">Modus</span><span className="font-black">{isSolo ? 'Solo' : 'Team'}</span></div>
        <div><span className="font-bold text-gray-400 block text-[9px] uppercase">Stundensatz</span><span className="font-black">{assessment.m2_stundensatz} EUR</span></div>
        <div><span className="font-bold text-gray-400 block text-[9px] uppercase">Jahresumsatz</span><span className="font-black">{assessment.m3_jahresumsatz}</span></div>
        <div><span className="font-bold text-gray-400 block text-[9px] uppercase">Einschränkungen</span><span className="font-black">{assessment.m4_einschraenkungen || 'Keine'}</span></div>
      </div>
    </div>

    {/* KI Fragen */}
    <QuestionsGrid
      pillars={['kompetenz', 'tools', 'steuerung', 'zukunft']}
      pillarNames={KI_PILLAR_NAMES}
      questions={KI_QUESTIONS}
      color={COLORS.PRIMARY}
      assessment={assessment}
      isSolo={isSolo}
      label="KI Readiness — Einzelwerte"
    />

    {/* Zukunft Fragen */}
    <QuestionsGrid
      pillars={['zukunftsbild', 'zukunftsstrategie', 'zukunftskompetenzen', 'umsetzung']}
      pillarNames={ZUKUNFT_PILLAR_NAMES}
      questions={ZUKUNFT_QUESTIONS}
      color={COLORS.ZUKUNFT}
      assessment={assessment}
      isSolo={isSolo}
      label="Zukunft Readiness — Einzelwerte"
    />
  </div>
);

export default AssessmentDataSection;
