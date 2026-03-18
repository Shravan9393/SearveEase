import { api } from './api';

export interface BookingAddress {
    type?: 'home' | 'work' | 'other';
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    instructions?: string;
    street?: string;
    zipCode?: string;
    country?: string;
}

export interface Booking {
    _id: string;
    customerProfileId: string | { fullName?: string; phone?: string; profileImage?: string };
    providerProfileId: string | { displayName?: string; phone?: string };
    serviceId: string | { title?: string; pricing?: number };
    scheduled: {
        date: string;
        time: string;
    };
    address: BookingAddress;
    priceSnapshot: {
        totalAmount: number;
    };
    paymentType: 'cod' | 'online';
    paymentStatus: 'pending' | 'paid' | 'failed';
    status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookingData {
    providerProfileId: string;
    serviceId: string;
    date: string;
    time: string;
    totalAmount: number;
    address: BookingAddress;
    paymentType: 'cod' | 'online';
    notes?: string;
}

export const bookingsAPI = {
    createBooking: async (data: CreateBookingData) => {
        const response = await api.post('/bookings', data);
        return response.data.data;
    },

    getBookings: async (params?: { status?: string; page?: number; limit?: number }) => {
        const response = await api.get('/bookings', { params });
        return response.data.data;
    },

    getBookingById: async (bookingId: string) => {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data.data;
    },

    updateBookingStatus: async (bookingId: string, status: string) => {
        const response = await api.put(`/bookings/${bookingId}`, { status });
        return response.data.data;
    },

    cancelBooking: async (bookingId: string) => {
        const response = await api.delete(`/bookings/${bookingId}`);
        return response.data.data;
    },
};

export default bookingsAPI;
