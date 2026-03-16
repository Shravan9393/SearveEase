import { api } from './api';

export interface ProviderDashboardResponse {
  provider: {
    id: string;
    displayName: string;
    businessName: string;
    profileImage: string;
    verified: boolean;
    serviceCategory: string;
    location?: { city?: string; state?: string };
  };
  stats: {
    totalRevenue: number;
    revenueGrowth: number;
    totalServicesCompleted: number;
    totalCustomerProfileViews: number;
    activeBookings: number;
    pendingBookings: number;
    responseRate: number;
    completionRate: number;
    rating: number;
    reviewCount: number;
    uniqueCustomersServed: number;
  };
  revenueData: Array<{ month: string; revenue: number; bookings: number }>;
  activityData: Array<{ day: string; queries: number; bookings: number }>;
  services: Array<{
    id: string;
    service: string;
    price: string;
    bookings: number;
    customers: number;
    revenue: number;
    status: string;
    rating: number;
  }>;
  marketComparison: Array<{
    category: string;
    yourPrice: number;
    avgMarketPrice: number;
    lowestPrice: number;
    highestPrice: number;
    marketPosition: string;
  }>;
  recentQueries: Array<{
    id: string;
    customerName: string;
    customerAvatar: string;
    service: string;
    location: string;
    budget: string;
    time: string;
    message: string;
    status: 'pending' | 'accepted' | 'denied' | 'dismissed';
  }>;
}

export const providerAPI = {
  getProviderDashboard: async (): Promise<ProviderDashboardResponse> => {
    const response = await api.get('/provider-profiles/dashboard');
    return response.data.data;
  },
};

export default providerAPI;
