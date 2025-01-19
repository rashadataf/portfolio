import dynamic from "next/dynamic";
import { Loader } from "@/components/Loader";
import { getAllArticles, getArticleById } from "@/modules/article/article.controller";
import { Metadata } from "next";

export const revalidate = 60

export const dynamicParams = true

export async function generateStaticParams() {
    const { articles } = await getAllArticles();
    if (!articles) return [];
    return articles.map((article) => ({
        id: String(article.id),
    }))
}

type Props = {
    params: Promise<{ id: string; }>;
    searchParams?: Promise<{ lang: 'en' | 'ar' }>;
}

export async function generateMetadata({
    params,
    searchParams,
}: Props): Promise<Metadata> {
    const { id } = await params;
    const lang = (await searchParams)?.lang === 'ar' ? 'ar' : 'en';
    const { article } = await getArticleById(id);
    if (!article) {
        return {
            title: 'Article Not Found',
            description: 'The article you are looking for does not exist.',
        };
    }

    const title = lang === 'ar' ? article.titleAr : article.titleEn;
    const keywords =
        lang === 'ar' ? article.keywordsAr?.join(', ') : article.keywordsEn?.join(', ');
    const description = keywords || 'Explore our latest article.';

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `https://www.rashadataf.tech/articles/${id}?lang=${lang}`,
            languages: {
            }
        },
        openGraph: {
            title,
            description,
            url: `/articles/${id}?lang=${lang}`,
            images: article.coverImage ? [{ url: article.coverImage }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: article.coverImage ? [article.coverImage] : [],
        },
    };
}

const ArticleDetailsComponent = dynamic(() =>
    import('@/components/ArticleDetails').then((mod) => mod.ArticleDetails),
    {
        loading: () => <Loader />,
    }
)

export default async function ArticleDetailPage({
    params,
    searchParams
}: Props) {
    const { id } = await params;
    const lang = (await searchParams)?.lang === 'ar' ? 'ar' : 'en';
    const { article } = await getArticleById(id);

    if (!article) {
        return <div className="text-center text-gray-500">Article not found</div>;
    }

    return <ArticleDetailsComponent article={article} lang={lang} />
};
