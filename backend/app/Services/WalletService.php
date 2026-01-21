<?php

namespace App\Services;

use App\Models\Order;
use App\Models\SellerWallet;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletService
{
    /**
     * Get or create wallet for a seller
     */
    public function getWallet(User $seller): SellerWallet
    {
        return SellerWallet::getOrCreate($seller);
    }

    /**
     * Add earnings from a completed order item
     */
    public function addOrderEarnings(
        User $seller,
        Order $order,
        float $saleAmount,
        float $commission,
        ?float $shippingCost = null,
        ?int $orderItemId = null
    ): void {
        $wallet = $this->getWallet($seller);

        DB::transaction(function () use ($wallet, $order, $saleAmount, $commission, $shippingCost, $orderItemId) {
            // Add sale amount to pending balance
            $netAmount = $saleAmount - $commission - ($shippingCost ?? 0);

            $wallet->addPendingBalance($netAmount);
            $wallet->addCommission($commission);

            // Record sale transaction
            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => WalletTransaction::TYPE_SALE,
                'amount' => $saleAmount,
                'direction' => WalletTransaction::DIRECTION_CREDIT,
                'balance_type' => WalletTransaction::BALANCE_PENDING,
                'description' => "Sipariş #{$order->order_number} - Satış",
                'order_id' => $order->id,
                'order_item_id' => $orderItemId,
            ]);

            // Record commission deduction
            if ($commission > 0) {
                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => WalletTransaction::TYPE_COMMISSION,
                    'amount' => $commission,
                    'direction' => WalletTransaction::DIRECTION_DEBIT,
                    'balance_type' => WalletTransaction::BALANCE_PENDING,
                    'description' => "Sipariş #{$order->order_number} - Komisyon",
                    'order_id' => $order->id,
                    'order_item_id' => $orderItemId,
                ]);
            }

            // Record shipping cost if applicable
            if ($shippingCost && $shippingCost > 0) {
                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => WalletTransaction::TYPE_SHIPPING,
                    'amount' => $shippingCost,
                    'direction' => WalletTransaction::DIRECTION_DEBIT,
                    'balance_type' => WalletTransaction::BALANCE_PENDING,
                    'description' => "Sipariş #{$order->order_number} - Kargo",
                    'order_id' => $order->id,
                    'order_item_id' => $orderItemId,
                ]);
            }
        });

        Log::info("Wallet earnings added for seller {$seller->id}: sale={$saleAmount}, commission={$commission}");
    }

    /**
     * Release pending balance to available (after delivery confirmation)
     */
    public function releasePendingBalance(User $seller, Order $order): bool
    {
        $wallet = $this->getWallet($seller);

        // Calculate total net amount for this seller from the order
        $transactions = WalletTransaction::where('wallet_id', $wallet->id)
            ->where('order_id', $order->id)
            ->where('balance_type', WalletTransaction::BALANCE_PENDING)
            ->get();

        $netAmount = $transactions->reduce(function ($carry, $tx) {
            return $carry + $tx->signed_amount;
        }, 0);

        if ($netAmount <= 0) {
            return false;
        }

        DB::transaction(function () use ($wallet, $netAmount, $order) {
            $wallet->releasePendingToAvailable($netAmount);

            // Log the release
            Log::info("Released pending balance for wallet {$wallet->id}: {$netAmount} for order {$order->order_number}");
        });

        return true;
    }

    /**
     * Process withdrawal from wallet
     */
    public function processWithdrawal(User $seller, float $amount, string $description = 'Para çekme'): bool
    {
        $wallet = $this->getWallet($seller);

        if (!$wallet->canWithdraw($amount)) {
            return false;
        }

        DB::transaction(function () use ($wallet, $amount, $description) {
            $wallet->withdraw($amount);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => WalletTransaction::TYPE_WITHDRAWAL,
                'amount' => $amount,
                'direction' => WalletTransaction::DIRECTION_DEBIT,
                'balance_type' => WalletTransaction::BALANCE_AVAILABLE,
                'description' => $description,
            ]);
        });

        return true;
    }

    /**
     * Get wallet summary for a seller
     */
    public function getWalletSummary(User $seller): array
    {
        $wallet = $this->getWallet($seller);

        return [
            'balance' => $wallet->balance,
            'pending_balance' => $wallet->pending_balance,
            'total_balance' => $wallet->total_balance,
            'withdrawn_balance' => $wallet->withdrawn_balance,
            'total_earned' => $wallet->total_earned,
            'total_commission' => $wallet->total_commission,
        ];
    }

    /**
     * Get recent transactions
     */
    public function getTransactions(User $seller, int $limit = 20): object
    {
        $wallet = $this->getWallet($seller);

        return $wallet->transactions()->take($limit)->get();
    }
}
