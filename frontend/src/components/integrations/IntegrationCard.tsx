'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserIntegration, integrationsApi } from '@/lib/api';
import { ConnectDialog } from './ConnectDialog';
import { Loader2, RefreshCw, Trash2, CheckCircle2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationCardProps {
    id: string; // 'entegra', 'parasut' etc.
    name: string;
    description: string;
    integration?: UserIntegration;
    onUpdate: () => void;
}

export function IntegrationCard({ id, name, description, integration, onUpdate }: IntegrationCardProps) {
    const [connectOpen, setConnectOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isConnected = integration?.is_configured;

    const handleSync = async () => {
        setSyncing(true);
        try {
            await integrationsApi.sync(id);
            toast.success('Senkronizasyon işlemi başlatıldı.');
            // Backend job takes time, so we don't reload immediately but maybe later
        } catch (error: any) {
            toast.error('Senkronizasyon hatası: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bu entegrasyonu kaldırmak istediğinize emin misiniz?')) return;
        setDeleting(true);
        try {
            await integrationsApi.delete(id);
            toast.success('Entegrasyon kaldırıldı.');
            onUpdate();
        } catch (error: any) {
            toast.error('Kaldırma hatası: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Card className={isConnected ? 'border-emerald-500 shadow-md' : ''}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{name}</CardTitle>
                                <CardDescription className="text-xs mt-1">{description}</CardDescription>
                            </div>
                        </div>
                        {isConnected && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Bağlı
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isConnected ? (
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Durum</span>
                                <span className={integration?.status === 'error' ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>
                                    {integration?.status === 'active' ? 'Aktif' : (integration?.status === 'error' ? 'Hata' : 'Pasif')}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Son Senkronizasyon</span>
                                <span className="text-gray-900">
                                    {integration?.last_sync_at ? new Date(integration.last_sync_at).toLocaleString('tr-TR') : '-'}
                                </span>
                            </div>
                            {integration?.error_message && (
                                <div className="bg-red-50 text-red-700 p-2 rounded-md text-xs flex gap-2 items-start mt-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    {integration.error_message}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
                            Bu entegrasyon henüz yapılandırılmadı.
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    {isConnected ? (
                        <>
                            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Trash2 className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Kaldır</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                                {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Senkronize Et
                            </Button>
                        </>
                    ) : (
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setConnectOpen(true)}>
                            Bağlan
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <ConnectDialog
                erpType={id}
                erpName={name}
                isOpen={connectOpen}
                onOpenChange={setConnectOpen}
                onSuccess={onUpdate}
            />
        </>
    );
}
