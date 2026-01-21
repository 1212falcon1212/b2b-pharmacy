<?php

namespace Modules\Cargo\Drivers\Hepsijet;

use Modules\Cargo\Contracts\ShipmentInterface;
use Modules\Cargo\Support\ShipmentBase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class Hepsijet extends ShipmentBase implements ShipmentInterface
{
    protected $config = [];
    protected $baseUrl = '';
    protected $tokenCacheKey = 'hepsijet_token';

    public function __construct($config)
    {
        $this->config = $config;
        // Test ortamı için varsayılan URL, canlı ortam için env'den alınacak
        $this->baseUrl = $config['api_url'] ?? env('HEPSIJET_API_URL', 'https://integration-apitest.hepsijet.com');
        parent::__construct($config);
    }

    /**
     * Token al veya cache'den getir
     * Hepsijet API: GET /auth/getToken ile Basic Auth kullanarak token alınır
     * Token süresi: 60 dakika
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
        
        // Hepsijet Basic Auth için username:password formatında string gerekiyor
        // Dokümantasyonda base64 encoded string örneği var: MTIzMTIzLTEyMzEyMy0xMjMxMjM0MTIzLS0zMTI6MTIzMTIzLTEyMy0xMjMxMjMtMTIzMTIz
        // Bu muhtemelen api_key:api_secret formatında encode edilmiş
        $apiKey = $credentials['api_key'] ?? '';
        $apiSecret = $credentials['api_secret'] ?? '';

        if (empty($apiKey) || empty($apiSecret)) {
            Log::error('Hepsijet: API credentials eksik');
            return null;
        }

        try {
            // Basic Auth için base64 encode
            $authString = base64_encode($apiKey . ':' . $apiSecret);

            // GET request ile token al
            $response = Http::withHeaders([
                'accept' => 'application/json',
                'authorization' => 'Basic ' . $authString,
            ])->get($this->baseUrl . '/auth/getToken');

            if ($response->successful()) {
                $data = $response->json();
                
                // Response formatı dokümantasyona göre kontrol edilecek
                // Muhtemelen: {"token": "...", "expires_in": 3600} formatında
                $token = $data['token'] ?? $data['access_token'] ?? $data['accessToken'] ?? null;
                $expiresIn = (int) ($data['expires_in'] ?? $data['expiresIn'] ?? 3600); // 60 dakika = 3600 saniye
                
                if ($token) {
                    // Token'ı cache'le (60 dakika geçerli, 55 dakika cache'le)
                    Cache::put($this->tokenCacheKey, [
                        'token' => $token,
                        'expires_at' => now()->addSeconds($expiresIn - 300), // 5 dakika öncesinden yenile
                    ], now()->addSeconds($expiresIn - 60));

                    return $token;
                }
            }

            Log::error('Hepsijet: Token alınamadı', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);
            return null;
        } catch (\Exception $e) {
            Log::error('Hepsijet: Token alma hatası', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Kargo gönderimi oluşturur
     * Hepsijet API: sendDeliveryOrderEnhanced (standart) veya sendDeliveryOrder (41+ desi XL)
     */
    public function send($params, $products)
    {
        try {
            $token = $this->getToken();
            if (!$token) {
                return $this->shipmentResponse(503, 'Hepsijet API token alınamadı. Lütfen kargo ayarlarınızı kontrol edin.');
            }

            // Ürün bilgilerini hazırla ve toplam desi hesapla
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

                    // Her ürün için parcel oluştur
                    for ($i = 0; $i < $quantity; $i++) {
                        $parcels[] = [
                            'desi' => max($deci, 1), // Minimum 1 desi
                            'weight' => max($weight, 1000), // gram, minimum 1 kg
                            'content' => $product->name ?? 'Ürün',
                        ];
                    }
                }
            }

            // Eğer parcel yoksa, varsayılan bir parcel oluştur
            if (empty($parcels)) {
                $parcels[] = [
                    'desi' => max($totalDeci, 1),
                    'weight' => max($totalWeight, 1000),
                    'content' => 'Gönderi',
                ];
            }

            // Payment type dönüşümü
            $paymentType = 'SENDER_PAYS'; // Varsayılan
            if (isset($params['payment_type'])) {
                if ($params['payment_type'] == 'Gonderici_Odeyecek' || $params['payment_type'] == 'sender_pays') {
                    $paymentType = 'SENDER_PAYS';
                } elseif ($params['payment_type'] == 'Alici_Odeyecek' || $params['payment_type'] == 'receiver_pays') {
                    $paymentType = 'RECEIVER_PAYS';
                }
            }

            // Gönderi bilgilerini hazırla (Hepsijet API formatına göre)
            $shipmentData = [
                'customerOrderId' => $params['order_code'] ?? $params['invoice_number'] ?? '',
                'sender' => [
                    'name' => $params['sender_name'] ?? '',
                    'address' => [
                        'city' => [
                            'name' => $params['sender_city'] ?? '',
                        ],
                        'town' => [
                            'name' => $params['sender_district'] ?? '', // district as town
                        ],
                        'district' => [
                            'name' => '', // Mahalle bilgisi yoksa boş
                        ],
                        'addressLine1' => $params['sender_address'] ?? '',
                        'addressLine2' => '',
                    ],
                    'phone' => $params['sender_mobile_phone'] ?? '',
                    'email' => $params['sender_email'] ?? '',
                ],
                'receiver' => [
                    'name' => $params['receiver_name'] ?? '',
                    'address' => [
                        'city' => [
                            'name' => $params['receiver_city'] ?? '',
                        ],
                        'town' => [
                            'name' => $params['receiver_district'] ?? '', // district as town
                        ],
                        'district' => [
                            'name' => '', // Mahalle bilgisi yoksa boş
                        ],
                        'addressLine1' => $params['receiver_address'] ?? '',
                        'addressLine2' => '',
                    ],
                    'phone' => $params['receiver_mobile_phone'] ?? '',
                ],
                'parcels' => $parcels,
                'serviceType' => ['STANDART'], // Varsayılan servis tipi
                'paymentType' => $paymentType,
                'codAmount' => 0, // Kapıda ödeme tutarı (varsa eklenecek)
                'invoiceNumber' => $params['invoice_number'] ?? '',
            ];

            // Desi kontrolü: 41+ desi ise sendDeliveryOrder (XL), değilse sendDeliveryOrderEnhanced
            $endpoint = '/delivery/sendDeliveryOrderEnhanced';
            if ($totalDeci >= 41) {
                $endpoint = '/delivery/sendDeliveryOrder';
                $shipmentData['serviceType'] = ['TMH']; // XL gönderiler için TMH
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
                'accept' => 'application/json',
            ])->post($this->baseUrl . $endpoint, $shipmentData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                // Response formatı: deliveryNo, barcode, status
                $deliveryNo = $responseData['deliveryNo'] ?? $responseData['delivery_no'] ?? null;
                $barcode = $responseData['barcode'] ?? $deliveryNo;
                $status = $responseData['status'] ?? 'SUCCESS';
                
                if ($deliveryNo) {
                    return $this->shipmentResponse(200, 'Kargo başarıyla kaydedildi.', [
                        'tracking_number' => $deliveryNo,
                        'barcode' => $barcode,
                        'delivery_no' => $deliveryNo,
                        'status' => $status,
                        'response' => $responseData,
                    ]);
                } else {
                    $errorMessage = $responseData['message'] ?? $responseData['error'] ?? ($responseData['errorMessage'] ?? 'Bilinmeyen hata');
                    Log::error('Hepsijet: Gönderi oluşturma hatası', ['response' => $responseData]);
                    return $this->shipmentResponse(400, 'Gönderi oluşturulamadı: ' . $errorMessage);
                }
            } else {
                $errorBody = $response->json();
                $errorMessage = $errorBody['message'] ?? $errorBody['error'] ?? ($errorBody['errorMessage'] ?? 'API hatası');
                Log::error('Hepsijet: API hatası', [
                    'status' => $response->status(),
                    'endpoint' => $endpoint,
                    'body' => $response->body()
                ]);
                return $this->shipmentResponse($response->status(), 'API hatası: ' . $errorMessage);
            }
        } catch (\Exception $e) {
            Log::error('Hepsijet: Gönderi oluşturma exception', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kargo siparişini iptal eder
     * Hepsijet API: deleteDeliveryOrder (deliveryNo ile) veya deleteDeliveryAdvance (customerOrderId ile)
     */
    public function cancel($params)
    {
        try {
            $token = $this->getToken();
            if (!$token) {
                return $this->shipmentResponse(503, 'Hepsijet API token alınamadı.');
            }

            $deliveryNo = $params['delivery_no'] ?? $params['tracking_number'] ?? null;
            $customerOrderId = $params['order_code'] ?? $params['invoice_number'] ?? null;
            $reason = $params['cancellation_reason'] ?? 'Müşteri talebi ile iptal edildi';

            if (empty($deliveryNo) && empty($customerOrderId)) {
                return $this->shipmentResponse(400, 'Gönderi numarası veya sipariş numarası gereklidir.');
            }

            $endpoint = '';
            $cancelData = [];

            // Önce deliveryNo varsa deleteDeliveryOrder kullan
            if (!empty($deliveryNo)) {
                $endpoint = '/rest/delivery/deleteDeliveryOrder/' . $deliveryNo;
                $cancelData = [
                    'reason' => $reason,
                ];
            } else {
                // Yoksa customerOrderId ile deleteDeliveryAdvance kullan
                $endpoint = '/rest/advance/deleteDeliveryAdvance/' . $customerOrderId;
                $cancelData = [
                    'reason' => $reason,
                ];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
                'accept' => 'application/json',
            ])->post($this->baseUrl . $endpoint, $cancelData);

            if ($response->successful()) {
                $responseData = $response->json();
                
                $success = $responseData['success'] ?? $responseData['isSuccess'] ?? true;
                $message = $responseData['message'] ?? 'Kargo başarıyla iptal edildi.';
                
                if ($success) {
                    return $this->shipmentResponse(200, $message);
                } else {
                    $errorMessage = $responseData['message'] ?? $responseData['error'] ?? ($responseData['errorMessage'] ?? 'Bilinmeyen hata');
                    Log::error('Hepsijet: İptal hatası', ['response' => $responseData]);
                    return $this->shipmentResponse(400, 'İptal edilemedi: ' . $errorMessage);
                }
            } else {
                $errorBody = $response->json();
                $errorMessage = $errorBody['message'] ?? $errorBody['error'] ?? ($errorBody['errorMessage'] ?? 'API hatası');
                Log::error('Hepsijet: İptal API hatası', [
                    'status' => $response->status(),
                    'endpoint' => $endpoint,
                    'body' => $response->body()
                ]);
                return $this->shipmentResponse($response->status(), 'API hatası: ' . $errorMessage);
            }
        } catch (\Exception $e) {
            Log::error('Hepsijet: İptal exception', ['error' => $e->getMessage()]);
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Kargo takibi yapar
     * Hepsijet API: getDeliveryTracking veya delivery/integration/track
     */
    public function track($params)
    {
        try {
            $token = $this->getToken();
            if (!$token) {
                return $this->shipmentResponse(503, 'Hepsijet API token alınamadı.');
            }

            $deliveryNo = $params['delivery_no'] ?? $params['tracking_number'] ?? null;
            $barcode = $params['barcode'] ?? null;
            $customerOrderId = $params['order_code'] ?? $params['invoice_number'] ?? ($params['InvoiceNumber'] ?? null);

            if (empty($deliveryNo) && empty($barcode) && empty($customerOrderId)) {
                return $this->shipmentResponse(400, 'Gönderi numarası, barkod veya sipariş numarası gereklidir.');
            }

            // Request body hazırla
            $trackData = [];
            if (!empty($deliveryNo)) {
                $trackData['deliveryNo'] = $deliveryNo;
            } elseif (!empty($barcode)) {
                $trackData['barcode'] = $barcode;
            } elseif (!empty($customerOrderId)) {
                $trackData['customerOrderId'] = $customerOrderId;
            }

            // Önce getDeliveryTracking endpoint'ini dene
            $endpoints = [
                '/deliveryTransaction/getDeliveryTracking',
                '/delivery/integration/track', // Alternatif endpoint
            ];

            $lastError = null;
            foreach ($endpoints as $endpoint) {
                try {
                    $response = Http::withHeaders([
                        'Authorization' => 'Bearer ' . $token,
                        'Content-Type' => 'application/json',
                        'accept' => 'application/json',
                    ])->post($this->baseUrl . $endpoint, $trackData);

                    if ($response->successful()) {
                        $responseData = $response->json();
                        
                        // Response formatı: deliveryNo, status, statusDescription, events, trackingEvents
                        $deliveryNo = $responseData['deliveryNo'] ?? $responseData['delivery_no'] ?? null;
                        $status = $responseData['status'] ?? $responseData['Status'] ?? '';
                        $statusDescription = $responseData['statusDescription'] ?? $responseData['status_description'] ?? $status;
                        $events = $responseData['events'] ?? $responseData['Events'] ?? [];
                        $trackingEvents = $responseData['trackingEvents'] ?? $responseData['tracking_events'] ?? [];

                        return $this->shipmentResponse(200, 'Kargo takibi başarılı.', [
                            'status' => $status,
                            'description' => $statusDescription,
                            'events' => $events,
                            'tracking_events' => $trackingEvents,
                            'tracking_number' => $deliveryNo ?? ($barcode ?? $customerOrderId),
                            'delivery_no' => $deliveryNo,
                        ]);
                    } else {
                        $lastError = [
                            'status' => $response->status(),
                            'body' => $response->body(),
                            'endpoint' => $endpoint,
                        ];
                        // İlk endpoint başarısız olursa bir sonrakini dene
                        continue;
                    }
                } catch (\Exception $e) {
                    $lastError = [
                        'error' => $e->getMessage(),
                        'endpoint' => $endpoint,
                    ];
                    continue;
                }
            }

            // Her iki endpoint de başarısız oldu
            Log::error('Hepsijet: Takip API hatası', $lastError);
            $errorBody = isset($lastError['body']) ? json_decode($lastError['body'], true) : [];
            $errorMessage = $errorBody['message'] ?? $errorBody['error'] ?? ($errorBody['errorMessage'] ?? 'Takip yapılamadı');
            return $this->shipmentResponse($lastError['status'] ?? 503, 'API hatası: ' . $errorMessage);
        } catch (\Exception $e) {
            Log::error('Hepsijet: Takip exception', ['error' => $e->getMessage()]);
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Barkod etiketi alır
     * Hepsijet API: BarcodeLabel (POST) veya generateZplBarcode (GET)
     */
    public function getLabel($params)
    {
        try {
            $token = $this->getToken();
            if (!$token) {
                return $this->shipmentResponse(503, 'Hepsijet API token alınamadı.');
            }

            $barcode = $params['barcode'] ?? $params['tracking_number'] ?? ($params['InvoiceNumber'] ?? '');
            $totalParcel = (int) ($params['total_parcel'] ?? $params['totalParcel'] ?? 1);

            if (empty($barcode)) {
                return $this->shipmentResponse(400, 'Barkod numarası gereklidir.');
            }

            // Önce BarcodeLabel POST endpoint'ini dene (PDF/görsel için)
            $labelData = [
                'barcode' => $barcode,
                'totalParcel' => $totalParcel,
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/json',
                'accept' => 'application/json',
            ])->post($this->baseUrl . '/delivery/BarcodeLabel', $labelData);

            if ($response->successful()) {
                $contentType = $response->header('Content-Type');
                
                // PDF veya görsel dosyası dönebilir
                if (strpos($contentType, 'application/pdf') !== false || strpos($contentType, 'image') !== false) {
                    return $this->shipmentResponse(200, 'Etiket başarıyla alındı.', [
                        'label' => base64_encode($response->body()),
                        'content_type' => $contentType,
                        'tracking_number' => $barcode,
                        'barcode' => $barcode,
                    ]);
                } else {
                    // JSON response olabilir (label_url içerebilir)
                    $responseData = $response->json();
                    if (isset($responseData['labelUrl']) || isset($responseData['label_url'])) {
                        return $this->shipmentResponse(200, 'Etiket URL\'si alındı.', [
                            'label_url' => $responseData['labelUrl'] ?? $responseData['label_url'],
                            'tracking_number' => $barcode,
                            'barcode' => $barcode,
                        ]);
                    }
                }
            }

            // BarcodeLabel başarısız olursa generateZplBarcode GET endpoint'ini dene (ZPL formatı için)
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'accept' => 'text/plain',
            ])->get($this->baseUrl . '/delivery/generateZplBarcode/' . $barcode . '/' . $totalParcel);

            if ($response->successful()) {
                $contentType = $response->header('Content-Type');
                $zplContent = $response->body();
                
                // ZPL formatında barkod döner
                return $this->shipmentResponse(200, 'ZPL barkod başarıyla alındı.', [
                    'label' => base64_encode($zplContent),
                    'content_type' => $contentType ?? 'text/plain',
                    'format' => 'zpl',
                    'tracking_number' => $barcode,
                    'barcode' => $barcode,
                ]);
            }

            Log::error('Hepsijet: Etiket alma hatası', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return $this->shipmentResponse(503, 'Etiket alınamadı.');
        } catch (\Exception $e) {
            Log::error('Hepsijet: Etiket alma exception', ['error' => $e->getMessage()]);
            return $this->shipmentResponse(503, 'Bir hata oluştu: ' . $e->getMessage());
        }
    }
}

