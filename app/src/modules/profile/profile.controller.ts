'use server';

import { ProfileService } from './profile.service';
import { type UpdateProfileDTO } from './profile.dto';
import { revalidatePath } from 'next/cache';
import { updateProfileSchema } from '@/lib/validation';
import { ZodError } from 'zod';

const profileService = new ProfileService();

export async function getProfile(slug: string = 'main') {
    try {
        const profile = await profileService.getProfile(slug);
        return { success: true, data: profile };
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return { success: false, error: 'Failed to fetch profile' };
    }
}

export async function updateProfile(slug: string, data: UpdateProfileDTO) {
    try {
        const validatedData = updateProfileSchema.parse(data);
        const profile = await profileService.updateProfile(slug, validatedData);
        revalidatePath('/');
        return { success: true, data: profile };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Validation error', details: error.message };
        }
        console.error('Failed to update profile:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}
