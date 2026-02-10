
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, MedicalAnalysis } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSkinImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = getAI();
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Perform a patient-facing skin analysis. Return JSON with condition, severityScore (1-10), confidence (0-100), description, potentialCauses, recommendedIngredients, urgency (Low/Medium/High), and tips." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: { type: Type.STRING },
            severityScore: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
            potentialCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            urgency: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["condition", "severityScore", "confidence", "description", "potentialCauses", "recommendedIngredients", "urgency", "tips"]
        }
      }
    });
    return JSON.parse(response.text || '{}') as AnalysisResult;
  } catch (error) {
    console.error(error);
    return { condition: "Error", severityScore: 0, confidence: 0, description: "Failed", potentialCauses: [], recommendedIngredients: [], urgency: "Low", tips: [] };
  }
};

export const analyzeAsDermatologist = async (base64Image: string): Promise<MedicalAnalysis> => {
  const ai = getAI();
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { 
            text: `From a dermatologist view point, describe your physical examination findings for the skin disease in the image above like a medical student, then what's happening (pathophysiology), and what's will be your treatment plan. 
            
            Format as JSON with keys: "physicalFindings", "pathophysiology", "treatmentPlan".` 
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            physicalFindings: { type: Type.STRING },
            pathophysiology: { type: Type.STRING },
            treatmentPlan: { type: Type.STRING }
          },
          required: ["physicalFindings", "pathophysiology", "treatmentPlan"]
        }
      }
    });
    return JSON.parse(response.text || '{}') as MedicalAnalysis;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateDailyInsight = async (): Promise<{ title: string; shortTip: string; detailedExplanation: string }> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a sophisticated, professional skincare 'Daily Insight'. It should be medically grounded but accessible. Focus on topics like barrier repair, seasonal changes, or active ingredient combinations. Return JSON with keys 'title', 'shortTip', 'detailedExplanation'.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            shortTip: { type: Type.STRING },
            detailedExplanation: { type: Type.STRING }
          },
          required: ["title", "shortTip", "detailedExplanation"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Failed to generate insight:", error);
    return {
      title: "Skin Barrier Basics",
      shortTip: "Moisturize within 3 minutes of washing your face.",
      detailedExplanation: "Transepidermal water loss is highest immediately after cleansing. Applying a ceramide-rich moisturizer to damp skin locks in hydration and protects the lipid barrier."
    };
  }
};
