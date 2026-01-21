<?php

namespace App\Services\Erp\Providers;

use App\Interfaces\ErpIntegrationInterface;
use App\Models\UserIntegration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BizimHesapProvider implements ErpIntegrationInterface
{
    protected string $baseUrl = 'https://bizimhesap.com/api/b2b';
    protected UserIntegration $integration;

    /**
     * HTTP request timeout in seconds
     */
    protected int $timeout = 30;

    public function __construct(UserIntegration $integration)
    {
        $this->integration = $integration;
    }

    public function getName(): string
    {
        return 'bizimhesap';
    }

    public function testConnection(): bool
    {
        try {
            // Fetch products to test connection as there is no specific auth/check endpoint doc
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Key' => $this->integration->api_secret, // Using Secret field for 'Key' header
                    'Token' => $this->integration->api_key,   // Using Key field for 'Token' header
                ])->get($this->baseUrl . '/products');

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("BizimHesap connection error: " . $e->getMessage());
            return false;
        }
    }

    public function getProducts(int $page = 1, int $limit = 100): array
    {
        // BizimHesap documentation doesn't specify pagination for /products endpoint
        // It might return all products at once.
        // If page > 1, and no pagination support, we should return empty to stop the loop in SyncJob,
        // UNLESS we want to implement manual slicing here (but SyncJob does the looping).

        if ($page > 1) {
            return []; // Assume no pagination or single page all products
        }

        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Key' => $this->integration->api_secret,
                    'Token' => $this->integration->api_key,
                    'Content-Type' => 'application/json'
                ])->get($this->baseUrl . '/products');

            if ($response->successful()) {
                $data = $response->json();

                // Handle various potential response structures
                if (is_array($data)) {
                    // Check if it's list of objects or wrapper
                    if (isset($data[0]) && is_array($data[0]))
                        return $data;
                    return $data['data'] ?? $data['list'] ?? $data['products'] ?? $data;
                }

                return $data['data'] ?? $data['result'] ?? [];
            }

            Log::error("BizimHesap getProducts failed: " . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error("BizimHesap getProducts exception: " . $e->getMessage());
            return [];
        }
    }

    public function mapToSystemSchema(array $erpProduct): array
    {
        // Based on Invoice Details structure in documentation
        // Keys might be PascalCase or camelCase depending on API consistency.
        // Doc shows camelCase in JSON request example (productId, productName, etc.)

        $price = (float) ($erpProduct['salePrice'] ?? $erpProduct['unitPrice'] ?? $erpProduct['price'] ?? 0);

        // Handle stock - 'quantity' or 'stockAmount'
        $stock = (int) ($erpProduct['quantity'] ?? $erpProduct['stock'] ?? $erpProduct['amount'] ?? 0);

        return [
            'barcode' => $erpProduct['barcode'] ?? $erpProduct['Barcode'] ?? null,
            'name' => $erpProduct['productName'] ?? $erpProduct['ProductName'] ?? $erpProduct['name'] ?? null,
            'stock' => $stock,
            'price' => $price,
            'currency' => $erpProduct['currency'] ?? 'TRY',
            'vat_rate' => (int) ($erpProduct['taxRate'] ?? $erpProduct['TaxRate'] ?? 0),
        ];
    }
}
