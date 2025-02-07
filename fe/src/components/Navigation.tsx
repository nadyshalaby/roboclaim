"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Cookies from 'js-cookie';

export default function Navigation() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Only enable client-side features after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug log the auth state
  console.log('Navigation auth state:', { user, pathname });

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    clearAuth();
    Cookies.remove('auth-storage', { path: '/' });
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center px-2 py-2 text-gray-900 hover:text-indigo-600"
            >
              <span className="text-xl font-bold">RoboClaim</span>
            </Link>
          </div>

          <div 
            className="flex items-center space-x-4" 
            data-testid="user-menu" 
            {...(isClient ? {
              'data-user-state': user ? 'logged-in' : 'logged-out',
              'data-cy-debug': JSON.stringify({ hasUser: !!user, userEmail: user?.email })
            } : {})}
          >
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/admin')
                        ? 'text-indigo-600'
                        : 'text-gray-600 hover:text-indigo-600'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/profile')
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  data-testid="logout-button"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/login')
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/register')
                      ? 'text-indigo-600'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
