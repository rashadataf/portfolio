"use server";
import fs from "fs";
import path from "path";
import { ArticleService } from "@/modules/article/article.service";
import { type CreateArticleDTO, type UpdateArticleDTO } from "@/modules/article/article.dto";
import { isAdmin } from "@/lib/auth";
import { type Article } from "@/modules/article/article.entity";
import { createArticleSchema, updateArticleSchema, articleQuerySchema, slugParamSchema } from "@/lib/validation";
import { ZodError } from "zod";

const articleService = new ArticleService();

export async function serachPublishedArticles(query: string) {
    try {
        if (!query) {
            return { articles: [], status: 200 };
        }

        const articles = await articleService.serachPublishedArticles<Article>([query]);
        return { articles, status: 200 };
    } catch (error) {
        console.error('Error fetching articles by query:', error);
        return { message: 'Error fetching articles by query', error, status: 500 };
    }
}

export async function getAllArticles(params?: { page?: number; limit?: number; status?: string; search?: string; lang?: string }) {
    try {
        const { page, limit, ...filters } = articleQuerySchema.parse(params || {});
        const articles = await articleService.getAllArticles({ page, limit, ...filters });
        return { articles, status: 200 };
    } catch (error) {
        if (error instanceof ZodError) {
            return { message: 'Invalid query parameters', error: error.message, status: 400 };
        }
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

export async function getArticleBySlug(slug: string): Promise<{ article?: Article, message?: string, error?: unknown, status: number }> {
    try {
        const validatedSlug = slugParamSchema.parse({ slug });
        const decodedSlug = decodeURIComponent(validatedSlug.slug);
        const article = await articleService.getArticleBySlugs(decodedSlug);

        if (!article) {
            return { message: 'Article not found', status: 404 };
        }

        return { article, status: 200 };
    } catch (error) {
        if (error instanceof ZodError) {
            return { message: 'Invalid slug', error: error.message, status: 400 };
        }
        console.error('Error fetching article by slug:', error);
        return { message: 'Error fetching article', error, status: 500 };
    }
}

export async function createArticle(data: CreateArticleDTO, coverImage: File | null) {
    try {
        await isAdmin();
        
        // Validate input data
        const validatedData = createArticleSchema.parse(data);
        
        let coverImageUrl = '';

        if (coverImage) {
            const uploadResponse = await uploadImage(coverImage);
            if (uploadResponse.url) {
                coverImageUrl = uploadResponse.url;
            }
        }

        const articleData = { ...validatedData, coverImage: coverImageUrl };

        const createdArticle = await articleService.createArticle(articleData);
        return { article: createdArticle, status: 201 };
    } catch (error) {
        if (error instanceof ZodError) {
            return { message: 'Validation error', error: error.message, status: 400 };
        }
        console.error("Error creating article:", error);
        return { message: 'Error creating article', error, status: 400 };
    }
}

export async function updateArticle(id: string, data: UpdateArticleDTO, coverImage: File | null = null) {
    try {
        await isAdmin();
        
        // Validate input data
        const validatedData = updateArticleSchema.parse(data);
        
        let coverImageUrl = '';

        if (coverImage) {
            const uploadResponse = await uploadImage(coverImage);
            if (uploadResponse.url) {
                coverImageUrl = uploadResponse.url;
            }
        }

        // If no new cover image file, remove coverImage from data to preserve existing, unless it's '' to delete
        if (!coverImage) {
            if (validatedData.coverImage !== '') {
                delete validatedData.coverImage;
            }
        } else {
            validatedData.coverImage = coverImageUrl;
        }

        const updatedArticle = await articleService.updateArticle(id, validatedData);
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
        const fileExtension = file.name.split('.').pop();
        const imageFileName = `${timestamp}_IMG.${fileExtension}`;

        // Store in "uploads" (not inside "public")
        const uploadPath = path.join(process.cwd(), "public", "uploads", imageFileName);

        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

        const buffer = await file.arrayBuffer();
        fs.writeFileSync(uploadPath, Buffer.from(buffer));

        // New API route for serving images
        const imageUrl = `/api/files/${imageFileName}`;

        return { url: imageUrl, status: 200 };
    } catch (error) {
        console.error("Error uploading image:", error);
        return { status: 401, message: "Error uploading image", error };
    }
}

