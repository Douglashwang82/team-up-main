'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { apis } from '@/lib/api';
import { useToast } from '@/lib/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import { EventCreateInVisibilityEnum, EventCreateInDurationTypeEnum } from '@team-up-main/api-client';

export default function CreateEventPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxParticipants: 10,
    visibility: EventCreateInVisibilityEnum.public,
    durationType: EventCreateInDurationTypeEnum.temporary,
  });

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">需要登入</h1>
        <p className="text-gray-600 mb-8">請先登入以發起新的 TeamUp 活動。</p>
        <button
          onClick={() => router.push('/login')}
          className="inline-flex px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          登入
        </button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const created = await apis.events.createEvent({
        eventCreateIn: {
          title: formData.title,
          description: formData.description,
          maxParticipants: formData.maxParticipants,
          visibility: formData.visibility,
          durationType: formData.durationType,
        },
      });
      showToast('TeamUp 活動已成功發起！', 'success');
      router.push(`/teamups/${created.id}`);
    } catch (error: any) {
      console.error('Failed to create event:', error);
      showToast(error?.message || '無法發起活動', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">發起 TeamUp</h1>
          <p className="text-gray-600">召集當地運動好手，一起開始比賽。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              活動標題
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如：週末籃球賽"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              描述（選填）
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="告訴其他人活動內容、規則、技術等級等..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                最高參與人數
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                min="2"
                max="50"
                required
                value={formData.maxParticipants}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                公開範圍
              </label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value={EventCreateInVisibilityEnum.public}>公開（所有人可見）</option>
                <option value={EventCreateInVisibilityEnum.private}>私人（僅限受邀者）</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="durationType" className="block text-sm font-medium text-gray-700 mb-1">
              持續類型
            </label>
            <select
              id="durationType"
              name="durationType"
              value={formData.durationType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value={EventCreateInDurationTypeEnum.temporary}>臨時比賽（單次）</option>
              <option value={EventCreateInDurationTypeEnum.permanent}>長期團隊（持續性質）</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">
              臨時比賽於單次課程後結束。長期團隊則允許持續參與。
            </p>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? '正在發起...' : '發起 TeamUp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
