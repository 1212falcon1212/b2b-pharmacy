'use client';

import { useEffect, useState } from 'react';
import { walletApi, WalletSummary, WalletTransaction, BankAccount, PayoutRequest } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Plus, CreditCard, Send } from 'lucide-react';

export default function SellerWalletPage() {
    const [wallet, setWallet] = useState<WalletSummary | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [payoutAmount, setPayoutAmount] = useState('');
    const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
    const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [walletRes, txRes, bankRes, payoutRes] = await Promise.all([
                walletApi.getSummary(),
                walletApi.getTransactions(10),
                walletApi.getBankAccounts(),
                walletApi.getPayoutRequests(),
            ]);

            if (walletRes.data?.wallet) setWallet(walletRes.data.wallet);
            if (txRes.data?.transactions) setTransactions(txRes.data.transactions);
            if (bankRes.data?.bank_accounts) setBankAccounts(bankRes.data.bank_accounts);
            if (payoutRes.data?.payout_requests) setPayoutRequests(payoutRes.data.payout_requests);

            // Check for any API errors
            if (walletRes.error) console.error('Wallet API error:', walletRes.error);
            if (txRes.error) console.error('Transactions API error:', txRes.error);
            if (bankRes.error) console.error('Bank accounts API error:', bankRes.error);
            if (payoutRes.error) console.error('Payout requests API error:', payoutRes.error);
        } catch (err) {
            console.error('Wallet data fetch error:', err);
            setError('Veriler yüklenirken hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayoutRequest = async () => {
        if (!payoutAmount || !selectedBankId) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await walletApi.createPayoutRequest({
                amount: parseFloat(payoutAmount),
                bank_account_id: selectedBankId,
            });

            if (res.data?.success) {
                setPayoutDialogOpen(false);
                setPayoutAmount('');
                setSelectedBankId(null);
                fetchData();
            } else {
                setError(res.data?.error || res.error || 'Bir hata oluştu');
            }
        } catch (err) {
            console.error('Payout request error:', err);
            setError('Ödeme talebi oluşturulurken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cüzdanım</h1>
                    <p className="text-slate-500 dark:text-slate-400">Kazançlarınızı ve ödeme taleplerinizi yönetin</p>
                </div>

                <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Send className="h-4 w-4 mr-2" />
                            Ödeme Talebi
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ödeme Talebi Oluştur</DialogTitle>
                            <DialogDescription>
                                Çekilebilir bakiyenizden ödeme talep edin.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Tutar (₺)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    min="100"
                                    max={wallet?.balance || 0}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Mevcut: {formatMoney(wallet?.balance || 0)} (Min: 100₺)
                                </p>
                            </div>

                            <div>
                                <Label>Banka Hesabı</Label>
                                <div className="space-y-2 mt-2">
                                    {bankAccounts.map((account) => (
                                        <div
                                            key={account.id}
                                            onClick={() => setSelectedBankId(account.id)}
                                            className={`p-3 border rounded-lg cursor-pointer transition ${selectedBankId === account.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="font-medium text-slate-900 dark:text-white">{account.bank_name}</div>
                                            <div className="text-sm text-slate-500">{account.masked_iban}</div>
                                        </div>
                                    ))}
                                    {bankAccounts.length === 0 && (
                                        <p className="text-sm text-slate-500">
                                            Önce bir banka hesabı eklemeniz gerekiyor.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
                                İptal
                            </Button>
                            <Button
                                onClick={handlePayoutRequest}
                                disabled={!payoutAmount || !selectedBankId || isSubmitting}
                            >
                                {isSubmitting ? 'Gönderiliyor...' : 'Talep Oluştur'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Çekilebilir Bakiye
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatMoney(wallet?.balance || 0)}</div>
                        <p className="text-slate-300 text-sm mt-1">
                            Toplam: {formatMoney(wallet?.total_balance || 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2 text-amber-600">
                            <Clock className="h-5 w-5" />
                            Bekleyen Bakiye
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            {formatMoney(wallet?.pending_balance || 0)}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Teslimat sonrası aktif olacak</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2 text-blue-600">
                            <TrendingUp className="h-5 w-5" />
                            Toplam Kazanç
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            {formatMoney(wallet?.total_earned || 0)}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Komisyon: {formatMoney(wallet?.total_commission || 0)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Son İşlemler</CardTitle>
                    <CardDescription>Son 10 cüzdan hareketi</CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">Henüz işlem yok</p>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.direction === 'credit' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'
                                            }`}>
                                            {tx.direction === 'credit' ? (
                                                <ArrowDownRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            ) : (
                                                <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{tx.type_label}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{tx.description || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${tx.direction === 'credit' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {tx.direction === 'credit' ? '+' : '-'}{formatMoney(tx.amount)}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(tx.created_at).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bank Accounts */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Banka Hesapları</CardTitle>
                        <CardDescription>Ödeme alacağınız hesaplar</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Hesap Ekle
                    </Button>
                </CardHeader>
                <CardContent>
                    {bankAccounts.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Henüz banka hesabı eklenmedi</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bankAccounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-8 w-8 text-slate-400" />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{account.bank_name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{account.formatted_iban}</p>
                                            <p className="text-xs text-slate-400">{account.account_holder}</p>
                                        </div>
                                    </div>
                                    {account.is_default && (
                                        <Badge variant="secondary">Varsayılan</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
