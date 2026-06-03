import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthErrorAlert from '../components/auth/AuthErrorAlert';
import AuthLoading from '../components/auth/AuthLoading';
import { extractErrorMessage } from '../utils/auth';

export default function Register() {
  const { isAuthenticated, isLoading, register } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState<'client' | 'driver'>('client');

  if (isLoading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors: string[] = [];
    if (!email.trim()) validationErrors.push('El correo electrónico es requerido');
    if (!password) validationErrors.push('La contraseña es requerida');
    if (password.length < 8) validationErrors.push('La contraseña debe tener al menos 8 caracteres');
    if (password !== confirmPassword) validationErrors.push('Las contraseñas no coinciden');
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await register({ email, password, role: userType, firstName, lastName, phoneNumber });
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
      subtitle="Crea una cuenta para comenzar"
      footer={
        <p className="mt-6 text-sm text-primary-200">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="text-white font-medium underline underline-offset-2 hover:text-primary-100"
          >
            Inicia sesión
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        <AuthErrorAlert errors={errors} />

        <div className="bg-white/10 backdrop-blur rounded-2xl p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setUserType('client')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all text-sm ${
                userType === 'client'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Pasajero
            </button>
            <button
              type="button"
              onClick={() => setUserType('driver')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all text-sm ${
                userType === 'driver'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" />
              Conductor
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="tel"
            placeholder="Teléfono"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            autoComplete="tel"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
          />
        </div>

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
            autoComplete="new-password"
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

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
          />
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
              Crear cuenta
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
