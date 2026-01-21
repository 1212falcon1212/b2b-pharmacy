<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GlnWhitelist extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'gln_whitelist';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'gln_code',
        'pharmacy_name',
        'city',
        'district',
        'address',
        'is_active',
        'is_used',
        'used_by_user_id',
        'used_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_used' => 'boolean',
            'used_at' => 'datetime',
        ];
    }

    /**
     * Get the user who used this GLN
     */
    public function usedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by_user_id');
    }

    /**
     * Scope for active GLN codes only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for unused GLN codes only
     */
    public function scopeUnused($query)
    {
        return $query->where('is_used', false);
    }

    /**
     * Scope for available GLN codes (active and unused)
     */
    public function scopeAvailable($query)
    {
        return $query->active()->unused();
    }

    /**
     * Find a GLN code in the whitelist (active only)
     */
    public static function findByGln(string $glnCode): ?self
    {
        return static::where('gln_code', $glnCode)->active()->first();
    }

    /**
     * Find an available GLN code (active and unused)
     */
    public static function findAvailableGln(string $glnCode): ?self
    {
        return static::where('gln_code', $glnCode)->available()->first();
    }

    /**
     * Check if a GLN code exists and is active
     */
    public static function isValid(string $glnCode): bool
    {
        return static::where('gln_code', $glnCode)->active()->exists();
    }

    /**
     * Check if a GLN code is available (active and unused)
     */
    public static function isAvailable(string $glnCode): bool
    {
        return static::where('gln_code', $glnCode)->available()->exists();
    }

    /**
     * Check if a GLN code has already been used
     */
    public static function isAlreadyUsed(string $glnCode): bool
    {
        return static::where('gln_code', $glnCode)->where('is_used', true)->exists();
    }

    /**
     * Mark GLN as used by a user
     */
    public function markAsUsed(int $userId): bool
    {
        return $this->update([
            'is_used' => true,
            'used_by_user_id' => $userId,
            'used_at' => now(),
        ]);
    }

    /**
     * Release GLN (mark as unused)
     */
    public function release(): bool
    {
        return $this->update([
            'is_used' => false,
            'used_by_user_id' => null,
            'used_at' => null,
        ]);
    }
}

