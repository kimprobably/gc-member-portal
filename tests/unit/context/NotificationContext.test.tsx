import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { NotificationProvider, useNotifications } from '../../../context/NotificationContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('initial state', () => {
    it('starts with empty notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });

    it('loads notifications from localStorage', () => {
      const savedNotifications = [
        {
          id: '1',
          type: 'info',
          title: 'Test',
          message: 'Test message',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'system',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedNotifications));

      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.unreadCount).toBe(1);
    });
  });

  describe('addNotification', () => {
    it('adds a new notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Test Notification',
          message: 'This is a test',
          category: 'system',
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Test Notification');
      expect(result.current.notifications[0].read).toBe(false);
      expect(result.current.unreadCount).toBe(1);
    });

    it('prevents duplicate notifications within an hour', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Duplicate',
          message: 'Same message',
          category: 'system',
        });
      });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Duplicate',
          message: 'Same message',
          category: 'system',
        });
      });

      expect(result.current.notifications).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('marks a notification as read', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Test',
          message: 'Test message',
          category: 'system',
        });
      });

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.markAsRead(notificationId);
      });

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Test 1',
          message: 'Message 1',
          category: 'system',
        });
      });

      act(() => {
        result.current.addNotification({
          type: 'warning',
          title: 'Test 2',
          message: 'Message 2',
          category: 'tool',
        });
      });

      expect(result.current.unreadCount).toBe(2);

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications.every((n) => n.read)).toBe(true);
    });
  });

  describe('clearNotification', () => {
    it('removes a specific notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'To Remove',
          message: 'This will be removed',
          category: 'system',
        });
      });

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.clearNotification(notificationId);
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('clearAll', () => {
    it('removes all notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Test 1',
          message: 'Message 1',
          category: 'system',
        });
      });

      act(() => {
        result.current.addNotification({
          type: 'warning',
          title: 'Test 2',
          message: 'Message 2',
          category: 'tool',
        });
      });

      expect(result.current.notifications).toHaveLength(2);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('generateToolNotifications', () => {
    it('generates notifications for tools with issues', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.generateToolNotifications([
          {
            id: '1',
            tool: 'Clay',
            status: 'Issues',
            accessType: 'Shared Account',
          },
        ]);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('error');
      expect(result.current.notifications[0].title).toBe('Tool Issue Detected');
    });

    it('generates notifications for tools not set up', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.generateToolNotifications([
          {
            id: '1',
            tool: 'Smartlead',
            status: 'Not Set Up',
            accessType: 'Client Account',
          },
        ]);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('warning');
      expect(result.current.notifications[0].title).toBe('Tool Setup Required');
    });
  });
});
