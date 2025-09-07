import { useState } from 'react';
import DeviceSelector from './DeviceSelector';

export default function CookingPhaseSelector({ 
    cookingPhases, 
    devices, 
    selectedPhases, 
    onAddPhase, 
    onRemovePhase, 
    onUpdatePhase,
    onAddCustomDevice,
    onAddCustomCookingPhase
}) {
    const [showAddPhase, setShowAddPhase] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Create a Map to ensure unique cooking phases by ID
    const uniqueCookingPhasesMap = new Map();
    cookingPhases.forEach(phase => {
        if (!uniqueCookingPhasesMap.has(phase.id)) {
            uniqueCookingPhasesMap.set(phase.id, phase);
        }
    });
    const uniqueCookingPhases = Array.from(uniqueCookingPhasesMap.values());

    const availablePhases = uniqueCookingPhases.filter(phase =>
        !selectedPhases.some(selected => selected.cooking_phase_id === phase.id)
    );

    // Additional deduplication by name and description to catch any remaining duplicates
    const filteredPhases = availablePhases.filter(phase =>
        phase.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter((phase, index, self) => 
        index === self.findIndex(p => 
            p.name === phase.name && p.description === phase.description
        )
    );

    // Separate regular and custom phases, then sort each group alphabetically
    const regularPhases = filteredPhases.filter(phase => !phase.is_custom)
        .sort((a, b) => a.name.localeCompare(b.name));
    const customPhases = filteredPhases.filter(phase => phase.is_custom)
        .sort((a, b) => a.name.localeCompare(b.name));
    
    const finalFilteredPhases = [...regularPhases, ...customPhases];

    // Check if search term doesn't match any existing phases and is not empty
    const canCreateNew = searchTerm.trim() && 
        !finalFilteredPhases.some(phase => 
            phase.name.toLowerCase() === searchTerm.toLowerCase()
        ) &&
        !selectedPhases.some(selected => 
            selected.cooking_phase.name.toLowerCase() === searchTerm.toLowerCase()
        );

    const handleAddPhase = (phase) => {
        onAddPhase(phase);
        setShowAddPhase(false);
        setSearchTerm('');
    };

    const handleCreateNewPhase = () => {
        const newPhase = {
            id: `temp_${Date.now()}`, // Temporary ID for frontend use
            name: searchTerm.trim(),
            description: null,
            device_required: false, // Default to no device required
            is_custom: true // Flag to identify custom phases
        };
        
        // Add to the session's custom cooking phases list
        if (onAddCustomCookingPhase) {
            onAddCustomCookingPhase(newPhase);
        }
        
        onAddPhase(newPhase);
        setShowAddPhase(false);
        setSearchTerm('');
    };

    const formatTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    return (
        <div className="space-y-4">
            {/* Add Phase Button */}
            {availablePhases.length > 0 && (
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowAddPhase(!showAddPhase)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                    >
                        + Add Cooking Phase
                    </button>

                    {showAddPhase && (
                        <div className="absolute z-10 bottom-full mb-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg">
                            <div className="p-3">
                                <div className="text-sm font-medium text-gray-700 mb-3">Select Phase:</div>
                                
                                {/* Search Input */}
                                <input
                                    type="text"
                                    placeholder="Search phases..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                
                                <div className="space-y-1 max-h-64 overflow-y-auto">
                                    {/* Regular Phases */}
                                    {regularPhases.length > 0 && (
                                        <>
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                                                Standard Phases
                                            </div>
                                            {regularPhases.map((phase, index) => (
                                                <button
                                                    key={`${phase.id}-${index}`}
                                                    type="button"
                                                    onClick={() => handleAddPhase(phase)}
                                                    className="w-full text-left px-3 py-3 hover:bg-gray-100 rounded text-sm"
                                                >
                                                    <div className="font-medium">{phase.name}</div>
                                                    {phase.description && (
                                                        <div className="text-gray-600 text-xs mt-1">{phase.description}</div>
                                                    )}
                                                </button>
                                            ))}
                                        </>
                                    )}
                                    
                                    {/* Custom Phases */}
                                    {customPhases.length > 0 && (
                                        <>
                                            <div className="px-3 py-2 text-xs font-semibold text-purple-600 uppercase tracking-wide bg-purple-50">
                                                Custom Phases
                                            </div>
                                            {customPhases.map((phase, index) => (
                                                <button
                                                    key={`${phase.id}-${index}`}
                                                    type="button"
                                                    onClick={() => handleAddPhase(phase)}
                                                    className="w-full text-left px-3 py-3 hover:bg-purple-50 rounded text-sm border-l-2 border-purple-200"
                                                >
                                                    <div className="font-medium text-purple-800 flex items-center">
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full mr-2">
                                                            custom
                                                        </span>
                                                        {phase.name}
                                                    </div>
                                                    {phase.description && (
                                                        <div className="text-purple-600 text-xs mt-1">{phase.description}</div>
                                                    )}
                                                </button>
                                            ))}
                                        </>
                                    )}
                                    
                                    {canCreateNew && (
                                        <button
                                            type="button"
                                            onClick={handleCreateNewPhase}
                                            className="w-full text-left px-3 py-3 hover:bg-green-50 rounded text-sm border-t border-gray-200"
                                        >
                                            <div className="font-medium text-green-700">
                                                + Create "{searchTerm.trim()}"
                                            </div>
                                            <div className="text-green-600 text-xs mt-1">
                                                Add as new cooking phase
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Selected Phases */}
            {selectedPhases.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Cooking Phases:</h4>
                    {selectedPhases.map((phase, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                            phase.cooking_phase.is_custom ? 'bg-purple-50 border-purple-200' : 'bg-gray-50'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <h5 className="font-medium">{phase.cooking_phase.name}</h5>
                                    {phase.cooking_phase.is_custom && (
                                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                            custom
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onRemovePhase(index)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className={`grid gap-3 ${phase.cooking_phase.device_required ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="480"
                                        value={phase.duration_minutes}
                                        onChange={(e) => onUpdatePhase(index, 'duration_minutes', parseInt(e.target.value))}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatTime(phase.duration_minutes)}
                                    </div>
                                </div>

                                {phase.cooking_phase.device_required && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                            Device *
                                        </label>
                                        <select
                                            value={phase.device_id || ''}
                                            onChange={(e) => onUpdatePhase(index, 'device_id', e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="">Select a device...</option>
                                            {devices.map((device) => (
                                                <option key={device.id} value={device.id}>
                                                    {device.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {phase.cooking_phase.description && (
                                <div className="mt-2 text-xs text-gray-600">
                                    {phase.cooking_phase.description}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Click outside to close dropdown */}
            {showAddPhase && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowAddPhase(false)}
                />
            )}
        </div>
    );
}
