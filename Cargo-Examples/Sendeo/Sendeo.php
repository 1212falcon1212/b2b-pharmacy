<?php

namespace Modules\Cargo\Drivers\Sendeo;

use Modules\Cargo\Contracts\ShipmentInterface;
use Modules\Cargo\Support\ShipmentBase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class Sendeo extends ShipmentBase implements ShipmentInterface
{
    protected $config = [];
    protected $baseUrl = '';
    protected $tokenCacheKey = 'sendeo_token';

    public function __construct($config)
    {
        $this->config = $config;
        $this->baseUrl = $config['api_url'] ?? 'https://api.sendeo.com'; // Dokümantasyondan doğrulanacak
        parent::__construct($config);
    }

    /**
     * Token al veya cache'den getir
     */
    protected function getToken()
    {
        // Cache'den token kontrolü
        $cachedToken = Cache::get($this->tokenCacheKey);
        if ($cachedToken && isset($cachedToken['token']) && isset($cachedToken['expires_at'])) {
            // Token henüz geçerli mi kontrol et
            if (now()->lt($cachedToken['expires_at'])) {
                return $cachedToken['token'];
            }
        }

        // Token yoksa veya geçersizse yeni token al
        $credentials = $this->config['credentials'] ?? [];
        $customerCode = $credentials['customer_code'] ?? '';
        $password = $credentials['password'] ?? '';

        if (empty($customerCode) || empty($password)) {
            Log::error('Sendeo: API credentials eksik');
            return null;
        }

        try {
            $response = Http::post($this->baseUrl . '/Token/LoginAES', [
                'CustomerCode' => $customerCode,
                'Password' => $password,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['Token']) && isset($data['ExpireDate'])) {
                    $token = $data['Token'];
                    $expireDate = \Carbon\Carbon::parse($data['ExpireDate']);
                    
                    // Token'ı cache'le (20 saat geçerli, 19 saat cache'le)
                    Cache::put($this->tokenCacheKey, [
                        'token' => $token,
                        'expires_at' => $expireDate->subHour(), // 1 saat öncesinden yenile
                    ], now()->addHours(19));

                    return $token;
                }
            }

            Log::error('Sendeo: Token alınamadı', ['response' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Sendeo: Token alma hatası', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Kargo gönderimi oluşturur
     */
    public function send($params, $products)
    {
        try {
            $token = $this->getToken();
            if (!$token) {
                return $this->shipmentResponse(503, 'Sendeo API token alınamadı. Lütfen kargo ayarlarınızı kontrol edin.');
            }

            // Ürün bilgilerini hazırla
            $productsArray = [];
            $totalWeight = 0;
            $totalDeci = 0;

            foreach ($products as $item) {
                $product = $item['product'] ?? null;
                if ($product) {
                    $quantity = (int) ($item['quantity'] ?? 1);
                    $weight = (double) ($product->weight ?? 1000); // gram
                    $deci = (double) ($product->deci ?? 1);
                    
                    $totalWeight += $quantity * $weight;
                    $totalDeci += $quantity * $deci;

                    $productsArray[] = [
                        'Name' => $product->name ?? 'Ürün',
                        'Quantity' => $quantity,
                        'Weight' => $weight,
                        'Deci' => $deci,
                    ];
                }
            }

            // Gönderi bilgilerini hazırla
            $deliveryData = [
                'Token' => $token,
                'Delivery' => [
                    'Sender' => [
                        'Name' => $params['sender_name'] ?? '',
                        'Address' => $params['sender_address'] ?? '',
                        'City' => $params['sender_city'] ?? '',
                        'District' => $params['sender_district'] ?? '',
                        'Phone' => $params['sender_mobile_phone'] ?? '',
                        'Email' => $params['sender_email'] ?? '',
                    ],
                    'Receiver' => [
                        'Name' => $params['receiver_name'] ?? '',
                        'Address' => $params['receiver_address'] ?? '',
                        'City' => $params['receiver_city'] ?? '',
                        'District' => $params['receiver_district'] ?? '',
                        'Phone' => $params['receiver_mobile_phone'] ?? '',
                    ],
                    'Products' => $productsArray,
                    'PaymentType' => $params['payment_type'] ?? 'Gonderici_Odeyecek',
                    'InvoiceNumber' => $params['invoice_number'] ?? '',
                    'OrderCode' => $params['order_code'] ?? '',
                    'TotalWeight' => max($totalWeight, 1000), // Minimum 1 kg
                    'TotalDeci' => max($totalDeci, 1), // Minimum 1 desi
                ],
            ];

            $response = Http::post($this->baseUrl . '/Cargo/SetDelivery', $deliveryData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                if (isset($responseData['IsSuccess']) && $responseData['IsSuccess']) {
                    $trackingNumber = $responseData['TrackingNumber'] ?? '';
                    $barcode = $responseData['Barcode'] ?? '';
                    
                    return $this->shipmentResponse(200, 'Kargo başarıyla kaydedildi.', [
                        'tracking_number' => $trackingNumber,
                        'barcode' => $barcode,
                        'response' => $responseData,
                    ]);
                } else {
                    $errorMessage = $responseData['Message'] ?? 'Bilinmeyen hata';
                    Log::error('Sendeo: Gönderi oluşturma hatası', ['response' => $responseData]);
                    return $this->shipmentResponse(400, 'Gönderi oluşturulamadı: ' . $errorMessage);
                }
            } else {
                Log::error('Sendeo: API hatası', ['status' => $response->status(), 'body' => $response->body()]);
                return $this->shipmentResponse(503, 'API hatası: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Sendeo: Gönderi oluşturma exception', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kargo siparişini iptal eder
     */
    public function cancel($params)
    {
        try {
            $token = $this->getToken();
            if (!$token) {
                return $this->shipmentResponse(503, 'Sendeo API token alınamadı.');
            }

            $trackingNumber = $params['tracking_number'] ?? ($params['invoice_number'] ?? '');
            if (empty($trackingNumber)) {
                return $this->shipmentResponse(400, 'Takip numarası gereklidir.');
            }

            $cancelData = [
                'Token' => $token,
                'TrackingNumber' => $trackingNumber,
                'CancelReason' => $params['cancellation_reason'] ?? 'Müşteri talebi ile iptal edildi',
            ];

            $response = Http::post($this->baseUrl . '/Cargo/CancelDelivery', $cancelData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                if (isset($responseData['IsSuccess']) && $responseData['IsSuccess']) {
                    return $this->shipmentResponse(200, 'Kargo başarıyla iptal edildi.');
                } else {
                    $errorMessage = $responseData['Message'] ?? 'Bilinmeyen hata';
                    Log::error('Sendeo: İptal hatası', ['response' => $responseData]);
                    return $this->shipmentResponse(400, 'İptal edilemedi: ' . $errorMessage);
                }
            } else {
                Log::error('Sendeo: İptal API hatası', ['status' => $response->status(), 'body' => $response->body()]);
                return $this->shipmentResponse(503, 'API hatası: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Sendeo: İptal exception', ['error' => $e->getMessage()]);
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kargo takibi yapar
     */
    public function track($params)
    {
        try {
            $token = $this->getToken();
            if (!$token) {
                return $this->shipmentResponse(503, 'Sendeo API token alınamadı.');
            }

            $trackingNumber = $params['tracking_number'] ?? ($params['barcode'] ?? ($params['InvoiceNumber'] ?? ''));
            if (empty($trackingNumber)) {
                return $this->shipmentResponse(400, 'Takip numarası gereklidir.');
            }

            $trackData = [
                'Token' => $token,
                'TrackingNumber' => $trackingNumber,
            ];

            $response = Http::post($this->baseUrl . '/Cargo/TrackDelivery', $trackData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                if (isset($responseData['IsSuccess']) && $responseData['IsSuccess']) {
                    $status = $responseData['Status'] ?? '';
                    $statusDescription = $responseData['StatusDescription'] ?? 'Kargo yolda';
                    $events = $responseData['Events'] ?? [];

                    return $this->shipmentResponse(200, 'Kargo takibi başarılı.', [
                        'status' => $status,
                        'description' => $statusDescription,
                        'events' => $events,
                        'tracking_number' => $trackingNumber,
                    ]);
                } else {
                    $errorMessage = $responseData['Message'] ?? 'Bilinmeyen hata';
                    Log::error('Sendeo: Takip hatası', ['response' => $responseData]);
                    return $this->shipmentResponse(400, 'Takip yapılamadı: ' . $errorMessage);
                }
            } else {
                Log::error('Sendeo: Takip API hatası', ['status' => $response->status(), 'body' => $response->body()]);
                return $this->shipmentResponse(503, 'API hatası: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Sendeo: Takip exception', ['error' => $e->getMessage()]);
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Barkod etiketi alır
     */
    public function getLabel($params)
    {
        try {
            $token = $this->getToken();
            if (!$token) {
                return $this->shipmentResponse(503, 'Sendeo API token alınamadı.');
            }

            $trackingNumber = $params['tracking_number'] ?? ($params['barcode'] ?? ($params['InvoiceNumber'] ?? ''));
            if (empty($trackingNumber)) {
                return $this->shipmentResponse(400, 'Takip numarası gereklidir.');
            }

            // Endpoint dokümantasyondan doğrulanacak
            $response = Http::get($this->baseUrl . '/Cargo/GetLabel', [
                'Token' => $token,
                'TrackingNumber' => $trackingNumber,
            ]);

            if ($response->successful()) {
                $contentType = $response->header('Content-Type');
                
                // PDF veya görsel dosyası dönebilir
                if (strpos($contentType, 'application/pdf') !== false || strpos($contentType, 'image') !== false) {
                    return $this->shipmentResponse(200, 'Etiket başarıyla alındı.', [
                        'label' => base64_encode($response->body()),
                        'content_type' => $contentType,
                        'tracking_number' => $trackingNumber,
                    ]);
                } else {
                    // JSON response olabilir (label_url içerebilir)
                    $responseData = $response->json();
                    if (isset($responseData['LabelUrl'])) {
                        return $this->shipmentResponse(200, 'Etiket URL\'si alındı.', [
                            'label_url' => $responseData['LabelUrl'],
                            'tracking_number' => $trackingNumber,
                        ]);
                    }
                }
            }

            Log::error('Sendeo: Etiket alma hatası', ['status' => $response->status(), 'body' => $response->body()]);
            return $this->shipmentResponse(503, 'Etiket alınamadı.');
        } catch (\Exception $e) {
            Log::error('Sendeo: Etiket alma exception', ['error' => $e->getMessage()]);
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }
}

