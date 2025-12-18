export interface CreateProjectDTO {
    title: string;
    description: string;
    imageUrl: string;
    technologies: string[];
    liveUrl?: string;
    sourceCodeUrl?: string;
    playStoreUrl?: string;
    appStoreUrl?: string;
    displayOrder?: number;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {
    id: number;
}
