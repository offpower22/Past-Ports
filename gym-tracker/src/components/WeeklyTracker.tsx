import type { Workout } from '../types';
import { getMondayOfCurrentWeek, getWorkoutsForWeek } from '../storage';

interface Props {
  workouts: Workout[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyTracker({ workouts }: Props) {
  const monday = getMondayOfCurrentWeek();
  const weekMap = getWorkoutsForWeek(monday, workouts);

  return (
    <div className="bg-gray-800 rounded-xl p-4 max-w-md mx-auto mb-6">
      <h2 className="text-lg font-semibold mb-4 text-center">This Week</h2>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, idx) => {
          const hasWorkout = weekMap.get(idx) || false;
          return (
            <div key={day} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  hasWorkout
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {hasWorkout ? '✓' : ''}
              </div>
              <span className="text-xs text-gray-400">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
