import { AlertCircle } from 'lucide-react';

export default function AuthErrorAlert({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-red-500/20 backdrop-blur rounded-xl px-4 py-3 flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-red-200 shrink-0 mt-0.5" />
      <div className="text-sm text-red-100">
        {errors.map((error, index) => (
          <p key={index}>{error}</p>
        ))}
      </div>
    </div>
  );
}
