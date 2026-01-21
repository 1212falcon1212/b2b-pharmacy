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
        description: 'Entegra.com entegrasyonu ile tüm pazar yerlerindeki ürünlerinizi ve stoklarınızı tek panelden yönetin.',
        icon: '🔗'
    },
    {
        id: 'parasut',
        name: 'Paraşüt',
        description: 'Paraşüt ön muhasebe programı entegrasyonu ile fatura ve muhasebe işlemlerinizi otomatikleştirin.',
        icon: '📊'
    },
    {
        id: 'sentos',
        name: 'Sentos',
        description: 'Sentos çok yönlü e-ticaret entegrasyonu ile stok ve sipariş yönetimi.',
        icon: '🛒'
    },
    {
        id: 'bizimhesap',
        name: 'BizimHesap',
        description: 'BizimHesap ERP ve ön muhasebe entegrasyonu ile finansal süreçlerinizi yönetin.',
        icon: '💼'
    },
];

export default function SellerIntegrationsPage() {
    const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchIntegrations = async () => {
        try {
            const response = await integrationsApi.getAll();
            const payload = response.data as any;
            if (payload?.data) {
                setIntegrations(payload.data);
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">ERP Entegrasyonları</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    ERP ve muhasebe sistemleri ile entegre olun, ürünlerinizi otomatik senkronize edin.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
