import { Car } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
          <Car className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-1">{title}</h1>
        <p className="text-primary-200 text-center mb-8 text-sm">{subtitle}</p>

        {children}

        {footer}
      </div>

      <div className="p-6 text-center">
        <p className="text-primary-300 text-xs">
          Al continuar aceptas los términos y condiciones del servicio
        </p>
      </div>
    </div>
  );
}
