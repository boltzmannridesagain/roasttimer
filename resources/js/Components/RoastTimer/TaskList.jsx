import { useMemo } from 'react';

export default function TaskList({ plan }) {
    const groupedTasks = useMemo(() => {
        const groups = {};
        
        plan.tasks.forEach(task => {
            const person = task.person_assigned;
            if (!groups[person]) {
                groups[person] = [];
            }
            groups[person].push(task);
        });
        
        // Sort tasks within each group by start time
        Object.keys(groups).forEach(person => {
            groups[person].sort((a, b) => 
                new Date(a.start_time) - new Date(b.start_time)
            );
        });
        
        return groups;
    }, [plan.tasks]);

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    const getStatusColor = (task) => {
        const now = new Date();
        const startTime = new Date(task.start_time);
        const endTime = new Date(task.end_time);
        
        if (now < startTime) {
            return 'text-gray-500'; // Not started
        } else if (now >= startTime && now <= endTime) {
            return 'text-green-600'; // In progress
        } else {
            return 'text-gray-400'; // Completed
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Task List</h2>
            
            <div className="space-y-6">
                {Object.entries(groupedTasks).map(([person, tasks]) => (
                    <div key={person} className="border border-gray-200 rounded-lg">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Person {person}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        
                        <div className="divide-y divide-gray-200">
                            {tasks.map((task, index) => (
                                <div key={index} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {task.cooking_phase}
                                                </h4>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {task.food_item}
                                                </span>
                                            </div>
                                            
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <div className="flex items-center space-x-4">
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatTime(task.start_time)} - {formatTime(task.end_time)}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatDuration(task.duration_minutes)}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                        </svg>
                                                        {task.device}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="ml-4">
                                            <span className={`text-sm font-medium ${getStatusColor(task)}`}>
                                                {(() => {
                                                    const now = new Date();
                                                    const startTime = new Date(task.start_time);
                                                    const endTime = new Date(task.end_time);
                                                    
                                                    if (now < startTime) {
                                                        return 'Not Started';
                                                    } else if (now >= startTime && now <= endTime) {
                                                        return 'In Progress';
                                                    } else {
                                                        return 'Completed';
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Summary */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Total Tasks:</span>
                        <span className="ml-2 font-medium">{plan.tasks.length}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">People Involved:</span>
                        <span className="ml-2 font-medium">{plan.number_of_people}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Total Duration:</span>
                        <span className="ml-2 font-medium">{Math.round(plan.total_duration_minutes / 60 * 10) / 10}h</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
