<?php

use App\Http\Controllers\Api\FoodItemController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\CookingPhaseController;
use App\Http\Controllers\Api\MealPlanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Public routes (available to both guests and authenticated users)
Route::prefix('roast-timer')->group(function () {
    // Food items
    Route::get('/food-items', [FoodItemController::class, 'index']);
    
    // Devices
    Route::get('/devices', [DeviceController::class, 'index']);
    
    // Cooking phases
    Route::get('/cooking-phases', [CookingPhaseController::class, 'index']);
    
    // Meal plan generation (available to guests)
    Route::post('/generate-plan', [MealPlanController::class, 'generate']);
});

// Authenticated routes
Route::middleware('auth:sanctum')->prefix('roast-timer')->group(function () {
    // Food items
    Route::post('/food-items', [FoodItemController::class, 'store']);
    Route::put('/food-items/{foodItem}', [FoodItemController::class, 'update']);
    Route::delete('/food-items/{foodItem}', [FoodItemController::class, 'destroy']);
    Route::post('/food-items/{foodItem}/save', [FoodItemController::class, 'save']);
    Route::delete('/food-items/{foodItem}/save', [FoodItemController::class, 'unsave']);
    
    // Devices
    Route::post('/devices', [DeviceController::class, 'store']);
    Route::put('/devices/{device}', [DeviceController::class, 'update']);
    Route::delete('/devices/{device}', [DeviceController::class, 'destroy']);
    Route::post('/devices/{device}/save', [DeviceController::class, 'save']);
    Route::delete('/devices/{device}/save', [DeviceController::class, 'unsave']);
    
    // Cooking phases
    Route::post('/cooking-phases', [CookingPhaseController::class, 'store']);
    Route::put('/cooking-phases/{cookingPhase}', [CookingPhaseController::class, 'update']);
    Route::delete('/cooking-phases/{cookingPhase}', [CookingPhaseController::class, 'destroy']);
    Route::post('/cooking-phases/{cookingPhase}/save', [CookingPhaseController::class, 'save']);
    Route::delete('/cooking-phases/{cookingPhase}/save', [CookingPhaseController::class, 'unsave']);
    
    // Meal plans
    Route::get('/meals', [MealPlanController::class, 'index']);
    Route::get('/meals/{userMeal}', [MealPlanController::class, 'show']);
    Route::delete('/meals/{userMeal}', [MealPlanController::class, 'destroy']);
});
