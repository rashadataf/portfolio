export interface CreateEducationDTO {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    displayOrder?: number;
}

export interface UpdateEducationDTO {
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    displayOrder?: number;
}
