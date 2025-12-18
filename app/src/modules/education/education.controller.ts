'use server';

import { EducationService } from './education.service';
import { CreateEducationDTO, UpdateEducationDTO } from './education.dto';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';

const educationService = new EducationService();

export async function getAllEducations() {
    try {
        const educations = await educationService.getAllEducations();
        return { success: true, data: educations };
    } catch (error) {
        console.error('Failed to fetch educations:', error);
        return { success: false, error: 'Failed to fetch educations' };
    }
}

export async function createEducation(data: CreateEducationDTO) {
    try {
        await isAdmin();
        const education = await educationService.createEducation(data);
        revalidatePath('/about');
        revalidatePath('/admin/education');
        return { success: true, data: education };
    } catch (error) {
        console.error('Failed to create education:', error);
        return { success: false, error: 'Failed to create education' };
    }
}

export async function updateEducation(id: number, data: UpdateEducationDTO) {
    try {
        await isAdmin();
        const education = await educationService.updateEducation(id, data);
        revalidatePath('/about');
        revalidatePath('/admin/education');
        return { success: true, data: education };
    } catch (error) {
        console.error('Failed to update education:', error);
        return { success: false, error: 'Failed to update education' };
    }
}

export async function deleteEducation(id: number) {
    try {
        await isAdmin();
        const success = await educationService.deleteEducation(id);
        revalidatePath('/about');
        revalidatePath('/admin/education');
        return { success: true, data: success };
    } catch (error) {
        console.error('Failed to delete education:', error);
        return { success: false, error: 'Failed to delete education' };
    }
}

export async function deleteAllEducations() {
    try {
        await isAdmin();
        const success = await educationService.deleteAllEducations();
        revalidatePath('/about');
        revalidatePath('/admin/education');
        return { success: true, data: success };
    } catch (error) {
        console.error('Failed to delete all educations:', error);
        return { success: false, error: 'Failed to delete all educations' };
    }
}

export async function importEducationsJson(formData: FormData) {
    try {
        await isAdmin();
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const text = await file.text();
        const educations = JSON.parse(text);

        if (!Array.isArray(educations)) {
            return { success: false, error: 'Invalid JSON format: expected an array' };
        }

        // Delete existing educations
        await educationService.deleteAllEducations();

        // Create new educations
        for (const edu of educations) {
            await educationService.createEducation({
                institution: edu.institution,
                degree: edu.degree,
                field: edu.field,
                startDate: edu.from, // Map 'from' to 'startDate'
                endDate: edu.to,     // Map 'to' to 'endDate'
                displayOrder: 0 // Default order
            });
        }

        revalidatePath('/about');
        revalidatePath('/admin/education');
        return { success: true };
    } catch (error) {
        console.error('Failed to import educations:', error);
        return { success: false, error: 'Failed to import educations' };
    }
}
