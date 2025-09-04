import { useState } from 'react';

export default function CookingPhaseSelector({ 
    cookingPhases, 
    devices, 
    selectedPhases, 
    onAddPhase, 
    onRemovePhase, 
    onUpdatePhase 
}) {
    const [showAddPhase, setShowAddPhase] = useState(false);

    const availablePhases = cookingPhases.filter(phase =>
        !selectedPhases.some(selected => selected.cooking_phase_id === phase.id)
    );

    const handleAddPhase = (phase) => {
        onAddPhase(phase);
        setShowAddPhase(false);
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
                        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
                            <div className="p-2">
                                <div className="text-sm font-medium text-gray-700 mb-2">Select Phase:</div>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {availablePhases.map((phase) => (
                                        <button
                                            key={phase.id}
                                            type="button"
                                            onClick={() => handleAddPhase(phase)}
                                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                                        >
                                            <div className="font-medium">{phase.name}</div>
                                            {phase.description && (
                                                <div className="text-gray-600">{phase.description}</div>
                                            )}
                                        </button>
                                    ))}
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
                        <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{phase.cooking_phase.name}</h5>
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
