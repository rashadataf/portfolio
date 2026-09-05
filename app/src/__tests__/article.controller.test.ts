/**
 * Unit tests for the article controller — slug validation, search,
 * pagination metadata, and admin-guarded mutations.
 */
import { dbService } from '@/modules/db/db.service';
import { pgResult, adminSession } from './helpers/test-utils';

jest.mock('@/modules/db/db.service', () => ({
    dbService: { query: jest.fn(), disconnect: jest.fn() },
}));

const mockRevalidatePath = jest.fn();
jest.mock('next/cache', () => ({
    revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

const mockAuth = jest.fn();
jest.mock('@/lib/auth', () => ({
    isAdmin: () => mockAuth(),
}));

import {
    getAllArticles,
    getArticleBySlug,
    getArticleById,
    searchPublishedArticles,
    deleteArticle,
} from '@/modules/article/article.controller';

const query = dbService.query as jest.MockedFunction<typeof dbService.query>;

const articleRow = {
    id: 'a1b2c3',
    title_en: 'Test Article',
    title_ar: 'مقال',
    author: 'Rashad',
    status: 'published',
    slug_en: 'test-article',
    slug_ar: 'مقال',
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('getAllArticles', () => {
    it('returns articles with pagination metadata', async () => {
        query.mockResolvedValueOnce(pgResult([{ total: 3 }]) as never)   // COUNT
            .mockResolvedValueOnce(pgResult([articleRow]) as never);     // SELECT

        const result = await getAllArticles({ page: 1, limit: 10 });

        expect(result.status).toBe(200);
        expect(result.articles).toHaveLength(1);
        expect(result.pagination).toEqual({ page: 1, limit: 10, total: 3, totalPages: 1 });
    });

    it('computes totalPages across multiple pages', async () => {
        query.mockResolvedValueOnce(pgResult([{ total: 25 }]) as never)
            .mockResolvedValueOnce(pgResult([]) as never);

        const result = await getAllArticles({ page: 1, limit: 10 });

        expect(result.pagination?.totalPages).toBe(3);
    });

    it('rejects invalid query params', async () => {
        const result = await getAllArticles({ limit: 0 });

        expect(result.status).toBe(400);
        expect(result.message).toBe('Invalid query parameters');
        expect(query).not.toHaveBeenCalled();
    });

    it('returns 500 on db error', async () => {
        query.mockRejectedValueOnce(new Error('db down') as never);

        const result = await getAllArticles();

        expect(result.status).toBe(500);
    });
});

describe('getArticleBySlug', () => {
    it('returns the article for a valid slug', async () => {
        query.mockResolvedValueOnce(pgResult([articleRow]) as never);

        const result = await getArticleBySlug('test-article');

        expect(result.status).toBe(200);
        expect(result.article?.titleEn).toBe('Test Article');
    });

    it('returns 404 when article not found', async () => {
        query.mockResolvedValueOnce(pgResult([]) as never);

        const result = await getArticleBySlug('missing-slug');

        expect(result.status).toBe(404);
    });

    it('rejects an empty slug', async () => {
        const result = await getArticleBySlug('');

        expect(result.status).toBe(400);
        expect(result.message).toBe('Invalid slug');
        expect(query).not.toHaveBeenCalled();
    });
});

describe('getArticleById', () => {
    it('requires an id', async () => {
        const result = await getArticleById('');

        expect(result.status).toBe(400);
        expect(result.message).toBe('Article ID is required');
    });

    it('returns 404 when not found', async () => {
        query.mockResolvedValueOnce(pgResult([]) as never);

        const result = await getArticleById('missing');

        expect(result.status).toBe(404);
    });
});

describe('searchPublishedArticles', () => {
    it('returns empty for empty query without hitting the db', async () => {
        const result = await searchPublishedArticles('');

        expect(result.articles).toEqual([]);
        expect(result.status).toBe(200);
        expect(query).not.toHaveBeenCalled();
    });

    it('returns matching published articles', async () => {
        query.mockResolvedValueOnce(pgResult([articleRow]) as never);

        const result = await searchPublishedArticles('test');

        expect(result.status).toBe(200);
        expect(result.articles).toHaveLength(1);
    });
});

describe('deleteArticle', () => {
    it('deletes as admin and returns 204', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);
        query.mockResolvedValueOnce(pgResult([], 1) as never);

        const result = await deleteArticle('a1b2c3');

        expect(result.status).toBe(204);
    });

    it('returns 404 when nothing deleted', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);
        query.mockResolvedValueOnce(pgResult([], 0) as never);

        const result = await deleteArticle('missing');

        expect(result.status).toBe(404);
    });

    it('rejects when not admin', async () => {
        mockAuth.mockRejectedValueOnce(new Error('Unauthorized'));

        const result = await deleteArticle('a1b2c3');

        expect(result.status).toBe(500);
        expect(query).not.toHaveBeenCalled();
    });
});
