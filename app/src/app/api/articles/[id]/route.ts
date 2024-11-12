import { NextRequest } from 'next/server';
import { ArticleController } from '@/modules/article/article.controller';

const articleController = new ArticleController();


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    return articleController.getArticleById(params.id);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    return articleController.deleteArticle(params.id);
}