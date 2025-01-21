"use server";
import { promises as fs } from "fs";
import path from "path";
import { ArticleService } from "@/modules/article/article.service";
import { CreateArticleDTO, UpdateArticleDTO } from "@/modules/article/article.dto";
import { isAdmin } from "@/lib/auth";
import { Article, ArticleEntity } from "@/modules/article/article.entity";

const articleService = new ArticleService();

export async function getArticlesByQuery(query: string) {
    try {
        if (!query) {
            return { articles: [], status: 200 };
        }

        const sqlQuery = `
            SELECT * FROM ${ArticleEntity.tableName}
            WHERE content_search_en @@ websearch_to_tsquery('english', $1)
               OR content_search_ar @@ websearch_to_tsquery('arabic', $1)
        `;

        const articles = await articleService.executeQuery<Article>(sqlQuery, [query]);
        return { articles, status: 200 };
    } catch (error) {
        console.error('Error fetching articles by query:', error);
        return { message: 'Error fetching articles by query', error, status: 500 };
    }
}

export async function getAllArticles() {
    try {
        const articles = await articleService.getAllArticles();
        return { articles, status: 200 };
    } catch (error) {
        console.error('Error fetching articles:', error);
        return { message: 'Error fetching articles', error, status: 500 };
    }
}

export async function getDraftArticles() {
    try {
        await isAdmin();
        const articles = await articleService.getDraftArticles();
        return { articles, status: 200 };
    } catch (error) {
        console.error("Error fetching draft articles:", error);
        return { message: "Error fetching draft articles", error, status: 500 };
    }
}

export async function getArchivedArticles() {
    try {
        await isAdmin();
        const articles = await articleService.getArchivedArticles();
        return { articles, status: 200 };
    } catch (error) {
        console.error("Error fetching archived articles:", error);
        return { message: "Error fetching archived articles", error, status: 500 };
    }
}

export async function getPublishedArticles() {
    try {
        await isAdmin();
        const articles = await articleService.getPublishedArticles();
        return { articles, status: 200 };
    } catch (error) {
        console.error("Error fetching published articles:", error);
        return { message: "Error fetching published articles", error, status: 500 };
    }
}

export async function getArticleById(id: string): Promise<{ article?: Article, message?: string, error?: unknown, status: number }> {
    try {
        if (!id) {
            return { message: 'Article ID is required', status: 400 };
        }
        const article = await articleService.getArticleById(id);
        if (!article) {
            return { message: 'Article not found', status: 404 };
        }
        return { article, status: 200 };
    } catch (error) {
        console.error('Error fetching article:', error);
        return { message: 'Error fetching article', error, status: 500 };
    }
}

export async function createArticle(data: CreateArticleDTO, coverImage: File | null) {
    try {
        await isAdmin();
        let coverImageUrl = '';

        if (coverImage) {
            const uploadResponse = await uploadImage(coverImage);
            if (uploadResponse.url) {
                coverImageUrl = uploadResponse.url;
            }
        }

        const articleData = { ...data, coverImage: coverImageUrl };

        const createdArticle = await articleService.createArticle(articleData);
        return { article: createdArticle, status: 201 };
    } catch (error) {
        console.error("Error creating article:", error);
        return { message: 'Error createing article', error, status: 400 };
    }
}

export async function updateArticle(id: string, data: UpdateArticleDTO) {
    try {
        await isAdmin();
        const updatedArticle = await articleService.updateArticle(id, data);
        if (!updatedArticle) {
            return { message: 'Article not found', status: 404 };
        }
        return { article: updatedArticle, status: 200 };
    } catch (error) {
        console.error('Error updating article:', error);
        return { message: 'Error updating article', error, status: 400 };
    }
}

export async function deleteArticle(id: string) {
    try {
        await isAdmin();
        if (!id) {
            return { message: 'Article ID is required', status: 400 };
        }
        const success = await articleService.deleteArticle(id);
        if (!success) {
            return { message: 'Article not found', status: 404 };
        }
        return { message: 'Article deleted successfully', status: 204 };
    } catch (error) {
        console.error('Error deleting article:', error);
        return { message: 'Error deleting article', error, status: 500 };
    }
}

export async function uploadImage(file: File) {
    try {
        await isAdmin();
        if (!file) {
            throw new Error("No file provided for upload.");
        }

        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop(); // Extract file extension
        const imageFileName = `${timestamp}_IMG.${fileExtension}`;
        const uploadPath = path.join(process.cwd(), "public", "uploads", imageFileName);

        await fs.mkdir(path.dirname(uploadPath), { recursive: true });

        const buffer = await file.arrayBuffer();
        await fs.writeFile(uploadPath, Buffer.from(buffer));

        const imageUrl = `/uploads/${imageFileName}`;

        return { url: imageUrl, status: 200 };
    } catch (error) {
        console.error("Error uploading image:", error);
        return { status: 401, message: "Error uploading image", error };
    }
}
