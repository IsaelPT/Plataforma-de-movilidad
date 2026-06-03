import type { AuthUser } from '../types';

interface JwtPayload {
  sub?: string;
  userId?: string;
  email?: string;
  role?: string;
}

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function normalizeUserId(userId: unknown): string {
  if (typeof userId === 'string') return userId;
  if (userId && typeof userId === 'object' && '$oid' in userId) {
    return String((userId as { $oid: string }).$oid);
  }
  return String(userId ?? '');
}

export function normalizeAuthUser(
  data: Partial<AuthUser> & { profile?: AuthUser['profile']; role?: string },
  token?: string | null,
): AuthUser {
  const payload = token ? parseJwtPayload(token) : null;
  const userId = normalizeUserId(data.userId ?? payload?.userId ?? payload?.sub);

  return {
    userId,
    email: data.email ?? payload?.email ?? '',
    role: (data.role ?? payload?.role ?? 'client') as AuthUser['role'],
    profile: data.profile ?? {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      photoUrl: '',
    },
    isVerified: data.isVerified ?? false,
  };
}

export function extractErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };

  const message = axiosErr?.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string') return message;
  return axiosErr?.message || 'Error al procesar la solicitud';
}
