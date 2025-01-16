import { ArticleRepository } from '@/modules/article/article.repository';
import { CreateArticleDTO, UpdateArticleDTO } from '@/modules/article/article.dto';
import { ArticleStatus } from '@/types';

export class ArticleService {
    private articleRepository: ArticleRepository;

    constructor() {
        this.articleRepository = new ArticleRepository();
    }

    async getArticleById(id: string) {
        return this.articleRepository.findArticleById(id);
    }

    async getAllArticles() {
        return this.articleRepository.findAll();
    }

    async createArticle(articleDTO: CreateArticleDTO) {
        if (articleDTO.status === ArticleStatus.PUBLISHED) {
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