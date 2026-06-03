import { createContext, useContext, useState, useCallback, useEffect, type ReactNode, type SetStateAction, type Dispatch } from 'react';
import type { Ride, DriverLocation, UserRole, AuthUser, RegisterData } from '../types';
import { rideSocket, geoSocket } from '../services/socket';
import {
  api,
  setToken as saveToken,
  getToken as loadToken,
  removeToken as clearToken,
  setStoredUser,
  removeStoredUser,
  setUnauthorizedHandler,
} from '../services/api';

function mapRole(authRole: string): UserRole {
  if (authRole === 'admin') return 'admin';
  return authRole === 'driver' ? 'driver' : 'passenger';
}

interface AppState {
  userId: string;
  role: UserRole | null;
  isConnected: boolean;
  activeRide: Ride | null;
  nearbyDrivers: DriverLocation[];
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AppContextType extends AppState {
  setUserId: (id: string) => void;
  setRole: (role: UserRole | null) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  setActiveRide: Dispatch<SetStateAction<Ride | null>>;
  setNearbyDrivers: (drivers: DriverLocation[]) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState('');
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<DriverLocation[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const setUserId = useCallback((id: string) => setUserIdState(id), []);
  const setRole = useCallback((r: UserRole | null) => setRoleState(r), []);

  const connectSocket = useCallback(() => {
    if (!userId || !role) return;
    const sock = rideSocket.connect(userId, role);
    const geoSock = geoSocket.connect(userId, role);
    if (sock || geoSock) {
      setIsConnected(true);
    }
  }, [userId, role]);

  const disconnectSocket = useCallback(() => {
    rideSocket.disconnect();
    geoSocket.disconnect();
    setIsConnected(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    saveToken(res.accessToken);
    setStoredUser(res.user);
    setUser(res.user);
    setUserIdState(res.user.userId);
    setRoleState(mapRole(res.user.role));
  }, []);

  const registerCb = useCallback(async (data: RegisterData) => {
    await api.auth.register(data);
    await login(data.email, data.password);
  }, [login]);

  const logout = useCallback(() => {
    disconnectSocket();
    clearToken();
    removeStoredUser();
    setUser(null);
    setUserIdState('');
    setRoleState(null);
    setActiveRide(null);
    setNearbyDrivers([]);
  }, [disconnectSocket]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(() => {});
  }, [logout]);

  // Auto-login on mount if token exists
  useEffect(() => {
    const savedToken = loadToken();
    if (savedToken) {
      api.auth.getProfile()
        .then((userData) => {
          setStoredUser(userData);
          setUser(userData);
          setUserIdState(userData.userId);
          setRoleState(mapRole(userData.role));
        })
        .catch(() => {
          clearToken();
          removeStoredUser();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Auto-connect socket when userId and role are set
  useEffect(() => {
    if (userId && role && !isConnected) {
      connectSocket();
    }
  }, [userId, role, isConnected, connectSocket]);

  return (
    <AppContext.Provider
      value={{
        userId,
        role,
        isConnected,
        activeRide,
        nearbyDrivers,
        user,
        isAuthenticated,
        isLoading,
        setUserId,
        setRole,
        connectSocket,
        disconnectSocket,
        setActiveRide,
        setNearbyDrivers,
        login,
        register: registerCb,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
