<?php

namespace App\Services\GLN;

use App\Services\GLN\Contracts\GlnVerificationInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ITS (İlaç Takip Sistemi) GLN Verification Service
 * 
 * This is a placeholder implementation for the real ITS API.
 * When ready to integrate with ITS/GS1, implement the actual API calls here.
 */
class ItsGlnService implements GlnVerificationInterface
{
    private string $apiUrl;
    private string $apiKey;
    private int $timeout;

    public function __construct()
    {
        $this->apiUrl = config('services.gln.its.api_url', '');
        $this->apiKey = config('services.gln.its.api_key', '');
        $this->timeout = config('services.gln.its.timeout', 30);
    }

    /**
     * Verify if a GLN code is valid using ITS API
     */
    public function verify(string $glnCode): GlnVerificationResult
    {
        // Validate format first
        if (!$this->validateFormat($glnCode)) {
            return GlnVerificationResult::failure(
                errorMessage: 'Geçersiz GLN formatı. GLN 13 haneli olmalıdır.',
                errorCode: 'INVALID_FORMAT'
            );
        }

        // TODO: Implement actual ITS API call
        // This is a placeholder that will return failure until configured
        
        if (empty($this->apiUrl) || empty($this->apiKey)) {
            Log::warning('ITS GLN Service: API credentials not configured');
            
            return GlnVerificationResult::failure(
                errorMessage: 'GLN doğrulama servisi yapılandırılmamış.',
                errorCode: 'SERVICE_NOT_CONFIGURED'
            );
        }

        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->get("{$this->apiUrl}/verify/{$glnCode}");

            if ($response->failed()) {
                Log::error('ITS GLN verification failed', [
                    'gln_code' => $glnCode,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                return GlnVerificationResult::failure(
                    errorMessage: 'GLN doğrulama servisi şu anda kullanılamıyor.',
                    errorCode: 'SERVICE_ERROR'
                );
            }

            $data = $response->json();

            if (!($data['valid'] ?? false)) {
                return GlnVerificationResult::failure(
                    errorMessage: $data['message'] ?? 'Bu GLN kodu geçersiz.',
                    errorCode: $data['error_code'] ?? 'INVALID_GLN'
                );
            }

            return GlnVerificationResult::success(
                glnCode: $glnCode,
                pharmacyName: $data['pharmacy_name'] ?? '',
                city: $data['city'] ?? null,
                district: $data['district'] ?? null,
                address: $data['address'] ?? null,
            );
        } catch (\Exception $e) {
            Log::error('ITS GLN verification exception', [
                'gln_code' => $glnCode,
                'error' => $e->getMessage(),
            ]);

            return GlnVerificationResult::failure(
                errorMessage: 'GLN doğrulama sırasında bir hata oluştu.',
                errorCode: 'EXCEPTION'
            );
        }
    }

    /**
     * Get pharmacy information by GLN code using ITS API
     */
    public function getPharmacyInfo(string $glnCode): ?array
    {
        $result = $this->verify($glnCode);

        if (!$result->success) {
            return null;
        }

        return [
            'gln_code' => $result->glnCode,
            'pharmacy_name' => $result->pharmacyName,
            'city' => $result->city,
            'district' => $result->district,
            'address' => $result->address,
        ];
    }

    /**
     * Validate GLN code format
     */
    public function validateFormat(string $glnCode): bool
    {
        // Must be exactly 13 digits
        if (!preg_match('/^\d{13}$/', $glnCode)) {
            return false;
        }

        return $this->validateCheckDigit($glnCode);
    }

    /**
     * Validate GS1 check digit
     */
    private function validateCheckDigit(string $glnCode): bool
    {
        $digits = str_split($glnCode);
        $checkDigit = (int) array_pop($digits);

        $sum = 0;
        foreach ($digits as $index => $digit) {
            $multiplier = ($index % 2 === 0) ? 1 : 3;
            $sum += (int) $digit * $multiplier;
        }

        $calculatedCheckDigit = (10 - ($sum % 10)) % 10;

        return $checkDigit === $calculatedCheckDigit;
    }
}

