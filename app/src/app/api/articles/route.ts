import { NextRequest } from 'next/server';
import { ArticleController } from '@/modules/article/article.controller';

const articleController = new ArticleController();

export async function GET() {
    return articleController.getAllArticles();
}

export async function POST(req: NextRequest) {
    return articleController.createArticle(req);
}

export async function PATCH(req: NextRequest) {
    return articleController.updateArticle(req);
}
