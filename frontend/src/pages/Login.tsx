import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthErrorAlert from '../components/auth/AuthErrorAlert';
import AuthLoading from '../components/auth/AuthLoading';
import { extractErrorMessage } from '../utils/auth';

export default function Login() {
  const { isAuthenticated, isLoading, login } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isLoading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors: string[] = [];
    if (!email.trim()) validationErrors.push('El correo electrónico es requerido');
    if (!password) validationErrors.push('La contraseña es requerida');
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors([extractErrorMessage(err)]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Plataforma de Movilidad"
      subtitle="Inicia sesión para continuar"
      footer={
        <p className="mt-6 text-sm text-primary-200">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="text-white font-medium underline underline-offset-2 hover:text-primary-100"
          >
            Regístrate
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        <AuthErrorAlert errors={errors} />

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-white text-primary-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="w-5 h-5 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
