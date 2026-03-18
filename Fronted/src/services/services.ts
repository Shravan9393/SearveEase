import { api } from './api';

// Types matching backend model
export interface Service {
    _id: string;
    providerId: string;
    providerName: string;
    providerImage?: string;
    categoryName: string;
    categoryId: string;
    title: string;
    description: string;
    pricing: number;
    originalPrice?: number;
    images: string;
    duration: string;
    features: string[];
    distance: string;
    availability: 'available' | 'busy' | 'unavailable';
    responseTime: string;
    isOnline: boolean;
    rating: number;
    reviews: number;
    locationPolicy: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceQueryParams {
    category?: string;
    provider?: string;
    page?: number;
    limit?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
}

// Services API
export const servicesAPI = {
    // Get all services
    getServices: async (params?: ServiceQueryParams) => {
        const response = await api.get('/services', { params });
        return response.data.data;
    },


    // Get authenticated provider services
    getMyServices: async () => {
        const response = await api.get('/services/me');
        return response.data.data;
    },

    // Get service by ID
    getServiceById: async (serviceId: string) => {
        const response = await api.get(`/services/${serviceId}`);
        return response.data.data;
    },

    // Create service (provider only)
    createService: async (data: {
        title: string;
        description: string;
        pricing: number;
        categoryId: string;
        locationPolicy: string;
        images?: File;
    }) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('pricing', data.pricing.toString());
        formData.append('categoryId', data.categoryId);
        formData.append('locationPolicy', data.locationPolicy);
        
        if (data.images) {
            formData.append('images', data.images);
        }

        const response = await api.post('/services', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    // Update service (provider only)
    updateService: async (serviceId: string, data: Partial<{
        title: string;
        description: string;
        pricing: number;
        categoryId: string;
        locationPolicy: string;
        images: File;
        isActive: boolean;
    }>) => {
        const formData = new FormData();
        
        if (data.title) formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.pricing !== undefined) formData.append('pricing', data.pricing.toString());
        if (data.categoryId) formData.append('categoryId', data.categoryId);
        if (data.locationPolicy) formData.append('locationPolicy', data.locationPolicy);
        if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
        if (data.images) formData.append('images', data.images);

        const response = await api.put(`/services/${serviceId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    // Delete service (provider only)
    deleteService: async (serviceId: string) => {
        const response = await api.delete(`/services/${serviceId}`);
        return response.data.data;
    },
};

export default servicesAPI;