export type Gym = 'CU' | '24PB' | '24LJ';

export type DayType = 'Push' | 'Pull' | 'Legs';

export type Exercise =
  | 'Bench Press'
  | 'Dumbbell Press'
  | 'Chest Press'
  | 'Pec Fly'
  | 'Tricep Pulldowns'
  | 'Pull-ups'
  | 'Lat Pulldown'
  | 'Seated Row'
  | 'Spider Curl (front)'
  | 'Spider Curl (reverse)'
  | 'Bayesian Curl'
  | 'Regular Curl'
  | 'Squats';

export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface ExerciseLog {
  exercise: Exercise;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  date: string; // ISO date string
  gym: Gym;
  dayType: DayType;
  exercises: ExerciseLog[];
}

export interface AppState {
  currentWorkout: {
    gym: Gym | null;
    dayType: DayType | null;
    exercises: ExerciseLog[];
  };
  workouts: Workout[];
}
