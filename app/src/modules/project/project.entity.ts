export interface Project {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    technologies: string[];
    liveUrl?: string;
    sourceCodeUrl?: string;
    playStoreUrl?: string;
    appStoreUrl?: string;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export class ProjectEntity {
    static tableName = 'projects';

    static createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${ProjectEntity.tableName} (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT NOT NULL,
            technologies TEXT[] NOT NULL,
            live_url TEXT,
            source_code_url TEXT,
            play_store_url TEXT,
            app_store_url TEXT,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    static initializeTable() {
        return [
            ProjectEntity.createTableQuery,
        ];
    }
}
