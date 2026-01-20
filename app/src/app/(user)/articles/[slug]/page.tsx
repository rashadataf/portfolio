import dynamicImport from "next/dynamic";
import { Loader } from "@/components/Loader";
import { getAllArticles, getArticleBySlug } from "@/modules/article/article.controller";
import { Metadata } from "next";
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'debug.log');

function writeDebugLog(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
    try {
        fs.appendFileSync(LOG_FILE, logEntry);
    } catch (error) {
        // Fallback to console if file writing fails
        console.error('Failed to write to log file:', error);
        console.error(message, data);
    }
}

export const revalidate = 60

export const dynamicParams = true
export const dynamic = 'force-dynamic'

export const viewport = {
    width: 'device-width',
    initialScale: 1,
};

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
        // viewport moved to top-level `export const viewport` per Next.js guidance
        alternates: {
            canonical: `https://www.rashadataf.com/articles/${slug}?lang=${lang}`,
        },
        openGraph: {
            title,
            description,
            url: `https://www.rashadataf.com/articles/${slug}?lang=${lang}`,
            type: 'article',
            images: article.coverImage ? [{ url: `https://www.rashadataf.com${article.coverImage}` }] : [],
            locale: lang === 'ar' ? 'ar_AR' : 'en_US',
            siteName: 'Rashad Ataf Portfolio',
            publishedTime: publicationDate || undefined,
            authors: ['https://www.rashadataf.com'],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: article.coverImage ? [`https://www.rashadataf.com${article.coverImage}`] : [],
        },
    };
}

const ArticleDetailsComponent = dynamicImport(() =>
    import('@/components/ArticleDetails').then((mod) => mod.ArticleDetails),
    {
        loading: () => <Loader />,
    }
)

export default async function ArticleDetailPage({
    params,
    searchParams
}: Props) {
    try {
        const { slug } = await params;
        const lang = (await searchParams)?.lang === 'ar' ? 'ar' : 'en';
        writeDebugLog('Fetching article with slug', { slug, lang });
        const { article, status, message, error } = await getArticleBySlug(slug);
        writeDebugLog('Article fetch result', { status, message, hasArticle: !!article, error: error instanceof Error ? error.message : String(error) });

        if (!article) {
            writeDebugLog('Article not found for slug', { slug });
            return <div className="text-center text-gray-500">Article not found</div>;
        }

        return <ArticleDetailsComponent article={article} lang={lang} />
    } catch (error) {
        writeDebugLog('Error in ArticleDetailPage', { error: error instanceof Error ? error.message : String(error) });
        throw error; // Re-throw to let Next.js handle the 500
    }
};
