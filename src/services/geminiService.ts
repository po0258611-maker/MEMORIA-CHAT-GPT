import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeVideoWithGemini(
  videoName: string,
  thumbnailBase64: string,
  duration: number
): Promise<Partial<AnalysisResult>> {
  const base64Data = thumbnailBase64.split(',')[1];
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        },
        {
          text: `Analise esta imagem que é um frame representativo de um vídeo chamado "${videoName}" com duração de ${duration.toFixed(1)} segundos.
      Aja como um especialista em viralização de vídeos curtos (TikTok, Reels, Shorts).
      Gere métricas e sugestões para otimizar o potencial viral deste vídeo.
      Retorne um JSON com a seguinte estrutura:
      - factors: { hook (0-100), audioEnergy (0-100), pacing (0-100), facialExpression (0-100), curiosity (0-100) }
      - recommendedCuts: array de objetos com { start (string, ex: "00:05"), end (string, ex: "00:15"), duration (string, ex: "10s"), reason (string) } indicando os momentos exatos para cortes de cena.
      - hashtags: { shorts (array de 5 strings), reach (array de 5 strings), niche (array de 5 strings) }
      - titles: array de 5 strings chamativas e otimizadas para clique
      `
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          factors: {
            type: Type.OBJECT,
            properties: {
              hook: { type: Type.INTEGER },
              audioEnergy: { type: Type.INTEGER },
              pacing: { type: Type.INTEGER },
              facialExpression: { type: Type.INTEGER },
              curiosity: { type: Type.INTEGER },
            },
            required: ["hook", "audioEnergy", "pacing", "facialExpression", "curiosity"]
          },
          recommendedCuts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                start: { type: Type.STRING },
                end: { type: Type.STRING },
                duration: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["start", "end", "duration", "reason"]
            }
          },
          hashtags: {
            type: Type.OBJECT,
            properties: {
              shorts: { type: Type.ARRAY, items: { type: Type.STRING } },
              reach: { type: Type.ARRAY, items: { type: Type.STRING } },
              niche: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["shorts", "reach", "niche"]
          },
          titles: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["factors", "recommendedCuts", "hashtags", "titles"]
      }
    }
  });

  const text = response.text || "{}";
  let data;
  try {
    // Clean up potential markdown formatting
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    data = JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    data = {
      factors: { hook: 50, audioEnergy: 50, pacing: 50, facialExpression: 50, curiosity: 50 },
      recommendedCuts: [{ start: "00:00", end: "00:10", duration: "10s", reason: "Padrão" }],
      hashtags: { shorts: ["#shorts"], reach: ["#viral"], niche: ["#video"] },
      titles: ["Título Gerado Automaticamente"]
    };
  }
  
  // Calculate viral score
  const f = data.factors;
  const viralScore = Math.round(
    (f.hook * 0.30) +
    (f.audioEnergy * 0.20) +
    (f.pacing * 0.20) +
    (f.facialExpression * 0.20) +
    (f.curiosity * 0.10)
  );

  // Generate mock retention data
  const retentionData = [];
  let currentRetention = 100;
  for (let i = 0; i <= 60; i += 5) {
    retentionData.push({ time: i, retention: currentRetention });
    // Drop more heavily if hook is low
    const drop = Math.random() * (100 - f.hook) / 5 + 2;
    currentRetention = Math.max(0, currentRetention - drop);
  }

  return {
    ...data,
    viralScore,
    retentionData,
  };
}
