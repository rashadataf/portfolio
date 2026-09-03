import { type MetadataRoute } from 'next'
import { getPublishedArticles } from '@/modules/article/article.controller';

function getBaseUrl(): string {
    const protocol = process.env.PROTOCOL || 'https';
    const domain = process.env.DOMAIN_NAME || 'localhost';
    return `${protocol}://${domain}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];

    let articleRoutes: MetadataRoute.Sitemap = [];
    try {
        const { articles } = await getPublishedArticles();
        if (articles) {
            articleRoutes = articles.map((article) => ({
                url: `${baseUrl}/articles/${article.slugEn}`,
                lastModified: article.updatedAt || article.publicationDate || new Date(),
                changeFrequency: 'monthly' as const,
                priority: 0.6,
            }));
        }
    } catch (error) {
        console.error('Failed to fetch articles for sitemap:', error);
    }

    return [...staticRoutes, ...articleRoutes];
}