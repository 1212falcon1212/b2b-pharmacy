'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SellerSettingsPage() {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Ayarlar kaydedildi');
        setIsSaving(false);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ayarlar</h1>
                <p className="text-slate-500 dark:text-slate-400">Hesap ve bildirim ayarlarınızı yönetin</p>
            </div>

            {/* Profile Settings */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Profil Bilgileri
                    </CardTitle>
                    <CardDescription>Eczane ve iletişim bilgileriniz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Eczane Adı</Label>
                            <Input defaultValue={user?.pharmacy_name} className="mt-1.5" />
                        </div>
                        <div>
                            <Label>GLN Kodu</Label>
                            <Input defaultValue={user?.gln_code} disabled className="mt-1.5 font-mono bg-slate-50 dark:bg-slate-800" />
                        </div>
                        <div>
                            <Label>E-posta</Label>
                            <Input defaultValue={user?.email} type="email" className="mt-1.5" />
                        </div>
                        <div>
                            <Label>Telefon</Label>
                            <Input defaultValue={user?.phone || ''} type="tel" className="mt-1.5" placeholder="+90 5XX XXX XX XX" />
                        </div>
                        <div className="md:col-span-2">
                            <Label>Adres</Label>
                            <Input defaultValue={user?.address || ''} className="mt-1.5" placeholder="Eczane adresi" />
                        </div>
                        <div>
                            <Label>Şehir</Label>
                            <Input defaultValue={user?.city || ''} className="mt-1.5" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        Bildirim Ayarları
                    </CardTitle>
                    <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Yeni Sipariş Bildirimleri</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Yeni sipariş geldiğinde bildirim al</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Stok Uyarıları</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Stok azaldığında uyarı al</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">Ödeme Bildirimleri</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Ödeme ve hakediş bildirimleri</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Güvenlik
                    </CardTitle>
                    <CardDescription>Şifre ve güvenlik ayarları</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Mevcut Şifre</Label>
                            <Input type="password" className="mt-1.5" placeholder="••••••••" />
                        </div>
                        <div></div>
                        <div>
                            <Label>Yeni Şifre</Label>
                            <Input type="password" className="mt-1.5" placeholder="••••••••" />
                        </div>
                        <div>
                            <Label>Yeni Şifre (Tekrar)</Label>
                            <Input type="password" className="mt-1.5" placeholder="••••••••" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
            </div>
        </div>
    );
}
