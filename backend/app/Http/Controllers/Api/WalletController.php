<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use App\Models\SellerBankAccount;
use App\Services\PayoutService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    protected WalletService $walletService;
    protected PayoutService $payoutService;

    public function __construct(WalletService $walletService, PayoutService $payoutService)
    {
        $this->walletService = $walletService;
        $this->payoutService = $payoutService;
    }

    /**
     * Get wallet summary
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $summary = $this->walletService->getWalletSummary($user);

        return response()->json([
            'wallet' => $summary,
        ]);
    }

    /**
     * Get wallet transactions
     */
    public function transactions(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $request->input('limit', 20);

        $transactions = $this->walletService->getTransactions($user, $limit);

        return response()->json([
            'transactions' => $transactions,
        ]);
    }

    /**
     * Get bank accounts
     */
    public function bankAccounts(Request $request): JsonResponse
    {
        $accounts = SellerBankAccount::where('seller_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->get();

        return response()->json([
            'bank_accounts' => $accounts,
        ]);
    }

    /**
     * Add bank account
     */
    public function addBankAccount(Request $request): JsonResponse
    {
        $request->validate([
            'bank_name' => 'required|string|max:100',
            'iban' => 'required|string|min:26|max:34',
            'account_holder' => 'required|string|max:255',
            'swift_code' => 'nullable|string|max:11',
        ]);

        // Clean IBAN
        $iban = strtoupper(preg_replace('/\s+/', '', $request->iban));

        // Check if IBAN already exists
        $exists = SellerBankAccount::where('seller_id', $request->user()->id)
            ->where('iban', $iban)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'error' => 'Bu IBAN zaten kayıtlı.',
            ], 400);
        }

        $account = SellerBankAccount::create([
            'seller_id' => $request->user()->id,
            'bank_name' => $request->bank_name,
            'iban' => $iban,
            'account_holder' => $request->account_holder,
            'swift_code' => $request->swift_code,
            'is_default' => SellerBankAccount::where('seller_id', $request->user()->id)->count() === 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Banka hesabı eklendi.',
            'bank_account' => $account,
        ]);
    }

    /**
     * Delete bank account
     */
    public function deleteBankAccount(SellerBankAccount $bankAccount, Request $request): JsonResponse
    {
        if ($bankAccount->seller_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Bu hesabı silme yetkiniz yok.',
            ], 403);
        }

        // Check if there are pending payouts with this account
        $hasPendingPayouts = PayoutRequest::where('bank_account_id', $bankAccount->id)
            ->whereIn('status', ['pending', 'approved', 'processing'])
            ->exists();

        if ($hasPendingPayouts) {
            return response()->json([
                'success' => false,
                'error' => 'Bu hesapla bekleyen ödeme taleplerini bulunuyor.',
            ], 400);
        }

        $bankAccount->delete();

        return response()->json([
            'success' => true,
            'message' => 'Banka hesabı silindi.',
        ]);
    }

    /**
     * Set default bank account
     */
    public function setDefaultBankAccount(SellerBankAccount $bankAccount, Request $request): JsonResponse
    {
        if ($bankAccount->seller_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Bu hesabı düzenleme yetkiniz yok.',
            ], 403);
        }

        $bankAccount->makeDefault();

        return response()->json([
            'success' => true,
            'message' => 'Varsayılan hesap güncellendi.',
        ]);
    }

    /**
     * Get payout requests
     */
    public function payoutRequests(Request $request): JsonResponse
    {
        $requests = $this->payoutService->getSellerRequests($request->user());

        return response()->json([
            'payout_requests' => $requests,
        ]);
    }

    /**
     * Create payout request
     */
    public function createPayoutRequest(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'bank_account_id' => 'required|exists:seller_bank_accounts,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $bankAccount = SellerBankAccount::find($request->bank_account_id);

        if ($bankAccount->seller_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Geçersiz banka hesabı.',
            ], 400);
        }

        $result = $this->payoutService->createRequest(
            $request->user(),
            $request->amount,
            $bankAccount,
            $request->notes
        );

        if (is_array($result) && isset($result['error'])) {
            return response()->json([
                'success' => false,
                'error' => $result['error'],
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ödeme talebi oluşturuldu.',
            'payout_request' => $result,
        ]);
    }
}
