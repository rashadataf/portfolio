import Link from "next/link";
import { getAllArticles } from "@/modules/article/article.controller";

export default async function AllArticles() {
    const articles = (await getAllArticles()).articles;

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
                        <li key={article.id} className="p-4 border rounded-lg shadow-sm bg-gray-100">
                            <Link href={`/admin/articles/${article.id}`} className="text-lg font-medium text-blue-600 hover:underline">
                                {article.titleEn}
                            </Link>
                            <p className="text-sm text-gray-500">Author: {article.author} | Status: {article.status}</p>
                            <p className="text-gray-700 mt-2">{article.keywordsEn.join(", ")}</p>
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}
