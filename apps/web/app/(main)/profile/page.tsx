'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, isLoading, router]);

  function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
    }
  }

  if (isLoading || !user) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-12 text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <Link
          href="/profile/edit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-3xl">
              {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {user.display_name || 'Anonymous User'}
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              User ID
            </label>
            <p className="text-gray-900 font-mono text-sm">{user.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Email Address
            </label>
            <p className="text-gray-900">{user.email}</p>
          </div>

          {user.display_name && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Display Name
              </label>
              <p className="text-gray-900">{user.display_name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/teamups/my"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">My TeamUps</p>
                <p className="text-sm text-gray-500">View your TeamUps</p>
              </div>
            </div>
          </Link>

          <Link
            href="/bookings"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">My Bookings</p>
                <p className="text-sm text-gray-500">View your bookings</p>
              </div>
            </div>
          </Link>

          <Link
            href="/teamups/new"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Create TeamUp</p>
                <p className="text-sm text-gray-500">Start a new activity</p>
              </div>
            </div>
          </Link>

          <Link
            href="/venues"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Find Venues</p>
                <p className="text-sm text-gray-500">Search for places</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
