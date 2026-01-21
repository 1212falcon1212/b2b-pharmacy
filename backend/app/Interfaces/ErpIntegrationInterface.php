<?php

namespace App\Interfaces;

interface ErpIntegrationInterface
{
    /**
     * Get products from ERP
     * Returns an array of standardized product objects/arrays
     * 
     * @param int $page Pagination page
     * @param int $limit Items per page
     */
    public function getProducts(int $page = 1, int $limit = 100): array;

    /**
     * Map vendor specific product data to system schema
     */
    public function mapToSystemSchema(array $erpProduct): array;

    /**
     * Test API connection
     */
    public function testConnection(): bool;

    /**
     * Get Provider Name
     */
    public function getName(): string;
}
