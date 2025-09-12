import ActivityCard from './ActivityCard';
import RestaurantCard from './RestaurantCard';

export default function DayCard({ 
    day, 
    dayIndex, 
    onAddActivity, 
    onAddRestaurant, 
    onRemoveActivity, 
    onRemoveRestaurant 
}) {
    return (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-orange-700">{day.dayName}</h3>
                <p className="text-orange-600">{day.date}</p>
            </div>

            {/* Activities Section */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-orange-600 flex items-center">
                        <span className="mr-1">🎯</span>
                        Activities
                    </h4>
                    <button
                        onClick={() => onAddActivity(dayIndex)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors shadow-sm"
                    >
                        + Add
                    </button>
                </div>
                <div className="space-y-2">
                    {day.activities.length === 0 ? (
                        <p className="text-orange-400 text-sm italic">No activities planned yet</p>
                    ) : (
                        day.activities.map((activity) => (
                            <ActivityCard
                                key={activity.id}
                                activity={activity}
                                onRemove={(id) => onRemoveActivity(dayIndex, id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Restaurants Section */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-orange-600 flex items-center">
                        <span className="mr-1">🍽️</span>
                        Restaurants
                    </h4>
                    <button
                        onClick={() => onAddRestaurant(dayIndex)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors shadow-sm"
                    >
                        + Add
                    </button>
                </div>
                <div className="space-y-2">
                    {day.restaurants.length === 0 ? (
                        <p className="text-orange-400 text-sm italic">No restaurant bookings yet</p>
                    ) : (
                        day.restaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                onRemove={(id) => onRemoveRestaurant(dayIndex, id)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
