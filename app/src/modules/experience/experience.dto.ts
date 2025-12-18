export interface CreateExperienceDTO {
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
    displayOrder?: number;
}

export interface UpdateExperienceDTO {
    company?: string;
    position?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string[];
    displayOrder?: number;
}
