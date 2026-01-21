<?php

namespace App\Providers;

use App\Models\Offer;
use App\Models\Order;
use App\Models\SellerDocument;
use App\Observers\OfferObserver;
use App\Policies\DocumentPolicy;
use App\Policies\OfferPolicy;
use App\Policies\OrderPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configurePolicies();
        $this->configureRateLimiting();
        Offer::observe(OfferObserver::class);
    }

    /**
     * Configure the authorization policies for the application.
     */
    protected function configurePolicies(): void
    {
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(Offer::class, OfferPolicy::class);
        Gate::policy(SellerDocument::class, DocumentPolicy::class);
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // Default API rate limit: 60 requests per minute
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Stricter limit for auth endpoints: 10 attempts per minute
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // File upload limit: 20 uploads per minute
        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        // Search/heavy operations: 30 per minute
        RateLimiter::for('search', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        // Payment callbacks: 30 per minute per IP (for payment gateway callbacks)
        RateLimiter::for('payment-callbacks', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        // Webhooks: 60 per minute per IP (for external service webhooks)
        RateLimiter::for('webhooks', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        // Payments: 30 per minute per user (payment operations)
        RateLimiter::for('payments', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        // Order creation: 10 per minute per user (prevent bulk order spam)
        RateLimiter::for('orders', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        // Payout requests: 5 per hour per user (financial operations)
        RateLimiter::for('payout-requests', function (Request $request) {
            return Limit::perHour(5)->by($request->user()?->id ?: $request->ip());
        });
    }
}
