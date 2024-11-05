import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Loader } from "@/components/Loader";

export const metadata: Metadata = {
    title: "Rashad Ataf's Articles - Insights in Full Stack Development",
    description: "Dive into articles by Rashad Ataf covering topics in Full Stack Development, latest trends in web and mobile technologies, tutorials, and industry insights.",
    keywords: "Dive into articles by Rashad Ataf covering topics in Full Stack Development, latest trends in web and mobile technologies, tutorials, and industry insights, Zim Connections",
    alternates: {
        canonical: "https://www.rashadataf.tech/articles"
    }
}

const ArticlesPage = dynamic(() =>
    import('@/components/ArticlesPage').then((mod) => mod.ArticlesPage),
    {
        loading: () => <Loader />,
    }
)

export default function Articles() {
    return <ArticlesPage />
}