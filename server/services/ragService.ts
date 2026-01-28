import { QueryTypes } from "sequelize";
import sequelize from "../config/database";
import { askGemini, embedText } from "./geminiService";
import { getPdfContent } from "./pdfService";
import { getArticleContent } from "./articleService";
import { getSlackContent } from "./slackService";
import { storeInDB } from "./dbService";

export const loadAllData = async () => {
  try {
    console.log("--- Starting Data Load ---");

    // 1. PDFs
    const pdfs = await getPdfContent();
    for (const pdf of pdfs) {
      await storeInDB("pdf", pdf.fileName, pdf.text);
    }

    // 2. Articles
    await getArticleContent();

    // 3. Slack API
    await getSlackContent();

    console.log("--- Data Load Complete ---");
  } catch (error) {
    console.error("Error in loadAllData:", error);
    throw error;
  }
};

export const ask = async (userQuestion: string): Promise<string> => {
  try {
    // 1. Embed question (taskType: RETRIEVAL_QUERY for queries)
    const questionEmbedding = await embedText(userQuestion, 768, "RETRIEVAL_QUERY");
    // 2. Similarity search using pgvector
    const results: any[] = await sequelize.query(
      `SELECT chunk_content, source, source_id, 
              (1 - (embeddings_768 <=> :embedding::vector)) as similarity
       FROM knowledge_base
       ORDER BY similarity DESC
       LIMIT 3`,
      {
        replacements: { embedding: `[${questionEmbedding.join(",")}]` },
        type: QueryTypes.SELECT,
      }
    );
    console.log("Similarity search results:", results);

    if (results.length === 0) {
      return "I'm sorry, I couldn't find any information about that in my knowledge base.";
    }

    // 3. Construct context and prompts
    const context = results
      .map((r) => `Source: ${r.source} (${r.source_id})\nContent: ${r.chunk_content}`)
      .join("\n\n---\n\n");

    const systemPrompt = `You are an expert on Lev-Boots. Use the following retrieved context to answer the user's question. 
Answer only based on the technical and experimental data provided. If the answer is not in the context, say you don't know.

Context:
${context}`;

    const userPrompt = userQuestion;

    // 4. Generate answer using Gemini
    const response = await askGemini("gemini-2.5-flash", userPrompt, systemPrompt);

    // @ts-ignore - Handle Gemini SDK response structure
    const answer = response.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate an answer.";

    return answer;
  } catch (error) {
    console.error("Error in ask:", error);
    return "An error occurred while trying to answer your question.";
  }
};
