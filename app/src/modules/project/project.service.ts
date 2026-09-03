import { ProjectRepository } from './project.repository';
import { type CreateProjectDTO, type UpdateProjectDTO } from './project.dto';
import { type Project } from './project.entity';

export class ProjectService {
    private repository: ProjectRepository;

    constructor() {
        this.repository = new ProjectRepository();
    }

    async getAllProjects(filters?: { page?: number; limit?: number; technology?: string; search?: string }): Promise<{ projects: Project[]; total: number; page: number; limit: number; totalPages: number }> {
        return await this.repository.getAllProjects(filters);
    }

    async getProjectById(id: number): Promise<Project | null> {
        return await this.repository.getProjectById(id);
    }

    async createProject(data: CreateProjectDTO): Promise<Project> {
        return await this.repository.createProject(data);
    }

    async updateProject(id: number, data: UpdateProjectDTO): Promise<Project | null> {
        return await this.repository.updateProject(id, data);
    }

    async deleteProject(id: number): Promise<boolean> {
        return await this.repository.deleteProject(id);
    }

    async deleteAllProjects(): Promise<boolean> {
        return await this.repository.deleteAllProjects();
    }
}
