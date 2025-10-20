'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, displayName || undefined);
    } catch (err: any) {
      const message = err?.message || '';
      if (message.includes('409') || message.toLowerCase().includes('exists')) {
        setError('This email is already registered.');
      } else if (message.includes('400')) {
        setError('Invalid input. Please check your data.');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl shadow-lg p-8 bg-white border border-gray-200">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Create your account</h1>
      <p className="text-sm text-gray-600 mb-6">Join local sports meetups near you</p>

      {error && (
        <div className="mb-4 rounded-md border border-red-400 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
            minLength={6}
            required
          />
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium mb-1 text-gray-700">
            Display name (optional)
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jordan Lee"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 font-semibold text-white transition-colors"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-6 text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>

      <p className="text-xs text-gray-500 mt-4 text-center">
        By signing up you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
