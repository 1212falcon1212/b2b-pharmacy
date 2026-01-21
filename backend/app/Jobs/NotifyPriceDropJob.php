<?php

namespace App\Jobs;

use App\Models\Offer;
use App\Models\Wishlist;
use App\Services\Notification\Sms\NetgsmProvider;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NotifyPriceDropJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Offer $offer)
    {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Price drop detected for offer', ['offer_id' => $this->offer->id, 'new_price' => $this->offer->price]);

        $wishlists = Wishlist::where('product_id', $this->offer->product_id)
            ->with(['user'])
            ->get();

        foreach ($wishlists as $wishlist) {
            // Check if target price condition is met (if set)
            if ($wishlist->target_price && $this->offer->price > $wishlist->target_price) {
                continue;
            }

            Log::info('Notifying user about price drop', [
                'user_id' => $wishlist->user_id,
                'product_id' => $wishlist->product_id
            ]);

            // TODO: Use NotificationService properly here
            // $smsService = new NetgsmProvider();
            // $smsService->send($wishlist->user->phone, "Takip ettiginiz urunde fiyat dustu: {$this->offer->price} TL");
        }
    }
}
