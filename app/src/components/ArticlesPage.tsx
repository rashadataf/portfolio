'use client';
import { KeyboardEvent, ChangeEvent, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSafeState } from "@/hooks/useSafeState.hook";
import { Article } from "@/modules/article/article.entity";
import { trackPageVisit } from "@/lib/metrics";
import { getPublishedArticles, getArticlesByQuery } from "@/modules/article/article.controller";

export const ArticlesPage = () => {
    const [searchQuery, setSearchQuery] = useSafeState("");
    const [articles, setArticles] = useSafeState<Article[]>([]);
    const [initialArticles, setInitialArticles] = useSafeState<Article[]>([]);

    useEffect(
        () => {
            const fetchArticles = async () => {
                try {
                    const { articles } = await getPublishedArticles();
                    const fetchedArticles = articles ?? [];
                    setArticles(fetchedArticles);
                    setInitialArticles(fetchedArticles);
                } catch (error) {
                    console.error("Error fetching articles:", error);
                }
            };

            fetchArticles();
            trackPageVisit('Articles');
        },
        [setArticles, setInitialArticles]
    );

    const handleQueryChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchQuery(value);

            if (!value.trim().length) {
                setArticles(initialArticles);
            }
        },
        [initialArticles, setArticles, setSearchQuery]
    );

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim().length) return;

        try {
            const searchResult = await getArticlesByQuery(searchQuery);
            setArticles(searchResult.articles ?? []);
        } catch (error) {
            console.error("Error during search:", error);
        }
    }, [searchQuery, setArticles]);

    const handleKeyDown = useCallback(
        async (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                await handleSearch();
            }
        },
        [handleSearch]
    );

    if (!articles.length && !searchQuery.trim()) {
        return (
            <div className="container mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-4xl font-bold text-center mb-4">Articles Coming Soon!</h1>
                <p className="text-xl text-center mb-6">I&apos;m currently working on some exciting articles. Stay tuned!</p>
                <div className="flex space-x-4"></div>
            </div>
        );
    }

    return (
        <section className="container mx-auto py-10 px-4">
            <h1 className="text-4xl font-bold text-center mb-10">Articles</h1>

            <div className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full max-w-md p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={searchQuery}
                    onChange={handleQueryChange}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={handleSearch}
                    disabled={searchQuery.length === 0}
                    className={`ml-2 p-3 text-white rounded-md shadow-md transition-all ${searchQuery.length === 0
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                >
                    Search
                </button>
            </div>

            {
                searchQuery.length > 0 && articles.length === 0 && (
                    <p className="text-center text-gray-500">There are no results for your search.</p>
                )
            }

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    articles.map((article) => (
                        <Link key={article.id} href={`/articles/${article.id}?lang=en`} prefetch={false}>
                            <div
                                className="cursor-pointer p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:border-gray-300 transition-all bg-white"
                            >
                                {
                                    article.coverImage && (
                                        <Image
                                            src={article.coverImage}
                                            alt={article.titleEn}
                                            className="w-full h-48 object-cover rounded-md mb-4"
                                            width={300}
                                            height={300}
                                            priority
                                        />
                                    )
                                }
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    {article.titleEn}
                                </h2>
                                <p className="text-gray-600 mb-2">By {article.author}</p>
                                <p className="text-gray-500 text-sm">
                                    {new Date(article.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    ))
                }
            </div>
        </section>
    );
};
