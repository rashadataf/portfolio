import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rashad Ataf's Articles - Insights in Full Stack Development",
    description: "Dive into articles by Rashad Ataf covering topics in Full Stack Development, latest trends in web and mobile technologies, tutorials, and industry insights.",
    keywords: "Dive into articles by Rashad Ataf covering topics in Full Stack Development, latest trends in web and mobile technologies, tutorials, and industry insights, Zim Connections",
    alternates: {
        canonical: "https://www.rashadataf.tech/articles"
    }
}

const ArticlesPage = () => {
    return (
        <main role="main">
            <div className="container mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-4xl font-bold text-center mb-4">Articles Coming Soon!</h1>
                <p className="text-xl text-center mb-6">I&apos;m currently working on some exciting articles. Stay tuned!</p>
                <div className="flex space-x-4">
                </div>
            </div>
        </main>
    );
}

export default ArticlesPage;