/**
 * Unit tests for the education and experience controllers —
 * covers the validation + atomic imports added in Phase 1.
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

import { createEducation, updateEducation, importEducationsJson } from '@/modules/education/education.controller';
import { createExperience, updateExperience, importExperiencesJson } from '@/modules/experience/experience.controller';

const query = dbService.query as jest.MockedFunction<typeof dbService.query>;

const validEducation = {
    institution: 'University of Technology',
    degree: 'BSc',
    field: 'Computer Science',
    startDate: '2015',
    endDate: '2019',
    displayOrder: 0,
};

const educationRow = {
    id: 1,
    institution: 'University of Technology',
    degree: 'BSc',
    field: 'Computer Science',
    start_date: '2015',
    end_date: '2019',
    display_order: 0,
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
};

const validExperience = {
    company: 'Tech Corp',
    position: 'Software Engineer',
    location: 'Remote',
    startDate: 'Jan 2020',
    endDate: 'Present',
    responsibilities: ['Built features'],
    displayOrder: 0,
};

const experienceRow = {
    id: 1,
    company: 'Tech Corp',
    position: 'Software Engineer',
    location: 'Remote',
    start_date: 'Jan 2020',
    end_date: 'Present',
    responsibilities: ['Built features'],
    display_order: 0,
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
};

const makeForm = (content: unknown, filename: string) => {
    const form = new FormData();
    form.append('file', new File([JSON.stringify(content)], filename, { type: 'application/json' }));
    return form;
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('education controller', () => {
    describe('createEducation', () => {
        it('creates a valid education as admin', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);
            query.mockResolvedValueOnce(pgResult([educationRow]) as never);

            const result = await createEducation(validEducation);

            expect(result.success).toBe(true);
            expect(mockRevalidatePath).toHaveBeenCalledWith('/about');
        });

        it('rejects missing institution', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);

            const result = await createEducation({ ...validEducation, institution: '' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Validation error');
            expect(query).not.toHaveBeenCalled();
        });

        it('rejects when not admin', async () => {
            mockAuth.mockRejectedValueOnce(new Error('Unauthorized'));

            const result = await createEducation(validEducation);

            expect(result.success).toBe(false);
        });
    });

    describe('updateEducation', () => {
        it('updates with partial data', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);
            query.mockResolvedValueOnce(pgResult([educationRow]) as never);

            const result = await updateEducation(1, { degree: 'MSc' });

            expect(result.success).toBe(true);
        });

        it('rejects invalid partial data', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);

            const result = await updateEducation(1, { field: '' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Validation error');
        });
    });

    describe('importEducationsJson', () => {
        it('imports valid data atomically (maps from/to → startDate/endDate)', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);
            query.mockResolvedValueOnce(pgResult([], 1) as never)      // deleteAll
                .mockResolvedValueOnce(pgResult([educationRow]) as never); // insert

            const result = await importEducationsJson(
                makeForm([{ institution: 'Uni', degree: 'BSc', field: 'CS', from: '2015', to: '2019' }], 'educations.json')
            );

            expect(result.success).toBe(true);
            // First query must be the DELETE — validation already passed
            expect(String(query.mock.calls[0]?.[0])).toMatch(/DELETE/i);
            // The insert should use the mapped startDate value
            const insertCall = query.mock.calls[1];
            expect(insertCall?.[1]).toContain('2015');
        });

        it('rejects invalid data WITHOUT deleting existing rows', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);

            const result = await importEducationsJson(
                makeForm([{ institution: '', degree: 'BSc', field: 'CS', from: '2015', to: '2019' }], 'educations.json')
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('Validation error in imported data');
            expect(query).not.toHaveBeenCalled();
        });
    });
});

describe('experience controller', () => {
    describe('createExperience', () => {
        it('creates a valid experience as admin', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);
            query.mockResolvedValueOnce(pgResult([experienceRow]) as never);

            const result = await createExperience(validExperience);

            expect(result.success).toBe(true);
        });

        it('rejects empty responsibilities', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);

            const result = await createExperience({ ...validExperience, responsibilities: [] });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Validation error');
            expect(query).not.toHaveBeenCalled();
        });
    });

    describe('updateExperience', () => {
        it('updates with partial data', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);
            query.mockResolvedValueOnce(pgResult([experienceRow]) as never);

            const result = await updateExperience(1, { position: 'Senior Engineer' });

            expect(result.success).toBe(true);
        });
    });

    describe('importExperiencesJson', () => {
        it('imports valid data atomically', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);
            query.mockResolvedValueOnce(pgResult([], 1) as never)
                .mockResolvedValueOnce(pgResult([experienceRow]) as never);

            const result = await importExperiencesJson(
                makeForm([{
                    company: 'Tech Corp',
                    position: 'SWE',
                    location: 'Remote',
                    from: 'Jan 2020',
                    to: 'Present',
                    responsibilities: ['Built features'],
                }], 'experiences.json')
            );

            expect(result.success).toBe(true);
            expect(String(query.mock.calls[0]?.[0])).toMatch(/DELETE/i);
        });

        it('rejects invalid data WITHOUT deleting existing rows', async () => {
            mockAuth.mockResolvedValueOnce(adminSession);

            const result = await importExperiencesJson(
                makeForm([{
                    company: 'Tech Corp',
                    position: '',  // invalid: empty
                    location: 'Remote',
                    from: 'Jan 2020',
                    to: 'Present',
                    responsibilities: ['Built features'],
                }], 'experiences.json')
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('Validation error in imported data');
            expect(query).not.toHaveBeenCalled();
        });
    });
});
