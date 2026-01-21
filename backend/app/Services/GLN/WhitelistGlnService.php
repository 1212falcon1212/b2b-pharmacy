<?php

namespace App\Services\GLN;

use App\Models\GlnWhitelist;
use App\Services\GLN\Contracts\GlnVerificationInterface;

class WhitelistGlnService implements GlnVerificationInterface
{
    /**
     * Verify if a GLN code is valid using the whitelist database
     */
    public function verify(string $glnCode): GlnVerificationResult
    {
        // First validate format
        if (!$this->validateFormat($glnCode)) {
            return GlnVerificationResult::failure(
                errorMessage: 'Geçersiz GLN formatı. GLN 13 haneli olmalıdır.',
                errorCode: 'INVALID_FORMAT'
            );
        }

        // Check whitelist
        $whitelisted = GlnWhitelist::findByGln($glnCode);

        if (!$whitelisted) {
            return GlnVerificationResult::failure(
                errorMessage: 'Bu GLN kodu sistemde kayıtlı değil.',
                errorCode: 'NOT_FOUND'
            );
        }

        return GlnVerificationResult::success(
            glnCode: $whitelisted->gln_code,
            pharmacyName: $whitelisted->pharmacy_name,
            city: $whitelisted->city,
            district: $whitelisted->district,
            address: $whitelisted->address,
        );
    }

    /**
     * Verify if a GLN code is valid and available for registration
     */
    public function verifyForRegistration(string $glnCode): GlnVerificationResult
    {
        // First validate format
        if (!$this->validateFormat($glnCode)) {
            return GlnVerificationResult::failure(
                errorMessage: 'Geçersiz GLN formatı. GLN 13 haneli olmalıdır.',
                errorCode: 'INVALID_FORMAT'
            );
        }

        // Check whitelist
        $whitelisted = GlnWhitelist::findByGln($glnCode);

        if (!$whitelisted) {
            return GlnVerificationResult::failure(
                errorMessage: 'Bu GLN kodu sistemde kayıtlı değil.',
                errorCode: 'NOT_FOUND'
            );
        }

        // Check if already used
        if ($whitelisted->is_used) {
            return GlnVerificationResult::failure(
                errorMessage: 'Bu GLN kodu başka bir kullanıcı tarafından kullanılıyor.',
                errorCode: 'ALREADY_USED'
            );
        }

        return GlnVerificationResult::success(
            glnCode: $whitelisted->gln_code,
            pharmacyName: $whitelisted->pharmacy_name,
            city: $whitelisted->city,
            district: $whitelisted->district,
            address: $whitelisted->address,
        );
    }

    /**
     * Check if a GLN code is already used by another user
     */
    public function isAlreadyUsed(string $glnCode): bool
    {
        return GlnWhitelist::isAlreadyUsed($glnCode);
    }

    /**
     * Mark a GLN code as used by a user
     */
    public function markAsUsed(string $glnCode, int $userId): bool
    {
        $whitelisted = GlnWhitelist::findByGln($glnCode);

        if (!$whitelisted) {
            return false;
        }

        return $whitelisted->markAsUsed($userId);
    }

    /**
     * Release a GLN code (mark as unused)
     */
    public function release(string $glnCode): bool
    {
        $whitelisted = GlnWhitelist::where('gln_code', $glnCode)->first();

        if (!$whitelisted) {
            return false;
        }

        return $whitelisted->release();
    }

    /**
     * Get pharmacy information by GLN code
     */
    public function getPharmacyInfo(string $glnCode): ?array
    {
        $whitelisted = GlnWhitelist::findByGln($glnCode);

        if (!$whitelisted) {
            return null;
        }

        return [
            'gln_code' => $whitelisted->gln_code,
            'pharmacy_name' => $whitelisted->pharmacy_name,
            'city' => $whitelisted->city,
            'district' => $whitelisted->district,
            'address' => $whitelisted->address,
            'is_used' => $whitelisted->is_used,
        ];
    }

    /**
     * Validate GLN code format
     * GLN is a 13-digit number with a check digit
     */
    public function validateFormat(string $glnCode): bool
    {
        // Must be exactly 13 digits
        if (!preg_match('/^\d{13}$/', $glnCode)) {
            return false;
        }

        // Validate check digit (GS1 standard)
        return $this->validateCheckDigit($glnCode);
    }

    /**
     * Validate GS1 check digit
     * The check digit is calculated using the standard GS1 algorithm
     */
    private function validateCheckDigit(string $glnCode): bool
    {
        $digits = str_split($glnCode);
        $checkDigit = (int) array_pop($digits);

        $sum = 0;
        foreach ($digits as $index => $digit) {
            // Multiply by 1 for even positions, 3 for odd positions (0-indexed)
            $multiplier = ($index % 2 === 0) ? 1 : 3;
            $sum += (int) $digit * $multiplier;
        }

        $calculatedCheckDigit = (10 - ($sum % 10)) % 10;

        return $checkDigit === $calculatedCheckDigit;
    }
}

