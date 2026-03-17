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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number>(10);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [durationType, setDurationType] = useState<'temporary' | 'permanent'>('temporary');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/teamups/new');
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
        description: description.trim() || null,
        maxParticipants,
        visibility,
        durationType,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600">正在檢查身分驗證...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">發起新的 TeamUp</h1>
          <p className="text-lg text-gray-600">
            組織一項運動活動，並邀請其他人加入您的團隊。
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 flex-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">基本資訊</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  標題 <span className="text-red-600">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：週末籃球賽"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="告訴大家這個 TeamUp 的內容，以及何時何地舉行..."
                  rows={5}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-all"
                />
                <p className="text-sm text-gray-500 mt-2">選填，但建議填寫以提高參與率</p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">TeamUp 設定</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-semibold text-gray-700 mb-2">
                  最高參與人數 <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="maxParticipants"
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    min={2}
                    max={100}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  最高參與人數（2-100 人，包含您這位發起人）
                </p>
              </div>

              <div>
                <label htmlFor="visibility" className="block text-sm font-semibold text-gray-700 mb-2">
                  公開範圍
                </label>
                <select
                  id="visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="public">🌍 公開 - 任何人都能看見並申請加入</option>
                  <option value="private">🔒 私人 - 僅限受邀使用者看見</option>
                </select>
              </div>

              <div>
                <label htmlFor="durationType" className="block text-sm font-semibold text-gray-700 mb-2">
                  活動類型
                </label>
                <select
                  id="durationType"
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value as 'temporary' | 'permanent')}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="temporary">📅 臨時 - 單次活動</option>
                  <option value="permanent">🔄 長期 - 持續性活動</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  {durationType === 'permanent'
                    ? '適合持續性的活動或長期項目'
                    : '適合特殊事件或單次活動'}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-semibold transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在發起 TeamUp...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  發起 TeamUp
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
