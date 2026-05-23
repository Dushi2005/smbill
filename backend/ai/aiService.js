import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

export const askModel = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (err) {
    console.error("AI Error:", err);
    throw new Error("AI request failed");
  }
};

export const streamModel = async (prompt) => {
  try {
    return await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
  } catch (err) {
    console.error("Stream Error:", err);
    throw new Error("Streaming failed");
  }
};
