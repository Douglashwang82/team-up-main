'use client';

import { useState, useEffect } from 'react';
import { apis } from '@/lib/api';
import { NotificationOut } from '@team-up-main/api-client';
import { format } from 'date-fns';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<NotificationOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/login');
    }
  }, [user, router]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await apis.notifications.listNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id: string, currentStatus: boolean | undefined) => {
    if (currentStatus) return; // Already read
    
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      await apis.notifications.markNotificationAsRead({ notificationId: id });
    } catch (err) {
      console.error('Failed to mark as read', err);
      // Revert on failure
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      // Note: Actual API for mark all read might not exist, 
      // looping for demo if no bulk endpoint, but ideal is a bulk endpoint.
      // For now we'll just loop the unread ones in parallel (not recommended for large sets, but ok for demo)
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => apis.notifications.markNotificationAsRead({ notificationId: n.id })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
      fetchNotifications();
    }
  };

  if (!user) return null; // Avoid flicker while redirecting

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Bell className="w-8 h-8 mr-3 text-blue-600" />
          通知中心
        </h1>
        
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-lg"
          >
            全部標記為已讀
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">目前沒有通知</h3>
            <p className="text-gray-500">當您的 TeamUp 活動或預約有最新狀態時，會在此處顯示。</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 transition-colors flex gap-4 ${notification.isRead ? 'bg-white' : 'bg-blue-50/30'}`}
              >
                <div className="mt-1 flex-shrink-0">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${notification.isRead ? 'bg-transparent' : 'bg-blue-600'}`}></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-base font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.message}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                      {format(new Date(notification.createdAt), 'yyyy/MM/dd HH:mm')}
                    </span>
                  </div>
                </div>

                {!notification.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0 self-center"
                    title="標記為已讀"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
