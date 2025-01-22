'use client';
import { useEffect, useCallback } from "react";
import Link from "next/link";
import { getAllArticles } from "@/modules/article/article.controller";
import { AdminArticleCard } from "@/components/AdminArticleCard";
import { Article } from "@/modules/article/article.entity";
import { useSafeState } from "@/hooks/useSafeState.hook";

export default function AllArticles() {
    const [articles, setArticles] = useSafeState<Article[]>([]);

    const fetchArticles = useCallback(
        async () => {
            const { articles } = await getAllArticles();
            setArticles(articles || []);
        },
        [setArticles]
    );

    useEffect(
        () => {
            fetchArticles();
        },
        [fetchArticles]
    );

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">All Articles</h1>
            <p>Here you can view, filter, and manage all articles.</p>
            <button className="mt-6">
                <Link href="/admin/articles/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    + New Article
                </Link>
            </button>

            <ul className="mt-8 space-y-4">
                {
                    articles.map((article) => (
                        <AdminArticleCard
                            article={article}
                            key={article.id}
                            onActionComplete={fetchArticles}
                        />
                    ))
                }
            </ul>
        </div>
    );
}
