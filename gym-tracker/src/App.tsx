import { useState, useEffect } from 'react';
import type {
  Gym,
  DayType,
  Exercise,
  WorkoutSet,
  ExerciseLog,
  Workout,
} from './types';
import { loadWorkouts, saveWorkouts } from './storage';
import GymSelection from './components/GymSelection';
import DayTypeSelection from './components/DayTypeSelection';
import ExerciseList from './components/ExerciseList';
import SetLogger from './components/SetLogger';
import WorkoutHistory from './components/WorkoutHistory';
import WeeklyTracker from './components/WeeklyTracker';

type Screen =
  | 'home'
  | 'gym-selection'
  | 'day-selection'
  | 'exercise-list'
  | 'set-logger'
  | 'history';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // Current workout state
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayType | null>(null);
  const [completedExercises, setCompletedExercises] = useState<ExerciseLog[]>(
    []
  );
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  // Load workouts on mount
  useEffect(() => {
    const loaded = loadWorkouts();
    setWorkouts(loaded);
  }, []);

  const startNewWorkout = () => {
    setSelectedGym(null);
    setSelectedDay(null);
    setCompletedExercises([]);
    setCurrentExercise(null);
    setScreen('gym-selection');
  };

  const handleGymSelect = (gym: Gym) => {
    setSelectedGym(gym);
    setScreen('day-selection');
  };

  const handleDaySelect = (dayType: DayType) => {
    setSelectedDay(dayType);
    setScreen('exercise-list');
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setScreen('set-logger');
  };

  const handleSetsComplete = (sets: WorkoutSet[]) => {
    if (!currentExercise) return;

    const exerciseLog: ExerciseLog = {
      exercise: currentExercise,
      sets,
    };

    setCompletedExercises([...completedExercises, exerciseLog]);
    setCurrentExercise(null);
    setScreen('exercise-list');
  };

  const handleEndWorkout = () => {
    if (!selectedGym || !selectedDay || completedExercises.length === 0) return;

    const newWorkout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      gym: selectedGym,
      dayType: selectedDay,
      exercises: completedExercises,
    };

    const updatedWorkouts = [...workouts, newWorkout];
    setWorkouts(updatedWorkouts);
    saveWorkouts(updatedWorkouts);

    // Reset state
    setSelectedGym(null);
    setSelectedDay(null);
    setCompletedExercises([]);
    setCurrentExercise(null);
    setScreen('home');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-4xl font-bold mb-8 text-center">Gym Tracker</h1>

            <WeeklyTracker workouts={workouts} />

            <div className="flex flex-col gap-4 max-w-md mx-auto">
              <button
                onClick={startNewWorkout}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-6 px-8 rounded-xl text-2xl transition-colors touch-manipulation"
              >
                Start Workout
              </button>

              <button
                onClick={() => setScreen('history')}
                className="bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white font-semibold py-6 px-8 rounded-xl text-2xl transition-colors touch-manipulation"
              >
                View History
              </button>
            </div>
          </div>
        );

      case 'gym-selection':
        return <GymSelection onSelect={handleGymSelect} />;

      case 'day-selection':
        return (
          <DayTypeSelection
            onSelect={handleDaySelect}
            onBack={() => setScreen('gym-selection')}
          />
        );

      case 'exercise-list':
        return selectedDay ? (
          <ExerciseList
            dayType={selectedDay}
            onSelectExercise={handleExerciseSelect}
            onEndWorkout={handleEndWorkout}
            onBack={() => setScreen('day-selection')}
            completedExercises={completedExercises}
          />
        ) : null;

      case 'set-logger':
        return currentExercise ? (
          <SetLogger
            exercise={currentExercise}
            onComplete={handleSetsComplete}
            onBack={() => setScreen('exercise-list')}
            workouts={workouts}
          />
        ) : null;

      case 'history':
        return (
          <WorkoutHistory
            workouts={workouts}
            onClose={() => setScreen('home')}
          />
        );

      default:
        return null;
    }
  };

  return <div className="min-h-screen bg-gray-900">{renderScreen()}</div>;
}
