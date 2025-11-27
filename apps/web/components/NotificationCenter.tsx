"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { NotificationOut } from "@team-up-main/api-client";
import { useAuth } from "@/lib/hooks/useAuth";
import { apis } from "@/lib/api";

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<NotificationOut[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            try {
                const data = await apis.notifications.listNotifications();
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s

        return () => clearInterval(interval);
    }, [user]);

    const markAsRead = async (id: string) => {
        if (!user) return;
        try {
            await apis.notifications.markNotificationAsRead({ notificationId: id });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                    <div className="py-2">
                        <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                            Notifications
                        </div>
                        {notifications.length === 0 ? (
                            <div className="px-4 py-4 text-sm text-gray-500 text-center">
                                No notifications
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${!notification.isRead ? "bg-blue-50 dark:bg-blue-900/20" : ""
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <p className="text-sm text-gray-800 dark:text-gray-200">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
