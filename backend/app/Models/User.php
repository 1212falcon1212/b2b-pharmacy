<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser, HasName
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'email',
        'password',
        'gln_code',
        'pharmacy_name',
        'phone',
        'address',
        'city',
        'role',
        'is_verified',
        'verified_at',
        'verification_status',
        'rejection_reason',
        'documents',
        'approved_at',
        'approved_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'verified_at' => 'datetime',
            'approved_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'documents' => 'array',
        ];
    }

    /**
     * Verification status labels in Turkish
     */
    public const VERIFICATION_STATUS_LABELS = [
        'pending' => 'Onay Bekliyor',
        'approved' => 'Onaylandı',
        'rejected' => 'Reddedildi',
    ];

    /**
     * Get the name for Filament panel
     */
    public function getFilamentName(): string
    {
        return $this->pharmacy_name ?? $this->email;
    }

    /**
     * Check if user can access Filament panel
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'super-admin';
    }

    /**
     * Check if user is a super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super-admin';
    }

    /**
     * Check if user is a pharmacist
     */
    public function isPharmacist(): bool
    {
        return $this->role === 'pharmacist';
    }

    /**
     * Check if user is approved
     */
    public function isApproved(): bool
    {
        return $this->verification_status === 'approved';
    }

    /**
     * Check if user is pending approval
     */
    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    /**
     * Get all offers by this user (seller)
     */
    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class, 'seller_id');
    }

    /**
     * Get only active offers
     */
    public function activeOffers(): HasMany
    {
        return $this->offers()->where('status', 'active');
    }

    /**
     * Get user's wallet
     */
    public function wallet(): HasOne
    {
        return $this->hasOne(SellerWallet::class, 'seller_id');
    }

    /**
     * Get user's orders as buyer
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get order items where user is seller
     */
    public function sellerOrderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'seller_id');
    }

    /**
     * Get verification status label
     */
    public function getVerificationStatusLabelAttribute(): string
    {
        return self::VERIFICATION_STATUS_LABELS[$this->verification_status] ?? $this->verification_status;
    }

    /**
     * Approve this user
     */
    public function approve(int $approvedBy): void
    {
        $this->update([
            'verification_status' => 'approved',
            'is_verified' => true,
            'verified_at' => now(),
            'approved_at' => now(),
            'approved_by' => $approvedBy,
            'rejection_reason' => null,
        ]);
    }

    /**
     * Reject this user
     */
    public function reject(string $reason, int $rejectedBy): void
    {
        $this->update([
            'verification_status' => 'rejected',
            'is_verified' => false,
            'rejection_reason' => $reason,
            'approved_by' => $rejectedBy,
        ]);
    }

    /**
     * Scope for pending users
     */
    public function scopePending($query)
    {
        return $query->where('verification_status', 'pending');
    }

    /**
     * Scope for pharmacists only
     */
    public function scopePharmacists($query)
    {
        return $query->where('role', 'pharmacist');
    }

    /**
     * Get seller documents
     */
    public function sellerDocuments(): HasMany
    {
        return $this->hasMany(SellerDocument::class);
    }

    /**
     * Alias for sellerDocuments
     */
    public function documents(): HasMany
    {
        return $this->sellerDocuments();
    }

    /**
     * Check if user has all required documents uploaded
     */
    public function hasRequiredDocuments(): bool
    {
        $requiredTypes = SellerDocument::REQUIRED_TYPES;
        $uploadedTypes = $this->sellerDocuments()->pluck('type')->toArray();

        return count(array_intersect($uploadedTypes, $requiredTypes)) === count($requiredTypes);
    }

    /**
     * Check if all required documents are approved
     */
    public function getDocumentsApprovedAttribute(): bool
    {
        $requiredTypes = SellerDocument::REQUIRED_TYPES;
        $approvedTypes = $this->sellerDocuments()
            ->where('status', 'approved')
            ->pluck('type')
            ->toArray();

        return count(array_intersect($approvedTypes, $requiredTypes)) === count($requiredTypes);
    }

    /**
     * Check if user can access the platform (documents approved or is super-admin)
     */
    public function canAccessPlatform(): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->documents_approved;
    }

    /**
     * Get user's ERP integrations
     */
    public function integrations(): HasMany
    {
        return $this->hasMany(UserIntegration::class);
    }
}
