<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserMeal;
use App\Models\MealFoodItem;
use App\Models\FoodItem;
use App\Models\Device;
use App\Models\CookingPhase;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class MealPlanController extends Controller
{
    /**
     * Generate a cooking plan based on user inputs.
     */
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'serve_time' => 'required|date|after:now',
            'number_of_people' => 'required|integer|min:1|max:20',
            'food_items' => 'required|array|min:1',
            'food_items.*.food_item_id' => 'required|exists:food_items,id',
            'food_items.*.cooking_phases' => 'required|array|min:1',
            'food_items.*.cooking_phases.*.cooking_phase_id' => 'required|exists:cooking_phases,id',
            'food_items.*.cooking_phases.*.duration_minutes' => 'required|integer|min:1|max:480',
            'food_items.*.cooking_phases.*.device_id' => 'nullable|exists:devices,id',
        ]);

        // Custom validation: device_id is required only if cooking phase requires a device
        $cookingPhases = CookingPhase::whereIn('id', collect($request->food_items)
            ->pluck('cooking_phases')
            ->flatten(1)
            ->pluck('cooking_phase_id')
        )->get()->keyBy('id');

        foreach ($request->food_items as $foodItemIndex => $foodItem) {
            foreach ($foodItem['cooking_phases'] as $phaseIndex => $phase) {
                $cookingPhase = $cookingPhases[$phase['cooking_phase_id']] ?? null;
                if ($cookingPhase && $cookingPhase->device_required && !$phase['device_id']) {
                    throw new \Illuminate\Validation\ValidationException(
                        validator: \Illuminate\Support\Facades\Validator::make([], []),
                        errorBag: 'default'
                    );
                }
            }
        }

        $serveTime = Carbon::parse($request->serve_time);
        $numberOfPeople = $request->number_of_people;

        // Generate the cooking plan
        $plan = $this->generateCookingPlan($request->food_items, $serveTime, $numberOfPeople);

        // If user is authenticated, save the meal
        if (Auth::check()) {
            $userMeal = UserMeal::create([
                'user_id' => Auth::id(),
                'name' => $request->name,
                'description' => $request->description,
                'serve_time' => $serveTime,
                'number_of_people' => $numberOfPeople,
                'plan_data' => $plan,
            ]);

            // Save food items with their cooking phases
            foreach ($request->food_items as $foodItemData) {
                MealFoodItem::create([
                    'user_meal_id' => $userMeal->id,
                    'food_item_id' => $foodItemData['food_item_id'],
                    'cooking_phases' => $foodItemData['cooking_phases'],
                ]);
            }

            $plan['meal_id'] = $userMeal->id;
        }

        return response()->json($plan);
    }

    /**
     * Get saved meals for authenticated user.
     */
    public function index(): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Authentication required'], 401);
        }

        $meals = UserMeal::forUser(Auth::id())
            ->with(['foodItems'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($meals);
    }

    /**
     * Get a specific saved meal.
     */
    public function show(UserMeal $userMeal): JsonResponse
    {
        // Check if user owns this meal or if it's a guest meal
        if ($userMeal->user_id && $userMeal->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $userMeal->load(['foodItems', 'mealFoodItems.foodItem']);

        return response()->json($userMeal);
    }

    /**
     * Delete a saved meal.
     */
    public function destroy(UserMeal $userMeal): JsonResponse
    {
        if (!Auth::check() || $userMeal->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $userMeal->delete();

        return response()->json(['message' => 'Meal deleted successfully']);
    }

    /**
     * Generate the cooking plan algorithm.
     */
    private function generateCookingPlan(array $foodItems, Carbon $serveTime, int $numberOfPeople): array
    {
        $tasks = [];
        $timeline = [];
        $deviceUsage = [];

        // Process each food item and its cooking phases
        foreach ($foodItems as $foodItemData) {
            $foodItem = FoodItem::find($foodItemData['food_item_id']);
            $currentTime = $serveTime->copy();

            // Process phases in reverse order (from serving backwards)
            $phases = array_reverse($foodItemData['cooking_phases']);
            
            foreach ($phases as $phaseData) {
                $cookingPhase = CookingPhase::find($phaseData['cooking_phase_id']);
                $device = Device::find($phaseData['device_id']);
                $duration = $phaseData['duration_minutes'];

                // Calculate start time
                $startTime = $currentTime->copy()->subMinutes($duration);

                $task = [
                    'id' => uniqid(),
                    'food_item' => $foodItem->name,
                    'cooking_phase' => $cookingPhase->name,
                    'device' => $device->name,
                    'duration_minutes' => $duration,
                    'start_time' => $startTime->toISOString(),
                    'end_time' => $currentTime->toISOString(),
                    'person_assigned' => null, // Will be assigned later
                ];

                $tasks[] = $task;
                $currentTime = $startTime;
            }
        }

        // Sort tasks by start time
        usort($tasks, function ($a, $b) {
            return strtotime($a['start_time']) - strtotime($b['start_time']);
        });

        // Assign people to tasks based on number of people and device conflicts
        $tasks = $this->assignPeopleToTasks($tasks, $numberOfPeople);

        // Generate timeline view
        $timeline = $this->generateTimeline($tasks);

        return [
            'serve_time' => $serveTime->toISOString(),
            'number_of_people' => $numberOfPeople,
            'total_duration_minutes' => $this->calculateTotalDuration($tasks),
            'tasks' => $tasks,
            'timeline' => $timeline,
            'gantt_data' => $this->generateGanttData($tasks),
        ];
    }

    /**
     * Assign people to tasks, avoiding device conflicts.
     */
    private function assignPeopleToTasks(array $tasks, int $numberOfPeople): array
    {
        $deviceSchedule = [];
        $personSchedule = [];

        foreach ($tasks as &$task) {
            $startTime = strtotime($task['start_time']);
            $endTime = strtotime($task['end_time']);
            $device = $task['device'];

            // Check for device conflicts
            $conflictingTasks = [];
            foreach ($deviceSchedule as $scheduledTask) {
                if ($scheduledTask['device'] === $device) {
                    $scheduledStart = strtotime($scheduledTask['start_time']);
                    $scheduledEnd = strtotime($scheduledTask['end_time']);
                    
                    // Check for time overlap
                    if (($startTime < $scheduledEnd) && ($endTime > $scheduledStart)) {
                        $conflictingTasks[] = $scheduledTask;
                    }
                }
            }

            // Assign person based on availability and conflicts
            $assignedPerson = $this->findAvailablePerson($task, $conflictingTasks, $personSchedule, $numberOfPeople);
            $task['person_assigned'] = $assignedPerson;

            // Update schedules
            $deviceSchedule[] = $task;
            $personSchedule[] = $task;
        }

        return $tasks;
    }

    /**
     * Find an available person for a task.
     */
    private function findAvailablePerson(array $task, array $conflictingTasks, array $personSchedule, int $numberOfPeople): int
    {
        $startTime = strtotime($task['start_time']);
        $endTime = strtotime($task['end_time']);

        // If single person, assign to person 1
        if ($numberOfPeople === 1) {
            return 1;
        }

        // Check each person's availability
        for ($person = 1; $person <= $numberOfPeople; $person++) {
            $isAvailable = true;

            // Check if person has conflicting tasks
            foreach ($personSchedule as $scheduledTask) {
                if ($scheduledTask['person_assigned'] === $person) {
                    $scheduledStart = strtotime($scheduledTask['start_time']);
                    $scheduledEnd = strtotime($scheduledTask['end_time']);
                    
                    // Check for time overlap
                    if (($startTime < $scheduledEnd) && ($endTime > $scheduledStart)) {
                        $isAvailable = false;
                        break;
                    }
                }
            }

            if ($isAvailable) {
                return $person;
            }
        }

        // If no person is available, assign to person 1 (fallback)
        return 1;
    }

    /**
     * Generate timeline view of tasks.
     */
    private function generateTimeline(array $tasks): array
    {
        $timeline = [];
        $currentTime = null;

        foreach ($tasks as $task) {
            $taskTime = Carbon::parse($task['start_time']);
            
            if (!$currentTime || $taskTime->format('Y-m-d H:i') !== $currentTime->format('Y-m-d H:i')) {
                $currentTime = $taskTime;
                $timeline[] = [
                    'time' => $currentTime->toISOString(),
                    'tasks' => []
                ];
            }

            $timeline[count($timeline) - 1]['tasks'][] = $task;
        }

        return $timeline;
    }

    /**
     * Generate Gantt chart data.
     */
    private function generateGanttData(array $tasks): array
    {
        $ganttData = [];
        $foodItems = [];

        // Group tasks by food item
        foreach ($tasks as $task) {
            $foodItem = $task['food_item'];
            if (!isset($foodItems[$foodItem])) {
                $foodItems[$foodItem] = [];
            }
            $foodItems[$foodItem][] = $task;
        }

        // Convert to Gantt format
        foreach ($foodItems as $foodItem => $itemTasks) {
            $ganttData[] = [
                'food_item' => $foodItem,
                'tasks' => $itemTasks,
                'start_time' => min(array_column($itemTasks, 'start_time')),
                'end_time' => max(array_column($itemTasks, 'end_time')),
            ];
        }

        return $ganttData;
    }

    /**
     * Calculate total duration of the cooking plan.
     */
    private function calculateTotalDuration(array $tasks): int
    {
        if (empty($tasks)) {
            return 0;
        }

        $earliestStart = min(array_column($tasks, 'start_time'));
        $latestEnd = max(array_column($tasks, 'end_time'));

        // Ensure we get the absolute duration
        $startTime = Carbon::parse($earliestStart);
        $endTime = Carbon::parse($latestEnd);
        
        return $endTime->diffInMinutes($startTime);
    }
}
