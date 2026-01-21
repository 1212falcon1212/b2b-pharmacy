<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'slug',
        'parent_id',
        'description',
        'commission_rate',
        'vat_rate',
        'withholding_tax_rate',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'commission_rate' => 'decimal:2',
            'vat_rate' => 'decimal:2',
            'withholding_tax_rate' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Get all products in this category
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Scope for active categories only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get commission rate as percentage (0-100)
     */
    public function getCommissionPercentageAttribute(): float
    {
        return (float) $this->commission_rate;
    }

    /**
     * Get commission rate as decimal (0-1)
     */
    public function getCommissionDecimalAttribute(): float
    {
        return (float) $this->commission_rate / 100;
    }

    /**
     * Get VAT rate as decimal (0-1)
     */
    public function getVatDecimalAttribute(): float
    {
        return (float) ($this->vat_rate ?? 20) / 100;
    }

    /**
     * Get withholding tax rate as decimal (0-1)
     */
    public function getWithholdingDecimalAttribute(): float
    {
        return (float) ($this->withholding_tax_rate ?? 0) / 100;
    }

    /**
     * Get the parent category
     */
    public function parent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Get the child categories
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
}
