import { SkillRepository } from './skill.repository';
import { CreateSkillDTO, UpdateSkillDTO } from './skill.dto';
import { Skill } from './skill.entity';

export class SkillService {
    private repository: SkillRepository;

    constructor() {
        this.repository = new SkillRepository();
    }

    async getAllSkills(): Promise<Skill[]> {
        return await this.repository.getAllSkills();
    }

    async getSkillById(id: number): Promise<Skill | null> {
        return await this.repository.getSkillById(id);
    }

    async createSkill(data: CreateSkillDTO): Promise<Skill> {
        return await this.repository.createSkill(data);
    }

    async bulkCreateSkills(skills: CreateSkillDTO[]): Promise<void> {
        for (const skill of skills) {
            await this.repository.createSkill(skill);
        }
    }

    async updateSkill(id: number, data: UpdateSkillDTO): Promise<Skill | null> {
        return await this.repository.updateSkill(id, data);
    }

    async deleteSkill(id: number): Promise<boolean> {
        return await this.repository.deleteSkill(id);
    }

    async deleteAllSkills(): Promise<boolean> {
        return await this.repository.deleteAllSkills();
    }
}
