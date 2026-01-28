'use server';

import { ProfileService } from './profile.service';
import { UpdateProfileDTO } from './profile.dto';
import { revalidatePath } from 'next/cache';

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
        const profile = await profileService.updateProfile(slug, data);
        // Revalidate the pages that depend on profile data
        revalidatePath('/');
        revalidatePath('/about');
        return { success: true, data: profile };
    } catch (error) {
        console.error('Failed to update profile:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}
