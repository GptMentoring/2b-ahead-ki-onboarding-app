
import React, { useState } from 'react';
import { User, Assessment, TechEcosystem, ComplianceLevel, ImplementationStyle, Analysis } from '../types';
import { dbService } from '../services/dbService';
import { calculatePillarScores, calculateOverallScore, getMaturityLevel } from '../services/mockStore';
import { COLORS, FOCUS_AREAS_OPTIONS, INDUSTRIES, MATURITY_LEVELS, TOOLTIPS, USECASE_EXAMPLES } from '../constants';
import { Card, Button, VoiceButton, Tooltip, InfoBox } from './UIComponents';

interface AssessmentViewProps {
  user: User;
  onComplete: (a: Analysis) => void;
}

const AssessmentView: React.FC<AssessmentViewProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customPotentialAreas, setCustomPotentialAreas] = useState<string[]>(['']);
  const [form, setForm] = useState<Partial<Assessment>>({
    userId: user.uid,
    status: 'in_progress',
    // MODUL 0 (NEW)
    q0_1_solo: undefined,
    q0_2_experience: undefined,
    q0_3_tools: [],
    q0_4_restrictions: undefined,
    // MODUL 1-6
    companyWebsite: user.companyWebsite || '',
    industry: '',
    industryOther: '',
    employeeCount: '1-10',
    activeAiUsers: 0,
    existingEfforts: '',
    aiMaturityLevel: 1,
    digitizationLevel: 'Teilweise digital',
    documentationLevel: 'Grundlegend',
    techEcosystems: [TechEcosystem.MICROSOFT],
    dataTypes: [],
    complianceLevel: ComplianceLevel.MEDIUM,
    topSoftware: '',
    teamMood: 'Neutral',
    skillLLM: 3,
    skillAutomation: 2,
    skillTechnical: 2,
    goals: ['efficiency'],
    focusAreas: [],
    otherFocusArea: '',
    biggestHurdle: '',
    weeklyTimeInvest: '2-4h',
    q6_2_hasBudget: true,
    monthlyBudget: 200,
    implementationStyle: ImplementationStyle.SUPPORT,
    freelancerBudget: 0,
    // MODUL 7
    q7_1_usecase: ''
  });

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  const handleAddPotentialArea = (index: number, value: string) => {
    const newAreas = [...customPotentialAreas];
    newAreas[index] = value;
    setCustomPotentialAreas(newAreas);
    setForm({ ...form, otherFocusArea: newAreas.join(', ') });
  };

  const handlePotentialAreaKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newAreas = [...customPotentialAreas];
      newAreas.splice(index + 1, 0, '');
      setCustomPotentialAreas(newAreas);
      setTimeout(() => {
        const inputs = document.querySelectorAll('.potential-area-input');
        (inputs[index + 1] as HTMLInputElement)?.focus();
      }, 0);
    } else if (e.key === 'Backspace' && customPotentialAreas[index] === '' && customPotentialAreas.length > 1) {
      e.preventDefault();
      const newAreas = [...customPotentialAreas];
      newAreas.splice(index, 1);
      setCustomPotentialAreas(newAreas);
      setTimeout(() => {
        const inputs = document.querySelectorAll('.potential-area-input');
        (inputs[Math.max(0, index - 1)] as HTMLInputElement)?.focus();
      }, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalAssessment = { 
      ...form, 
      id: 'ass-' + Date.now(), 
      createdAt: Date.now(), 
      status: 'completed',
      otherFocusArea: customPotentialAreas.filter(a => a.trim() !== '').join(', ')
    } as Assessment;
    
    const pillarScores = calculatePillarScores(finalAssessment);
    const overallScore = calculateOverallScore(pillarScores);
    const analysis: Analysis = {
      id: 'ana-' + Date.now(),
      assessmentId: finalAssessment.id,
      userId: user.uid,
      createdAt: Date.now(),
      overallScore,
      pillarScores,
      maturityLevel: getMaturityLevel(overallScore),
      topActionAreas: Object.entries(pillarScores)
        .sort(([,a],[,b]) => a - b)
        .slice(0, 3)
        .map(([key]) => key),
      recommendedTool: finalAssessment.techEcosystems.includes(TechEcosystem.MICROSOFT) ? 'copilot' : 
                      finalAssessment.techEcosystems.includes(TechEcosystem.GOOGLE) ? 'gemini' : 'chatgpt'
    };
    
    await dbService.saveAssessment(finalAssessment);
    await dbService.saveAnalysis(analysis);
    onComplete(analysis);
    setIsSubmitting(false);
  };

  const currentMaturity = MATURITY_LEVELS.find(m => m.level === form.aiMaturityLevel) || MATURITY_LEVELS[0];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32 animate-in fade-in duration-1000">
      <div className="mb-12 no-print">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Modul {step + 1} von 8</span>
            <h2 className="text-4xl font-black mt-2 text-gray-900">Mentoring Assessment</h2>
          </div>
          <div className="text-right">
             <span className="text-2xl font-black text-gray-900">{Math.round((step/8)*100)}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner border-2 border-gray-100">
          <div className="h-full transition-all duration-1000 ease-in-out" style={{ background: `linear-gradient(90deg, ${COLORS.PRIMARY}, ${COLORS.PRIMARY_LIGHT})`, width: `${(step/8)*100}%` }}></div>
        </div>
      </div>

      <Card className="p-12 min-h-[550px] flex flex-col relative overflow-hidden border-2 border-gray-200 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-burgundy-50/20 rounded-bl-full pointer-events-none no-print"></div>
        
        <div className="flex-1 z-10">
          {step === 0 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Modul 0: Über Dich
              </h3>

              <InfoBox title="💡 Warum diese Fragen?" variant="gold">
                Diese 4 Fragen helfen uns, den Fragebogen auf deine Situation anzupassen und dir später die passenden Use-Cases zu empfehlen.
              </InfoBox>

              {/* Q0.1: Solo vs Team */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">
                  Q0.1: Arbeitest du alleine oder im Team?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'solo', label: 'Solo-Selbstständig', desc: 'Ich arbeite alleine und bin für alle Entscheidungen selbst verantwortlich' },
                    { id: 'team', label: 'Im Team/Unternehmen', desc: 'Ich arbeite mit Kollegen zusammen oder in einer Organisation' }
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => setForm({...form, q0_1_solo: opt.id as any})}
                      className={`p-6 border-2 rounded-[24px] text-left transition-all ${form.q0_1_solo === opt.id ? 'border-primary bg-burgundy-50 shadow-xl' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                      style={form.q0_1_solo === opt.id ? { borderColor: COLORS.PRIMARY, backgroundColor: 'rgba(100, 22, 45, 0.05)' } : {}}
                    >
                      <span className={`block font-black text-sm mb-1 ${form.q0_1_solo === opt.id ? 'text-primary' : 'text-gray-900'}`} style={form.q0_1_solo === opt.id ? { color: COLORS.PRIMARY } : {}}>
                        {opt.label}
                      </span>
                      <span className="text-xs text-gray-800 font-bold">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Q0.2: Experience Level */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">
                  Q0.2: Wie würdest du deine persönlichen KI-Kenntnisse beschreiben?
                </label>
                <p className="text-xs text-gray-600 italic font-bold">
                  Wichtig: Es geht um DEINE Erfahrung, nicht die deines Teams/Unternehmens
                </p>
                <div className="space-y-3">
                  {[
                    { val: 0, label: 'Ich habe noch nie mit KI-Tools gearbeitet' },
                    { val: 1, label: 'Ich habe Videos gesehen oder Artikel gelesen, aber noch nicht selbst genutzt' },
                    { val: 2, label: 'Ich habe ChatGPT/Claude ein paar Mal ausprobiert' },
                    { val: 3, label: 'Ich experimentiere regelmäßig mit verschiedenen KI-Tools' },
                    { val: 4, label: 'Ich habe bereits eigene Workflows, Automationen oder Apps gebaut' }
                  ].map(opt => (
                    <button key={opt.val}
                      onClick={() => setForm({...form, q0_2_experience: opt.val})}
                      className={`w-full p-4 border-2 rounded-2xl text-left text-sm font-bold transition-all ${form.q0_2_experience === opt.val ? 'border-primary bg-burgundy-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                      style={form.q0_2_experience === opt.val ? { borderColor: COLORS.PRIMARY, backgroundColor: 'rgba(100, 22, 45, 0.05)', color: COLORS.PRIMARY } : { color: '#374151' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q0.3: Tools Used */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">
                  Q0.3: Welche KI-Tools hast du bereits genutzt? (Mehrfachauswahl)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'ChatGPT', 'Claude', 'Gemini (Google)', 'Microsoft Copilot',
                    'Midjourney / DALL-E (Bild-KI)', 'Andere Tools', 'Noch keine Tools genutzt'
                  ].map(tool => (
                    <button key={tool}
                      onClick={() => {
                        const current = form.q0_3_tools || [];
                        setForm({
                          ...form,
                          q0_3_tools: current.includes(tool)
                            ? current.filter(t => t !== tool)
                            : [...current, tool]
                        });
                      }}
                      className={`p-4 border-2 rounded-2xl text-xs font-black transition-all ${(form.q0_3_tools || []).includes(tool) ? 'border-primary bg-burgundy-100' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                      style={(form.q0_3_tools || []).includes(tool) ? { borderColor: COLORS.PRIMARY, backgroundColor: 'rgba(100, 22, 45, 0.1)', color: COLORS.PRIMARY } : { color: '#374151' }}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q0.4: Restrictions (with Tooltip) */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1 flex items-center gap-2">
                  Q0.4: Hast du Einschränkungen bei der Tool-Nutzung?
                  <Tooltip content={TOOLTIPS.Q0_4_RESTRICTIONS} />
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'none', label: 'Keine Einschränkungen - ich kann alle Tools nutzen' },
                    { id: 'microsoft', label: 'Nur Microsoft Copilot erlaubt (Firmenvorgabe)' },
                    { id: 'google', label: 'Nur Google Gemini erlaubt (Firmenvorgabe)' },
                    { id: 'free', label: 'Nur kostenlose Tools (kein Budget für kostenpflichtige)' },
                    { id: 'blocked', label: 'KI-Tools sind bei uns komplett blockiert/verboten' }
                  ].map(opt => (
                    <button key={opt.id}
                      onClick={() => setForm({...form, q0_4_restrictions: opt.id as any})}
                      className={`w-full p-4 border-2 rounded-2xl text-left text-sm font-bold transition-all ${form.q0_4_restrictions === opt.id ? 'border-primary bg-burgundy-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                      style={form.q0_4_restrictions === opt.id ? { borderColor: COLORS.PRIMARY, backgroundColor: 'rgba(100, 22, 45, 0.05)', color: COLORS.PRIMARY } : { color: '#374151' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Modul 1: Profil & Branche</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                   <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Unternehmens-Website</label>
                   <input type="url" className="w-full p-5 bg-white border-2 border-gray-300 rounded-[20px] focus:border-burgundy-600 focus:ring-4 focus:ring-burgundy-50 outline-none transition-all font-black text-gray-900" 
                     placeholder="https://www.firma.de" value={form.companyWebsite} onChange={e => setForm({...form, companyWebsite: e.target.value})} />
                 </div>
                 <div className="space-y-3">
                   <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Mitarbeiter-Anzahl</label>
                   <select className="w-full p-5 bg-white border-2 border-gray-300 rounded-[20px] focus:border-burgundy-600 focus:ring-4 focus:ring-burgundy-50 outline-none appearance-none cursor-pointer font-black text-gray-900"
                    value={form.employeeCount} onChange={e => setForm({...form, employeeCount: e.target.value})}>
                     <option value="1-10">1 - 10 Mitarbeiter</option>
                     <option value="11-50">11 - 50 Mitarbeiter</option>
                     <option value="51-250">51 - 250 Mitarbeiter</option>
                     <option value="251-1000">251 - 1000 Mitarbeiter</option>
                     <option value="1000+">Über 1000 Mitarbeiter</option>
                   </select>
                 </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Branche</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {INDUSTRIES.map(ind => (
                    <button key={ind.id} onClick={() => setForm({...form, industry: ind.id})}
                      className={`p-6 border-2 rounded-[24px] flex flex-col items-center gap-3 transition-all ${form.industry === ind.id ? 'border-primary bg-burgundy-50 shadow-xl' : 'border-gray-200 bg-white hover:border-gray-400'}`}>
                      <span className="text-4xl">{ind.icon}</span>
                      <span className={`text-[11px] font-black uppercase text-center ${form.industry === ind.id ? 'text-primary' : 'text-gray-600'}`}>{ind.label}</span>
                    </button>
                  ))}
                </div>
                {form.industry === 'other' && (
                  <div className="animate-in slide-in-from-top-4 duration-300 mt-4">
                    <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Spezifizierung Branche</label>
                    <input type="text" className="w-full p-4 bg-white border-2 border-gray-300 rounded-[20px] focus:border-burgundy-600 outline-none font-black text-gray-900 mt-2" 
                      placeholder="Welche Branche genau?..." value={form.industryOther} onChange={e => setForm({...form, industryOther: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Wie viele Personen nutzen bereits aktiv KI?</label>
                   <span className="text-xl font-black text-primary">{form.activeAiUsers}</span>
                 </div>
                 <input type="range" min="0" max="500" step="1" className="w-full" value={form.activeAiUsers} onChange={e => setForm({...form, activeAiUsers: parseInt(e.target.value)})} />
                 <p className="text-[11px] text-gray-500 font-bold italic">Diese Zahl hilft uns, den Schulungsbedarf im Onboarding einzuschätzen.</p>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                   <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Bisherige KI-Maßnahmen / Erfahrungen</label>
                   <VoiceButton onTranscription={(text) => setForm({...form, existingEfforts: (form.existingEfforts || '') + ' ' + text})} />
                 </div>
                 <textarea className="w-full p-5 bg-white border-2 border-gray-300 rounded-[20px] h-24 text-sm font-black text-gray-900 outline-none focus:border-burgundy-600 focus:ring-4 focus:ring-burgundy-50" 
                  placeholder="Haben Sie bereits Tools eingeführt oder Schulungen gemacht?..."
                  value={form.existingEfforts} onChange={e => setForm({...form, existingEfforts: e.target.value})}
                 />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Modul 2: Strategischer Status Quo</h3>
              <div className="space-y-8">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1 flex items-center gap-2">
                  Q2.1: Aktueller KI-Reifegrad
                  <Tooltip content={TOOLTIPS.Q2_1_MATURITY} />
                </label>
                <div className="grid grid-cols-5 gap-3">
                   {MATURITY_LEVELS.map((m) => (
                     <button 
                       key={m.level}
                       onClick={() => setForm({...form, aiMaturityLevel: m.level})}
                       className={`p-4 rounded-[20px] border-2 flex flex-col items-center gap-2 transition-all ${form.aiMaturityLevel === m.level ? 'border-primary bg-burgundy-100 text-primary shadow-lg scale-105' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-400'}`}
                     >
                       <span className="text-xl font-black">{m.level}</span>
                       <span className="text-[9px] font-black uppercase text-center">{m.short}</span>
                     </button>
                   ))}
                </div>
                <div className="bg-gray-100 p-8 rounded-[32px] border-2 border-gray-200 shadow-inner">
                   <h4 className="text-lg font-black text-primary uppercase mb-3">
                    {currentMaturity.label}
                   </h4>
                   <p className="text-sm text-gray-900 font-bold leading-relaxed">
                    {currentMaturity.desc}
                   </p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Q6: Digitalisierungsgrad</label>
                <div className="grid grid-cols-2 gap-4">
                  {['Analog', 'Teilweise digital', 'Fortgeschritten', 'Vollständig digital'].map(v => (
                    <button key={v} onClick={() => setForm({...form, digitizationLevel: v})} 
                      className={`p-5 border-2 rounded-[20px] text-sm font-black transition-all ${form.digitizationLevel === v ? 'border-primary bg-burgundy-50 text-primary shadow-lg' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'}`}
                    >{v}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1 flex items-center gap-2">
                  Q2.3: Dokumentationsgrad
                  <Tooltip content={TOOLTIPS.Q2_3_DOCUMENTATION} />
                </label>
                <select className="w-full p-5 bg-white border-2 border-gray-300 rounded-[20px] focus:border-burgundy-600 focus:ring-4 focus:ring-burgundy-50 outline-none font-black text-gray-900 appearance-none" value={form.documentationLevel} onChange={e => setForm({...form, documentationLevel: e.target.value})}>
                  {['Keine Dokumentation (Alles im Kopf)', 'Grundlegende Notizen', 'Moderater Grad (Teilweise SOPs)', 'Vollständige SOP-Struktur'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Modul 3: Technik & Sicherheit</h3>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Q8: Technisches Ökosystem</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { id: TechEcosystem.MICROSOFT, label: 'Microsoft 365', icon: 'Ⓜ️' },
                    { id: TechEcosystem.GOOGLE, label: 'Google Workspace', icon: '🌐' },
                    { id: TechEcosystem.APPLE, label: 'Apple / iCloud', icon: '🍎' },
                    { id: TechEcosystem.MIXED, label: 'Gemischt / Best-of-Breed', icon: '⚡' }
                  ].map(v => (
                    <button key={v.id} 
                      onClick={() => {
                        const ecosystems = form.techEcosystems || [];
                        setForm({...form, techEcosystems: ecosystems.includes(v.id) ? ecosystems.filter(e => e !== v.id) : [...ecosystems, v.id]});
                      }} 
                      className={`p-6 border-2 rounded-[24px] flex items-center gap-5 transition-all group ${form.techEcosystems?.includes(v.id) ? 'border-primary bg-burgundy-50 shadow-xl' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110 ${form.techEcosystems?.includes(v.id) ? 'bg-white' : 'bg-gray-100'}`}>{v.icon}</div>
                      <span className={`font-black text-sm tracking-tight ${form.techEcosystems?.includes(v.id) ? 'text-primary' : 'text-gray-900'}`}>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center">
                   <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Top 5 Software im Unternehmen</label>
                   <VoiceButton onTranscription={(text) => setForm({...form, topSoftware: (form.topSoftware || '') + ' ' + text})} />
                 </div>
                 <textarea className="w-full p-5 bg-white border-2 border-gray-300 rounded-[20px] h-24 text-sm font-black text-gray-900 outline-none focus:border-burgundy-600 focus:ring-4 focus:ring-burgundy-50 shadow-inner" 
                  placeholder="Welche Software nutzen Sie am meisten? (z.B. CRM, ERP, Slack, Zoom, etc.)..."
                  value={form.topSoftware} onChange={e => setForm({...form, topSoftware: e.target.value})}
                 />
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1 flex items-center gap-2">
                  Q3.3: Verarbeitete Daten
                  <Tooltip content={TOOLTIPS.Q3_3_DATA} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                   {[
                     'Marketing & Website-Daten',
                     'Interne Geschäftsgeheimnisse',
                     'Personenbezogene Kundendaten',
                     'Regulierte Daten (Finanz/Gesundheit)'
                   ].map(type => (
                     <button key={type} 
                       onClick={() => {
                        const current = form.dataTypes || [];
                        setForm({...form, dataTypes: current.includes(type) ? current.filter(t => t !== type) : [...current, type]});
                       }}
                       className={`p-4 border-2 rounded-2xl text-[11px] font-black text-center transition-all ${form.dataTypes?.includes(type) ? 'border-primary bg-burgundy-100 text-primary' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}
                     >
                       {type}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Modul 4: Kompetenz & Kultur</h3>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Q4.1: Team-Stimmung gegenüber KI</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { mood: 'solo', label: 'Ich arbeite solo', emoji: '👤' },
                    { mood: 'Ablehnung', label: 'Ablehnung', emoji: '😤' },
                    { mood: 'Neutral', label: 'Neutral', emoji: '😐' },
                    { mood: 'Neugierig', label: 'Neugierig', emoji: '🤔' },
                    { mood: 'Euphorie', label: 'Euphorie', emoji: '🤩' }
                  ].map(m => (
                    <button key={m.mood} onClick={() => setForm({...form, teamMood: m.mood})}
                      className={`p-5 border-2 rounded-[20px] flex flex-col items-center gap-2 transition-all ${form.teamMood === m.mood ? 'border-primary bg-burgundy-100 text-primary shadow-lg' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-[11px] font-black">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-10 pt-4">
                {[
                  { id: 'skillLLM', label: 'Q4.2: Kompetenz - Prompting', val: form.skillLLM, help: 'Fähigkeit, KI-Anfragen präzise zu formulieren.', tooltip: TOOLTIPS.Q4_2_PROMPTING },
                  { id: 'skillAutomation', label: 'Q4.3: Kompetenz - Automatisierung', val: form.skillAutomation, help: 'Erfahrung mit Tools wie Make, n8n, Zapier oder PowerAutomate.', tooltip: TOOLTIPS.Q4_3_AUTOMATION },
                  { id: 'skillTechnical', label: 'Q4.4: Kompetenz - Technik / APIs', val: form.skillTechnical, help: 'Technisches Verständnis von Schnittstellen und IT-Architektur.', tooltip: TOOLTIPS.Q4_4_API }
                ].map(s => (
                  <div key={s.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="text-[11px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                          {s.label}
                          <Tooltip content={s.tooltip} />
                        </label>
                        <p className="text-[11px] text-gray-800 font-bold italic">{s.help}</p>
                      </div>
                      <span className="text-xl font-black text-primary">{s.val}/10</span>
                    </div>
                    <input type="range" min="1" max="10" className="w-full" value={s.val} onChange={e => setForm({...form, [s.id]: parseInt(e.target.value)})} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Modul 5: Ziele & Fokus</h3>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Q12: Primärer Fokus</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'efficiency', label: 'EFFIZIENZ', icon: '⚙️', desc: 'Prozesse beschleunigen & Kosten senken' },
                    { id: 'innovation', label: 'INNOVATION', icon: '💡', desc: 'Neue Produkte & Geschäftsmodelle' }
                  ].map(g => (
                    <button key={g.id} 
                      onClick={() => {
                        const goals = form.goals || [];
                        setForm({...form, goals: goals.includes(g.id as any) ? goals.filter(go => go !== g.id) : [...goals, g.id as any]});
                      }}
                      className={`p-8 rounded-[32px] border-2 flex flex-col items-start gap-4 transition-all ${form.goals?.includes(g.id as any) ? 'border-primary bg-burgundy-50 shadow-xl' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl">{g.icon}</div>
                      <div className="text-left">
                        <span className="block font-black text-lg mb-1 text-gray-900">{g.label}</span>
                        <span className="text-xs text-gray-800 font-bold">{g.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Q13: Top 3 Potenzial-Bereiche</label>
                  <VoiceButton onTranscription={(text) => {
                    const newAreas = [...customPotentialAreas];
                    if (newAreas[newAreas.length - 1] === '') {
                       newAreas[newAreas.length - 1] = text;
                    } else {
                       newAreas.push(text);
                    }
                    setCustomPotentialAreas(newAreas);
                  }} />
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {FOCUS_AREAS_OPTIONS.map(area => (
                    <button key={area.id}
                      onClick={() => {
                        const areas = form.focusAreas || [];
                        setForm({...form, focusAreas: areas.includes(area.label) ? areas.filter(a => a !== area.label) : [...areas, area.label]});
                      }}
                      className={`px-5 py-3 border-2 rounded-full text-[11px] font-black transition-all flex items-center gap-2 ${form.focusAreas?.includes(area.label) ? 'border-primary bg-burgundy-100 text-primary' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'}`}
                    >
                      <span>{area.icon}</span>
                      <span>{area.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Zusätzliche Bereiche (Enter für weiteren Punkt):</p>
                  {customPotentialAreas.map((area, idx) => (
                    <input 
                      key={idx}
                      type="text" 
                      className="potential-area-input w-full p-4 bg-white border-2 border-gray-300 rounded-[20px] text-xs font-black text-gray-900 focus:border-burgundy-600 outline-none transition-all" 
                      placeholder="Eigener Bereich..." 
                      value={area} 
                      onChange={e => handleAddPotentialArea(idx, e.target.value)}
                      onKeyDown={e => handlePotentialAreaKeyDown(e, idx)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Q14: Die größte Hürde</label>
                  <VoiceButton onTranscription={(text) => setForm({...form, biggestHurdle: (form.biggestHurdle || '') + ' ' + text})} />
                </div>
                <textarea 
                  className="w-full p-6 bg-white border-2 border-gray-300 rounded-[24px] h-32 text-sm outline-none focus:border-burgundy-600 font-bold text-gray-900 shadow-inner" 
                  placeholder="Was hält Sie aktuell am meisten auf?..."
                  value={form.biggestHurdle}
                  onChange={e => setForm({...form, biggestHurdle: e.target.value})}
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Modul 6: Ressourcen & Umsetzung</h3>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Q15: Zeit-Investment pro Woche</label>
                <div className="grid grid-cols-4 gap-3">
                  {['<2h', '2-4h', '4-8h', '>8h'].map(v => (
                    <button key={v} onClick={() => setForm({...form, weeklyTimeInvest: v})} className={`p-4 border-2 rounded-2xl text-sm font-black transition-all ${form.weeklyTimeInvest === v ? 'border-primary bg-burgundy-100 text-primary shadow-lg' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">
                  Q6.2: Persönliches Tool-Budget (falls du selbst Tools buchen darfst)
                </label>
                <p className="text-xs text-gray-600 italic font-bold">
                  💡 Für den Start reichen 50-100€/Monat (ChatGPT Plus, Claude Pro)
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setForm({...form, q6_2_hasBudget: false, monthlyBudget: 0})}
                    className={`w-full p-4 border-2 rounded-2xl text-left text-sm font-bold transition-all ${!form.q6_2_hasBudget ? 'border-primary bg-burgundy-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                    style={!form.q6_2_hasBudget ? { borderColor: COLORS.PRIMARY, backgroundColor: 'rgba(100, 22, 45, 0.05)', color: COLORS.PRIMARY } : { color: '#374151' }}
                  >
                    0€ (Meine Firma zahlt / Ich nutze nur kostenlose Tools)
                  </button>
                  <button
                    onClick={() => setForm({...form, q6_2_hasBudget: true})}
                    className={`w-full p-4 border-2 rounded-2xl text-left text-sm font-bold transition-all ${form.q6_2_hasBudget ? 'border-primary bg-burgundy-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                    style={form.q6_2_hasBudget ? { borderColor: COLORS.PRIMARY, backgroundColor: 'rgba(100, 22, 45, 0.05)', color: COLORS.PRIMARY } : { color: '#374151' }}
                  >
                    Ich habe ein Budget:
                  </button>
                </div>

                {form.q6_2_hasBudget && (
                  <div className="space-y-4 pt-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-gray-800">Budget:</span>
                      <span className="text-lg font-black" style={{ color: COLORS.PRIMARY }}>{form.monthlyBudget} € / Monat</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="500"
                      step="20"
                      className="w-full"
                      value={form.monthlyBudget || 100}
                      onChange={e => setForm({...form, monthlyBudget: parseInt(e.target.value)})}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Q17: Umsetzungs-Stil</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: ImplementationStyle.DIY, label: 'DIY (Selbst)', desc: 'Ich möchte die Dinge selber technisch umsetzen.' },
                    { id: ImplementationStyle.SUPPORT, label: 'Unterstützung', desc: 'Ich habe jemanden im Team oder extern, der mir dabei hilft.' },
                    { id: ImplementationStyle.FULL_SERVICE, label: 'Freelancer / Service', desc: 'Ich bräuchte bei komplexeren technischen Anwendungen Hilfe; Freelancer aus dem Netzwerk sind interessant.' }
                  ].map(v => (
                    <button key={v.id} onClick={() => setForm({...form, implementationStyle: v.id})} 
                      className={`p-6 border-2 rounded-[24px] text-left transition-all flex flex-col gap-2 ${form.implementationStyle === v.id ? 'border-primary bg-burgundy-50 shadow-xl' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                    >
                      <span className={`font-black text-sm uppercase ${form.implementationStyle === v.id ? 'text-primary' : 'text-gray-900'}`}>{v.label}</span>
                      <span className="text-[10px] text-gray-900 font-bold leading-relaxed">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              {form.implementationStyle === ImplementationStyle.FULL_SERVICE && (
                <div className="space-y-4 pt-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between">
                    <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">Projekt-Budget für Freelancer / Service</label>
                    <span className="text-sm font-black text-primary">{form.freelancerBudget?.toLocaleString('de-DE')} €</span>
                  </div>
                  <input type="range" min="0" max="50000" step="1000" className="w-full" value={form.freelancerBudget || 0} onChange={e => setForm({...form, freelancerBudget: parseInt(e.target.value)})} />
                  <p className="text-[11px] text-gray-500 font-bold italic text-right">Schätzung in 1.000 € Schritten</p>
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Modul 7: Dein konkreter Use-Case
              </h3>

              <InfoBox title="💡 Warum diese Frage?" variant="gold">
                Wenn du bereits eine konkrete Idee hast, kann unsere KI im Dashboard den passendsten Use-Case aus dem Tech-Stack für dich identifizieren - selbst wenn er nicht zu den Standard-Kategorien passt.
              </InfoBox>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black text-gray-800 uppercase tracking-widest ml-1">
                    Q7.1: Gibt es einen konkreten Use-Case, den du umsetzen möchtest?
                  </label>
                  <VoiceButton onTranscription={(text) => setForm({...form, q7_1_usecase: (form.q7_1_usecase || '') + ' ' + text})} />
                </div>
                <p className="text-xs text-gray-600 italic font-bold">
                  Optional - beschreibe kurz dein konkretes Vorhaben
                </p>
                <textarea
                  className="w-full p-6 bg-white border-2 border-gray-300 rounded-[24px] h-32 text-sm outline-none focus:border-burgundy-600 font-bold text-gray-900 shadow-inner"
                  placeholder="Beschreibe deinen Use-Case in 1-2 Sätzen..."
                  value={form.q7_1_usecase || ''}
                  onChange={e => setForm({...form, q7_1_usecase: e.target.value})}
                />

                <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(100, 22, 45, 0.05)', borderLeft: '4px solid #64162D', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 600, margin: 0 }}>
                    <strong>Tipp:</strong> Je konkreter du beschreibst, desto besser kann die KI einen passenden Use-Case empfehlen. Wenn du noch keine Idee hast, lass das Feld einfach leer - wir empfehlen dir basierend auf deinen gewählten Bereichen aus Q5.2 passende Use-Cases.
                  </p>
                </div>

                <InfoBox title="💡 Beispiele für konkrete Use-Cases:" variant="green">
                  {USECASE_EXAMPLES.map((ex, i) => (
                    <div key={i} style={{ marginBottom: '8px', paddingLeft: '20px', position: 'relative', fontSize: '0.9rem', color: '#374151' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#065F46', fontWeight: 700 }}>→</span>
                      <strong>{ex.category}:</strong> "{ex.text}"
                    </div>
                  ))}
                </InfoBox>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-16 pt-10 border-t-2 border-gray-200 z-10 no-print">
          {step > 0 ? (
            <Button onClick={prev} variant="secondary">ZURÜCK</Button>
          ) : <div></div>}
          {step < 7 ? (
            <Button onClick={next} className="px-14">WEITER</Button>
          ) : (
            <Button onClick={handleSubmit} className="px-20 shadow-2xl shadow-burgundy-200" disabled={isSubmitting}>
              {isSubmitting ? 'ANALYSIERE...' : 'ANALYSE STARTEN'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AssessmentView;
