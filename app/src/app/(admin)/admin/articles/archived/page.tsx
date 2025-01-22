"use client";

import { useCallback, useEffect } from "react";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { Article } from "@/modules/article/article.entity";
import { getArchivedArticles } from "@/modules/article/article.controller";
import { AdminArticleCard } from "@/components/AdminArticleCard";

export default function Archived() {
    const [archivedArticles, setArchivedArticles] = useSafeState<Article[]>([]);

    const fetchArchivedArticles = useCallback(
        async () => {
            const { articles } = await getArchivedArticles();
            setArchivedArticles(articles || []);
        },
        [setArchivedArticles]
    );

    useEffect(
        () => {
            fetchArchivedArticles();
        },
        [fetchArchivedArticles]
    );

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-4">Archived</h1>
            <p className="mb-6">Manage your archived articles. Restore or permanently delete articles if necessary.</p>

            <div className="grid grid-cols-1 gap-6">
                {
                    archivedArticles.map((article) => (
                        <AdminArticleCard key={article.id} article={article} onActionComplete={fetchArchivedArticles} />
                    ))
                }
            </div>
        </div>
    );
}
