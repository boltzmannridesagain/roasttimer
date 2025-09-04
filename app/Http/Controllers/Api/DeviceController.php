<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DeviceController extends Controller
{
    /**
     * Get all devices (default + user's custom devices if authenticated).
     */
    public function index(): JsonResponse
    {
        $query = Device::query();

        // If user is authenticated, include their custom devices
        if (Auth::check()) {
            $query->where(function ($q) {
                $q->where('is_default', true)
                  ->orWhere('user_id', Auth::id());
            });
        } else {
            // Guest users only see default devices
            $query->where('is_default', true);
        }

        $devices = $query->orderBy('name')->get();

        return response()->json($devices);
    }

    /**
     * Store a new custom device.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $device = Device::create([
            'name' => $request->name,
            'description' => $request->description,
            'is_default' => false,
            'user_id' => Auth::id(),
        ]);

        return response()->json($device, 201);
    }

    /**
     * Update a custom device.
     */
    public function update(Request $request, Device $device): JsonResponse
    {
        // Only allow updating custom devices owned by the user
        if ($device->is_default || $device->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $device->update($request->only(['name', 'description']));

        return response()->json($device);
    }

    /**
     * Delete a custom device.
     */
    public function destroy(Device $device): JsonResponse
    {
        // Only allow deleting custom devices owned by the user
        if ($device->is_default || $device->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $device->delete();

        return response()->json(['message' => 'Device deleted successfully']);
    }

    /**
     * Save a device to user's favorites.
     */
    public function save(Device $device): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Authentication required'], 401);
        }

        Auth::user()->savedDevices()->syncWithoutDetaching([$device->id]);

        return response()->json(['message' => 'Device saved successfully']);
    }

    /**
     * Remove a device from user's favorites.
     */
    public function unsave(Device $device): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Authentication required'], 401);
        }

        Auth::user()->savedDevices()->detach($device->id);

        return response()->json(['message' => 'Device removed from favorites']);
    }
}
