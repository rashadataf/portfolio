import { type MetadataRoute } from 'next';

function getBaseUrl(): string {
    const protocol = process.env.PROTOCOL || 'https';
    const domain = process.env.DOMAIN_NAME || 'localhost';
    return `${protocol}://${domain}`;
}

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getBaseUrl();

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/about', '/projects', '/articles'],
                disallow: ['/api/', '/.next/', '/admin/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
