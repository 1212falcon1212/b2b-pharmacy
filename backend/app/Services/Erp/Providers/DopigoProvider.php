<?php

namespace App\Services\Erp\Providers;

use App\Interfaces\ErpIntegrationInterface;
use App\Models\UserIntegration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class DopigoProvider implements ErpIntegrationInterface
{
    protected string $baseUrl = 'https://panel.dopigo.com';
    protected UserIntegration $integration;
    protected int $timeout = 30;
    protected ?string $token = null;

    public function __construct(UserIntegration $integration)
    {
        $this->integration = $integration;

        // Check cached token
        $extras = $this->integration->extra_params ?? [];
        $this->token = $extras['token'] ?? null;
    }

    public function getName(): string
    {
        return 'dopigo';
    }

    /**
     * Get authentication token
     */
    protected function getToken(): ?string
    {
        if ($this->token) {
            return $this->token;
        }

        // Check cache
        $cacheKey = 'dopigo_token_' . $this->integration->id;
        $cachedToken = Cache::get($cacheKey);

        if ($cachedToken) {
            $this->token = $cachedToken;
            return $this->token;
        }

        // Get new token
        try {
            $extras = $this->integration->extra_params ?? [];
            $username = $extras['username'] ?? $this->integration->api_key;
            $password = $extras['password'] ?? $this->integration->api_secret;

            $response = Http::asMultipart()
                ->timeout($this->timeout)
                ->post($this->baseUrl . '/users/get_auth_token/', [
                    ['name' => 'username', 'contents' => $username],
                    ['name' => 'password', 'contents' => $password],
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $this->token = $data['token'] ?? null;

                if ($this->token) {
                    // Cache for 30 days
                    Cache::put($cacheKey, $this->token, now()->addDays(30));

                    // Save to integration
                    $extras['token'] = $this->token;
                    $this->integration->update(['extra_params' => $extras]);
                }

                return $this->token;
            }

            Log::error('Dopigo Token Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Dopigo Token Exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get authenticated HTTP client
     */
    protected function getHttpClient()
    {
        $token = $this->getToken();

        return Http::withHeaders([
            'Authorization' => 'Token ' . $token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->timeout($this->timeout);
    }

    public function testConnection(): bool
    {
        try {
            $token = $this->getToken();

            if (!$token) {
                $this->integration->update([
                    'status' => 'error',
                    'error_message' => 'Token alinamadi. Kullanici adi ve sifrenizi kontrol edin.',
                ]);
                return false;
            }

            // Test with products endpoint
            $response = $this->getHttpClient()
                ->get($this->baseUrl . '/api/v1/products/all/', ['limit' => 1]);

            if ($response->successful()) {
                $this->integration->update([
                    'status' => 'active',
                    'error_message' => null,
                ]);
                return true;
            }

            if ($response->status() === 401) {
                Cache::forget('dopigo_token_' . $this->integration->id);
            }

            $this->integration->update([
                'status' => 'error',
                'error_message' => 'Baglanti basarisiz: ' . $response->body(),
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('Dopigo connection error: ' . $e->getMessage());
            return false;
        }
    }

    public function getProducts(int $page = 1, int $limit = 100): array
    {
        try {
            // Rate limiting
            usleep(500000); // 500ms

            $response = $this->getHttpClient()
                ->get($this->baseUrl . '/api/v1/products/all/');

            if ($response->successful()) {
                $data = $response->json();
                $results = $data['results'] ?? [];
                $products = [];

                foreach ($results as $meta) {
                    // Skip archived
                    if (!empty($meta['archived'])) {
                        continue;
                    }

                    $metaName = $meta['name'] ?? '';
                    $vat = $meta['vat'] ?? 18;
                    $variants = $meta['products'] ?? [];

                    foreach ($variants as $product) {
                        $products[] = [
                            'id' => $product['id'] ?? null,
                            'sku' => $product['sku'] ?? null,
                            'barcode' => $product['barcode'] ?? null,
                            'name' => $product['invoice_name'] ?? $metaName,
                            'price' => (float) ($product['price'] ?? 0),
                            'stock' => (int) ($product['stock'] ?? 0),
                            'vat' => $vat,
                            'currency' => $product['price_currency'] ?? 'TRY',
                        ];
                    }
                }

                // Only return first page results
                if ($page > 1 && empty($data['next'])) {
                    return [];
                }

                return $products;
            }

            Log::error('Dopigo getProducts failed: ' . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error('Dopigo getProducts exception: ' . $e->getMessage());
            return [];
        }
    }

    public function mapToSystemSchema(array $erpProduct): array
    {
        return [
            'barcode' => $erpProduct['barcode'] ?? null,
            'name' => $erpProduct['name'] ?? null,
            'stock' => (int) ($erpProduct['stock'] ?? 0),
            'price' => (float) ($erpProduct['price'] ?? 0),
            'currency' => $erpProduct['currency'] ?? 'TRY',
            'vat_rate' => (int) ($erpProduct['vat'] ?? 18),
        ];
    }
}
