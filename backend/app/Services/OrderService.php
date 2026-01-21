<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Create an order from cart
     */
    public function createFromCart(Cart $cart, array $shippingAddress, ?string $notes = null): Order
    {
        // Validate cart first
        $issues = $this->cartService->validateCart($cart);
        $criticalIssues = array_filter($issues, fn($i) => in_array($i['type'], ['unavailable', 'stock']));

        if (!empty($criticalIssues)) {
            throw new \Exception('Sepetinizde düzeltilmesi gereken sorunlar var.');
        }

        // Sync prices to current values
        $this->cartService->syncPrices($cart);
        $cart->refresh();
        $cart->load(['items.product.category', 'items.offer', 'items.seller']);

        if ($cart->isEmpty()) {
            throw new \Exception('Sepetiniz boş.');
        }

        return DB::transaction(function () use ($cart, $shippingAddress, $notes) {
            $orderNumber = $this->generateOrderNumber();
            $subtotal = 0;
            $totalCommission = 0;

            // Calculate totals
            $orderItemsData = [];
            foreach ($cart->items as $item) {
                $unitPrice = (float) $item->price_at_addition;
                $quantity = $item->quantity;
                $totalPrice = $unitPrice * $quantity;

                // Get commission rate from product's category
                $commissionRate = $item->product->commission_rate ?? 0;
                $commissionAmount = $totalPrice * ($commissionRate / 100);
                $sellerPayoutAmount = $totalPrice - $commissionAmount;

                $subtotal += $totalPrice;
                $totalCommission += $commissionAmount;

                $orderItemsData[] = [
                    'product_id' => $item->product_id,
                    'offer_id' => $item->offer_id,
                    'seller_id' => $item->seller_id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'commission_rate' => $commissionRate,
                    'commission_amount' => $commissionAmount,
                    'seller_payout_amount' => $sellerPayoutAmount,
                ];

                // Decrease stock
                if (!$item->offer->decreaseStock($quantity)) {
                    throw new \Exception("Stok yetersiz: {$item->product->name}");
                }
            }

            // Create order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $cart->user_id,
                'subtotal' => $subtotal,
                'total_commission' => $totalCommission,
                'total_amount' => $subtotal, // Same as subtotal (no shipping cost for now)
                'status' => 'pending',
                'payment_status' => 'pending',
                'shipping_address' => $shippingAddress,
                'notes' => $notes,
            ]);

            // Create order items
            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
            }

            // Mark cart as converted
            $cart->markAsConverted();

            return $order->load('items.product', 'items.seller');
        });
    }

    /**
     * Generate unique order number
     */
    public function generateOrderNumber(): string
    {
        $prefix = 'EPZ'; // EczanePazarı
        $date = now()->format('ymd');
        $random = strtoupper(Str::random(4));
        $sequence = str_pad(Order::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

        return "{$prefix}{$date}{$sequence}{$random}";
    }

    /**
     * Cancel an order
     */
    public function cancelOrder(Order $order): void
    {
        if (!$order->canBeCancelled()) {
            throw new \Exception('Bu sipariş iptal edilemez.');
        }

        DB::transaction(function () use ($order) {
            // Restore stock for each item
            foreach ($order->items as $item) {
                if ($item->offer) {
                    $item->offer->increment('stock', $item->quantity);
                    if ($item->offer->status === 'sold_out') {
                        $item->offer->update(['status' => 'active']);
                    }
                }
            }

            $order->cancel();
        });
    }

    /**
     * Get order by ID with relations
     */
    public function getOrder(int $orderId): ?Order
    {
        return Order::with(['items.product', 'items.seller', 'user'])
            ->find($orderId);
    }

    /**
     * Get user's orders
     */
    public function getUserOrders(int $userId, int $perPage = 10)
    {
        return Order::forUser($userId)
            ->with(['items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
