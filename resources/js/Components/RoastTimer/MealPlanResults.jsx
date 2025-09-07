import { useState } from 'react';
import GanttChart from './GanttChart';
import TaskList from './TaskList';
import Events from './Events';

export default function MealPlanResults({ plan, onBack, onEditPlan }) {
    const [activeView, setActiveView] = useState('gantt');

    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const totalDuration = Math.max(0, Math.round(plan.total_duration_minutes / 60 * 10) / 10);

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Cooking Plan</h1>
                        <p className="text-gray-600 mt-1">
                            Serve time: {formatTime(plan.serve_time)} on {formatDate(plan.serve_time)}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onEditPlan}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                            Edit Plan
                        </button>
                        <button
                            onClick={onBack}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                        >
                            Create New Plan
                        </button>
                    </div>
                </div>

                {/* Plan Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{plan.number_of_people}</div>
                            <div className="text-sm text-gray-600">Chefs</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{totalDuration}h</div>
                            <div className="text-sm text-gray-600">Total Duration</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">{plan.tasks.length}</div>
                            <div className="text-sm text-gray-600">Total Tasks</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Toggle */}
            <div className="mb-6">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveView('gantt')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeView === 'gantt'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Gantt Chart
                    </button>
                    <button
                        onClick={() => setActiveView('tasks')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeView === 'tasks'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Task List
                    </button>
                    <button
                        onClick={() => setActiveView('events')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeView === 'events'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Events
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border">
                {activeView === 'gantt' ? (
                    <GanttChart plan={plan} />
                ) : activeView === 'tasks' ? (
                    <TaskList plan={plan} />
                ) : (
                    <Events plan={plan} />
                )}
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Cooking Instructions</h3>
                <ul className="text-yellow-700 space-y-1">
                    <li>• Follow the timeline carefully to ensure everything is ready at the same time</li>
                    <li>• Each person should focus on their assigned tasks</li>
                    <li>• Check device availability before starting each task</li>
                    <li>• Allow extra time for unexpected delays</li>
                    <li>• Keep the plan handy while cooking</li>
                </ul>
            </div>
        </div>
    );
}
