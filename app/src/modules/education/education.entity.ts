export interface Education {
    id: number;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

export class EducationEntity {
    static tableName = 'educations';

    static createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${EducationEntity.tableName} (
            id SERIAL PRIMARY KEY,
            institution VARCHAR(255) NOT NULL,
            degree VARCHAR(255) NOT NULL,
            field VARCHAR(255) NOT NULL,
            start_date VARCHAR(50) NOT NULL,
            end_date VARCHAR(50) NOT NULL,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    static initializeTable() {
        return [
            EducationEntity.createTableQuery,
        ];
    }
}
