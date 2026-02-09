
export enum Role {
  OWNER = 'owner',
  EXECUTIVE = 'executive',
  SPECIALIST = 'specialist',
  PM = 'pm'
}

export enum TechEcosystem {
  MICROSOFT = 'microsoft',
  GOOGLE = 'google',
  APPLE = 'apple',
  MIXED = 'mixed'
}

export enum ComplianceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum ImplementationStyle {
  DIY = 'diy',
  SUPPORT = 'support',
  FULL_SERVICE = 'full_service'
}

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  companyWebsite?: string;
  role: Role;
  createdAt: number;
  lastLogin: number;
  assessmentCompleted: boolean;
  quickWinCompleted: boolean;
  isAdmin: boolean;
}

export interface Assessment {
  id: string;
  userId: string;
  createdAt: number;
  status: 'in_progress' | 'completed';

  // Modul 0 (NEU - Vorbereitung)
  q0_1_solo?: 'solo' | 'team';
  q0_2_experience?: number; // 0-4 scale
  q0_3_tools?: string[]; // ['chatgpt', 'claude', 'gemini', 'copilot', 'midjourney', 'other', 'none']
  q0_4_restrictions?: 'none' | 'microsoft' | 'google' | 'free' | 'blocked';

  // Modul 1
  companyWebsite: string;
  industry: string;
  industryOther?: string;
  employeeCount: string;
  activeAiUsers: number;
  existingEfforts: string;

  // Modul 2
  aiMaturityLevel: number;
  digitizationLevel: string;
  documentationLevel: string;

  // Modul 3
  techEcosystems: TechEcosystem[];
  dataTypes: string[];
  complianceLevel: ComplianceLevel;
  topSoftware: string;

  // Modul 4
  teamMood: string;
  skillLLM: number;
  skillAutomation: number;
  skillTechnical: number;

  // Modul 5
  goals: ('efficiency' | 'innovation')[];
  focusAreas: string[];
  otherFocusArea: string;
  biggestHurdle: string;

  // Modul 6
  weeklyTimeInvest: string;
  monthlyBudget: number;
  q6_2_hasBudget?: boolean; // Conditional slider control
  implementationStyle: ImplementationStyle;
  freelancerBudget?: number; // New

  // Modul 7 (NEU - Use-Case)
  q7_1_usecase?: string;
}

export interface PillarScores {
  kompetenz: number;
  tools: number;
  steuerung: number;
  produkte: number;
  strategie: number;
}

export interface Analysis {
  id: string;
  assessmentId: string;
  userId: string;
  createdAt: number;
  overallScore: number;
  pillarScores: PillarScores;
  maturityLevel: string;
  topActionAreas: string[];
  recommendedTool: 'copilot' | 'gemini' | 'chatgpt';
}
