import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

// Custom storage adapter for cookies
const cookieStorage = {
  getItem: (name: string) => {
    const value = Cookies.get(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: (name: string, value: any) => {
    // Set cookie with path=/ to make it available for the middleware
    Cookies.set(name, JSON.stringify(value), { path: '/' });
  },
  removeItem: (name: string) => {
    Cookies.remove(name, { path: '/' });
  },
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);
