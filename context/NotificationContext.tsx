import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ToolAccess, Campaign, OnboardingProgressItem } from '../types/gc-types';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  category: 'tool' | 'campaign' | 'onboarding' | 'system';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  generateToolNotifications: (tools: ToolAccess[]) => void;
  generateCampaignNotifications: (campaigns: Campaign[]) => void;
  generateOnboardingNotifications: (items: OnboardingProgressItem[], totalProgress: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('gc_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((n: Notification) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  // Save to localStorage when notifications change
  useEffect(() => {
    localStorage.setItem('gc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => {
        // Avoid duplicates based on title and message within last hour
        const isDuplicate = prev.some(
          (n) =>
            n.title === newNotification.title &&
            n.message === newNotification.message &&
            Date.now() - new Date(n.timestamp).getTime() < 60 * 60 * 1000
        );

        if (isDuplicate) return prev;

        // Keep only last 50 notifications
        const updated = [newNotification, ...prev].slice(0, 50);
        return updated;
      });
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const generateToolNotifications = useCallback(
    (tools: ToolAccess[]) => {
      tools.forEach((tool) => {
        if (tool.status === 'Issues') {
          addNotification({
            type: 'error',
            title: 'Tool Issue Detected',
            message: `${tool.tool} has an issue that needs attention.`,
            category: 'tool',
            link: '/tools',
          });
        } else if (tool.status === 'Not Set Up') {
          addNotification({
            type: 'warning',
            title: 'Tool Setup Required',
            message: `${tool.tool} hasn't been set up yet.`,
            category: 'tool',
            link: '/tools',
          });
        }
      });
    },
    [addNotification]
  );

  const generateCampaignNotifications = useCallback(
    (campaigns: Campaign[]) => {
      campaigns.forEach((campaign) => {
        if (campaign.status === 'Live') {
          const lastUpdated = campaign.lastUpdatedByMember;
          const isStale = lastUpdated
            ? Date.now() - lastUpdated.getTime() > 7 * 24 * 60 * 60 * 1000
            : true;

          if (isStale) {
            addNotification({
              type: 'warning',
              title: 'Campaign Metrics Outdated',
              message: `"${campaign.campaignName}" hasn't been updated in over a week.`,
              category: 'campaign',
              link: '/campaigns',
            });
          }
        }
      });
    },
    [addNotification]
  );

  const generateOnboardingNotifications = useCallback(
    (items: OnboardingProgressItem[], totalProgress: number) => {
      if (totalProgress < 100 && totalProgress > 0) {
        const incomplete = items.filter((i) => i.progressStatus !== 'Complete');
        const blocked = incomplete.filter((i) => i.progressStatus === 'Blocked');

        if (blocked.length > 0) {
          addNotification({
            type: 'error',
            title: 'Blocked Onboarding Items',
            message: `${blocked.length} onboarding item${blocked.length > 1 ? 's are' : ' is'} blocked and needs attention.`,
            category: 'onboarding',
            link: '/onboarding',
          });
        }

        if (totalProgress < 50 && incomplete.length > 0) {
          addNotification({
            type: 'info',
            title: 'Continue Your Onboarding',
            message: `You're ${totalProgress}% complete. Keep going!`,
            category: 'onboarding',
            link: '/onboarding',
          });
        }
      }

      if (totalProgress === 100) {
        addNotification({
          type: 'success',
          title: 'Onboarding Complete!',
          message: "Congratulations! You've completed all onboarding tasks.",
          category: 'onboarding',
          link: '/onboarding',
        });
      }
    },
    [addNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        generateToolNotifications,
        generateCampaignNotifications,
        generateOnboardingNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
