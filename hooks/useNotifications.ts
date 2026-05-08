import { useState, useEffect } from "react";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = window.localStorage.getItem("slpm:token");
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = window.localStorage.getItem("slpm:token");
      if (!token) return;

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Short polling every 10 seconds
    const intervalId = setInterval(fetchNotifications, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return { notifications, unreadCount, markAsRead, refresh: fetchNotifications };
}
