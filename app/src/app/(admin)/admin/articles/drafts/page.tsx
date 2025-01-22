"use client";

import { useCallback, useEffect } from "react";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { Article } from "@/modules/article/article.entity";
import { getDraftArticles } from "@/modules/article/article.controller";
import { AdminArticleCard } from "@/components/AdminArticleCard";

export default function Drafts() {
    const [drafts, setDrafts] = useSafeState<Article[]>([]);

    const fetchDrafts = useCallback(
        async () => {
            const { articles } = await getDraftArticles();
            setDrafts(articles || []);
        },
        [setDrafts]
    )

    useEffect(
        () => {
            fetchDrafts();
        },
        [fetchDrafts]
    );

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-4">Drafts</h1>
            <p className="mb-6">Manage your drafts here. Edit and publish articles when they’re ready.</p>

            <div className="grid grid-cols-1 gap-6">
                {
                    drafts.map((article) => (
                        <AdminArticleCard key={article.id} article={article} onActionComplete={fetchDrafts} />
                    ))
                }
            </div>
        </div>
    );
}
