import { GoogleGenAI } from "@google/genai";

// Fix: Initialize the GoogleGenAI client directly with the API key from environment variables,
// assuming it's always present as per the guidelines. This removes faulty checks that
// could cause a crash on startup.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export const getRecipeInstructions = async (recipeName: string, servings: number): Promise<string> => {
  try {
    const prompt = `Provide clear, step-by-step cooking instructions for a classic ${recipeName} for ${servings} ${servings > 1 ? 'servings' : 'serving'}. Where a step requires a specific cooking time, please include it in parentheses with the format (X minutes), for example: 'Sauté the onions until translucent (5 minutes)'. Format the response as a numbered list.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching recipe instructions:", error);
    // Re-throw a user-friendly error to be handled by the component.
    // This is better practice than returning an error string as a successful result.
    throw new Error("Could not fetch recipe instructions. Please check your connection or API key.");
  }
};

// Fix: Add the missing `generateTextStream` function to enable streaming text generation.
/**
 * Generates text from a prompt in a streaming fashion.
 * @param prompt - The text prompt to send to the model.
 * @param onChunk - Callback function for each received text chunk.
 * @param onError - Callback function for handling errors.
 * @param onComplete - Callback function called when the stream is finished.
 */
export const generateTextStream = async (
  prompt: string,
  onChunk: (chunkText: string) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): Promise<void> => {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    for await (const chunk of responseStream) {
      onChunk(chunk.text);
    }
  } catch (error: any) {
    console.error("Error during text generation stream:", error);
    onError(error instanceof Error ? error : new Error("An unknown error occurred during streaming."));
  } finally {
    onComplete();
  }
};

export interface BillItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const generateRecipeBill = async (recipeName: string, servings: number): Promise<BillItem[]> => {
  try {
    const prompt = `Generate a billable ingredient list for a ${recipeName} for ${servings} servings.
    Return a JSON array where each object has:
    - name: ingredient name
    - quantity: amount in grams or count (number only)
    - unitPrice: estimated price per unit (number only)
    - totalPrice: total estimated cost for this quantity (number only)
    
    Example format:
    [
      { "name": "Onion", "quantity": 200, "unitPrice": 0.05, "totalPrice": 10 },
      { "name": "Tomato", "quantity": 2, "unitPrice": 5, "totalPrice": 10 }
    ]
    RETURN ONLY THE JSON ARRAY. NO MARKDOWN.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    // Clean up potential markdown code blocks if the model adds them despite instructions
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating recipe bill:", error);
    throw new Error("Could not generate recipe bill. Please try again.");
  }
};
