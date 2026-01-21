<?php

namespace App\Services\Erp\Providers;

use App\Interfaces\ErpIntegrationInterface;
use App\Models\UserIntegration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EntegraProvider implements ErpIntegrationInterface
{
    protected string $baseUrl = 'https://apiv2.entegrabilisim.com';
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
        return 'entegra';
    }

    protected function authenticate(): string
    {
        // Return existing token if available (and not expired logic could be added)
        if (!empty($this->integration->extra_params['access_token'])) {
            return $this->integration->extra_params['access_token'];
        }

        // Request new token
        $response = Http::timeout($this->timeout)
            ->post($this->baseUrl . '/api/user/token/obtain/', [
                'email' => $this->integration->api_key,
                'password' => $this->integration->api_secret,
            ]);

        if ($response->successful()) {
            $data = $response->json();
            // Assuming the token key is 'token' based on common practices, 
            // as documentation didn't explicitly show the response body for obtain.
            // If it fails, we might need to adjust this key.
            $token = $data['token'] ?? $data['access'] ?? null;

            if (!$token) {
                throw new \Exception('Entegra login successful but no token found in response.');
            }

            $extras = $this->integration->extra_params ?? [];
            $extras['access_token'] = $token;
            $this->integration->update(['extra_params' => $extras]);

            return $token;
        }

        throw new \Exception('Entegra authentication failed: ' . $response->body());
    }

    public function testConnection(): bool
    {
        try {
            $this->authenticate();
            return true;
        } catch (\Exception $e) {
            Log::error("Entegra connection error: " . $e->getMessage());
            return false;
        }
    }

    public function getProducts(int $page = 1, int $limit = 100): array
    {
        try {
            $token = $this->authenticate();

            // API uses /product/page={page}/ format
            $url = $this->baseUrl . "/product/page={$page}/";

            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => 'JWT ' . $token,
                    'Content-Type' => 'application/json'
                ])->get($url);

            if ($response->successful()) {
                $data = $response->json();
                return $data['porductList'] ?? $data['productList'] ?? []; // Fallback for potential API typo handling
            }

            Log::error("Entegra getProducts failed: " . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error("Entegra getProducts exception: " . $e->getMessage());
            return [];
        }
    }

    public function mapToSystemSchema(array $erpProduct): array
    {
        // Entegra returns fields like price1, price2. Assuming price2 is sale price.
        $price = (float) ($erpProduct['price2'] ?? $erpProduct['price1'] ?? 0);
        $stock = (int) ($erpProduct['quantity'] ?? 0);

        return [
            'barcode' => $erpProduct['barcode'] ?? null,
            'name' => $erpProduct['name'] ?? null,
            'stock' => $stock,
            'price' => $price > 0 ? $price : (float) ($erpProduct['price1'] ?? 0),
            'currency' => $erpProduct['currencyType'] ?? 'TRY',
            'vat_rate' => (int) ($erpProduct['kdv_id'] ?? 0),
        ];
    }
}
