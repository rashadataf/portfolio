'use server';

import { SkillService } from './skill.service';
import { CreateSkillDTO, UpdateSkillDTO } from './skill.dto';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';

const skillService = new SkillService();

export async function getAllSkills() {
    try {
        const skills = await skillService.getAllSkills();
        return { success: true, data: skills };
    } catch (error) {
        console.error('Failed to fetch skills:', error);
        return { success: false, error: 'Failed to fetch skills' };
    }
}

export async function createSkill(data: CreateSkillDTO) {
    try {
        await isAdmin();
        const skill = await skillService.createSkill(data);
        revalidatePath('/about');
        revalidatePath('/admin/skills');
        return { success: true, data: skill };
    } catch (error) {
        console.error('Failed to create skill:', error);
        return { success: false, error: 'Failed to create skill' };
    }
}

export async function importSkillsJson(formData: FormData) {
    try {
        await isAdmin();
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file uploaded' };
        }

        const text = await file.text();
        let skills: CreateSkillDTO[];
        try {
            skills = JSON.parse(text);
        } catch {
            return { success: false, error: 'Invalid JSON file' };
        }

        if (!Array.isArray(skills)) {
            return { success: false, error: 'JSON must be an array of skills' };
        }

        await skillService.bulkCreateSkills(skills);
        revalidatePath('/about');
        revalidatePath('/admin/skills');
        return { success: true };
    } catch (error) {
        console.error('Failed to import skills:', error);
        return { success: false, error: 'Failed to import skills' };
    }
}

export async function updateSkill(id: number, data: UpdateSkillDTO) {
    try {
        await isAdmin();
        const skill = await skillService.updateSkill(id, data);
        revalidatePath('/about');
        revalidatePath('/admin/skills');
        return { success: true, data: skill };
    } catch (error) {
        console.error('Failed to update skill:', error);
        return { success: false, error: 'Failed to update skill' };
    }
}

export async function deleteSkill(id: number) {
    try {
        await isAdmin();
        const success = await skillService.deleteSkill(id);
        revalidatePath('/about');
        revalidatePath('/admin/skills');
        return { success: true, data: success };
    } catch (error) {
        console.error('Failed to delete skill:', error);
        return { success: false, error: 'Failed to delete skill' };
    }
}

export async function deleteAllSkills() {
    try {
        await isAdmin();
        const success = await skillService.deleteAllSkills();
        revalidatePath('/about');
        revalidatePath('/admin/skills');
        return { success: true, data: success };
    } catch (error) {
        console.error('Failed to delete all skills:', error);
        return { success: false, error: 'Failed to delete all skills' };
    }
}
