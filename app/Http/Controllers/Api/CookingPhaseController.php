<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CookingPhase;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CookingPhaseController extends Controller
{
    /**
     * Get all cooking phases (default + user's custom phases if authenticated).
     */
    public function index(): JsonResponse
    {
        $query = CookingPhase::query();

        // If user is authenticated, include their custom phases
        if (Auth::check()) {
            $query->where(function ($q) {
                $q->where('is_default', true)
                  ->orWhere('user_id', Auth::id());
            });
        } else {
            // Guest users only see default phases
            $query->where('is_default', true);
        }

        $cookingPhases = $query->orderBy('name')->get();

        return response()->json($cookingPhases);
    }

    /**
     * Store a new custom cooking phase.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $cookingPhase = CookingPhase::create([
            'name' => $request->name,
            'description' => $request->description,
            'is_default' => false,
            'user_id' => Auth::id(),
        ]);

        return response()->json($cookingPhase, 201);
    }

    /**
     * Update a custom cooking phase.
     */
    public function update(Request $request, CookingPhase $cookingPhase): JsonResponse
    {
        // Only allow updating custom phases owned by the user
        if ($cookingPhase->is_default || $cookingPhase->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $cookingPhase->update($request->only(['name', 'description']));

        return response()->json($cookingPhase);
    }

    /**
     * Delete a custom cooking phase.
     */
    public function destroy(CookingPhase $cookingPhase): JsonResponse
    {
        // Only allow deleting custom phases owned by the user
        if ($cookingPhase->is_default || $cookingPhase->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cookingPhase->delete();

        return response()->json(['message' => 'Cooking phase deleted successfully']);
    }

    /**
     * Save a cooking phase to user's favorites.
     */
    public function save(CookingPhase $cookingPhase): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Authentication required'], 401);
        }

        Auth::user()->savedCookingPhases()->syncWithoutDetaching([$cookingPhase->id]);

        return response()->json(['message' => 'Cooking phase saved successfully']);
    }

    /**
     * Remove a cooking phase from user's favorites.
     */
    public function unsave(CookingPhase $cookingPhase): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Authentication required'], 401);
        }

        Auth::user()->savedCookingPhases()->detach($cookingPhase->id);

        return response()->json(['message' => 'Cooking phase removed from favorites']);
    }
}
