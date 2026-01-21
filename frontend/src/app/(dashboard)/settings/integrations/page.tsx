'use client';

import { useEffect, useState } from 'react';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';
import { UserIntegration, integrationsApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_INTEGRATIONS = [
    {
        id: 'entegra',
        name: 'Entegra',
        description: 'Entegra.com entegrasyonu ile tüm pazar yerlerindeki ürünlerinizi ve stoklarınızı tek panelden yönetin.'
    },
    {
        id: 'parasut',
        name: 'Paraşüt',
        description: 'Paraşüt ön muhasebe programı entegrasyonu',
        comingSoon: false,
    },
    {
        id: 'sentos',
        name: 'Sentos',
        description: 'Sentos çok yönlü e-ticaret entegrasyonu',
        comingSoon: false,
    },
    {
        id: 'bizimhesap',
        name: 'BizimHesap',
        description: 'BizimHesap ERP ve ön muhasebe entegrasyonu',
        comingSoon: false,
    },
];

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchIntegrations = async () => {
        try {
            const response = await integrationsApi.getAll();
            // TypeScript response structure adaptation if needed
            if (response.data) {
                // API returns wrapped in 'data', axios/fetch wrapper might return directly or wrapped
                // Based on api.ts, response.data is UserIntegration[] if status success.
                // Actually api.ts returns { data: ..., status: ... } or { error: ... }
                // Wait, integrationsApi.getAll returns Promise<ApiResponse<{ data: UserIntegration[] }>> ?
                // Let's check api.ts definition: getAll: () => api.get<{ data: UserIntegration[] }>('/settings/integrations')
                // And Controller returns { status: 'success', data: [...] }
                // So response.data will have { data: [...] } structure?
                // Let's assume we need to access response.data?.data

                // Wait, api.ts wrapper:
                // const data = await response.json(); return { data, status };
                // So response.data IS the payload from backend.
                // Backend payload: { status: 'success', data: [...] }
                // So response.data.data is the array.

                // But the type passed to api.get<T> is T.
                // So T is { data: UserIntegration[] }.
                // response.data is T.
                // So response.data.data is correct.

                // Wait, typing might be tricky. Let's inspect at runtime or cast carefully.
                // If ApiClient returns { data: T, ... }, and T is { data: UserIntegration[] }.

                // Let's cast safely.
                const payload = response.data as any;
                if (payload?.data) {
                    setIntegrations(payload.data);
                }
            }
        } catch (error) {
            toast.error('Entegrasyonlar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntegrations();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Entegrasyon Yönetimi</h1>
                <p className="text-gray-500">
                    ERP ve pazar yeri entegrasyonlarınızı buradan yönetebilir, ürünlerinizi otomatik senkronize edebilirsiniz.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {AVAILABLE_INTEGRATIONS.map((erp) => {
                    const integration = integrations.find((i) => i.erp_type === erp.id);

                    return (
                        <IntegrationCard
                            key={erp.id}
                            id={erp.id}
                            name={erp.name}
                            description={erp.description}
                            integration={integration}
                            onUpdate={fetchIntegrations}
                        />
                    );
                })}
            </div>
        </div>
    );
}
