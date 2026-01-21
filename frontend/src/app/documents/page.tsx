"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { documentsApi, SellerDocument } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Upload,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Trash2,
    AlertTriangle,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";

const DOCUMENT_TYPES = [
    { value: "ruhsat", label: "Eczane Ruhsatı", required: true },
    { value: "oda_kaydi", label: "Eczacılar Odası Kayıt Belgesi", required: true },
    { value: "vergi_levhasi", label: "Vergi Levhası", required: true },
    { value: "kimlik", label: "Kimlik Fotokopisi", required: false },
    { value: "imza_sirkusu", label: "İmza Sirküleri", required: false },
];

const STATUS_CONFIG = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Bekliyor" },
    approved: { color: "bg-green-100 text-green-800", icon: CheckCircle2, label: "Onaylandı" },
    rejected: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Reddedildi" },
};

export default function DocumentsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [documents, setDocuments] = useState<SellerDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [allApproved, setAllApproved] = useState(false);
    const [missingTypes, setMissingTypes] = useState<string[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            loadDocuments();
        }
    }, [user, authLoading]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentsApi.getAll();
            if (response.data) {
                setDocuments(response.data.documents);
                setAllApproved(response.data.all_approved);
                setMissingTypes(response.data.missing_types);
            }
        } catch (error) {
            console.error("Failed to load documents:", error);
            toast.error("Belgeler yüklenirken hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedType) return;

        // Validate file
        const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            toast.error("Sadece PDF, JPG ve PNG dosyaları yüklenebilir");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Dosya boyutu 10MB'dan küçük olmalıdır");
            return;
        }

        try {
            setUploading(true);
            const response = await documentsApi.upload(selectedType, file);
            if (response.data) {
                toast.success("Belge başarıyla yüklendi");
                loadDocuments();
                setSelectedType("");
            } else {
                toast.error(response.error || "Belge yüklenirken hata oluştu");
            }
        } catch (error) {
            toast.error("Belge yüklenirken hata oluştu");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await documentsApi.delete(id);
            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success("Belge silindi");
                loadDocuments();
            }
        } catch (error) {
            toast.error("Belge silinirken hata oluştu");
        }
    };

    const getDocumentByType = (type: string) => {
        return documents.find((d) => d.type === type);
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Evrak Yönetimi</h1>
                    <p className="text-gray-500 mt-2">
                        Platformu kullanabilmek için gerekli evrakları yükleyin ve onay sürecini takip edin.
                    </p>
                </div>

                {/* Status Alert */}
                {allApproved ? (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <div>
                            <h3 className="font-medium text-green-800">Evraklarınız Onaylandı</h3>
                            <p className="text-sm text-green-700">Tüm gerekli evraklarınız onaylanmış. Platforma tam erişiminiz var.</p>
                        </div>
                        <Button
                            className="ml-auto"
                            onClick={() => router.push("/dashboard")}
                        >
                            Dashboard'a Git
                        </Button>
                    </div>
                ) : (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-amber-800">Evrak Onayı Gerekli</h3>
                            <p className="text-sm text-amber-700">
                                Platformu kullanabilmek için gerekli evrakları yükleyin ve onay bekleyin.
                                {missingTypes.length > 0 && (
                                    <span className="block mt-1">
                                        Eksik belgeler: {missingTypes.map((t) =>
                                            DOCUMENT_TYPES.find((d) => d.value === t)?.label
                                        ).join(", ")}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Upload Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Yeni Belge Yükle</CardTitle>
                        <CardDescription>
                            PDF, JPG veya PNG formatında, maksimum 10MB boyutunda dosya yükleyebilirsiniz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-full sm:w-64">
                                    <SelectValue placeholder="Belge tipi seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map((type) => {
                                        const existing = getDocumentByType(type.value);
                                        const disabled = existing?.status === "approved";
                                        return (
                                            <SelectItem
                                                key={type.value}
                                                value={type.value}
                                                disabled={disabled}
                                            >
                                                {type.label} {type.required && "*"}
                                                {disabled && " (Onaylı)"}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!selectedType || uploading}
                                className="gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                {uploading ? "Yükleniyor..." : "Dosya Seç ve Yükle"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Yüklenen Belgeler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {DOCUMENT_TYPES.map((type) => {
                                const doc = getDocumentByType(type.value);
                                const StatusIcon = doc ? STATUS_CONFIG[doc.status].icon : null;

                                return (
                                    <div
                                        key={type.value}
                                        className={`p-4 rounded-lg border ${doc ? "bg-white" : "bg-gray-50 border-dashed"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${doc ? "bg-blue-100" : "bg-gray-200"}`}>
                                                    <FileText className={`h-5 w-5 ${doc ? "text-blue-600" : "text-gray-400"}`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {type.label}
                                                        {type.required && <span className="text-red-500 ml-1">*</span>}
                                                    </h4>
                                                    {doc ? (
                                                        <p className="text-sm text-gray-500">{doc.original_name}</p>
                                                    ) : (
                                                        <p className="text-sm text-gray-400">Henüz yüklenmedi</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {doc && (
                                                    <>
                                                        <Badge className={STATUS_CONFIG[doc.status].color}>
                                                            {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                                                            {STATUS_CONFIG[doc.status].label}
                                                        </Badge>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.open(doc.file_url, "_blank")}
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>

                                                        {doc.status !== "approved" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(doc.id)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {doc?.status === "rejected" && doc.rejection_reason && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                                                <p className="text-sm text-red-700">
                                                    <strong>Ret Sebebi:</strong> {doc.rejection_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Info */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        Belgeleriniz en kısa sürede incelenecektir.
                        Onay sürecinde herhangi bir sorun yaşarsanız
                        <a href="mailto:destek@b2b-eczane.com" className="text-green-600 hover:underline ml-1">
                            destek@b2b-eczane.com
                        </a>
                        {" "}adresinden iletişime geçebilirsiniz.
                    </p>
                </div>
            </div>
        </div>
    );
}
