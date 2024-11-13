import { NextRequest, NextResponse } from "next/server";
import { deleteArticle, getArticleById, updateArticle } from "@/modules/article/article.controller";

export async function GET(_: unknown, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const response = await getArticleById(id);
    return NextResponse.json(response, { status: response.status });
}

export async function DELETE(_: unknown, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const response = await deleteArticle(id);
    return NextResponse.json(response, { status: response.status });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const data = await req.json();
    const response = await updateArticle(id, data);
    return NextResponse.json(response, { status: response.status });
}