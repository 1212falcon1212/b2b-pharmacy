<?php

namespace App\Services\GLN;

class GlnVerificationResult
{
    public function __construct(
        public readonly bool $success,
        public readonly ?string $glnCode = null,
        public readonly ?string $pharmacyName = null,
        public readonly ?string $city = null,
        public readonly ?string $district = null,
        public readonly ?string $address = null,
        public readonly ?string $errorMessage = null,
        public readonly ?string $errorCode = null,
    ) {}

    /**
     * Create a successful result
     */
    public static function success(
        string $glnCode,
        string $pharmacyName,
        ?string $city = null,
        ?string $district = null,
        ?string $address = null,
    ): self {
        return new self(
            success: true,
            glnCode: $glnCode,
            pharmacyName: $pharmacyName,
            city: $city,
            district: $district,
            address: $address,
        );
    }

    /**
     * Create a failed result
     */
    public static function failure(string $errorMessage, ?string $errorCode = null): self
    {
        return new self(
            success: false,
            errorMessage: $errorMessage,
            errorCode: $errorCode,
        );
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'gln_code' => $this->glnCode,
            'pharmacy_name' => $this->pharmacyName,
            'city' => $this->city,
            'district' => $this->district,
            'address' => $this->address,
            'error_message' => $this->errorMessage,
            'error_code' => $this->errorCode,
        ];
    }
}

