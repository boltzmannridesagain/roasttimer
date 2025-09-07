import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import MealPlanForm from '@/Components/RoastTimer/MealPlanForm';
import MealPlanResults from '@/Components/RoastTimer/MealPlanResults';
import SavedMeals from '@/Components/RoastTimer/SavedMeals';

export default function Index({ auth, canLogin, canRegister }) {
    const [currentStep, setCurrentStep] = useState('form');
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);
    const [showSavedMeals, setShowSavedMeals] = useState(false);

    const handlePlanGenerated = (plan) => {
        setGeneratedPlan(plan);
        setCurrentStep('results');
    };

    const handleBackToForm = () => {
        setCurrentStep('form');
        setGeneratedPlan(null);
        setEditingPlan(null);
    };

    const handleEditPlan = () => {
        setEditingPlan(generatedPlan);
        setCurrentStep('form');
    };

    const handleShowSavedMeals = () => {
        setShowSavedMeals(true);
    };

    const handleHideSavedMeals = () => {
        setShowSavedMeals(false);
    };

    const Layout = auth.user ? AuthenticatedLayout : GuestLayout;

    return (
        <Layout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Roast Timer
                    </h2>
                    {auth.user && (
                        <button
                            onClick={handleShowSavedMeals}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            My Saved Meals
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Roast Timer" />

            <div className="py-6">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6 text-gray-900">
                            {showSavedMeals ? (
                                <SavedMeals onBack={handleHideSavedMeals} />
                            ) : currentStep === 'form' ? (
                                <MealPlanForm 
                                    onPlanGenerated={handlePlanGenerated} 
                                    editingPlan={editingPlan}
                                />
                            ) : (
                                <MealPlanResults 
                                    plan={generatedPlan} 
                                    onBack={handleBackToForm}
                                    onEditPlan={handleEditPlan}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
