import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const askGemini = async (model: string, userPrompt: string, systemPrompt: string) => {
    try {
        const result = await gemini.models.generateContent({
            model,
            contents: [
                { role: "model", parts: [{ text: systemPrompt }] }, // model == system
                { role: "user", parts: [{ text: userPrompt }] },
            ],
            config: {
                thinkingConfig: {
                    thinkingBudget: 0,
                },
            },
        });

        return result;
    } catch (error) {
        console.error("Error generating content with LLM:", error);
        throw error;
    }
};
export const embedText = async (text: string, outputDimension: number = 768, taskType: string = "RETRIEVAL_DOCUMENT"): Promise<number[]> => {
    try {
        const response = await gemini.models.embedContent({
            model: "gemini-embedding-001",
            contents: [{ parts: [{ text }] }],
            config: {
                outputDimensionality: outputDimension,
                taskType: taskType as any,
            },
        });

        const embedding = response.embeddings?.[0];
        if (!embedding || !embedding.values) {
            throw new Error("No embedding found in response");
        }
        return embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};
