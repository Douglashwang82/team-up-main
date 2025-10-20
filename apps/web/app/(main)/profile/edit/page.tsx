'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile/edit');
    } else if (user) {
      setDisplayName(user.display_name || '');
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          display_name: displayName.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12 text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => router.push('/profile')}
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ê Back to Profile
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-2">Update your profile information</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-400 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-400 bg-green-50 p-4 text-green-800">
          Profile updated successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              This is how your name will appear to other users
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <p className="text-gray-600 font-mono text-sm">{user.id}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
