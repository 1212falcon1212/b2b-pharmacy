'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { integrationsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ConnectDialogProps {
    erpType: string;
    erpName: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ConnectDialog({ erpType, erpName, isOpen, onOpenChange, onSuccess }: ConnectDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        api_key: '',
        api_secret: '',
        app_id: '',
        username: '',
        password: '',
    });

    const getLabels = () => {
        switch (erpType) {
            case 'parasut':
                return { apiKey: 'Client ID', apiSecret: 'Client Secret', appId: 'Company ID (Firma No)' };
            case 'sentos':
                return { apiKey: 'API Key', apiSecret: 'API Secret', appId: 'Mağaza Adı (Subdomain)' };
            case 'bizimhesap':
                return { apiKey: 'Token', apiSecret: 'Key (BZMHB...)', appId: 'Opsiyonel (Kullanılmıyor)' };
            case 'entegra':
                return { apiKey: 'Kullanıcı Adı / Email', apiSecret: 'Şifre', appId: 'Opsiyonel (Kullanılmıyor)' };
            default:
                return { apiKey: 'API Key', apiSecret: 'API Secret', appId: 'App ID' };
        }
    };

    const labels = getLabels();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await integrationsApi.save({
                erp_type: erpType,
                api_key: formData.api_key,
                api_secret: formData.api_secret,
                app_id: formData.app_id || undefined,
                username: formData.username || undefined,
                password: formData.password || undefined,
            } as any); // Use 'as any' to bypass strict type checking until interface is updated

            toast.success(`${erpName} bağlantısı başarıyla kuruldu`);
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || 'Bağlantı hatası oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{erpName} Entegrasyonu</DialogTitle>
                    <DialogDescription>
                        Lütfen {erpName} entegrasyon bilgilerini giriniz.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="api_key" className="text-right">
                            {labels.apiKey}
                        </Label>
                        <Input
                            id="api_key"
                            value={formData.api_key}
                            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="api_secret" className="text-right">
                            {labels.apiSecret}
                        </Label>
                        <Input
                            id="api_secret"
                            type="password"
                            value={formData.api_secret}
                            onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    {erpType !== 'entegra' && erpType !== 'bizimhesap' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="app_id" className="text-right">
                                {labels.appId}
                            </Label>
                            <Input
                                id="app_id"
                                value={formData.app_id}
                                onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
                                className="col-span-3"
                                required={erpType === 'parasut' || erpType === 'sentos'}
                            />
                        </div>
                    )}

                    {erpType === 'parasut' && (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">
                                    E-posta
                                </Label>
                                <Input
                                    id="username"
                                    type="email"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="col-span-3"
                                    required
                                    placeholder="Paraşüt giriş maili"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">
                                    Şifre
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="col-span-3"
                                    required
                                    placeholder="Paraşüt giriş şifresi"
                                />
                            </div>
                        </>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Bağlan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
