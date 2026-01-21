<?php

namespace App\Services\GLN\Contracts;

use App\Services\GLN\GlnVerificationResult;

interface GlnVerificationInterface
{
    /**
     * Verify if a GLN code is valid
     *
     * @param string $glnCode The 13-digit GLN code
     * @return GlnVerificationResult
     */
    public function verify(string $glnCode): GlnVerificationResult;

    /**
     * Get pharmacy information by GLN code
     *
     * @param string $glnCode The 13-digit GLN code
     * @return array|null Returns pharmacy info array or null if not found
     */
    public function getPharmacyInfo(string $glnCode): ?array;

    /**
     * Validate GLN code format (13 digits, valid check digit)
     *
     * @param string $glnCode
     * @return bool
     */
    public function validateFormat(string $glnCode): bool;
}

