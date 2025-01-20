import { dbService } from '@/modules/db/db.service';
import { Article, ArticleEntity } from '@/modules/article/article.entity';
import { CreateArticleDTO, UpdateArticleDTO } from '@/modules/article/article.dto';
import { toCamelCase, toSnakeCase } from '@/lib/utils';

export class ArticleRepository {

    async executeQuery<T>(query: string, params: unknown[]): Promise<T[]> {
        const { rows } = await dbService.query(query, params);
        return rows.map(row => toCamelCase<T>(row));
    }

    async findArticleById(id: string): Promise<Article | null> {
        const { rows } = await dbService.query(
            `SELECT * FROM ${ArticleEntity.tableName} WHERE id = $1`,
            [id]
        );
        if (rows.length) {
            return toCamelCase<Article>(rows[0]);
        }
        return null;
    }

    async findAll(): Promise<Article[]> {
        const { rows } = await dbService.query(`SELECT * FROM ${ArticleEntity.tableName}`);
        return rows.map(row => toCamelCase<Article>(row));
    }

    async createArticle(article: CreateArticleDTO): Promise<Article> {
        const { rows } = await dbService.query(
            `INSERT INTO articles 
            (title_en, title_ar, description_en, description_ar, content_en, content_ar, content_search_en, content_search_ar, cover_image, keywords_en, keywords_ar, author, publication_date, status, slug_en, slug_ar, created_at, updated_at) 
            VALUES 
            ($1, $2, $3, $4, $5, $6, to_tsvector('english', $7), to_tsvector('arabic', $8), $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *`,
            [
                article.titleEn,
                article.titleAr,
                article.descriptionEn,
                article.descriptionAr,
                article.contentEn,
                article.contentAr,
                article.contentSearchEn,
                article.contentSearchAr,
                article.coverImage,
                article.keywordsEn,
                article.keywordsAr,
                article.author,
                article.publicationDate,
                article.status,
                article.slugEn,
                article.slugAr,
                new Date(),
                new Date(),
            ]
        );

        return toCamelCase<Article>(rows[0]);
    }

    async updateArticle(id: string, article: UpdateArticleDTO): Promise<Article | null> {
        const dbArticle = toSnakeCase(article);

        const setClause = Object.keys(dbArticle)
            .map((key, index) => `${key} = $${index + 2}`)
            .join(', ');

        const values = [id, ...Object.values(dbArticle), new Date()];

        const { rows } = await dbService.query(
            `UPDATE ${ArticleEntity.tableName} 
            SET ${setClause}, updated_at = $${values.length} 
            WHERE id = $1 
            RETURNING *`,
            values
        );

        if (rows.length) {
            return toCamelCase<Article>(rows[0]);
        }
        return null;
    }

    async deleteArticle(id: string): Promise<boolean> {
        const { rowCount } = await dbService.query(
            `DELETE FROM articles WHERE id = $1`,
            [id]
        );
        return rowCount !== null && rowCount > 0;
    }
}
