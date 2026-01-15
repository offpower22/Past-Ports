import type { DayType, Exercise, ExerciseLog } from '../types';
import { EXERCISE_MAP } from '../exercises';

interface Props {
  dayType: DayType;
  onSelectExercise: (exercise: Exercise) => void;
  onEndWorkout: () => void;
  onBack: () => void;
  completedExercises: ExerciseLog[];
}

export default function ExerciseList({
  dayType,
  onSelectExercise,
  onEndWorkout,
  onBack,
  completedExercises,
}: Props) {
  const exercises = EXERCISE_MAP[dayType];

  const isCompleted = (exercise: Exercise) => {
    return completedExercises.some((e) => e.exercise === exercise);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button
        onClick={onBack}
        className="mb-6 text-blue-400 hover:text-blue-300 text-lg"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-2 text-center">{dayType} Day</h1>
      <p className="text-gray-400 text-center mb-8">Select an exercise</p>

      <div className="flex flex-col gap-3 max-w-md mx-auto mb-6">
        {exercises.map((exercise) => (
          <button
            key={exercise}
            onClick={() => onSelectExercise(exercise)}
            className={`${
              isCompleted(exercise)
                ? 'bg-gray-700 border-2 border-green-500'
                : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
            } text-white font-semibold py-5 px-6 rounded-xl text-xl transition-colors touch-manipulation text-left relative`}
          >
            {exercise}
            {isCompleted(exercise) && (
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-green-400 text-2xl">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {completedExercises.length > 0 && (
        <div className="max-w-md mx-auto mt-8">
          <button
            onClick={onEndWorkout}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-5 px-6 rounded-xl text-xl transition-colors touch-manipulation"
          >
            End Workout
          </button>
        </div>
      )}
    </div>
  );
}
