/**
 * Unit tests for the project controller.
 *
 * The db service is mocked so no real Postgres connection is made.
 * `@/lib/auth` is mocked to control the admin session.
 */
import { ZodError } from 'zod';
import { dbService } from '@/modules/db/db.service';
import { pgResult, adminSession } from './helpers/test-utils';

// ── Module mocks ────────────────────────────────────────────────────────
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

// Import AFTER mocks are declared
import {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    importProjectsJson,
} from '@/modules/project/project.controller';

const query = dbService.query as jest.MockedFunction<typeof dbService.query>;

const validProject = {
    title: 'Test Project',
    description: 'A test project',
    imageUrl: 'https://example.com/image.jpg',
    technologies: ['React', 'TypeScript'],
    liveUrl: 'https://example.com',
    displayOrder: 1,
};

const projectRow = {
    id: 1,
    title: 'Test Project',
    description: 'A test project',
    image_url: 'https://example.com/image.jpg',
    technologies: ['React', 'TypeScript'],
    live_url: 'https://example.com',
    source_code_url: null,
    play_store_url: null,
    app_store_url: null,
    display_order: 1,
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('getAllProjects', () => {
    it('returns projects with pagination metadata', async () => {
        // First call = COUNT query, second = SELECT
        query.mockResolvedValueOnce(pgResult([{ total: 1 }]) as never)
            .mockResolvedValueOnce(pgResult([projectRow]) as never);

        const result = await getAllProjects({ page: 1, limit: 10 });

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data?.[0].imageUrl).toBe('https://example.com/image.jpg');
        expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });

    it('rejects invalid query params (limit 0)', async () => {
        const result = await getAllProjects({ limit: 0 });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid query parameters');
        expect(query).not.toHaveBeenCalled();
    });

    it('returns failure on db error', async () => {
        query.mockRejectedValueOnce(new Error('connection refused') as never);

        const result = await getAllProjects();

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to fetch projects');
    });
});

describe('createProject', () => {
    it('creates a project when admin and input is valid', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);
        query.mockResolvedValueOnce(pgResult([projectRow]) as never);

        const result = await createProject(validProject);

        expect(result.success).toBe(true);
        expect(mockRevalidatePath).toHaveBeenCalledWith('/projects');
        expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/projects');
    });

    it('rejects when not admin', async () => {
        mockAuth.mockRejectedValueOnce(new Error('Unauthorized'));

        const result = await createProject(validProject);

        expect(result.success).toBe(false);
        expect(query).not.toHaveBeenCalled();
    });

    it('returns validation error for invalid input', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await createProject({ ...validProject, imageUrl: 'not-a-url' });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Validation error');
        expect(query).not.toHaveBeenCalled();
    });

    it('rejects empty technologies array', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await createProject({ ...validProject, technologies: [] });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Validation error');
    });
});

describe('updateProject', () => {
    it('updates with partial data', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);
        query.mockResolvedValueOnce(pgResult([projectRow]) as never);

        const result = await updateProject(1, { id: 1, title: 'Updated' });

        expect(result.success).toBe(true);
        // UPDATE query should contain the id as the last param
        const call = query.mock.calls[0];
        expect(call?.[1]).toContain(1);
    });

    it('returns validation error for invalid partial data', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await updateProject(1, { id: 1, liveUrl: 'not-a-url' });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Validation error');
    });
});

describe('deleteProject', () => {
    it('deletes when admin', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);
        query.mockResolvedValueOnce(pgResult([], 1) as never);

        const result = await deleteProject(1);

        expect(result.success).toBe(true);
    });

    it('reports failure when nothing was deleted', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);
        query.mockResolvedValueOnce(pgResult([], 0) as never);

        const result = await deleteProject(999);

        expect(result.success).toBe(true);
        expect(result.data).toBe(false);
    });
});

describe('importProjectsJson', () => {
    const makeForm = (content: unknown) => {
        const form = new FormData();
        form.append('file', new File([JSON.stringify(content)], 'projects.json', { type: 'application/json' }));
        return form;
    };

    it('imports a valid array atomically (validates before deleting)', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);
        // deleteAll + 2 inserts
        query.mockResolvedValueOnce(pgResult([], 2) as never)   // deleteAllProjects
            .mockResolvedValueOnce(pgResult([projectRow]) as never) // insert 1
            .mockResolvedValueOnce(pgResult([{ ...projectRow, id: 2 }]) as never); // insert 2

        const result = await importProjectsJson(makeForm([validProject, { ...validProject, title: 'Second' }]));

        expect(result.success).toBe(true);
        // First query must be the DELETE (validation already passed)
        expect(String(query.mock.calls[0]?.[0])).toMatch(/DELETE/i);
    });

    it('rejects an invalid entry WITHOUT deleting existing data', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await importProjectsJson(
            makeForm([validProject, { ...validProject, imageUrl: 'not-a-url' }])
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe('Validation error in imported data');
        // Critical: no query should have run — existing data untouched
        expect(query).not.toHaveBeenCalled();
    });

    it('rejects non-array JSON', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await importProjectsJson(makeForm({ not: 'an array' }));

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid JSON format: expected an array');
        expect(query).not.toHaveBeenCalled();
    });

    it('rejects when no file provided', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const emptyForm = new FormData();
        const result = await importProjectsJson(emptyForm);

        expect(result.success).toBe(false);
        expect(result.error).toBe('No file provided');
    });
});

describe('ZodError handling', () => {
    it('validation errors are caught and returned, never thrown', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await createProject({ ...validProject, title: '' });

        // The controller must catch the ZodError, not rethrow it
        expect(result.success).toBe(false);
        expect(result.error).toBe('Validation error');
    });
});
