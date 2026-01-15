import type { Gym } from '../types';

interface Props {
  onSelect: (gym: Gym) => void;
}

const gyms: Gym[] = ['CU', '24PB', '24LJ'];

export default function GymSelection({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Select Gym</h1>
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        {gyms.map((gym) => (
          <button
            key={gym}
            onClick={() => onSelect(gym)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-6 px-8 rounded-xl text-2xl transition-colors touch-manipulation"
          >
            {gym}
          </button>
        ))}
      </div>
    </div>
  );
}
