<?php

namespace App\Services\Erp\Providers;

use App\Interfaces\ErpIntegrationInterface;
use App\Models\UserIntegration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SentosProvider implements ErpIntegrationInterface
{
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
        return 'sentos';
    }

    protected function getBaseUrl(): string
    {
        // 'app_id' holds the subdomain (firm name)
        $subdomain = $this->integration->app_id;
        if (empty($subdomain)) {
            // Fallback or error if app_id is missing, though validation should handle it
            throw new \Exception('Sentos integration requires App ID (Subdomain).');
        }
        return "https://{$subdomain}.sentos.com.tr/api";
    }

    public function testConnection(): bool
    {
        try {
            // /categories is a lightweight endpoint for testing
            $response = Http::timeout($this->timeout)
                ->withBasicAuth($this->integration->api_key, $this->integration->api_secret)
                ->get($this->getBaseUrl() . '/categories');

            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Sentos connection error: " . $e->getMessage());
            return false;
        }
    }

    public function getProducts(int $page = 1, int $limit = 100): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withBasicAuth($this->integration->api_key, $this->integration->api_secret)
                ->get($this->getBaseUrl() . '/products', [
                    'page' => $page,
                    'size' => $limit,
                ]);

            if ($response->successful()) {
                $items = $response->json();

                // Usually list endpoint returns array. If single object (unlikely for list), wrap it.
                if (isset($items['id'])) {
                    $items = [$items];
                }

                $flattened = [];
                foreach ($items as $item) {
                    // If product has variants, sync variants as individual products
                    if (!empty($item['variants']) && is_array($item['variants'])) {
                        foreach ($item['variants'] as $variant) {
                            // Merge parent info needed for variant
                            $variantItem = $variant;
                            $variantItem['_parent_name'] = $item['name'] ?? '';
                            $variantItem['_parent_price'] = $item['sale_price'] ?? 0;
                            $variantItem['_parent_currency'] = $item['currency'] ?? 'TL';
                            $variantItem['_parent_vat'] = $item['vat_rate'] ?? 0;
                            $variantItem['is_variant'] = true;

                            $flattened[] = $variantItem;
                        }
                    } else {
                        // Simple product
                        $item['is_variant'] = false;
                        $flattened[] = $item;
                    }
                }

                return $flattened;
            }

            Log::error("Sentos getProducts failed: " . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error("Sentos getProducts exception: " . $e->getMessage());
            return [];
        }
    }

    public function mapToSystemSchema(array $erpProduct): array
    {
        $stocks = $erpProduct['stocks'] ?? [];
        $totalStock = 0;
        if (is_array($stocks)) {
            $totalStock = array_sum(array_column($stocks, 'stock'));
        }

        // Price handling
        $rawPrice = $erpProduct['sale_price'] ?? $erpProduct['_parent_price'] ?? 0;
        // Convert "89,90" to "89.90"
        if (is_string($rawPrice)) {
            $rawPrice = str_replace(',', '.', str_replace('.', '', $rawPrice)); // Remove thousand separator first if any? Sentos example "89,90" -> no thousand. "2.400,00"? 
            // The example shows "75,00". Simple str_replace comma to dot.
            // CAREFUL: "2.400,00" -> replace dot leads to "2400,00" -> replace comma "2400.00". Correct.
            // "89,90" -> "89.90". Correct.
            // "12.30" -> "1230" (if dot is thousand). 
            // Let's assume standard Turkish formatting: Dot is thousand, Comma is decimal.
            $rawPrice = str_replace('.', '', $rawPrice);
            $rawPrice = str_replace(',', '.', $rawPrice);
        }
        $price = (float) $rawPrice;

        // Name handling
        $name = $erpProduct['name'] ?? '';
        if (!empty($erpProduct['is_variant'])) {
            $parentName = $erpProduct['_parent_name'] ?? '';
            // Construct name: Parent Name - Color - Model value?
            // Variant keys: color, model { name, value }.
            $variantSuffix = '';
            if (!empty($erpProduct['color']))
                $variantSuffix .= ' ' . $erpProduct['color'];
            if (!empty($erpProduct['model']['value']))
                $variantSuffix .= ' ' . $erpProduct['model']['value'];

            $name = trim($parentName . $variantSuffix);
        }

        return [
            'barcode' => $erpProduct['barcode'] ?? null,
            'name' => $name,
            'stock' => (int) $totalStock,
            'price' => $price,
            'currency' => $erpProduct['currency'] ?? $erpProduct['_parent_currency'] ?? 'TRY',
            'vat_rate' => (int) ($erpProduct['vat_rate'] ?? $erpProduct['_parent_vat'] ?? 0),
        ];
    }
}
