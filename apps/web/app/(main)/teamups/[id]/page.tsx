'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apis } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/lib/contexts/ToastContext';
import { EventDetailOut, JoinRequestOut } from '@team-up-main/api-client';
import { MapPin, Users, Calendar, Clock, Shield, Flag, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function TeamUpDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [event, setEvent] = useState<EventDetailOut | null>(null);
  const [requests, setRequests] = useState<JoinRequestOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');

  const isOwner = user?.id === event?.ownerUserId;

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      const data = await apis.events.getEventById({ eventId: id });
      setEvent(data);
      
      // If owner, fetch join requests too
      if (user?.id === data.ownerUserId) {
        const reqs = await apis.events.listJoinRequests({ eventId: id });
        setRequests(reqs);
      }
    } catch (err) {
      console.error('Failed to fetch event details', err);
      setError('載入活動詳情失敗。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id, user?.id]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setIsJoining(true);
    try {
      await apis.events.joinEvent({
        eventId: id,
        joinRequestCreateIn: { message: joinMessage },
      });
      showToast('入隊申請已成功發送！', 'success');
      setJoinMessage('');
      fetchDetails();
    } catch (err: any) {
      console.error('Failed to join:', err);
      showToast(err?.message || '發送申請失敗', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const handleReviewRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await apis.events.reviewJoinRequest({
        eventId: id,
        requestId,
        joinRequestReviewIn: { action },
      });
      const actionText = action === 'approve' ? '通過' : '駁回';
      showToast(`申請已${actionText}。`, 'success');
      fetchDetails();
    } catch (err: any) {
      const actionText = action === 'approve' ? '通過' : '駁回';
      console.error(`Failed to ${action} request:`, err);
      showToast(`無法${actionText}申請`, 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {error || '找不到活動'}
        </div>
      </div>
    );
  }

  const hasJoined = event.participants?.some((p) => p.userId === user?.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {event.title}
              </h1>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${
                event.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {event.status === 'open' ? '招募中' : '已結束'}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8">
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                <span className="capitalize">{event.visibility === 'public' ? '公開' : '私密'}活動</span>
              </div>
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <Flag className="w-4 h-4 mr-2 text-indigo-500" />
                <span className="capitalize">{event.durationType === 'temporary' ? '單次' : '定期'}比賽</span>
              </div>
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 mr-2 text-purple-500" />
                <span>建立於 {format(new Date(event.createdAt), 'yyyy/MM/dd')}</span>
              </div>
            </div>

            <div className="prose prose-blue max-w-none text-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">活動說明</h3>
              <p className="whitespace-pre-wrap leading-relaxed">
                {event.description || '此活動目前沒有內容描述。'}
              </p>
            </div>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-5 h-5 mr-3 text-blue-600" />
                入隊申請 ({requests.filter(r => r.status === 'submitted').length})
              </h3>
              
              <div className="space-y-4">
                {requests.filter(r => r.status === 'submitted').length === 0 ? (
                  <p className="text-gray-500 text-sm italic">目前沒有待處理的申請。</p>
                ) : (
                  requests.filter(r => r.status === 'submitted').map(req => (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{req.applicantName || req.applicantUserId}</p>
                        {req.message && (
                          <p className="text-sm text-gray-600 mt-1">"{req.message}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          申請於 {format(new Date(req.createdAt), 'yyyy/MM/dd HH:mm')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleReviewRequest(req.id, 'approve')}
                          className="flex items-center px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> 通過
                        </button>
                        <button 
                          onClick={() => handleReviewRequest(req.id, 'reject')}
                          className="flex items-center px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> 駁回
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Join Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">參與人數</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                <span className="font-medium text-lg">
                  {event.currentParticipants}
                  <span className="text-gray-400 mx-1">/</span>
                  {event.maxParticipants}
                </span>
                <span className="ml-2 text-sm text-gray-500">人</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-8 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all" 
                style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
              ></div>
            </div>

            {!isOwner && !hasJoined && event.status === 'open' && (
              <form onSubmit={handleJoin} className="mt-6 border-t border-gray-100 pt-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  發送訊息給發起人（選填）
                </label>
                <textarea
                  id="message"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm mb-4"
                  rows={3}
                  placeholder="嗨！我想加入..."
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isJoining}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isJoining ? '正在發送申請...' : '申請加入'}
                </button>
              </form>
            )}

            {hasJoined && !isOwner && (
              <div className="mt-6 bg-green-50 text-green-800 p-4 rounded-xl flex items-center justify-center text-sm font-medium border border-green-200">
                <CheckCircle className="w-5 h-5 mr-2" />
                您已成功加入！準備好上場吧。
              </div>
            )}
            
            {event.status === 'closed' && !hasJoined && !isOwner && (
              <div className="mt-6 bg-gray-50 text-gray-600 p-4 rounded-xl text-center text-sm font-medium border border-gray-200">
                此活動已額滿或已截止。
              </div>
            )}
          </div>

          {/* Bookings abstract */}
          {event.bookings && event.bookings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-4">
                <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                場地預約資訊
              </h3>
              <div className="space-y-4">
                {event.bookings.map(b => (
                  <div key={b.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="font-medium text-gray-900 mb-1">{b.venue.name}</p>
                    <p className="text-sm text-gray-600 mb-3">{b.court.name} • {b.court.sportType}</p>
                    <div className="flex items-center text-sm font-medium text-indigo-600 bg-indigo-50 w-fit px-3 py-1.5 rounded-lg">
                      <Clock className="w-4 h-4 mr-2" />
                      {format(new Date(b.timeSlot.startsAt), 'h:mm a')} - {format(new Date(b.timeSlot.endsAt), 'h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
