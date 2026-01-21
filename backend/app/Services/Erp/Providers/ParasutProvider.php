<?php

namespace App\Services\Erp\Providers;

use App\Interfaces\ErpIntegrationInterface;
use App\Models\UserIntegration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ParasutProvider implements ErpIntegrationInterface
{
    protected string $baseUrl = 'https://api.parasut.com/v4';
    protected string $authUrl = 'https://api.parasut.com/oauth/token';
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
        return 'parasut';
    }

    protected function authenticate(): string
    {
        $extras = $this->integration->extra_params ?? [];
        $accessToken = $extras['access_token'] ?? null;
        $refreshToken = $extras['refresh_token'] ?? null;
        $expiresAt = $extras['expires_at'] ?? 0;

        // Check if token is valid (with 5 min buffer)
        if ($accessToken && $expiresAt > time() + 300) {
            return $accessToken;
        }

        // Try Refresh Token
        if ($refreshToken) {
            $response = Http::timeout($this->timeout)
                ->asForm()
                ->post($this->authUrl, [
                    'grant_type' => 'refresh_token',
                    'client_id' => $this->integration->api_key,
                    'client_secret' => $this->integration->api_secret,
                    'refresh_token' => $refreshToken,
                ]);

            if ($response->successful()) {
                return $this->handleTokenResponse($response->json());
            }
            // If refresh fails, fall through to password grant
            Log::warning("Parasut refresh token failed, trying password grant.");
        }

        // Password Grant
        $username = $extras['username'] ?? null;
        $password = $extras['password'] ?? null;

        if (!$username || !$password) {
            throw new \Exception('Parasut re-authentication required but username/password missing.');
        }

        $response = Http::timeout($this->timeout)
            ->asForm()
            ->post($this->authUrl, [
                'grant_type' => 'password',
                'client_id' => $this->integration->api_key,
                'client_secret' => $this->integration->api_secret,
                'username' => $username,
                'password' => $password,
                'redirect_uri' => 'urn:ietf:wg:oauth:2.0:oob',
            ]);

        if ($response->successful()) {
            return $this->handleTokenResponse($response->json());
        }

        throw new \Exception('Parasut authentication failed: ' . $response->body());
    }

    protected function handleTokenResponse(array $data): string
    {
        $extras = $this->integration->extra_params ?? [];
        $extras['access_token'] = $data['access_token'];
        $extras['refresh_token'] = $data['refresh_token'] ?? $extras['refresh_token']; // Keep old if not rotated, though Parasut usually rotates
        $extras['expires_at'] = time() + ($data['expires_in'] ?? 7200);

        $this->integration->update(['extra_params' => $extras]);

        return $data['access_token'];
    }

    public function testConnection(): bool
    {
        try {
            $this->authenticate();
            return true;
        } catch (\Exception $e) {
            Log::error("Parasut connection error: " . $e->getMessage());
            return false;
        }
    }

    public function getProducts(int $page = 1, int $limit = 25): array
    {
        try {
            $token = $this->authenticate();
            $companyId = $this->integration->app_id;

            $response = Http::timeout($this->timeout)
                ->withToken($token)
                ->get("{$this->baseUrl}/{$companyId}/products", [
                    'page' => [
                        'number' => $page,
                        'size' => $limit
                    ],
                    'include' => 'inventory_levels' // Request inventory levels if available as relationship
                ]);

            if ($response->successful()) {
                $body = $response->json();
                return $body['data'] ?? [];
            }

            Log::error("Parasut getProducts failed: " . $response->body());
            return [];
        } catch (\Exception $e) {
            Log::error("Parasut getProducts exception: " . $e->getMessage());
            return [];
        }
    }

    public function mapToSystemSchema(array $erpProduct): array
    {
        $attr = $erpProduct['attributes'] ?? [];

        // Stock: try 'stock_count' from attributes, generally read-only attribute computed by Parasut
        $stock = (int) ($attr['stock_count'] ?? 0);

        return [
            'barcode' => $attr['barcode'] ?? null,
            'name' => $attr['name'] ?? null,
            'stock' => $stock,
            'price' => (float) ($attr['list_price'] ?? 0),
            'currency' => $attr['currency'] ?? 'TRY',
            'vat_rate' => (int) ($attr['vat_rate'] ?? 0),
        ];
    }
}
