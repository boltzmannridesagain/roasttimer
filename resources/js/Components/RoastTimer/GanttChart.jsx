import { useMemo } from 'react';

export default function GanttChart({ plan }) {
    const { timeline, timeSlots, colors } = useMemo(() => {
        // Calculate timeline bounds
        const allTimes = plan.tasks.flatMap(task => [
            new Date(task.start_time),
            new Date(task.end_time)
        ]);
        
        const minTime = new Date(Math.min(...allTimes));
        const maxTime = new Date(Math.max(...allTimes));
        
        // Round to nearest 15 minutes for cleaner display
        minTime.setMinutes(Math.floor(minTime.getMinutes() / 15) * 15);
        maxTime.setMinutes(Math.ceil(maxTime.getMinutes() / 15) * 15);
        
        // Generate time slots (every 30 minutes)
        const timeSlots = [];
        const current = new Date(minTime);
        while (current <= maxTime) {
            timeSlots.push(new Date(current));
            current.setMinutes(current.getMinutes() + 30);
        }
        
        // Generate colors for cooking phases
        const cookingPhases = [...new Set(plan.tasks.map(task => task.cooking_phase))];
        const colors = {};
        const colorPalette = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
        ];
        
        cookingPhases.forEach((cookingPhase, index) => {
            colors[cookingPhase] = colorPalette[index % colorPalette.length];
        });
        
        return { timeline: { minTime, maxTime }, timeSlots, colors };
    }, [plan.tasks]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getTaskPosition = (task) => {
        const startTime = new Date(task.start_time);
        const endTime = new Date(task.end_time);
        
        const totalDuration = timeline.maxTime - timeline.minTime;
        const taskStart = startTime - timeline.minTime;
        const taskDuration = endTime - startTime;
        
        const leftPercent = (taskStart / totalDuration) * 100;
        const widthPercent = (taskDuration / totalDuration) * 100;
        
        return {
            left: `${leftPercent}%`,
            width: `${widthPercent}%`
        };
    };

    const getPersonIngredientRows = (personNumber) => {
        const personTasks = plan.tasks.filter(task => task.person_assigned === personNumber);
        
        // Group tasks by food item for this person
        const groupedByFood = {};
        personTasks.forEach(task => {
            if (!groupedByFood[task.food_item]) {
                groupedByFood[task.food_item] = [];
            }
            groupedByFood[task.food_item].push(task);
        });
        
        return groupedByFood;
    };

    const maxChefs = Math.max(...plan.tasks.map(task => task.person_assigned));

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cooking Timeline</h2>
            
            <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="min-w-full" style={{ minWidth: '800px' }}>
                    {/* Time Header */}
                    <div className="flex mb-2">
                        <div className="w-32 flex-shrink-0"></div>
                        <div className="flex-1 relative" style={{ height: '20px' }}>
                            {timeSlots.map((time, index) => (
                                <div
                                    key={index}
                                    className="absolute text-xs text-gray-600"
                                    style={{
                                        left: `${(index / (timeSlots.length - 1)) * 100}%`,
                                        transform: 'translateX(-50%)',
                                        top: '0px'
                                    }}
                                >
                                    {formatTime(time)}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Timeline Grid */}
                    <div className="flex mb-4">
                        <div className="w-32 flex-shrink-0"></div>
                        <div className="flex-1 relative h-2 bg-gray-200 rounded">
                            {timeSlots.map((_, index) => (
                                <div
                                    key={index}
                                    className="absolute top-0 w-px h-full bg-gray-300"
                                    style={{
                                        left: `${(index / (timeSlots.length - 1)) * 100}%`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    
                    {/* Chef + Ingredient Rows */}
                    {Array.from({ length: maxChefs }, (_, index) => index + 1).map(chefNumber => {
                        const chefIngredientRows = getPersonIngredientRows(chefNumber);
                        const foodItems = Object.keys(chefIngredientRows);
                        
                        return (
                            <div key={chefNumber} className="mb-6">
                                {/* Chef Header */}
                                <div className="flex mb-2">
                                    <div className="w-32 flex-shrink-0 flex items-center">
                                        <span className="text-sm font-bold text-gray-800">
                                            Chef {chefNumber}
                                        </span>
                                    </div>
                                    <div className="flex-1"></div>
                                </div>
                                
                                {/* Ingredient Rows for this Chef */}
                                {foodItems.map((foodItem, foodIndex) => {
                                    const tasks = chefIngredientRows[foodItem];
                                    
                                    return (
                                        <div key={`${chefNumber}-${foodItem}`} className="flex mb-2">
                                            <div className="w-32 flex-shrink-0 flex items-center pl-4">
                                                <span className="text-xs text-gray-600">
                                                    {foodItem}
                                                </span>
                                            </div>
                                            
                                            <div className="flex-1 relative h-6 bg-gray-50 rounded">
                                                {tasks.map((task, taskIndex) => {
                                                    const position = getTaskPosition(task);
                                                    
                                                    return (
                                                        <div
                                                            key={taskIndex}
                                                            className="absolute top-0.5 h-5 rounded flex items-center px-2 text-xs text-white font-medium shadow-sm"
                                                            style={{
                                                                left: position.left,
                                                                width: position.width,
                                                                backgroundColor: colors[task.cooking_phase],
                                                                minWidth: '50px'
                                                            }}
                                                            title={`${task.cooking_phase} (${task.duration_minutes}m) - ${task.device || 'No device'}`}
                                                        >
                                                            <span className="truncate">
                                                                {task.cooking_phase}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Legend */}
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Cooking Phases</h3>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(colors).map(([cookingPhase, color]) => (
                        <div key={cookingPhase} className="flex items-center">
                            <div
                                className="w-4 h-4 rounded mr-2"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-sm text-gray-600">{cookingPhase}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
