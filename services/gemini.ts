
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, RESPONSE_SCHEMA } from "../constants";
import { UserInput, AnalysisResult, GroundingSource } from "../types";

export class TriageService {
  private get ai() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeSymptoms(input: UserInput): Promise<AnalysisResult> {
    const prompt = `
      USER PROFILE & SYMPTOMS:
      Symptoms: ${input.symptoms}
      Duration: ${input.duration || 'Not specified'}
      Onset: ${input.onset || 'Not specified'}
      Severity: ${input.severity}/10
      Age Group: ${input.ageGroup || 'Not specified'}
      Existing Conditions: ${input.existingConditions || 'None reported'}
      
      Determine the urgency and the correct medical specialty.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA as any,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI service.");
    return JSON.parse(text) as AnalysisResult;
  }

  async findDoctors(specialty: string, symptoms: string, lat?: number, lng?: number): Promise<{ text: string, sources: GroundingSource[] }> {
    // Generate a highly targeted query for Google Maps grounding
    const query = `Find highly-rated ${specialty} clinics and specialist doctors near me who can help with: ${symptoms}. Include medical offices, private practices, and outpatient centers.`;
    
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }] as any,
        toolConfig: lat && lng ? {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        } : undefined
      },
    });

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.maps) {
        sources.push({
          title: chunk.maps.title || 'Medical Provider',
          uri: chunk.maps.uri || ''
        });
      } else if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Medical Clinic Information',
          uri: chunk.web.uri || ''
        });
      }
    });

    // Fallback if no specific maps results but search results exist
    if (sources.length === 0 && response.text) {
      // Sometimes the model provides URLs in the text itself
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = response.text.match(urlRegex);
      matches?.forEach(url => {
        sources.push({ title: "View Clinic Details", uri: url });
      });
    }

    return {
      text: response.text || "Searching local medical directories...",
      sources: sources.filter((s, index, self) => 
        s.uri && self.findIndex(t => t.uri === s.uri) === index
      )
    };
  }

  async findEmergencyHospitals(lat?: number, lng?: number): Promise<GroundingSource[]> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the absolute nearest emergency rooms (ER), 24/7 hospitals, and trauma centers. I need immediate life-saving medical care.`,
      config: {
        tools: [{ googleMaps: {} }] as any,
        toolConfig: lat && lng ? {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        } : undefined
      },
    });

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach((chunk: any) => {
      if (chunk.maps) {
        sources.push({
          title: chunk.maps.title || 'Emergency Hospital',
          uri: chunk.maps.uri || ''
        });
      }
    });

    return sources.filter((s, index, self) => 
      s.uri && self.findIndex(t => t.uri === s.uri) === index
    );
  }
}

export const triageService = new TriageService();
