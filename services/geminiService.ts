import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// Note: process.env.API_KEY is assumed to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateShapePoints = async (prompt: string): Promise<number[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const modelId = "gemini-2.5-flash";

  const systemInstruction = `
    You are a 3D Geometry Generator. 
    Your task is to generate a cloud of 3D points (x, y, z) that form the shape of the object described by the user.
    The coordinates should be normalized roughly between -4 and 4.
    Generate exactly 100 points that outline the key features of the shape effectively.
    The response must be a flat array of numbers [x1, y1, z1, x2, y2, z2, ...].
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Generate a 3D point cloud for: ${prompt}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "A flat array of x, y, z coordinates. Length should be 300 (100 points * 3 dimensions)."
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from Gemini");

    const data = JSON.parse(jsonText);
    if (!data.points || !Array.isArray(data.points)) {
      throw new Error("Invalid format returned by AI");
    }

    return data.points;

  } catch (error) {
    console.error("Gemini Shape Generation Error:", error);
    throw error;
  }
};