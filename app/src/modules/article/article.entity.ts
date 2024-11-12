import { ArticleStatus } from "@/types";

export interface Article {
    id: string;
    title_en: string;
    title_ar: string;
    content_en: JSON;
    content_ar: JSON;
    content_search_en: string;
    content_search_ar: string;
    coverImage: string;
    keywords_en: string[];
    keywords_ar: string[];
    author: string;
    publicationDate: Date;
    status: ArticleStatus;
    slug_en: string;
    slug_ar: string;
    created_at: Date;
    updated_at: Date;
}

export class ArticleEntity {
    static tableName = 'articles';

    static articleStatusValues = Object.values(ArticleStatus).map(value => `'${value}'`).join(', ');

    static createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${ArticleEntity.tableName} (
            id SERIAL PRIMARY KEY,
            title_en VARCHAR(255) NOT NULL,
            title_ar VARCHAR(255) NOT NULL,
            content_en JSON NOT NULL,
            content_ar JSON NOT NULL,
            content_search_en tsvector,
            content_search_ar tsvector,
            coverImage VARCHAR(255),
            keywords_en TEXT[],
            keywords_ar TEXT[],
            author VARCHAR(255) NOT NULL,
            publicationDate TIMESTAMP,
            status VARCHAR(50) CHECK (status IN (${ArticleEntity.articleStatusValues})),
            slug_en VARCHAR(255) UNIQUE NOT NULL,
            slug_ar VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    static createIndexQuery = `
        CREATE INDEX IF NOT EXISTS idx_articles_publication_status 
        ON ${ArticleEntity.tableName}(publicationDate, status);

        CREATE INDEX IF NOT EXISTS idx_articles_keywords_en 
        ON ${ArticleEntity.tableName} USING GIN(keywords_en);
        
        CREATE INDEX IF NOT EXISTS idx_articles_keywords_ar 
        ON ${ArticleEntity.tableName} USING GIN(keywords_ar);

        CREATE INDEX IF NOT EXISTS idx_articles_content_search_en 
        ON ${ArticleEntity.tableName} USING GIN(content_search_en);

        CREATE INDEX IF NOT EXISTS idx_articles_content_search_ar 
        ON ${ArticleEntity.tableName} USING GIN(content_search_ar);
    `;

    static initializeTable() {
        return [ArticleEntity.createTableQuery, ArticleEntity.createIndexQuery];
    }
}

