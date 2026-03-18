import { api } from './api';

export interface NotificationMetadata {
    bookingStatus?: string;
    providerAction?: 'pending' | 'accepted' | 'declined';
    paymentType?: 'cod' | 'online';
    paymentStatus?: 'pending' | 'paid' | 'failed';
    totalAmount?: number;
    addressSummary?: string;
    customer?: {
        name?: string;
        phone?: string;
        avatar?: string;
    };
    service?: {
        id?: string;
        title?: string;
        pricing?: number;
    };
    scheduled?: {
        date?: string;
        time?: string;
    };
}

export interface AppNotification {
    _id: string;
    userId: string;
    bookingId?: string;
    type: 'message' | 'payment' | 'booking_request' | 'other';
    title: string;
    body: string;
    isRead: boolean;
    metadata?: NotificationMetadata;
    createdAt: string;
    updatedAt: string;
}

export const notificationsAPI = {
    getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
        const response = await api.get('/notifications/getTheNotifications', { params });
        return response.data.data as {
            notifications: AppNotification[];
            pagination: {
                currentPage: number;
                totalPages: number;
                totalNotifications: number;
            };
        };
    },

    markAsRead: async (notificationId: string) => {
        const response = await api.put(`/notifications/markAsRead/${notificationId}`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.put('/notifications/markAllAsRead');
        return response.data;
    },

    deleteNotification: async (notificationId: string) => {
        const response = await api.delete(`/notifications/deleteNotification/${notificationId}`);
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await api.get('/notifications/getUnreadCount');
        return response.data.data as { unreadCount: number };
    },
};

export default notificationsAPI;