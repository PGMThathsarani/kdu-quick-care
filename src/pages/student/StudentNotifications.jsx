import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Clock, User, MessageCircle } from 'lucide-react';

export default function DoctorNotifications({studentId}) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('studentId', '==', studentId),
      where('type', '==', 'student-notify')
    );
    console.log("Fetching notifications for studentId:", studentId);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(fetchedNotifications);
      console.log("Fetched notifications:", fetchedNotifications);
    }, (error) => {
      console.error('Error fetching notifications:', error);
    });

    return () => unsubscribe();
  }, [studentId]);

  function formatDate(timestamp) {
    if (!timestamp) return '';
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return String(timestamp);
  }

  return (
    <div className="flex flex-col h-full">
      {notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">No new notifications</p>
          <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className="p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="flex gap-3">
                <Avatar className="h-11 w-11 border-2 border-gray-100 flex-shrink-0">
                  <AvatarImage 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(notification.studentName || 'Student')}`}
                    alt="Student Avatar"
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-700">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {notification.studentName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      <span className="whitespace-nowrap">{formatDate(notification.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1.5">
                    <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}