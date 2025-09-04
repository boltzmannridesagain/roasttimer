<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FoodItemController extends Controller
{
    /**
     * Get all food items (default + user's custom items if authenticated).
     */
    public function index(): JsonResponse
    {
        $query = FoodItem::query();

        // If user is authenticated, include their custom items
        if (Auth::check()) {
            $query->where(function ($q) {
                $q->where('is_default', true)
                  ->orWhere('user_id', Auth::id());
            });
        } else {
            // Guest users only see default items
            $query->where('is_default', true);
        }

        $foodItems = $query->orderBy('name')->get();

        return response()->json($foodItems);
    }

    /**
     * Store a new custom food item.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $foodItem = FoodItem::create([
            'name' => $request->name,
            'description' => $request->description,
            'is_default' => false,
            'user_id' => Auth::id(),
        ]);

        return response()->json($foodItem, 201);
    }

    /**
     * Update a custom food item.
     */
    public function update(Request $request, FoodItem $foodItem): JsonResponse
    {
        // Only allow updating custom items owned by the user
        if ($foodItem->is_default || $foodItem->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $foodItem->update($request->only(['name', 'description']));

        return response()->json($foodItem);
    }

    /**
     * Delete a custom food item.
     */
    public function destroy(FoodItem $foodItem): JsonResponse
    {
        // Only allow deleting custom items owned by the user
        if ($foodItem->is_default || $foodItem->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $foodItem->delete();

        return response()->json(['message' => 'Food item deleted successfully']);
    }

    /**
     * Save a food item to user's favorites.
     */
    public function save(FoodItem $foodItem): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Authentication required'], 401);
        }

        Auth::user()->savedFoodItems()->syncWithoutDetaching([$foodItem->id]);

        return response()->json(['message' => 'Food item saved successfully']);
    }

    /**
     * Remove a food item from user's favorites.
     */
    public function unsave(FoodItem $foodItem): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Authentication required'], 401);
        }

        Auth::user()->savedFoodItems()->detach($foodItem->id);

        return response()->json(['message' => 'Food item removed from favorites']);
    }
}
