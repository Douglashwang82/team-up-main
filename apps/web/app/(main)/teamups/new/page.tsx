'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createTeamUp } from '@/lib/hooks/useTeamUps';

export default function CreateTeamUpPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number>(10);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [durantionType, setDurantionType] = useState<'temporary' | 'recurring'>('temporary');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/teamups/new');
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }

    if (maxParticipants < 2) {
      setError('Maximum participants must be at least 2');
      return;
    }

    setLoading(true);

    try {
      const teamup = await createTeamUp({
        title: title.trim(),
        description: description.trim() || undefined,
        max_participants: maxParticipants,
        visibility,
        durantion_type: durantionType,
      });

      router.push(`/teamups/${teamup.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create TeamUp');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12 text-gray-600">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
        >
          ê Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New TeamUp</h1>
        <p className="text-gray-600 mt-2">
          Organize a sports activity by creating a TeamUp. Set your requirements and invite participants.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-400 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Details</h2>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekend Basketball Game"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your TeamUp activity..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Participants <span className="text-red-600">*</span>
            </label>
            <input
              id="maxParticipants"
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              min={2}
              max={100}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum number of participants allowed (including you as owner)
            </p>
          </div>

          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Anyone can see and request to join</option>
              <option value="private">Private - Only invited users can see</option>
            </select>
          </div>

          <div>
            <label htmlFor="durantionType" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="durantionType"
              value={durantionType}
              onChange={(e) => setDurantionType(e.target.value as 'temporary' | 'recurring')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="temporary">Temporary - One-time event</option>
              <option value="recurring">Recurring - Regular activity</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Creating...' : 'Create TeamUp'}
          </button>
        </div>
      </form>
    </div>
  );
}
