import { dbService } from '@/modules/db/db.service';
import { Education, EducationEntity } from './education.entity';
import { CreateEducationDTO, UpdateEducationDTO } from './education.dto';

interface EducationRow {
    id: number;
    institution: string;
    degree: string;
    field: string;
    start_date: string;
    end_date: string;
    display_order: number;
    created_at: Date;
    updated_at: Date;
}

export class EducationRepository {
    private mapToEntity(row: EducationRow): Education {
        return {
            id: row.id,
            institution: row.institution,
            degree: row.degree,
            field: row.field,
            startDate: row.start_date,
            endDate: row.end_date,
            displayOrder: row.display_order,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    async getAllEducations(): Promise<Education[]> {
        const query = `SELECT * FROM ${EducationEntity.tableName} ORDER BY display_order ASC, created_at DESC`;
        const result = await dbService.query(query);
        return result.rows.map((row) => this.mapToEntity(row as EducationRow));
    }

    async getEducationById(id: number): Promise<Education | null> {
        const query = `SELECT * FROM ${EducationEntity.tableName} WHERE id = $1`;
        const result = await dbService.query(query, [id]);
        if (result.rows.length === 0) return null;
        return this.mapToEntity(result.rows[0] as EducationRow);
    }

    async createEducation(data: CreateEducationDTO): Promise<Education> {
        const query = `
            INSERT INTO ${EducationEntity.tableName} (institution, degree, field, start_date, end_date, display_order)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            data.institution,
            data.degree,
            data.field,
            data.startDate,
            data.endDate,
            data.displayOrder || 0
        ];
        const result = await dbService.query(query, values);
        return this.mapToEntity(result.rows[0] as EducationRow);
    }

    async updateEducation(id: number, data: UpdateEducationDTO): Promise<Education | null> {
        const fields: string[] = [];
        const values: (string | number)[] = [];
        let paramIndex = 1;

        if (data.institution !== undefined) {
            fields.push(`institution = $${paramIndex++}`);
            values.push(data.institution);
        }
        if (data.degree !== undefined) {
            fields.push(`degree = $${paramIndex++}`);
            values.push(data.degree);
        }
        if (data.field !== undefined) {
            fields.push(`field = $${paramIndex++}`);
            values.push(data.field);
        }
        if (data.startDate !== undefined) {
            fields.push(`start_date = $${paramIndex++}`);
            values.push(data.startDate);
        }
        if (data.endDate !== undefined) {
            fields.push(`end_date = $${paramIndex++}`);
            values.push(data.endDate);
        }
        if (data.displayOrder !== undefined) {
            fields.push(`display_order = $${paramIndex++}`);
            values.push(data.displayOrder);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        const query = `
            UPDATE ${EducationEntity.tableName}
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        values.push(id);

        const result = await dbService.query(query, values);
        if (result.rows.length === 0) return null;
        return this.mapToEntity(result.rows[0] as EducationRow);
    }

    async deleteEducation(id: number): Promise<boolean> {
        const query = `DELETE FROM ${EducationEntity.tableName} WHERE id = $1`;
        const result = await dbService.query(query, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async deleteAllEducations(): Promise<boolean> {
        const query = `DELETE FROM ${EducationEntity.tableName}`;
        await dbService.query(query);
        return true;
    }
}
