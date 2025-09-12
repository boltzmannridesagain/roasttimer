import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import DayCard from '@/Components/HolidayPlanner/DayCard';

const mediterraneanDestinations = {
    'Croatia': [
        'Dubrovnik',
        'Hvar',
        'Split'
    ],
    'Cyprus': [
        'Cyprus'
    ],
    'France': [
        'Cannes',
        'Corsica',
        'Nice'
    ],
    'Greece': [
        'Crete',
        'Mykonos',
        'Santorini'
    ],
    'Italy': [
        'Amalfi Coast',
        'Cinque Terre',
        'Sardinia',
        'Sicily'
    ],
    'Malta': [
        'Malta'
    ],
    'Monaco': [
        'Monaco'
    ],
    'Morocco': [
        'Morocco'
    ],
    'Portugal': [
        'Algarve',
        'Madeira'
    ],
    'Spain': [
        'Barcelona',
        'Costa del Sol',
        'Ibiza',
        'Mallorca',
        'Valencia'
    ],
    'Tunisia': [
        'Tunisia'
    ],
    'Turkey': [
        'Antalya',
        'Bodrum',
        'Marmaris'
    ]
};

const mediterraneanActivities = [
    'Beach day',
    'Sunset dinner',
    'Wine tasting',
    'Olive oil tasting',
    'Boat trip',
    'Snorkeling',
    'Diving',
    'Hiking',
    'Market visit',
    'Cooking class',
    'Art gallery visit',
    'Historic site tour',
    'Spa day',
    'Photography walk',
    'Local festival',
    'Cycling tour',
    'Sailing',
    'Fishing trip',
    'Volcano tour',
    'Cave exploration',
    'Food tour',
    'Sunset cruise',
    'Island hopping',
    'Mountain hiking',
    'Village tour'
];

export default function HolidayPlanner({ auth, canLogin, canRegister }) {
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [days, setDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [newActivity, setNewActivity] = useState('');
    const [newRestaurant, setNewRestaurant] = useState('');
    const [newRestaurantTime, setNewRestaurantTime] = useState('');
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showRestaurantModal, setShowRestaurantModal] = useState(false);

    // Generate days when dates are selected
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const daysArray = [];
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                daysArray.push({
                    date: new Date(d).toISOString().split('T')[0],
                    dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
                    activities: [],
                    restaurants: []
                });
            }
            setDays(daysArray);
        }
    }, [startDate, endDate]);

    const addActivity = (dayIndex) => {
        setSelectedDay(dayIndex);
        setShowActivityModal(true);
    };

    const confirmAddActivity = () => {
        if (newActivity && selectedDay !== null) {
            const updatedDays = [...days];
            updatedDays[selectedDay].activities.push({
                id: Date.now(),
                name: newActivity,
                time: '09:00'
            });
            setDays(updatedDays);
            setNewActivity('');
            setShowActivityModal(false);
        }
    };

    const addRestaurant = (dayIndex) => {
        setSelectedDay(dayIndex);
        setShowRestaurantModal(true);
    };

    const confirmAddRestaurant = () => {
        if (newRestaurant && newRestaurantTime && selectedDay !== null) {
            const updatedDays = [...days];
            updatedDays[selectedDay].restaurants.push({
                id: Date.now(),
                name: newRestaurant,
                time: newRestaurantTime
            });
            setDays(updatedDays);
            setNewRestaurant('');
            setNewRestaurantTime('');
            setShowRestaurantModal(false);
        }
    };

    const removeActivity = (dayIndex, activityId) => {
        const updatedDays = [...days];
        updatedDays[dayIndex].activities = updatedDays[dayIndex].activities.filter(
            activity => activity.id !== activityId
        );
        setDays(updatedDays);
    };

    const removeRestaurant = (dayIndex, restaurantId) => {
        const updatedDays = [...days];
        updatedDays[dayIndex].restaurants = updatedDays[dayIndex].restaurants.filter(
            restaurant => restaurant.id !== restaurantId
        );
        setDays(updatedDays);
    };

    return (
        <GuestLayout
            user={auth.user}
            canLogin={canLogin}
            canRegister={canRegister}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    🏖️ Mediterranean Holiday Planner
                </h2>
            }
        >
            <Head title="Holiday Planner" />

            <div className="py-12 bg-gradient-to-br from-orange-100 via-yellow-50 to-red-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl mb-8 border-4 border-orange-200">
                        <div className="p-8 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400">
                            <h1 className="text-4xl font-bold text-white text-center mb-4">
                                🌞 Mediterranean Holiday Planner
                            </h1>
                            <p className="text-xl text-white text-center opacity-90">
                                Plan your perfect Mediterranean getaway with activities, restaurants, and more!
                            </p>
                        </div>
                    </div>

                    {/* Destination and Date Selection */}
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl mb-8 border-4 border-yellow-200">
                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-orange-600 mb-6">📍 Choose Your Destination & Dates</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Destination
                                    </label>
                                    <select
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                                    >
                                        <option value="">Select a destination...</option>
                                        {Object.entries(mediterraneanDestinations).map(([country, destinations]) => (
                                            <optgroup key={country} label={country}>
                                                {destinations.map((dest) => (
                                                    <option key={`${country}-${dest}`} value={`${dest}, ${country}`}>
                                                        {dest}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Holiday Summary */}
                    {days.length > 0 && destination && (
                        <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl mb-8 border-4 border-green-200">
                            <div className="p-8 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400">
                                <h2 className="text-2xl font-bold text-white mb-4">🌊 Your Mediterranean Adventure</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold">{destination}</div>
                                        <div className="text-lg opacity-90">Destination</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold">{days.length}</div>
                                        <div className="text-lg opacity-90">Days</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold">
                                            {days.reduce((total, day) => total + day.activities.length + day.restaurants.length, 0)}
                                        </div>
                                        <div className="text-lg opacity-90">Planned Items</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Days Grid */}
                    {days.length > 0 && (
                        <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl mb-8 border-4 border-red-200">
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-red-600 mb-6">📅 Your Holiday Itinerary</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {days.map((day, dayIndex) => (
                                        <DayCard
                                            key={dayIndex}
                                            day={day}
                                            dayIndex={dayIndex}
                                            onAddActivity={addActivity}
                                            onAddRestaurant={addRestaurant}
                                            onRemoveActivity={removeActivity}
                                            onRemoveRestaurant={removeRestaurant}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Modal */}
                    {showActivityModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 border-4 border-orange-200">
                                <h3 className="text-2xl font-bold text-orange-600 mb-4">Add Activity</h3>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Activity
                                    </label>
                                    <select
                                        value={newActivity}
                                        onChange={(e) => setNewActivity(e.target.value)}
                                        className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Select an activity...</option>
                                        {mediterraneanActivities.map((activity) => (
                                            <option key={activity} value={activity}>
                                                {activity}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={confirmAddActivity}
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Add Activity
                                    </button>
                                    <button
                                        onClick={() => setShowActivityModal(false)}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Restaurant Modal */}
                    {showRestaurantModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 border-4 border-red-200">
                                <h3 className="text-2xl font-bold text-red-600 mb-4">Add Restaurant Booking</h3>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Restaurant Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newRestaurant}
                                        onChange={(e) => setNewRestaurant(e.target.value)}
                                        placeholder="Enter restaurant name..."
                                        className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={newRestaurantTime}
                                        onChange={(e) => setNewRestaurantTime(e.target.value)}
                                        className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={confirmAddRestaurant}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Add Booking
                                    </button>
                                    <button
                                        onClick={() => setShowRestaurantModal(false)}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
