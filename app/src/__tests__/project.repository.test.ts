/**
 * Unit tests for ProjectRepository — verifies the dynamic SQL construction
 * (filters, pagination, parameterized values) without a real database.
 */
import { dbService } from '@/modules/db/db.service';
import { pgResult } from './helpers/test-utils';

jest.mock('@/modules/db/db.service', () => ({
    dbService: { query: jest.fn(), disconnect: jest.fn() },
}));

import { ProjectRepository } from '@/modules/project/project.repository';

const query = dbService.query as jest.MockedFunction<typeof dbService.query>;

const projectRow = {
    id: 1,
    title: 'Test Project',
    description: 'A test project',
    image_url: 'https://example.com/image.jpg',
    technologies: ['React'],
    live_url: null,
    source_code_url: null,
    play_store_url: null,
    app_store_url: null,
    display_order: 0,
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
};

const repo = new ProjectRepository();

beforeEach(() => {
    jest.clearAllMocks();
});

describe('getAllProjects SQL construction', () => {
    it('uses defaults (page 1, limit 10) with no filters', async () => {
        query.mockResolvedValueOnce(pgResult([{ total: 0 }]) as never)
            .mockResolvedValueOnce(pgResult([]) as never);

        await repo.getAllProjects();

        // COUNT query has no WHERE clause
        expect(String(query.mock.calls[0]?.[0])).not.toMatch(/WHERE/i);
        // SELECT has LIMIT 10 OFFSET 0 as the last two params
        const selectCall = query.mock.calls[1];
        expect(selectCall?.[1]).toEqual([10, 0]);
    });

    it('computes offset from page and limit', async () => {
        query.mockResolvedValueOnce(pgResult([{ total: 30 }]) as never)
            .mockResolvedValueOnce(pgResult([]) as never);

        await repo.getAllProjects({ page: 3, limit: 10 });

        const selectCall = query.mock.calls[1];
        expect(selectCall?.[1]).toEqual([10, 20]); // limit 10, offset (3-1)*10
    });

    it('filters by technology with ANY()', async () => {
        query.mockResolvedValueOnce(pgResult([{ total: 1 }]) as never)
            .mockResolvedValueOnce(pgResult([projectRow]) as never);

        await repo.getAllProjects({ technology: 'React' });

        const countCall = query.mock.calls[0];
        expect(String(countCall?.[0])).toMatch(/ANY\(technologies\)/i);
        expect(countCall?.[1]).toEqual(['React']);
    });

    it('filters by search with ILIKE on title and description', async () => {
        query.mockResolvedValueOnce(pgResult([{ total: 0 }]) as never)
            .mockResolvedValueOnce(pgResult([]) as never);

        await repo.getAllProjects({ search: 'portfolio' });

        const countCall = query.mock.calls[0];
        expect(String(countCall?.[0])).toMatch(/title ILIKE/i);
        expect(String(countCall?.[0])).toMatch(/description ILIKE/i);
        expect(countCall?.[1]).toEqual(['%portfolio%']);
    });

    it('combines technology AND search filters', async () => {
        query.mockResolvedValueOnce(pgResult([{ total: 0 }]) as never)
            .mockResolvedValueOnce(pgResult([]) as never);

        await repo.getAllProjects({ technology: 'React', search: 'test' });

        const countCall = query.mock.calls[0];
        expect(String(countCall?.[0])).toMatch(/AND/i);
        expect(countCall?.[1]).toEqual(['React', '%test%']);
    });

    it('returns pagination metadata with totalPages rounded up', async () => {
        query.mockResolvedValueOnce(pgResult([{ total: 25 }]) as never)
            .mockResolvedValueOnce(pgResult([projectRow]) as never);

        const result = await repo.getAllProjects({ page: 1, limit: 10 });

        expect(result.total).toBe(25);
        expect(result.totalPages).toBe(3); // ceil(25/10)
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
    });

    it('maps snake_case rows to camelCase entities', async () => {
        query.mockResolvedValueOnce(pgResult([{ total: 1 }]) as never)
            .mockResolvedValueOnce(pgResult([projectRow]) as never);

        const result = await repo.getAllProjects();

        expect(result.projects[0]).toMatchObject({
            imageUrl: 'https://example.com/image.jpg',
            displayOrder: 0,
            sourceCodeUrl: null,
        });
    });
});

describe('getProjectById', () => {
    it('returns null when not found', async () => {
        query.mockResolvedValueOnce(pgResult([]) as never);

        const result = await repo.getProjectById(999);

        expect(result).toBeNull();
    });

    it('returns the mapped project when found', async () => {
        query.mockResolvedValueOnce(pgResult([projectRow]) as never);

        const result = await repo.getProjectById(1);

        expect(result?.id).toBe(1);
        expect(result?.title).toBe('Test Project');
    });
});

describe('updateProject', () => {
    it('builds SET clause only for provided fields', async () => {
        query.mockResolvedValueOnce(pgResult([projectRow]) as never);

        await repo.updateProject(1, { id: 1, title: 'Updated', displayOrder: 5 });

        const [sql, params] = query.mock.calls[0];
        expect(String(sql)).toMatch(/title = \$1/i);
        expect(String(sql)).toMatch(/display_order = \$2/i);
        expect(String(sql)).not.toMatch(/description =/i);
        expect(params).toEqual(['Updated', 5, 1]); // id last
    });

    it('returns existing project when no fields change', async () => {
        query.mockResolvedValueOnce(pgResult([projectRow]) as never);

        const result = await repo.updateProject(1, { id: 1 });

        // Only the updated_at field → falls back to getProjectById
        expect(result?.id).toBe(1);
    });
});

describe('deleteProject', () => {
    it('returns true when a row was deleted', async () => {
        query.mockResolvedValueOnce(pgResult([], 1) as never);

        expect(await repo.deleteProject(1)).toBe(true);
    });

    it('returns false when nothing was deleted', async () => {
        query.mockResolvedValueOnce(pgResult([], 0) as never);

        expect(await repo.deleteProject(999)).toBe(false);
    });
});
