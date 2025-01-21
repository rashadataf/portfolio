import Link from "next/link";
import { getAllArticles } from "@/modules/article/article.controller";
import { AdminArticleCard } from "@/components/AdminArticleCard";

export default async function AllArticles() {
    const { articles } = await getAllArticles();

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
                    articles && articles.map((article) => (
                        <AdminArticleCard article={article} key={article.id} />
                    ))
                }
            </ul>
        </div>
    );
}
