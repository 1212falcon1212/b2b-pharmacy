'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MapPin, Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';
import { addressApi, Address } from '@/lib/api';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        name: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        postal_code: '',
        is_default: false
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const response = await addressApi.getAll();
            if (response.data) {
                setAddresses(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load addresses:', error);
            toast.error('Adresler yüklenirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                title: address.title,
                name: address.name,
                phone: address.phone,
                address: address.address,
                city: address.city,
                district: address.district,
                postal_code: address.postal_code || '',
                is_default: address.is_default
            });
        } else {
            setEditingAddress(null);
            setFormData({
                title: '',
                name: '',
                phone: '',
                address: '',
                city: '',
                district: '',
                postal_code: '',
                is_default: false
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingAddress) {
                await addressApi.update(editingAddress.id, formData);
                toast.success('Adres güncellendi');
            } else {
                await addressApi.create(formData);
                toast.success('Adres eklendi');
            }
            setIsDialogOpen(false);
            loadAddresses();
        } catch (error) {
            console.error('Failed to save address:', error);
            toast.error('Adres kaydedilirken hata oluştu');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return;

        try {
            await addressApi.delete(id);
            toast.success('Adres silindi');
            loadAddresses();
        } catch (error) {
            console.error('Failed to delete address:', error);
            toast.error('Adres silinirken hata oluştu');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between">
                    <div className="h-8 w-32 bg-slate-100 rounded animate-pulse" />
                    <div className="h-10 w-28 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2].map(i => (
                        <div key={i} className="h-48 bg-slate-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Adreslerim</h1>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Ekle
                </Button>
            </div>

            {addresses.length === 0 ? (
                <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <MapPin className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Henüz adres eklenmemiş</h3>
                        <p className="text-slate-500 mb-4 max-w-sm">
                            Siparişlerinizde kullanmak için teslimat ve fatura adresleri ekleyebilirsiniz.
                        </p>
                        <Button variant="outline" onClick={() => handleOpenDialog()}>
                            İlk Adresini Ekle
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {addresses.map((address) => (
                        <Card key={address.id} className={`relative ${address.is_default ? 'border-primary shadow-sm' : ''}`}>
                            {address.is_default && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-bl-lg rounded-tr-lg">
                                    Varsayılan
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                    {address.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                    <p className="font-medium text-slate-900 dark:text-white mb-1">{address.name}</p>
                                    <p className="mb-1">{address.address}</p>
                                    <p>{address.district}/{address.city}</p>
                                    <p className="mt-2 text-slate-500">{address.phone}</p>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(address)}>
                                        <Edit2 className="w-3 h-3 mr-2" />
                                        Düzenle
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(address.id)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}</DialogTitle>
                        <DialogDescription>
                            Teslimat adres bilgilerinizi aşağıya giriniz.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Adres Başlığı (Örn: Ev, Eczane)</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="Eczane Merkez"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Ad Soyad</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Ad Soyad"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="05..."
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">İl</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="district">İlçe</Label>
                            <Input
                                id="district"
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Açık Adres</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                                placeholder="Mahalle, sokak, no..."
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_default"
                                checked={formData.is_default}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                            />
                            <Label htmlFor="is_default">Varsayılan adres olarak işaretle</Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kaydet
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
