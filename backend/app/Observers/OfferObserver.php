<?php

namespace App\Observers;

use App\Jobs\NotifyPriceDropJob;
use App\Models\Offer;

class OfferObserver
{
    /**
     * Handle the Offer "updated" event.
     */
    public function updated(Offer $offer): void
    {
        // Check if price decreased
        if ($offer->isDirty('price') && $offer->price < $offer->getOriginal('price')) {
            NotifyPriceDropJob::dispatch($offer);
        }
    }
}
