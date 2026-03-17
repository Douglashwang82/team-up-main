'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { apis } from '@/lib/api';
import { useToast } from '@/lib/contexts/ToastContext';
import { UserOut } from '@team-up-main/api-client';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if user loads after mount
  if (user && displayName === '' && user.displayName) {
    setDisplayName(user.displayName);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">請登入以查看您的個人資料。</p>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await apis.user.updateUserInfo({ updateUserInfoRequest: { displayName } });
      showToast('個人資料已更新', 'success');
      // Force reload to update context or optimistically update
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showToast(error?.message || '無法更新個人資料', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 sm:p-10 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.displayName || '運動愛好者'}
              </h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-8 sm:p-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">個人資料設定</h2>
          
          <form onSubmit={handleSave} className="max-w-xl space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件地址
              </label>
              <input
                type="email"
                id="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-400">電子郵件地址無法更改。</p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                顯示名稱
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="請輸入您的顯示名稱"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
              <p className="mt-2 text-xs text-gray-500">這是其他玩家在 TeamUps 中會看到的名稱。</p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving || displayName === user.displayName}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 font-medium text-white transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    儲存中...
                  </>
                ) : (
                  '儲存變更'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
