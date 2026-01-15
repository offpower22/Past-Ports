# Gym Tracker

A mobile-first web app for tracking gym workouts, optimized for iPhone use in the gym with fast, touch-friendly inputs and minimal typing.

## Features

- **Gym Selection**: Choose from CU, 24PB, or 24LJ
- **Workout Types**: Select Push, Pull, or Legs day
- **Exercise Tracking**:
  - Push: Bench Press, Dumbbell Press, Chest Press, Pec Fly, Tricep Pulldowns
  - Pull: Pull-ups, Lat Pulldown, Seated Row, Spider Curl (front/reverse), Bayesian Curl, Regular Curl
  - Legs: Squats
- **Set Logging**:
  - View last workout's weights and reps
  - Quick entry with "Skip" button to copy previous set
  - Manual weight and rep input
- **Workout History**: Browse all past workouts by date
- **Weekly Activity Tracker**: Visual calendar showing workout consistency

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **localStorage** - Persistent data storage

## Project Structure

```
src/
├── components/
│   ├── GymSelection.tsx       # Gym selection screen
│   ├── DayTypeSelection.tsx   # Push/Pull/Legs selection
│   ├── ExerciseList.tsx       # List of exercises for selected day
│   ├── SetLogger.tsx          # Set logging with history display
│   ├── WorkoutHistory.tsx     # Past workout viewer
│   └── WeeklyTracker.tsx      # Weekly activity calendar
├── types.ts                   # TypeScript type definitions
├── exercises.ts               # Exercise mapping by day type
├── storage.ts                 # localStorage utilities
├── App.tsx                    # Main app component
└── index.css                  # Global styles with mobile optimizations
```

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+

### Installation

```bash
cd gym-tracker
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Mobile Optimization

The app is optimized for mobile use:

- Touch-friendly large buttons (minimum 44x44px tap targets)
- Prevents unwanted zoom on input focus
- Fast tap response with `touch-manipulation`
- iOS-specific meta tags for standalone app experience
- Dark theme optimized for gym lighting

## Data Storage

All workout data is stored in browser localStorage and persists across sessions. Data includes:

- Workout date and time
- Selected gym
- Day type (Push/Pull/Legs)
- Exercises performed
- Sets with weight and reps

## Usage Flow

1. **Start Workout** - From home screen
2. **Select Gym** - Choose your location
3. **Select Day Type** - Push, Pull, or Legs
4. **Log Exercises** - Tap an exercise to log sets
5. **Enter Sets** - Input weight and reps, or use "Skip" to copy previous set
6. **Complete Exercise** - Move back to exercise list
7. **End Workout** - Save all exercises and return home

## License

MIT
