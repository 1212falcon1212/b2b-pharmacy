'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Lock, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Hesap Ayarları</h1>

            <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                <nav className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start gap-2 bg-slate-100 dark:bg-slate-800">
                        <User className="w-4 h-4" />
                        Profil Bilgileri
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2">
                        <Lock className="w-4 h-4" />
                        Güvenlik
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2">
                        <Bell className="w-4 h-4" />
                        Bildirimler
                    </Button>
                </nav>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profil Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Ad Soyad</Label>
                                <Input id="name" defaultValue="Eczane Admin" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input id="email" type="email" defaultValue="admin@eczane.com" disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" type="tel" placeholder="+90 555 123 45 67" />
                            </div>
                            <div className="flex justify-end">
                                <Button>Değişiklikleri Kaydet</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
