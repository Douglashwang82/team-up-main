'use client';

import { useState, useEffect } from 'react';
import { apis } from '@/lib/api';
import { EventOut, ListEventsStatusEnum } from '@team-up-main/api-client';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

export default function TeamUpsPage() {
  const [events, setEvents] = useState<EventOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<ListEventsStatusEnum>(ListEventsStatusEnum.open);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apis.events.listEvents({
        status,
        keyword: keyword || undefined,
        limit: 50,
      });
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError('載入活動失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">探索 TeamUp 活動</h1>
          <p className="text-gray-600 mt-2">尋找您的下一場比賽，與當地的運動員交流。</p>
        </div>
        <Link
          href="/teamups/create"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors w-full md:w-auto"
        >
          發起活動
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="搜尋關鍵字、運動項目或地點..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          
          <div className="sm:w-48">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={status}
              onChange={(e) => setStatus(e.target.value as ListEventsStatusEnum)}
            >
              <option value={ListEventsStatusEnum.open}>招募中</option>
              <option value={ListEventsStatusEnum.closed}>已結束</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            搜尋
          </button>
        </form>
      </div>

      {/* Content */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">查無活動</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            找不到符合條件的活動。請嘗試調整篩選條件，或由您發起第一個活動！
          </p>
          <button
            onClick={() => { setKeyword(''); setStatus(ListEventsStatusEnum.open); }}
            className="mt-6 text-blue-600 font-medium hover:text-blue-700"
          >
            清除篩選
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/teamups/${event.id}`}>
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group h-full flex flex-col cursor-pointer">
                {/* Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors duration-300"></div>
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === 'open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status === 'open' ? '招募中' : '已結束'}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {event.description || '未提供活動描述。'}
                  </p>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{format(new Date(event.createdAt), 'yyyy/MM/dd HH:mm')}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>已加入 {event.currentParticipants} / 上限 {event.maxParticipants} 人</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
