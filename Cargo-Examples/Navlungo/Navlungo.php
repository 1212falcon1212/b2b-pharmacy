<?php

namespace Modules\Cargo\Drivers\Navlungo;

use Modules\Cargo\Contracts\ShipmentInterface;
use Modules\Cargo\Support\ShipmentBase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class Navlungo extends ShipmentBase implements ShipmentInterface
{
    protected $config = [];
    protected $baseUrl = '';
    protected $tokenCacheKey = 'navlungo_token';

    public function __construct($config)
    {
        $this->config = $config;
        $this->baseUrl = $config['api_url'] ?? 'https://api.navlungo.com'; // Dokümantasyondan doğrulanacak
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
        $apiKey = $credentials['api_key'] ?? '';
        $apiSecret = $credentials['api_secret'] ?? '';

        if (empty($apiKey) || empty($apiSecret)) {
            Log::error('Navlungo: API credentials eksik');
            return null;
        }

        try {
            $response = Http::post($this->baseUrl . '/v2/auth/login', [
                'api_key' => $apiKey,
                'api_secret' => $apiSecret,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['token']) && isset($data['expires_in'])) {
                    $token = $data['token'];
                    $expiresIn = (int) ($data['expires_in'] ?? 3600); // Varsayılan 1 saat
                    
                    // Token'ı cache'le (expires_in süresinden 5 dakika önce yenile)
                    Cache::put($this->tokenCacheKey, [
                        'token' => $token,
                        'expires_at' => now()->addSeconds($expiresIn - 300), // 5 dakika öncesinden yenile
                    ], now()->addSeconds($expiresIn - 60));

                    return $token;
                }
            }

            Log::error('Navlungo: Token alınamadı', ['response' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Navlungo: Token alma hatası', ['error' => $e->getMessage()]);
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
                return $this->shipmentResponse(503, 'Navlungo API token alınamadı. Lütfen kargo ayarlarınızı kontrol edin.');
            }

            $credentials = $this->config['credentials'] ?? [];
            $carrierId = $credentials['carrier_id'] ?? ''; // Taşıyıcı ID (opsiyonel, Navlungo otomatik seçebilir)

            // Ürün bilgilerini hazırla
            $parcels = [];
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

                    // Her ürün için parcel oluştur (veya toplu parcel)
                    for ($i = 0; $i < $quantity; $i++) {
                        $parcels[] = [
                            'weight' => max($weight, 1000), // gram, minimum 1 kg
                            'deci' => max($deci, 1), // desi, minimum 1
                            'description' => $product->name ?? 'Ürün',
                        ];
                    }
                }
            }

            // Eğer parcel yoksa, varsayılan bir parcel oluştur
            if (empty($parcels)) {
                $parcels[] = [
                    'weight' => max($totalWeight, 1000),
                    'deci' => max($totalDeci, 1),
                    'description' => 'Gönderi',
                ];
            }

            // Gönderi bilgilerini hazırla
            $postData = [
                'carrier_id' => $carrierId, // Boş bırakılırsa Navlungo otomatik seçer
                'sender' => [
                    'name' => $params['sender_name'] ?? '',
                    'address' => $params['sender_address'] ?? '',
                    'city' => $params['sender_city'] ?? '',
                    'district' => $params['sender_district'] ?? '',
                    'phone' => $params['sender_mobile_phone'] ?? '',
                    'email' => $params['sender_email'] ?? '',
                ],
                'receiver' => [
                    'name' => $params['receiver_name'] ?? '',
                    'address' => $params['receiver_address'] ?? '',
                    'city' => $params['receiver_city'] ?? '',
                    'district' => $params['receiver_district'] ?? '',
                    'phone' => $params['receiver_mobile_phone'] ?? '',
                ],
                'parcels' => $parcels,
                'payment_type' => $params['payment_type'] ?? 'sender_pays',
                'invoice_number' => $params['invoice_number'] ?? '',
                'order_code' => $params['order_code'] ?? '',
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/v2/create-a-post', $postData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                if (isset($responseData['success']) && $responseData['success']) {
                    $trackingNumber = $responseData['tracking_number'] ?? '';
                    $labelUrl = $responseData['label_url'] ?? '';
                    
                    return $this->shipmentResponse(200, 'Kargo başarıyla kaydedildi.', [
                        'tracking_number' => $trackingNumber,
                        'label_url' => $labelUrl,
                        'response' => $responseData,
                    ]);
                } else {
                    $errorMessage = $responseData['message'] ?? ($responseData['error'] ?? 'Bilinmeyen hata');
                    Log::error('Navlungo: Gönderi oluşturma hatası', ['response' => $responseData]);
                    return $this->shipmentResponse(400, 'Gönderi oluşturulamadı: ' . $errorMessage);
                }
            } else {
                Log::error('Navlungo: API hatası', ['status' => $response->status(), 'body' => $response->body()]);
                return $this->shipmentResponse(503, 'API hatası: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Navlungo: Gönderi oluşturma exception', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
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
                return $this->shipmentResponse(503, 'Navlungo API token alınamadı.');
            }

            $trackingNumber = $params['tracking_number'] ?? ($params['invoice_number'] ?? '');
            if (empty($trackingNumber)) {
                return $this->shipmentResponse(400, 'Takip numarası gereklidir.');
            }

            $cancelData = [
                'reason' => $params['cancellation_reason'] ?? 'Müşteri talebi ile iptal edildi',
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/v2/cancel/' . $trackingNumber, $cancelData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                if (isset($responseData['success']) && $responseData['success']) {
                    return $this->shipmentResponse(200, 'Kargo başarıyla iptal edildi.');
                } else {
                    $errorMessage = $responseData['message'] ?? ($responseData['error'] ?? 'Bilinmeyen hata');
                    Log::error('Navlungo: İptal hatası', ['response' => $responseData]);
                    return $this->shipmentResponse(400, 'İptal edilemedi: ' . $errorMessage);
                }
            } else {
                Log::error('Navlungo: İptal API hatası', ['status' => $response->status(), 'body' => $response->body()]);
                return $this->shipmentResponse(503, 'API hatası: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Navlungo: İptal exception', ['error' => $e->getMessage()]);
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
                return $this->shipmentResponse(503, 'Navlungo API token alınamadı.');
            }

            $trackingNumber = $params['tracking_number'] ?? ($params['barcode'] ?? ($params['InvoiceNumber'] ?? ''));
            if (empty($trackingNumber)) {
                return $this->shipmentResponse(400, 'Takip numarası gereklidir.');
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->get($this->baseUrl . '/v2/track/' . $trackingNumber);

            if ($response->successful()) {
                $responseData = $response->json();
                
                if (isset($responseData['success']) && $responseData['success']) {
                    $status = $responseData['status'] ?? '';
                    $events = $responseData['events'] ?? [];

                    return $this->shipmentResponse(200, 'Kargo takibi başarılı.', [
                        'status' => $status,
                        'description' => $status,
                        'events' => $events,
                        'tracking_number' => $trackingNumber,
                    ]);
                } else {
                    $errorMessage = $responseData['message'] ?? ($responseData['error'] ?? 'Bilinmeyen hata');
                    Log::error('Navlungo: Takip hatası', ['response' => $responseData]);
                    return $this->shipmentResponse(400, 'Takip yapılamadı: ' . $errorMessage);
                }
            } else {
                Log::error('Navlungo: Takip API hatası', ['status' => $response->status(), 'body' => $response->body()]);
                return $this->shipmentResponse(503, 'API hatası: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('Navlungo: Takip exception', ['error' => $e->getMessage()]);
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
                return $this->shipmentResponse(503, 'Navlungo API token alınamadı.');
            }

            $trackingNumber = $params['tracking_number'] ?? ($params['barcode'] ?? ($params['InvoiceNumber'] ?? ''));
            if (empty($trackingNumber)) {
                return $this->shipmentResponse(400, 'Takip numarası gereklidir.');
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
            ])->get($this->baseUrl . '/v2/label/' . $trackingNumber);

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
                    if (isset($responseData['label_url'])) {
                        return $this->shipmentResponse(200, 'Etiket URL\'si alındı.', [
                            'label_url' => $responseData['label_url'],
                            'tracking_number' => $trackingNumber,
                        ]);
                    }
                }
            }

            Log::error('Navlungo: Etiket alma hatası', ['status' => $response->status(), 'body' => $response->body()]);
            return $this->shipmentResponse(503, 'Etiket alınamadı.');
        } catch (\Exception $e) {
            Log::error('Navlungo: Etiket alma exception', ['error' => $e->getMessage()]);
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }
}

