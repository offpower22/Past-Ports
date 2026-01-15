import type { DayType, Exercise } from './types';

export const EXERCISE_MAP: Record<DayType, Exercise[]> = {
  Push: [
    'Bench Press',
    'Dumbbell Press',
    'Chest Press',
    'Pec Fly',
    'Tricep Pulldowns',
  ],
  Pull: [
    'Pull-ups',
    'Lat Pulldown',
    'Seated Row',
    'Spider Curl (front)',
    'Spider Curl (reverse)',
    'Bayesian Curl',
    'Regular Curl',
  ],
  Legs: ['Squats'],
};
