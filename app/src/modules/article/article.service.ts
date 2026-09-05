import { ArticleRepository } from '@/modules/article/article.repository';
import { type CreateArticleDTO, type UpdateArticleDTO } from '@/modules/article/article.dto';
import { ARTICLE_STATUS_VALUES } from '@/types';

export class ArticleService {
    private articleRepository: ArticleRepository;

    constructor() {
        this.articleRepository = new ArticleRepository();
    }

    async getArticleById(id: string) {
        return this.articleRepository.findArticleById(id);
    }

    async getArticleBySlugs(slug: string) {
        return this.articleRepository.findArticleBySlug(slug);
    }

    async getAllArticles(filters?: { page?: number; limit?: number; status?: string; search?: string; lang?: string }) {
        return this.articleRepository.findAll(filters);
    }

    async getDraftArticles() {
        return this.articleRepository.findArticlesByStatus(ARTICLE_STATUS_VALUES.DRAFT);
    }

    async getArchivedArticles() {
        return this.articleRepository.findArticlesByStatus(ARTICLE_STATUS_VALUES.ARCHIVED);
    }

    async getPublishedArticles() {
        return this.articleRepository.findArticlesByStatus(ARTICLE_STATUS_VALUES.PUBLISHED);
    }

    async searchPublishedArticles<T>(params: unknown[]): Promise<T[]> {
        return this.articleRepository.searchPublishedArticles(params);
    }


    async createArticle(articleDTO: CreateArticleDTO) {
        if (articleDTO.status === ARTICLE_STATUS_VALUES.PUBLISHED) {
            articleDTO.publicationDate = new Date();
        }
        return this.articleRepository.createArticle(articleDTO);
    }

    async updateArticle(id: string, articleDTO: UpdateArticleDTO) {
        return this.articleRepository.updateArticle(id, articleDTO);
    }

    async deleteArticle(id: string) {
        return this.articleRepository.deleteArticle(id);
    }
}
