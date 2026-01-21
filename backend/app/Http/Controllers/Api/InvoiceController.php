<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    protected InvoiceService $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    /**
     * Satıcının faturalarını listele
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $type = $request->input('type');
        $perPage = $request->input('per_page', 15);

        $invoices = $this->invoiceService->getSellerInvoices($user->id, $type, $perPage);

        return response()->json([
            'success' => true,
            'data' => $invoices->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'type' => $invoice->type,
                    'type_label' => $invoice->getTypeLabel(),
                    'status' => $invoice->status,
                    'status_label' => $invoice->getStatusLabel(),
                    'subtotal' => $invoice->subtotal,
                    'tax_amount' => $invoice->tax_amount,
                    'total_amount' => $invoice->total_amount,
                    'formatted_total' => $invoice->formatted_total,
                    'order_number' => $invoice->order?->order_number,
                    'buyer_name' => $invoice->buyer_info['name'] ?? null,
                    'erp_status' => $invoice->erp_status,
                    'pdf_path' => $invoice->pdf_path,
                    'created_at' => $invoice->created_at->format('d.m.Y H:i'),
                ];
            }),
            'pagination' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
        ]);
    }

    /**
     * Tek fatura detayı
     */
    public function show(Invoice $invoice, Request $request): JsonResponse
    {
        $user = $request->user();

        // Erişim kontrolü
        if ($invoice->seller_id !== $user->id && !$user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'error' => 'Bu faturaya erişim yetkiniz yok.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'type' => $invoice->type,
                'type_label' => $invoice->getTypeLabel(),
                'status' => $invoice->status,
                'status_label' => $invoice->getStatusLabel(),
                'subtotal' => $invoice->subtotal,
                'tax_rate' => $invoice->tax_rate,
                'tax_amount' => $invoice->tax_amount,
                'total_amount' => $invoice->total_amount,
                'formatted_total' => $invoice->formatted_total,
                'commission_rate' => $invoice->commission_rate,
                'commission_amount' => $invoice->commission_amount,
                'seller_info' => $invoice->seller_info,
                'buyer_info' => $invoice->buyer_info,
                'items' => $invoice->items,
                'order_id' => $invoice->order_id,
                'order_number' => $invoice->order?->order_number,
                'erp_provider' => $invoice->erp_provider,
                'erp_status' => $invoice->erp_status,
                'erp_invoice_id' => $invoice->erp_invoice_id,
                'erp_error' => $invoice->erp_error,
                'pdf_path' => $invoice->pdf_path,
                'notes' => $invoice->notes,
                'created_at' => $invoice->created_at->format('d.m.Y H:i'),
            ],
        ]);
    }

    /**
     * Sipariş için fatura oluştur (satıcı tarafından)
     */
    public function createForOrder(Order $order, Request $request): JsonResponse
    {
        $user = $request->user();

        // Satıcının bu siparişte ürünü var mı kontrol et
        $hasItems = $order->items()->where('seller_id', $user->id)->exists();
        if (!$hasItems) {
            return response()->json([
                'success' => false,
                'error' => 'Bu siparişte ürününüz bulunmuyor.',
            ], 403);
        }

        // Sipariş ödenmiş mi kontrol et
        if ($order->payment_status !== 'paid') {
            return response()->json([
                'success' => false,
                'error' => 'Sipariş henüz ödenmedi.',
            ], 400);
        }

        // Önceden fatura oluşturulmuş mu kontrol et
        $existingInvoice = Invoice::where('order_id', $order->id)
            ->where('seller_id', $user->id)
            ->where('type', Invoice::TYPE_SELLER)
            ->first();

        if ($existingInvoice) {
            return response()->json([
                'success' => true,
                'message' => 'Bu sipariş için fatura zaten oluşturulmuş.',
                'invoice' => [
                    'id' => $existingInvoice->id,
                    'invoice_number' => $existingInvoice->invoice_number,
                    'formatted_total' => $existingInvoice->formatted_total,
                ],
            ]);
        }

        try {
            $invoice = $this->invoiceService->createSellerInvoice($order, $user->id);

            return response()->json([
                'success' => true,
                'message' => 'Fatura başarıyla oluşturuldu.',
                'invoice' => [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'formatted_total' => $invoice->formatted_total,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Komisyon özeti (satıcı için)
     */
    public function commissionSummary(Request $request): JsonResponse
    {
        $user = $request->user();
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $summary = $this->invoiceService->getSellerCommissionSummary(
            $user->id,
            $startDate,
            $endDate
        );

        return response()->json([
            'success' => true,
            'data' => [
                'total_sales' => [
                    'value' => $summary['total_sales'],
                    'formatted' => '₺' . number_format($summary['total_sales'], 2, ',', '.'),
                ],
                'total_commission' => [
                    'value' => $summary['total_commission'],
                    'formatted' => '₺' . number_format($summary['total_commission'], 2, ',', '.'),
                ],
                'total_payout' => [
                    'value' => $summary['total_payout'],
                    'formatted' => '₺' . number_format($summary['total_payout'], 2, ',', '.'),
                ],
                'order_count' => $summary['order_count'],
                'item_count' => $summary['item_count'],
                'average_commission_rate' => $summary['total_sales'] > 0
                    ? round(($summary['total_commission'] / $summary['total_sales']) * 100, 2) . '%'
                    : '0%',
            ],
        ]);
    }

    /**
     * Faturayı ERP'ye gönder
     */
    public function syncToErp(Invoice $invoice, Request $request): JsonResponse
    {
        $user = $request->user();

        // Erişim kontrolü
        if ($invoice->seller_id !== $user->id && !$user->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'error' => 'Bu faturaya erişim yetkiniz yok.',
            ], 403);
        }

        // ERP entegrasyonu kontrol et
        $integration = $user->integrations()
            ->where('provider', 'bizimhesap')
            ->where('is_active', true)
            ->first();

        if (!$integration) {
            return response()->json([
                'success' => false,
                'error' => 'BizimHesap entegrasyonu aktif değil.',
            ], 400);
        }

        // TODO: BizimHesap API'ye fatura gönder
        // Şimdilik mock response
        $invoice->update([
            'erp_provider' => 'bizimhesap',
            'erp_status' => 'synced',
            'erp_invoice_id' => 'BH-' . time(),
            'erp_synced_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Fatura BizimHesap\'a gönderildi.',
            'erp_invoice_id' => $invoice->erp_invoice_id,
        ]);
    }
}
