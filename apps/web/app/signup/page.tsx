'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
// Prefer your centralized API wrapper so token refresh & headers are unified
// If you don't have it yet, switch to using AuthApi directly from your SDK.
import { apis } from '@/lib/api' // expects apis.auth.signup (or authSignupPost) in your wrapper

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // very light client-side guard
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    try {
      // If you kept generator default names (no operationId): authSignupPost
      // and useSingleRequestParameter=true -> body name becomes `signupIn`
      // Adjust to match your generated method if you've set operationId.
      const tokens = await (apis as any).auth.authSignupPost({
        signupIn: {
          email,
          password,
          display_name: displayName || undefined,
        },
      })

      // Persist tokens (align with your api.ts behavior)
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', tokens.access_token)
        localStorage.setItem('refresh_token', tokens.refresh_token)
      }

      router.replace('/events')
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      if (status === 409) setError('This email is already taken.')
      else if (status === 400) setError('Invalid input. Please check your data.')
      else setError(err?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl shadow-lg p-6 bg-white/5 border border-white/10">
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-sm text-neutral-400 mb-6">Join local sports meetups near you.</p>

        {error && (
          <div className="mb-4 rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Display name (optional)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jordan Lee"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 font-medium"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="text-xs text-neutral-400 mt-4">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
