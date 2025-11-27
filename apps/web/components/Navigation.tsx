'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import NotificationCenter from './NotificationCenter';

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const navLinks = [
    { href: '/teamups', label: 'TeamUps' },
    { href: '/venues', label: 'Venues' },
    { href: '/events', label: 'Events' },
    { href: '/tickets', label: 'Tickets' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TeamUp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive(link.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user && <NotificationCenter />}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <Link
                        href="/teamups/my"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My TeamUps
                      </Link>
                      <Link
                        href="/user/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/bookings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Bookings
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-lg font-medium transition-colors ${isActive(link.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
