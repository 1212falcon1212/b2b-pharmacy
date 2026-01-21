<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserIntegration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'erp_type',
        'api_key',
        'api_secret',
        'app_id',
        'extra_params',
        'last_sync_at',
        'status',
        'error_message',
    ];

    protected $casts = [
        'api_key' => 'encrypted',
        'api_secret' => 'encrypted',
        'app_id' => 'encrypted',
        'extra_params' => 'array',
        'last_sync_at' => 'datetime',
    ];

    /**
     * Get the user that owns the integration.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
