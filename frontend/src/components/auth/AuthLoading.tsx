import { Car } from 'lucide-react';

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
        <Car className="w-8 h-8 text-white" />
      </div>
      <span className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
