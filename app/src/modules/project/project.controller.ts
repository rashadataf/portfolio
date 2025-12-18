'use server';

import { ProjectService } from './project.service';
import { CreateProjectDTO, UpdateProjectDTO } from './project.dto';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';

const projectService = new ProjectService();

export async function getAllProjects() {
    try {
        const projects = await projectService.getAllProjects();
        return { success: true, data: projects };
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return { success: false, error: 'Failed to fetch projects' };
    }
}

export async function createProject(data: CreateProjectDTO) {
    try {
        await isAdmin();
        const project = await projectService.createProject(data);
        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true, data: project };
    } catch (error) {
        console.error('Failed to create project:', error);
        return { success: false, error: 'Failed to create project' };
    }
}

export async function updateProject(id: number, data: UpdateProjectDTO) {
    try {
        await isAdmin();
        const project = await projectService.updateProject(id, data);
        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true, data: project };
    } catch (error) {
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

        // Delete existing projects
        await projectService.deleteAllProjects();

        // Create new projects
        for (const project of projects) {
            await projectService.createProject({
                title: project.title,
                description: project.description,
                imageUrl: project.imageUrl,
                technologies: project.technologies,
                liveUrl: project.liveUrl,
                sourceCodeUrl: project.sourceCodeUrl,
                playStoreUrl: project.playStoreUrl,
                appStoreUrl: project.appStoreUrl,
                displayOrder: 0
            });
        }

        revalidatePath('/projects');
        revalidatePath('/admin/projects');
        return { success: true };
    } catch (error) {
        console.error('Failed to import projects:', error);
        return { success: false, error: 'Failed to import projects' };
    }
}
