import { embedText } from "./geminiService";
import { chunkText, CHUNK_SIZE_WORDS } from "../utils/textSplitter";
import { knowledgeBaseRepository } from "../repositories/knowledgeBaseRepository";

/**
 * Stores content in the knowledge base after chunking and embedding.
 */
export const storeInDB = async (source: string, sourceId: string, content: string) => {
    // Check if already exists to avoid duplicates
    const existing = await knowledgeBaseRepository.findBySourceAndId(source, sourceId);
    if (existing) {
        console.log(`Skipping ${source}:${sourceId}, already exists in DB.`);
        return;
    }

    const chunks = chunkText(content, CHUNK_SIZE_WORDS);
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (!chunk.trim()) continue;

        console.log(`Embedding chunk ${i} for ${sourceId}...`);
        const embedding = await embedText(chunk, 768, "RETRIEVAL_DOCUMENT");

        await knowledgeBaseRepository.insertChunk({
            source,
            source_id: sourceId,
            chunk_index: i,
            chunk_content: chunk,
            embedding
        });
    }
};
