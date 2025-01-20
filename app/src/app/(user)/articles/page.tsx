import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Loader } from "@/components/Loader";
import { getAllArticles } from "@/modules/article/article.controller";

export const metadata: Metadata = {
    title: "Rashad Ataf's Articles - Insights in Full Stack Development",
    description: "Dive into articles by Rashad Ataf covering topics in Full Stack Development, latest trends in web and mobile technologies, tutorials, and industry insights.",
    keywords: "Dive into articles by Rashad Ataf covering topics in Full Stack Development, latest trends in web and mobile technologies, tutorials, and industry insights, Zim Connections",
    alternates: {
        canonical: "https://www.rashadataf.com/articles"
    }
}

const ArticlesPage = dynamic(() =>
    import('@/components/ArticlesPage').then((mod) => mod.ArticlesPage),
    {
        loading: () => <Loader />,
    }
)

export default async function Articles() {
    const { articles } = await getAllArticles();

    if (!articles || !articles.length) {
        return <div className="container mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold text-center mb-4">Articles Coming Soon!</h1>
            <p className="text-xl text-center mb-6">I&apos;m currently working on some exciting articles. Stay tuned!</p>
            <div className="flex space-x-4">
            </div>
        </div>;
    }

    return <ArticlesPage initialArticles={articles} />
}

