import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles, createArticle } from '@/modules/article/article.controller';

export async function GET() {
    const response = await getAllArticles();
    return NextResponse.json(response, { status: response.status });
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    const response = await createArticle(data, null);
    return NextResponse.json(response, { status: response.status });
}
