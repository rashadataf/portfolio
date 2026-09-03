'use server';

import { ProjectService } from './project.service';
import { type CreateProjectDTO, type UpdateProjectDTO } from './project.dto';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';
import { createProjectSchema, updateProjectSchema, projectQuerySchema } from '@/lib/validation';
import { z, ZodError } from 'zod';

const projectService = new ProjectService();

export async function getAllProjects(params?: { page?: number; limit?: number; technology?: string; search?: string }) {
    try {
        const { page, limit, ...filters } = projectQuerySchema.parse(params || {});
        const { projects, total, totalPages } = await projectService.getAllProjects({ page, limit, ...filters });
        return { success: true, data: projects, pagination: { page, limit, total, totalPages } };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Invalid query parameters', details: error.message };
        }
        console.error('Failed to fetch projects:', error);
        return { success: false, error: 'Failed to fetch projects' };
    }
}

export async function createProject(data: CreateProjectDTO) {
    try {
        await isAdmin();
        
        // Validate input data
        const validatedData = createProjectSchema.parse(data);
        
        const project = await projectService.createProject(validatedData);
        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true, data: project };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Validation error', details: error.message };
        }
        console.error('Failed to create project:', error);
        return { success: false, error: 'Failed to create project' };
    }
}

export async function updateProject(id: number, data: UpdateProjectDTO) {
    try {
        await isAdmin();
        
        // Validate input data
        const validatedData = updateProjectSchema.parse(data);
        
        const project = await projectService.updateProject(id, { ...validatedData, id });
        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true, data: project };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Validation error', details: error.message };
        }
        console.error('Failed to update project:', error);
        return { success: false, error: 'Failed to update project' };
    }
}

export async function deleteProject(id: number) {
    try {
        await isAdmin();
        const success = await projectService.deleteProject(id);
        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true, data: success };
    } catch (error) {
        console.error('Failed to delete project:', error);
        return { success: false, error: 'Failed to delete project' };
    }
}

export async function deleteAllProjects() {
    try {
        await isAdmin();
        const success = await projectService.deleteAllProjects();
        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true, data: success };
    } catch (error) {
        console.error('Failed to delete all projects:', error);
        return { success: false, error: 'Failed to delete all projects' };
    }
}

export async function importProjectsJson(formData: FormData) {
    try {
        await isAdmin();
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const text = await file.text();
        const projects = JSON.parse(text);

        if (!Array.isArray(projects)) {
            return { success: false, error: 'Invalid JSON format: expected an array' };
        }

        // Validate the ENTIRE array BEFORE deleting existing data,
        // so a bad entry can't wipe the table and leave it half-imported
        const validatedProjects = z.array(createProjectSchema).parse(
            projects.map((project: {
                title: string;
                description: string;
                imageUrl: string;
                technologies: string[];
                liveUrl?: string;
                sourceCodeUrl?: string;
                playStoreUrl?: string;
                appStoreUrl?: string;
            }) => ({
                title: project.title,
                description: project.description,
                imageUrl: project.imageUrl,
                technologies: project.technologies,
                liveUrl: project.liveUrl,
                sourceCodeUrl: project.sourceCodeUrl,
                playStoreUrl: project.playStoreUrl,
                appStoreUrl: project.appStoreUrl,
                displayOrder: 0,
            }))
        );

        // Delete existing projects only after all entries passed validation
        await projectService.deleteAllProjects();

        // Create new projects
        for (const project of validatedProjects) {
            await projectService.createProject(project);
        }

        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error: 'Validation error in imported data', details: error.message };
        }
        console.error('Failed to import projects:', error);
        return { success: false, error: 'Failed to import projects' };
    }
}
