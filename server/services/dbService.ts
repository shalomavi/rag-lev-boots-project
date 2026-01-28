import KnowledgeBase from "../models/KnowledgeBase";
import { embedText } from "./geminiService";

const CHUNK_SIZE_WORDS = 400;

const chunkText = (text: string, size: number): string[] => {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += size) {
        chunks.push(words.slice(i, i + size).join(" "));
    }
    return chunks;
};

export const storeInDB = async (source: string, sourceId: string, content: string) => {
    // Check if already exists to avoid duplicates
    const existing = await KnowledgeBase.findOne({ where: { source, source_id: sourceId } });
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

        await KnowledgeBase.create({
            source,
            source_id: sourceId,
            chunk_index: i,
            chunk_content: chunk,
            embeddings_768: embedding,
        });
    }
};
