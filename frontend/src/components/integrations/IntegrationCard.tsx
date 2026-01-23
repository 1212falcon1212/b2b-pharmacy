'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserIntegration, integrationsApi } from '@/lib/api';
import { Loader2, RefreshCw, Trash2, CheckCircle2, AlertCircle, ChevronDown, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IntegrationCardProps {
    id: string;
    name: string;
    description: string;
    logo?: string;
    integration?: UserIntegration;
    onUpdate: () => void;
}

// ERP-specific field configuration
const ERP_CONFIG: Record<string, {
    fields: {
        key: string;
        label: string;
        required?: boolean;
        type?: string;
        placeholder?: string;
    }[];
    description?: string;
}> = {
    entegra: {
        fields: [
            { key: 'api_key', label: 'Kullanici Adi / Email', required: true, placeholder: 'ornek@email.com' },
            { key: 'api_secret', label: 'Sifre', required: true, type: 'password', placeholder: '••••••••' },
        ],
    },
    parasut: {
        fields: [
            { key: 'api_key', label: 'Client ID', required: true, placeholder: 'Client ID' },
            { key: 'api_secret', label: 'Client Secret', required: true, type: 'password', placeholder: '••••••••' },
            { key: 'app_id', label: 'Firma No (Company ID)', required: true, placeholder: '123456' },
            { key: 'username', label: 'E-posta', required: true, type: 'email', placeholder: 'ornek@email.com' },
            { key: 'password', label: 'Sifre', required: true, type: 'password', placeholder: '••••••••' },
        ],
    },
    sentos: {
        fields: [
            { key: 'api_key', label: 'API Key', required: true, placeholder: 'API Key' },
            { key: 'api_secret', label: 'API Secret', required: true, type: 'password', placeholder: '••••••••' },
            { key: 'app_id', label: 'Magaza Adi (Subdomain)', required: true, placeholder: 'magazaadi' },
        ],
    },
    bizimhesap: {
        fields: [
            { key: 'api_key', label: 'Token', required: true, placeholder: 'Token' },
            { key: 'api_secret', label: 'Key (BZMHB...)', required: true, placeholder: 'BZMHB...' },
        ],
    },
    stockmount: {
        fields: [
            { key: 'username', label: 'Kullanici Adi', required: true, placeholder: 'Kullanici adi' },
            { key: 'password', label: 'Sifre', required: true, type: 'password', placeholder: '••••••••' },
        ],
    },
    dopigo: {
        fields: [
            { key: 'username', label: 'Kullanici Adi', required: true, placeholder: 'Kullanici adi' },
            { key: 'password', label: 'Sifre', required: true, type: 'password', placeholder: '••••••••' },
        ],
    },
    kolaysoft: {
        fields: [
            { key: 'username', label: 'Kullanici Adi', required: true, placeholder: 'Kullanici adi' },
            { key: 'password', label: 'Sifre', required: true, type: 'password', placeholder: '••••••••' },
            { key: 'test_mode', label: 'Test Modu', type: 'switch' },
        ],
    },
};

export function IntegrationCard({ id, name, description, logo, integration, onUpdate }: IntegrationCardProps) {
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [formData, setFormData] = useState<Record<string, string | boolean>>({});

    const isConnected = integration?.is_configured;
    const isActive = integration?.status === 'active';
    const hasError = integration?.status === 'error';

    const config = ERP_CONFIG[id] || {
        fields: [
            { key: 'api_key', label: 'API Key', required: true },
            { key: 'api_secret', label: 'API Secret', required: true, type: 'password' },
        ],
    };

    // Initialize form with empty values
    useEffect(() => {
        const initialData: Record<string, string | boolean> = {};
        config.fields.forEach(field => {
            initialData[field.key] = field.type === 'switch' ? false : '';
        });
        setFormData(initialData);
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload: Record<string, any> = { erp_type: id };

            Object.entries(formData).forEach(([key, value]) => {
                if (value !== '' && value !== false) {
                    payload[key] = value;
                }
            });

            await integrationsApi.save(payload as any);
            toast.success(`${name} baglantisi basariyla kaydedildi`);
            onUpdate();

            // Clear form after save
            const clearedData: Record<string, string | boolean> = {};
            config.fields.forEach(field => {
                clearedData[field.key] = field.type === 'switch' ? false : '';
            });
            setFormData(clearedData);
        } catch (error: any) {
            toast.error(error.message || 'Kaydetme hatasi olustu');
        } finally {
            setSaving(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await integrationsApi.sync(id);
            toast.success('Senkronizasyon islemi baslatildi.');
        } catch (error: any) {
            toast.error('Senkronizasyon hatasi: ' + error.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bu entegrasyonu kaldirmak istediginize emin misiniz?')) return;
        setDeleting(true);
        try {
            await integrationsApi.delete(id);
            toast.success('Entegrasyon kaldirildi.');
            onUpdate();
        } catch (error: any) {
            toast.error('Kaldirma hatasi: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const updateField = (key: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logo ? (
                            <Image src={logo} alt={name} width={40} height={40} className="object-contain" />
                        ) : (
                            <span className="text-lg font-bold text-slate-400">{name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-slate-900">{name}</h3>
                        <p className="text-sm text-slate-500">{description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isConnected && (
                        <Badge
                            variant="outline"
                            className={cn(
                                "gap-1",
                                isActive && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                hasError && "bg-red-50 text-red-700 border-red-200",
                                !isActive && !hasError && "bg-amber-50 text-amber-700 border-amber-200"
                            )}
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            {isActive ? 'Aktif' : hasError ? 'Hata' : 'Pasif'}
                        </Badge>
                    )}
                    <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-200", expanded && "rotate-180")} />
                </div>
            </button>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                    {isConnected ? (
                        /* Connected State - Show status and actions */
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                    <span className="text-slate-500 block mb-1">Durum</span>
                                    <span className={cn(
                                        "font-medium",
                                        isActive && "text-emerald-600",
                                        hasError && "text-red-600",
                                        !isActive && !hasError && "text-amber-600"
                                    )}>
                                        {isActive ? 'Aktif' : hasError ? 'Hata' : 'Beklemede'}
                                    </span>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                    <span className="text-slate-500 block mb-1">Son Senkronizasyon</span>
                                    <span className="font-medium text-slate-900">
                                        {integration?.last_sync_at
                                            ? new Date(integration.last_sync_at).toLocaleString('tr-TR')
                                            : '-'
                                        }
                                    </span>
                                </div>
                            </div>

                            {integration?.error_message && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex gap-2 items-start border border-red-200">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{integration.error_message}</span>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-2">
                                <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                                    {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    Senkronize Et
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                                    {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Kaldir
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Not Connected State - Show inline form */
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {config.fields.map((field) => (
                                    <div key={field.key} className={field.type === 'switch' ? 'sm:col-span-2' : ''}>
                                        {field.type === 'switch' ? (
                                            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200">
                                                <Label htmlFor={`${id}-${field.key}`} className="text-sm font-medium text-slate-700">
                                                    {field.label}
                                                </Label>
                                                <Switch
                                                    id={`${id}-${field.key}`}
                                                    checked={formData[field.key] as boolean}
                                                    onCheckedChange={(checked) => updateField(field.key, checked)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`${id}-${field.key}`} className="text-sm font-medium text-slate-700">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                </Label>
                                                <Input
                                                    id={`${id}-${field.key}`}
                                                    type={field.type || 'text'}
                                                    value={formData[field.key] as string || ''}
                                                    onChange={(e) => updateField(field.key, e.target.value)}
                                                    placeholder={field.placeholder || field.label}
                                                    className="bg-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {saving ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Kaydet ve Baglan
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
