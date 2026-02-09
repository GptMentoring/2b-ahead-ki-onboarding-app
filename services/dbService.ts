
import { doc, getDoc, setDoc, getDocs, collection, query, where, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User, Assessment, Analysis, PillarScores } from "../types";

export const dbService = {
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
    } catch (error) {
      console.error("Error saving assessment:", error);
      throw new Error("Fehler beim Speichern des Assessments. Bitte versuchen Sie es erneut.");
    }
  },

  async getAnalysis(userId: string): Promise<Analysis | null> {
    try {
      const docRef = doc(db, "analyses", userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as Analysis : null;
    } catch (error) {
      console.error("Error getting analysis:", error);
      throw new Error("Fehler beim Laden der Analyse. Bitte versuchen Sie es erneut.");
    }
  },

  async saveAnalysis(analysis: Analysis): Promise<void> {
    try {
      await setDoc(doc(db, "analyses", analysis.userId), analysis);
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

  async deleteUserFullData(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "users", uid));
      await deleteDoc(doc(db, "assessments", uid));
      await deleteDoc(doc(db, "analyses", uid));
    } catch (error) {
      console.error("Error deleting user data:", error);
      throw new Error("Fehler beim Löschen der Benutzerdaten. Bitte versuchen Sie es erneut.");
    }
  },

  async getIndustryAverages(industryId: string): Promise<PillarScores | null> {
    try {
      // 1. Get all assessments for this industry
      const q = query(collection(db, "assessments"), where("industry", "==", industryId));
      const snapshot = await getDocs(q);
      const userIds = snapshot.docs.map(doc => doc.data().userId);
      
      if (userIds.length === 0) return null;

      // 2. Get all analyses for these users
      const allAnalyses = await this.getAllAnalyses();
      const relevantAnalyses = allAnalyses.filter(a => userIds.includes(a.userId));
      
      if (relevantAnalyses.length === 0) return null;

      // 3. Average the scores
      const sums: PillarScores = { kompetenz: 0, tools: 0, steuerung: 0, produkte: 0, strategie: 0 };
      relevantAnalyses.forEach(ana => {
        sums.kompetenz += ana.pillarScores.kompetenz;
        sums.tools += ana.pillarScores.tools;
        sums.steuerung += ana.pillarScores.steuerung;
        sums.produkte += ana.pillarScores.produkte;
        sums.strategie += ana.pillarScores.strategie;
      });

      const count = relevantAnalyses.length;
      return {
        kompetenz: sums.kompetenz / count,
        tools: sums.tools / count,
        steuerung: sums.steuerung / count,
        produkte: sums.produkte / count,
        strategie: sums.strategie / count
      };
    } catch (error) {
      console.error("Error calculating benchmarks:", error);
      return null;
    }
  }
};
