
import React from 'react';
import { Analysis, Assessment } from '../../types';
import {
  COLORS, KI_PILLAR_NAMES, ZUKUNFT_PILLAR_NAMES,
  KI_QUESTIONS, ZUKUNFT_QUESTIONS,
} from '../../constants';
import ScoreRadar from '../RadarChart';
import { Card } from '../UIComponents';

interface DetailPanelsProps {
  analysis: Analysis;
  assessment: Assessment;
  isSolo: boolean;
  showKiDetail: boolean;
  showZukunftDetail: boolean;
}

const DetailPanels: React.FC<DetailPanelsProps> = ({ analysis, assessment, isSolo, showKiDetail, showZukunftDetail }) => (
  <>
    {/* ─── KI Detail-Panel ─── */}
    {showKiDetail && (
      <div className="mb-4 -mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
        <Card className="p-6 md:p-8 border-2" style={{ borderColor: `${COLORS.PRIMARY}20` }}>
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: COLORS.PRIMARY }}>
            KI Readiness — Detailansicht
          </h4>
          <div className="flex flex-col items-center mb-6">
            <ScoreRadar scores={analysis.kiPillarScores || { kompetenz: 0, tools: 0, steuerung: 0, zukunft: 0 }} pillarNames={KI_PILLAR_NAMES} maxScore={25} color={COLORS.PRIMARY} height={280} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 w-full max-w-xl">
              {Object.entries(KI_PILLAR_NAMES).map(([key, name]) => (
                <div key={key} className="flex justify-between items-center px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                  <span className="font-bold text-gray-500">{name}</span>
                  <span className="font-black" style={{ color: COLORS.PRIMARY }}>{(analysis.kiPillarScores as any)?.[key] ?? 0}/25</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['kompetenz', 'tools', 'steuerung', 'zukunft'].map(pillar => {
              const questions = KI_QUESTIONS.filter(q => q.pillar === pillar);
              return (
                <div key={pillar} className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <h5 className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: COLORS.PRIMARY }}>
                    {KI_PILLAR_NAMES[pillar]}
                  </h5>
                  {questions.map(q => {
                    const val = (assessment as any)[q.field];
                    const options = (isSolo && q.optionsSolo) ? q.optionsSolo : q.options;
                    const selectedOpt = options.find(o => o.points === val);
                    const questionText = (isSolo && q.questionSolo) ? q.questionSolo : q.questionTeam;
                    return (
                      <div key={q.id} className="py-1 border-b border-gray-100">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] text-gray-500 font-bold leading-relaxed">{q.id}: {questionText}</span>
                          <span className="text-[10px] font-black whitespace-nowrap" style={{ color: COLORS.PRIMARY }}>{val ?? 0}/{q.maxPoints}</span>
                        </div>
                        <div className="text-[10px] font-bold text-gray-800 mt-0.5">{selectedOpt ? selectedOpt.label : '\u2014'}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    )}

    {/* ─── Zukunft Detail-Panel ─── */}
    {showZukunftDetail && (
      <div className="mb-4 -mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
        <Card className="p-6 md:p-8 border-2" style={{ borderColor: `${COLORS.ZUKUNFT}20` }}>
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: COLORS.ZUKUNFT }}>
            Zukunft Readiness — Detailansicht
          </h4>
          <div className="flex flex-col items-center mb-6">
            <ScoreRadar scores={analysis.zukunftPillarScores || { zukunftsbild: 0, zukunftsstrategie: 0, zukunftskompetenzen: 0, umsetzung: 0 }} pillarNames={ZUKUNFT_PILLAR_NAMES} maxScore={25} color={COLORS.ZUKUNFT} height={280} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 w-full max-w-xl">
              {Object.entries(ZUKUNFT_PILLAR_NAMES).map(([key, name]) => (
                <div key={key} className="flex justify-between items-center px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                  <span className="font-bold text-gray-500">{name}</span>
                  <span className="font-black" style={{ color: COLORS.ZUKUNFT }}>{(analysis.zukunftPillarScores as any)?.[key] ?? 0}/25</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['zukunftsbild', 'zukunftsstrategie', 'zukunftskompetenzen', 'umsetzung'].map(pillar => {
              const questions = ZUKUNFT_QUESTIONS.filter(q => q.pillar === pillar);
              return (
                <div key={pillar} className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <h5 className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: COLORS.ZUKUNFT }}>
                    {ZUKUNFT_PILLAR_NAMES[pillar]}
                  </h5>
                  {questions.map(q => {
                    const val = (assessment as any)[q.field];
                    const options = (isSolo && q.optionsSolo) ? q.optionsSolo : q.options;
                    const selectedOpt = options.find(o => o.points === val);
                    const questionText = (isSolo && q.questionSolo) ? q.questionSolo : q.questionTeam;
                    return (
                      <div key={q.id} className="py-1 border-b border-gray-100">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] text-gray-500 font-bold leading-relaxed">{q.id}: {questionText}</span>
                          <span className="text-[10px] font-black whitespace-nowrap" style={{ color: COLORS.ZUKUNFT }}>{val ?? 0}/{q.maxPoints}</span>
                        </div>
                        <div className="text-[10px] font-bold text-gray-800 mt-0.5">{selectedOpt ? selectedOpt.label : '\u2014'}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    )}
  </>
);

export default DetailPanels;
