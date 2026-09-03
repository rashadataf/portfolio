'use server';

import { EducationService } from './education.service';
import { type CreateEducationDTO, type UpdateEducationDTO } from './education.dto';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';
import { createEducationSchema, updateEducationSchema } from '@/lib/validation';
import { z, ZodError } from 'zod';

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
        const validatedData = createEducationSchema.parse(data);
        const education = await educationService.createEducation(validatedData);
        revalidatePath('/about');
        revalidatePath('/admin/education');
        return { success: true, data: education };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Validation error', details: error.message };
        }
        console.error('Failed to create education:', error);
        return { success: false, error: 'Failed to create education' };
    }
}

export async function updateEducation(id: number, data: UpdateEducationDTO) {
    try {
        await isAdmin();
        const validatedData = updateEducationSchema.parse(data);
        const education = await educationService.updateEducation(id, validatedData);
        revalidatePath('/about');
        revalidatePath('/admin/education');
        return { success: true, data: education };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Validation error', details: error.message };
        }
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

        // Validate and map the ENTIRE array BEFORE deleting existing data,
        // so a bad entry can't wipe the table and leave it half-imported
        const validatedEducations = z.array(createEducationSchema).parse(
            educations.map((edu: { institution: string; degree: string; field: string; from: string; to: string }) => ({
                institution: edu.institution,
                degree: edu.degree,
                field: edu.field,
                startDate: edu.from, // Map 'from' to 'startDate'
                endDate: edu.to,     // Map 'to' to 'endDate'
                displayOrder: 0,     // Default order
            }))
        );

        // Delete existing educations only after all entries passed validation
        await educationService.deleteAllEducations();

        // Create new educations
        for (const edu of validatedEducations) {
            await educationService.createEducation(edu);
        }

        revalidatePath('/about');
        revalidatePath('/admin/education');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Validation error in imported data', details: error.message };
        }
        console.error('Failed to import educations:', error);
        return { success: false, error: 'Failed to import educations' };
    }
}
