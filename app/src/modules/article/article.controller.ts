import { NextRequest, NextResponse } from 'next/server';
import { ArticleService } from '@/modules/article/article.service';
import { CreateArticleDTO, UpdateArticleDTO } from '@/modules/article/article.dto';

export class ArticleController {
    private articleService: ArticleService;

    constructor() {
        this.articleService = new ArticleService();
    }

    async getAllArticles() {
        try {
            const articles = await this.articleService.getAllArticles();
            return NextResponse.json({ articles }, { status: 200 });
        } catch (error) {
            console.error('Error fetching articles:', error);
            return NextResponse.json({ message: 'Error fetching articles', error }, { status: 500 });
        }
    }

    async getArticleById(id: string) {
        try {
            if (!id) {
                return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });
            }
            const article = await this.articleService.getArticleById(id);
            if (!article) {
                return NextResponse.json({ message: 'Article not found' }, { status: 404 });
            }
            return NextResponse.json({ article }, { status: 200 });
        } catch (error) {
            console.error('Error fetching article:', error);
            return NextResponse.json({ message: 'Error fetching article', error }, { status: 500 });
        }
    }

    async createArticle(req: NextRequest) {
        try {
            const data: CreateArticleDTO = await req.json();
            const article = await this.articleService.createArticle(data);
            return NextResponse.json({ article }, { status: 201 });
        } catch (error) {
            console.error('Error creating article:', error);
            return NextResponse.json({ message: 'Error creating article', error }, { status: 400 });
        }
    }

    async updateArticle(req: NextRequest) {
        try {
            const { id, ...data }: { id: string } & UpdateArticleDTO = await req.json();
            const updatedArticle = await this.articleService.updateArticle(id, data);
            if (!updatedArticle) {
                return NextResponse.json({ message: 'Article not found' }, { status: 404 });
            }
            return NextResponse.json({ article: updatedArticle }, { status: 200 });
        } catch (error) {
            console.error('Error updating article:', error);
            return NextResponse.json({ message: 'Error updating article', error }, { status: 400 });
        }
    }

    async deleteArticle(id: string) {
        try {
            if (!id) {
                return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });
            }
            const success = await this.articleService.deleteArticle(id);
            if (!success) {
                return NextResponse.json({ message: 'Article not found' }, { status: 404 });
            }
            return NextResponse.json({ message: 'Article deleted successfully' }, { status: 204 });
        } catch (error) {
            console.error('Error deleting article:', error);
            return NextResponse.json({ message: 'Error deleting article', error }, { status: 500 });
        }
    }
}
