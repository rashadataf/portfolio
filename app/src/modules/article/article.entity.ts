import { JSONContent } from "novel";
import { ArticleStatus } from "@/types";

export interface Article {
    id: string;
    titleEn: string;
    titleAr: string;
    contentEn: JSONContent;
    contentAr: JSONContent;
    contentAearchEn: string;
    contentSearchAr: string;
    coverImage: string;
    keywordsEn: string[];
    keywordsAr: string[];
    author: string;
    publicationDate: Date;
    status: ArticleStatus;
    slugEn: string;
    slugAr: string;
    createdAt: Date;
    updatedAt: Date;
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
            cover_image VARCHAR(255),
            keywords_en TEXT[],
            keywords_ar TEXT[],
            author VARCHAR(255) NOT NULL,
            publication_date TIMESTAMP,
            status VARCHAR(50) CHECK (status IN (${ArticleEntity.articleStatusValues})),
            slug_en VARCHAR(255) UNIQUE NOT NULL,
            slug_ar VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    static createIndexQuery = `
        CREATE INDEX IF NOT EXISTS idx_articles_publication_status 
        ON ${ArticleEntity.tableName}(publication_date, status);

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

