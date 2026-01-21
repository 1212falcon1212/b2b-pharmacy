'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import DOMPurify from 'dompurify';
import { legalApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LegalPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const loadContent = async () => {
            setLoading(true);
            try {
                const res = await legalApi.getDocument(slug);
                if (res.data) {
                    setContent(res.data.content);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [slug]);

    // Sanitize HTML content to prevent XSS attacks
    const sanitizedContent = useMemo(() => {
        if (!content) return null;
        return DOMPurify.sanitize(content, {
            ALLOWED_TAGS: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'br', 'hr',
                'ul', 'ol', 'li',
                'strong', 'em', 'b', 'i', 'u',
                'a', 'span', 'div',
                'table', 'thead', 'tbody', 'tr', 'th', 'td',
                'blockquote', 'pre', 'code'
            ],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
            ALLOW_DATA_ATTR: false,
        });
    }, [content]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Skeleton className="h-10 w-1/3 mb-8" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
            </div>
        );
    }

    if (!sanitizedContent) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Belge Bulunamadi</h1>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardContent className="prose prose-emerald max-w-none p-8" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            </Card>
        </div>
    );
}
