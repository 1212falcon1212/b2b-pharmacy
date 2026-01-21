<?php

namespace App\Services;

use App\Models\OrderItem;
use App\Models\Setting;

class FeeCalculationService
{
    // Varsayılan oranlar
    protected float $marketplaceFeeRate;
    protected float $withholdingTaxRate;
    protected bool $commissionEnabled;

    public function __construct()
    {
        $this->marketplaceFeeRate = (float) Setting::getValue('commission.marketplace_fee_rate', 0.89);
        $this->withholdingTaxRate = (float) Setting::getValue('commission.withholding_tax_rate', 1.00);
        $this->commissionEnabled = (bool) Setting::getValue('commission.enabled', true);
    }

    /**
     * Sipariş kalemi için tüm kesintileri hesapla
     */
    public function calculateFees(
        float $totalPrice,
        float $commissionRate,
        float $shippingCostShare = 0
    ): array {
        // Kategori komisyonu
        $commissionAmount = $this->commissionEnabled
            ? $totalPrice * ($commissionRate / 100)
            : 0;

        // Pazaryeri hizmet bedeli (%0.89)
        $marketplaceFee = $totalPrice * ($this->marketplaceFeeRate / 100);

        // Stopaj (%1)
        $withholdingTax = $totalPrice * ($this->withholdingTaxRate / 100);

        // Toplam kesinti
        $totalFees = $commissionAmount + $marketplaceFee + $withholdingTax + $shippingCostShare;

        // Net satıcı tutarı
        $netSellerAmount = $totalPrice - $totalFees;

        return [
            'total_price' => round($totalPrice, 2),
            'commission_rate' => $commissionRate,
            'commission_amount' => round($commissionAmount, 2),
            'marketplace_fee_rate' => $this->marketplaceFeeRate,
            'marketplace_fee' => round($marketplaceFee, 2),
            'withholding_tax_rate' => $this->withholdingTaxRate,
            'withholding_tax' => round($withholdingTax, 2),
            'shipping_cost_share' => round($shippingCostShare, 2),
            'total_fees' => round($totalFees, 2),
            'net_seller_amount' => round($netSellerAmount, 2),
        ];
    }

    /**
     * Mevcut sipariş kalemine kesintileri uygula
     */
    public function applyFeesToOrderItem(OrderItem $orderItem, float $shippingCostShare = 0): void
    {
        $fees = $this->calculateFees(
            (float) $orderItem->total_price,
            (float) $orderItem->commission_rate,
            $shippingCostShare
        );

        $orderItem->update([
            'commission_amount' => $fees['commission_amount'],
            'marketplace_fee' => $fees['marketplace_fee'],
            'withholding_tax' => $fees['withholding_tax'],
            'shipping_cost_share' => $fees['shipping_cost_share'],
            'net_seller_amount' => $fees['net_seller_amount'],
            'seller_payout_amount' => $fees['net_seller_amount'], // Uyumluluk için
        ]);
    }

    /**
     * Siparişteki tüm kalemlere kesintileri uygula
     */
    public function applyFeesToOrder($order): array
    {
        $totalCommission = 0;
        $totalMarketplaceFee = 0;
        $totalWithholdingTax = 0;
        $totalShippingShare = 0;
        $totalNetSeller = 0;

        // Kargo payını satıcılara dağıt
        $shippingCost = (float) ($order->shipping_cost ?? 0);
        $itemCount = $order->items->count();
        $shippingPerItem = $itemCount > 0 ? $shippingCost / $itemCount : 0;

        foreach ($order->items as $item) {
            $this->applyFeesToOrderItem($item, $shippingPerItem);
            $item->refresh();

            $totalCommission += $item->commission_amount;
            $totalMarketplaceFee += $item->marketplace_fee;
            $totalWithholdingTax += $item->withholding_tax;
            $totalShippingShare += $item->shipping_cost_share;
            $totalNetSeller += $item->net_seller_amount;
        }

        return [
            'total_commission' => round($totalCommission, 2),
            'total_marketplace_fee' => round($totalMarketplaceFee, 2),
            'total_withholding_tax' => round($totalWithholdingTax, 2),
            'total_shipping_share' => round($totalShippingShare, 2),
            'total_net_seller' => round($totalNetSeller, 2),
            'platform_revenue' => round($totalCommission + $totalMarketplaceFee, 2),
        ];
    }

    /**
     * Kesinti özetini formatla (görüntüleme için)
     */
    public function formatFeeBreakdown(OrderItem $orderItem): array
    {
        return [
            [
                'label' => 'Ürün Toplamı',
                'value' => $orderItem->total_price,
                'formatted' => '₺' . number_format((float) $orderItem->total_price, 2, ',', '.'),
                'type' => 'subtotal',
            ],
            [
                'label' => 'Kategori Komisyonu (%' . $orderItem->commission_rate . ')',
                'value' => -$orderItem->commission_amount,
                'formatted' => '-₺' . number_format((float) $orderItem->commission_amount, 2, ',', '.'),
                'type' => 'deduction',
            ],
            [
                'label' => 'Hizmet Bedeli (%' . $this->marketplaceFeeRate . ')',
                'value' => -$orderItem->marketplace_fee,
                'formatted' => '-₺' . number_format((float) $orderItem->marketplace_fee, 2, ',', '.'),
                'type' => 'deduction',
            ],
            [
                'label' => 'Stopaj (%' . $this->withholdingTaxRate . ')',
                'value' => -$orderItem->withholding_tax,
                'formatted' => '-₺' . number_format((float) $orderItem->withholding_tax, 2, ',', '.'),
                'type' => 'deduction',
            ],
            [
                'label' => 'Kargo Payı',
                'value' => -$orderItem->shipping_cost_share,
                'formatted' => '-₺' . number_format((float) $orderItem->shipping_cost_share, 2, ',', '.'),
                'type' => 'deduction',
                'visible' => $orderItem->shipping_cost_share > 0,
            ],
            [
                'label' => 'Net Hakediş',
                'value' => $orderItem->net_seller_amount,
                'formatted' => '₺' . number_format((float) $orderItem->net_seller_amount, 2, ',', '.'),
                'type' => 'total',
            ],
        ];
    }

    /**
     * Satıcı bazlı kesinti özeti
     */
    public function getSellerFeesSummary($order, int $sellerId): array
    {
        $items = $order->items->where('seller_id', $sellerId);

        $totalSales = $items->sum('total_price');
        $totalCommission = $items->sum('commission_amount');
        $totalMarketplaceFee = $items->sum('marketplace_fee');
        $totalWithholdingTax = $items->sum('withholding_tax');
        $totalShippingShare = $items->sum('shipping_cost_share');
        $totalNetAmount = $items->sum('net_seller_amount');

        return [
            'seller_id' => $sellerId,
            'total_sales' => round($totalSales, 2),
            'deductions' => [
                'commission' => round($totalCommission, 2),
                'marketplace_fee' => round($totalMarketplaceFee, 2),
                'withholding_tax' => round($totalWithholdingTax, 2),
                'shipping_share' => round($totalShippingShare, 2),
            ],
            'total_deductions' => round($totalCommission + $totalMarketplaceFee + $totalWithholdingTax + $totalShippingShare, 2),
            'net_amount' => round($totalNetAmount, 2),
        ];
    }

    /**
     * Oranları getir
     */
    public function getRates(): array
    {
        return [
            'marketplace_fee_rate' => $this->marketplaceFeeRate,
            'withholding_tax_rate' => $this->withholdingTaxRate,
            'commission_enabled' => $this->commissionEnabled,
        ];
    }
}
