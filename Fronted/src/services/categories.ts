import { api } from './api';

// Types matching backend model
export interface Category {
    _id: string;
    name: string;
    description?: string;
    icon?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Categories API
export const categoriesAPI = {
    // Get all categories
    getCategories: async () => {
        const response = await api.get('/categories');
        return response.data.data;
    },

    // Get category by ID
    getCategoryById: async (categoryId: string) => {
        const response = await api.get(`/categories/${categoryId}`);
        return response.data.data;
    },

    // Create category (admin only)
    createCategory: async (data: { name: string; description?: string; icon?: string }) => {
        const response = await api.post('/categories', data);
        return response.data.data;
    },

    // Update category (admin only)
    updateCategory: async (categoryId: string, data: { name?: string; description?: string; icon?: string }) => {
        const response = await api.put(`/categories/${categoryId}`, data);
        return response.data.data;
    },

    // Delete category (admin only)
    deleteCategory: async (categoryId: string) => {
        const response = await api.delete(`/categories/${categoryId}`);
        return response.data.data;
    },
};

export default categoriesAPI;
