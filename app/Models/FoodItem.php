<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FoodItem extends Model
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
     * The users that have saved this food item.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'food_item_user');
    }

    /**
     * The meals that include this food item.
     */
    public function userMeals(): BelongsToMany
    {
        return $this->belongsToMany(UserMeal::class, 'meal_food_items');
    }

    /**
     * Scope to get only default food items.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope to get only custom food items.
     */
    public function scopeCustom($query)
    {
        return $query->where('is_default', false);
    }
}
