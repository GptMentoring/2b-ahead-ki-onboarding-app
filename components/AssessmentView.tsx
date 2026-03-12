
import React, { useState, useMemo } from 'react';
import { User, Assessment, Analysis, QuestionDef } from '../types';
import { dbService } from '../services/dbService';
import { buildFullAnalysis } from '../services/mockStore';
import {
  COLORS, KI_QUESTIONS, KI_BONUS_QUESTION, ZUKUNFT_QUESTIONS,
  ASSESSMENT_STEPS, JAHRESUMSATZ_RANGES
} from '../constants';
import { Card, Button, InfoBox } from './UIComponents';

interface AssessmentViewProps {
  user: User;
  onComplete: (a: Analysis) => void;
}

// ─── Hilfsfunktion: CEC-Vorschau berechnen ──────────────────────

function formatEur(val: number): string {
  return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

// ─── QuestionCard: Generische Frage-Komponente ──────────────────

interface QuestionCardProps {
  question: QuestionDef;
  selectedIndex: number | undefined;
  isSolo: boolean;
  onSelect: (optionIndex: number, points: number, cecMittelwert?: number) => void;
  accentColor: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedIndex, isSolo, onSelect, accentColor }) => {
  const questionText = (isSolo && question.questionSolo) ? question.questionSolo : question.questionTeam;
  const options = (isSolo && question.optionsSolo) ? question.optionsSolo : question.options;

  return (
    <div className="space-y-4">
      <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1 block">
        {question.id}: {questionText}
      </label>
      {question.hint && (
        <p className="text-xs text-gray-500 italic font-bold ml-1">{question.hint}</p>
      )}
      <div className={`grid gap-3 ${
        // Kurze Labels (alle ≤12 Zeichen)? → Volle Reihen
        options.every(o => o.label.length <= 12)
          ? options.length <= 3 ? 'grid-cols-3'
            : options.length === 4 ? 'grid-cols-4'
            : options.length === 5 ? 'grid-cols-5'
            : options.length === 6 ? 'grid-cols-3 md:grid-cols-6'
            : 'grid-cols-3 md:grid-cols-4'
          : options.length <= 3 ? 'grid-cols-1 md:grid-cols-3'
            : options.length <= 4 ? 'grid-cols-2'
            : 'grid-cols-2 md:grid-cols-3'
      }`}>
        {options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <button
              key={`${opt.label}-${idx}`}
              onClick={() => onSelect(idx, opt.points, opt.cecMittelwert)}
              className={`p-4 border-2 rounded-2xl text-sm font-bold text-left transition-all ${
                isSelected
                  ? 'shadow-lg scale-[1.02]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
              }`}
              style={isSelected ? {
                borderColor: accentColor,
                backgroundColor: `${accentColor}10`,
                color: accentColor
              } : {}}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── CEC Preview Box ────────────────────────────────────────────

interface CECPreviewProps {
  form: Partial<Assessment>;
}

const CECPreview: React.FC<CECPreviewProps> = ({ form }) => {
  const stundensatz = form.m2_stundensatz || 0;
  const jahresumsatzRange = JAHRESUMSATZ_RANGES.find(r => r.value === form.m3_jahresumsatz);
  const jahresumsatzCec = jahresumsatzRange?.cec || 0;

  const zeiteinsparung = (form.t2_cec_mittelwert || 0) * stundensatz * 52;
  const kosteneinsparung = form.t3_cec_wert || 0;
  const umsatzsteigerung = (form.t4_cec_prozent || 0) * jahresumsatzCec;
  const gesamt = zeiteinsparung + kosteneinsparung + umsatzsteigerung;

  if (gesamt === 0) return null;

  return (
    <div className="mt-8 p-6 rounded-2xl border-2 border-amber-200 bg-amber-50/50">
      <h4 className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-4">
        CEC — Wirtschaftlicher Effekt (Vorschau)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {zeiteinsparung > 0 && (
          <div>
            <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Zeiteinsparung</div>
            <div className="text-lg font-black text-amber-800">{formatEur(zeiteinsparung)}/Jahr</div>
          </div>
        )}
        {kosteneinsparung > 0 && (
          <div>
            <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Kosteneinsparung</div>
            <div className="text-lg font-black text-amber-800">{formatEur(kosteneinsparung)}/Jahr</div>
          </div>
        )}
        {umsatzsteigerung > 0 && (
          <div>
            <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Umsatzsteigerung</div>
            <div className="text-lg font-black text-amber-800">{formatEur(umsatzsteigerung)}/Jahr</div>
          </div>
        )}
      </div>
      {gesamt > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-200 text-center">
          <div className="text-[10px] font-black text-gray-500 uppercase mb-1">Geschätzter Gesamteffekt</div>
          <div className="text-2xl font-black text-amber-900">{formatEur(gesamt)}/Jahr</div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ASSESSMENT VIEW (10-Step Wizard)
// ═══════════════════════════════════════════════════════════════════

const AssessmentView: React.FC<AssessmentViewProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Speichert welcher Options-Index pro Frage gewählt wurde (für korrekte Darstellung)
  const [selectedIndices, setSelectedIndices] = useState<Record<string, number>>({});
  const [form, setForm] = useState<Partial<Assessment>>({
    userId: user.uid,
    status: 'in_progress',
    // Meta
    m1_solo: undefined,
    m2_stundensatz: 100,
    m3_jahresumsatz: undefined,
    m4_einschraenkungen: '',
  });

  const totalSteps = ASSESSMENT_STEPS.length;
  const currentStep = ASSESSMENT_STEPS[step];
  const isSolo = form.m1_solo === 'solo';

  // Fragen für den aktuellen Step
  const currentQuestions = useMemo((): QuestionDef[] => {
    switch (step) {
      case 1: return KI_QUESTIONS.filter(q => q.pillar === 'kompetenz');
      case 2: return KI_QUESTIONS.filter(q => q.pillar === 'tools');
      case 3: return KI_QUESTIONS.filter(q => q.pillar === 'steuerung');
      case 4: return [...KI_QUESTIONS.filter(q => q.pillar === 'zukunft'), KI_BONUS_QUESTION];
      case 5: return ZUKUNFT_QUESTIONS.filter(q => q.pillar === 'zukunftsbild');
      case 6: return ZUKUNFT_QUESTIONS.filter(q => q.pillar === 'zukunftsstrategie');
      case 7: return ZUKUNFT_QUESTIONS.filter(q => q.pillar === 'zukunftskompetenzen');
      case 8: return ZUKUNFT_QUESTIONS.filter(q => q.pillar === 'umsetzung');
      default: return [];
    }
  }, [step]);

  const next = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  // Prüfe ob alle Fragen im aktuellen Step beantwortet sind
  const isStepComplete = useMemo((): boolean => {
    if (step === 0) {
      // Meta: M1 (Solo/Team) und M3 (Jahresumsatz) sind Pflicht
      return !!form.m1_solo && !!form.m3_jahresumsatz;
    }
    if (step === totalSteps - 1) return true; // Submit-Step braucht keine Validierung
    // Für alle anderen Steps: Jede Frage muss beantwortet sein
    return currentQuestions.every(q => selectedIndices[q.field as string] !== undefined);
  }, [step, form.m1_solo, form.m3_jahresumsatz, currentQuestions, selectedIndices, totalSteps]);

  // Handler für Frage-Auswahl (setzt Punkte + CEC-Hilfswerte + Options-Index)
  const handleQuestionSelect = (question: QuestionDef, optionIndex: number, points: number, cecMittelwert?: number) => {
    // Options-Index merken (für eindeutige Auswahl-Darstellung)
    setSelectedIndices(prev => ({ ...prev, [question.field as string]: optionIndex }));

    // Punkte (auch halbe Punkte möglich) im Formular speichern
    const updates: Partial<Assessment> = { [question.field]: points };

    // CEC-Hilfswerte setzen
    if (question.id === 'T2' && cecMittelwert !== undefined) {
      updates.t2_cec_mittelwert = cecMittelwert;
    }
    if (question.id === 'T3' && cecMittelwert !== undefined) {
      updates.t3_cec_wert = cecMittelwert;
    }
    if (question.id === 'T4' && cecMittelwert !== undefined) {
      updates.t4_cec_prozent = cecMittelwert;
    }
    if (question.id === 'S3') {
      // CEC-Mittelwert für S3 Budget
      const s3CecMap: Record<number, number> = { 0: 0, 1: 500, 2: 2000, 3: 5000, 4: 7000 };
      const s3SoloCecMap: Record<number, number> = { 0: 0, 1: 50, 2: 200, 3: 450, 4: 600 };
      updates.s3_cec_monatlich = isSolo ? (s3SoloCecMap[points] || 0) : (s3CecMap[points] || 0);
    }

    setForm(prev => ({ ...prev, ...updates }));
  };

  // Submit — alle undefined-Werte durch 0/'' ersetzen (Firestore akzeptiert kein undefined)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(form)) {
        sanitized[key] = value === undefined ? (typeof value === 'string' ? '' : 0) : value;
      }
      // Felder die undefined sein könnten explizit auf 0 setzen
      const finalAssessment = {
        ...sanitized,
        id: 'ass-' + Date.now(),
        createdAt: Date.now(),
        status: 'completed' as const,
        m1_solo: form.m1_solo || 'solo',
        m2_stundensatz: form.m2_stundensatz || 100,
        m3_jahresumsatz: form.m3_jahresumsatz || 'unter_100k',
        m4_einschraenkungen: form.m4_einschraenkungen || '',
      } as Assessment;

      const previousAnalysis = await dbService.getAnalysis(user.uid);
      const analysis = buildFullAnalysis(finalAssessment, user.uid, previousAnalysis);

      await dbService.saveAssessment(finalAssessment);
      await dbService.saveAnalysis(analysis);
      onComplete(analysis);
    } catch (error) {
      console.error('Assessment submit error:', error);
      alert('Fehler beim Speichern. Bitte erneut versuchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Farbe für aktuellen Bereich
  const accentColor = currentStep?.color || COLORS.PRIMARY;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32 animate-in fade-in duration-1000">
      {/* ─── Progress Header ─── */}
      <div className="mb-12 no-print">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: accentColor }}>
              {currentStep?.bereich === 'ki' ? 'KI Assessment' : currentStep?.bereich === 'zukunft' ? 'Zukunfts Assessment' : currentStep?.title}
              {' — '}{currentStep?.title}
            </span>
            <h2 className="text-4xl font-black mt-2 text-gray-900">Readiness Assessment</h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-gray-900">{Math.round((step / (totalSteps - 1)) * 100)}%</span>
          </div>
        </div>

        {/* Dual-Color Progress Bar */}
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner border-2 border-gray-100 flex">
          {ASSESSMENT_STEPS.map((s, idx) => {
            const segmentWidth = 100 / totalSteps;
            const isFilled = idx <= step;
            let color = '#e5e7eb'; // gray
            if (isFilled) {
              if (s.bereich === 'ki') color = COLORS.PRIMARY;
              else if (s.bereich === 'zukunft') color = COLORS.ZUKUNFT;
              else if (s.bereich === 'submit') color = COLORS.SUCCESS;
              else color = COLORS.ACCENT;
            }
            return (
              <div
                key={s.id}
                className="h-full transition-all duration-700"
                style={{ width: `${segmentWidth}%`, backgroundColor: color }}
              />
            );
          })}
        </div>

        {/* Step indicator pills */}
        <div className="flex justify-between mt-3">
          {ASSESSMENT_STEPS.map((s, idx) => (
            <div
              key={s.id}
              className={`text-[8px] font-black uppercase tracking-tight ${idx <= step ? 'opacity-100' : 'opacity-30'}`}
              style={{ color: idx <= step ? s.color : '#9CA3AF' }}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </div>

      <Card className="p-8 md:p-12 min-h-[550px] flex flex-col relative overflow-hidden border-2 border-gray-200 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-full pointer-events-none no-print"
          style={{ backgroundColor: `${accentColor}08` }} />

        <div className="flex-1 z-10">
          {/* ═══ STEP 0: META ═══ */}
          {step === 0 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Über Dich</h3>

              <InfoBox title="Warum diese Fragen?" variant="gold">
                Mit diesen 4 Fragen passen wir den Fragebogen exakt auf deine Situation an.
                Aus deinem Stundensatz und Jahresumsatz berechnen wir automatisch deinen
                <strong> persönlichen KI-ROI</strong> — also wie viel Euro du durch KI-Einsatz
                pro Jahr einsparen oder zusätzlich erwirtschaften kannst.
                So siehst du am Ende nicht nur deinen Reifegrad, sondern auch den konkreten
                wirtschaftlichen Effekt.
              </InfoBox>

              {/* M1: Solo vs Team */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">
                  M1: Arbeitest du alleine oder im Team?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'solo' as const, label: 'Solo-Selbstständig', desc: 'Ich arbeite alleine oder mit wenigen Freelancern' },
                    { id: 'team' as const, label: 'Im Team/Unternehmen', desc: 'Ich arbeite mit Mitarbeitern in einer Organisation' }
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => setForm({ ...form, m1_solo: opt.id })}
                      className={`p-6 border-2 rounded-[24px] text-left transition-all ${form.m1_solo === opt.id ? 'shadow-xl' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                      style={form.m1_solo === opt.id ? { borderColor: COLORS.PRIMARY, backgroundColor: `${COLORS.PRIMARY}08` } : {}}
                    >
                      <span className={`block font-black text-sm mb-1`}
                        style={form.m1_solo === opt.id ? { color: COLORS.PRIMARY } : { color: '#111827' }}>
                        {opt.label}
                      </span>
                      <span className="text-xs text-gray-600 font-bold">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* M2: Stundensatz */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">
                    M2: Durchschnittlicher Stundensatz (brutto)
                  </label>
                  <span className="text-xl font-black" style={{ color: COLORS.PRIMARY }}>{form.m2_stundensatz} EUR</span>
                </div>
                <input
                  type="range" min="20" max="500" step="10"
                  className="w-full"
                  value={form.m2_stundensatz || 100}
                  onChange={e => setForm({ ...form, m2_stundensatz: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 italic font-bold">
                  Wird zur Berechnung des wirtschaftlichen KI-Effekts (CEC) verwendet.
                </p>
              </div>

              {/* M3: Jahresumsatz */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">
                  M3: Jahresumsatz
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {JAHRESUMSATZ_RANGES.map(range => (
                    <button key={range.value}
                      onClick={() => setForm({ ...form, m3_jahresumsatz: range.value })}
                      className={`p-4 border-2 rounded-2xl text-sm font-bold transition-all ${form.m3_jahresumsatz === range.value ? 'shadow-lg' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                      style={form.m3_jahresumsatz === range.value ? { borderColor: COLORS.PRIMARY, backgroundColor: `${COLORS.PRIMARY}08`, color: COLORS.PRIMARY } : { color: '#374151' }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* M4: Einschränkungen */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">
                  M4: Hast du Einschränkungen bei der Tool-Nutzung?
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'none', label: 'Keine Einschränkungen — ich kann alle Tools nutzen' },
                    { id: 'microsoft', label: 'Nur Microsoft-Tools erlaubt (Firmenvorgabe)' },
                    { id: 'google', label: 'Nur Google-Tools erlaubt (Firmenvorgabe)' },
                    { id: 'free', label: 'Nur kostenlose Tools (kein Budget)' },
                    { id: 'blocked', label: 'KI-Tools sind bei uns komplett blockiert/verboten' }
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => setForm({ ...form, m4_einschraenkungen: opt.id })}
                      className={`w-full p-4 border-2 rounded-2xl text-left text-sm font-bold transition-all ${form.m4_einschraenkungen === opt.id ? '' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                      style={form.m4_einschraenkungen === opt.id ? { borderColor: COLORS.PRIMARY, backgroundColor: `${COLORS.PRIMARY}08`, color: COLORS.PRIMARY } : { color: '#374151' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEPS 1-8: Scored Questions ═══ */}
          {step >= 1 && step <= 8 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                {currentStep?.title}
              </h3>

              {/* Bereich-Badge */}
              <div className="flex items-center gap-3">
                <span
                  className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {currentStep?.bereich === 'ki' ? 'KI Readiness' : 'Zukunft Readiness'}
                </span>
                <span className="text-xs font-bold text-gray-500">
                  {currentQuestions.length} Fragen
                </span>
              </div>

              {/* Question Cards */}
              {currentQuestions.map(question => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  selectedIndex={selectedIndices[question.field as string]}
                  isSolo={isSolo}
                  onSelect={(optIdx, points, cecMittelwert) => handleQuestionSelect(question, optIdx, points, cecMittelwert)}
                  accentColor={accentColor}
                />
              ))}

              {/* CEC Preview (nach Tools-Step) */}
              {step === 2 && <CECPreview form={form} />}
            </div>
          )}

          {/* ═══ STEP 9: Zusammenfassung & Submit ═══ */}
          {step === 9 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Zusammenfassung</h3>

              <InfoBox title="Geschafft!" variant="green">
                Du hast alle Fragen beantwortet. Klicke auf &quot;Analyse starten&quot;, um deine persönliche KI- und Zukunfts-Auswertung zu erhalten.
              </InfoBox>

              {/* Quick Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border-2" style={{ borderColor: COLORS.PRIMARY, backgroundColor: `${COLORS.PRIMARY}05` }}>
                  <h4 className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.PRIMARY }}>
                    KI Readiness
                  </h4>
                  <div className="space-y-2">
                    {['kompetenz', 'tools', 'steuerung', 'zukunft'].map(pillar => {
                      const questions = KI_QUESTIONS.filter(q => q.pillar === pillar);
                      const answered = questions.filter(q => form[q.field] !== undefined).length;
                      return (
                        <div key={pillar} className="flex justify-between text-xs">
                          <span className="font-bold text-gray-600 capitalize">{pillar}</span>
                          <span className="font-black" style={{ color: answered === questions.length ? COLORS.SUCCESS : '#EF4444' }}>
                            {answered}/{questions.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 rounded-2xl border-2" style={{ borderColor: COLORS.ZUKUNFT, backgroundColor: `${COLORS.ZUKUNFT}05` }}>
                  <h4 className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: COLORS.ZUKUNFT }}>
                    Zukunft Readiness
                  </h4>
                  <div className="space-y-2">
                    {['zukunftsbild', 'zukunftsstrategie', 'zukunftskompetenzen', 'umsetzung'].map(pillar => {
                      const questions = ZUKUNFT_QUESTIONS.filter(q => q.pillar === pillar);
                      const answered = questions.filter(q => form[q.field] !== undefined).length;
                      return (
                        <div key={pillar} className="flex justify-between text-xs">
                          <span className="font-bold text-gray-600 capitalize">{pillar}</span>
                          <span className="font-black" style={{ color: answered === questions.length ? COLORS.SUCCESS : '#EF4444' }}>
                            {answered}/{questions.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 font-bold">
                  Modus: <span className="font-black" style={{ color: COLORS.PRIMARY }}>
                    {isSolo ? 'Solo-Selbstständig' : 'Team/Unternehmen'}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Navigation ─── */}
        <div className="flex justify-between mt-16 pt-10 border-t-2 border-gray-200 z-10 no-print">
          {step > 0 ? (
            <Button onClick={prev} variant="secondary">ZURÜCK</Button>
          ) : <div />}
          {step < totalSteps - 1 ? (
            <Button
              onClick={next}
              className="px-14"
              style={{ backgroundColor: isStepComplete ? accentColor : '#D1D5DB' }}
              disabled={!isStepComplete}
            >
              {isStepComplete ? 'WEITER' : 'BITTE ALLE FRAGEN BEANTWORTEN'}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="px-20 shadow-2xl"
              style={{ backgroundColor: COLORS.SUCCESS }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'ANALYSIERE...' : 'ANALYSE STARTEN'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AssessmentView;
