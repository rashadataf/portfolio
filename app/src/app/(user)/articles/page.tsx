import { Metadata } from "next";
import { ArticlesPage } from "@/components/ArticlesPage";

export const metadata: Metadata = {
    title: "Rashad Ataf's Articles - Insights in Full Stack Development",
    description: "Dive into articles by Rashad Ataf covering topics in Full Stack Development, latest trends in web and mobile technologies, tutorials, and industry insights.",
    keywords: "Dive into articles by Rashad Ataf covering topics in Full Stack Development, latest trends in web and mobile technologies, tutorials, and industry insights, Zim Connections",
    alternates: {
        canonical: "https://www.rashadataf.com/articles"
    }
}

export default function Articles() {
    return <ArticlesPage />
}

