import { useMemo } from 'react';

export default function Events({ plan }) {
    const events = useMemo(() => {
        const eventList = [];
        
        // Create start and finish events for each task
        plan.tasks.forEach(task => {
            const startTime = new Date(task.start_time);
            const endTime = new Date(task.end_time);
            
            // Start event
            eventList.push({
                time: startTime,
                type: 'start',
                task: task,
                description: `${task.food_item} ${task.cooking_phase} start`
            });
            
            // Finish event
            eventList.push({
                time: endTime,
                type: 'finish',
                task: task,
                description: `${task.food_item} ${task.cooking_phase} finish`
            });
        });
        
        // Sort events chronologically
        eventList.sort((a, b) => a.time - b.time);
        
        return eventList;
    }, [plan.tasks]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getEventIcon = (type) => {
        if (type === 'start') {
            return (
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
            );
        } else {
            return (
                <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
            );
        }
    };

    const getEventColor = (type) => {
        return type === 'start' ? 'text-green-700' : 'text-red-700';
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cooking Events Timeline</h2>
            <p className="text-gray-600 mb-6">
                A chronological list of when each cooking task starts and finishes.
            </p>
            
            <div className="space-y-4">
                {events.map((event, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                            {getEventIcon(event.type)}
                        </div>
                        
                        <div className="flex-shrink-0 w-20">
                            <span className="text-sm font-mono text-gray-600">
                                {formatTime(event.time)}
                            </span>
                        </div>
                        
                        <div className="flex-1">
                            <span className={`text-sm font-medium ${getEventColor(event.type)}`}>
                                {event.description}
                            </span>
                        </div>
                        
                        <div className="flex-shrink-0 text-xs text-gray-500">
                            Chef {event.task.person_assigned}
                        </div>
                    </div>
                ))}
            </div>
            
            {events.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No events to display
                </div>
            )}
        </div>
    );
}
