// ═══════════════════════════════════════════════════════════════════
// IST-ANALYSE VIEW: Qualitatives Onboarding-Profil (6 Module, 27+ Fragen)
// Step-basierter Wizard mit Einstiegspunkt-Logik und bedingtem Modul 5
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { User, IstAnalyse, IstAnalyseProfile } from '../types';
import { COLORS } from '../constants';
import { Card, Button, InfoBox, VoiceButton } from './UIComponents';
import {
  IST_ANALYSE_MODULES,
  IST_ANALYSE_QUESTIONS,
  IstAnalyseQuestionDef,
  getModuleOrder,
  getQuestionsForModule,
  getModuleDef,
} from '../istAnalyseConstants';
import { buildIstAnalyseProfile } from '../services/istAnalyseEngine';
import { dbService } from '../services/dbService';
import { Icon, IconCheck } from './Icons';

interface IstAnalyseViewProps {
  user: User;
  onComplete: (profile: IstAnalyseProfile) => void;
}

// ─── Initiale leere Form-Daten ──────────────────────────────

const EMPTY_FORM: Record<string, any> = {
  einstiegspunkt: '',
  i1_1_arbeitsform: '',
  i1_2_branche: '',
  i1_2_freitext: '',
  i1_3_rolle: '',
  i1_4_team_groesse: '',
  i1_5_motivation: [],
  i2_1_erfahrung: '',
  i2_2_tools: [],
  i2_2_freitext: '',
  i2_3_einschraenkungen: '',
  i2_3_freitext: '',
  i2_4_zeitaufwand: '',
  i2_5_automationen: '',
  i3_1_einsatzbereiche: [],
  i3_2_dreimonatsziel: '',
  i3_3_usecase: '',
  i3_4_huerden: '',
  i3_4_freitext: '',
  i4_1_zeit_investition: '',
  i4_2_lernstil: [],
  i4_3_umsetzer: '',
  i4_4_budget: '',
  i5_1_team_stimmung: '',
  i5_2_ki_strategie: '',
  i5_3_tool_entscheider: '',
  i6_1_zukunftsbild: '',
  i6_2_trendbeobachtung: '',
  i6_3_strategie_3_5: '',
  i6_4_investition_zukunft: '',
  i6_5_zukunftshoffnung: [],
};

// ═══════════════════════════════════════════════════════════════
// HAUPT-KOMPONENTE
// ═══════════════════════════════════════════════════════════════

const IstAnalyseView: React.FC<IstAnalyseViewProps> = ({ user, onComplete }) => {
  const [form, setForm] = useState<Record<string, any>>({ ...EMPTY_FORM });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [prefillLoaded, setPrefillLoaded] = useState(false);

  // ─── Vorauswahl aus bestehendem Scoring-Assessment ─────────

  useEffect(() => {
    if (prefillLoaded) return;
    dbService.getAssessment(user.uid).then(assessment => {
      if (!assessment) { setPrefillLoaded(true); return; }

      const prefill: Record<string, any> = {};

      // M1: Solo/Team → Arbeitsform + Team-Größe
      if (assessment.m1_solo === 'solo') {
        prefill.i1_1_arbeitsform = 'solo_freelancer';
        prefill.i1_4_team_groesse = 'nur_ich';
      }
      // Bei 'team' setzen wir nur Team-Größe-Hinweis, nicht Arbeitsform
      // (da Team verschiedene Optionen hat: Kleinunternehmer, Mittelstand, Konzern, Angestellter)

      // M4: Einschränkungen → direkte Zuordnung
      if (assessment.m4_einschraenkungen) {
        const mapping: Record<string, string> = {
          'keine': 'keine',
          'microsoft': 'microsoft',
          'google': 'google',
          'free': 'andere',
          'blocked': 'andere',
        };
        const mapped = mapping[assessment.m4_einschraenkungen];
        if (mapped) {
          prefill.i2_3_einschraenkungen = mapped;
          // Bei "free"/"blocked" auch Freitext vorbefüllen
          if (assessment.m4_einschraenkungen === 'free') {
            prefill.i2_3_freitext = 'Nur kostenlose Tools (kein Budget)';
          } else if (assessment.m4_einschraenkungen === 'blocked') {
            prefill.i2_3_freitext = 'KI-Tools sind komplett blockiert/verboten';
          }
        }
      }

      if (Object.keys(prefill).length > 0) {
        setForm(prev => ({ ...prev, ...prefill }));
      }
      setPrefillLoaded(true);
    }).catch(() => {
      setPrefillLoaded(true);
    });
  }, [user.uid, prefillLoaded]);

  // ─── Modul-Reihenfolge berechnen ──────────────────────────

  const hasTeam = form.i1_4_team_groesse && form.i1_4_team_groesse !== 'nur_ich';
  const moduleOrder = useMemo(() => {
    return getModuleOrder(form.einstiegspunkt || 'ki', hasTeam);
  }, [form.einstiegspunkt, hasTeam]);

  const currentModule = moduleOrder[currentStepIndex] ?? 0;
  const currentModuleDef = getModuleDef(currentModule);
  const currentQuestions = useMemo(() => getQuestionsForModule(currentModule), [currentModule]);
  const totalSteps = moduleOrder.length;

  // ─── Scroll to top bei Step-Wechsel ────────────────────────

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStepIndex]);

  // ─── Form-Handler ──────────────────────────────────────────

  const handleSingleSelect = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }, []);

  const handleMultiSelect = useCallback((field: string, value: string, maxSelect?: number) => {
    setForm(prev => {
      const current: string[] = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v: string) => v !== value) };
      }
      if (maxSelect && current.length >= maxSelect) return prev;
      return { ...prev, [field]: [...current, value] };
    });
    setError('');
  }, []);

  const handleFreitext = useCallback((field: string, value: string, maxLength?: number) => {
    if (maxLength && value.length > maxLength) return;
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }, []);

  // ─── Validierung ──────────────────────────────────────────

  const isStepValid = useMemo(() => {
    for (const q of currentQuestions) {
      if (q.optional) continue;
      const value = form[q.field];
      if (q.type === 'multi-select') {
        if (!value || (value as string[]).length === 0) return false;
      } else if (q.type === 'freitext') {
        if (!value || (value as string).trim() === '') return false;
      } else {
        if (!value || value === '') return false;
      }
    }
    return true;
  }, [currentQuestions, form]);

  // ─── Navigation ───────────────────────────────────────────

  const handleNext = () => {
    if (!isStepValid) {
      setError('Bitte beantworte alle Pflichtfragen.');
      return;
    }
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkipModule = () => {
    // Für optionale Module (z.B. Modul 6 bei KI-Einstieg)
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  // ─── Submit ───────────────────────────────────────────────

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const istAnalyse: IstAnalyse = {
        id: `ist_${user.uid}_${Date.now()}`,
        userId: user.uid,
        createdAt: Date.now(),
        einstiegspunkt: form.einstiegspunkt as 'ki' | 'zukunft' | 'beides',
        i1_1_arbeitsform: form.i1_1_arbeitsform,
        i1_2_branche: form.i1_2_branche,
        i1_2_freitext: form.i1_2_freitext || null,
        i1_3_rolle: form.i1_3_rolle,
        i1_4_team_groesse: form.i1_4_team_groesse,
        i1_5_motivation: form.i1_5_motivation,
        i2_1_erfahrung: form.i2_1_erfahrung,
        i2_2_tools: form.i2_2_tools,
        i2_2_freitext: form.i2_2_freitext || null,
        i2_3_einschraenkungen: form.i2_3_einschraenkungen,
        i2_3_freitext: form.i2_3_freitext || null,
        i2_4_zeitaufwand: form.i2_4_zeitaufwand,
        i2_5_automationen: form.i2_5_automationen,
        i3_1_einsatzbereiche: form.i3_1_einsatzbereiche,
        i3_2_dreimonatsziel: form.i3_2_dreimonatsziel,
        i3_3_usecase: form.i3_3_usecase || null,
        i3_4_huerden: form.i3_4_huerden,
        i3_4_freitext: form.i3_4_freitext || null,
        i4_1_zeit_investition: form.i4_1_zeit_investition,
        i4_2_lernstil: form.i4_2_lernstil,
        i4_3_umsetzer: form.i4_3_umsetzer,
        i4_4_budget: form.i4_4_budget,
        i5_1_team_stimmung: form.i5_1_team_stimmung || null,
        i5_2_ki_strategie: form.i5_2_ki_strategie || null,
        i5_3_tool_entscheider: form.i5_3_tool_entscheider || null,
        i6_1_zukunftsbild: form.i6_1_zukunftsbild || null,
        i6_2_trendbeobachtung: form.i6_2_trendbeobachtung || null,
        i6_3_strategie_3_5: form.i6_3_strategie_3_5 || null,
        i6_4_investition_zukunft: form.i6_4_investition_zukunft || null,
        i6_5_zukunftshoffnung: form.i6_5_zukunftshoffnung?.length > 0 ? form.i6_5_zukunftshoffnung : null,
      };

      // Profil berechnen
      const profile = buildIstAnalyseProfile(istAnalyse, user.uid);

      // Speichern
      await dbService.saveIstAnalyse(istAnalyse);
      await dbService.saveIstAnalyseProfile(profile);

      onComplete(profile);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Ist letztes Modul das Zukunft-Modul? (für Skip-Button) ──

  const isLastModule = currentStepIndex === totalSteps - 1;
  const isOptionalModule = (() => {
    // Modul 6 ist optional bei KI-Einstieg
    if (currentModule === 6 && form.einstiegspunkt === 'ki') return true;
    // Module 1-5 sind optional bei Zukunft-Einstieg (nach Modul 6)
    if (form.einstiegspunkt === 'zukunft' && currentModule >= 1 && currentModule <= 5) return true;
    return false;
  })();

  // ─── Farbe für Progress ───────────────────────────────────

  const progressColor = COLORS.SUCCESS;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: COLORS.PRIMARY }}>
          KI Ist-Analyse
        </h1>
        <p className="text-gray-500 text-lg">
          Erzähl uns von dir — wir personalisieren dein Erlebnis
        </p>
      </div>

      {/* ── Progress Bar ────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2 font-semibold">
          <span>Schritt {currentStepIndex + 1} von {totalSteps}</span>
          <span>{Math.round(((currentStepIndex + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
      </div>

      {/* ── Modul-Header ────────────────────────────────────── */}
      {currentModuleDef && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-gray-500"><Icon name={currentModuleDef.icon} size={24} /></span>
            <h2 className="text-xl font-black text-gray-900">
              {currentModuleDef.name}
            </h2>
          </div>
          <p className="text-gray-500">{currentModuleDef.description}</p>
        </div>
      )}

      {/* ── Fragen ──────────────────────────────────────────── */}
      <div className="space-y-6">
        {currentQuestions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={form[question.field]}
            freitextValue={question.freitextField ? form[question.freitextField] : undefined}
            onSingleSelect={handleSingleSelect}
            onMultiSelect={handleMultiSelect}
            onFreitext={handleFreitext}
          />
        ))}
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────── */}
      <div className="flex justify-between mt-10 gap-4">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
        >
          Zurück
        </Button>

        <div className="flex gap-3">
          {isOptionalModule && !isLastModule && (
            <Button variant="outline" onClick={handleSkipModule}>
              Später ausfüllen
            </Button>
          )}

          {isLastModule ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid || isSubmitting}
            >
              {isSubmitting ? 'Wird gespeichert...' : 'Profil erstellen'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!isStepValid}>
              Weiter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// FRAGE-RENDERER KOMPONENTE
// ═══════════════════════════════════════════════════════════════

interface QuestionRendererProps {
  question: IstAnalyseQuestionDef;
  value: any;
  freitextValue?: string;
  onSingleSelect: (field: string, value: string) => void;
  onMultiSelect: (field: string, value: string, maxSelect?: number) => void;
  onFreitext: (field: string, value: string, maxLength?: number) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  freitextValue,
  onSingleSelect,
  onMultiSelect,
  onFreitext,
}) => {
  const isOptional = question.optional;

  return (
    <Card className="p-6">
      <h3 className="font-bold text-gray-900 mb-1 text-base">
        {question.questionText}
        {isOptional && <span className="text-gray-400 font-normal ml-2">(optional)</span>}
      </h3>

      {/* ── Single-Select ──────────────────────────────────── */}
      {question.type === 'single-select' && question.options && (
        <div className="grid gap-2 mt-4">
          {question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSingleSelect(question.field, opt.value)}
              className={`text-left px-5 py-3.5 rounded-xl border-2 transition-all font-semibold text-sm ${
                value === opt.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Single-Select + Freitext ───────────────────────── */}
      {question.type === 'single-select-freitext' && question.options && (
        <div className="space-y-3 mt-4">
          <div className="grid gap-2">
            {question.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSingleSelect(question.field, opt.value)}
                className={`text-left px-5 py-3.5 rounded-xl border-2 transition-all font-semibold text-sm ${
                  value === opt.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Freitext wenn "Sonstiges" oder "andere" gewählt */}
          {(value === 'sonstiges' || value === 'andere') && question.freitextField && (
            <div className="mt-3">
              <input
                type="text"
                value={freitextValue || ''}
                onChange={(e) => onFreitext(question.freitextField!, e.target.value)}
                placeholder="Bitte spezifizieren..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Multi-Select ───────────────────────────────────── */}
      {question.type === 'multi-select' && question.options && (
        <div className="space-y-3 mt-4">
          {question.maxSelect && (
            <p className="text-xs text-gray-400 font-medium">
              {(value as string[] || []).length} / {question.maxSelect} ausgewählt
            </p>
          )}
          <div className="grid gap-2">
            {question.options.map((opt) => {
              const selected = (value as string[] || []).includes(opt.value);
              const atMax = question.maxSelect ? (value as string[] || []).length >= question.maxSelect : false;
              return (
                <button
                  key={opt.value}
                  onClick={() => onMultiSelect(question.field, opt.value, question.maxSelect)}
                  disabled={!selected && atMax}
                  className={`text-left px-5 py-3.5 rounded-xl border-2 transition-all font-semibold text-sm ${
                    selected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : atMax
                        ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                      selected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                    }`}>
                      {selected && <IconCheck size={12} />}
                    </span>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Freitext wenn "Andere" in Multi-Select gewählt */}
          {(value as string[] || []).includes('andere') && question.freitextField && (
            <div className="mt-3">
              <input
                type="text"
                value={freitextValue || ''}
                onChange={(e) => onFreitext(question.freitextField!, e.target.value)}
                placeholder="Welche anderen Tools nutzt du?"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Freitext ───────────────────────────────────────── */}
      {question.type === 'freitext' && (
        <div className="mt-4 space-y-2">
          <div className="relative">
            <textarea
              value={value || ''}
              onChange={(e) => onFreitext(question.field, e.target.value, question.maxLength)}
              placeholder={question.placeholder || 'Deine Antwort...'}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm resize-none"
            />
            <div className="absolute bottom-2 right-3 flex items-center gap-2">
              {question.maxLength && (
                <span className="text-xs text-gray-300">
                  {(value || '').length}/{question.maxLength}
                </span>
              )}
              <VoiceButton onTranscription={(text) => {
                const current = value || '';
                const combined = current ? `${current} ${text}` : text;
                onFreitext(question.field, combined, question.maxLength);
              }} />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default IstAnalyseView;
