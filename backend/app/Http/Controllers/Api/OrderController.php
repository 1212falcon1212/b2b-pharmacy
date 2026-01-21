<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\CartService;
use App\Services\OrderService;
use App\Services\Shipping\ShippingManager;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    protected OrderService $orderService;
    protected CartService $cartService;

    public function __construct(OrderService $orderService, CartService $cartService)
    {
        $this->orderService = $orderService;
        $this->cartService = $cartService;
    }

    /**
     * Get user's orders (as buyer)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $orders = $this->orderService->getUserOrders($request->user()->id, $perPage);

        return response()->json([
            'orders' => $orders->items(),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Get seller's orders (orders where user is a seller)
     */
    public function sellerOrders(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 10);
        $status = $request->input('status');

        $query = Order::whereHas('items', function ($q) use ($user) {
            $q->where('seller_id', $user->id);
        })
            ->with([
                'items' => function ($q) use ($user) {
                    $q->where('seller_id', $user->id)->with('product');
                },
                'user:id,pharmacy_name,email,phone'
            ]);

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->orderByDesc('created_at')->paginate($perPage);

        // Transform orders to include seller-specific data
        $ordersData = $orders->getCollection()->map(function ($order) use ($user) {
            $sellerItems = $order->items->where('seller_id', $user->id);
            $sellerTotal = $sellerItems->sum('total_price');
            $sellerCommission = $sellerItems->sum('commission_amount');
            $sellerPayout = $sellerItems->sum('seller_payout_amount');

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'shipping_status' => $order->shipping_status,
                'tracking_number' => $order->tracking_number,
                'buyer' => $order->user,
                'shipping_address' => $order->shipping_address,
                'items' => $sellerItems->values(),
                'seller_total' => $sellerTotal,
                'seller_commission' => $sellerCommission,
                'seller_payout' => $sellerPayout,
                'created_at' => $order->created_at,
            ];
        });

        return response()->json([
            'orders' => $ordersData,
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Get single order details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $order = $this->orderService->getOrder($id);
        $user = $request->user();

        // Check if user is buyer or seller
        $isBuyer = $order && $order->user_id === $user->id;
        $isSeller = $order && $order->items->contains('seller_id', $user->id);

        if (!$order || (!$isBuyer && !$isSeller && !$user->isSuperAdmin())) {
            return response()->json(['message' => 'Sipariş bulunamadı.'], 404);
        }

        return response()->json([
            'order' => $order,
            'items' => $order->items,
            'items_by_seller' => $order->items_by_seller,
            'is_buyer' => $isBuyer,
            'is_seller' => $isSeller,
        ]);
    }

    /**
     * Create order from cart (checkout)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.name' => 'required|string|max:255',
            'shipping_address.phone' => 'required|string|max:20',
            'shipping_address.address' => 'required|string|max:500',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.district' => 'nullable|string|max:100',
            'shipping_address.postal_code' => 'nullable|string|max:10',
            'notes' => 'nullable|string|max:500',
        ]);

        $cart = $this->cartService->getCart($request->user());

        if (!$cart || $cart->isEmpty()) {
            return response()->json(['message' => 'Sepetiniz boş.'], 422);
        }

        try {
            $order = $this->orderService->createFromCart(
                $cart,
                $validated['shipping_address'],
                $validated['notes'] ?? null
            );

            return response()->json([
                'message' => 'Siparişiniz başarıyla oluşturuldu.',
                'order' => $order,
                'order_number' => $order->order_number,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Update order status (for sellers)
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:processing,shipped,delivered',
        ]);

        $order = Order::with('items')->find($id);
        $user = $request->user();

        if (!$order) {
            return response()->json(['message' => 'Sipariş bulunamadı.'], 404);
        }

        // Check if user is seller for this order
        $isSeller = $order->items->contains('seller_id', $user->id);

        if (!$isSeller && !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Bu işlem için yetkiniz yok.'], 403);
        }

        // Validate status transition
        $allowedTransitions = [
            'pending' => ['confirmed', 'processing', 'cancelled'],
            'confirmed' => ['processing', 'cancelled'],
            'processing' => ['shipped'],
            'shipped' => ['delivered'],
        ];

        $currentStatus = $order->status;
        $newStatus = $validated['status'];

        if (!isset($allowedTransitions[$currentStatus]) || !in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return response()->json([
                'message' => 'Geçersiz durum geçişi.',
                'current_status' => $currentStatus,
                'allowed' => $allowedTransitions[$currentStatus] ?? [],
            ], 422);
        }

        $order->update([
            'status' => $newStatus,
            'shipped_at' => $newStatus === 'shipped' ? now() : $order->shipped_at,
            'delivered_at' => $newStatus === 'delivered' ? now() : $order->delivered_at,
        ]);

        return response()->json([
            'message' => 'Sipariş durumu güncellendi.',
            'order' => $order->fresh(),
        ]);
    }

    /**
     * Cancel order
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $order = $this->orderService->getOrder($id);

        if (!$order || $order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Sipariş bulunamadı.'], 404);
        }

        try {
            $this->orderService->cancelOrder($order);

            return response()->json([
                'message' => 'Sipariş iptal edildi.',
                'order' => $order->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
