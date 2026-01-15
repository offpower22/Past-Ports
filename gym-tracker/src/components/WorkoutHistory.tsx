import { useState } from 'react';
import type { Workout } from '../types';

interface Props {
  workouts: Workout[];
  onClose: () => void;
}

export default function WorkoutHistory({ workouts, onClose }: Props) {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (selectedWorkout) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <button
          onClick={() => setSelectedWorkout(null)}
          className="mb-6 text-blue-400 hover:text-blue-300 text-lg"
        >
          ← Back to History
        </button>

        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">
            {formatDate(selectedWorkout.date)}
          </h1>
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Gym:</span>
                <span className="ml-2 font-semibold">
                  {selectedWorkout.gym}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="ml-2 font-semibold">
                  {selectedWorkout.dayType}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {selectedWorkout.exercises.map((exerciseLog, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">
                  {exerciseLog.exercise}
                </h3>
                <div className="space-y-2">
                  {exerciseLog.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className="flex justify-between text-sm text-gray-300"
                    >
                      <span>Set {setIdx + 1}</span>
                      <span>
                        {set.weight} lbs × {set.reps} reps
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button
        onClick={onClose}
        className="mb-6 text-blue-400 hover:text-blue-300 text-lg"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-8 text-center">Workout History</h1>

      {sortedWorkouts.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No workouts logged yet
        </p>
      ) : (
        <div className="max-w-md mx-auto space-y-3">
          {sortedWorkouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => setSelectedWorkout(workout)}
              className="w-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 p-4 rounded-xl transition-colors touch-manipulation text-left"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-lg">
                  {formatDate(workout.date)}
                </span>
                <span className="text-sm text-gray-400">{workout.gym}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                  {workout.dayType}
                </span>
                <span className="text-gray-400 text-sm">
                  {workout.exercises.length} exercise
                  {workout.exercises.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
