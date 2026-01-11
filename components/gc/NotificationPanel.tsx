import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Trash2,
  CheckCheck,
  Wrench,
  Target,
  CheckSquare,
  Settings,
} from 'lucide-react';
import {
  useNotifications,
  Notification,
  NotificationType,
} from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } =
    useNotifications();
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'tool':
        return <Wrench className="w-3 h-3" />;
      case 'campaign':
        return <Target className="w-3 h-3" />;
      case 'onboarding':
        return <CheckSquare className="w-3 h-3" />;
      default:
        return <Settings className="w-3 h-3" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className={`absolute right-0 top-full mt-2 w-80 md:w-96 rounded-xl shadow-xl border z-50 overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between ${
            isDarkMode ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bell className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-slate-800 text-slate-400'
                      : 'hover:bg-slate-100 text-slate-500'
                  }`}
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAll}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-slate-800 text-slate-400'
                      : 'hover:bg-slate-100 text-slate-500'
                  }`}
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode
                  ? 'hover:bg-slate-800 text-slate-400'
                  : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell
                className={`w-10 h-10 mx-auto mb-3 ${
                  isDarkMode ? 'text-slate-600' : 'text-slate-300'
                }`}
              />
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b last:border-b-0 transition-colors ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-100'
                } ${!notification.read ? (isDarkMode ? 'bg-slate-800/50' : 'bg-blue-50/50') : ''}`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <button
                        onClick={() => clearNotification(notification.id)}
                        className={`flex-shrink-0 p-1 rounded transition-colors ${
                          isDarkMode
                            ? 'hover:bg-slate-700 text-slate-500'
                            : 'hover:bg-slate-200 text-slate-400'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p
                      className={`text-sm mt-0.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {getCategoryIcon(notification.category)}
                        <span className="capitalize">{notification.category}</span>
                      </div>
                      <span
                        className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}
                      >
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      {notification.link && (
                        <Link
                          to={notification.link}
                          onClick={() => {
                            markAsRead(notification.id);
                            onClose();
                          }}
                          className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
