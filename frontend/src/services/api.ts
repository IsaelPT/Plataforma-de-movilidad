import axios from 'axios';
import type {
  Ride,
  Driver,
  DriverLocation,
  ScheduledRide,
  CancellationReason,
  TrustedContact,
  SosAlert,
  RouteInfo,
  LatLng,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  AuthUser,
} from '../types';
import { normalizeAuthUser } from '../utils/auth';

const http = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'mobility_token';
const USER_KEY = 'mobility_user';

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser() {
  localStorage.removeItem(USER_KEY);
}

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export const api = {
  auth: {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      const { data } = await http.post('/auth/login', credentials);
      const user = normalizeAuthUser(data.user, data.accessToken);
      return { accessToken: data.accessToken, user };
    },

    register(data: RegisterData): Promise<{ message: string; user: { userId: string; email: string; role: string } }> {
      return http.post('/auth/register', data).then((r) => r.data);
    },

    async getProfile(): Promise<AuthUser> {
      const token = getToken();
      const storedUser = getStoredUser();
      const { data } = await http.get('/users/profile');
      return normalizeAuthUser(
        {
          userId: storedUser?.userId,
          email: storedUser?.email,
          role: data.role,
          profile: data.profile,
          isVerified: storedUser?.isVerified,
        },
        token,
      );
    },
  },

  rides: {
    request(data: {
      passengerId: string;
      originLat: number;
      originLng: number;
      destinationLat: number;
      destinationLng: number;
      originAddress?: string;
      destinationAddress?: string;
    }): Promise<Ride> {
      return http.post('/rides/request', data).then((r) => r.data);
    },

    getById(id: string): Promise<Ride> {
      return http.get(`/rides/${id}`).then((r) => r.data);
    },

    updateStatus(id: string, status: string): Promise<Ride> {
      return http.patch(`/rides/${id}/status`, { rideId: id, status }).then((r) => r.data);
    },

    cancel(
      id: string,
      data: { userId: string; role: string; reasonCode?: string; notes?: string }
    ): Promise<{ rideId: string; status: string; cancelledBy: string }> {
      return http.post(`/rides/${id}/cancel`, data).then((r) => r.data);
    },

    history(passengerId: string): Promise<Ride[]> {
      return http.get(`/rides/history/${passengerId}`).then((r) => r.data);
    },
  },

  geo: {
    nearbyDrivers(lat: number, lng: number, radius?: number): Promise<DriverLocation[]> {
      return http
        .get('/geo/nearby-drivers', { params: { lat, lng, radius } })
        .then((r) => r.data);
    },
  },

  cancellation: {
    reasons(role?: string): Promise<CancellationReason[]> {
      return http
        .get('/cancellation/reasons', { params: { role } })
        .then((r) => r.data);
    },
  },

  scheduling: {
    create(data: {
      passengerId: string;
      originLat: number;
      originLng: number;
      destinationLat: number;
      destinationLng: number;
      scheduledAt: string;
      originAddress?: string;
      destinationAddress?: string;
    }): Promise<ScheduledRide> {
      return http.post('/rides/scheduled', data).then((r) => r.data);
    },
  },

  sos: {
    listContacts(passengerId: string): Promise<TrustedContact[]> {
      return http.get('/contacts', { params: { passengerId } }).then((r) => r.data);
    },

    addContact(data: {
      passengerId: string;
      name: string;
      phone: string;
    }): Promise<TrustedContact> {
      return http.post('/contacts', data).then((r) => r.data);
    },

    deleteContact(id: string): Promise<{ success: boolean }> {
      return http.delete(`/contacts/${id}`).then((r) => r.data);
    },

    trigger(data: {
      rideId: string;
      passengerId: string;
      lat: number;
      lng: number;
    }): Promise<SosAlert> {
      return http.post('/sos/trigger', data).then((r) => r.data);
    },

    listAlerts(status?: string): Promise<SosAlert[]> {
      return http.get('/sos/alerts', { params: { status } }).then((r) => r.data);
    },

    resolveAlert(id: string): Promise<{ success: boolean }> {
      return http.post(`/sos/alerts/${id}/resolve`).then((r) => r.data);
    },
  },

  drivers: {
    register(userId: string): Promise<{ id: string; userId: string; status: string }> {
      return http.post('/drivers/register', { userId }).then((r) => r.data);
    },

    updateStatus(id: string, status: string): Promise<{ success: boolean }> {
      return http.patch(`/drivers/${id}/status`, { status }).then((r) => r.data);
    },

    findByUserId(userId: string): Promise<{ id: string; userId: string; status: string } | null> {
      return http.get(`/drivers/by-user/${userId}`).then((r) => r.data);
    },
  },

  health(): Promise<unknown> {
    return http.get('/health').then((r) => r.data);
  },
};
