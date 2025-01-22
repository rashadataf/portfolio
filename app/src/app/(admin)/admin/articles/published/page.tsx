"use client";

import { useCallback, useEffect } from "react";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { Article } from "@/modules/article/article.entity";
import { getPublishedArticles } from "@/modules/article/article.controller";
import { AdminArticleCard } from "@/components/AdminArticleCard";

export default function Published() {
    const [publishedArticles, setPublishedArticles] = useSafeState<Article[]>([]);

    const fetchPublishedArticles = useCallback(
        async () => {
            const { articles } = await getPublishedArticles();
            setPublishedArticles(articles || []);
        },
        [setPublishedArticles]
    );

    useEffect(
        () => {
            fetchPublishedArticles();
        },
        [fetchPublishedArticles]
    );

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-4">Published</h1>
            <p className="mb-6">Manage your published articles. Edit or archive articles as needed.</p>

            <div className="grid grid-cols-1 gap-6">
                {
                    publishedArticles.map((article) => (
                        <AdminArticleCard key={article.id} article={article} onActionComplete={fetchPublishedArticles} />
                    ))
                }
            </div>
        </div>
    );
}
