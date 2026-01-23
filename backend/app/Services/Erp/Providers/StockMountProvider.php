<?php

namespace App\Services\Erp\Providers;

use App\Interfaces\ErpIntegrationInterface;
use App\Models\UserIntegration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class StockMountProvider implements ErpIntegrationInterface
{
    protected string $baseUrl = 'https://out.stockmount.com';
    protected UserIntegration $integration;
    protected int $timeout = 30;
    protected ?string $apiCode = null;
    protected ?int $storeId = null;

    public function __construct(UserIntegration $integration)
    {
        $this->integration = $integration;

        // Check cached token
        $extras = $this->integration->extra_params ?? [];
        $this->apiCode = $extras['api_code'] ?? null;
        $this->storeId = $extras['store_id'] ?? null;
    }

    public function getName(): string
    {
        return 'stockmount';
    }

    /**
     * Login and get API token
     */
    protected function doLogin(): array
    {
        try {
            $extras = $this->integration->extra_params ?? [];
            $username = $extras['username'] ?? null;
            $password = $extras['password'] ?? null;

            // Method 1: Username + Password
            if ($username && $password) {
                $loginData = [
                    'Username' => $username,
                    'Password' => $password,
                ];
            }
            // Method 2: ApiKey + ApiPassword
            elseif ($this->integration->api_key && $this->integration->api_secret) {
                $loginData = [
                    'ApiKey' => $this->integration->api_key,
                    'ApiPassword' => $this->integration->api_secret,
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Giris bilgileri eksik. Username/Password veya ApiKey/ApiPassword gerekli.',
                ];
            }

            $response = Http::timeout($this->timeout)
                ->post($this->baseUrl . '/api/user/dologin', $loginData);

            $data = $response->json();

            Log::info('StockMount DoLogin Response', [
                'status' => $response->status(),
                'result' => $data['Result'] ?? null,
            ]);

            if ($response->successful() && ($data['Result'] ?? false)) {
                $this->apiCode = $data['Response']['ApiCode'] ?? null;

                if ($this->apiCode) {
                    $extras['api_code'] = $this->apiCode;
                    $this->integration->update(['extra_params' => $extras]);
                }

                return [
                    'success' => true,
                    'message' => 'Giris basarili.',
                    'data' => $data['Response'],
                ];
            }

            return [
                'success' => false,
                'message' => $data['ErrorMessage'] ?? $data['Message'] ?? 'Giris basarisiz.',
            ];
        } catch (\Exception $e) {
            Log::error('StockMount DoLogin Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Giris hatasi: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Ensure authenticated
     */
    protected function ensureAuthenticated(): bool
    {
        if (!$this->apiCode) {
            $result = $this->doLogin();
            return $result['success'];
        }
        return true;
    }

    public function testConnection(): bool
    {
        try {
            $result = $this->doLogin();

            if ($result['success']) {
                // Update status
                $this->integration->update([
                    'status' => 'active',
                    'error_message' => null,
                ]);
                return true;
            }

            $this->integration->update([
                'status' => 'error',
                'error_message' => $result['message'],
            ]);
            return false;
        } catch (\Exception $e) {
            Log::error('StockMount connection error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get product sources
     */
    protected function getProductSources(): array
    {
        if (!$this->ensureAuthenticated()) {
            return [];
        }

        try {
            $response = Http::timeout($this->timeout)
                ->post($this->baseUrl . '/api/Product/GetProductSources', [
                    'ApiCode' => $this->apiCode
                ]);

            $data = $response->json();

            if ($response->successful() && ($data['Result'] ?? false)) {
                return $data['Response'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('StockMount GetProductSources Error: ' . $e->getMessage());
            return [];
        }
    }

    public function getProducts(int $page = 1, int $limit = 100): array
    {
        if (!$this->ensureAuthenticated()) {
            return [];
        }

        try {
            // Get sources first
            $sources = $this->getProductSources();
            if (empty($sources)) {
                Log::warning('StockMount: No product sources found');
                return [];
            }

            $sourceId = $sources[0]['ProductSourceId'] ?? null;
            if (!$sourceId) {
                return [];
            }

            $response = Http::timeout($this->timeout)
                ->post($this->baseUrl . '/api/Product/GetProducts', [
                    'ApiCode' => $this->apiCode,
                    'ProductSourceId' => $sourceId,
                    'RowsByPage' => $limit,
                    'PageIndex' => $page,
                ]);

            $data = $response->json();

            if ($response->successful() && ($data['Result'] ?? false)) {
                return $data['Response']['Products'] ?? [];
            }

            Log::error('StockMount getProducts failed: ' . ($data['ErrorMessage'] ?? 'Unknown'));
            return [];
        } catch (\Exception $e) {
            Log::error('StockMount getProducts exception: ' . $e->getMessage());
            return [];
        }
    }

    public function mapToSystemSchema(array $erpProduct): array
    {
        return [
            'barcode' => $erpProduct['Barcode'] ?? null,
            'name' => $erpProduct['Name'] ?? null,
            'stock' => (int) ($erpProduct['Quantity'] ?? 0),
            'price' => (float) ($erpProduct['Price'] ?? 0),
            'currency' => 'TRY',
            'vat_rate' => (int) ($erpProduct['TaxRate'] ?? 0),
        ];
    }
}
