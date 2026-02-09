
import { User, Assessment, Analysis, Role, TechEcosystem, ComplianceLevel, ImplementationStyle, PillarScores } from '../types';

const STORAGE_KEY_USER = '2bahead_user';
const STORAGE_KEY_ASSESSMENT = '2bahead_assessment';
const STORAGE_KEY_ANALYSIS = '2bahead_analysis';

export const mockStore = {
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    return data ? JSON.parse(data) : null;
  },

  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  },

  getAssessment: (userId: string): Assessment | null => {
    const data = localStorage.getItem(`${STORAGE_KEY_ASSESSMENT}_${userId}`);
    return data ? JSON.parse(data) : null;
  },

  saveAssessment: (assessment: Assessment) => {
    localStorage.setItem(`${STORAGE_KEY_ASSESSMENT}_${assessment.userId}`, JSON.stringify(assessment));
  },

  getAnalysis: (userId: string): Analysis | null => {
    const data = localStorage.getItem(`${STORAGE_KEY_ANALYSIS}_${userId}`);
    return data ? JSON.parse(data) : null;
  },

  saveAnalysis: (analysis: Analysis) => {
    localStorage.setItem(`${STORAGE_KEY_ANALYSIS}_${analysis.userId}`, JSON.stringify(analysis));
  },

  clear: () => {
    localStorage.clear();
  }
};

export function calculatePillarScores(assessment: Assessment): PillarScores {
  // Säule 1: Kompetenz (Q10, Q11a-c)
  const moodMap: Record<string, number> = { 'Ablehnung': 1, 'Neutral': 2, 'Neugierig': 4, 'Euphorie': 5 };
  const kompetenz = (
    (moodMap[assessment.teamMood] || 2) +
    (assessment.skillLLM / 2) +
    (assessment.skillAutomation / 2) +
    (assessment.skillTechnical / 2)
  ) / 4;

  // Säule 2: Tools (Q6, Q8)
  const digiMap: Record<string, number> = { 'Analog': 1, 'Teilweise digital': 2, 'Fortgeschritten': 4, 'Vollständig digital': 5 };
  const tools = (
    (digiMap[assessment.digitizationLevel] || 2) + 
    (assessment.techEcosystems?.length > 1 ? 5 : 3)
  ) / 2;

  // Säule 3: Steuerung (Q9, Q15, Q17)
  const dataScore = Math.min((assessment.dataTypes?.length || 1) + 2, 5);
  const timeMap: Record<string, number> = { '<2h': 2, '2-4h': 3, '4-8h': 4, '>8h': 5 };
  const styleMap: Record<string, number> = { [ImplementationStyle.DIY]: 4, [ImplementationStyle.SUPPORT]: 5, [ImplementationStyle.FULL_SERVICE]: 5 };
  const steuerung = (
    dataScore +
    (timeMap[assessment.weeklyTimeInvest] || 2) +
    (styleMap[assessment.implementationStyle] || 2)
  ) / 3;

  // Säule 4: Produkte (Q12, Q13, Q16)
  const goalScore = assessment.goals?.length > 1 ? 5 : 3;
  const areasScore = Math.min((assessment.focusAreas?.length || 0) + (assessment.otherFocusArea ? 1 : 0), 5);
  const budgetScore = Math.min(assessment.monthlyBudget / 200, 5);
  const produkte = (goalScore + areasScore + budgetScore) / 3;

  // Säule 5: Strategie (Q5, Q7)
  const docMap: Record<string, number> = { 'Keine Dokumentation': 1, 'Grundlegende Notizen': 2, 'Moderater Grad': 3, 'Vollständige SOP-Struktur': 5 };
  const strategie = (
    assessment.aiMaturityLevel +
    (docMap[assessment.documentationLevel] || 2)
  ) / 2;

  return { kompetenz, tools, steuerung, produkte, strategie };
}

export function calculateOverallScore(pillarScores: PillarScores): number {
  const weights = {
    kompetenz: 0.25,
    tools: 0.20,
    steuerung: 0.20,
    produkte: 0.15,
    strategie: 0.20
  };
  return Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + (pillarScores[key as keyof PillarScores] * weight);
  }, 0);
}

export function getMaturityLevel(score: number): string {
  if (score < 2.0) return 'Anfänger';
  if (score < 3.0) return 'Bewusst';
  if (score < 4.0) return 'Systematisch';
  if (score < 4.5) return 'Fortgeschritten';
  return 'Nativ';
}
