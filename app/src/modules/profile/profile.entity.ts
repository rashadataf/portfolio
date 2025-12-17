export interface Profile {
    id: number;
    slug: string;
    headline: string;
    bioEn: string;
    bioAr: string;
    aboutEn: string;
    happyClients: number;
    projectsCompleted: number;
    yearsOfExperience: number;
    resumeUrl: string;
    contactEmail: string;
    heroImageUrl: string;
    updatedAt: Date;
}

export class ProfileEntity {
    static tableName = 'profile';

    static createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${ProfileEntity.tableName} (
            id SERIAL PRIMARY KEY,
            slug VARCHAR(50) UNIQUE NOT NULL DEFAULT 'main',
            headline VARCHAR(255),
            bio_en TEXT,
            bio_ar TEXT,
            about_en TEXT,
            happy_clients INTEGER DEFAULT 0,
            projects_completed INTEGER DEFAULT 0,
            years_of_experience INTEGER DEFAULT 0,
            resume_url VARCHAR(255),
            contact_email VARCHAR(255),
            hero_image_url VARCHAR(255),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    static initializeTable() {
        return [
            ProfileEntity.createTableQuery,
            // Insert default profile if not exists
            `INSERT INTO ${ProfileEntity.tableName} (slug, headline, bio_en, bio_ar) 
             VALUES ('main', 'Software Engineer', 'Welcome to my portfolio', 'مرحبا بكم في ملفي الشخصي') 
             ON CONFLICT (slug) DO NOTHING;`
        ];
    }
}
