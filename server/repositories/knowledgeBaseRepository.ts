import KnowledgeBase from "../models/KnowledgeBase";
import sequelize from "../config/database";
import { QueryTypes } from "sequelize";

export interface SearchResult {
    chunk_content: string;
    source: string;
    source_id: string;
    similarity: number;
}

export class KnowledgeBaseRepository {
    async findBySourceAndId(source: string, sourceId: string) {
        return await KnowledgeBase.findOne({ where: { source, source_id: sourceId } });
    }

    async insertChunk(data: {
        source: string;
        source_id: string;
        chunk_index: number;
        chunk_content: string;
        embedding: number[];
    }) {
        // Use raw query to handle pgvector format [v1,v2,...]
        await sequelize.query(
            `INSERT INTO knowledge_base (source, source_id, chunk_index, chunk_content, embeddings_768, created_at, updated_at) 
             VALUES (:source, :source_id, :chunk_index, :chunk_content, :embedding::vector, NOW(), NOW())`,
            {
                replacements: {
                    source: data.source,
                    source_id: data.source_id,
                    chunk_index: data.chunk_index,
                    chunk_content: data.chunk_content,
                    embedding: `[${data.embedding.join(",")}]`
                },
                type: QueryTypes.INSERT
            }
        );
    }

    async searchSimilar(embedding: number[], limit: number = 3): Promise<SearchResult[]> {
        return await sequelize.query(
            `SELECT chunk_content, source, source_id, 
                    (1 - (embeddings_768 <=> :embedding::vector)) as similarity
             FROM knowledge_base
             ORDER BY similarity DESC
             LIMIT :limit`,
            {
                replacements: {
                    embedding: `[${embedding.join(",")}]`,
                    limit
                },
                type: QueryTypes.SELECT,
            }
        ) as SearchResult[];
    }
}

export const knowledgeBaseRepository = new KnowledgeBaseRepository();
