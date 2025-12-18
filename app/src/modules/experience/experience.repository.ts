import { dbService } from '@/modules/db/db.service';
import { Experience, ExperienceEntity } from './experience.entity';
import { CreateExperienceDTO, UpdateExperienceDTO } from './experience.dto';

interface ExperienceRow {
    id: number;
    company: string;
    position: string;
    location: string;
    start_date: string;
    end_date: string;
    responsibilities: string[];
    display_order: number;
    created_at: Date;
    updated_at: Date;
}

export class ExperienceRepository {
    private mapToEntity(row: ExperienceRow): Experience {
        return {
            id: row.id,
            company: row.company,
            position: row.position,
            location: row.location,
            startDate: row.start_date,
            endDate: row.end_date,
            responsibilities: row.responsibilities,
            displayOrder: row.display_order,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    async getAllExperiences(): Promise<Experience[]> {
        const query = `SELECT * FROM ${ExperienceEntity.tableName} ORDER BY display_order ASC, created_at DESC`;
        const result = await dbService.query(query);
        return result.rows.map((row) => this.mapToEntity(row as ExperienceRow));
    }

    async getExperienceById(id: number): Promise<Experience | null> {
        const query = `SELECT * FROM ${ExperienceEntity.tableName} WHERE id = $1`;
        const result = await dbService.query(query, [id]);
        if (result.rows.length === 0) return null;
        return this.mapToEntity(result.rows[0] as ExperienceRow);
    }

    async createExperience(data: CreateExperienceDTO): Promise<Experience> {
        const query = `
            INSERT INTO ${ExperienceEntity.tableName} (company, position, location, start_date, end_date, responsibilities, display_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            data.company,
            data.position,
            data.location,
            data.startDate,
            data.endDate,
            data.responsibilities,
            data.displayOrder || 0
        ];
        const result = await dbService.query(query, values);
        return this.mapToEntity(result.rows[0] as ExperienceRow);
    }

    async updateExperience(id: number, data: UpdateExperienceDTO): Promise<Experience | null> {
        const fields: string[] = [];
        const values: (string | number | string[])[] = [];
        let paramIndex = 1;

        if (data.company !== undefined) {
            fields.push(`company = $${paramIndex++}`);
            values.push(data.company);
        }
        if (data.position !== undefined) {
            fields.push(`position = $${paramIndex++}`);
            values.push(data.position);
        }
        if (data.location !== undefined) {
            fields.push(`location = $${paramIndex++}`);
            values.push(data.location);
        }
        if (data.startDate !== undefined) {
            fields.push(`start_date = $${paramIndex++}`);
            values.push(data.startDate);
        }
        if (data.endDate !== undefined) {
            fields.push(`end_date = $${paramIndex++}`);
            values.push(data.endDate);
        }
        if (data.responsibilities !== undefined) {
            fields.push(`responsibilities = $${paramIndex++}`);
            values.push(data.responsibilities);
        }
        if (data.displayOrder !== undefined) {
            fields.push(`display_order = $${paramIndex++}`);
            values.push(data.displayOrder);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        const query = `
            UPDATE ${ExperienceEntity.tableName}
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        values.push(id);

        const result = await dbService.query(query, values);
        if (result.rows.length === 0) return null;
        return this.mapToEntity(result.rows[0] as ExperienceRow);
    }

    async deleteExperience(id: number): Promise<boolean> {
        const query = `DELETE FROM ${ExperienceEntity.tableName} WHERE id = $1`;
        const result = await dbService.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async deleteAllExperiences(): Promise<boolean> {
        const query = `DELETE FROM ${ExperienceEntity.tableName}`;
        await dbService.query(query);
        return true;
    }
}
