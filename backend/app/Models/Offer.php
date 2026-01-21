<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Offer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'product_id',
        'seller_id',
        'price',
        'stock',
        'expiry_date',
        'batch_number',
        'status',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'expiry_date' => 'date',
            'stock' => 'integer',
        ];
    }

    /**
     * Get the product for this offer
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the seller (user) for this offer
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Scope for active offers only
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for offers with stock
     */
    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * Scope for non-expired offers
     */
    public function scopeNotExpired($query)
    {
        return $query->where('expiry_date', '>', now());
    }

    /**
     * Scope for ordering by price (low to high)
     */
    public function scopeOrderByPriceAsc($query)
    {
        return $query->orderBy('price', 'asc');
    }

    /**
     * Check if offer is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }

    /**
     * Check if offer has stock
     */
    public function hasStock(): bool
    {
        return $this->stock > 0;
    }

    /**
     * Check if offer is available (active, in stock, not expired)
     */
    public function isAvailable(): bool
    {
        return $this->status === 'active' && $this->hasStock() && !$this->isExpired();
    }

    /**
     * Decrease stock by given amount
     */
    public function decreaseStock(int $amount): bool
    {
        if ($this->stock < $amount) {
            return false;
        }

        $this->stock -= $amount;

        if ($this->stock === 0) {
            $this->status = 'sold_out';
        }

        return $this->save();
    }
}

