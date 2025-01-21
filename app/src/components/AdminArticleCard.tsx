"use client";
import { useSafeState } from "@/hooks/useSafeState.hook";
import Link from "next/link";
import { Article } from "@/modules/article/article.entity";
import { deleteArticle, updateArticle } from "@/modules/article/article.controller";
import { ArticleStatus } from "@/types";

type ArticleCardProps = {
    article: Article;
    onActionComplete?: () => void;
};

export const AdminArticleCard = ({ article, onActionComplete }: ArticleCardProps) => {
    const [loading, setLoading] = useSafeState(false);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this article?")) {
            setLoading(true);
            const response = await deleteArticle(article.id);
            setLoading(false);

            if (response.status === 204) {
                alert("Article deleted successfully");
                onActionComplete?.();
            } else {
                alert(response.message || "Failed to delete article");
            }
        }
    };

    const handleArchive = async () => {
        setLoading(true);
        const response = await updateArticle(article.id, { status: ArticleStatus.ARCHIVED });
        setLoading(false);

        if (response.status === 200) {
            alert("Article archived successfully");
            onActionComplete?.();
        } else {
            alert(response.message || "Failed to archive article");
        }
    };

    const handlePublish = async () => {
        setLoading(true);
        const response = await updateArticle(article.id, { status: ArticleStatus.PUBLISHED });
        setLoading(false);

        if (response.status === 200) {
            alert("Article published successfully");
            onActionComplete?.();
        } else {
            alert(response.message || "Failed to publish article");
        }
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all bg-white">
            <Link href={`/admin/articles/${article.id}`}>
                <h2 className="text-xl font-semibold text-gray-800">{article.titleEn}</h2>
            </Link>
            <p className="text-gray-600">By {article.author}</p>
            <div className="mt-4 flex space-x-4">
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                    disabled={loading}
                >
                    Delete
                </button>
                <button
                    onClick={handleArchive}
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                    disabled={loading}
                >
                    Archive
                </button>
                {article.status === "draft" && (
                    <button
                        onClick={handlePublish}
                        className="px-4 py-2 bg-green-500 text-white rounded"
                        disabled={loading}
                    >
                        Publish
                    </button>
                )}
            </div>
        </div>
    );
};
