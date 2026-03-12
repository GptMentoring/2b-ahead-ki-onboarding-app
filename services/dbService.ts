
import { doc, getDoc, setDoc, getDocs, collection, query, where, deleteDoc, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User, Assessment, Analysis, KiPillarScores, ZukunftPillarScores, IstAnalyse, IstAnalyseProfile } from "../types";

// ─── Session ID für Tracking ──────────────────────────────────
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let sid = sessionStorage.getItem('tracking_session');
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('tracking_session', sid);
  }
  return sid;
}

export const dbService = {
  // ─── Analytics Tracking (silent fail — nie den User blocken) ──
  async trackEvent(userId: string, event: string, data?: Record<string, unknown>): Promise<void> {
    try {
      const eventsRef = collection(db, 'analytics_events');
      await addDoc(eventsRef, {
        userId,
        event,
        data: data || {},
        timestamp: new Date(),
        sessionId: getSessionId(),
      });
    } catch (e) {
      console.warn('Tracking failed:', e);
    }
  },

  async getUser(email: string): Promise<User | null> {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as User;
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw new Error("Fehler beim Laden des Benutzers. Bitte versuchen Sie es erneut.");
    }
  },

  async saveUser(user: User): Promise<void> {
    try {
      await setDoc(doc(db, "users", user.uid), user);
    } catch (error) {
      console.error("Error saving user:", error);
      throw new Error("Fehler beim Speichern des Benutzers. Bitte versuchen Sie es erneut.");
    }
  },

  async getAssessment(userId: string): Promise<Assessment | null> {
    try {
      const docRef = doc(db, "assessments", userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as Assessment : null;
    } catch (error) {
      console.error("Error getting assessment:", error);
      throw new Error("Fehler beim Laden des Assessments. Bitte versuchen Sie es erneut.");
    }
  },

  async saveAssessment(assessment: Assessment): Promise<void> {
    try {
      await setDoc(doc(db, "assessments", assessment.userId), assessment);
      // Track assessment progress
      if (assessment.status === 'in_progress') {
        this.trackEvent(assessment.userId, 'assessment_started');
      }
      if (assessment.status === 'completed') {
        this.trackEvent(assessment.userId, 'assessment_step_completed', { step: 'final' });
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      throw new Error("Fehler beim Speichern des Assessments. Bitte versuchen Sie es erneut.");
    }
  },

  async getAnalysis(userId: string): Promise<Analysis | null> {
    try {
      const docRef = doc(db, "analyses", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // Track dashboard view (analysis exists = user sees dashboard)
        this.trackEvent(userId, 'dashboard_viewed');
        return docSnap.data() as Analysis;
      }
      return null;
    } catch (error) {
      console.error("Error getting analysis:", error);
      throw new Error("Fehler beim Laden der Analyse. Bitte versuchen Sie es erneut.");
    }
  },

  async saveAnalysis(analysis: Analysis): Promise<void> {
    try {
      await setDoc(doc(db, "analyses", analysis.userId), analysis);
      // Track assessment completed (analysis saved = assessment fully done)
      this.trackEvent(analysis.userId, 'assessment_completed');
    } catch (error) {
      console.error("Error saving analysis:", error);
      throw new Error("Fehler beim Speichern der Analyse. Bitte versuchen Sie es erneut.");
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error("Error getting all users:", error);
      throw new Error("Fehler beim Laden der Benutzerliste. Bitte versuchen Sie es erneut.");
    }
  },

  async getAllAnalyses(): Promise<Analysis[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "analyses"));
      return querySnapshot.docs.map(doc => doc.data() as Analysis);
    } catch (error) {
      console.error("Error getting all analyses:", error);
      throw new Error("Fehler beim Laden der Analysen. Bitte versuchen Sie es erneut.");
    }
  },

  // ─── Ist-Analyse CRUD ──────────────────────────────────────────

  async getIstAnalyse(userId: string): Promise<IstAnalyse | null> {
    try {
      const docRef = doc(db, "istanalysen", userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as IstAnalyse : null;
    } catch (error) {
      console.error("Error getting ist-analyse:", error);
      throw new Error("Fehler beim Laden der KI Ist-Analyse. Bitte versuchen Sie es erneut.");
    }
  },

  async saveIstAnalyse(istAnalyse: IstAnalyse): Promise<void> {
    try {
      await setDoc(doc(db, "istanalysen", istAnalyse.userId), istAnalyse);
      // Track Ist-Analyse completion
      this.trackEvent(istAnalyse.userId, 'istanalyse_completed');
    } catch (error) {
      console.error("Error saving ist-analyse:", error);
      throw new Error("Fehler beim Speichern der KI Ist-Analyse. Bitte versuchen Sie es erneut.");
    }
  },

  async getIstAnalyseProfile(userId: string): Promise<IstAnalyseProfile | null> {
    try {
      const docRef = doc(db, "istanalyse_profiles", userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as IstAnalyseProfile : null;
    } catch (error) {
      console.error("Error getting ist-analyse profile:", error);
      throw new Error("Fehler beim Laden des Profils. Bitte versuchen Sie es erneut.");
    }
  },

  async saveIstAnalyseProfile(profile: IstAnalyseProfile): Promise<void> {
    try {
      await setDoc(doc(db, "istanalyse_profiles", profile.userId), profile);
      // Track profile generation
      this.trackEvent(profile.userId, 'istanalyse_profile_generated', { quadrant: profile.quadrant });
    } catch (error) {
      console.error("Error saving ist-analyse profile:", error);
      throw new Error("Fehler beim Speichern des Profils. Bitte versuchen Sie es erneut.");
    }
  },

  // ─── Daten löschen ────────────────────────────────────────────

  async deleteUserFullData(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "users", uid));
      await deleteDoc(doc(db, "assessments", uid));
      await deleteDoc(doc(db, "analyses", uid));
      await deleteDoc(doc(db, "istanalysen", uid));
      await deleteDoc(doc(db, "istanalyse_profiles", uid));
    } catch (error) {
      console.error("Error deleting user data:", error);
      throw new Error("Fehler beim Löschen der Benutzerdaten. Bitte versuchen Sie es erneut.");
    }
  },

  async getAverageScores(): Promise<{ ki: KiPillarScores; zukunft: ZukunftPillarScores } | null> {
    try {
      const allAnalyses = await this.getAllAnalyses();
      if (allAnalyses.length === 0) return null;

      const kiSums: KiPillarScores = { kompetenz: 0, tools: 0, steuerung: 0, zukunft: 0 };
      const zukunftSums: ZukunftPillarScores = { zukunftsbild: 0, zukunftsstrategie: 0, zukunftskompetenzen: 0, umsetzung: 0 };

      allAnalyses.forEach(ana => {
        if (ana.kiPillarScores) {
          kiSums.kompetenz += ana.kiPillarScores.kompetenz || 0;
          kiSums.tools += ana.kiPillarScores.tools || 0;
          kiSums.steuerung += ana.kiPillarScores.steuerung || 0;
          kiSums.zukunft += ana.kiPillarScores.zukunft || 0;
        }
        if (ana.zukunftPillarScores) {
          zukunftSums.zukunftsbild += ana.zukunftPillarScores.zukunftsbild || 0;
          zukunftSums.zukunftsstrategie += ana.zukunftPillarScores.zukunftsstrategie || 0;
          zukunftSums.zukunftskompetenzen += ana.zukunftPillarScores.zukunftskompetenzen || 0;
          zukunftSums.umsetzung += ana.zukunftPillarScores.umsetzung || 0;
        }
      });

      const count = allAnalyses.length;
      return {
        ki: {
          kompetenz: kiSums.kompetenz / count,
          tools: kiSums.tools / count,
          steuerung: kiSums.steuerung / count,
          zukunft: kiSums.zukunft / count,
        },
        zukunft: {
          zukunftsbild: zukunftSums.zukunftsbild / count,
          zukunftsstrategie: zukunftSums.zukunftsstrategie / count,
          zukunftskompetenzen: zukunftSums.zukunftskompetenzen / count,
          umsetzung: zukunftSums.umsetzung / count,
        }
      };
    } catch (error) {
      console.error("Error calculating averages:", error);
      return null;
    }
  }
};
