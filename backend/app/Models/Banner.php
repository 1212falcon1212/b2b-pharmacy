<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subtitle',
        'image_path',
        'link_url',
        'button_text',
        'location',
        'sort_order',
        'is_active',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    public function scopeLocation($query, string $location)
    {
        return $query->where('location', $location);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }

    // Helper to get full image URL
    public function getImageUrlAttribute(): string
    {
        if (str_starts_with($this->image_path, 'http')) {
            return $this->image_path;
        }
        return asset('storage/' . $this->image_path);
    }

    /**
     * Banner lokasyon secenekleri
     */
    public static function locationOptions(): array
    {
        return [
            'home_hero' => 'Ana Sayfa Hero (Ana Banner)',
            'home_middle' => 'Ana Sayfa Orta',
            'home_brand' => 'Ana Sayfa Marka Bolumu',
            'home_grid' => 'Ana Sayfa 2x2 Grid',
            'home_bottom' => 'Ana Sayfa Alt',
            'sidebar' => 'Sidebar',
            'category_top' => 'Kategori Sayfasi Ust',
        ];
    }
}
