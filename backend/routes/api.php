<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\IntegrationController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\LabelController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\NotificationSettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| B2B Pharmacy API Routes
| All routes are prefixed with /api
|
*/

// Public routes with auth rate limiting
Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-gln', [AuthController::class, 'verifyGln']);
});

// Payment callbacks (must be public for gateway callbacks)
Route::post('/payments/callback/{gateway}', [PaymentController::class, 'callback'])
    ->middleware('throttle:payment-callbacks');

// Protected routes (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/user', [AuthController::class, 'user']);
    });

    // Document routes
    Route::prefix('documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index']);
        Route::post('/upload', [DocumentController::class, 'upload'])->middleware('throttle:uploads');
        Route::delete('/{document}', [DocumentController::class, 'destroy']);
        Route::get('/status', [DocumentController::class, 'status']);
    });

    // Category routes
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::get('/{category}', [CategoryController::class, 'show']);
    });

    // Product routes
    Route::prefix('products')->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::get('/search', [ProductController::class, 'search']);
        Route::get('/{product}', [ProductController::class, 'show']);
        Route::get('/{product}/offers', [ProductController::class, 'offers']);
    });

    // Offer routes (for sellers)
    Route::prefix('offers')->group(function () {
        Route::get('/', [OfferController::class, 'index']);
        Route::post('/', [OfferController::class, 'store']);
        Route::get('/{offer}', [OfferController::class, 'show']);
        Route::put('/{offer}', [OfferController::class, 'update']);
        Route::delete('/{offer}', [OfferController::class, 'destroy']);
    });

    // My offers (seller's own offers)
    Route::get('/my-offers', [OfferController::class, 'myOffers']);

    // Cart routes
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/items', [CartController::class, 'addItem']);
        Route::put('/items/{item}', [CartController::class, 'updateItem']);
        Route::delete('/items/{item}', [CartController::class, 'removeItem']);
        Route::post('/validate', [CartController::class, 'validate']);
        Route::delete('/', [CartController::class, 'clear']);
    });

    // Address routes
    Route::apiResource('user/addresses', \App\Http\Controllers\Api\UserAddressController::class);

    // Order routes
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/seller', [OrderController::class, 'sellerOrders']);
        Route::post('/', [OrderController::class, 'store'])->middleware('throttle:orders');
        Route::get('/{order}', [OrderController::class, 'show']);
        Route::put('/{order}/status', [OrderController::class, 'updateStatus']);
        Route::put('/{order}/cancel', [OrderController::class, 'cancel']);
    });

    // Payment routes
    Route::prefix('payments')->group(function () {
        Route::get('/config', [PaymentController::class, 'config']);
        Route::post('/initialize', [PaymentController::class, 'initialize']);
        Route::get('/{order}/checkout', [PaymentController::class, 'checkout']);
        Route::post('/{order}/refund', [PaymentController::class, 'refund']);
    });

    // Wallet routes
    Route::prefix('wallet')->group(function () {
        Route::get('/', [WalletController::class, 'index']);
        Route::get('/transactions', [WalletController::class, 'transactions']);
        Route::get('/bank-accounts', [WalletController::class, 'bankAccounts']);
        Route::post('/bank-accounts', [WalletController::class, 'addBankAccount']);
        Route::delete('/bank-accounts/{bankAccount}', [WalletController::class, 'deleteBankAccount']);
        Route::post('/bank-accounts/{bankAccount}/default', [WalletController::class, 'setDefaultBankAccount']);
        Route::get('/payout-requests', [WalletController::class, 'payoutRequests']);
        Route::post('/payout-requests', [WalletController::class, 'createPayoutRequest'])
            ->middleware('throttle:payout-requests');
    });

    // Shipping routes
    Route::prefix('shipping')->group(function () {
        Route::get('/config', [ShippingController::class, 'config']);
        Route::post('/calculate', [ShippingController::class, 'calculate']);
        Route::post('/options', [ShippingController::class, 'getOptions']);
        Route::post('/orders/{order}/shipment', [ShippingController::class, 'createShipment']);
        Route::get('/orders/{order}/track', [ShippingController::class, 'track']);
        Route::post('/orders/{order}/test-label', [ShippingController::class, 'generateTestLabel']);
        Route::get('/orders/{order}/label', [ShippingController::class, 'downloadLabel']);
    });

    // Label routes
    Route::prefix('labels')->group(function () {
        Route::get('/orders/{order}', [LabelController::class, 'generate']);
        Route::post('/orders/{order}/shipment', [LabelController::class, 'createShipment']);
        Route::get('/orders/{order}/track', [LabelController::class, 'track']);
    });

    // Settings routes
    Route::prefix('settings')->group(function () {
        // ERP Integrations (Updated URI to match Frontend)
        Route::prefix('integrations')->group(function () {
            Route::get('/', [IntegrationController::class, 'index']);
            Route::post('/', [IntegrationController::class, 'store']);
            Route::post('/{integration}/sync', [IntegrationController::class, 'sync']);
            Route::delete('/{integration}', [IntegrationController::class, 'destroy']);
        });

        // Notification Settings
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationSettingController::class, 'index']);
            Route::post('/', [NotificationSettingController::class, 'update']);
        });
    });

    // Wishlist routes
    Route::prefix('wishlist')->group(function () {
        Route::get('/', [WishlistController::class, 'index']);
        Route::post('/toggle', [WishlistController::class, 'toggle']);
    });

    // Seller Dashboard routes
    Route::prefix('seller')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\SellerController::class, 'stats']);
        Route::get('/recent-orders', [\App\Http\Controllers\Api\SellerController::class, 'recentOrders']);
        Route::get('/products', [\App\Http\Controllers\Api\SellerController::class, 'products']);
        Route::get('/orders', [\App\Http\Controllers\Api\SellerController::class, 'orders']);
        Route::get('/orders/{order}', [\App\Http\Controllers\Api\SellerController::class, 'orderDetail']);
    });

    // Invoice routes
    Route::prefix('invoices')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\InvoiceController::class, 'index']);
        Route::get('/commission-summary', [\App\Http\Controllers\Api\InvoiceController::class, 'commissionSummary']);
        Route::get('/{invoice}', [\App\Http\Controllers\Api\InvoiceController::class, 'show']);
        Route::post('/orders/{order}', [\App\Http\Controllers\Api\InvoiceController::class, 'createForOrder']);
        Route::post('/{invoice}/sync-erp', [\App\Http\Controllers\Api\InvoiceController::class, 'syncToErp']);
    });

    // Legal & Compliance Routes
    Route::prefix('legal')->group(function () {
        Route::post('/approve', [\App\Http\Controllers\Api\LegalController::class, 'approveContract']);
        Route::get('/contract/b2b', [\App\Http\Controllers\Api\LegalController::class, 'generateB2BContract']);
    });
});

// Public Legal Routes
Route::get('/legal/items/{slug}', [\App\Http\Controllers\Api\LegalController::class, 'getDocument']);

// CMS Routes (Public for frontend consumption)
Route::prefix('cms')->group(function () {
    Route::get('/layout', [\App\Http\Controllers\Api\CmsController::class, 'layout']);
    Route::get('/homepage', [\App\Http\Controllers\Api\CmsController::class, 'homepage']);
    Route::get('/banners/{location}', [\App\Http\Controllers\Api\CmsController::class, 'banners']);
});

// Brand Routes (Public for frontend consumption)
Route::prefix('brands')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\BrandController::class, 'index']);
    Route::get('/featured', [\App\Http\Controllers\Api\BrandController::class, 'featured']);
    Route::get('/{slug}', [\App\Http\Controllers\Api\BrandController::class, 'show']);
});

// Health Check
Route::get('/health', [\App\Http\Controllers\Api\HealthCheckController::class, 'index']);

// Webhook routes with signature verification
Route::post('/webhooks/{provider}', [WebhookController::class, 'handle'])
    ->middleware(['webhook.verify', 'throttle:webhooks']);
