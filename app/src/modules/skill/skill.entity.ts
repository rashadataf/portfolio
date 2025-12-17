export enum SkillCategory {
    Proficient = 'Proficient',
    Familiar = 'Familiar'
}

export interface Skill {
    id: number;
    name: string;
    percentage: number;
    category: SkillCategory;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export class SkillEntity {
    static tableName = 'skills';

    static createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${SkillEntity.tableName} (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
            category VARCHAR(50) NOT NULL,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    static initializeTable() {
        return [
            SkillEntity.createTableQuery,
            // Initial data seeding can be added here if needed
        ];
    }
}
