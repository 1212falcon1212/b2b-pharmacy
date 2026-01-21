<?php

namespace App\Providers;

use App\Services\GLN\Contracts\GlnVerificationInterface;
use App\Services\GLN\ItsGlnService;
use App\Services\GLN\WhitelistGlnService;
use Illuminate\Support\ServiceProvider;

class GlnServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(GlnVerificationInterface::class, function ($app) {
            $driver = config('services.gln.driver', 'whitelist');

            return match ($driver) {
                'its' => new ItsGlnService(),
                default => new WhitelistGlnService(),
            };
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}

