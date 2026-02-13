
import { GoogleGenAI, Type } from "@google/genai";

/**
 * CLINICAL IMAGE UTILITIES
 * Resizes images to optimize token usage and performs local triage (brightness check).
 */
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

      // --- LOCAL TRIAGE: BRIGHTNESS CHECK ---
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let r, g, b, avg;
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        avg = (r + g + b) / 3;
        totalBrightness += avg;
      }
      const brightness = totalBrightness / (data.length / 4);

      if (brightness < 45) {
        return resolve({ data: '', isValid: false, reason: 'Please ensure your skin is in bright, natural light for the best AI analysis.' });
      }

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve({ data: compressedBase64, isValid: true });
    };
    img.onerror = () => resolve({ data: base64Str, isValid: true });
  });
};

const CLINICAL_SYSTEM_PROMPT = `
Role: Board-Certified Dermatologist.
Task: Analyze this skin image strictly.
Output: valid JSON only. No markdown.

Protocol:
1. Examine the image for primary and secondary lesions.
2. Describe morphology, color, and distribution.
3. Formulate a differential and select the most likely diagnosis.
4. Provide a first-line treatment plan.

If the image is not a skin condition, set diagnosis to "Non-Medical Image".
`;

export const analyzeSkinImage = async (base64Image: string): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: "Analyze the provided dermatological image following the clinical protocol." }
        ],
      },
      config: { 
        systemInstruction: CLINICAL_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            findings: { type: Type.STRING },
            diagnosis: { type: Type.STRING },
            confidence: { type: Type.STRING },
            explanation: { type: Type.STRING },
            treatment: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["findings", "diagnosis", "confidence", "explanation", "treatment"],
        },
        temperature: 0.0,
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    
    const result = JSON.parse(text.trim());
    return {
      ...result,
      severityScore: result.confidence === 'High' ? 8 : result.confidence === 'Medium' ? 5 : 2,
      description: result.findings,
      potentialCauses: [result.explanation],
      recommendedIngredients: result.treatment,
      urgency: result.confidence === 'High' ? 'High' : (result.confidence === 'Medium' ? 'Medium' : 'Low')
    };
  } catch (error: any) {
    console.error("AI Analysis Bridge Failure:", error);
    
    // Comprehensive Quota Exceeded (429 / RESOURCE_EXHAUSTED) Detection
    const errorMessage = error?.message || "";
    const errorStatus = error?.status;
    const errorCode = error?.code || (error?.response?.status);
    
    const isQuotaError = 
      errorMessage.includes('429') || 
      errorMessage.includes('RESOURCE_EXHAUSTED') || 
      errorMessage.includes('quota') ||
      errorStatus === 429 || 
      errorCode === 429;

    if (isQuotaError) {
      throw new Error('QUOTA_EXCEEDED');
    }

    return {
      findings: "Analysis bridge unavailable.",
      diagnosis: "Service Offline",
      confidence: "0",
      explanation: "A technical error occurred.",
      treatment: ["Retry the analysis later."],
      isError: true,
      urgency: 'Low',
      severityScore: 0
    };
  }
};

export const analyzeAsDermatologist = analyzeSkinImage;
