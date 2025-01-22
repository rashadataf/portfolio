"use client";
import { useSafeState } from "@/hooks/useSafeState.hook";
import Link from "next/link";
import { Article } from "@/modules/article/article.entity";
import { deleteArticle, updateArticle } from "@/modules/article/article.controller";
import { ArticleStatus } from "@/types";
import { useCallback } from "react";

type ArticleCardProps = {
    article: Article;
    onActionComplete?: () => void;
};

export const AdminArticleCard = ({ article, onActionComplete }: ArticleCardProps) => {
    const [loading, setLoading] = useSafeState(false);

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
            const { status, message } = await updateArticle(article.id, { status: ArticleStatus.ARCHIVED });
            setLoading(false);

            if (status === 200) {
                alert("Article archived successfully");
                onActionComplete?.();
            } else {
                alert(message || "Failed to archive article");
            }
        },
        [article.id, onActionComplete, setLoading]
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
        <div className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all bg-white">
            <Link href={`/admin/articles/${article.id}`}>
                <h2 className="text-xl font-semibold text-gray-800">{article.titleEn}</h2>
            </Link>
            <p className="text-gray-600">By {article.author}</p>
            <div className="mt-4 flex space-x-4">
                {
                    article.status === ArticleStatus.DRAFT && (
                        <>
                            <button
                                onClick={handlePublish}
                                className="px-4 py-2 bg-green-500 text-white rounded"
                                disabled={loading}
                            >
                                Publish
                            </button>
                            <button
                                onClick={handleArchive}
                                className="px-4 py-2 bg-yellow-500 text-white rounded"
                                disabled={loading}
                            >
                                Archive
                            </button>
                        </>
                    )
                }
                {
                    article.status === ArticleStatus.ARCHIVED && (
                        <>
                            <button
                                onClick={handlePublish}
                                className="px-4 py-2 bg-green-500 text-white rounded"
                                disabled={loading}
                            >
                                Restore/Publish
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                                disabled={loading}
                            >
                                Delete
                            </button>
                        </>
                    )
                }
                {
                    article.status === ArticleStatus.PUBLISHED && (
                        <>
                            <button
                                onClick={handleArchive}
                                className="px-4 py-2 bg-yellow-500 text-white rounded"
                                disabled={loading}
                            >
                                Archive
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                                disabled={loading}
                            >
                                Delete
                            </button>
                        </>
                    )
                }
            </div>
        </div>
    );
};
