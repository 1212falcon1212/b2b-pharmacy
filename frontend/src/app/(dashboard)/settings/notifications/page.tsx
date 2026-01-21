'use client';

import { useEffect, useState } from 'react';
import { notificationsApi, NotificationSetting } from '@/lib/api';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, MessageSquare, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationSettingsPage() {
    const [settings, setSettings] = useState<NotificationSetting[]>([]);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

    useEffect(() => {
        loadSettings();
        if ('Notification' in window) {
            setPermissionStatus(Notification.permission);
        }
    }, []);

    const loadSettings = async () => {
        try {
            const response = await notificationsApi.getAll();
            if (response.data) {
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    const updateSetting = async (channel: string, type: string, enabled: boolean) => {
        // Optimistic update
        setSettings(prev => {
            const existing = prev.find(s => s.channel === channel && s.type === type);
            if (existing) {
                return prev.map(s => s.channel === channel && s.type === type ? { ...s, is_enabled: enabled } : s);
            }
            return [...prev, { id: Date.now(), channel, type, is_enabled: enabled } as any];
        });

        try {
            await notificationsApi.update({ channel, type, is_enabled: enabled });
        } catch (error) {
            console.error('Failed to update setting', error);
            loadSettings(); // Revert on error
        }
    };

    const getSettingValue = (channel: string, type: string) => {
        const setting = settings.find(s => s.channel === channel && s.type === type);
        // Default to true if not found? Or undefined? Backed defaults to true.
        return setting ? setting.is_enabled : true;
    };

    const requestPushPermission = async () => {
        if (!('Notification' in window)) return;

        try {
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);
            if (permission === 'granted') {
                // TODO: Get FCM Token and send to backend
                console.log('Permission granted');
            }
        } catch (error) {
            console.error('Permission request failed', error);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Bildirim Ayarları</h1>
                <p className="text-gray-600 mt-1">Hangi kanallardan bildirim almak istediğinizi yönetin.</p>
            </div>

            <div className="grid gap-6">
                {/* Push Notification Permission */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-emerald-600" />
                            Tarayıcı Bildirim İzni
                        </CardTitle>
                        <CardDescription>
                            Push bildirimlerini alabilmek için tarayıcınıza izin vermelisiniz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                Durum: <span className={permissionStatus === 'granted' ? 'text-green-600' : 'text-yellow-600'}>
                                    {permissionStatus === 'granted' ? 'İzin Verildi' : permissionStatus === 'denied' ? 'Engellendi' : 'Bekliyor'}
                                </span>
                            </span>
                            {permissionStatus !== 'granted' && (
                                <Button onClick={requestPushPermission} variant="outline" size="sm">
                                    İzin İste
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* SMS Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            SMS Bildirimleri
                        </CardTitle>
                        <CardDescription>
                            Kritik güncellemeler için SMS alın.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium">Sipariş Durumları</label>
                                <p className="text-sm text-gray-500">Siparişiniz kargolandığında veya teslim edildiğinde.</p>
                            </div>
                            <Switch
                                checked={getSettingValue('sms', 'order_update')}
                                onCheckedChange={(val) => updateSetting('sms', 'order_update', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium">Fiyat Düşüşü</label>
                                <p className="text-sm text-gray-500">Takip ettiğiniz ürünlerde fiyat düşünce.</p>
                            </div>
                            <Switch
                                checked={getSettingValue('sms', 'price_drop')}
                                onCheckedChange={(val) => updateSetting('sms', 'price_drop', val)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Push Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-purple-600" />
                            Uygulama İçi / Push Bildirimler
                        </CardTitle>
                        <CardDescription>
                            Anlık bildirimler.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium">Kampanyalar</label>
                                <p className="text-sm text-gray-500">Özel fırsat ve kampanyalardan haberdar olun.</p>
                            </div>
                            <Switch
                                checked={getSettingValue('push', 'campaign')}
                                onCheckedChange={(val) => updateSetting('push', 'campaign', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium">Fiyat Düşüşü</label>
                                <p className="text-sm text-gray-500">Favori ürünlerinizdeki indirimler.</p>
                            </div>
                            <Switch
                                checked={getSettingValue('push', 'price_drop')}
                                onCheckedChange={(val) => updateSetting('push', 'price_drop', val)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
