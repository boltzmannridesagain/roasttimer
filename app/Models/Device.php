<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * The users that have saved this device.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'device_user');
    }

    /**
     * Scope to get only default devices.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope to get only custom devices.
     */
    public function scopeCustom($query)
    {
        return $query->where('is_default', false);
    }
}
