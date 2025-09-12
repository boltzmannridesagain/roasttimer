export default function RestaurantCard({ restaurant, onRemove }) {
    return (
        <div className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm border border-red-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2">
                <span className="text-red-500">🍽️</span>
                <span className="text-orange-700 font-medium">{restaurant.name}</span>
                <span className="text-orange-500 text-sm">({restaurant.time})</span>
            </div>
            <button
                onClick={() => onRemove(restaurant.id)}
                className="text-red-500 hover:text-red-700 text-sm font-bold hover:bg-red-50 rounded-full p-1 transition-colors"
                title="Remove restaurant booking"
            >
                ✕
            </button>
        </div>
    );
}
