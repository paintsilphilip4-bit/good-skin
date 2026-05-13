
import { GoogleGenAI, Type } from "@google/genai";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const compressAndValidateImage = async (base64Str: string): Promise<{ data: string, isValid: boolean, reason?: string }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const MAX_DIM = 1024;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve({ data: base64Str, isValid: true });

      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const brightness = totalBrightness / (data.length / 4);

      if (brightness < 35) {
        return resolve({ data: '', isValid: false, reason: 'Low Quality Image - Please retake in natural light.' });
      }

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      resolve({ data: compressedBase64, isValid: true });
    };
    img.onerror = () => resolve({ data: base64Str, isValid: false, reason: 'Corrupted image asset.' });
  });
};

const CLINICAL_SYSTEM_PROMPT = `
Act as a Board-Certified Dermatologist with a talent for patient communication. Your task is to analyze a skin image and provide two distinct layers of information.

LAYER 1: SPECIALIST DATA (JSON)
Target: Dr. Newman (The Specialist).
Tone: Clinical, precise, and highly technical.
Required Analysis:
1. MORPHOLOGY: (e.g., Erythematous plaques with silvery scale).
2. DISTRIBUTION: (e.g., Extensor surfaces of elbows/knees).
3. CLINICAL MARKERS: Apply ABCDE (for lesions) or 7-Point Checklist (for rashes).
4. FITZPATRICK TYPE: Assess skin type (IV-VI).
5. PRIMARY DIAGNOSIS: The most likely clinical diagnosis.
6. DIFFERENTIALS: List 2 other technical possibilities.
7. URGENCY: Routine, Urgent, or Emergency.
8. MODALITY: Physical Biopsy vs Video Consult.

LAYER 2: PATIENT SUMMARY (LAYMAN)
Target: The Patient.
Tone: Empathetic, clear, and reassuring.
Structure:
1. WHAT IT IS: A simple explanation of the diagnosis (avoid jargon).
2. WHAT CAUSES IT: Common triggers or biological reasons in plain English.
3. NEXT STEPS: Immediate, non-prescription advice (e.g., 'Avoid scratching', 'Use moisturizer').

CRITICAL CONSTRAINT: The primary_diagnosis in Layer 1 must be the same condition described in Layer 2.

OUTPUT FORMAT: Return ONLY a JSON object containing the defined schema.
`;

export const analyzeSkinImage = async (base64Image: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: "Generate dual-layer dermatological analysis (Specialist Technical + Patient Layman)." }
          ],
        },
        config: { 
          systemInstruction: CLINICAL_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              specialist_analysis: {
                type: Type.OBJECT,
                properties: {
                  primary_diagnosis: { type: Type.STRING },
                  confidence_score: { type: Type.NUMBER },
                  morphology: { type: Type.STRING },
                  distribution: { type: Type.STRING },
                  clinical_markers: { type: Type.STRING },
                  fitzpatrick_type: { type: Type.STRING },
                  differential_diagnoses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  urgency: { type: Type.STRING },
                  modality_recommendation: { type: Type.STRING },
                },
                required: ["primary_diagnosis", "confidence_score", "morphology", "distribution", "clinical_markers", "urgency", "modality_recommendation"],
              },
              patient_summary: {
                type: Type.OBJECT,
                properties: {
                  explanation: { type: Type.STRING },
                  causes: { type: Type.STRING },
                  home_care_advice: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["explanation", "causes", "home_care_advice"]
              }
            },
          },
          temperature: 0.1,
        }
      });

      if (!response.text) {
        throw new Error("No response generated from diagnostic engine.");
      }

      const rootResult = JSON.parse(response.text.trim());
      
      // Check for guardrail failure (usually stuck in primary_diagnosis)
      if (rootResult.specialist_analysis?.primary_diagnosis?.includes("Low Quality")) {
          throw new Error(rootResult.specialist_analysis.primary_diagnosis);
      }
      
      // Flatten for app consumption
      const specialist = rootResult.specialist_analysis;
      const patient = rootResult.patient_summary;

      return {
        // Layer 1
        primary_diagnosis: specialist.primary_diagnosis,
        confidence_score: specialist.confidence_score,
        morphology: specialist.morphology,
        distribution: specialist.distribution,
        clinical_markers: specialist.clinical_markers,
        fitzpatrick_type: specialist.fitzpatrick_type,
        differential_diagnoses: specialist.differential_diagnoses,
        urgency: specialist.urgency,
        modality_recommendation: specialist.modality_recommendation,
        
        // Layer 2
        patient_explanation: patient.explanation,
        patient_causes: patient.causes,
        patient_advice: patient.home_care_advice,

        // Compat
        recommended_next_step: patient.home_care_advice?.[0] || "Consult Specialist",
        condition: specialist.primary_diagnosis,
        diagnosis: specialist.primary_diagnosis,
        findings: specialist.morphology,
        pathophysiology: specialist.clinical_markers,
        confidence: `${specialist.confidence_score}%`,
        treatment_plan: patient.home_care_advice,
      };
    } catch (error: any) {
      attempt++;
      console.error(`Diagnostic Engine Attempt ${attempt} failed:`, error);
      
      // Check for 503 Service Unavailable or similar capacity errors
      const isOverloaded = error.message?.includes('503') || 
                           error.status === 503 || 
                           error.code === 503 || 
                           error.error?.code === 503 ||
                           error.error?.status === 'UNAVAILABLE' ||
                           error.message?.includes('high demand') ||
                           error.message?.includes('temporarily overloaded');
      
      if (isOverloaded) {
        if (attempt < MAX_RETRIES) {
            // Exponential backoff: 2s, 4s, 8s... plus jitter
            const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
            console.log(`System overloaded (Attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay.toFixed(0)}ms...`);
            await wait(delay);
            continue;
        } else {
             throw new Error("Diagnostic system is currently at maximum capacity. Please try again in a few minutes.");
        }
      }
      
      throw new Error(error.message || "Triage engine interrupted. Please retake image.");
    }
  }
};
