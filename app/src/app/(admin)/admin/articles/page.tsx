import Link from "next/link";

export default function AllArticles() {
    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">All Articles</h1>
            <p>Here you can view, filter, and manage all articles.</p>
            <button className="mt-6">
                <Link href="/admin/articles/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    + New Article
                </Link>
            </button>
        </div>
    );
}
