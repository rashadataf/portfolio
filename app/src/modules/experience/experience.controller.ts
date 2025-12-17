'use server';

import { ExperienceService } from './experience.service';
import { CreateExperienceDTO, UpdateExperienceDTO } from './experience.dto';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';

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
        const experience = await experienceService.createExperience(data);
        revalidatePath('/about');
        revalidatePath('/admin/experience');
        return { success: true, data: experience };
    } catch (error) {
        console.error('Failed to create experience:', error);
        return { success: false, error: 'Failed to create experience' };
    }
}

export async function updateExperience(id: number, data: UpdateExperienceDTO) {
    try {
        await isAdmin();
        const experience = await experienceService.updateExperience(id, data);
        revalidatePath('/about');
        revalidatePath('/admin/experience');
        return { success: true, data: experience };
    } catch (error) {
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

        // Delete existing experiences
        await experienceService.deleteAllExperiences();

        // Create new experiences
        for (const exp of experiences) {
            await experienceService.createExperience({
                company: exp.company,
                position: exp.position,
                location: exp.location,
                startDate: exp.from, // Map 'from' to 'startDate'
                endDate: exp.to,     // Map 'to' to 'endDate'
                responsibilities: exp.responsibilities,
                displayOrder: 0 // Default order
            });
        }

        revalidatePath('/about');
        revalidatePath('/admin/experience');
        return { success: true };
    } catch (error) {
        console.error('Failed to import experiences:', error);
        return { success: false, error: 'Failed to import experiences' };
    }
}
