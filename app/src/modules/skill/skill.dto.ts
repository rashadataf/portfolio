import { SkillCategory } from "./skill.entity";

export interface CreateSkillDTO {
    name: string;
    percentage: number;
    category: SkillCategory;
    displayOrder?: number;
}

export interface UpdateSkillDTO {
    name?: string;
    percentage?: number;
    category?: SkillCategory;
    displayOrder?: number;
}
