import { dbService } from '@/modules/db/db.service';
import { Profile, ProfileEntity } from './profile.entity';
import { UpdateProfileDTO } from './profile.dto';

interface ProfileRow {
    id: number;
    slug: string;
    headline: string;
    bio_en: string;
    bio_ar: string;
    resume_url: string;
    contact_email: string;
    hero_image_url: string;
    updated_at: Date;
}

export class ProfileRepository {
    private mapToEntity(row: ProfileRow): Profile {
        return {
            id: row.id,
            slug: row.slug,
            headline: row.headline,
            bioEn: row.bio_en,
            bioAr: row.bio_ar,
            resumeUrl: row.resume_url,
            contactEmail: row.contact_email,
            heroImageUrl: row.hero_image_url,
            updatedAt: row.updated_at,
        };
    }

    async getProfile(slug: string = 'main'): Promise<Profile | null> {
        const query = `SELECT * FROM ${ProfileEntity.tableName} WHERE slug = $1`;
        const result = await dbService.query(query, [slug]);
        
        if (result.rows.length === 0) return null;
        return this.mapToEntity(result.rows[0] as ProfileRow);
    }

    async updateProfile(slug: string, data: UpdateProfileDTO): Promise<Profile> {
        const fields: string[] = [];
        const values: (string | number | Date)[] = [];
        let paramIndex = 1;

        if (data.headline !== undefined) {
            fields.push(`headline = $${paramIndex++}`);
            values.push(data.headline);
        }
        if (data.bioEn !== undefined) {
            fields.push(`bio_en = $${paramIndex++}`);
            values.push(data.bioEn);
        }
        if (data.bioAr !== undefined) {
            fields.push(`bio_ar = $${paramIndex++}`);
            values.push(data.bioAr);
        }
        if (data.resumeUrl !== undefined) {
            fields.push(`resume_url = $${paramIndex++}`);
            values.push(data.resumeUrl);
        }
        if (data.contactEmail !== undefined) {
            fields.push(`contact_email = $${paramIndex++}`);
            values.push(data.contactEmail);
        }
        if (data.heroImageUrl !== undefined) {
            fields.push(`hero_image_url = $${paramIndex++}`);
            values.push(data.heroImageUrl);
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);

        const query = `
            UPDATE ${ProfileEntity.tableName}
            SET ${fields.join(', ')}
            WHERE slug = $${paramIndex}
            RETURNING *
        `;
        values.push(slug);

        const result = await dbService.query(query, values);
        return this.mapToEntity(result.rows[0] as ProfileRow);
    }
}
