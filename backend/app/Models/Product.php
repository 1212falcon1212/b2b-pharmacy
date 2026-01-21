<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

class Product extends Model
{
    use HasFactory, Searchable, SoftDeletes;

    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'barcode' => $this->barcode,
            'brand' => $this->brand,
            'manufacturer' => $this->manufacturer,
            'category' => $this->category ? $this->category->name : null,
            'is_active' => (bool) $this->is_active,
        ];
    }

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'barcode',
        'name',
        'brand',
        'manufacturer',
        'description',
        'desi',
        'weight',
        'width',
        'height',
        'depth',
        'image',
        'category_id',
        'is_active',
        'approval_status',
        'source',
        'created_by_id',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the category for this product
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all offers for this product
     */
    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    /**
     * Get only active offers
     */
    public function activeOffers(): HasMany
    {
        return $this->offers()->where('status', 'active')->orderBy('price', 'asc');
    }

    /**
     * Get all order items for this product (for best sellers calculation)
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the lowest price offer
     */
    public function lowestPriceOffer()
    {
        return $this->activeOffers()->first();
    }

    /**
     * Get the lowest price
     */
    public function getLowestPriceAttribute(): ?float
    {
        return $this->activeOffers()->min('price');
    }

    /**
     * Get the total available stock
     */
    public function getTotalStockAttribute(): int
    {
        return $this->activeOffers()->sum('stock');
    }

    /**
     * Get commission rate from category (default 0 if no category)
     */
    public function getCommissionRateAttribute(): float
    {
        return $this->category ? (float) $this->category->commission_rate : 0;
    }

    /**
     * Scope for active products only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for searching by name or barcode
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('barcode', 'like', "%{$term}%")
                ->orWhere('brand', 'like', "%{$term}%");
        });
    }
}

