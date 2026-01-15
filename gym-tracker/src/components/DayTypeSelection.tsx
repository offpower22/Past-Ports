import type { DayType } from '../types';

interface Props {
  onSelect: (dayType: DayType) => void;
  onBack: () => void;
}

const dayTypes: DayType[] = ['Push', 'Pull', 'Legs'];

export default function DayTypeSelection({ onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <button
        onClick={onBack}
        className="mb-6 text-blue-400 hover:text-blue-300 text-lg"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-8 text-center">Select Day Type</h1>
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        {dayTypes.map((dayType) => (
          <button
            key={dayType}
            onClick={() => onSelect(dayType)}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-6 px-8 rounded-xl text-2xl transition-colors touch-manipulation"
          >
            {dayType}
          </button>
        ))}
      </div>
    </div>
  );
}
