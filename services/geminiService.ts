
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Always use process.env.API_KEY exclusively for initialization as per guidelines
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const analyzeReportSymptoms = async (description: string, additionalData?: any) => {
  try {
    const context = additionalData ? `
      Symptoms: ${additionalData.symptoms?.join(', ') || 'Not specified'}
      People affected: ${additionalData.peopleAffected || '1'}
      Onset Date: ${additionalData.onsetDate || 'Unknown'}
      Travel History: ${additionalData.travelHistory || 'None'}
      Contact with sick: ${additionalData.contactWithSick ? 'Yes' : 'No'}
      Clean water access: ${additionalData.cleanWater ? 'Yes' : 'No'}
    ` : '';

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following symptom report from Sierra Leone: 
      Description: "${description}"
      ${context}
      
      Identify the most likely disease (Malaria, Cholera, Lassa Fever, Ebola, or Unknown) and assign a priority level (Low, Medium, High, Critical).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            likelyDisease: { type: Type.STRING },
            priority: { type: Type.STRING },
            justification: { type: Type.STRING },
            recommendedAction: { type: Type.STRING }
          },
          required: ["likelyDisease", "priority", "justification", "recommendedAction"]
        }
      }
    });

    // Directly access .text property as per guidelines
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return null;
  }
};

export const analyzeHealthVideo = async (base64Frames: string[], prompt: string) => {
  try {
    const parts = base64Frames.map(frame => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: frame.split(',')[1] || frame
      }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [
          ...parts,
          { text: `You are a public health video analyst for Sierra Leone. Analyze these frames from a health-related video. ${prompt}. Provide a summary of key signs shown, prevention steps, and a localized safety message in Krio.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyObservations: { type: Type.ARRAY, items: { type: Type.STRING } },
            preventionBriefing: { type: Type.STRING },
            krioMessage: { type: Type.STRING },
            riskLevel: { type: Type.STRING }
          },
          required: ["keyObservations", "preventionBriefing", "krioMessage", "riskLevel"]
        }
      }
    });

    // Directly access .text property as per guidelines
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Video analysis failed", error);
    return null;
  }
};

export const analyzeRegionalThreat = async (district: string, metrics: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a strategic epidemiological analysis for the ${district} district in Sierra Leone. 
      Current Metrics: ${JSON.stringify(metrics)}. 
      Provide a threat level assessment, primary risks, and a 3-step immediate response plan for field teams.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatLevel: { type: Type.STRING },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategicAdvice: { type: Type.STRING },
            responsePlan: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["threatLevel", "riskFactors", "strategicAdvice", "responsePlan"]
        }
      }
    });

    // Directly access .text property as per guidelines
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Regional analysis failed", error);
    return null;
  }
};

export const generateCommunityPulse = async (district: string, newsArticles: any[]) => {
  try {
    const newsContext = newsArticles.map(a => `${a.title}: ${a.content}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Sierra Leone Ministry of Health's Community Liaison.
      Based on these recent news items in ${district}:
      ${newsContext}
      
      Identify the top 2 health concerns for citizens.
      Create a proactive "Weekly Pulse" briefing.
      You MUST provide content in both English and Krio.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
            englishBriefing: { type: Type.STRING },
            krioBriefing: { type: Type.STRING },
            callToAction: { type: Type.STRING }
          },
          required: ["concerns", "englishBriefing", "krioBriefing", "callToAction"]
        }
      }
    });
    // Directly access .text property as per guidelines
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Pulse generation failed", error);
    return null;
  }
};

export const healthAssistantChat = async (message: string | { data: string, mimeType: string }, context: string = "general") => {
  try {
    const contents: any[] = [];
    
    if (typeof message === 'string') {
      contents.push({ text: message });
    } else {
      contents.push({
        inlineData: {
          data: message.data,
          mimeType: message.mimeType,
        },
      });
      contents.push({ text: "Please listen to this health-related voice message from a citizen in Sierra Leone. They may be speaking English or Krio. Translate/transcribe the meaning and respond as instructed below." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: contents },
      config: {
        systemInstruction: `You are the "Outbreak Alert SL AI Assistant", an expert in Sierra Leonean public health.
        
        BILINGUAL RULE:
        - For every response, you MUST provide the answer in BOTH English and Krio.
        - Label them clearly: "English:" followed by the text, then "Krio:" followed by the text.
        - The Krio should be authentic, warm, and helpful ("Salone way").
        - If the user sent a voice message, confirm you heard it and address their specific symptoms or questions.
        - If symptoms are severe (fever, bleeding), ALWAYS tell them to call 117 immediately in both languages.
        
        User Context: ${context}.`
      }
    });
    // Directly access .text property as per guidelines
    return response.text;
  } catch (error) {
    console.error("Health Assistant Chat failed", error);
    return "English: I am currently unable to process your request. Please contact 117 for emergencies. Krio: A nor fit ansa yu rigo naw. Kol 117 kwik kwik.";
  }
};

export const generateSpeechResponse = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this health message naturally with a Sierra Leonean accent. If there is Krio language, use authentic Sierra Leonean cadence: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS generation failed", error);
    return null;
  }
};

export const searchHospitals = async (location?: { latitude: number, longitude: number }) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "List 5 major hospitals and health centers in Sierra Leone, focusing on those equipped for infectious disease management. Provide their names, locations, and a brief description of their capacity.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location ? {
              latitude: location.latitude,
              longitude: location.longitude
            } : undefined
          }
        }
      },
    });

    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Hospital search failed", error);
    return null;
  }
};

export const checkSymptomsAI = async (symptoms: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Sierra Leonean health assistant. A citizen is reporting these symptoms: "${symptoms}".
      
      Provide a preliminary assessment:
      1. Likely condition (Malaria, Typhoid, Lassa, etc.)
      2. Urgency level (Low, Medium, High, Emergency)
      3. Immediate advice (Home care, Clinic visit, 117 call)
      4. A localized message in Krio.
      
      IMPORTANT: This is NOT a medical diagnosis. Always include a disclaimer.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assessment: { type: Type.STRING },
            urgency: { type: Type.STRING },
            advice: { type: Type.STRING },
            krioAdvice: { type: Type.STRING },
            disclaimer: { type: Type.STRING }
          },
          required: ["assessment", "urgency", "advice", "krioAdvice", "disclaimer"]
        }
      }
    });

    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Symptom check failed", error);
    return null;
  }
};
