import { ArticleController } from '@/modules/article/article.controller';

const articleController = new ArticleController();


export async function GET(_: unknown, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    return articleController.getArticleById(id);
}

export async function DELETE(_: unknown, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    return articleController.deleteArticle(id);
}