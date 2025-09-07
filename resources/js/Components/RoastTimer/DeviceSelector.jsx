import { useState } from 'react';

export default function DeviceSelector({ 
    devices, 
    selectedDevices, 
    onAddDevice, 
    onRemoveDevice,
    onAddCustomDevice
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredDevices = devices.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedDevices.some(selected => selected.id === device.id)
    );

    // Check if search term doesn't match any existing devices and is not empty
    const canCreateNew = searchTerm.trim() && 
        !filteredDevices.some(device => 
            device.name.toLowerCase() === searchTerm.toLowerCase()
        ) &&
        !selectedDevices.some(selected => 
            selected.name.toLowerCase() === searchTerm.toLowerCase()
        );

    const handleDeviceSelect = (device) => {
        onAddDevice(device);
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleCreateNewDevice = () => {
        const newDevice = {
            id: `temp_${Date.now()}`, // Temporary ID for frontend use
            name: searchTerm.trim(),
            description: null,
            is_custom: true // Flag to identify custom devices
        };
        
        // Add to the session's custom devices list
        if (onAddCustomDevice) {
            onAddCustomDevice(newDevice);
        }
        
        onAddDevice(newDevice);
        setSearchTerm('');
        setShowDropdown(false);
    };

    return (
        <div className="space-y-4">
            {/* Search and Add Device */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search and add devices..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {showDropdown && (filteredDevices.length > 0 || canCreateNew) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredDevices.map((device) => (
                            <button
                                key={device.id}
                                type="button"
                                onClick={() => handleDeviceSelect(device)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                            >
                                <div className="font-medium">{device.name}</div>
                                {device.description && (
                                    <div className="text-sm text-gray-600">{device.description}</div>
                                )}
                            </button>
                        ))}
                        
                        {canCreateNew && (
                            <button
                                type="button"
                                onClick={handleCreateNewDevice}
                                className="w-full px-4 py-2 text-left hover:bg-green-50 focus:bg-green-50 focus:outline-none border-t border-gray-200"
                            >
                                <div className="font-medium text-green-700">
                                    + Create "{searchTerm.trim()}"
                                </div>
                                <div className="text-sm text-green-600">
                                    Add as new device
                                </div>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Devices */}
            {selectedDevices.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Selected Devices:</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedDevices.map((device, index) => (
                            <span
                                key={index}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                    device.is_custom 
                                        ? 'bg-orange-100 text-orange-800' 
                                        : 'bg-green-100 text-green-800'
                                }`}
                            >
                                {device.name}
                                {device.is_custom && (
                                    <span className="ml-1 text-xs opacity-75">(custom)</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => onRemoveDevice(index)}
                                    className={`ml-2 ${
                                        device.is_custom 
                                            ? 'text-orange-600 hover:text-orange-800' 
                                            : 'text-green-600 hover:text-green-800'
                                    }`}
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
