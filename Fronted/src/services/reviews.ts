import { api } from "./api";

export interface Review {
  _id: string;
  bookingId: {
    _id?: string;
    serviceId?: {
      _id?: string;
      title?: string;
    };
  };
  customerProfileId: {
    _id?: string;
    fullName?: string;
    profileImage?: string;
  };
  providerProfileId: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export const reviewsAPI = {
  createReview: async (data: {
    bookingId: string;
    rating: number;
    comment: string;
    images?: string[];
  }) => {
    const response = await api.post("/reviews/createReview", data);
    return response.data.data as Review;
  },

  getProviderReviews: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get("/reviews/provider/me", { params });
    return response.data.data as { reviews: Review[]; pagination: any };
  },

  getServiceReviews: async (serviceId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/reviews/service/${serviceId}`, { params });
    return response.data.data as { reviews: Review[]; pagination: any };
  },

  getReviews: async (params?: { providerId?: string; serviceId?: string; page?: number; limit?: number }) => {
    const response = await api.get("/reviews", { params });
    return response.data.data as { reviews: Review[]; pagination: any };
  },
};

export default reviewsAPI;
