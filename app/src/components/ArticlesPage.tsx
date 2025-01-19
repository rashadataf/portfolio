'use client';
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/modules/article/article.entity";
import { useEffect } from "react";
import { trackPageVisit } from "@/lib/metrics";

type Props = {
    articles: Article[];
}

export const ArticlesPage = ({ articles }: Props) => {
    useEffect(
        () => {
            trackPageVisit('Articles');
        },
        []
    )
    return (
        <section className="container mx-auto py-10 px-4">
            <h1 className="text-4xl font-bold text-center mb-10">Articles</h1>
            <div className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full max-w-md p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    articles.map((article) => (
                        <Link key={article.id} href={`/articles/${article.id}?lang=en`} prefetch={false}>
                            <div
                                key={article.id}
                                className="cursor-pointer p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:border-gray-300 transition-all bg-white"
                            >
                                {article.coverImage && (
                                    <Image
                                        src={article.coverImage}
                                        alt={article.titleEn}
                                        className="w-full h-48 object-cover rounded-md mb-4"
                                        width={300}
                                        height={300}
                                        priority
                                    />
                                )}
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