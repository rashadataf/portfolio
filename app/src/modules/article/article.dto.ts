import { type JSONContent } from "novel";
import type { ArticleStatus } from "@/types";

export type CreateArticleDTO = {
    titleEn: string;
    titleAr: string;
    contentEn: JSONContent;
    contentAr: JSONContent;
    descriptionEn: string;
    descriptionAr: string;
    contentSearchEn: string;
    contentSearchAr: string;
    coverImage?: string;
    keywordsEn?: string[];
    keywordsAr?: string[];
    author: string;
    publicationDate?: Date;
    status?: ArticleStatus;
    slugEn: string;
    slugAr: string;
}

export type UpdateArticleDTO = Partial<CreateArticleDTO>;
