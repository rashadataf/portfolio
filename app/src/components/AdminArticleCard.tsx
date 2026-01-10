"use client";
import { useSafeState } from "@/hooks/useSafeState.hook";
import Link from "next/link";
import { Article } from "@/modules/article/article.entity";
import { deleteArticle, updateArticle } from "@/modules/article/article.controller";
import { ArticleStatus } from "@/types";
import { useCallback } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/UI/Button';

type ArticleCardProps = {
    article: Article;
    onActionComplete?: () => void;
};

// Helper function to sanitize slugs
const sanitizeSlug = (slug: string) => {
    return slug
        .toLowerCase() // Convert to lowercase
        .replace(/[^a-z0-9-\u0621-\u064A\u0660-\u0669 ]/g, "") // Remove invalid characters (keeps Arabic, numbers, and hyphens)
        .replace(/\s+/g, "-"); // Replace spaces with hyphens
};

export const AdminArticleCard = ({ article, onActionComplete }: ArticleCardProps) => {
    const [loading, setLoading] = useSafeState(false);

    const handleSanitizeSlugs = useCallback(
        async () => {
            const sanitizedSlugEn = sanitizeSlug(article.slugEn);
            const sanitizedSlugAr = sanitizeSlug(article.slugAr);

            if (sanitizedSlugEn !== article.slugEn || sanitizedSlugAr !== article.slugAr) {
                await updateArticle(article.id, {
                    slugEn: sanitizedSlugEn,
                    slugAr: sanitizedSlugAr,
                });
            }
        },
        [article]
    );

    const handleDelete = useCallback(
        async () => {
            if (confirm("Are you sure you want to permanently delete this article?")) {
                setLoading(true);
                const { message, status } = await deleteArticle(article.id);
                setLoading(false);

                if (status === 204) {
                    alert("Article deleted successfully");
                    onActionComplete?.();
                } else {
                    alert(message || "Failed to delete article");
                }
            }
        },
        [article.id, onActionComplete, setLoading]
    );

    const handleArchive = useCallback(
        async () => {
            setLoading(true);
            await handleSanitizeSlugs();
            const { status, message } = await updateArticle(article.id, { status: ArticleStatus.ARCHIVED });
            setLoading(false);

            if (status === 200) {
                alert("Article archived successfully");
                onActionComplete?.();
            } else {
                alert(message || "Failed to archive article");
            }
        },
        [article.id, onActionComplete, setLoading, handleSanitizeSlugs]
    );

    const handlePublish = useCallback(
        async () => {
            setLoading(true);
            const { status, message } = await updateArticle(article.id, { status: ArticleStatus.PUBLISHED, publicationDate: new Date() });
            setLoading(false);

            if (status === 200) {
                alert("Article published successfully");
                onActionComplete?.();
            } else {
                alert(message || "Failed to publish article");
            }
        },
        [article.id, onActionComplete, setLoading]
    );

    return (
        <Card sx={{ p: 2 }}>
            <CardContent sx={{ '&:last-child': { pb: 1 } }}>
                <Link href={`/admin/articles/${article.id}`}>
                    <Typography variant="h6" component="div" sx={{ textDecoration: 'none' }}>{article.titleEn}</Typography>
                </Link>
                <Typography variant="body2" color="text.secondary">By {article.author}</Typography>
            </CardContent>

            <CardActions sx={{ pt: 0 }}>
                <Stack direction="row" spacing={1}>
                    {article.status === ArticleStatus.DRAFT && (
                        <>
                            <Button onClick={handlePublish} variant="default" size="sm" disabled={loading}>Publish</Button>
                            <Button onClick={handleArchive} variant="secondary" size="sm" disabled={loading}>Archive</Button>
                        </>
                    )}

                    {article.status === ArticleStatus.ARCHIVED && (
                        <>
                            <Button onClick={handlePublish} variant="default" size="sm" disabled={loading}>Restore/Publish</Button>
                            <Button onClick={handleDelete} variant="destructive" size="sm" disabled={loading}>Delete</Button>
                        </>
                    )}

                    {article.status === ArticleStatus.PUBLISHED && (
                        <>
                            <Button onClick={handleArchive} variant="secondary" size="sm" disabled={loading}>Archive</Button>
                            <Button onClick={handleDelete} variant="destructive" size="sm" disabled={loading}>Delete</Button>
                        </>
                    )}
                </Stack>
            </CardActions>
        </Card>
    );
};
