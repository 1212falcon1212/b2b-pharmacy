import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/my-orders/', '/checkout/', '/settings/', '/wallet/', '/admin/'],
        },
        sitemap: 'https://eczanepazari.com/sitemap.xml',
    };
}
