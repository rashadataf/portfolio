import { dbService } from '@/modules/db/db.service';
import { Skill, SkillEntity, SkillCategory } from './skill.entity';
import { CreateSkillDTO, UpdateSkillDTO } from './skill.dto';

interface SkillRow {
    id: number;
    name: string;
    percentage: number;
    category: string;
    display_order: number;
    created_at: Date;
    updated_at: Date;
}

export class SkillRepository {
    private mapToEntity(row: SkillRow): Skill {
        return {
            id: row.id,
            name: row.name,
            percentage: row.percentage,
            category: row.category as SkillCategory,
            displayOrder: row.display_order,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    async getAllSkills(): Promise<Skill[]> {
        const query = `SELECT * FROM ${SkillEntity.tableName} ORDER BY display_order ASC, created_at DESC`;
        const result = await dbService.query(query);
        return result.rows.map((row) => this.mapToEntity(row as SkillRow));
    }

    async getSkillById(id: number): Promise<Skill | null> {
        const query = `SELECT * FROM ${SkillEntity.tableName} WHERE id = $1`;
        const result = await dbService.query(query, [id]);
        if (result.rows.length === 0) return null;
        return this.mapToEntity(result.rows[0] as SkillRow);
    }

    async createSkill(data: CreateSkillDTO): Promise<Skill> {
        const query = `
            INSERT INTO ${SkillEntity.tableName} (name, percentage, category, display_order)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [
            data.name,
            data.percentage,
            data.category,
            data.displayOrder || 0
        ];
        const result = await dbService.query(query, values);
        return this.mapToEntity(result.rows[0] as SkillRow);
    }

    async updateSkill(id: number, data: UpdateSkillDTO): Promise<Skill | null> {
        const fields: string[] = [];
        const values: (string | number)[] = [];
        let paramIndex = 1;

        if (data.name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(data.name);
        }
        if (data.percentage !== undefined) {
            fields.push(`percentage = $${paramIndex++}`);
            values.push(data.percentage);
        }
        if (data.category !== undefined) {
            fields.push(`category = $${paramIndex++}`);
            values.push(data.category);
        }
        if (data.displayOrder !== undefined) {
            fields.push(`display_order = $${paramIndex++}`);
            values.push(data.displayOrder);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        const query = `
            UPDATE ${SkillEntity.tableName}
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        values.push(id);

        const result = await dbService.query(query, values);
        if (result.rows.length === 0) return null;
        return this.mapToEntity(result.rows[0] as SkillRow);
    }

    async deleteSkill(id: number): Promise<boolean> {
        const query = `DELETE FROM ${SkillEntity.tableName} WHERE id = $1`;
        const result = await dbService.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async deleteAllSkills(): Promise<boolean> {
        const query = `DELETE FROM ${SkillEntity.tableName}`;
        await dbService.query(query);
        return true;
    }
}
