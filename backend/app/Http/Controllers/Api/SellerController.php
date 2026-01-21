<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Offer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SellerController extends Controller
{
    /**
     * Get seller dashboard stats
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Bu ayki satışlar
        $currentMonthSales = OrderItem::where('seller_id', $user->id)
            ->whereHas('order', function ($query) {
                $query->whereIn('payment_status', ['paid']);
            })
            ->whereBetween('created_at', [$startOfMonth, $now])
            ->sum('total_price');

        // Geçen ayki satışlar
        $lastMonthSales = OrderItem::where('seller_id', $user->id)
            ->whereHas('order', function ($query) {
                $query->whereIn('payment_status', ['paid']);
            })
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->sum('total_price');

        // Satış değişim yüzdesi
        $salesChange = $lastMonthSales > 0
            ? round((($currentMonthSales - $lastMonthSales) / $lastMonthSales) * 100, 1)
            : ($currentMonthSales > 0 ? 100 : 0);

        // Aktif teklifler
        $activeOffers = Offer::where('seller_id', $user->id)
            ->where('status', 'active')
            ->where('stock', '>', 0)
            ->where('expiry_date', '>', $now)
            ->count();

        // Bekleyen siparişler
        $pendingOrders = OrderItem::where('seller_id', $user->id)
            ->whereHas('order', function ($query) {
                $query->whereIn('status', ['pending', 'confirmed', 'processing']);
            })
            ->distinct('order_id')
            ->count('order_id');

        // Cüzdan bakiyesi
        $walletBalance = $user->wallet?->balance ?? 0;

        // Bekleyen hakediş
        $pendingPayout = $user->wallet?->pending_balance ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_sales' => [
                    'value' => $currentMonthSales,
                    'formatted' => '₺' . number_format($currentMonthSales, 2, ',', '.'),
                    'change' => ($salesChange >= 0 ? '+' : '') . $salesChange . '%',
                    'trend' => $salesChange >= 0 ? 'up' : 'down',
                ],
                'active_offers' => [
                    'value' => $activeOffers,
                    'formatted' => (string) $activeOffers,
                ],
                'pending_orders' => [
                    'value' => $pendingOrders,
                    'formatted' => (string) $pendingOrders,
                ],
                'wallet_balance' => [
                    'value' => $walletBalance,
                    'formatted' => '₺' . number_format($walletBalance, 2, ',', '.'),
                    'pending' => '₺' . number_format($pendingPayout, 2, ',', '.'),
                ],
            ],
        ]);
    }

    /**
     * Get seller's recent orders
     */
    public function recentOrders(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $request->input('limit', 5);

        // Satıcının sipariş kalemlerinden siparişleri al
        $orderIds = OrderItem::where('seller_id', $user->id)
            ->distinct()
            ->pluck('order_id');

        $orders = Order::whereIn('id', $orderIds)
            ->with([
                'items' => function ($query) use ($user) {
                    $query->where('seller_id', $user->id)
                        ->with('product:id,name,brand');
                },
                'user:id,pharmacy_name,city'
            ])
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($order) use ($user) {
                $sellerItems = $order->items->where('seller_id', $user->id);
                $sellerTotal = $sellerItems->sum('total_price');
                $productNames = $sellerItems->pluck('product.name')->take(2)->join(', ');

                if ($sellerItems->count() > 2) {
                    $productNames .= ' +' . ($sellerItems->count() - 2) . ' ürün';
                }

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'product' => $productNames,
                    'buyer' => $order->user->pharmacy_name ?? 'Bilinmiyor',
                    'amount' => '₺' . number_format($sellerTotal, 2, ',', '.'),
                    'status' => $order->status,
                    'status_label' => $this->getStatusLabel($order->status),
                    'created_at' => $order->created_at->format('d.m.Y H:i'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Get seller's products (products they have offers for)
     */
    public function products(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 15);

        $offers = Offer::where('seller_id', $user->id)
            ->with(['product:id,name,barcode,brand,image', 'product.category:id,name'])
            ->latest()
            ->paginate($perPage);

        $products = $offers->map(function ($offer) {
            return [
                'id' => $offer->product->id,
                'offer_id' => $offer->id,
                'name' => $offer->product->name,
                'barcode' => $offer->product->barcode,
                'brand' => $offer->product->brand,
                'image' => $offer->product->image,
                'category' => $offer->product->category?->name,
                'price' => $offer->price,
                'stock' => $offer->stock,
                'status' => $offer->status,
                'expiry_date' => $offer->expiry_date?->format('Y-m-d'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $products,
            'pagination' => [
                'current_page' => $offers->currentPage(),
                'last_page' => $offers->lastPage(),
                'per_page' => $offers->perPage(),
                'total' => $offers->total(),
            ],
        ]);
    }

    /**
     * Get seller's orders
     */
    public function orders(Request $request): JsonResponse
    {
        $user = $request->user();
        $status = $request->input('status');
        $perPage = $request->input('per_page', 15);

        $orderIds = OrderItem::where('seller_id', $user->id)
            ->distinct()
            ->pluck('order_id');

        $query = Order::whereIn('id', $orderIds)
            ->with([
                'items' => function ($query) use ($user) {
                    $query->where('seller_id', $user->id)
                        ->with('product:id,name,brand,image');
                },
                'user:id,pharmacy_name,city'
            ]);

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->latest()->paginate($perPage);

        $formattedOrders = $orders->map(function ($order) use ($user) {
            $sellerItems = $order->items->where('seller_id', $user->id);
            $sellerTotal = $sellerItems->sum('total_price');

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'buyer' => [
                    'name' => $order->user->pharmacy_name ?? 'Bilinmiyor',
                    'city' => $order->user->city ?? '',
                ],
                'items' => $sellerItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_name' => $item->product->name,
                        'brand' => $item->product->brand,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total' => $item->total_price,
                    ];
                })->values(),
                'total' => $sellerTotal,
                'formatted_total' => '₺' . number_format($sellerTotal, 2, ',', '.'),
                'status' => $order->status,
                'status_label' => $this->getStatusLabel($order->status),
                'payment_status' => $order->payment_status,
                'created_at' => $order->created_at->format('d.m.Y H:i'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedOrders,
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Get status label in Turkish
     */
    private function getStatusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'Bekliyor',
            'confirmed' => 'Onaylandı',
            'processing' => 'Hazırlanıyor',
            'shipped' => 'Kargoda',
            'delivered' => 'Teslim Edildi',
            'cancelled' => 'İptal Edildi',
            default => $status,
        };
    }

    /**
     * Get single order detail with fee breakdown
     */
    public function orderDetail(Request $request, int $orderId): JsonResponse
    {
        $user = $request->user();

        $order = Order::with([
            'items' => function ($query) use ($user) {
                $query->where('seller_id', $user->id)
                    ->with('product:id,name,brand,barcode,image,desi');
            },
            'user:id,pharmacy_name,email,phone,city,district'
        ])->find($orderId);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Sipariş bulunamadı'], 404);
        }

        // Satıcının bu siparişte ürünü var mı?
        $sellerItems = $order->items->where('seller_id', $user->id);
        if ($sellerItems->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Bu siparişe erişim yetkiniz yok'], 403);
        }

        // Fee rates
        $marketplaceFeeRate = (float) \App\Models\Setting::getValue('commission.marketplace_fee_rate', 0.89);
        $withholdingTaxRate = (float) \App\Models\Setting::getValue('commission.withholding_tax_rate', 1.00);

        // Kesinti hesapları
        $totalSales = $sellerItems->sum('total_price');
        $totalCommission = $sellerItems->sum('commission_amount');
        $totalMarketplaceFee = $sellerItems->sum('marketplace_fee');
        $totalWithholdingTax = $sellerItems->sum('withholding_tax');
        $totalShippingShare = $sellerItems->sum('shipping_cost_share');
        $netSellerAmount = $sellerItems->sum('net_seller_amount');

        // Eğer yeni alanlar henüz hesaplanmamışsa, hesapla
        if ($totalMarketplaceFee == 0 && $totalWithholdingTax == 0) {
            $totalMarketplaceFee = $totalSales * ($marketplaceFeeRate / 100);
            $totalWithholdingTax = $totalSales * ($withholdingTaxRate / 100);
            $netSellerAmount = $totalSales - $totalCommission - $totalMarketplaceFee - $totalWithholdingTax - $totalShippingShare;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'status_label' => $this->getStatusLabel($order->status),
                'payment_status' => $order->payment_status,
                'shipping_status' => $order->shipping_status,
                'tracking_number' => $order->tracking_number,
                'shipping_provider' => $order->shipping_provider,
                'shipping_label_url' => $order->shipping_label_url,
                'created_at' => $order->created_at->format('d.m.Y H:i'),
                'shipped_at' => $order->shipped_at?->format('d.m.Y H:i'),
                'delivered_at' => $order->delivered_at?->format('d.m.Y H:i'),

                // Alıcı bilgileri
                'buyer' => [
                    'name' => $order->user->pharmacy_name ?? 'Bilinmiyor',
                    'email' => $order->user->email,
                    'phone' => $order->user->phone,
                    'city' => $order->user->city,
                    'district' => $order->user->district,
                    'address' => $order->shipping_address['address'] ?? '',
                ],

                // Sipariş kalemleri
                'items' => $sellerItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_id' => $item->product_id,
                        'product_name' => $item->product->name,
                        'brand' => $item->product->brand,
                        'barcode' => $item->product->barcode,
                        'image' => $item->product->image,
                        'desi' => $item->product->desi,
                        'quantity' => $item->quantity,
                        'unit_price' => (float) $item->unit_price,
                        'total_price' => (float) $item->total_price,
                    ];
                })->values(),

                // Finansal özet
                'financials' => [
                    'subtotal' => [
                        'label' => 'Ürün Toplamı',
                        'value' => round($totalSales, 2),
                        'formatted' => '₺' . number_format($totalSales, 2, ',', '.'),
                    ],
                    'deductions' => [
                        [
                            'label' => 'Kategori Komisyonu',
                            'rate' => null, // Ürüne göre değişir
                            'value' => round($totalCommission, 2),
                            'formatted' => '-₺' . number_format($totalCommission, 2, ',', '.'),
                        ],
                        [
                            'label' => 'Pazaryeri Hizmet Bedeli',
                            'rate' => $marketplaceFeeRate,
                            'value' => round($totalMarketplaceFee, 2),
                            'formatted' => '-₺' . number_format($totalMarketplaceFee, 2, ',', '.'),
                        ],
                        [
                            'label' => 'Stopaj',
                            'rate' => $withholdingTaxRate,
                            'value' => round($totalWithholdingTax, 2),
                            'formatted' => '-₺' . number_format($totalWithholdingTax, 2, ',', '.'),
                        ],
                        [
                            'label' => 'Kargo Payı',
                            'rate' => null,
                            'value' => round($totalShippingShare, 2),
                            'formatted' => '-₺' . number_format($totalShippingShare, 2, ',', '.'),
                            'visible' => $totalShippingShare > 0,
                        ],
                    ],
                    'total_deductions' => [
                        'label' => 'Toplam Kesinti',
                        'value' => round($totalCommission + $totalMarketplaceFee + $totalWithholdingTax + $totalShippingShare, 2),
                        'formatted' => '-₺' . number_format($totalCommission + $totalMarketplaceFee + $totalWithholdingTax + $totalShippingShare, 2, ',', '.'),
                    ],
                    'net_amount' => [
                        'label' => 'Net Hakediş',
                        'value' => round($netSellerAmount, 2),
                        'formatted' => '₺' . number_format($netSellerAmount, 2, ',', '.'),
                    ],
                ],

                // Fatura durumu
                'can_create_invoice' => $order->payment_status === 'paid',
                'can_create_label' => in_array($order->status, ['confirmed', 'processing']) && empty($order->tracking_number),
            ],
        ]);
    }
}

