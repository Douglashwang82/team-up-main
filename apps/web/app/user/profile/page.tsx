'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apis } from '@/lib/api' // expects apis.auth.me(), or switch to raw fetch below

/**
 * User Profile Page (sketch)
 * - Loads current user (me)
 * - Shows basic info
 * - Edit display name (optimistic UI)
 * - Logout
 *
 * NOTE: If your SDK does not yet expose `apis.auth.me()`, uncomment the raw fetch fallback.
 */

export default function UserProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; email: string; display_name?: string | null } | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)

  const accessToken = useMemo(() => (typeof window === 'undefined' ? '' : localStorage.getItem('access_token') || ''), [])

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setError(null)
      try {

        const me: any = await apis.auth.getMe();

        if (!alive) return
        setUser(me)
        setDisplayName(me?.display_name ?? '')
      } catch (e: any) {
        if (!alive) return
        if ((e?.status ?? e?.response?.status) === 401) {
          // Not logged in → go login
          router.replace('/login')
          return
        }
        setError(e?.message || 'Failed to load profile')
      } finally {
        if (alive) setLoading(false)
      }
    }
    // Guard: if no token, redirect to login early
    if (!accessToken) {
      router.replace('/login')
      return
    }
    load()
    return () => {
      alive = false
    }
  }, [router, accessToken])

  async function onSave() {
    console.log('Saving updated display name:', displayName)
    console.log('user object before save:', user)
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      // --- Preferred: implement/attach a proper endpoint in your spec, e.g. PATCH /users/me ---
      // Example with SDK once available: await apis.users.updateMe({ updateUserIn: { display_name: displayName } })

      // Temporary fallback (raw fetch):
      const updatedMe = await apis.auth.updateMe({
        updateMeRequest: {
          display_name: displayName || null,
        },
      })

      console.log('Updated user profile:', updatedMe)
      setUser(updatedMe)
    } catch (e: any) {
      setError(e?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  function onLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-neutral-400">Loading profile…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] grid place-items-center p-6">
        <div className="max-w-md w-full rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="font-medium mb-1">Profile error</div>
          <div className="text-sm text-red-200/90">{error}</div>
          <button onClick={() => router.refresh()} className="mt-3 rounded-lg bg-neutral-800 px-3 py-1 text-sm">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-1">Your profile</h1>
      <p className="text-sm text-neutral-400 mb-6">Update your basic account information.</p>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        {/* Left card: avatar & meta */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="size-24 rounded-full bg-neutral-800 grid place-items-center text-neutral-400 mb-3">
            {user?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="font-medium">{user?.display_name || 'Unnamed user'}</div>
          <div className="text-sm text-neutral-400 break-all">{user?.email}</div>

          <button onClick={onLogout} className="mt-4 w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm">
            Log out
          </button>
        </div>

        {/* Right card: editable fields */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4">
            <label className="block text-sm mb-1">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jordan Lee"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 text-sm font-medium"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              onClick={() => setDisplayName(user?.display_name || '')}
              className="rounded-xl bg-neutral-800 px-4 py-2 text-sm"
            >
              Reset
            </button>
          </div>

          <p className="text-xs text-neutral-400 mt-4">More settings coming soon (password, avatar, sport preferences).</p>
        </div>
      </div>
    </div>
  )
}
