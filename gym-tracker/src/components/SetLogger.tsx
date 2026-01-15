import { useState } from 'react';
import type { Exercise, WorkoutSet, Workout } from '../types';
import { getLastExerciseLog } from '../storage';

interface Props {
  exercise: Exercise;
  onComplete: (sets: WorkoutSet[]) => void;
  onBack: () => void;
  workouts: Workout[];
}

export default function SetLogger({
  exercise,
  onComplete,
  onBack,
  workouts,
}: Props) {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const lastSets = getLastExerciseLog(exercise, workouts);

  const addSet = () => {
    if (!weight || !reps) return;

    const newSet: WorkoutSet = {
      weight: parseFloat(weight),
      reps: parseInt(reps),
    };

    setSets([...sets, newSet]);
    setWeight('');
    setReps('');
  };

  const skipSet = () => {
    if (sets.length === 0) return;

    const lastSet = sets[sets.length - 1];
    setSets([...sets, { ...lastSet }]);
  };

  const handleComplete = () => {
    if (sets.length === 0) return;
    onComplete(sets);
  };

  const removeSet = (index: number) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button
        onClick={onBack}
        className="mb-6 text-blue-400 hover:text-blue-300 text-lg"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">{exercise}</h1>

      {lastSets && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-3 text-yellow-400">
            Last Workout
          </h2>
          <div className="space-y-2">
            {lastSets.map((set, idx) => (
              <div
                key={idx}
                className="flex justify-between text-sm text-gray-300"
              >
                <span>Set {idx + 1}</span>
                <span>
                  {set.weight} lbs × {set.reps} reps
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Workout</h2>
        {sets.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No sets logged yet</p>
        ) : (
          <div className="space-y-2 mb-4">
            {sets.map((set, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"
              >
                <span className="font-medium">Set {idx + 1}</span>
                <span>
                  {set.weight} lbs × {set.reps} reps
                </span>
                <button
                  onClick={() => removeSet(idx)}
                  className="text-red-400 hover:text-red-300 text-xl px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Weight (lbs)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Reps</label>
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        <button
          onClick={addSet}
          disabled={!weight || !reps}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-4 px-6 rounded-xl text-xl transition-colors touch-manipulation"
        >
          Add Set
        </button>

        {sets.length > 0 && (
          <button
            onClick={skipSet}
            className="w-full bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white font-semibold py-4 px-6 rounded-xl text-xl transition-colors touch-manipulation"
          >
            Skip (Copy Last Set)
          </button>
        )}

        {sets.length > 0 && (
          <button
            onClick={handleComplete}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl text-xl transition-colors touch-manipulation"
          >
            Complete Exercise
          </button>
        )}
      </div>
    </div>
  );
}
