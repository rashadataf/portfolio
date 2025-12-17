export interface Experience {
    id: number;
    company: string;
    position: string;
    location: string;
    startDate: string; // Storing as string for flexibility (e.g. "Dec 2021") or Date
    endDate: string;   // "Present" or date string
    responsibilities: string[];
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export class ExperienceEntity {
    static tableName = 'experiences';

    static createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${ExperienceEntity.tableName} (
            id SERIAL PRIMARY KEY,
            company VARCHAR(255) NOT NULL,
            position VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            start_date VARCHAR(50) NOT NULL,
            end_date VARCHAR(50) NOT NULL,
            responsibilities TEXT[] NOT NULL,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    static initializeTable() {
        return [
            ExperienceEntity.createTableQuery,
        ];
    }
}
