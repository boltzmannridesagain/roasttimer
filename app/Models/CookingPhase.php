<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CookingPhase extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_default',
        'device_required',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'device_required' => 'boolean',
    ];

    /**
     * The users that have saved this cooking phase.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'cooking_phase_user');
    }

    /**
     * Scope to get only default cooking phases.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope to get only custom cooking phases.
     */
    public function scopeCustom($query)
    {
        return $query->where('is_default', false);
    }
}
