<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Payments\PaymentManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected PaymentManager $paymentManager;

    public function __construct(PaymentManager $paymentManager)
    {
        $this->paymentManager = $paymentManager;
    }

    /**
     * Get payment configuration for frontend
     */
    public function config(): JsonResponse
    {
        return response()->json([
            'enabled' => $this->paymentManager->isEnabled(),
            'gateway' => $this->paymentManager->getActiveGateway(),
            'test_mode' => $this->paymentManager->isTestMode(),
        ]);
    }

    /**
     * Initialize payment for an order
     */
    public function initialize(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::with(['items.product', 'items.seller', 'user'])->find($request->order_id);

        // Verify order belongs to user
        if ($order->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Bu siparişe erişim yetkiniz yok.',
            ], 403);
        }

        // Check if order is pending payment
        if ($order->payment_status !== 'pending') {
            return response()->json([
                'success' => false,
                'error' => 'Bu sipariş için ödeme beklenmiyor.',
            ], 400);
        }

        $provider = $this->paymentManager->getProvider();

        if (!$provider) {
            return response()->json([
                'success' => false,
                'error' => 'Ödeme sistemi aktif değil.',
            ], 400);
        }

        $result = $provider->initialize($order);

        if (!$result->success) {
            return response()->json([
                'success' => false,
                'error' => $result->error,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'payment_url' => $result->paymentUrl,
            'checkout_html' => $result->checkoutHtml,
            'transaction_id' => $result->transactionId,
            'gateway' => $provider->getName(),
        ]);
    }

    /**
     * Get checkout form HTML for an order
     */
    public function checkout(Order $order, Request $request): JsonResponse
    {
        // Verify order belongs to user
        if ($order->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Bu siparişe erişim yetkiniz yok.',
            ], 403);
        }

        $provider = $this->paymentManager->getProvider();

        if (!$provider) {
            return response()->json([
                'success' => false,
                'error' => 'Ödeme sistemi aktif değil.',
            ], 400);
        }

        $html = $provider->getCheckoutHtml($order);

        return response()->json([
            'success' => true,
            'checkout_html' => $html,
            'gateway' => $provider->getName(),
        ]);
    }

    /**
     * Handle payment gateway callback
     */
    public function callback(string $gateway, Request $request)
    {
        Log::info("Payment callback received for gateway: {$gateway}", $request->all());

        try {
            $provider = $this->paymentManager->getProviderByName($gateway);
            $result = $provider->handleCallback($request);

            // Find order by transaction ID or order_id
            $orderId = $request->input('order_id') ?? $request->input('merchant_oid');
            $order = null;

            if ($orderId) {
                if (is_numeric($orderId)) {
                    $order = Order::find($orderId);
                } else {
                    $order = Order::where('order_number', $orderId)->first();
                }
            }

            if (!$order) {
                Log::error("Order not found for callback", ['order_id' => $orderId]);
                return response('Order not found', 400);
            }

            if ($result->success && $result->status === 'completed') {
                // Update order payment status
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed',
                ]);

                Log::info("Payment successful for order: {$order->order_number}");

                // Redirect to success page for browser callbacks
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Ödeme başarılı',
                        'order_id' => $order->id,
                    ]);
                }

                return redirect('/payment/result?status=success&order=' . $order->id);
            } else {
                // Payment failed
                $order->update([
                    'payment_status' => 'failed',
                ]);

                Log::warning("Payment failed for order: {$order->order_number}", [
                    'error' => $result->error,
                ]);

                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'error' => $result->error ?? 'Ödeme başarısız',
                    ]);
                }

                return redirect('/payment/result?status=failed&order=' . $order->id);
            }
        } catch (\Exception $e) {
            Log::error("Payment callback error: " . $e->getMessage());

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'İşlem hatası',
                ], 500);
            }

            return redirect('/payment/result?status=error');
        }
    }

    /**
     * Process refund for an order
     */
    public function refund(Order $order, Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'nullable|numeric|min:0',
        ]);

        // Verify order belongs to user or user is admin
        if ($order->user_id !== $request->user()->id && !$request->user()->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'error' => 'Bu siparişe erişim yetkiniz yok.',
            ], 403);
        }

        // Check if order can be refunded
        if ($order->payment_status !== 'paid') {
            return response()->json([
                'success' => false,
                'error' => 'Bu sipariş için iade yapılamaz.',
            ], 400);
        }

        $provider = $this->paymentManager->getProvider();

        if (!$provider) {
            return response()->json([
                'success' => false,
                'error' => 'Ödeme sistemi aktif değil.',
            ], 400);
        }

        $amount = $request->amount ?? $order->total_amount;
        $result = $provider->refund($order, $amount);

        if (!$result->success) {
            return response()->json([
                'success' => false,
                'error' => $result->error,
            ], 400);
        }

        // Update order status
        $order->update([
            'payment_status' => 'refunded',
            'status' => 'cancelled',
        ]);

        return response()->json([
            'success' => true,
            'refund_id' => $result->refundId,
            'refunded_amount' => $result->refundedAmount,
        ]);
    }
}
