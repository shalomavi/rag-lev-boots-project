export const CHUNK_SIZE_WORDS = 400;

/**
 * Splits a text into chunks of a given size (in words).
 */
export const chunkText = (text: string, size: number = CHUNK_SIZE_WORDS): string[] => {
    if (!text) return [];
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += size) {
        chunks.push(words.slice(i, i + size).join(" "));
    }
    return chunks;
};
