'use client';
import { useEffect, useCallback } from "react";
import Link from "next/link";
import { getAllArticles } from "@/modules/article/article.controller";
import { AdminArticleCard } from "@/components/AdminArticleCard";
import { Article } from "@/modules/article/article.entity";
import { useSafeState } from "@/hooks/useSafeState.hook";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Button } from '@/components/UI/Button';

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
        <Box sx={{ maxWidth: '1200px', mx: 'auto', py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5">All Articles</Typography>
                <Button onClick={() => {}} variant="default" size="sm" asChild>
                    <Link href="/admin/articles/new">+ New Article</Link>
                </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary">Here you can view, filter, and manage all articles.</Typography>

            <Stack spacing={2} sx={{ mt: 3 }}>
                {
                    articles.map((article) => (
                        <AdminArticleCard
                            article={article}
                            key={article.id}
                            onActionComplete={fetchArticles}
                        />
                    ))
                }

                {articles.length === 0 && (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <Typography color="text.secondary">No articles found.</Typography>
                    </Paper>
                )}
            </Stack>
        </Box>
    );
}
