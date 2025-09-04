<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The meals created by the user.
     */
    public function userMeals(): HasMany
    {
        return $this->hasMany(UserMeal::class);
    }

    /**
     * The food items saved by the user.
     */
    public function savedFoodItems(): BelongsToMany
    {
        return $this->belongsToMany(FoodItem::class, 'food_item_user');
    }

    /**
     * The devices saved by the user.
     */
    public function savedDevices(): BelongsToMany
    {
        return $this->belongsToMany(Device::class, 'device_user');
    }

    /**
     * The cooking phases saved by the user.
     */
    public function savedCookingPhases(): BelongsToMany
    {
        return $this->belongsToMany(CookingPhase::class, 'cooking_phase_user');
    }
}
