/**
 * Unit tests for the skill controller — covers the validation added in Phase 1
 * (create/update validation + atomic JSON import).
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

import { getAllSkills, createSkill, updateSkill, importSkillsJson } from '@/modules/skill/skill.controller';

const query = dbService.query as jest.MockedFunction<typeof dbService.query>;

const validSkill = {
    name: 'React',
    percentage: 90,
    category: 'Proficient' as const,
    displayOrder: 1,
};

const skillRow = {
    id: 1,
    name: 'React',
    percentage: 90,
    category: 'Proficient',
    display_order: 1,
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('getAllSkills', () => {
    it('returns skills mapped to camelCase entities', async () => {
        query.mockResolvedValueOnce(pgResult([skillRow]) as never);

        const result = await getAllSkills();

        expect(result.success).toBe(true);
        expect(result.data?.[0].displayOrder).toBe(1);
        expect(result.data?.[0].category).toBe('Proficient');
    });

    it('returns failure on db error', async () => {
        query.mockRejectedValueOnce(new Error('boom') as never);

        const result = await getAllSkills();

        expect(result.success).toBe(false);
    });
});

describe('createSkill', () => {
    it('creates a valid skill as admin', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);
        query.mockResolvedValueOnce(pgResult([skillRow]) as never);

        const result = await createSkill(validSkill);

        expect(result.success).toBe(true);
        expect(mockRevalidatePath).toHaveBeenCalledWith('/about');
    });

    it('rejects percentage above 100', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await createSkill({ ...validSkill, percentage: 150 });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Validation error');
        expect(query).not.toHaveBeenCalled();
    });

    it('rejects invalid category', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await createSkill({ ...validSkill, category: 'Expert' as never });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Validation error');
    });

    it('rejects when not admin', async () => {
        mockAuth.mockRejectedValueOnce(new Error('Unauthorized'));

        const result = await createSkill(validSkill);

        expect(result.success).toBe(false);
        expect(query).not.toHaveBeenCalled();
    });
});

describe('updateSkill', () => {
    it('updates with partial data', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);
        query.mockResolvedValueOnce(pgResult([skillRow]) as never);

        const result = await updateSkill(1, { percentage: 95 });

        expect(result.success).toBe(true);
    });

    it('rejects invalid partial data', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await updateSkill(1, { percentage: -5 });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Validation error');
    });
});

describe('importSkillsJson', () => {
    const makeForm = (content: unknown) => {
        const form = new FormData();
        form.append('file', new File([JSON.stringify(content)], 'skills.json', { type: 'application/json' }));
        return form;
    };

    it('imports a valid array', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);
        query.mockResolvedValue(pgResult([skillRow]) as never); // each insert

        const result = await importSkillsJson(makeForm([validSkill, { ...validSkill, name: 'Next.js' }]));

        expect(result.success).toBe(true);
        expect(query).toHaveBeenCalledTimes(2); // two inserts
    });

    it('rejects an invalid entry without inserting anything', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await importSkillsJson(
            makeForm([validSkill, { ...validSkill, percentage: 200 }])
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe('Validation error in imported data');
        expect(query).not.toHaveBeenCalled();
    });

    it('rejects malformed JSON', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const form = new FormData();
        form.append('file', new File(['{not valid json'], 'skills.json', { type: 'application/json' }));

        const result = await importSkillsJson(form);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid JSON file');
    });

    it('rejects when no file provided', async () => {
        mockAuth.mockResolvedValueOnce(adminSession);

        const result = await importSkillsJson(new FormData());

        expect(result.success).toBe(false);
        expect(result.error).toBe('No file uploaded');
    });
});
