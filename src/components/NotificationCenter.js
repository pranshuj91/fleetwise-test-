import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Bell, X, Check, Clock, AlertTriangle, FileText, 
  DollarSign, Wrench, Calendar, TrendingUp
} from 'lucide-react';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'work_order',
      title: 'New Work Order Created',
      message: 'WO-2025-001 has been created for Unit 123',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      read: false,
      action: '/projects/1',
      icon: FileText,
      color: 'blue'
    },
    {
      id: '2',
      type: 'estimate',
      title: 'Estimate Approved',
      message: 'EST-00001 approved by ABC Logistics',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      action: '/estimates/1',
      icon: DollarSign,
      color: 'green'
    },
    {
      id: '3',
      type: 'pm',
      title: 'PM Due Soon',
      message: 'Unit 456 PM service due in 3 days',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: false,
      action: '/pm/dashboard',
      icon: Calendar,
      color: 'yellow'
    },
    {
      id: '4',
      type: 'alert',
      title: 'Low Stock Alert',
      message: 'Oil Filter XYZ123 below minimum stock',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: true,
      action: '/parts',
      icon: AlertTriangle,
      color: 'red'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.action) {
      navigate(notification.action);
      setIsOpen(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative text-white hover:bg-[#1E7083]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl border-2 border-[#124481] z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#124481] to-[#1E7083] text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-white/90 hover:text-white underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => {
                  const Icon = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getColorClasses(notification.color)} flex items-center justify-center`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-semibold text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-6 px-2 text-gray-400 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-3 bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
            >
              View All Notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
