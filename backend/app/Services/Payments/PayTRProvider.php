<?php

namespace App\Services\Payments;

use App\Interfaces\PaymentGatewayInterface;
use App\Interfaces\PaymentInitResult;
use App\Interfaces\PaymentResult;
use App\Interfaces\RefundResult;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PayTRProvider implements PaymentGatewayInterface
{
    protected string $merchantId;
    protected string $merchantKey;
    protected string $merchantSalt;
    protected bool $testMode;

    /**
     * HTTP request timeout in seconds
     */
    protected int $timeout = 30;

    public function __construct()
    {
        $this->merchantId = Setting::getValue('payment.paytr_merchant_id', '');
        $this->merchantKey = Setting::getValue('payment.paytr_merchant_key', '');
        $this->merchantSalt = Setting::getValue('payment.paytr_merchant_salt', '');
        $this->testMode = Setting::getValue('payment.test_mode', true);
    }

    public function getName(): string
    {
        return 'paytr';
    }

    public function initialize(Order $order): PaymentInitResult
    {
        try {
            // Validate credentials
            if (empty($this->merchantId) || empty($this->merchantKey) || empty($this->merchantSalt)) {
                return PaymentInitResult::failure('PayTR API bilgileri eksik.');
            }

            $iframeToken = $this->getIframeToken($order);

            if (!$iframeToken) {
                return PaymentInitResult::failure('Ödeme token\'ı alınamadı.');
            }

            return PaymentInitResult::success(
                paymentUrl: "https://www.paytr.com/odeme/guvenli/{$iframeToken}",
                transactionId: 'PTR-' . $order->order_number,
            );
        } catch (\Exception $e) {
            Log::error('PayTR initialize error: ' . $e->getMessage());
            return PaymentInitResult::failure('Ödeme başlatılamadı: ' . $e->getMessage());
        }
    }

    public function getCheckoutHtml(Order $order): string
    {
        $callbackUrl = url('/api/payments/callback/paytr');

        if ($this->testMode) {
            return <<<HTML
            <div class="paytr-checkout-stub p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
                <div class="flex items-center gap-3 mb-4">
                    <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                    <h3 class="text-lg font-bold text-purple-800">PayTR Test Modu</h3>
                </div>
                <p class="text-purple-700 mb-4">Sipariş: {$order->order_number}</p>
                <p class="text-2xl font-bold text-purple-900 mb-4">{$order->total_amount} ₺</p>
                <p class="text-sm text-purple-600 mb-4">
                    Bu test modudur. Gerçek ödeme alınmaz.
                    PayTR API credentials sağlandığında iFrame gösterilecektir.
                </p>
                <form action="{$callbackUrl}" method="POST">
                    <input type="hidden" name="order_id" value="{$order->id}" />
                    <input type="hidden" name="test_mode" value="1" />
                    <button type="submit" class="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition">
                        Test Ödeme Simüle Et (Başarılı)
                    </button>
                </form>
            </div>
            HTML;
        }

        // Production - render PayTR iframe
        $iframeToken = $this->getIframeToken($order);

        if (!$iframeToken) {
            return '<div class="text-red-500">PayTR iFrame yüklenemedi.</div>';
        }

        return <<<HTML
        <iframe src="https://www.paytr.com/odeme/guvenli/{$iframeToken}" 
                id="paytriframe" 
                frameborder="0" 
                scrolling="no" 
                style="width: 100%; height: 600px;">
        </iframe>
        <script src="https://www.paytr.com/js/iframeResizer.min.js"></script>
        <script>iFrameResize({}, '#paytriframe');</script>
        HTML;
    }

    protected function getIframeToken(Order $order): ?string
    {
        if ($this->testMode) {
            return 'TEST-TOKEN-' . uniqid();
        }

        // Production mode - call PayTR API to get iframe token
        // This is a placeholder for the actual implementation

        $user = $order->user;
        $basketItems = $this->buildBasketItems($order);

        $postData = [
            'merchant_id' => $this->merchantId,
            'user_ip' => request()->ip(),
            'merchant_oid' => $order->order_number,
            'email' => $user->email,
            'payment_amount' => (int) ($order->total_amount * 100), // Kuruş cinsinden
            'user_basket' => base64_encode(json_encode($basketItems)),
            'debug_on' => $this->testMode ? 1 : 0,
            'no_installment' => 0,
            'max_installment' => 0,
            'user_name' => $order->shipping_address['name'] ?? $user->pharmacy_name,
            'user_address' => $order->shipping_address['address'] ?? '',
            'user_phone' => $order->shipping_address['phone'] ?? $user->phone,
            'merchant_ok_url' => url('/payment/result?status=success'),
            'merchant_fail_url' => url('/payment/result?status=failed'),
            'currency' => 'TL',
            'test_mode' => $this->testMode ? 1 : 0,
        ];

        // Generate hash
        $hashStr = $postData['merchant_id'] . $postData['user_ip'] . $postData['merchant_oid'] .
            $postData['email'] . $postData['payment_amount'] . $postData['user_basket'] .
            $postData['no_installment'] . $postData['max_installment'] . $postData['currency'] .
            $postData['test_mode'];
        $paytrToken = base64_encode(hash_hmac('sha256', $hashStr . $this->merchantSalt, $this->merchantKey, true));
        $postData['paytr_token'] = $paytrToken;

        try {
            $response = Http::timeout($this->timeout)
                ->asForm()
                ->post('https://www.paytr.com/odeme/api/get-token', $postData);

            if ($response->successful()) {
                $data = $response->json();

                if (($data['status'] ?? '') === 'success' && !empty($data['token'])) {
                    return $data['token'];
                }

                Log::error('PayTR get token failed', [
                    'reason' => $data['reason'] ?? 'Unknown error',
                ]);
            } else {
                Log::error('PayTR API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('PayTR getIframeToken exception: ' . $e->getMessage());
        }

        return null;
    }

    protected function buildBasketItems(Order $order): array
    {
        $items = [];

        foreach ($order->items as $item) {
            $items[] = [
                $item->product->name ?? 'Ürün',
                number_format($item->unit_price, 2, '.', ''),
                $item->quantity,
            ];
        }

        return $items;
    }

    public function handleCallback(Request $request): PaymentResult
    {
        try {
            // In test mode, simulate success
            if ($request->input('test_mode') === '1') {
                return PaymentResult::completed(
                    transactionId: 'TEST-' . uniqid(),
                    paidAmount: 0,
                    rawData: $request->all(),
                );
            }

            // Validate PayTR callback
            $hash = $request->input('hash');
            $merchantOid = $request->input('merchant_oid');
            $status = $request->input('status');
            $totalAmount = $request->input('total_amount');

            // Verify hash
            $expectedHash = base64_encode(hash_hmac(
                'sha256',
                $merchantOid . $this->merchantSalt . $status . $totalAmount,
                $this->merchantKey,
                true
            ));

            if ($hash !== $expectedHash) {
                return PaymentResult::failed('Hash doğrulama hatası', $request->all());
            }

            if ($status === 'success') {
                return PaymentResult::completed(
                    transactionId: $merchantOid,
                    paidAmount: $totalAmount / 100, // Convert from kuruş
                    rawData: $request->all(),
                );
            }

            $failReason = $request->input('failed_reason_msg', 'Ödeme başarısız');
            return PaymentResult::failed($failReason, $request->all());
        } catch (\Exception $e) {
            Log::error('PayTR callback error: ' . $e->getMessage());
            return PaymentResult::failed($e->getMessage());
        }
    }

    public function refund(Order $order, float $amount): RefundResult
    {
        try {
            if ($this->testMode) {
                return RefundResult::success(
                    refundId: 'REFUND-TEST-' . uniqid(),
                    refundedAmount: $amount,
                );
            }

            // Production mode - call PayTR refund API
            return RefundResult::failure('Gerçek iade işlemi henüz implemente edilmedi.');
        } catch (\Exception $e) {
            Log::error('PayTR refund error: ' . $e->getMessage());
            return RefundResult::failure($e->getMessage());
        }
    }
}
