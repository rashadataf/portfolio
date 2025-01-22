import dynamic from "next/dynamic";
import { Loader } from "@/components/Loader";
import { getAllArticles, getArticleBySlug } from "@/modules/article/article.controller";
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
    params: Promise<{ slug: string; }>;
    searchParams?: Promise<{ lang: 'en' | 'ar' }>;
}

export async function generateMetadata({
    params,
    searchParams,
}: Props): Promise<Metadata> {
    const { slug } = await params;
    const lang = (await searchParams)?.lang === 'ar' ? 'ar' : 'en';
    const { article } = await getArticleBySlug(slug);

    if (!article) {
        return {
            title: 'Article Not Found',
            description: 'The article you are looking for does not exist.',
            robots: 'noindex, nofollow',
        };
    }

    const title = lang === 'ar' ? article.titleAr : article.titleEn;
    const keywords =
        lang === 'ar' ? article.keywordsAr?.join(', ') : article.keywordsEn?.join(', ') || '';
    const description =
        lang === 'ar' ? article.descriptionAr : article.descriptionEn || 'Explore our latest article.';
    const publicationDate = article.publicationDate?.toISOString();

    return {
        title,
        description,
        keywords: keywords || 'blog, articles, insights',
        robots: 'index, follow',
        viewport: 'width=device-width, initial-scale=1.0',
        alternates: {
            canonical: `https://www.rashadataf.com/articles/${slug}?lang=${lang}`,
        },
        openGraph: {
            title,
            description,
            url: `https://www.rashadataf.com/articles/${slug}?lang=${lang}`,
            type: 'article',
            images: article.coverImage ? [{ url: article.coverImage }] : [],
            locale: lang === 'ar' ? 'ar_AR' : 'en_US',
            siteName: 'Rashad Ataf Portfolio',
            publishedTime: publicationDate || undefined,
            authors: ['https://www.rashadataf.com'],
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
    const { slug } = await params;
    const lang = (await searchParams)?.lang === 'ar' ? 'ar' : 'en';
    const { article } = await getArticleBySlug(slug);

    if (!article) {
        return <div className="text-center text-gray-500">Article not found</div>;
    }

    return <ArticleDetailsComponent article={article} lang={lang} />
};
