import { MetadataRoute } from 'next';

const baseUrl = 'https://eczanepazari.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        '',
        '/register',
        '/login',
        '/yardim',
        '/yardim/baslarken',
        '/yardim/satici-rehberi/urun-ekleme',
        '/yardim/satici-rehberi/fiyat-stok',
        '/yardim/satici-rehberi/siparis-yonetimi',
        '/yardim/satici-rehberi/hakedis',
        '/yardim/alici-rehberi/fiyat-karsilastirma',
        '/yardim/alici-rehberi/sepet-odeme',
        '/yardim/alici-rehberi/siparis-takibi',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));
}
