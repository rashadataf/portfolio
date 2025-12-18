import { dbService } from '@/modules/db/db.service';
import { Project, ProjectEntity } from './project.entity';
import { CreateProjectDTO, UpdateProjectDTO } from './project.dto';

interface ProjectRow {
    id: number;
    title: string;
    description: string;
    image_url: string;
    technologies: string[];
    live_url?: string;
    source_code_url?: string;
    play_store_url?: string;
    app_store_url?: string;
    display_order: number;
    created_at: Date;
    updated_at: Date;
}

export class ProjectRepository {
    private mapToEntity(row: ProjectRow): Project {
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            imageUrl: row.image_url,
            technologies: row.technologies,
            liveUrl: row.live_url,
            sourceCodeUrl: row.source_code_url,
            playStoreUrl: row.play_store_url,
            appStoreUrl: row.app_store_url,
            displayOrder: row.display_order,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    async getAllProjects(): Promise<Project[]> {
        const query = `SELECT * FROM ${ProjectEntity.tableName} ORDER BY display_order ASC, created_at DESC`;
        const result = await dbService.query(query);
        return result.rows.map((row) => this.mapToEntity(row as ProjectRow));
    }

    async getProjectById(id: number): Promise<Project | null> {
        const query = `SELECT * FROM ${ProjectEntity.tableName} WHERE id = $1`;
        const result = await dbService.query(query, [id]);
        if (result.rows.length === 0) return null;
        return this.mapToEntity(result.rows[0] as ProjectRow);
    }

    async createProject(data: CreateProjectDTO): Promise<Project> {
        const query = `
            INSERT INTO ${ProjectEntity.tableName} (title, description, image_url, technologies, live_url, source_code_url, play_store_url, app_store_url, display_order)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const values = [
            data.title,
            data.description,
            data.imageUrl,
            data.technologies,
            data.liveUrl || null,
            data.sourceCodeUrl || null,
            data.playStoreUrl || null,
            data.appStoreUrl || null,
            data.displayOrder || 0
        ];
        const result = await dbService.query(query, values);
        return this.mapToEntity(result.rows[0] as ProjectRow);
    }

    async updateProject(id: number, data: UpdateProjectDTO): Promise<Project | null> {
        const fields: string[] = [];
        const values: (string | number | string[] | null)[] = [];
        let paramIndex = 1;

        if (data.title !== undefined) {
            fields.push(`title = $${paramIndex++}`);
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(data.description);
        }
        if (data.imageUrl !== undefined) {
            fields.push(`image_url = $${paramIndex++}`);
            values.push(data.imageUrl);
        }
        if (data.technologies !== undefined) {
            fields.push(`technologies = $${paramIndex++}`);
            values.push(data.technologies);
        }
        if (data.liveUrl !== undefined) {
            fields.push(`live_url = $${paramIndex++}`);
            values.push(data.liveUrl || null);
        }
        if (data.sourceCodeUrl !== undefined) {
            fields.push(`source_code_url = $${paramIndex++}`);
            values.push(data.sourceCodeUrl || null);
        }
        if (data.playStoreUrl !== undefined) {
            fields.push(`play_store_url = $${paramIndex++}`);
            values.push(data.playStoreUrl || null);
        }
        if (data.appStoreUrl !== undefined) {
            fields.push(`app_store_url = $${paramIndex++}`);
            values.push(data.appStoreUrl || null);
        }
        if (data.displayOrder !== undefined) {
            fields.push(`display_order = $${paramIndex++}`);
            values.push(data.displayOrder);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        if (fields.length === 1) return this.getProjectById(id); // Only updated_at, no changes

        const query = `
            UPDATE ${ProjectEntity.tableName}
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        values.push(id);

        const result = await dbService.query(query, values);
        if (result.rows.length === 0) return null;
        return this.mapToEntity(result.rows[0] as ProjectRow);
    }

    async deleteProject(id: number): Promise<boolean> {
        const query = `DELETE FROM ${ProjectEntity.tableName} WHERE id = $1`;
        const result = await dbService.query(query, [id]);
        return (result.rowCount || 0) > 0;
    }

    async deleteAllProjects(): Promise<boolean> {
        const query = `DELETE FROM ${ProjectEntity.tableName}`;
        const result = await dbService.query(query);
        return (result.rowCount || 0) > 0;
    }
}
