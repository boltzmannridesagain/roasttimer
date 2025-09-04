<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserMeal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'serve_time',
        'number_of_people',
        'plan_data',
    ];

    protected $casts = [
        'serve_time' => 'datetime',
        'number_of_people' => 'integer',
        'plan_data' => 'array',
    ];

    /**
     * The user that owns the meal.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The food items in this meal.
     */
    public function foodItems(): BelongsToMany
    {
        return $this->belongsToMany(FoodItem::class, 'meal_food_items')
            ->withPivot('cooking_phases')
            ->withTimestamps();
    }

    /**
     * The meal food items pivot records.
     */
    public function mealFoodItems(): HasMany
    {
        return $this->hasMany(MealFoodItem::class);
    }

    /**
     * Scope to get meals for a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get guest meals (no user).
     */
    public function scopeGuest($query)
    {
        return $query->whereNull('user_id');
    }
}
