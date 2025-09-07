import { useState, useEffect } from 'react';
import axios from 'axios';
import FoodItemSelector from './FoodItemSelector';
import CookingPhaseSelector from './CookingPhaseSelector';

export default function MealPlanForm({ onPlanGenerated, editingPlan }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        serve_time: '',
        number_of_people: 1,
        food_items: []
    });

    const [foodItems, setFoodItems] = useState([]);
    const [devices, setDevices] = useState([]);
    const [cookingPhases, setCookingPhases] = useState([]);
    const [customDevices, setCustomDevices] = useState([]);
    const [customCookingPhases, setCustomCookingPhases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (editingPlan) {
            populateFormFromPlan(editingPlan);
        }
    }, [editingPlan]);

    const loadInitialData = async () => {
        try {
            const [foodItemsRes, devicesRes, cookingPhasesRes] = await Promise.all([
                axios.get('/api/roast-timer/food-items'),
                axios.get('/api/roast-timer/devices'),
                axios.get('/api/roast-timer/cooking-phases')
            ]);

            setFoodItems(foodItemsRes.data);
            setDevices(devicesRes.data);
            setCookingPhases(cookingPhasesRes.data);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    };

    const populateFormFromPlan = (plan) => {
        console.log('Populating form from plan:', plan);
        
        // Convert the plan back to form data structure
        const planFormData = {
            name: plan.name || '',
            description: plan.description || '',
            serve_time: plan.serve_time ? new Date(plan.serve_time).toLocaleString('sv-SE').slice(0, 16) : '',
            number_of_people: plan.number_of_people || 1,
            food_items: plan.food_items || []
        };

        console.log('Plan form data:', planFormData);
        setFormData(planFormData);

        // Extract custom items from the plan
        const customDevicesFromPlan = [];
        const customCookingPhasesFromPlan = [];

        plan.food_items?.forEach(item => {
            item.cooking_phases?.forEach(phase => {
                console.log('Processing phase:', phase);
                console.log('cooking_phase_id type:', typeof phase.cooking_phase_id, 'value:', phase.cooking_phase_id);
                
                // Check if this is a custom cooking phase
                if (phase.cooking_phase_id && 
                    typeof phase.cooking_phase_id === 'string' && 
                    phase.cooking_phase_id.startsWith('temp_')) {
                    const existingCustom = customCookingPhasesFromPlan.find(cp => cp.id === phase.cooking_phase_id);
                    if (!existingCustom && phase.cooking_phase) {
                        customCookingPhasesFromPlan.push({
                            id: phase.cooking_phase_id,
                            name: phase.cooking_phase.name,
                            description: phase.cooking_phase.description,
                            device_required: phase.cooking_phase.device_required,
                            is_custom: true
                        });
                    }
                }

                // Check if this is a custom device
                if (phase.device_id && 
                    typeof phase.device_id === 'string' && 
                    phase.device_id.startsWith('temp_')) {
                    const existingCustom = customDevicesFromPlan.find(d => d.id === phase.device_id);
                    if (!existingCustom && phase.device) {
                        customDevicesFromPlan.push({
                            id: phase.device_id,
                            name: phase.device.name,
                            is_custom: true
                        });
                    }
                }
            });
        });

        setCustomDevices(customDevicesFromPlan);
        setCustomCookingPhases(customCookingPhasesFromPlan);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const addFoodItem = (foodItem) => {
        const newFoodItem = {
            food_item_id: foodItem.id,
            food_item: foodItem,
            cooking_phases: []
        };
        
        setFormData(prev => ({
            ...prev,
            food_items: [...prev.food_items, newFoodItem]
        }));
    };

    const addCustomDevice = (device) => {
        setCustomDevices(prev => [...prev, device]);
    };

    const addCustomCookingPhase = (cookingPhase) => {
        setCustomCookingPhases(prev => [...prev, cookingPhase]);
    };

    const removeFoodItem = (index) => {
        setFormData(prev => ({
            ...prev,
            food_items: prev.food_items.filter((_, i) => i !== index)
        }));
    };

    const addCookingPhase = (foodItemIndex, phase) => {
        const defaultDevice = phase.device_required ? (devices[0] || customDevices[0]) : null;
        const newPhase = {
            cooking_phase_id: phase.id,
            cooking_phase: phase,
            duration_minutes: 30,
            device_id: defaultDevice?.id || null,
            device: defaultDevice
        };

        setFormData(prev => ({
            ...prev,
            food_items: prev.food_items.map((item, index) => 
                index === foodItemIndex 
                    ? { ...item, cooking_phases: [...item.cooking_phases, newPhase] }
                    : item
            )
        }));
    };

    const removeCookingPhase = (foodItemIndex, phaseIndex) => {
        setFormData(prev => ({
            ...prev,
            food_items: prev.food_items.map((item, index) => 
                index === foodItemIndex 
                    ? { 
                        ...item, 
                        cooking_phases: item.cooking_phases.filter((_, i) => i !== phaseIndex) 
                    }
                    : item
            )
        }));
    };

    const updateCookingPhase = (foodItemIndex, phaseIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            food_items: prev.food_items.map((item, index) => 
                index === foodItemIndex 
                    ? {
                        ...item,
                        cooking_phases: item.cooking_phases.map((phase, pIndex) => {
                            if (pIndex === phaseIndex) {
                                const updatedPhase = { ...phase, [field]: value };
                                
                                // If updating device_id, also update the device object
                                if (field === 'device_id') {
                                    const allDevices = [...devices, ...customDevices];
                                    const selectedDevice = allDevices.find(d => d.id === value);
                                    updatedPhase.device = selectedDevice || null;
                                }
                                
                                return updatedPhase;
                            }
                            return phase;
                        })
                    }
                    : item
            )
        }));
    };

    const calculateEarliestCompletionTime = () => {
        if (formData.food_items.length === 0) {
            return null;
        }

        // Calculate total cooking time for each food item
        const foodItemTimes = formData.food_items.map(item => {
            const totalTime = item.cooking_phases.reduce((sum, phase) => {
                return sum + (phase.duration_minutes || 0);
            }, 0);
            return totalTime;
        });

        // Find the maximum cooking time (longest item)
        const maxCookingTime = Math.max(...foodItemTimes);

        // Start from now and add the maximum cooking time + 10 minutes buffer
        const now = new Date();
        const completionTime = new Date(now.getTime() + (maxCookingTime + 10) * 60000);

        return completionTime;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Calculate serve time if not provided
            let serveTime = formData.serve_time;
            if (!serveTime) {
                const calculatedTime = calculateEarliestCompletionTime();
                if (calculatedTime) {
                    serveTime = calculatedTime.toISOString();
                }
            }

            // Prepare data for API
            const submitData = {
                ...formData,
                serve_time: serveTime,
                food_items: formData.food_items.map(item => ({
                    food_item_id: item.food_item_id,
                    food_item: item.food_item, // Include the full food item data
                    cooking_phases: item.cooking_phases.map(phase => ({
                        cooking_phase_id: phase.cooking_phase_id,
                        cooking_phase: phase.cooking_phase, // Include the full cooking phase data
                        duration_minutes: phase.duration_minutes,
                        device_id: phase.device_id,
                        device: phase.device // Include the full device data
                    }))
                }))
            };

            const response = await axios.post('/api/roast-timer/generate-plan', submitData);
            onPlanGenerated(response.data);
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'An error occurred while generating the plan.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Roast Timer Plan</h1>
                <p className="text-gray-600">
                    Plan your perfect roast dinner with precise timing and coordination.
                </p>
            </div>

            {errors.general && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Form Layout - Two columns on medium screens and up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {/* Basic Information */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            {/* Critical Fields - Highlighted */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <h3 className="text-sm font-semibold text-blue-800 mb-3">⚠️ Required Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-blue-800 mb-2">
                                            ⏰ Serve Time *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formData.serve_time}
                                            onChange={(e) => handleInputChange('serve_time', e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        />
                                        <p className="mt-1 text-sm text-gray-600">
                                            💡 Leave empty to auto-calculate based on your food items + 10 minutes buffer
                                        </p>
                                        {!formData.serve_time && formData.food_items.length > 0 && (() => {
                                            const calculatedTime = calculateEarliestCompletionTime();
                                            if (calculatedTime) {
                                                const timeStr = calculatedTime.toLocaleString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });
                                                return (
                                                    <p className="mt-1 text-sm text-blue-600 font-medium">
                                                        🕐 Will be set to: {timeStr}
                                                    </p>
                                                );
                                            }
                                            return null;
                                        })()}
                                        {errors.serve_time && (
                                            <p className="mt-1 text-sm text-red-600">{errors.serve_time[0]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-blue-800 mb-2">
                                            👨‍🍳 Number of Chefs *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.number_of_people}
                                            onChange={(e) => handleInputChange('number_of_people', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        />
                                        {errors.number_of_people && (
                                            <p className="mt-1 text-sm text-red-600">{errors.number_of_people[0]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Meal Name - Optional */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🍽️ Meal Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Sunday Roast (optional)"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                                )}
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Optional description of your meal..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Food Items */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Food Items</h2>
                        
                        <FoodItemSelector
                            foodItems={foodItems}
                            selectedFoodItems={formData.food_items}
                            onAddFoodItem={addFoodItem}
                            onRemoveFoodItem={removeFoodItem}
                        />

                        {errors.food_items && (
                            <p className="mt-2 text-sm text-red-600">{errors.food_items[0]}</p>
                        )}
                    </div>
                </div>

                {/* Food Item Details - Full width below the two columns */}
                {formData.food_items.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">Cooking Phases</h2>
                        <div className="space-y-6">
                            {formData.food_items.map((foodItem, foodItemIndex) => (
                                <div key={foodItemIndex} className="bg-white p-4 rounded-lg border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium">{foodItem.food_item.name}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeFoodItem(foodItemIndex)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <CookingPhaseSelector
                                        cookingPhases={[...cookingPhases, ...customCookingPhases]}
                                        devices={[...devices, ...customDevices]}
                                        selectedPhases={foodItem.cooking_phases}
                                        onAddPhase={(phase) => addCookingPhase(foodItemIndex, phase)}
                                        onRemovePhase={(phaseIndex) => removeCookingPhase(foodItemIndex, phaseIndex)}
                                        onUpdatePhase={(phaseIndex, field, value) => 
                                            updateCookingPhase(foodItemIndex, phaseIndex, field, value)
                                        }
                                        onAddCustomDevice={addCustomDevice}
                                        onAddCustomCookingPhase={addCustomCookingPhase}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || formData.food_items.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                    >
                        {loading ? 'Generating Plan...' : 'Generate Cooking Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
}
