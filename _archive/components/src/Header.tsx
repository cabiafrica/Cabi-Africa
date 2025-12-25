'use client';

import Link from 'next/link';

// Mock auth state - in a real app, this would be a hook like useAuth()
const useAuth = () => ({
  isAuthenticated: true, // Set to true to simulate a logged-in user
});

export default function Header() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Cabi
            </Link>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}