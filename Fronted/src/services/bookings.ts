import { api } from './api';

// Types matching backend model
export interface Booking {
    _id: string;
    customerProfileId: string;
    providerProfileId: string;
    availabilityId: string;
    serviceId: string;
    scheduled: {
        date: string;
        time: string;
    };
    address: {
        street?: string;
        city: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    priceSnapshot: {
        totalAmount: number;
    };
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
    notes?: string;
}

// Bookings API
export const bookingsAPI = {
    // Create booking
    createBooking: async (data: CreateBookingData) => {
        const response = await api.post('/bookings', data);
        return response.data.data;
    },

    // Get all bookings (for current user)
    getBookings: async (params?: { status?: string; page?: number; limit?: number }) => {
        const response = await api.get('/bookings', { params });
        return response.data.data;
    },

    // Get booking by ID
    getBookingById: async (bookingId: string) => {
        const response = await api.get(`/bookings/${bookingId}`);
        return response.data.data;
    },

    // Update booking status
    updateBookingStatus: async (bookingId: string, status: string) => {
        const response = await api.put(`/bookings/${bookingId}`, { status });
        return response.data.data;
    },

    // Cancel booking
    cancelBooking: async (bookingId: string) => {
        const response = await api.delete(`/bookings/${bookingId}`);
        return response.data.data;
    },
};

export default bookingsAPI;
