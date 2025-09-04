<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MealFoodItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_meal_id',
        'food_item_id',
        'cooking_phases',
    ];

    protected $casts = [
        'cooking_phases' => 'array',
    ];

    /**
     * The user meal that owns this meal food item.
     */
    public function userMeal(): BelongsTo
    {
        return $this->belongsTo(UserMeal::class);
    }

    /**
     * The food item.
     */
    public function foodItem(): BelongsTo
    {
        return $this->belongsTo(FoodItem::class);
    }
}
