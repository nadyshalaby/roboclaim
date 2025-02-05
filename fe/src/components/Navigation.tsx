"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Navigation() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuth();

  const isActive = (path: string) => pathname === path;

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

          <div className="flex items-center space-x-4">
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
                <button
                  onClick={() => {
                    clearAuth();
                    window.location.href = '/login';
                  }}
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
