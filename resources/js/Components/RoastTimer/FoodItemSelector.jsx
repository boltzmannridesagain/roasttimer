import { useState } from 'react';

export default function FoodItemSelector({ 
    foodItems, 
    selectedFoodItems, 
    onAddFoodItem, 
    onRemoveFoodItem 
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredFoodItems = foodItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedFoodItems.some(selected => selected.food_item_id === item.id)
    );

    const handleFoodItemSelect = (foodItem) => {
        onAddFoodItem(foodItem);
        setSearchTerm('');
        setShowDropdown(false);
    };

    return (
        <div className="space-y-4">
            {/* Search and Add Food Item */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search and add food items..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {showDropdown && filteredFoodItems.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredFoodItems.map((foodItem) => (
                            <button
                                key={foodItem.id}
                                type="button"
                                onClick={() => handleFoodItemSelect(foodItem)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                <div className="font-medium">{foodItem.name}</div>
                                {foodItem.description && (
                                    <div className="text-sm text-gray-600">{foodItem.description}</div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Food Items */}
            {selectedFoodItems.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Selected Food Items:</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedFoodItems.map((item, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                                {item.food_item.name}
                                <button
                                    type="button"
                                    onClick={() => onRemoveFoodItem(index)}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </div>
    );
}
