
import { GoogleGenAI, Modality } from "@google/genai";

export const geminiService = {
  async getChatResponse(message: string, context?: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: message,
        config: {
          systemInstruction: `Du bist der KI-Help-Agent für das 2b AHEAD KI-Programm. 
          Hilf dem Nutzer bei Fragen zum Assessment, der 5-Säulen-Methodik oder dem KI-Onboarding. 
          Antworte professionell, motivierend und präzise auf Deutsch. 
          Kontext des Nutzers: ${context || 'Kein spezifischer Kontext.'}`,
          temperature: 0.7,
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Ich konnte gerade keine Antwort generieren. Bitte versuche es später erneut.";
    }
  },

  async speak(text: string): Promise<ArrayBuffer | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      }
      return null;
    } catch (error) {
      console.error("TTS Error:", error);
      return null;
    }
  },

  async getQuickWinIdeas(role: string, website: string, focus: string, areas: string[]) {
    const prompt = `Du bist mein Business-Assistent. Ich arbeite als ${role} in einem Unternehmen das ${website || 'keine Website angegeben hat'} betreibt. 
    Mein Fokus liegt auf ${focus} im Bereich ${areas.join(', ')}. 
    Erstelle mir 3 konkrete Ideen, wie ich KI in meinem Arbeitsalltag einsetzen kann, die ich HEUTE noch umsetzen könnte. Antworte in Markdown.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      return "Fehler beim Generieren der Strategie-Ideen.";
    }
  },

  async getPortfolioSummary(hurdles: string[]) {
    if (hurdles.length === 0) return "Keine ausreichenden Daten für eine Portfolio-Analyse vorhanden.";
    
    const prompt = `Analysiere die folgenden "größten Hürden" meiner Mentoring-Kunden und erstelle eine strategische Zusammenfassung für mich als Mentor.
    Clustere die Probleme in die 3 wichtigsten Themengebiete und gib mir eine Empfehlung, welches Webinar oder Whitepaper ich als nächstes erstellen sollte.
    
    Hürden der Kunden:
    ${hurdles.map((h, i) => `${i+1}. ${h}`).join('\n')}
    
    Antworte in prägnantem Business-Stil auf Deutsch (Markdown).`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Portfolio Analytics Error:", error);
      return "Analyse der Portfolio-Hürden aktuell nicht verfügbar.";
    }
  }
};
