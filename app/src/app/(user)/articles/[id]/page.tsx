import dynamic from "next/dynamic";
import { Loader } from "@/components/Loader";
import { getAllArticles, getArticleById } from "@/modules/article/article.controller";

export const revalidate = 60

export const dynamicParams = true

export async function generateStaticParams() {
    const { articles } = await getAllArticles();
    if (!articles) return [];
    return articles.map((article) => ({
        id: String(article.id),
    }))
}

const ArticleDetailsComponent = dynamic(() =>
    import('@/components/ArticleDetails').then((mod) => mod.ArticleDetails),
    {
        loading: () => <Loader />,
    }
)

export default async function ArticleDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;
    const { article } = await getArticleById(id);

    if (!article) {
        return <div className="text-center text-gray-500">Article not found</div>;
    }

    return <ArticleDetailsComponent article={article} />
};
