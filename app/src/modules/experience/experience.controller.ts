'use server';

import { ExperienceService } from './experience.service';
import { type CreateExperienceDTO, type UpdateExperienceDTO } from './experience.dto';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';
import { createExperienceSchema, updateExperienceSchema } from '@/lib/validation';
import { z, ZodError } from 'zod';

const experienceService = new ExperienceService();

export async function getAllExperiences() {
    try {
        const experiences = await experienceService.getAllExperiences();
        return { success: true, data: experiences };
    } catch (error) {
        console.error('Failed to fetch experiences:', error);
        return { success: false, error: 'Failed to fetch experiences' };
    }
}

export async function createExperience(data: CreateExperienceDTO) {
    try {
        await isAdmin();
        const validatedData = createExperienceSchema.parse(data);
        const experience = await experienceService.createExperience(validatedData);
        revalidatePath('/about');
        revalidatePath('/admin/experience');
        return { success: true, data: experience };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Validation error', details: error.message };
        }
        console.error('Failed to create experience:', error);
        return { success: false, error: 'Failed to create experience' };
    }
}

export async function updateExperience(id: number, data: UpdateExperienceDTO) {
    try {
        await isAdmin();
        const validatedData = updateExperienceSchema.parse(data);
        const experience = await experienceService.updateExperience(id, validatedData);
        revalidatePath('/about');
        revalidatePath('/admin/experience');
        return { success: true, data: experience };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Validation error', details: error.message };
        }
        console.error('Failed to update experience:', error);
        return { success: false, error: 'Failed to update experience' };
    }
}

export async function deleteExperience(id: number) {
    try {
        await isAdmin();
        const success = await experienceService.deleteExperience(id);
        revalidatePath('/about');
        revalidatePath('/admin/experience');
        return { success: true, data: success };
    } catch (error) {
        console.error('Failed to delete experience:', error);
        return { success: false, error: 'Failed to delete experience' };
    }
}

export async function deleteAllExperiences() {
    try {
        await isAdmin();
        const success = await experienceService.deleteAllExperiences();
        revalidatePath('/about');
        revalidatePath('/admin/experience');
        return { success: true, data: success };
    } catch (error) {
        console.error('Failed to delete all experiences:', error);
        return { success: false, error: 'Failed to delete all experiences' };
    }
}

export async function importExperiencesJson(formData: FormData) {
    try {
        await isAdmin();
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const text = await file.text();
        const experiences = JSON.parse(text);

        if (!Array.isArray(experiences)) {
            return { success: false, error: 'Invalid JSON format: expected an array' };
        }

        // Validate and map the ENTIRE array BEFORE deleting existing data,
        // so a bad entry can't wipe the table and leave it half-imported
        const validatedExperiences = z.array(createExperienceSchema).parse(
            experiences.map((exp: { company: string; position: string; location: string; from: string; to: string; responsibilities: string[] }) => ({
                company: exp.company,
                position: exp.position,
                location: exp.location,
                startDate: exp.from, // Map 'from' to 'startDate'
                endDate: exp.to,     // Map 'to' to 'endDate'
                responsibilities: exp.responsibilities,
                displayOrder: 0,     // Default order
            }))
        );

        // Delete existing experiences only after all entries passed validation
        await experienceService.deleteAllExperiences();

        // Create new experiences
        for (const exp of validatedExperiences) {
            await experienceService.createExperience(exp);
        }

        revalidatePath('/about');
        revalidatePath('/admin/experience');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Validation error in imported data', details: error.message };
        }
        console.error('Failed to import experiences:', error);
        return { success: false, error: 'Failed to import experiences' };
    }
}
