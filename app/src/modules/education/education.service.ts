import { EducationRepository } from './education.repository';
import { CreateEducationDTO, UpdateEducationDTO } from './education.dto';
import { Education } from './education.entity';

export class EducationService {
    private repository: EducationRepository;

    constructor() {
        this.repository = new EducationRepository();
    }

    async getAllEducations(): Promise<Education[]> {
        return await this.repository.getAllEducations();
    }

    async getEducationById(id: number): Promise<Education | null> {
        return await this.repository.getEducationById(id);
    }

    async createEducation(data: CreateEducationDTO): Promise<Education> {
        return await this.repository.createEducation(data);
    }

    async updateEducation(id: number, data: UpdateEducationDTO): Promise<Education | null> {
        return await this.repository.updateEducation(id, data);
    }

    async deleteEducation(id: number): Promise<boolean> {
        return await this.repository.deleteEducation(id);
    }

    async deleteAllEducations(): Promise<boolean> {
        return await this.repository.deleteAllEducations();
    }
}
