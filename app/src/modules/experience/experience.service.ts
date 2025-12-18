import { ExperienceRepository } from './experience.repository';
import { CreateExperienceDTO, UpdateExperienceDTO } from './experience.dto';
import { Experience } from './experience.entity';

export class ExperienceService {
    private repository: ExperienceRepository;

    constructor() {
        this.repository = new ExperienceRepository();
    }

    async getAllExperiences(): Promise<Experience[]> {
        return await this.repository.getAllExperiences();
    }

    async getExperienceById(id: number): Promise<Experience | null> {
        return await this.repository.getExperienceById(id);
    }

    async createExperience(data: CreateExperienceDTO): Promise<Experience> {
        return await this.repository.createExperience(data);
    }

    async updateExperience(id: number, data: UpdateExperienceDTO): Promise<Experience | null> {
        return await this.repository.updateExperience(id, data);
    }

    async deleteExperience(id: number): Promise<boolean> {
        return await this.repository.deleteExperience(id);
    }

    async deleteAllExperiences(): Promise<boolean> {
        return await this.repository.deleteAllExperiences();
    }
}
